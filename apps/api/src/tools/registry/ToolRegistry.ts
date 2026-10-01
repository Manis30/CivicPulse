import { ToolDefinition, ToolMetadata } from './ToolDefinition.js';
import { ToolExecutionContext, validateExecutionContext } from './ToolExecutionContext.js';
import { ToolResult } from './ToolResult.js';
import { AgentPermissionGuard } from '../permissions/AgentPermissionGuard.js';
import { AGENT_PERMISSION_MAP } from '../permissions/agentPermissions.js';
import { AIPolicyEngine } from '../policies/AIPolicyEngine.js';
import { IdempotencyManager } from './IdempotencyManager.js';
import { auditLogService } from '../../services/auditLogService.js';
import { agentExecutionService } from '../../services/agentExecutionService.js';
import { logger } from '../../utils/logger.js';
import { ALL_TOOLS } from '../definitions/index.js';

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();

  constructor(autoRegisterDefaultTools = true) {
    if (autoRegisterDefaultTools) {
      for (const tool of ALL_TOOLS) {
        this.register(tool);
      }
    }
  }

  /**
   * Register a new tool definition.
   */
  register(tool: ToolDefinition): void {
    if (this.tools.has(tool.name)) {
      logger.warn(`Tool '${tool.name}' is being overwritten in ToolRegistry.`);
    }
    this.tools.set(tool.name, tool);
  }

  /**
   * Look up a tool by name.
   */
  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * Check if a tool is registered.
   */
  has(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Lists public metadata of all registered tools without exposing internals.
   */
  list(): ToolMetadata[] {
    const list: ToolMetadata[] = [];
    for (const tool of this.tools.values()) {
      // Find all agents allowed to use this tool's permission
      const allowedAgents = Object.entries(AGENT_PERMISSION_MAP)
        .filter(([_, perms]) => (perms as readonly string[]).includes(tool.requiredPermission))
        .map(([agentId]) => agentId);

      list.push({
        name: tool.name,
        description: tool.description,
        category: tool.category,
        requiredPermission: tool.requiredPermission,
        allowedAgents,
      });
    }
    return list;
  }

  /**
   * Exact 12-Step Tool Execution Pipeline.
   * Secure execution gateway between autonomous callers and domain services.
   */
  async execute(name: string, rawInput: unknown, context: ToolExecutionContext): Promise<ToolResult> {
    const startTime = Date.now();

    // 1. Resolve tool by name
    const tool = this.get(name);
    if (!tool) {
      return {
        success: false,
        error: {
          code: 'TOOL_NOT_FOUND',
          message: `Tool '${name}' is not registered in ToolRegistry`,
        },
        executionId: context?.executionId,
        durationMs: Date.now() - startTime,
      };
    }

    // 2. Validate execution context
    const ctxValidation = validateExecutionContext(context);
    if (!ctxValidation.valid) {
      return {
        success: false,
        error: {
          code: 'INVALID_EXECUTION_CONTEXT',
          message: ctxValidation.error || 'Execution context validation failed',
        },
        executionId: context?.executionId,
        durationMs: Date.now() - startTime,
      };
    }

    // 3 & 4. Validate agent identity & check agent permission
    const permissionResult = AgentPermissionGuard.check(context.agentId, tool.requiredPermission, context);
    if (!permissionResult.allowed) {
      // Log failed authorization attempt
      await this.logAgentExecution(tool, context, rawInput, null, startTime, false, {
        code: 'PERMISSION_DENIED',
        message: `Agent ${context.agentId} denied permission ${tool.requiredPermission}: ${permissionResult.reason}`,
      });

      return {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: `Permission denied for agent '${context.agentId}' on tool '${tool.name}' (requires '${tool.requiredPermission}')`,
          details: { permission: tool.requiredPermission, reason: permissionResult.reason },
        },
        executionId: context.executionId,
        durationMs: Date.now() - startTime,
      };
    }

    // 5. Check AI policy
    const policyResult = await AIPolicyEngine.evaluate(tool, rawInput, context);
    if (!policyResult.allowed) {
      await this.logAgentExecution(tool, context, rawInput, null, startTime, false, {
        code: 'POLICY_DENIED',
        message: policyResult.reason,
      });

      return {
        success: false,
        error: {
          code: 'POLICY_DENIED',
          message: `AI Policy check denied execution of tool '${tool.name}': ${policyResult.reason}`,
          details: {
            policyVersion: policyResult.policyVersion,
            ruleId: policyResult.ruleId,
            reason: policyResult.reason,
          },
        },
        executionId: context.executionId,
        durationMs: Date.now() - startTime,
      };
    }

    // 6. Validate input with Zod schema (strips arbitrary Mongo query operators)
    const inputParsed = tool.inputSchema.safeParse(rawInput);
    if (!inputParsed.success) {
      const issues = inputParsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
      return {
        success: false,
        error: {
          code: 'INPUT_VALIDATION_FAILED',
          message: `Input schema validation failed for tool '${tool.name}': ${issues}`,
          details: inputParsed.error.format(),
        },
        executionId: context.executionId,
        durationMs: Date.now() - startTime,
      };
    }

    // 7. Check Idempotency for WRITE tools
    const resourceId =
      (rawInput as any)?.incidentId ||
      (rawInput as any)?.reportId ||
      (rawInput as any)?.targetIncidentId ||
      (rawInput as any)?.workOrderId;

    const idempotencyKey =
      context.idempotencyKey ||
      (context.orchestrationId
        ? IdempotencyManager.generateOrchestrationKey(
            context.orchestrationId,
            context.agentId,
            tool.name,
            resourceId
          )
        : IdempotencyManager.generateKey(context.executionId, tool.name, resourceId));

    if (tool.category === 'WRITE') {
      const cached = IdempotencyManager.get(idempotencyKey);
      if (cached) {
        logger.info(`Idempotent hit for tool '${tool.name}' with key '${idempotencyKey}'`);
        return {
          success: true,
          data: cached.result,
          executionId: context.executionId,
          durationMs: Date.now() - startTime,
          idempotencyApplied: true,
        };
      }
    }

    // 8. Execute tool service method
    let output: any;
    try {
      output = await tool.execute(inputParsed.data, context);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      await this.logAgentExecution(tool, context, inputParsed.data, null, startTime, false, {
        code: 'TOOL_EXECUTION_FAILED',
        message: errorMsg,
      });

      return {
        success: false,
        error: {
          code: 'TOOL_EXECUTION_FAILED',
          message: `Execution failed in tool '${tool.name}': ${errorMsg}`,
        },
        executionId: context.executionId,
        durationMs: Date.now() - startTime,
      };
    }

    // 9. Validate output using outputSchema
    const outputParsed = tool.outputSchema.safeParse(output);
    if (!outputParsed.success) {
      const issues = outputParsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
      return {
        success: false,
        error: {
          code: 'OUTPUT_VALIDATION_FAILED',
          message: `Tool '${tool.name}' returned data violating output schema: ${issues}`,
          details: outputParsed.error.format(),
        },
        executionId: context.executionId,
        durationMs: Date.now() - startTime,
      };
    }

    // 10. Write execution result to AgentExecution log (concise metadata, no chain-of-thought dump)
    await this.logAgentExecution(tool, context, inputParsed.data, outputParsed.data, startTime, true);

    // 11. Write audit record for WRITE tools
    if (tool.category === 'WRITE' && tool.auditConfig) {
      try {
        const resourceId = tool.auditConfig.getResourceId(inputParsed.data, outputParsed.data);
        await auditLogService.recordAction({
          actorType: context.actorType === 'AI_AGENT' ? 'AI_AGENT' : context.actorType === 'USER' ? 'USER' : 'SYSTEM',
          actorId: context.agentId,
          action: tool.auditConfig.action,
          resourceType: tool.auditConfig.resourceType,
          resourceId,
          after: outputParsed.data as Record<string, unknown>,
          metadata: {
            toolName: tool.name,
            executionId: context.executionId,
            executionMode: context.executionMode,
          },
          requestId: context.requestId,
        });
      } catch (auditErr) {
        logger.error(`Failed to record audit log for write tool '${tool.name}':`, auditErr);
      }

      // Cache result for idempotency
      IdempotencyManager.set(idempotencyKey, outputParsed.data);
    }

    // 12. Return sanitized ToolResult
    return {
      success: true,
      data: outputParsed.data,
      executionId: context.executionId,
      durationMs: Date.now() - startTime,
    };
  }

  /**
   * Helper to persist execution trace without exposing internal models to callers.
   */
  private async logAgentExecution(
    tool: ToolDefinition,
    context: ToolExecutionContext,
    input: unknown,
    output: unknown,
    startTime: number,
    success: boolean,
    error?: { code: string; message: string }
  ): Promise<void> {
    try {
      const durationMs = Date.now() - startTime;
      await agentExecutionService.recordExecution({
        agentId: context.agentId,
        agentName: context.agentId.replace('AGENT_', '').toLowerCase() + '-agent',
        executionMode: context.executionMode,
        incidentId: context.incidentId,
        reportId: context.reportId,
        toolsCalled: [
          {
            toolName: tool.name,
            input: (input as any) || {},
            output: (output as any) || {},
            durationMs,
            success,
            error: error?.message,
          },
        ],
        reasoning: `Tool '${tool.name}' ${success ? 'completed successfully' : 'failed or was denied'}.`,
        durationMs,
        status: success ? 'SUCCESS' : 'FAILED',
        error,
      });
    } catch (err) {
      logger.warn(`Could not log AgentExecution for ${tool.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}

export const toolRegistry = new ToolRegistry();
