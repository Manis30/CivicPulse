import { Queue, JobsOptions, Job } from 'bullmq';
import { getRedisConnectionOptions, isRedisOnline } from '../config/redis.js';
import {
  AGENT_WORKFLOW_QUEUE_NAME,
  WorkflowJobPayload,
  WorkflowJobResult,
} from './types.js';
import { logger } from '../utils/logger.js';

let workflowQueue: Queue | null = null;

/**
 * Returns the singleton BullMQ Queue instance for CivicPulse agent workflows.
 * Configured with centralized Redis connection options, exponential backoff, and sensible retention.
 * Returns null if Redis is offline.
 */
export function getWorkflowQueue(): Queue | null {
  if (!isRedisOnline()) {
    return null;
  }

  if (!workflowQueue) {
    const connectionOptions = getRedisConnectionOptions();

    workflowQueue = new Queue(
      AGENT_WORKFLOW_QUEUE_NAME,
      {
        connection: connectionOptions,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000, // 2s, 4s, 8s exponential backoff
          },
          removeOnComplete: {
            count: 1000, // Keep last 1000 completed jobs in Redis for operational inspection
            age: 24 * 3600, // 24 hours
          },
          removeOnFail: {
            count: 5000, // Keep last 5000 failed jobs for audit & troubleshooting
            age: 7 * 24 * 3600, // 7 days
          },
        },
      }
    );

    workflowQueue.on('error', (err) => {
      logger.warn(`Workflow queue error: ${err.message}`);
    });

    logger.info(`BullMQ Queue initialized: ${AGENT_WORKFLOW_QUEUE_NAME}`);
  }

  return workflowQueue;
}

/**
 * Enqueues a validated workflow payload into BullMQ with deterministic jobId to prevent duplicates.
 */
export async function enqueueWorkflowJob(
  payload: WorkflowJobPayload,
  options?: JobsOptions
): Promise<Job<WorkflowJobPayload, WorkflowJobResult>> {
  if (!isRedisOnline()) {
    throw new Error('Background queue unavailable: Redis is offline. Enable Redis or execute workflow synchronously with sync=true.');
  }

  const queue = getWorkflowQueue();
  if (!queue) {
    throw new Error('BullMQ queue is not initialized (Redis offline).');
  }

  // Deterministic Job ID based on orchestrationId prevents duplicate active jobs in BullMQ
  const jobId = options?.jobId || `job-orch-${payload.orchestrationId}`;

  const job = (await queue.add(
    'run-agent-workflow',
    payload,
    {
      jobId,
      ...options,
    }
  )) as unknown as Job<WorkflowJobPayload, WorkflowJobResult>;

  logger.info(`Workflow job ${job.id} enqueued for incident ${payload.incidentId} (orch: ${payload.orchestrationId})`, {
    jobId: job.id,
    orchestrationId: payload.orchestrationId,
    incidentId: payload.incidentId,
  });

  return job;
}

/**
 * Retrieves a job by ID from the BullMQ queue.
 */
export async function getWorkflowJob(
  jobId: string
): Promise<Job<WorkflowJobPayload, WorkflowJobResult> | undefined> {
  const queue = getWorkflowQueue();
  if (!queue) return undefined;
  const job = await queue.getJob(jobId);
  return job as unknown as Job<WorkflowJobPayload, WorkflowJobResult> | undefined;
}

/**
 * Closes the BullMQ queue cleanly during worker/server shutdown.
 */
export async function closeWorkflowQueue(): Promise<void> {
  if (workflowQueue) {
    logger.info(`Closing BullMQ queue: ${AGENT_WORKFLOW_QUEUE_NAME}...`);
    await workflowQueue.close();
    workflowQueue = null;
    logger.info('BullMQ queue closed successfully.');
  }
}
