import { ExecutionMode } from '@civicpulse/shared';
import { AgentDefinition } from '../runtime/AgentDefinition.js';
import {
  NotificationAgentInput,
  NotificationAgentInputSchema,
  NotificationAgentOutput,
  NotificationAgentOutputSchema,
} from '../schemas/notificationSchemas.js';

export const notificationAgentDefinition: AgentDefinition<
  NotificationAgentInput,
  NotificationAgentOutput
> = Object.freeze({
  id: 'AGENT_NOTIFICATION',
  name: 'CivicPulse Notification Agent',
  description: 'Dispatches real-time in-app, push, and emergency broadcast notifications to citizens, field officers, and managers',
  allowedTools: Object.freeze([
    'createInAppNotification',
    'broadcastIncidentEvent',
    'sendEscalationAlert',
  ]),
  executionModes: Object.freeze<ExecutionMode[]>(['GEMINI_AI', 'GROQ_LLM', 'DETERMINISTIC_ENGINE']),
  maxIterations: 4,
  maxContextItems: 15,
  maxToolCalls: 6,
  timeoutMs: 25000,
  inputSchema: NotificationAgentInputSchema,
  outputSchema: NotificationAgentOutputSchema,
  systemInstructions:
    'You are the CivicPulse Notification Specialist. Compose concise, actionable municipal updates for citizens and operational alerts for municipal personnel.',
});
