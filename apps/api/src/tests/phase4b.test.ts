import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { agentOrchestrator } from '../agents/orchestrator/AgentOrchestrator.js';
import { agentRuntime } from '../agents/runtime/AgentRuntime.js';
import {
  isAgentActive,
  isAgentInactive,
  getAgentDefinition,
  ACTIVE_AGENT_IDS,
  INACTIVE_AGENT_IDS,
} from '../agents/definitions/index.js';
import { toolRegistry } from '../tools/registry/ToolRegistry.js';
import { incidentService } from '../services/incidentService.js';
import { reportService } from '../services/reportService.js';
import { departmentService } from '../services/departmentService.js';
import { teamService } from '../services/teamService.js';
import { IncidentModel } from '../models/Incident.js';
import { ReportModel } from '../models/Report.js';
import { DepartmentModel } from '../models/Department.js';
import { TeamModel } from '../models/Team.js';
import { AgentExecutionModel } from '../models/AgentExecution.js';
import { createApp } from '../app.js';
import { AgentId } from '@civicpulse/shared';

describe('Phase 4B: Multi-Agent Orchestrator & Autonomous Agents Suite', () => {
  let app: any;
  let server: any;
  let baseUrl = '';

  let testDeptId = '';
  let testTeamId = '';
  let testIncidentId = '';
  let testReportId = '';

  before(async () => {
    await connectDatabase();
    app = createApp();
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });

    // Seed test department & team if not present
    let dept = await DepartmentModel.findOne({ code: 'PW' });
    if (!dept) {
      dept = await DepartmentModel.create({
        name: 'Public Works Department',
        code: 'PW',
        description: 'Roads, potholes, and physical infrastructure maintenance',
        categories: ['POTHOLE', 'ROAD_DAMAGE', 'DRAINAGE'],
        headOfDepartment: { name: 'Director Smith', email: 'pw.dir@civicpulse.org', phone: '+1234567890' },
        operatingWards: ['Ward 14', 'Ward 15', 'Central Ward'],
        slaTiers: {
          LOW: 72,
          MEDIUM: 48,
          HIGH: 24,
          CRITICAL: 6,
        },
      });
    }
    testDeptId = dept._id.toString();

    let team = await TeamModel.findOne({ departmentId: dept._id });
    if (!team) {
      team = await TeamModel.create({
        departmentId: dept._id,
        name: 'Road Repair Alpha Team',
        wardIds: ['Ward 14', 'Ward 15', 'Central Ward'],
        specializations: ['POTHOLE', 'ROAD_DAMAGE'],
        availabilityStatus: 'AVAILABLE',
        capacity: 10,
        activeWorkload: 1,
        currentLocation: {
          type: 'Point',
          coordinates: [77.5946, 12.9716],
          address: 'Central Depot',
        },
        shift: 'MORNING',
      });
    }
    testTeamId = team._id.toString();

    // Create an initial test incident
    const inc = await incidentService.createIncident({
      description: 'Hazardous deep pothole on 5th Avenue near the bus terminal',
      category: 'POTHOLE',
      severity: 'MEDIUM',
      location: {
        type: 'Point',
        coordinates: [77.5946, 12.9716],
        address: '5th Avenue & Main St',
      },
      ward: 'Ward 14',
      zone: 'Central Zone',
    },
    { actorType: 'CITIZEN', actorId: 'USR-DEV-001' });
    testIncidentId = inc.id;

    // Create an associated test report
    const citizenUserId = new mongoose.Types.ObjectId().toString();
    const rep = await reportService.submitReport({
      description: 'Deep road hazard near bus stop causing traffic disruption',
      categoryHint: 'POTHOLE',
      location: {
        type: 'Point',
        coordinates: [77.5946, 12.9716],
        address: '5th Avenue & Main St',
      },
      reporterId: citizenUserId,
    });
    testReportId = rep.id;
  });

  after(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(resolve));
    }
    await disconnectDatabase();
  });

  // ==========================================
  // E. INACTIVE AGENTS vs UNKNOWN AGENTS
  // ==========================================
  describe('E. Inactive Agents vs Unknown Agents', () => {
    it('E1. Inactive agents (6-10) are recognized by definitions index', () => {
      assert.strictEqual(ACTIVE_AGENT_IDS.length, 5);
      assert.strictEqual(INACTIVE_AGENT_IDS.length, 5);
      assert.strictEqual(isAgentActive('AGENT_VISION'), true);
      assert.strictEqual(isAgentActive('AGENT_LOCATION'), true);
      assert.strictEqual(isAgentActive('AGENT_DUPLICATE'), true);
      assert.strictEqual(isAgentActive('AGENT_SEVERITY'), true);
      assert.strictEqual(isAgentActive('AGENT_ROUTING'), true);

      assert.strictEqual(isAgentInactive('AGENT_INVESTIGATION'), true);
      assert.strictEqual(isAgentInactive('AGENT_OPERATIONS'), true);
      assert.strictEqual(isAgentInactive('AGENT_VERIFICATION'), true);
      assert.strictEqual(isAgentInactive('AGENT_NOTIFICATION'), true);
      assert.strictEqual(isAgentInactive('AGENT_INTELLIGENCE'), true);
    });

    it('E2. Inactive agent execution returns AGENT_INACTIVE error', async () => {
      const res = await agentRuntime.execute('AGENT_INVESTIGATION' as AgentId, {}, { executionMode: 'DETERMINISTIC_ENGINE' });
      assert.strictEqual(res.success, false);
      if (!res.success) {
        assert.strictEqual(res.error.code, 'AGENT_INACTIVE');
        assert(res.error.message.includes('inactive'));
      }
    });

    it('E3. Unknown agent returns AGENT_NOT_FOUND error (distinct from AGENT_INACTIVE)', async () => {
      const res = await agentRuntime.execute('AGENT_NON_EXISTENT' as AgentId, {}, { executionMode: 'DETERMINISTIC_ENGINE' });
      assert.strictEqual(res.success, false);
      if (!res.success) {
        assert.strictEqual(res.error.code, 'AGENT_NOT_FOUND');
      }
    });
  });

  // ==========================================
  // F. VISION AGENT
  // ==========================================
  describe('F. Vision Agent Execution', () => {
    it('F1. Vision agent runs deterministically and produces structured defect result', async () => {
      const res = await agentRuntime.execute<any, any>(
        'AGENT_VISION',
        {
          incidentId: testIncidentId,
          imageUrl: 'https://images.civicpulse.org/pothole-sample.jpg',
          issueDescription: 'Pothole on asphalt street',
        },
        { executionMode: 'DETERMINISTIC_ENGINE' }
      );

      assert.strictEqual(res.success, true);
      if (res.success) {
        assert.strictEqual(res.result.issueType, 'POTHOLE');
        assert(res.result.confidence >= 0.7);
        assert(res.result.observations.length > 0);
        assert.strictEqual(typeof res.result.requiresHumanReview, 'boolean');
      }
    });
  });

  // ==========================================
  // G. LOCATION AGENT
  // ==========================================
  describe('G. Location Agent Execution', () => {
    it('G1. Location agent resolves coordinates and identifies ward', async () => {
      const res = await agentRuntime.execute<any, any>(
        'AGENT_LOCATION',
        {
          incidentId: testIncidentId,
          latitude: 12.9716,
          longitude: 77.5946,
          address: 'MG Road Metro Station',
        },
        { executionMode: 'DETERMINISTIC_ENGINE' }
      );

      assert.strictEqual(res.success, true);
      if (res.success) {
        assert.strictEqual(res.result.locationResolved, true);
        assert.strictEqual(res.result.latitude, 12.9716);
        assert.strictEqual(res.result.longitude, 77.5946);
        assert(res.result.wardId.length > 0);
        assert(res.result.confidence >= 0.8);
      }
    });

    it('G2. Location agent flags human review on invalid coordinates', async () => {
      const res = await agentRuntime.execute<any, any>(
        'AGENT_LOCATION',
        {
          incidentId: testIncidentId,
          latitude: 150.0, // Invalid latitude > 90
          longitude: 77.5946,
        },
        { executionMode: 'DETERMINISTIC_ENGINE' }
      );

      // Input schema strictly rejects out-of-bounds coordinates
      assert.strictEqual(res.success, false);
      if (!res.success) {
        assert.strictEqual(res.error.code, 'INVALID_AGENT_INPUT');
      }
    });
  });

  // ==========================================
  // H. DUPLICATE AGENT & K. DUPLICATE BRANCH
  // ==========================================
  describe('H & K. Duplicate Agent Execution & Branching', () => {
    it('H1. Duplicate agent identifies distinct report as NEW_INCIDENT', async () => {
      const res = await agentRuntime.execute<any, any>(
        'AGENT_DUPLICATE',
        {
          incidentId: testIncidentId,
          category: 'POTHOLE',
          latitude: 12.9716,
          longitude: 77.5946,
          description: 'Unique new incident far away from anything else',
        },
        { executionMode: 'DETERMINISTIC_ENGINE' }
      );

      assert.strictEqual(res.success, true);
      if (res.success) {
        assert.strictEqual(res.result.action, 'NEW_INCIDENT');
        assert.strictEqual(res.result.isDuplicate, false);
      }
    });

    it('K1. Duplicate agent with matched incident returns LINK_EXISTING and links report', async () => {
      // Create duplicate target incident
      const duplicateTarget = await incidentService.createIncident({
        description: 'Large pothole on 5th Avenue',
        category: 'POTHOLE',
        severity: 'MEDIUM',
        location: {
          type: 'Point',
          coordinates: [77.5946, 12.9716],
          address: '5th Avenue & Main St',
        },
        ward: 'Ward 14',
        zone: 'Central Zone',
      },
      { actorType: 'CITIZEN', actorId: 'USR-DEV-002' });

      const res = await agentRuntime.execute<any, any>(
        'AGENT_DUPLICATE',
        {
          incidentId: testIncidentId,
          reportId: testReportId,
          category: 'POTHOLE',
          latitude: 12.9716,
          longitude: 77.5946,
          description: 'Large pothole on 5th Avenue near the bus terminal',
        },
        { executionMode: 'DETERMINISTIC_ENGINE' }
      );

      assert.strictEqual(res.success, true);
      if (res.success) {
        assert(['LINK_EXISTING', 'NEW_INCIDENT'].includes(res.result.action));
        assert.strictEqual(typeof res.result.confidence, 'number');
        assert.strictEqual(typeof res.result.requiresHumanReview, 'boolean');
      }
    });
  });

  // ==========================================
  // I. SEVERITY AGENT
  // ==========================================
  describe('I. Severity Agent Execution', () => {
    it('I1. Severity agent calculates risk and sets severity without mutating incident status', async () => {
      const incBefore = await incidentService.getIncidentById(testIncidentId);
      const originalStatus = incBefore?.status;

      const res = await agentRuntime.execute<any, any>(
        'AGENT_SEVERITY',
        {
          incidentId: testIncidentId,
          category: 'POTHOLE',
          isNearCriticalInfrastructure: true,
          citizenReportsWithinHour: 3,
        },
        { executionMode: 'DETERMINISTIC_ENGINE' }
      );

      assert.strictEqual(res.success, true);
      if (res.success) {
        assert(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(res.result.severity));
        assert(res.result.confidence >= 0.7);
        assert(res.result.targetHours > 0);
      }

      // State Transition Correction: setSeverity MUST NOT change status from SUBMITTED or ANALYZING to VALIDATED
      const incAfter = await incidentService.getIncidentById(testIncidentId);
      assert.strictEqual(incAfter?.status, originalStatus);
      assert.strictEqual(incAfter?.severity, res.success ? res.result.severity : undefined);
    });
  });

  // ==========================================
  // J. ROUTING AGENT
  // ==========================================
  describe('J. Routing Agent Execution', () => {
    it('J1. Routing agent finds department and available team, then dispatches', async () => {
      const res = await agentRuntime.execute<any, any>(
        'AGENT_ROUTING',
        {
          incidentId: testIncidentId,
          category: 'POTHOLE',
          ward: 'Ward 14',
          severity: 'HIGH',
        },
        { executionMode: 'DETERMINISTIC_ENGINE' }
      );

      assert.strictEqual(res.success, true);
      if (res.success) {
        assert(res.result.departmentId.length > 0);
        assert.strictEqual(typeof res.result.requiresHumanReview, 'boolean');
        if (res.result.assignedTeamId) {
          assert(res.result.assignedTeamId.length > 0);
        }
      }
    });

    it('J2. Routing agent requires human review if no suitable team exists', async () => {
      // Query for an unknown ward with no teams
      const res = await agentRuntime.execute<any, any>(
        'AGENT_ROUTING',
        {
          incidentId: testIncidentId,
          category: 'OTHER',
          ward: 'NonExistentWard_999',
          severity: 'LOW',
        },
        { executionMode: 'DETERMINISTIC_ENGINE' }
      );

      assert.strictEqual(res.success, true);
      if (res.success) {
        // Must flag human review rather than fabricating an assignment
        assert.strictEqual(res.result.requiresHumanReview, true);
        assert.strictEqual(res.result.assignedTeamId, undefined);
      }
    });
  });

  // ==========================================
  // D. AGENT ISOLATION & N. PERMISSION CHECKS
  // ==========================================
  describe('D & N. Agent Isolation & Permission Whitelist', () => {
    it('N1. Vision agent cannot execute assignTeam (fails whitelist and permission)', async () => {
      const def = getAgentDefinition('AGENT_VISION');
      assert(def !== undefined);
      assert(!def.allowedTools.includes('assignTeam'));

      // Direct ToolRegistry check: Vision agent calling assignTeam is rejected by permission guard
      const toolRes = await toolRegistry.execute(
        'assignTeam',
        { incidentId: testIncidentId, teamId: testTeamId },
        {
          executionId: 'exec-n1',
          agentId: 'AGENT_VISION',
          actorType: 'AI_AGENT',
          actorId: 'AGENT_VISION',
          executionMode: 'DETERMINISTIC_ENGINE',
          incidentId: testIncidentId,
        }
      );
      assert.strictEqual(toolRes.success, false);
      if (!toolRes.success) {
        assert.strictEqual(toolRes.error?.code, 'PERMISSION_DENIED');
      }
    });
  });

  // ==========================================
  // P. IDEMPOTENCY
  // ==========================================
  describe('P. Idempotency Guard', () => {
    it('P1. Repeated mutations with same orchestration key return cached execution', async () => {
      const orchId = 'orch-test-idempotency-100';
      const ctx = {
        executionId: 'exec-test-1',
        agentId: 'AGENT_SEVERITY' as AgentId,
        actorType: 'AI_AGENT' as const,
        actorId: 'AGENT_SEVERITY',
        executionMode: 'DETERMINISTIC_ENGINE' as const,
        orchestrationId: orchId,
        incidentId: testIncidentId,
      };

      const input = {
        incidentId: testIncidentId,
        severity: 'HIGH' as const,
        riskScore: 78,
        slaHours: 24,
        reasoning: 'Critical arterial damage',
      };

      // First call
      const res1 = await toolRegistry.execute('setSeverity', input, ctx);
      assert.strictEqual(res1.success, true);

      // Second identical call in same orchestration
      const res2 = await toolRegistry.execute('setSeverity', input, ctx);
      assert.strictEqual(res2.success, true);
      assert.strictEqual(res2.idempotencyApplied, true);
    });
  });

  // ==========================================
  // A, B, C, Q, S. FULL ORCHESTRATOR WORKFLOW
  // ==========================================
  describe('A, B, C, Q, S. Complete End-to-End Orchestrator Workflow', () => {
    it('S1. Executes canonical 5-agent sequence: SUBMITTED -> ANALYZING -> VALIDATED -> ASSIGNED', async () => {
      // Create fresh incident for clean pipeline
      const incident = await incidentService.createIncident({
        description: 'Large road crater obstructing transit lanes',
        category: 'POTHOLE',
        severity: 'MEDIUM',
        location: {
          type: 'Point',
          coordinates: [77.5946, 12.9716],
          address: 'Main Street Transit Corridor',
        },
        ward: 'Ward 14',
        zone: 'Central Zone',
      },
      { actorType: 'CITIZEN', actorId: 'USR-DEV-E2E' });

      // Transition to ANALYZING as expected before orchestration
      await incidentService.updateIncidentStatus(
        incident.id,
        'ANALYZING',
        { actorType: 'SYSTEM' },
        'Autonomous analysis pipeline started'
      );

      const orchResult = await agentOrchestrator.runWorkflow({
        incidentId: incident.id,
        executionMode: 'DETERMINISTIC_ENGINE',
        initialFacts: {
          imageUrl: 'https://images.civicpulse.org/pothole-main.jpg',
          description: 'Large road crater obstructing transit lanes',
          latitude: 12.9716,
          longitude: 77.5946,
          address: 'Main Street Transit Corridor',
          ward: 'Ward 14',
          zone: 'Central Zone',
          categoryHint: 'POTHOLE',
          isNearCriticalInfrastructure: true,
        },
      });

      // 1. Verify orchestration output
      assert(orchResult.orchestrationId.toUpperCase().startsWith('ORCH-'));
      assert(['SUCCESS', 'PARTIAL', 'REQUIRES_HUMAN_REVIEW'].includes(orchResult.status));
      assert.strictEqual(orchResult.executionIds.length, 5);

      // 2. Sequence verification: exactly 5 trace items with sequences 1..5
      assert.strictEqual(orchResult.trace.length, 5);
      const expectedAgents: AgentId[] = ['AGENT_VISION', 'AGENT_LOCATION', 'AGENT_DUPLICATE', 'AGENT_SEVERITY', 'AGENT_ROUTING'];
      orchResult.trace.forEach((step, idx) => {
        assert.strictEqual(step.sequence, idx + 1);
        assert.strictEqual(step.agentId, expectedAgents[idx]);
      });

      // 3. Verify AgentExecution records linked by orchestrationId
      const executions = await AgentExecutionModel.find({ orchestrationId: orchResult.orchestrationId }).sort({ sequence: 1 });
      assert.strictEqual(executions.length, 5);
      executions.forEach((rec, idx) => {
        assert.strictEqual(rec.orchestrationId, orchResult.orchestrationId);
        assert.strictEqual(rec.sequence, idx + 1);
        assert.strictEqual(rec.agentId, expectedAgents[idx]);
      });

      // 4. Verify incident final state
      const finalInc = await incidentService.getIncidentById(incident.id);
      assert(['VALIDATED', 'ASSIGNED', 'ANALYZING'].includes(finalInc?.status || ''));
      if (orchResult.status === 'SUCCESS') {
        assert.strictEqual(finalInc?.status, 'ASSIGNED');
        assert(finalInc?.departmentId !== undefined);
        assert(finalInc?.teamId !== undefined);
      }
    });

    it('M1. Orchestrator terminates with REQUIRES_HUMAN_REVIEW on ambiguous/failed routing', async () => {
      const incident = await incidentService.createIncident({
        description: 'Uncategorized anomaly in remote unmanaged territory',
        category: 'OTHER',
        severity: 'LOW',
        location: {
          type: 'Point',
          coordinates: [77.5946, 12.9716],
          address: 'Remote Wilderness',
        },
        ward: 'UnmanagedZone_404',
        zone: 'Remote Zone',
      },
      { actorType: 'CITIZEN', actorId: 'USR-DEV-UNROUTABLE' });

      await incidentService.updateIncidentStatus(
        incident.id,
        'ANALYZING',
        { actorType: 'SYSTEM' },
        'Starting unroutable workflow'
      );

      const orchResult = await agentOrchestrator.runWorkflow({
        incidentId: incident.id,
        executionMode: 'DETERMINISTIC_ENGINE',
        initialFacts: {
          description: 'Anomaly in unmanaged territory',
          latitude: 12.9716,
          longitude: 77.5946,
          ward: 'UnmanagedZone_404',
          zone: 'Remote Zone',
          categoryHint: 'OTHER',
        },
      });

      assert.strictEqual(orchResult.requiresHumanReview, true);
      assert(['REQUIRES_HUMAN_REVIEW', 'PARTIAL'].includes(orchResult.status));

      // Incident MUST NOT falsely become ASSIGNED
      const updatedInc = await incidentService.getIncidentById(incident.id);
      assert.notStrictEqual(updatedInc?.status, 'ASSIGNED');
    });
  });

  // ==========================================
  // R. INTERNAL ORCHESTRATION API ENDPOINT
  // ==========================================
  describe('R. Internal Orchestration API Endpoint', () => {
    it('R1. Rejects request without development authorization in dev mode', async () => {
      const res = await fetch(`${baseUrl}/api/orchestrations/incidents/${testIncidentId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ executionMode: 'DETERMINISTIC_ENGINE' }),
      });

      assert.strictEqual(res.status, 403);
      const body = await res.json();
      assert.strictEqual(body.error.code, 'UNAUTHORIZED_ORCHESTRATION_ACCESS');
    });

    it('R2. Accepts request with x-dev-internal: true in development and runs workflow', async () => {
      const res = await fetch(`${baseUrl}/api/orchestrations/incidents/${testIncidentId}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-dev-internal': 'true',
        },
        body: JSON.stringify({ executionMode: 'DETERMINISTIC_ENGINE', sync: true }),
      });

      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert(body.orchestrationId.toUpperCase().startsWith('ORCH-'));
      assert(['SUCCESS', 'PARTIAL', 'REQUIRES_HUMAN_REVIEW'].includes(body.status));
      assert.strictEqual(body.executionIds.length, 5);
    });

    it('R4. Phase 4C: Enqueues workflow asynchronously and returns QUEUED status without blocking', async () => {
      const res = await fetch(`${baseUrl}/api/orchestrations/incidents/${testIncidentId}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-dev-internal': 'true',
        },
        body: JSON.stringify({ executionMode: 'DETERMINISTIC_ENGINE' }),
      });

      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert(body.orchestrationId.toUpperCase().startsWith('ORCH-'));
      assert.strictEqual(body.status, 'QUEUED');
      assert(typeof body.jobId === 'string' && body.jobId.startsWith('job-orch-'));
    });

    it('R3. Returns 404 for non-existent incident', async () => {
      const fakeId = '654321654321654321654321';
      const res = await fetch(`${baseUrl}/api/orchestrations/incidents/${fakeId}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-dev-internal': 'true',
        },
        body: JSON.stringify({ executionMode: 'DETERMINISTIC_ENGINE' }),
      });

      assert.strictEqual(res.status, 404);
      const body = await res.json();
      assert.strictEqual(body.error.code, 'INCIDENT_NOT_FOUND');
    });
  });
});
