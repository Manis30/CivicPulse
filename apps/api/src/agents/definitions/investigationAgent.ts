import { ExecutionMode } from '@civicpulse/shared';
import { AgentDefinition } from '../runtime/AgentDefinition.js';
import {
  InvestigationAgentInput,
  InvestigationAgentInputSchema,
  InvestigationAgentOutput,
  InvestigationAgentOutputSchema,
} from '../schemas/investigationSchemas.js';

export const investigationAgentDefinition: AgentDefinition<
  InvestigationAgentInput,
  InvestigationAgentOutput
> = Object.freeze({
  id: 'AGENT_INVESTIGATION',
  name: 'CivicPulse Investigation Agent',
  description: 'Synthesizes historical incident repairs, chronic infrastructure recurrence, and root cause indicators',
  allowedTools: Object.freeze([
    'getIncidentHistory',
    'getIncidentTimeline',
    'getHistoricalRepairs',
  ]),
  executionModes: Object.freeze<ExecutionMode[]>(['GEMINI_AI', 'GROQ_LLM', 'DETERMINISTIC_ENGINE']),
  maxIterations: 5,
  maxContextItems: 20,
  maxToolCalls: 8,
  timeoutMs: 30000,
  inputSchema: InvestigationAgentInputSchema,
  outputSchema: InvestigationAgentOutputSchema,
  systemInstructions:
    'You are the CivicPulse Investigation Specialist. Analyze previous incidents and past work orders in the same ward or coordinates to detect recurrence signals, chronic civic defects, and recommend municipal intervention.',
});
