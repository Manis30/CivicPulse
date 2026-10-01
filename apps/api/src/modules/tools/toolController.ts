import { Request, Response, NextFunction } from 'express';
import { toolRegistry } from '../../tools/registry/ToolRegistry.js';
import { ToolExecutionContext } from '../../tools/registry/ToolExecutionContext.js';
import { env } from '../../config/env.js';

/**
 * Inspection Endpoint: GET /api/tools
 * Lists metadata of registered tools for dev/admin inspection.
 */
export async function listRegisteredTools(_req: Request, res: Response, next: NextFunction) {
  try {
    const tools = toolRegistry.list();
    res.status(200).json({
      count: tools.length,
      data: tools,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Internal Development Execution Endpoint: POST /api/tools/:toolName/execute
 * Strictly for internal testing. Protected against unauthorized external invocation.
 */
export async function executeTool(req: Request, res: Response, next: NextFunction) {
  try {
    // Security Guard: internal development access check
    const isInternalCaller =
      req.headers['x-internal-tool-call'] === 'true' ||
      req.headers['x-internal-token'] === env.JWT_SECRET ||
      env.NODE_ENV !== 'production';

    // Disallow regular citizen or untrusted callers from directly invoking internal tool execution
    const callerRole = req.headers['x-user-role'];
    if (callerRole === 'CITIZEN' && !req.headers['x-internal-token']) {
      res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'Citizens are forbidden from invoking internal Tool Registry endpoints directly',
        },
      });
      return;
    }

    if (!isInternalCaller && env.NODE_ENV === 'production') {
      res.status(403).json({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'Tool execution endpoint is restricted to trusted internal subsystems',
        },
      });
      return;
    }

    const { toolName } = req.params;
    const { input, context } = req.body;

    const executionContext: ToolExecutionContext = {
      executionId: context?.executionId || `EXEC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      agentId: context?.agentId || 'AGENT_OPERATIONS',
      incidentId: context?.incidentId,
      reportId: context?.reportId,
      actorType: context?.actorType || 'AI_AGENT',
      actorId: context?.actorId || context?.agentId,
      executionMode: context?.executionMode || 'DETERMINISTIC_ENGINE',
      requestId: (req as any).id,
      idempotencyKey: context?.idempotencyKey,
    };

    const result = await toolRegistry.execute(toolName, input, executionContext);

    // Return status code matching result success
    if (result.success) {
      res.status(200).json(result);
    } else {
      const statusMap: Record<string, number> = {
        TOOL_NOT_FOUND: 404,
        INVALID_EXECUTION_CONTEXT: 400,
        PERMISSION_DENIED: 403,
        POLICY_DENIED: 422,
        INPUT_VALIDATION_FAILED: 400,
        OUTPUT_VALIDATION_FAILED: 500,
        TOOL_EXECUTION_FAILED: 500,
        RESOURCE_NOT_FOUND: 404,
        CONFLICT: 409,
        RATE_LIMITED: 429,
      };
      const statusCode = statusMap[result.error.code] || 400;
      res.status(statusCode).json(result);
    }
  } catch (err) {
    next(err);
  }
}
