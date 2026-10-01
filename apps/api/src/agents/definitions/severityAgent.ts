import { ExecutionMode } from '@civicpulse/shared';
import { AgentDefinition } from '../runtime/AgentDefinition.js';
import {
  SeverityAgentInput,
  SeverityAgentInputSchema,
  SeverityAgentOutput,
  SeverityAgentOutputSchema,
} from '../schemas/severitySchemas.js';
import { SEVERITY_AGENT_SYSTEM_PROMPT } from '../prompts/severityAgentPrompt.js';

export const severityAgentDefinition: AgentDefinition<SeverityAgentInput, SeverityAgentOutput> = Object.freeze({
  id: 'AGENT_SEVERITY',
  name: 'CivicPulse Severity Agent',
  description: 'Multi-factor risk assessment, hazard scoring, and SLA target assignment agent',
  allowedTools: Object.freeze(['calculateSeverityRisk', 'setSeverity']),
  executionModes: Object.freeze<ExecutionMode[]>(['GEMINI_AI', 'GROQ_LLM', 'DETERMINISTIC_ENGINE']),
  maxIterations: 5,
  maxContextItems: 20,
  maxToolCalls: 8,
  timeoutMs: 30000,
  inputSchema: SeverityAgentInputSchema,
  outputSchema: SeverityAgentOutputSchema,
  systemInstructions: SEVERITY_AGENT_SYSTEM_PROMPT,
});
