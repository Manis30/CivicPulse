import { AgentId, ExecutionMode } from '@civicpulse/shared';

/**
 * Trusted execution context passed to every tool invocation.
 * Generated and validated by the server; callers cannot forge arbitrary identity.
 */
export interface ToolExecutionContext {
  executionId: string;
  agentId: AgentId;
  incidentId?: string;
  reportId?: string;
  actorType: 'AI_AGENT' | 'USER' | 'SYSTEM';
  actorId?: string;
  executionMode: ExecutionMode;
  requestId?: string;
  idempotencyKey?: string;
  orchestrationId?: string;
}

export function validateExecutionContext(context: unknown): { valid: boolean; error?: string } {
  if (!context || typeof context !== 'object') {
    return { valid: false, error: 'Execution context must be an object' };
  }

  const ctx = context as Partial<ToolExecutionContext>;
  if (!ctx.executionId || typeof ctx.executionId !== 'string' || ctx.executionId.trim() === '') {
    return { valid: false, error: 'Missing or invalid executionId' };
  }

  if (!ctx.agentId || typeof ctx.agentId !== 'string') {
    return { valid: false, error: 'Missing or invalid agentId' };
  }

  if (!ctx.actorType || !['AI_AGENT', 'USER', 'SYSTEM'].includes(ctx.actorType)) {
    return { valid: false, error: 'Invalid actorType' };
  }

  if (!ctx.executionMode || !['GEMINI_AI', 'GROQ_LLM', 'DETERMINISTIC_ENGINE'].includes(ctx.executionMode)) {
    return { valid: false, error: 'Invalid executionMode' };
  }

  return { valid: true };
}
