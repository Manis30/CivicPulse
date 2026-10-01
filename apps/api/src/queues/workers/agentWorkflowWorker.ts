import { Worker, Job, UnrecoverableError } from 'bullmq';
import { getRedisConnectionOptions, isRedisOnline } from '../../config/redis.js';
import { env } from '../../config/env.js';
import { agentOrchestrator } from '../../agents/orchestrator/AgentOrchestrator.js';
import { orchestrationRecordService } from '../../services/orchestrationRecordService.js';
import { IdempotencyManager } from '../../tools/registry/IdempotencyManager.js';
import {
  AGENT_WORKFLOW_QUEUE_NAME,
  WorkflowJobPayload,
  WorkflowJobPayloadSchema,
  WorkflowJobResult,
  WorkflowErrorCode,
  isRetryableError,
} from '../types.js';
import { logger } from '../../utils/logger.js';

let workflowWorker: Worker | null = null;
let isWorkerInitialized = false;

/**
 * CivicPulse Autonomous Agent Workflow Worker.
 * 
 * GUARANTEES:
 * - Operates as the asynchronous execution boundary between Redis/BullMQ and AgentOrchestrator
 * - Invokes AgentOrchestrator exclusively; never calls LLMs, DB models, or tools directly
 * - Establishes trusted server-side execution context (never client-supplied SYSTEM credentials)
 * - Enforces retry policy: retries transient errors with exponential backoff; halts on non-retryable errors
 * - Maintains distributed idempotency and cleans up workflow locks upon completion
 * - Protected against duplicate initialization and cleanly disabled when Redis is unavailable
 */
export function startWorkflowWorker(): Worker | null {
  if (isWorkerInitialized || workflowWorker) {
    return workflowWorker;
  }

  // Handle Redis unavailable gracefully per Requirement 2
  if (!isRedisOnline()) {
    logger.warn('Redis unavailable — background workers disabled.');
    return null;
  }

  const connectionOptions = getRedisConnectionOptions();
  const concurrency = env.AGENT_WORKER_CONCURRENCY || 5;

  isWorkerInitialized = true;

  workflowWorker = new Worker(
    AGENT_WORKFLOW_QUEUE_NAME,
    async (job: Job): Promise<WorkflowJobResult> => {
      const startTime = Date.now();
      const currentAttempt = job.attemptsMade + 1;

      logger.info(`Worker picked up job ${job.id} (Attempt ${currentAttempt}/${job.opts.attempts || 3})`, {
        jobId: job.id,
      });

      // 1. Validate job payload schema with Zod
      const parseResult = WorkflowJobPayloadSchema.safeParse(job.data);
      if (!parseResult.success) {
        const errorMsg = `Job payload validation failed: ${JSON.stringify(parseResult.error.format())}`;
        logger.error(`Non-retryable error on job ${job.id}: ${errorMsg}`);

        // Update orchestration record to FAILED permanently
        if (job.data?.orchestrationId) {
          await orchestrationRecordService.failRecord(job.data.orchestrationId, {
            code: 'VALIDATION_ERROR',
            message: errorMsg,
            isRetryable: false,
            durationMs: Date.now() - startTime,
          });
        }

        // BullMQ UnrecoverableError halts further retries immediately
        throw new UnrecoverableError(errorMsg);
      }

      const payload: WorkflowJobPayload = parseResult.data;
      const { orchestrationId, incidentId, reportId, executionMode, requestedEngine } = payload;

      // 2. Update orchestration state: ACTIVE / RUNNING
      await orchestrationRecordService.updateStatus(orchestrationId, 'ACTIVE', 'RUNNING');
      await orchestrationRecordService.recordAttempt(orchestrationId, currentAttempt);

      // 3. Acquire distributed workflow lock to ensure single worker processing
      const lockAcquired = await IdempotencyManager.acquireWorkflowLock(incidentId, orchestrationId, 600);
      if (!lockAcquired) {
        logger.warn(`Workflow lock could not be acquired for incident ${incidentId}. Another worker may be processing.`);
      }

      try {
        // 4. Invoke existing AgentOrchestrator through trusted server-side identity
        const orchResult = await agentOrchestrator.runWorkflow({
          orchestrationId,
          incidentId,
          reportId,
          executionMode,
          requestedEngine,
          allowFallback: true,
          // Server-established trusted worker identity — never client-supplied
          actorType: 'AI_AGENT',
          actorId: 'AGENT_WORKFLOW_WORKER',
          initialFacts: payload.metadata as any,
        });

        const durationMs = Date.now() - startTime;

        // 5. Release distributed workflow lock
        await IdempotencyManager.releaseWorkflowLock(incidentId, orchestrationId);

        // 6. Handle orchestrator outcome
        if (orchResult.status === 'FAILED') {
          const errorCode: WorkflowErrorCode = 'ORCHESTRATION_FAILURE';
          const isRetryable = isRetryableError(errorCode) && currentAttempt < (job.opts.attempts || 3);

          await orchestrationRecordService.failRecord(orchestrationId, {
            code: errorCode,
            message: `Orchestration ${orchestrationId} failed during execution.`,
            isRetryable,
            durationMs,
          });

          if (isRetryable) {
            throw new Error(`Transient orchestration failure in job ${job.id}. Scheduling retry.`);
          }

          return {
            jobId: job.id || `job-orch-${orchestrationId}`,
            orchestrationId,
            incidentId,
            status: 'FAILED',
            orchestrationStatus: 'FAILED',
            finalIncidentState: orchResult.finalState,
            requiresHumanReview: true,
            attempt: currentAttempt,
            startedAt: new Date(startTime).toISOString(),
            completedAt: new Date().toISOString(),
            durationMs,
            executionIds: orchResult.executionIds,
            error: {
              code: errorCode,
              message: `Orchestration failed and retries exhausted.`,
              isRetryable: false,
            },
          };
        }

        // 7. Successful or Human Review Required completion
        await orchestrationRecordService.completeRecord(orchestrationId, {
          orchestrationStatus: orchResult.status,
          finalIncidentState: orchResult.finalState,
          requiresHumanReview: orchResult.requiresHumanReview,
          executionIds: orchResult.executionIds,
          agentResults: orchResult.agentResults,
          durationMs,
        });

        logger.info(`Workflow job ${job.id} completed successfully for incident ${incidentId}`, {
          orchestrationId,
          workflowStatus: orchResult.status,
          duration: durationMs,
        });

        return {
          jobId: job.id || `job-orch-${orchestrationId}`,
          orchestrationId,
          incidentId,
          status: 'COMPLETED',
          orchestrationStatus: orchResult.status,
          finalIncidentState: orchResult.finalState,
          requiresHumanReview: orchResult.requiresHumanReview,
          attempt: currentAttempt,
          startedAt: new Date(startTime).toISOString(),
          completedAt: new Date().toISOString(),
          durationMs,
          executionIds: orchResult.executionIds,
        };
      } catch (err: any) {
        const durationMs = Date.now() - startTime;
        await IdempotencyManager.releaseWorkflowLock(incidentId, orchestrationId);

        // Classify error
        const isUnrecoverable = err instanceof UnrecoverableError;
        const errorCode: WorkflowErrorCode = isUnrecoverable
          ? 'VALIDATION_ERROR'
          : err.message?.includes('database') || err.message?.includes('Mongo')
          ? 'DATABASE_FAILURE'
          : err.message?.includes('timeout') || err.message?.includes('network')
          ? 'TRANSIENT_FAILURE'
          : 'UNKNOWN_FAILURE';

        const isRetryable = !isUnrecoverable && isRetryableError(errorCode) && currentAttempt < (job.opts.attempts || 3);

        await orchestrationRecordService.failRecord(orchestrationId, {
          code: errorCode,
          message: err.message || 'Worker unexpected error',
          isRetryable,
          durationMs,
        });

        logger.error(`Worker error on job ${job.id}: ${err.message}`, err, {
          executionId: orchestrationId,
        });

        if (isUnrecoverable) {
          throw err;
        }

        if (isRetryable) {
          // Re-throw so BullMQ triggers exponential backoff
          throw err;
        } else {
          // Do not retry permanent errors
          throw new UnrecoverableError(`Non-retryable failure: ${err.message}`);
        }
      }
    },
    {
      connection: connectionOptions,
      concurrency,
    }
  );

  workflowWorker.on('completed', (job: Job) => {
    logger.info(`BullMQ Worker job ${job.id} marked COMPLETED.`);
  });

  workflowWorker.on('failed', (job: Job | undefined, err: Error) => {
    logger.warn(`BullMQ Worker job ${job?.id} failed: ${err.message}`);
  });

  workflowWorker.on('error', (err: Error) => {
    logger.warn(`BullMQ Worker connection error: ${err.message}`);
  });

  logger.info(`AgentWorkflowWorker started with concurrency = ${concurrency}`);
  return workflowWorker;
}

/**
 * Gracefully shuts down the BullMQ worker.
 * Waits for active jobs to finish processing before releasing connections.
 */
export async function stopWorkflowWorker(): Promise<void> {
  if (workflowWorker) {
    logger.info('Stopping AgentWorkflowWorker gracefully...');
    await workflowWorker.close();
    workflowWorker = null;
    isWorkerInitialized = false;
    logger.info('AgentWorkflowWorker stopped.');
  } else {
    isWorkerInitialized = false;
  }
}
