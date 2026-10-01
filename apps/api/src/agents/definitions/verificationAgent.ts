import { ExecutionMode } from '@civicpulse/shared';
import { AgentDefinition } from '../runtime/AgentDefinition.js';
import {
  VerificationAgentInput,
  VerificationAgentInputSchema,
  VerificationAgentOutput,
  VerificationAgentOutputSchema,
} from '../schemas/verificationSchemas.js';

export const verificationAgentDefinition: AgentDefinition<
  VerificationAgentInput,
  VerificationAgentOutput
> = Object.freeze({
  id: 'AGENT_VERIFICATION',
  name: 'CivicPulse Verification Agent',
  description: 'Multimodal computer vision verification comparing BEFORE vs AFTER photographic evidence to validate true resolution',
  allowedTools: Object.freeze([
    'compareBeforeAfterImages',
    'verifyResolutionProof',
    'evaluateCompletionQuality',
  ]),
  executionModes: Object.freeze<ExecutionMode[]>(['GEMINI_AI', 'GROQ_LLM', 'DETERMINISTIC_ENGINE']),
  maxIterations: 5,
  maxContextItems: 20,
  maxToolCalls: 6,
  timeoutMs: 40000,
  inputSchema: VerificationAgentInputSchema,
  outputSchema: VerificationAgentOutputSchema,
  systemInstructions:
    'You are the CivicPulse Verification Specialist. Inspect BEFORE and AFTER photographic evidence of municipal repairs. Verify that the defect (pothole, water leak, debris) is genuinely resolved. Determine PASS or FAIL based on visual evidence.',
});
