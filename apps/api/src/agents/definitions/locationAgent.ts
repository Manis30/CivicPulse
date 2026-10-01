import { ExecutionMode } from '@civicpulse/shared';
import { AgentDefinition } from '../runtime/AgentDefinition.js';
import {
  LocationAgentInput,
  LocationAgentInputSchema,
  LocationAgentOutput,
  LocationAgentOutputSchema,
} from '../schemas/locationSchemas.js';
import { LOCATION_AGENT_SYSTEM_PROMPT } from '../prompts/locationAgentPrompt.js';

export const locationAgentDefinition: AgentDefinition<LocationAgentInput, LocationAgentOutput> = Object.freeze({
  id: 'AGENT_LOCATION',
  name: 'CivicPulse Location Agent',
  description: 'Geospatial normalization, ward resolution, and location confidence verification agent',
  allowedTools: Object.freeze(['resolveCoordinates', 'getWard', 'updateIncidentLocation']),
  executionModes: Object.freeze<ExecutionMode[]>(['GEMINI_AI', 'GROQ_LLM', 'DETERMINISTIC_ENGINE']),
  maxIterations: 5,
  maxContextItems: 20,
  maxToolCalls: 8,
  timeoutMs: 30000,
  inputSchema: LocationAgentInputSchema,
  outputSchema: LocationAgentOutputSchema,
  systemInstructions: LOCATION_AGENT_SYSTEM_PROMPT,
});
