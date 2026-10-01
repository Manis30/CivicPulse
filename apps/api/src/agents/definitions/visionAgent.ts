import { ExecutionMode } from '@civicpulse/shared';
import { AgentDefinition } from '../runtime/AgentDefinition.js';
import {
  VisionAgentInput,
  VisionAgentInputSchema,
  VisionAgentOutput,
  VisionAgentOutputSchema,
} from '../schemas/visionSchemas.js';
import { VISION_AGENT_SYSTEM_PROMPT } from '../prompts/visionAgentPrompt.js';

export const visionAgentDefinition: AgentDefinition<VisionAgentInput, VisionAgentOutput> = Object.freeze({
  id: 'AGENT_VISION',
  name: 'CivicPulse Vision Agent',
  description: 'Multimodal defect detection and issue classification agent for submitted citizen evidence',
  allowedTools: Object.freeze(['analyzeImage', 'classifyIssue']),
  executionModes: Object.freeze<ExecutionMode[]>(['GEMINI_AI', 'GROQ_LLM', 'DETERMINISTIC_ENGINE']),
  maxIterations: 5,
  maxContextItems: 20,
  maxToolCalls: 8,
  timeoutMs: 30000,
  inputSchema: VisionAgentInputSchema,
  outputSchema: VisionAgentOutputSchema,
  systemInstructions: VISION_AGENT_SYSTEM_PROMPT,
});
