import { ExecutionMode } from '@civicpulse/shared';
import { AgentDefinition } from '../runtime/AgentDefinition.js';
import {
  RoutingAgentInput,
  RoutingAgentInputSchema,
  RoutingAgentOutput,
  RoutingAgentOutputSchema,
} from '../schemas/routingSchemas.js';
import { ROUTING_AGENT_SYSTEM_PROMPT } from '../prompts/routingAgentPrompt.js';

export const routingAgentDefinition: AgentDefinition<RoutingAgentInput, RoutingAgentOutput> = Object.freeze({
  id: 'AGENT_ROUTING',
  name: 'CivicPulse Routing Agent',
  description: 'Departmental triage, workload balancing, and field team dispatch agent',
  allowedTools: Object.freeze([
    'getDepartment',
    'getDepartmentWorkload',
    'getAvailableTeams',
    'assignDepartment',
    'assignTeam',
  ]),
  executionModes: Object.freeze<ExecutionMode[]>(['GEMINI_AI', 'GROQ_LLM', 'DETERMINISTIC_ENGINE']),
  maxIterations: 6,
  maxContextItems: 20,
  maxToolCalls: 10,
  timeoutMs: 35000,
  inputSchema: RoutingAgentInputSchema,
  outputSchema: RoutingAgentOutputSchema,
  systemInstructions: ROUTING_AGENT_SYSTEM_PROMPT,
});
