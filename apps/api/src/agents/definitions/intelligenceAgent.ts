import { ExecutionMode } from '@civicpulse/shared';
import { AgentDefinition } from '../runtime/AgentDefinition.js';
import {
  IntelligenceAgentInput,
  IntelligenceAgentInputSchema,
  IntelligenceAgentOutput,
  IntelligenceAgentOutputSchema,
} from '../schemas/intelligenceSchemas.js';

export const intelligenceAgentDefinition: AgentDefinition<
  IntelligenceAgentInput,
  IntelligenceAgentOutput
> = Object.freeze({
  id: 'AGENT_INTELLIGENCE',
  name: 'CivicPulse Intelligence Agent',
  description: 'Analyzes city-wide spatial and temporal defect records to discover hotspots, ward health scores, and chronic vulnerabilities',
  allowedTools: Object.freeze([
    'aggregateWardHotspots',
    'computeCityHealthScore',
    'detectChronicInfrastructure',
  ]),
  executionModes: Object.freeze<ExecutionMode[]>(['GEMINI_AI', 'GROQ_LLM', 'DETERMINISTIC_ENGINE']),
  maxIterations: 5,
  maxContextItems: 25,
  maxToolCalls: 8,
  timeoutMs: 35000,
  inputSchema: IntelligenceAgentInputSchema,
  outputSchema: IntelligenceAgentOutputSchema,
  systemInstructions:
    'You are the CivicPulse Intelligence Specialist. Perform cross-ward pattern discovery, cluster recurrent civic failures, and evaluate comprehensive urban health scores.',
});
