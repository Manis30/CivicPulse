import { AgentId, ExecutionMode, JsonValue } from '@civicpulse/shared';

/**
 * Record of a tool execution within an agent's reasoning loop.
 * Stored using JSON-safe types without `any`.
 */
export interface ToolExecutionRecord {
  toolName: string;
  input: JsonValue;
  output: JsonValue;
  success: boolean;
  durationMs: number;
  error?: string;
}

/**
 * Controlled execution context passed to the engine on each iteration.
 * Strictly bounded: contains only information required for current reasoning.
 * Does NOT contain database models, raw secrets, or authorization tokens.
 */
export interface AgentContext {
  executionId: string;
  agentId: AgentId;
  incidentId?: string;
  reportId?: string;

  /**
   * Sanitized, JSON-safe input parameters for this agent execution.
   */
  input: JsonValue;

  /**
   * Chronological list of previous tool call results accumulated in this execution.
   */
  previousToolResults: ToolExecutionRecord[];

  /**
   * Current loop iteration (1-indexed).
   */
  iteration: number;

  /**
   * Active execution engine mode.
   */
  executionMode: ExecutionMode;

  /**
   * Engine originally requested by caller (if different from executionMode due to fallback).
   */
  requestedEngine?: ExecutionMode;

  /**
   * Actual engine executing this context.
   */
  actualEngine?: ExecutionMode;

  /**
   * Explicit reason if fallback occurred.
   */
  fallbackReason?: string;

  /**
   * Execution start timestamp.
   */
  startedAt: Date;

  /**
   * Request tracing ID.
   */
  requestId?: string;
}

const REDACTED_KEYS = new Set([
  'authorization',
  'cookie',
  'jwt_secret',
  'api_key',
  'apikey',
  'token',
  'password',
  'secret',
  'credential',
]);

/**
 * Strips secrets, auth tokens, and non-JSON-safe values from input before entering context.
 */
export function sanitizeContextInput(raw: unknown): JsonValue {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') {
    return raw;
  }
  if (Array.isArray(raw)) {
    return raw.map((item) => sanitizeContextInput(item));
  }
  if (typeof raw === 'object') {
    const sanitized: { [key: string]: JsonValue } = {};
    for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
      if (REDACTED_KEYS.has(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeContextInput(value);
      }
    }
    return sanitized;
  }
  return String(raw);
}

export function createAgentContext(params: {
  executionId: string;
  agentId: AgentId;
  input: unknown;
  executionMode: ExecutionMode;
  incidentId?: string;
  reportId?: string;
  requestedEngine?: ExecutionMode;
  actualEngine?: ExecutionMode;
  fallbackReason?: string;
  requestId?: string;
}): AgentContext {
  return {
    executionId: params.executionId,
    agentId: params.agentId,
    incidentId: params.incidentId,
    reportId: params.reportId,
    input: sanitizeContextInput(params.input),
    previousToolResults: [],
    iteration: 1,
    executionMode: params.executionMode,
    requestedEngine: params.requestedEngine || params.executionMode,
    actualEngine: params.actualEngine || params.executionMode,
    fallbackReason: params.fallbackReason,
    startedAt: new Date(),
    requestId: params.requestId,
  };
}
