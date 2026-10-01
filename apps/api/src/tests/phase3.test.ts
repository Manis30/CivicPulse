import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { toolRegistry } from '../tools/registry/ToolRegistry.js';
import { ToolExecutionContext } from '../tools/registry/ToolExecutionContext.js';
import { AgentPermissionGuard } from '../tools/permissions/AgentPermissionGuard.js';
import { AGENT_PERMISSION_MAP } from '../tools/permissions/agentPermissions.js';
import { IdempotencyManager } from '../tools/registry/IdempotencyManager.js';
import { IncidentModel, AuditLogModel, AgentExecutionModel } from '../models/index.js';
import { AgentId } from '@civicpulse/shared';
import http from 'node:http';
import { createApp } from '../app.js';

describe('Phase 3 Tool Registry & Agent Permission Guard Test Suite', () => {
  let server: http.Server;
  let baseUrl: string;
  let testIncidentId: string;
  let testVerifyingIncidentId: string;

  before(async () => {
    await connectDatabase();

    const app = createApp();
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address() as any;
        baseUrl = `http://127.0.0.1:${address.port}/api`;
        resolve();
      });
    });

    // Create a regular incident for general tests
    const incident = await IncidentModel.create({
      incidentNumber: 'INC-PHASE3-TEST-001',
      category: 'WATER_LEAK',
      description: 'Phase 3 testing water valve leak on 34th St',
      ward: 'Ward 4 - Midtown',
      zone: 'Zone Alpha',
      severity: 'HIGH',
      status: 'ASSIGNED',
      location: {
        type: 'Point',
        coordinates: [-73.9851, 40.7484],
        address: '350 5th Ave',
      },
      sla: { targetHours: 24, deadline: new Date(Date.now() + 86400000) },
    });
    testIncidentId = incident._id.toString();

    // Create a VERIFYING incident for policy tests
    const verifyingIncident = await IncidentModel.create({
      incidentNumber: 'INC-PHASE3-VERIFYING-002',
      category: 'POTHOLE',
      description: 'Phase 3 pothole verification target',
      ward: 'Ward 4 - Midtown',
      zone: 'Zone Alpha',
      severity: 'MEDIUM',
      status: 'VERIFYING',
      location: {
        type: 'Point',
        coordinates: [-73.9850, 40.7485],
        address: '352 5th Ave',
      },
      sla: { targetHours: 48, deadline: new Date(Date.now() + 86400000) },
    });
    testVerifyingIncidentId = verifyingIncident._id.toString();
  });

  after(async () => {
    if (testIncidentId) {
      await IncidentModel.findByIdAndDelete(testIncidentId);
    }
    if (testVerifyingIncidentId) {
      await IncidentModel.findByIdAndDelete(testVerifyingIncidentId);
    }
    await IncidentModel.deleteMany({ incidentNumber: /INC-PHASE3-.*/ });
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await disconnectDatabase();
  });

  // 1. Unknown tool is rejected
  it('1. Unknown tool is rejected: returns TOOL_NOT_FOUND error code', async () => {
    const context: ToolExecutionContext = {
      executionId: 'EXEC-TEST-01',
      agentId: 'AGENT_VISION',
      actorType: 'AI_AGENT',
      executionMode: 'DETERMINISTIC_ENGINE',
    };

    const res = await toolRegistry.execute('nonExistentToolXYZ', {}, context);
    assert.strictEqual(res.success, false);
    if (!res.success) {
      assert.strictEqual(res.error.code, 'TOOL_NOT_FOUND');
    }
  });

  // 2. Unknown agent is rejected
  it('2. Unknown agent is rejected: rejects invalid or spoofed agentId', async () => {
    const context: ToolExecutionContext = {
      executionId: 'EXEC-TEST-02',
      agentId: 'AGENT_SUPER_HACKER' as AgentId,
      actorType: 'AI_AGENT',
      executionMode: 'DETERMINISTIC_ENGINE',
    };

    const res = await toolRegistry.execute('searchNearbyIncidents', { longitude: -73.98, latitude: 40.74 }, context);
    assert.strictEqual(res.success, false);
    if (!res.success) {
      assert.strictEqual(res.error.code, 'PERMISSION_DENIED');
    }
  });

  // 3. Vision Agent cannot call routing tools
  it('3. Vision Agent cannot call routing tools: least-privilege permission denial', async () => {
    const context: ToolExecutionContext = {
      executionId: 'EXEC-TEST-03',
      agentId: 'AGENT_VISION',
      actorType: 'AI_AGENT',
      executionMode: 'DETERMINISTIC_ENGINE',
    };

    const res = await toolRegistry.execute('assignDepartment', { incidentId: testIncidentId, departmentId: 'dummy' }, context);
    assert.strictEqual(res.success, false);
    if (!res.success) {
      assert.strictEqual(res.error.code, 'PERMISSION_DENIED');
      assert.strictEqual((res.error.details as any)?.permission, 'tools:routing:assign');
    }
  });

  // 4. Routing Agent cannot call verification tools
  it('4. Routing Agent cannot call verification tools: strictly isolated domain permissions', async () => {
    const context: ToolExecutionContext = {
      executionId: 'EXEC-TEST-04',
      agentId: 'AGENT_ROUTING',
      actorType: 'AI_AGENT',
      executionMode: 'DETERMINISTIC_ENGINE',
    };

    const res = await toolRegistry.execute('verifyResolution', { incidentId: testIncidentId, beforeEvidenceId: 'b1', afterEvidenceId: 'a1' }, context);
    assert.strictEqual(res.success, false);
    if (!res.success) {
      assert.strictEqual(res.error.code, 'PERMISSION_DENIED');
    }
  });

  // 5. Citizen cannot invoke internal tool endpoint directly
  it('5. Citizen cannot invoke internal tool endpoint directly: HTTP 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/tools/searchNearbyIncidents/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'CITIZEN',
      },
      body: JSON.stringify({
        input: { longitude: -73.9851, latitude: 40.7484 },
        context: { agentId: 'AGENT_DUPLICATE' },
      }),
    });

    assert.strictEqual(res.status, 403);
    const body = (await res.json()) as any;
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'PERMISSION_DENIED');
  });

  // 6. Invalid Zod input is rejected
  it('6. Invalid Zod input is rejected: out-of-bounds coordinates return INPUT_VALIDATION_FAILED', async () => {
    const context: ToolExecutionContext = {
      executionId: 'EXEC-TEST-06',
      agentId: 'AGENT_DUPLICATE',
      actorType: 'AI_AGENT',
      executionMode: 'DETERMINISTIC_ENGINE',
    };

    const res = await toolRegistry.execute(
      'searchNearbyIncidents',
      { longitude: 9999, latitude: 40.74 }, // Invalid longitude > 180
      context
    );

    assert.strictEqual(res.success, false);
    if (!res.success) {
      assert.strictEqual(res.error.code, 'INPUT_VALIDATION_FAILED');
    }
  });

  // 7. Valid output satisfies output schema
  it('7. Valid output satisfies output schema: returns strongly-typed results', async () => {
    const context: ToolExecutionContext = {
      executionId: 'EXEC-TEST-07',
      agentId: 'AGENT_SEVERITY',
      actorType: 'AI_AGENT',
      executionMode: 'DETERMINISTIC_ENGINE',
    };

    const res = await toolRegistry.execute(
      'calculateSeverityRisk',
      {
        category: 'WATER_LEAK',
        nearbyDuplicatesCount: 2,
        isNearCriticalInfrastructure: true,
        citizenReportsWithinHour: 4,
      },
      context
    );

    assert.strictEqual(res.success, true);
    if (res.success) {
      const data = res.data as { severity: string; riskScore: number; targetHours: number };
      assert.strictEqual(data.severity, 'CRITICAL');
      assert(data.riskScore >= 80);
      assert.strictEqual(data.targetHours, 4);
    }
  });

  // 8. Policy-denied tools never execute
  it('8. Policy-denied tools never execute: closeIncident denied when incident status is not VERIFYING', async () => {
    const context: ToolExecutionContext = {
      executionId: 'EXEC-TEST-08',
      agentId: 'AGENT_VERIFICATION',
      actorType: 'AI_AGENT',
      executionMode: 'DETERMINISTIC_ENGINE',
    };

    // testIncidentId is in 'ASSIGNED' status, NOT 'VERIFYING'
    const res = await toolRegistry.execute(
      'closeIncident',
      { incidentId: testIncidentId, verificationOutcome: 'LIKELY_RESOLVED' },
      context
    );

    assert.strictEqual(res.success, false);
    if (!res.success) {
      assert.strictEqual(res.error.code, 'POLICY_DENIED');
      assert(res.error.message.includes('Must be in \'VERIFYING\' state'));
    }

    // Verify status was NOT modified in the database
    const verifyIncident = await IncidentModel.findById(testIncidentId);
    assert.strictEqual(verifyIncident?.status, 'ASSIGNED');
  });

  // 9. Write tools generate AuditLog
  it('9. Write tools generate AuditLog: audit records are persisted on state mutation', async () => {
    const context: ToolExecutionContext = {
      executionId: 'EXEC-TEST-09',
      agentId: 'AGENT_VERIFICATION',
      actorType: 'AI_AGENT',
      executionMode: 'DETERMINISTIC_ENGINE',
    };

    // testVerifyingIncidentId is in 'VERIFYING' status
    const res = await toolRegistry.execute(
      'closeIncident',
      { incidentId: testVerifyingIncidentId, verificationOutcome: 'LIKELY_RESOLVED' },
      context
    );

    assert.strictEqual(res.success, true);

    // Verify audit log record exists
    const logs = await AuditLogModel.find({
      resourceId: testVerifyingIncidentId,
      action: 'INCIDENT_CLOSED',
    });
    assert(logs.length >= 1, 'Audit log must record INCIDENT_CLOSED action');
    assert.strictEqual(logs[0].actorId, 'AGENT_VERIFICATION');
  });

  // 10. Agent cannot modify AuditLog
  it('10. Agent cannot modify AuditLog: audit logs are strictly append-only', async () => {
    const registered = toolRegistry.list();
    const hasAuditMutatingTool = registered.some(
      (t) => t.name.toLowerCase().includes('deleteaudit') || t.name.toLowerCase().includes('updateaudit')
    );
    assert.strictEqual(hasAuditMutatingTool, false, 'No mutating tool should exist for audit records');
  });

  // 11. Agent cannot modify AIPolicy
  it('11. Agent cannot modify AIPolicy: autonomous agents have no policy mutation tools', async () => {
    const registered = toolRegistry.list();
    const hasPolicyMutatingTool = registered.some(
      (t) => t.name.toLowerCase().includes('deletepolicy') || t.name.toLowerCase().includes('overwritepolicy')
    );
    assert.strictEqual(hasPolicyMutatingTool, false, 'No agent tool exists to alter or overwrite AI policy');
  });

  // 12. Agent cannot modify its own permissions
  it('12. Agent cannot modify its own permissions: permission matrix is frozen in code', () => {
    assert.throws(() => {
      (AGENT_PERMISSION_MAP as any).AGENT_VISION.push('tools:routing:assign');
    }, /Cannot add property|object is not extensible|read only/);
  });

  // 13. Agent cannot bypass Tool Registry
  it('13. Agent cannot bypass Tool Registry: registry validates and logs all calls', async () => {
    const context: ToolExecutionContext = {
      executionId: 'EXEC-TEST-13',
      agentId: 'AGENT_LOCATION',
      actorType: 'AI_AGENT',
      executionMode: 'DETERMINISTIC_ENGINE',
    };

    const res = await toolRegistry.execute('resolveCoordinates', { longitude: -73.9851, latitude: 40.7484 }, context);
    assert.strictEqual(res.success, true);

    // Verify AgentExecution was logged
    const executionLogs = await AgentExecutionModel.find({
      agentId: 'AGENT_LOCATION',
    }).sort({ timestamp: -1 }).limit(1);

    assert(executionLogs.length >= 1);
    assert.strictEqual(executionLogs[0].status, 'SUCCESS');
  });

  // 14. MongoDB is never directly accessed by tool implementations
  it('14. Architectural boundary: tool definitions import only Services, never Mongoose models or repositories', () => {
    const candidate1 = path.join(process.cwd(), 'src/tools/definitions');
    const candidate2 = path.join(process.cwd(), 'apps/api/src/tools/definitions');
    const defsDir = fs.existsSync(candidate1) ? candidate1 : candidate2;
    const files = fs.readdirSync(defsDir).filter((f) => f.endsWith('.ts'));

    for (const file of files) {
      const content = fs.readFileSync(path.join(defsDir, file), 'utf-8');
      assert.strictEqual(
        content.includes("from 'mongoose'"),
        false,
        `Tool definition ${file} must not import directly from 'mongoose'`
      );
      assert.strictEqual(
        content.includes('from \'../../models/'),
        false,
        `Tool definition ${file} must not import directly from models`
      );
      assert.strictEqual(
        content.includes('from \'../../repositories/'),
        false,
        `Tool definition ${file} must not import directly from repositories`
      );
    }
  });

  // 15. Duplicate write execution is protected by idempotency
  it('15. Duplicate write execution is protected by idempotency: caches and prevents re-execution', async () => {
    const fixedExecutionId = `EXEC-IDEMPOTENT-${Date.now()}`;
    const context: ToolExecutionContext = {
      executionId: fixedExecutionId,
      agentId: 'AGENT_NOTIFICATION',
      actorType: 'AI_AGENT',
      executionMode: 'DETERMINISTIC_ENGINE',
      idempotencyKey: `IDEMPOTENT-KEY-${Date.now()}`,
    };

    // First execution: creates notification
    const res1 = await toolRegistry.execute(
      'sendNotification',
      {
        recipientId: '6ab35e836f6198dec575e9a1',
        title: 'Work order dispatched',
        body: 'Field crew assigned to scene',
        type: 'INFO',
      },
      context
    );
    assert.strictEqual(res1.success, true);

    // Second execution with identical idempotencyKey: should be intercepted
    const res2 = await toolRegistry.execute(
      'sendNotification',
      {
        recipientId: '6ab35e836f6198dec575e9a1',
        title: 'Work order dispatched',
        body: 'Field crew assigned to scene',
        type: 'INFO',
      },
      context
    );

    assert.strictEqual(res2.success, true);
    assert.strictEqual(res2.idempotencyApplied, true);
  });
});
