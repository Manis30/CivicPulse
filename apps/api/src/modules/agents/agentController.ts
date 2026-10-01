import { Request, Response } from 'express';
import { AgentId, ExecutionMode } from '@civicpulse/shared';
import { agentRuntime } from '../../agents/runtime/AgentRuntime.js';
import { getAllAgentDefinitions, getAgentDefinition } from '../../agents/definitions/index.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export class AgentController {
  /**
   * Internal/development agent execution endpoint.
   * POST /api/agents/:agentId/execute
   */
  async executeAgent(req: Request, res: Response): Promise<void> {
    const { agentId } = req.params;
    const body = req.body || {};

    // 1. Establish trusted execution context and enforce development-only bypass (User Correction 4 & 5)
    const isDevelopment = (process.env.NODE_ENV || env.NODE_ENV) === 'development';
    const devHeader = req.headers['x-dev-internal'] === 'true';

    // In production, only platform admin or verified system tokens can invoke agent endpoints
    if (!isDevelopment) {
      const user = (req as any).user;
      if (!user || (user.role !== 'PLATFORM_ADMIN' && user.role !== 'SYSTEM')) {
        res.status(403).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED_AGENT_ACCESS',
            message: 'Direct agent execution is restricted to internal SYSTEM processes or PLATFORM_ADMIN in production.',
          },
        });
        return;
      }
    } else {
      // In development: require EITHER x-dev-internal: true OR an authenticated admin/system user
      const user = (req as any).user;
      const isAdminOrSystem = user && (user.role === 'PLATFORM_ADMIN' || user.role === 'SYSTEM');
      if (!devHeader && !isAdminOrSystem) {
        res.status(403).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED_AGENT_ACCESS',
            message: 'Direct agent execution requires development authorization header (x-dev-internal: true) or administrative credentials.',
          },
        });
        return;
      }
    }

    // 2. Reject client-side identity spoofing (User Correction 5)
    // Server assigns trusted actorType and actorId rather than trusting arbitrary body claims
    const trustedActorType =
      (req as any).user?.role === 'PLATFORM_ADMIN'
        ? 'USER'
        : (req as any).user?.role === 'SYSTEM'
        ? 'SYSTEM'
        : 'AI_AGENT';

    const trustedActorId = (req as any).user?.id || agentId;

    // 3. Resolve agent definition
    const definition = getAgentDefinition(agentId as AgentId);
    if (!definition) {
      res.status(404).json({
        success: false,
        error: {
          code: 'AGENT_NOT_FOUND',
          message: `Unknown agent '${agentId}'.`,
        },
      });
      return;
    }

    const executionMode = (body.executionMode as ExecutionMode) || definition.executionModes[0];

    logger.info(`Agent execution request: ${agentId} (${executionMode})`, {
      agentId,
      executionMode,
      incidentId: body.incidentId,
    });

    // 4. Invoke AgentRuntime
    const result = await agentRuntime.execute(
      definition,
      body,
      {
        executionId: body.executionId,
        incidentId: body.incidentId,
        reportId: body.reportId,
        executionMode,
        allowFallback: body.allowFallback ?? true,
        requestId: req.headers['x-request-id'] as string,
        actorType: trustedActorType,
        actorId: trustedActorId,
      }
    );

    if (result.success) {
      res.status(200).json(result);
    } else {
      const statusCode =
        result.error.code === 'AGENT_NOT_FOUND'
          ? 404
          : result.error.code === 'UNAUTHORIZED_AGENT_ACCESS'
          ? 403
          : result.error.code === 'INVALID_AGENT_INPUT'
          ? 400
          : 422;

      res.status(statusCode).json(result);
    }
  }

  /**
   * Inspection endpoint for registered agent definitions.
   * GET /api/agents
   */
  async listAgents(_req: Request, res: Response): Promise<void> {
    const agents = getAllAgentDefinitions().map((def) => ({
      id: def.id,
      name: def.name,
      description: def.description,
      allowedTools: def.allowedTools,
      executionModes: def.executionModes,
      maxIterations: def.maxIterations,
      timeoutMs: def.timeoutMs,
    }));

    res.status(200).json({
      success: true,
      agents,
    });
  }
}

export const agentController = new AgentController();
