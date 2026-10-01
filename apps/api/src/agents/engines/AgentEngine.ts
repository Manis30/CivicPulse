import { JsonValue } from '@civicpulse/shared';
import { AgentContext } from '../runtime/AgentContext.js';
import { AgentDefinition } from '../runtime/AgentDefinition.js';

/**
 * Structured decision emitted by an execution engine on each turn.
 * Never uses fragile freeform text; strictly discriminated union.
 */
export type EngineDecision =
  | {
      type: 'TOOL_CALL';
      toolName: string;
      input: JsonValue;
      rationaleSummary: string;
    }
  | {
      type: 'FINAL';
      result: JsonValue;
      rationaleSummary: string;
    };

/**
 * Standard interface for all execution engines (Gemini, Groq, Deterministic).
 */
export interface AgentEngine {
  execute(context: AgentContext, definition: AgentDefinition): Promise<EngineDecision>;
}
