import { JsonValue } from '@civicpulse/shared';
import { AgentContext, ToolExecutionRecord } from './AgentContext.js';
import { AgentDefinition } from './AgentDefinition.js';
import { AgentRuntimeError } from './AgentRuntimeError.js';

export const DEFAULT_EXECUTION_LIMITS = Object.freeze({
  maxIterations: 5,
  maxToolCalls: 8,
  maxContextItems: 20,
  timeoutMs: 30000,
});

/**
 * Normalizes and hashes tool input for loop detection.
 */
function serializeInput(input: JsonValue): string {
  try {
    return JSON.stringify(input);
  } catch {
    return String(input);
  }
}

/**
 * Loop protection: detects if the same tool with identical input
 * is requested consecutively (threshold = 2 identical consecutive calls).
 */
export function detectRepeatedToolCall(
  previousResults: ToolExecutionRecord[],
  nextToolName: string,
  nextInput: JsonValue,
  threshold = 2
): boolean {
  if (previousResults.length < threshold) return false;

  const nextSerialized = serializeInput(nextInput);
  const recent = previousResults.slice(-threshold);

  return recent.every(
    (record) =>
      record.toolName === nextToolName &&
      serializeInput(record.input) === nextSerialized
  );
}

/**
 * Actively checks execution limits before performing work.
 * Throws AgentRuntimeError if any limit is exceeded.
 */
export function enforceExecutionLimits(
  context: AgentContext,
  definition: AgentDefinition
): void {
  // Check timeout
  const elapsedMs = Date.now() - context.startedAt.getTime();
  if (elapsedMs > definition.timeoutMs) {
    throw new AgentRuntimeError(
      'AGENT_TIMEOUT',
      `Agent execution exceeded timeout of ${definition.timeoutMs}ms (elapsed: ${elapsedMs}ms).`,
      { elapsedMs, timeoutMs: definition.timeoutMs }
    );
  }

  // Check max iterations
  if (context.iteration > definition.maxIterations) {
    throw new AgentRuntimeError(
      'MAX_ITERATIONS_REACHED',
      `Agent exceeded maximum iterations limit of ${definition.maxIterations}.`,
      { iteration: context.iteration, maxIterations: definition.maxIterations }
    );
  }

  // Check max tool calls
  if (context.previousToolResults.length >= definition.maxToolCalls) {
    throw new AgentRuntimeError(
      'MAX_TOOL_CALLS_REACHED',
      `Agent exceeded maximum tool calls limit of ${definition.maxToolCalls}.`,
      { toolCalls: context.previousToolResults.length, maxToolCalls: definition.maxToolCalls }
    );
  }

  // Check max context items (actively enforced runtime limit per User Correction 3)
  if (context.previousToolResults.length >= definition.maxContextItems) {
    throw new AgentRuntimeError(
      'MAX_CONTEXT_ITEMS_REACHED',
      `Agent exceeded maximum context items limit of ${definition.maxContextItems}.`,
      { contextItems: context.previousToolResults.length, maxContextItems: definition.maxContextItems }
    );
  }
}
