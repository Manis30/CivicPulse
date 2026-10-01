import { IncidentStatus } from '@civicpulse/shared';

export type EventFilterType = 'ALL' | 'AI' | 'SYSTEM' | 'FIELD' | 'CITIZEN';

export type EventCategoryType = 'AI' | 'SYSTEM' | 'FIELD' | 'CITIZEN' | 'VERIFICATION' | 'CRITICAL';

export interface DecisionTraceNode {
  step: 'INPUT' | 'EVIDENCE' | 'AI_DECISION' | 'TOOL_ACTION' | 'RESULT' | 'ACTOR' | 'ACTION' | 'STATE_CHANGE';
  label: string;
  detail: string;
  subdetail?: string;
  status?: 'completed' | 'active' | 'warning' | 'failed';
  iconType?: string;
}

export interface AdminTimelineEvent {
  id: string;
  type: string;
  category: EventCategoryType;
  title: string;
  description: string;
  rawDescription?: string;
  actorType: 'CITIZEN' | 'FIELD_OFFICER' | 'DEPARTMENT_MANAGER' | 'PLATFORM_ADMIN' | 'AI_AGENT' | 'SYSTEM' | string;
  actorId?: string;
  actorName: string;
  timestamp: string | Date;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'WARNING' | 'FAILED' | 'SUCCESS';
  fromStatus?: IncidentStatus | string;
  toStatus?: IncidentStatus | string;

  // AI & Agent Execution Context
  agentId?: string;
  agentName?: string;
  executionId?: string;
  durationMs?: number;
  modelUsed?: string;
  executionMode?: string;
  toolsCalled?: Array<{
    toolName: string;
    input?: Record<string, any>;
    output?: Record<string, any>;
    durationMs?: number;
    success?: boolean;
    error?: string;
  }>;
  reasoning?: string;
  inputSummary?: string;
  outputSummary?: string;

  // Evidence & Audit Context
  evidenceConsidered?: string[];
  toolsUsedList?: string[];
  stateBefore?: Record<string, any>;
  stateAfter?: Record<string, any>;
  metadata?: Record<string, any>;
  decisionTraceNodes?: DecisionTraceNode[];
  resultText?: string;
}

export interface FilterCounts {
  all: number;
  ai: number;
  system: number;
  field: number;
  citizen: number;
}
