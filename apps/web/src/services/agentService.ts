import { AgentId, ExecutionMode, AgentExecution } from '@civicpulse/shared';

/**
 * =========================================================================
 * PHASE 1 PREVIEW MOCK DATA — AGENT TELEMETRY & ACTIVITY
 * =========================================================================
 * The roster and execution logs below represent realistic mock telemetry
 * for the Phase 1 UI, Admin Control Center, and Command Center verification.
 * 
 * In Phase 4, these mock arrays will be replaced with real-time SSE / WebSocket
 * streams driven by the AI Orchestrator and Tool Registry.
 * =========================================================================
 */
export interface AgentCardData {
  agentId: AgentId;
  name: string;
  roleDescription: string;
  status: 'ACTIVE' | 'IDLE' | 'BUSY';
  executionMode: ExecutionMode;
  tools: string[];
  totalExecutions: number;
  successRate: number;
  lastActive: string;
}

export const AGENT_ROSTER: AgentCardData[] = [
  {
    agentId: 'AGENT_VISION',
    name: 'Vision Agent',
    roleDescription: 'Analyzes imagery, classifies civic issues, evaluates evidence quality',
    status: 'ACTIVE',
    executionMode: 'DETERMINISTIC_ENGINE',
    tools: ['analyzeImage', 'classifyIssue', 'extractEvidence', 'evaluateImageQuality'],
    totalExecutions: 384,
    successRate: 99.2,
    lastActive: '1m ago',
  },
  {
    agentId: 'AGENT_LOCATION',
    name: 'Location Agent',
    roleDescription: 'Reverse geocodes coordinates, resolves wards, zones, and sensitive landmarks',
    status: 'ACTIVE',
    executionMode: 'DETERMINISTIC_ENGINE',
    tools: ['resolveCoordinates', 'reverseGeocode', 'findWard', 'findZone', 'findNearbyLandmarks'],
    totalExecutions: 382,
    successRate: 100,
    lastActive: '1m ago',
  },
  {
    agentId: 'AGENT_DUPLICATE',
    name: 'Duplicate Detection Agent',
    roleDescription: 'Multi-signal analysis: 2dsphere spatial radius, TF-IDF text similarity, time window',
    status: 'ACTIVE',
    executionMode: 'DETERMINISTIC_ENGINE',
    tools: ['searchNearbyIncidents', 'searchSimilarReports', 'compareDescriptions', 'linkReportToIncident'],
    totalExecutions: 382,
    successRate: 98.7,
    lastActive: '2m ago',
  },
  {
    agentId: 'AGENT_SEVERITY',
    name: 'Severity Agent',
    roleDescription: 'Calculates explainable risk scores based on traffic, school proximity, recurrence',
    status: 'ACTIVE',
    executionMode: 'DETERMINISTIC_ENGINE',
    tools: ['calculateSeverityRisk', 'setSeverity'],
    totalExecutions: 310,
    successRate: 99.4,
    lastActive: '4m ago',
  },
  {
    agentId: 'AGENT_ROUTING',
    name: 'Routing Agent',
    roleDescription: 'Matches incident needs to department jurisdiction and available team capacity',
    status: 'ACTIVE',
    executionMode: 'DETERMINISTIC_ENGINE',
    tools: ['getDepartments', 'getDepartmentWorkload', 'getAvailableTeams', 'assignDepartment', 'assignTeam'],
    totalExecutions: 308,
    successRate: 98.9,
    lastActive: '5m ago',
  },
  {
    agentId: 'AGENT_INVESTIGATION',
    name: 'Investigation Agent',
    roleDescription: 'Workflow-triggered synthesizer of true historical repairs and recurrence records',
    status: 'IDLE',
    executionMode: 'DETERMINISTIC_ENGINE',
    tools: ['getIncidentHistory', 'getIncidentTimeline', 'getHistoricalRepairs'],
    totalExecutions: 84,
    successRate: 100,
    lastActive: '18m ago',
  },
  {
    agentId: 'AGENT_OPERATIONS',
    name: 'Operations Agent',
    roleDescription: 'Creates work orders, monitors SLA countdowns, and escalates overdue tickets',
    status: 'ACTIVE',
    executionMode: 'DETERMINISTIC_ENGINE',
    tools: ['createWorkOrder', 'updateWorkOrder', 'calculateSLA', 'monitorProgress'],
    totalExecutions: 490,
    successRate: 99.6,
    lastActive: '30s ago',
  },
  {
    agentId: 'AGENT_VERIFICATION',
    name: 'Resolution Verification Agent',
    roleDescription: 'Compares BEFORE and AFTER evidence to autonomously close or reopen incidents',
    status: 'ACTIVE',
    executionMode: 'DETERMINISTIC_ENGINE',
    tools: ['verifyResolution', 'compareEvidence', 'closeIncident', 'reopenIncident'],
    totalExecutions: 195,
    successRate: 97.4,
    lastActive: '3m ago',
  },
  {
    agentId: 'AGENT_NOTIFICATION',
    name: 'Notification Agent',
    roleDescription: 'Dispatches targeted multi-channel notifications on lifecycle events and SLA alerts',
    status: 'ACTIVE',
    executionMode: 'DETERMINISTIC_ENGINE',
    tools: ['sendNotification', 'createNotification', 'dispatchEmailAlert'],
    totalExecutions: 742,
    successRate: 99.9,
    lastActive: '10s ago',
  },
  {
    agentId: 'AGENT_INTELLIGENCE',
    name: 'Pattern / Intelligence Agent',
    roleDescription: 'Scans city-wide records for emerging spatial hotspots and chronic failure clusters',
    status: 'IDLE',
    executionMode: 'DETERMINISTIC_ENGINE',
    tools: ['detectHotspots', 'analyzeRecurringClusters', 'calculateSLATrends'],
    totalExecutions: 24,
    successRate: 100,
    lastActive: '42m ago',
  }
];

export const PREVIEW_ACTIVITY_LOGS: AgentExecution[] = [
  {
    id: 'EXEC-2026-9812',
    agentId: 'AGENT_VERIFICATION',
    agentName: 'Resolution Verification Agent',
    executionMode: 'DETERMINISTIC_ENGINE',
    incidentId: 'INC-2026-1050',
    status: 'SUCCESS',
    toolsCalled: [
      {
        toolName: 'verifyResolution',
        input: { incidentId: 'INC-2026-1050', beforeEvidenceId: 'EVD-01', afterEvidenceId: 'EVD-02' },
        output: { outcome: 'POSSIBLY_UNRESOLVED', score: 0.42, reason: 'Residual waste visible within frame' },
        durationMs: 312,
        success: true,
      }
    ],
    reasoning: 'AFTER evidence indicates ongoing overflow condition; triggering autonomous REOPEN policy.',
    durationMs: 312,
    startedAt: '2026-09-22T21:10:00Z',
    completedAt: '2026-09-22T21:10:01Z',
    retryCount: 0,
  },
  {
    id: 'EXEC-2026-9811',
    agentId: 'AGENT_SEVERITY',
    agentName: 'Severity Agent',
    executionMode: 'DETERMINISTIC_ENGINE',
    incidentId: 'INC-2026-1048',
    status: 'SUCCESS',
    toolsCalled: [
      {
        toolName: 'calculateSeverityRisk',
        input: { category: 'WATER_LEAK', landmarks: ['Central Hospital'], duplicates: 3 },
        output: { severity: 'CRITICAL', score: 92 },
        durationMs: 145,
        success: true,
      }
    ],
    reasoning: 'Proximity to hospital trauma intake arterial elevates risk score past critical threshold (90).',
    durationMs: 145,
    startedAt: '2026-09-22T20:15:00Z',
    completedAt: '2026-09-22T20:15:01Z',
    retryCount: 0,
  },
  {
    id: 'EXEC-2026-9810',
    agentId: 'AGENT_ROUTING',
    agentName: 'Routing Agent',
    executionMode: 'DETERMINISTIC_ENGINE',
    incidentId: 'INC-2026-1049',
    status: 'SUCCESS',
    toolsCalled: [
      {
        toolName: 'assignTeam',
        input: { departmentId: 'DEPT-ROADS-01', ward: 'Ward 7' },
        output: { assignedTeamId: 'TEAM-ALPHA-01', teamWorkload: '2/5 active' },
        durationMs: 180,
        success: true,
      }
    ],
    reasoning: 'Team Alpha has available capacity and active jurisdiction in Ward 7.',
    durationMs: 180,
    startedAt: '2026-09-22T14:05:00Z',
    completedAt: '2026-09-22T14:05:01Z',
    retryCount: 0,
  },
];
