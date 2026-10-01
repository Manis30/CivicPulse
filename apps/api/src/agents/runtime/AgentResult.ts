import { AgentId, ExecutionMode } from '@civicpulse/shared';
import { AgentErrorCode } from './AgentRuntimeError.js';
import { ToolExecutionRecord } from './AgentContext.js';

export interface AgentTraceStep {
  iteration: number;
  decision: 'TOOL_CALL' | 'FINAL';
  toolName?: string;
  status: 'SUCCESS' | 'FAILED';
  durationMs: number;
  error?: string;
}

export interface AgentResultSuccess<TOutput = unknown> {
  success: true;
  agentId: AgentId;
  executionId: string;
  executionMode: ExecutionMode;
  requestedEngine?: ExecutionMode;
  actualEngine?: ExecutionMode;
  fallbackReason?: string;
  result: TOutput;
  iterations: number;
  toolCalls: ToolExecutionRecord[];
  durationMs: number;
  trace: AgentTraceStep[];
}

export interface AgentResultFailure {
  success: false;
  agentId: AgentId;
  executionId: string;
  executionMode: ExecutionMode;
  requestedEngine?: ExecutionMode;
  actualEngine?: ExecutionMode;
  fallbackReason?: string;
  error: {
    code: AgentErrorCode;
    message: string;
    details?: unknown;
  };
  iterations: number;
  toolCalls: ToolExecutionRecord[];
  durationMs: number;
  trace: AgentTraceStep[];
}

export type AgentResult<TOutput = unknown> =
  | AgentResultSuccess<TOutput>
  | AgentResultFailure;
