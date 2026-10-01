export type AgentErrorCode =
  | 'AGENT_NOT_FOUND'
  | 'AGENT_INACTIVE'
  | 'INVALID_AGENT_INPUT'
  | 'INVALID_AGENT_OUTPUT'
  | 'INVALID_AGENT_DECISION'
  | 'TOOL_NOT_ALLOWED'
  | 'LOOP_LIMIT_REACHED'
  | 'MAX_ITERATIONS_REACHED'
  | 'MAX_TOOL_CALLS_REACHED'
  | 'MAX_CONTEXT_ITEMS_REACHED'
  | 'AGENT_TIMEOUT'
  | 'ENGINE_FAILURE'
  | 'FALLBACK_FAILED'
  | 'UNAUTHORIZED_AGENT_ACCESS';

export class AgentRuntimeError extends Error {
  readonly code: AgentErrorCode;
  readonly details?: unknown;

  constructor(code: AgentErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'AgentRuntimeError';
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AgentRuntimeError.prototype);
  }
}
