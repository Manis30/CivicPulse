import { AgentId } from '@civicpulse/shared';
import { AgentDefinition } from '../runtime/AgentDefinition.js';
import { visionAgentDefinition } from './visionAgent.js';
import { locationAgentDefinition } from './locationAgent.js';
import { duplicateAgentDefinition } from './duplicateAgent.js';
import { severityAgentDefinition } from './severityAgent.js';
import { routingAgentDefinition } from './routingAgent.js';
import { investigationAgentDefinition } from './investigationAgent.js';
import { operationsAgentDefinition } from './operationsAgent.js';
import { verificationAgentDefinition } from './verificationAgent.js';
import { notificationAgentDefinition } from './notificationAgent.js';
import { intelligenceAgentDefinition } from './intelligenceAgent.js';

export {
  visionAgentDefinition,
  locationAgentDefinition,
  duplicateAgentDefinition,
  severityAgentDefinition,
  routingAgentDefinition,
  investigationAgentDefinition,
  operationsAgentDefinition,
  verificationAgentDefinition,
  notificationAgentDefinition,
  intelligenceAgentDefinition,
};

export const ACTIVE_AGENT_IDS: readonly AgentId[] = Object.freeze([
  'AGENT_VISION',
  'AGENT_LOCATION',
  'AGENT_DUPLICATE',
  'AGENT_SEVERITY',
  'AGENT_ROUTING',
  'AGENT_INVESTIGATION',
  'AGENT_OPERATIONS',
  'AGENT_VERIFICATION',
  'AGENT_NOTIFICATION',
  'AGENT_INTELLIGENCE',
]);

export const INACTIVE_AGENT_IDS: readonly AgentId[] = Object.freeze([]);

const AGENT_DEFINITIONS = new Map<AgentId, AgentDefinition<any, any>>([
  ['AGENT_VISION', visionAgentDefinition],
  ['AGENT_LOCATION', locationAgentDefinition],
  ['AGENT_DUPLICATE', duplicateAgentDefinition],
  ['AGENT_SEVERITY', severityAgentDefinition],
  ['AGENT_ROUTING', routingAgentDefinition],
  ['AGENT_INVESTIGATION', investigationAgentDefinition],
  ['AGENT_OPERATIONS', operationsAgentDefinition],
  ['AGENT_VERIFICATION', verificationAgentDefinition],
  ['AGENT_NOTIFICATION', notificationAgentDefinition],
  ['AGENT_INTELLIGENCE', intelligenceAgentDefinition],
]);

export function getAgentDefinition(agentId: AgentId): AgentDefinition<any, any> | undefined {
  return AGENT_DEFINITIONS.get(agentId);
}

export function hasAgentDefinition(agentId: AgentId): boolean {
  return AGENT_DEFINITIONS.has(agentId);
}

export function isAgentActive(agentId: string): boolean {
  return ACTIVE_AGENT_IDS.includes(agentId as AgentId);
}

export function isAgentInactive(agentId: string): boolean {
  return INACTIVE_AGENT_IDS.includes(agentId as AgentId);
}

export function getAllAgentDefinitions(): AgentDefinition<any, any>[] {
  return Array.from(AGENT_DEFINITIONS.values());
}
