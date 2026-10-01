import React from 'react';
import { IncidentStatus, SeverityLevel } from '@civicpulse/shared';

export type EventFilterType = 'ALL' | 'AI' | 'SYSTEM' | 'FIELD' | 'CITIZEN';

export type EventActorCategory = 'AI' | 'SYSTEM' | 'FIELD' | 'CITIZEN' | 'MANAGER';

export interface TimelineEventItem {
  id: string;
  type: string;
  actorType: 'CITIZEN' | 'FIELD_OFFICER' | 'DEPARTMENT_MANAGER' | 'PLATFORM_ADMIN' | 'AI_AGENT' | 'SYSTEM';
  actorId?: string;
  fromStatus?: IncidentStatus;
  toStatus?: IncidentStatus;
  description: string;
  metadata?: Record<string, any>;
  timestamp: string | Date;
  status?: 'COMPLETED' | 'IN_PROGRESS' | 'WARNING' | 'FAILED' | 'PENDING';
}

export interface AgentExecutionRecord {
  id?: string;
  _id?: string;
  agentId: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  durationMs?: number;
  modelUsed?: string;
  toolsUsed?: string[];
  output?: Record<string, any>;
  error?: string;
  startedAt?: string | Date;
  completedAt?: string | Date;
}

export interface DecisionTraceData {
  decision: string;
  evidence: string[];
  reason: string;
  agent: string;
  action: string;
  duration?: string;
  timestamp: string | Date;
}
