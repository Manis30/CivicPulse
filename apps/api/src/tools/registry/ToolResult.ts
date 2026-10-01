/**
 * Standardized error codes for Tool Registry executions.
 */
export type ToolErrorCode =
  | 'TOOL_NOT_FOUND'
  | 'INVALID_EXECUTION_CONTEXT'
  | 'PERMISSION_DENIED'
  | 'POLICY_DENIED'
  | 'INPUT_VALIDATION_FAILED'
  | 'OUTPUT_VALIDATION_FAILED'
  | 'TOOL_EXECUTION_FAILED'
  | 'RESOURCE_NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED';

/**
 * Standardized Tool Execution Result (Discriminated Union).
 * Controlled error boundaries: tools never throw unhandled exceptions across registry borders.
 */
export type ToolResult<T = unknown> =
  | {
      success: true;
      data: T;
      executionId: string;
      durationMs: number;
      idempotencyApplied?: boolean;
    }
  | {
      success: false;
      error: {
        code: ToolErrorCode;
        message: string;
        details?: unknown;
      };
      executionId?: string;
      durationMs: number;
    };
