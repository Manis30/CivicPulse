import { ZodSchema, ZodType } from 'zod';
import { AgentId, ExecutionMode } from '@civicpulse/shared';

/**
 * Strongly typed AgentDefinition contract.
 * Every agent must explicitly declare its allowed tools, supported execution modes,
 * input/output schemas, system instructions, and operational execution limits.
 */
export interface AgentDefinition<TInput = unknown, TOutput = unknown> {
  id: AgentId;
  name: string;
  description: string;

  /**
   * Explicit whitelist of tool names that this agent is permitted to invoke.
   * Wildcards like ['*'] are strictly forbidden.
   */
  allowedTools: readonly string[];

  /**
   * Supported execution engines for this agent (e.g. GEMINI_AI, GROQ_LLM, DETERMINISTIC_ENGINE).
   */
  executionModes: readonly ExecutionMode[];

  /**
   * Maximum reasoning/tool-call loop iterations before terminating (e.g. 5).
   */
  maxIterations: number;

  /**
   * Maximum accumulated context items (previous tool results) allowed before aborting (e.g. 20).
   */
  maxContextItems: number;

  /**
   * Maximum total tool calls allowed across the entire execution (e.g. 8).
   */
  maxToolCalls: number;

  /**
   * Maximum total execution timeout in milliseconds (e.g. 30,000 ms).
   */
  timeoutMs: number;

  /**
   * Zod schema for validating agent input before reasoning starts.
   */
  inputSchema: ZodType<TInput, any, any>;

  /**
   * Zod schema for validating the final structured decision before returning.
   */
  outputSchema: ZodType<TOutput, any, any>;

  /**
   * Focused system prompt/instructions for the agent. Must not contain credentials.
   */
  systemInstructions: string;
}
