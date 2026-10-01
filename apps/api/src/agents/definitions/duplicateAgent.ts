import { ExecutionMode } from '@civicpulse/shared';
import { AgentDefinition } from '../runtime/AgentDefinition.js';
import {
  DuplicateAgentInput,
  DuplicateAgentInputSchema,
  DuplicateAgentOutput,
  DuplicateAgentOutputSchema,
} from '../schemas/duplicateSchemas.js';
import { DUPLICATE_AGENT_SYSTEM_PROMPT } from '../prompts/duplicateAgentPrompt.js';

export const duplicateAgentDefinition: AgentDefinition<DuplicateAgentInput, DuplicateAgentOutput> = Object.freeze({
  id: 'AGENT_DUPLICATE',
  name: 'CivicPulse Duplicate Detection Agent',
  description: 'Spatial and semantic duplicate detection and incident linking agent',
  allowedTools: Object.freeze(['searchNearbyIncidents', 'compareDescriptions', 'linkReportToIncident']),
  executionModes: Object.freeze<ExecutionMode[]>(['GEMINI_AI', 'GROQ_LLM', 'DETERMINISTIC_ENGINE']),
  maxIterations: 5,
  maxContextItems: 20,
  maxToolCalls: 8,
  timeoutMs: 30000,
  inputSchema: DuplicateAgentInputSchema,
  outputSchema: DuplicateAgentOutputSchema,
  systemInstructions: DUPLICATE_AGENT_SYSTEM_PROMPT,
});
