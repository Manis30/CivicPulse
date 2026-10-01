import { AgentId, ExecutionMode, JsonValue } from '@civicpulse/shared';
import { AgentDefinition } from './AgentDefinition.js';
import { AgentContext, createAgentContext } from './AgentContext.js';
import { AgentResult, AgentTraceStep } from './AgentResult.js';
import { AgentRuntimeError } from './AgentRuntimeError.js';
import { enforceExecutionLimits, detectRepeatedToolCall } from './AgentExecutionLimits.js';
import { agentEngineResolver, ResolvedEngineInfo } from '../engines/AgentEngineResolver.js';
import { EngineDecision } from '../engines/AgentEngine.js';
import { getAgentDefinition, isAgentInactive } from '../definitions/index.js';
import { toolRegistry } from '../../tools/registry/ToolRegistry.js';
import { ToolExecutionContext } from '../../tools/registry/ToolExecutionContext.js';
import { agentExecutionService } from '../../services/agentExecutionService.js';
import { logger } from '../../utils/logger.js';

export interface AgentExecutionOptions {
  executionId?: string;
  incidentId?: string;
  reportId?: string;
  executionMode?: ExecutionMode;
  allowFallback?: boolean;
  requestId?: string;
  actorType?: 'AI_AGENT' | 'USER' | 'SYSTEM';
  actorId?: string;
  orchestrationId?: string;
  parentExecutionId?: string;
  sequence?: number;
}

/**
 * Generic Autonomous Agent Execution Runtime.
 * Orchestrates bounded agent reasoning, tool resolution, safe execution via ToolRegistry,
 * context accumulation, loop detection, and immutable execution logging.
 *
 * GUARANTEE: Never imports MongoDB models or repositories directly.
 */
export class AgentRuntime {
  async execute<TInput = unknown, TOutput = unknown>(
    agentDefinitionOrId: AgentDefinition<TInput, TOutput> | AgentId,
    rawInput: TInput,
    options: AgentExecutionOptions = {}
  ): Promise<AgentResult<TOutput>> {
    const startTime = Date.now();
    const trace: AgentTraceStep[] = [];

    // 1. Resolve agent definition
    const definition: AgentDefinition<TInput, TOutput> | undefined =
      typeof agentDefinitionOrId === 'string'
        ? (getAgentDefinition(agentDefinitionOrId) as AgentDefinition<TInput, TOutput>)
        : agentDefinitionOrId;

    if (!definition) {
      const agentIdStr = typeof agentDefinitionOrId === 'string' ? agentDefinitionOrId : 'UNKNOWN';
      const inactive = isAgentInactive(agentIdStr);
      return {
        success: false,
        agentId: agentIdStr as AgentId,
        executionId: options.executionId || `EXEC-ERR-${Date.now()}`,
        executionMode: options.executionMode || 'DETERMINISTIC_ENGINE',
        error: {
          code: inactive ? 'AGENT_INACTIVE' : 'AGENT_NOT_FOUND',
          message: inactive
            ? `Agent '${agentIdStr}' is currently inactive in Phase 4B.`
            : `Agent definition for '${agentIdStr}' could not be resolved.`,
        },
        iterations: 0,
        toolCalls: [],
        durationMs: Date.now() - startTime,
        trace,
      };
    }

    const executionId = options.executionId || `EXEC-${definition.id}-${Date.now()}`;
    const requestedMode = options.executionMode || definition.executionModes[0] || 'DETERMINISTIC_ENGINE';

    // 2. Validate input schema
    const parsedInput = definition.inputSchema.safeParse(rawInput);
    if (!parsedInput.success) {
      return {
        success: false,
        agentId: definition.id,
        executionId,
        executionMode: requestedMode,
        error: {
          code: 'INVALID_AGENT_INPUT',
          message: `Agent input validation failed: ${parsedInput.error.message}`,
          details: parsedInput.error.format(),
        },
        iterations: 0,
        toolCalls: [],
        durationMs: Date.now() - startTime,
        trace,
      };
    }

    // 3. Resolve execution engine
    let resolvedEngineInfo: ResolvedEngineInfo;
    try {
      resolvedEngineInfo = agentEngineResolver.resolve(
        requestedMode,
        definition.executionModes,
        options.allowFallback ?? true
      );
    } catch (err) {
      const runtimeErr =
        err instanceof AgentRuntimeError
          ? err
          : new AgentRuntimeError('ENGINE_FAILURE', String(err));

      return {
        success: false,
        agentId: definition.id,
        executionId,
        executionMode: requestedMode,
        error: {
          code: runtimeErr.code,
          message: runtimeErr.message,
          details: runtimeErr.details,
        },
        iterations: 0,
        toolCalls: [],
        durationMs: Date.now() - startTime,
        trace,
      };
    }

    // 4. Initialize execution context
    const context: AgentContext = createAgentContext({
      executionId,
      agentId: definition.id,
      input: parsedInput.data,
      executionMode: resolvedEngineInfo.actualEngine,
      incidentId: options.incidentId,
      reportId: options.reportId,
      requestedEngine: resolvedEngineInfo.requestedEngine,
      actualEngine: resolvedEngineInfo.actualEngine,
      fallbackReason: resolvedEngineInfo.fallbackReason,
      requestId: options.requestId,
    });

    let finalDecisionSummary = 'Task concluded.';

    // 5. Bounded reasoning loop
    try {
      while (context.iteration <= definition.maxIterations) {
        // Enforce timeout, max iterations, max tool calls, and max context items
        enforceExecutionLimits(context, definition);

        const iterationStart = Date.now();
        const elapsedSoFar = Date.now() - startTime;
        const remainingMs = definition.timeoutMs - elapsedSoFar;
        if (remainingMs <= 0) {
          throw new AgentRuntimeError(
            'AGENT_TIMEOUT',
            `Agent execution timed out after ${elapsedSoFar}ms (limit: ${definition.timeoutMs}ms)`
          );
        }

        let timerId: NodeJS.Timeout | undefined;
        const timeoutPromise = new Promise<never>((_, reject) => {
          timerId = setTimeout(() => {
            reject(
              new AgentRuntimeError(
                'AGENT_TIMEOUT',
                `Agent execution timed out during reasoning (limit: ${definition.timeoutMs}ms)`
              )
            );
          }, remainingMs);
        });

        let decision: EngineDecision;
        try {
          decision = await Promise.race([
            resolvedEngineInfo.engine.execute(context, definition),
            timeoutPromise,
          ]);
        } catch (engineErr) {
          if (
            (options.allowFallback ?? true) &&
            resolvedEngineInfo.actualEngine !== 'DETERMINISTIC_ENGINE'
          ) {
            logger.warn(
              `Engine '${resolvedEngineInfo.actualEngine}' encountered failure for agent '${definition.id}'. Falling back to DETERMINISTIC_ENGINE:`,
              {
                error: engineErr instanceof Error ? engineErr.message : String(engineErr),
              }
            );
            resolvedEngineInfo = agentEngineResolver.resolve(
              'DETERMINISTIC_ENGINE',
              definition.executionModes,
              true
            );
            context.actualEngine = 'DETERMINISTIC_ENGINE';
            context.fallbackReason =
              engineErr instanceof Error ? engineErr.message : String(engineErr);
            (context as any).startedAt = new Date();
            decision = await resolvedEngineInfo.engine.execute(context, definition);
          } else {
            throw engineErr;
          }
        } finally {
          if (timerId) clearTimeout(timerId);
        }

        // Branch A: Engine requests a TOOL CALL
        if (decision.type === 'TOOL_CALL') {
          const toolStart = Date.now();

          // 1. Verify tool exists in allowedTools
          if (!definition.allowedTools.includes(decision.toolName)) {
            throw new AgentRuntimeError(
              'TOOL_NOT_ALLOWED',
              `Agent '${definition.id}' attempted to call tool '${decision.toolName}', which is not in its allowed whitelist.`,
              { toolName: decision.toolName, allowedTools: definition.allowedTools }
            );
          }

          // 2. Loop detection: check consecutive identical tool calls
          if (detectRepeatedToolCall(context.previousToolResults, decision.toolName, decision.input)) {
            throw new AgentRuntimeError(
              'LOOP_LIMIT_REACHED',
              `Agent entered a repetitive loop requesting tool '${decision.toolName}' with identical inputs consecutively.`,
              { toolName: decision.toolName, input: decision.input }
            );
          }

          // 3. Actively enforce maxContextItems before executing tool (User Correction 3)
          if (context.previousToolResults.length >= definition.maxContextItems) {
            throw new AgentRuntimeError(
              'MAX_CONTEXT_ITEMS_REACHED',
              `Cannot execute tool: accumulated context items (${context.previousToolResults.length}) reached limit of ${definition.maxContextItems}.`,
              { currentItems: context.previousToolResults.length, maxContextItems: definition.maxContextItems }
            );
          }

          // 4. Execute tool via Phase 3 ToolRegistry gate
          const toolExecutionContext: ToolExecutionContext = {
            executionId: context.executionId,
            agentId: definition.id,
            incidentId: context.incidentId,
            reportId: context.reportId,
            actorType: options.actorType || 'AI_AGENT',
            actorId: options.actorId || definition.id,
            executionMode: resolvedEngineInfo.actualEngine,
            requestId: context.requestId,
            orchestrationId: options.orchestrationId,
          };

          const toolRes = await toolRegistry.execute(
            decision.toolName,
            decision.input as Record<string, unknown>,
            toolExecutionContext
          );

          const toolDuration = Date.now() - toolStart;

          // Record in context
          if (toolRes.success) {
            context.previousToolResults.push({
              toolName: decision.toolName,
              input: decision.input,
              output: toolRes.data as JsonValue,
              success: true,
              durationMs: toolDuration,
            });

            trace.push({
              iteration: context.iteration,
              decision: 'TOOL_CALL',
              toolName: decision.toolName,
              status: 'SUCCESS',
              durationMs: Date.now() - iterationStart,
            });
          } else {
            // Failure captured as structured context item
            context.previousToolResults.push({
              toolName: decision.toolName,
              input: decision.input,
              output: { error: toolRes.error } as JsonValue,
              success: false,
              durationMs: toolDuration,
              error: toolRes.error?.message,
            });

            trace.push({
              iteration: context.iteration,
              decision: 'TOOL_CALL',
              toolName: decision.toolName,
              status: 'FAILED',
              durationMs: Date.now() - iterationStart,
              error: toolRes.error?.message,
            });
          }

          context.iteration++;
          continue;
        }

        // Branch B: Engine provides FINAL structured decision
        if (decision.type === 'FINAL') {
          enforceExecutionLimits(context, definition);
          finalDecisionSummary = decision.rationaleSummary;

          // Validate final output against agent output schema
          const parsedOutput = definition.outputSchema.safeParse(decision.result);
          if (!parsedOutput.success) {
            throw new AgentRuntimeError(
              'INVALID_AGENT_OUTPUT',
              `Agent final output failed schema validation: ${parsedOutput.error.message}`,
              parsedOutput.error.format()
            );
          }

          trace.push({
            iteration: context.iteration,
            decision: 'FINAL',
            status: 'SUCCESS',
            durationMs: Date.now() - iterationStart,
          });

          const totalDuration = Date.now() - startTime;

          // Persist AgentExecution record (NO hidden chain-of-thought)
          await this.persistExecutionRecord({
            executionId: context.executionId,
            agentId: definition.id,
            agentName: definition.name,
            executionMode: resolvedEngineInfo.actualEngine,
            requestedEngine: resolvedEngineInfo.requestedEngine,
            actualEngine: resolvedEngineInfo.actualEngine,
            fallbackReason: resolvedEngineInfo.fallbackReason,
            orchestrationId: options.orchestrationId,
            parentExecutionId: options.parentExecutionId,
            sequence: options.sequence,
            incidentId: context.incidentId,
            reportId: context.reportId,
            toolsCalled: context.previousToolResults,
            reasoning: finalDecisionSummary,
            iterations: context.iteration,
            durationMs: totalDuration,
            status: 'SUCCESS',
            startedAt: context.startedAt,
            completedAt: new Date(),
          });

          return {
            success: true,
            agentId: definition.id,
            executionId: context.executionId,
            executionMode: resolvedEngineInfo.actualEngine,
            requestedEngine: resolvedEngineInfo.requestedEngine,
            actualEngine: resolvedEngineInfo.actualEngine,
            fallbackReason: resolvedEngineInfo.fallbackReason,
            result: parsedOutput.data,
            iterations: context.iteration,
            toolCalls: context.previousToolResults,
            durationMs: totalDuration,
            trace,
          };
        }

        throw new AgentRuntimeError(
          'INVALID_AGENT_DECISION',
          'Agent engine emitted an unrecognized decision structure.'
        );
      }

      // Loop exceeded max iterations without returning FINAL
      throw new AgentRuntimeError(
        'MAX_ITERATIONS_REACHED',
        `Agent reached maximum allowed iterations (${definition.maxIterations}) without reaching a final decision.`
      );
    } catch (err) {
      const totalDuration = Date.now() - startTime;
      const runtimeErr =
        err instanceof AgentRuntimeError
          ? err
          : new AgentRuntimeError('ENGINE_FAILURE', err instanceof Error ? err.message : String(err));

      // Persist failure record
      await this.persistExecutionRecord({
        executionId: context.executionId,
        agentId: definition.id,
        agentName: definition.name,
        executionMode: resolvedEngineInfo.actualEngine,
        requestedEngine: resolvedEngineInfo.requestedEngine,
        actualEngine: resolvedEngineInfo.actualEngine,
        fallbackReason: resolvedEngineInfo.fallbackReason,
        orchestrationId: options.orchestrationId,
        parentExecutionId: options.parentExecutionId,
        sequence: options.sequence,
        incidentId: context.incidentId,
        reportId: context.reportId,
        toolsCalled: context.previousToolResults,
        reasoning: `Execution terminated with error: ${runtimeErr.message}`,
        iterations: context.iteration,
        durationMs: totalDuration,
        status: 'FAILED',
        error: { code: runtimeErr.code, message: runtimeErr.message },
        startedAt: context.startedAt,
        completedAt: new Date(),
      });

      return {
        success: false,
        agentId: definition.id,
        executionId: context.executionId,
        executionMode: resolvedEngineInfo.actualEngine,
        requestedEngine: resolvedEngineInfo.requestedEngine,
        actualEngine: resolvedEngineInfo.actualEngine,
        fallbackReason: resolvedEngineInfo.fallbackReason,
        error: {
          code: runtimeErr.code,
          message: runtimeErr.message,
          details: runtimeErr.details,
        },
        iterations: context.iteration,
        toolCalls: context.previousToolResults,
        durationMs: totalDuration,
        trace,
      };
    }
  }

  private async persistExecutionRecord(record: {
    executionId: string;
    agentId: AgentId;
    agentName: string;
    executionMode: ExecutionMode;
    requestedEngine?: ExecutionMode;
    actualEngine?: ExecutionMode;
    fallbackReason?: string;
    orchestrationId?: string;
    parentExecutionId?: string;
    sequence?: number;
    incidentId?: string;
    reportId?: string;
    toolsCalled: Array<{
      toolName: string;
      input: JsonValue;
      output: JsonValue;
      durationMs: number;
      success: boolean;
      error?: string;
    }>;
    reasoning: string;
    iterations: number;
    durationMs: number;
    status: 'SUCCESS' | 'FAILED';
    error?: { code: string; message: string };
    startedAt: Date;
    completedAt: Date;
  }): Promise<void> {
    try {
      await agentExecutionService.recordExecution({
        executionId: record.executionId,
        agentId: record.agentId,
        agentName: record.agentName,
        executionMode: record.executionMode,
        requestedEngine: record.requestedEngine,
        actualEngine: record.actualEngine,
        fallbackReason: record.fallbackReason,
        orchestrationId: record.orchestrationId,
        parentExecutionId: record.parentExecutionId,
        sequence: record.sequence,
        incidentId: record.incidentId,
        reportId: record.reportId,
        toolsCalled: record.toolsCalled,
        reasoning: record.reasoning,
        iterations: record.iterations,
        durationMs: record.durationMs,
        status: record.status,
        error: record.error,
        startedAt: record.startedAt,
        completedAt: record.completedAt,
      });
    } catch (err) {
      logger.warn('Failed to record AgentExecution in MongoDB Atlas:', {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}

export const agentRuntime = new AgentRuntime();
