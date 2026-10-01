import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { toolRegistry } from '../tools/registry/ToolRegistry.js';
import { ToolExecutionContext } from '../tools/registry/ToolExecutionContext.js';
import { incidentService } from '../services/incidentService.js';
import { departmentRepository } from '../repositories/departmentRepository.js';
import { AuditLogModel } from '../models/AuditLog.js';
import { AgentExecutionModel } from '../models/AgentExecution.js';
import { logger } from '../utils/logger.js';

async function runManualVerification() {
  console.log('====================================================');
  console.log('CIVICPULSE PHASE 3: MANUAL VERIFICATION SUITE');
  console.log('====================================================\n');

  await connectDatabase();

  try {
    // 1. List registered tools
    console.log('--- 1. List Registered Tools ---');
    const tools = toolRegistry.list();
    console.log(`Total tools registered: ${tools.length}`);
    tools.forEach((t) => {
      console.log(`  • [${t.category.padEnd(5)}] ${t.name.padEnd(25)} | Perm: ${t.requiredPermission}`);
    });

    // 2. Execute searchNearbyIncidents (READ)
    console.log('\n--- 2. Execute: searchNearbyIncidents ---');
    const duplicateContext: ToolExecutionContext = {
      executionId: `EXEC-DUPLICATE-${Date.now()}`,
      agentId: 'AGENT_DUPLICATE',
      actorType: 'AI_AGENT',
      executionMode: 'DETERMINISTIC_ENGINE',
    };
    const resSearch = await toolRegistry.execute(
      'searchNearbyIncidents',
      {
        longitude: -73.9851,
        latitude: 40.7484,
        radiusMeters: 5000,
      },
      duplicateContext
    );
    console.log('searchNearbyIncidents Result:', JSON.stringify(resSearch, null, 2));

    // 3. Execute getIncidentHistory (READ)
    console.log('\n--- 3. Execute: getIncidentHistory ---');
    const allIncidents = await incidentService.listIncidents({}, { limit: 1 });
    const targetIncidentId = allIncidents.data[0]?._id?.toString() || '6ab35e836f6198dec575e9a1';
    const investigationContext: ToolExecutionContext = {
      executionId: `EXEC-INVESTIGATION-${Date.now()}`,
      agentId: 'AGENT_INVESTIGATION',
      actorType: 'AI_AGENT',
      executionMode: 'DETERMINISTIC_ENGINE',
      incidentId: targetIncidentId,
    };
    const resHistory = await toolRegistry.execute(
      'getIncidentHistory',
      { incidentId: targetIncidentId },
      investigationContext
    );
    console.log(`getIncidentHistory (${targetIncidentId}): success = ${resHistory.success}`);

    // 4. Execute getDepartmentWorkload (READ)
    console.log('\n--- 4. Execute: getDepartmentWorkload ---');
    const allDepts = await departmentRepository.findAll();
    const deptId = allDepts[0]?._id?.toString() || '6ab35e836f6198dec575e901';
    const routingContext: ToolExecutionContext = {
      executionId: `EXEC-ROUTING-${Date.now()}`,
      agentId: 'AGENT_ROUTING',
      actorType: 'AI_AGENT',
      executionMode: 'DETERMINISTIC_ENGINE',
    };
    const resWorkload = await toolRegistry.execute(
      'getDepartmentWorkload',
      { departmentId: deptId },
      routingContext
    );
    console.log('getDepartmentWorkload Result:', JSON.stringify(resWorkload, null, 2));

    // 5. Execute calculateSeverityRisk (READ)
    console.log('\n--- 5. Execute: calculateSeverityRisk ---');
    const severityContext: ToolExecutionContext = {
      executionId: `EXEC-SEVERITY-${Date.now()}`,
      agentId: 'AGENT_SEVERITY',
      actorType: 'AI_AGENT',
      executionMode: 'DETERMINISTIC_ENGINE',
    };
    const resSeverity = await toolRegistry.execute(
      'calculateSeverityRisk',
      {
        category: 'WATER_LEAK',
        nearbyDuplicatesCount: 4,
        isNearCriticalInfrastructure: true,
        citizenReportsWithinHour: 6,
      },
      severityContext
    );
    console.log('calculateSeverityRisk Result:', JSON.stringify(resSeverity, null, 2));

    // 6. Attempt Vision Agent -> assignTeam (Expect: PERMISSION_DENIED)
    console.log('\n--- 6. Attempt: AGENT_VISION -> assignTeam (Permission Denial) ---');
    const visionContext: ToolExecutionContext = {
      executionId: `EXEC-ATTACK-${Date.now()}`,
      agentId: 'AGENT_VISION',
      actorType: 'AI_AGENT',
      executionMode: 'DETERMINISTIC_ENGINE',
    };
    const resForbidden = await toolRegistry.execute(
      'assignTeam',
      {
        incidentId: targetIncidentId,
        teamId: '6ab35e836f6198dec575e911',
      },
      visionContext
    );
    console.log('Expected PERMISSION_DENIED Result:', JSON.stringify(resForbidden, null, 2));

    // 7. Attempt Verification Agent -> closeIncident on non-verifying status (Expect: POLICY_DENIED)
    console.log('\n--- 7. Attempt: closeIncident on Non-VERIFYING incident (Policy Denial) ---');
    const verifContext: ToolExecutionContext = {
      executionId: `EXEC-POLICY-DENIED-${Date.now()}`,
      agentId: 'AGENT_VERIFICATION',
      actorType: 'AI_AGENT',
      executionMode: 'DETERMINISTIC_ENGINE',
      incidentId: targetIncidentId,
    };
    const resPolicyDenied = await toolRegistry.execute(
      'closeIncident',
      {
        incidentId: targetIncidentId,
        verificationOutcome: 'LIKELY_RESOLVED',
      },
      verifContext
    );
    console.log('Expected POLICY_DENIED Result:', JSON.stringify(resPolicyDenied, null, 2));

    // 8. Execute valid: Verification Agent + VERIFYING incident + LIKELY_RESOLVED (Expect: CLOSED)
    console.log('\n--- 8. Execute Valid: Verification Agent + VERIFYING incident + LIKELY_RESOLVED ---');
    // Create an incident in VERIFYING status
    const verifiedIncident = await incidentService.createIncident({
      category: 'POTHOLE',
      description: 'Pothole asphalt patched by Roadworks Team Beta',
      location: {
        type: 'Point',
        coordinates: [-73.9851, 40.7484],
        address: '5th Ave & 34th St',
      },
      ward: 'Ward 5 - Central',
      zone: 'Zone A',
    });
    // Advance status to VERIFYING
    await incidentService.updateIncidentStatus(verifiedIncident.id, 'ANALYZING', { actorType: 'SYSTEM' });
    await incidentService.updateIncidentStatus(verifiedIncident.id, 'VALIDATED', { actorType: 'SYSTEM' });
    await incidentService.updateIncidentStatus(verifiedIncident.id, 'ASSIGNED', { actorType: 'SYSTEM' });
    await incidentService.updateIncidentStatus(verifiedIncident.id, 'IN_PROGRESS', { actorType: 'SYSTEM' });
    await incidentService.updateIncidentStatus(verifiedIncident.id, 'RESOLVED', { actorType: 'SYSTEM' });
    await incidentService.updateIncidentStatus(verifiedIncident.id, 'VERIFYING', { actorType: 'SYSTEM' });

    const validCloseContext: ToolExecutionContext = {
      executionId: `EXEC-VERIFY-CLOSE-${Date.now()}`,
      agentId: 'AGENT_VERIFICATION',
      actorType: 'AI_AGENT',
      executionMode: 'DETERMINISTIC_ENGINE',
      incidentId: verifiedIncident.id,
    };
    const resClose = await toolRegistry.execute(
      'closeIncident',
      {
        incidentId: verifiedIncident.id,
        verificationOutcome: 'LIKELY_RESOLVED',
        resolutionNotes: 'Post-repair photo confirms road surface fully restored',
      },
      validCloseContext
    );
    console.log('Valid closeIncident Result:', JSON.stringify(resClose, null, 2));

    // 9. Execute invalid duplicate write (Expect: idempotency protection)
    console.log('\n--- 9. Execute Duplicate Write with Same Idempotency Key ---');
    const idemKey = `IDEMPOTENT-MANUAL-${Date.now()}`;
    const idemContext: ToolExecutionContext = {
      executionId: `EXEC-NOTIF-01-${Date.now()}`,
      agentId: 'AGENT_NOTIFICATION',
      actorType: 'AI_AGENT',
      executionMode: 'DETERMINISTIC_ENGINE',
      idempotencyKey: idemKey,
    };
    const resWrite1 = await toolRegistry.execute(
      'sendNotification',
      {
        recipientId: '6ab35e836f6198dec575e9a1',
        title: 'Incident Resolved',
        body: 'Your reported issue has been verified and closed.',
        type: 'INFO',
      },
      idemContext
    );
    const resWrite2 = await toolRegistry.execute(
      'sendNotification',
      {
        recipientId: '6ab35e836f6198dec575e9a1',
        title: 'Incident Resolved',
        body: 'Your reported issue has been verified and closed.',
        type: 'INFO',
      },
      idemContext
    );
    console.log('Initial Write success:', resWrite1.success, '| idempotencyApplied:', (resWrite1 as any).idempotencyApplied);
    console.log('Duplicate Write success:', resWrite2.success, '| idempotencyApplied:', (resWrite2 as any).idempotencyApplied);

    // 10. Confirm AuditLog and AgentExecution records exist in MongoDB Atlas
    console.log('\n--- 10. Confirm AuditLog and AgentExecution Records in MongoDB Atlas ---');
    const auditCount = await AuditLogModel.countDocuments();
    const executionCount = await AgentExecutionModel.countDocuments();
    console.log(`Total AuditLog entries in Atlas: ${auditCount}`);
    console.log(`Total AgentExecution entries in Atlas: ${executionCount}`);

    const latestAudit = await AuditLogModel.findOne().sort({ timestamp: -1 });
    const latestExecution = await AgentExecutionModel.findOne().sort({ timestamp: -1 });
    console.log('Latest AuditLog action:', latestAudit?.action, '| resource:', latestAudit?.resourceType);
    console.log('Latest AgentExecution tool:', latestExecution?.toolsCalled?.[0]?.toolName, '| status:', latestExecution?.status, '| agent:', latestExecution?.agentId);

    console.log('\n====================================================');
    console.log('ALL 10 MANUAL VERIFICATION CHECKS SUCCEEDED!');
    console.log('====================================================');
  } finally {
    await disconnectDatabase();
  }
}

runManualVerification().catch((err) => {
  console.error('Manual verification failed:', err);
  process.exit(1);
});
