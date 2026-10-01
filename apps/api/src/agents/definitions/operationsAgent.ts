import { ExecutionMode } from '@civicpulse/shared';
import { AgentDefinition } from '../runtime/AgentDefinition.js';
import {
  OperationsAgentInput,
  OperationsAgentInputSchema,
  OperationsAgentOutput,
  OperationsAgentOutputSchema,
} from '../schemas/operationsSchemas.js';

export const operationsAgentDefinition: AgentDefinition<
  OperationsAgentInput,
  OperationsAgentOutput
> = Object.freeze({
  id: 'AGENT_OPERATIONS',
  name: 'CivicPulse Operations Agent',
  description: 'Creates official municipal work orders, defines equipment and safety checklists, and establishes SLA deadlines',
  allowedTools: Object.freeze([
    'createWorkOrder',
    'updateWorkOrder',
    'calculateSLA',
    'monitorProgress',
  ]),
  executionModes: Object.freeze<ExecutionMode[]>(['GEMINI_AI', 'GROQ_LLM', 'DETERMINISTIC_ENGINE']),
  maxIterations: 5,
  maxContextItems: 20,
  maxToolCalls: 8,
  timeoutMs: 30000,
  inputSchema: OperationsAgentInputSchema,
  outputSchema: OperationsAgentOutputSchema,
  systemInstructions:
    'You are the CivicPulse Operations Specialist. Formulate official municipal work orders, specify necessary repair equipment and checklist protocols, and initiate SLA monitoring.',
});
