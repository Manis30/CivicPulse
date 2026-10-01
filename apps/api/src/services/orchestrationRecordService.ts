import { OrchestrationRecordModel, IOrchestrationRecord } from '../models/OrchestrationRecord.js';
import { ExecutionMode, IncidentStatus, OrchestrationStatus } from '@civicpulse/shared';
import { WorkflowErrorCode, WorkflowJobStatus } from '../queues/types.js';
import { logger } from '../utils/logger.js';

export interface CreateRecordParams {
  orchestrationId: string;
  incidentId: string;
  reportId?: string;
  jobId: string;
  executionMode: ExecutionMode;
  requestedEngine?: string;
  metadata?: Record<string, unknown>;
}

export interface CompleteRecordParams {
  orchestrationStatus: OrchestrationStatus;
  finalIncidentState: IncidentStatus;
  requiresHumanReview: boolean;
  executionIds: string[];
  agentResults: Record<string, unknown>;
  durationMs: number;
}

export interface FailRecordParams {
  code: WorkflowErrorCode;
  message: string;
  isRetryable: boolean;
  details?: unknown;
  durationMs?: number;
}

export class OrchestrationRecordService {
  /**
   * Initializes a persistent orchestration record in PENDING / QUEUED state.
   */
  async createRecord(params: CreateRecordParams): Promise<IOrchestrationRecord> {
    const record = await OrchestrationRecordModel.create({
      orchestrationId: params.orchestrationId,
      incidentId: params.incidentId,
      reportId: params.reportId,
      jobId: params.jobId,
      workflowStatus: 'PENDING',
      jobStatus: 'QUEUED',
      executionMode: params.executionMode,
      requestedEngine: params.requestedEngine,
      attempts: 0,
      maxAttempts: 3,
      metadata: params.metadata || {},
    });

    logger.info(`OrchestrationRecord created for ${params.orchestrationId}`, {
      orchestrationId: params.orchestrationId,
      incidentId: params.incidentId,
      jobId: params.jobId,
    });

    return record;
  }

  /**
   * Updates job status and workflow status as execution progresses.
   */
  async updateStatus(
    orchestrationId: string,
    jobStatus: WorkflowJobStatus,
    workflowStatus?: OrchestrationStatus,
    currentAgent?: string
  ): Promise<IOrchestrationRecord | null> {
    const update: any = { jobStatus };
    if (workflowStatus) {
      update.workflowStatus = workflowStatus;
    }
    if (currentAgent !== undefined) {
      update.currentAgent = currentAgent;
    }
    if (jobStatus === 'ACTIVE') {
      update.startedAt = new Date();
    }

    return OrchestrationRecordModel.findOneAndUpdate(
      { orchestrationId },
      { $set: update },
      { new: true }
    );
  }

  /**
   * Increments the attempt counter for the orchestration job.
   */
  async recordAttempt(orchestrationId: string, attempt: number): Promise<void> {
    await OrchestrationRecordModel.updateOne(
      { orchestrationId },
      { $set: { attempts: attempt } }
    );
  }

  /**
   * Finalizes the record upon successful workflow execution.
   */
  async completeRecord(
    orchestrationId: string,
    params: CompleteRecordParams
  ): Promise<IOrchestrationRecord | null> {
    return OrchestrationRecordModel.findOneAndUpdate(
      { orchestrationId },
      {
        $set: {
          jobStatus: 'COMPLETED',
          workflowStatus: params.orchestrationStatus,
          finalIncidentState: params.finalIncidentState,
          requiresHumanReview: params.requiresHumanReview,
          executionIds: params.executionIds,
          agentResults: params.agentResults,
          durationMs: params.durationMs,
          completedAt: new Date(),
          currentAgent: undefined,
        },
      },
      { new: true }
    );
  }

  /**
   * Finalizes or updates the record when a failure occurs.
   */
  async failRecord(
    orchestrationId: string,
    params: FailRecordParams
  ): Promise<IOrchestrationRecord | null> {
    const jobStatus: WorkflowJobStatus = params.isRetryable ? 'RETRYING' : 'FAILED';
    const workflowStatus: OrchestrationStatus = 'FAILED';

    return OrchestrationRecordModel.findOneAndUpdate(
      { orchestrationId },
      {
        $set: {
          jobStatus,
          workflowStatus,
          failure: {
            code: params.code,
            message: params.message,
            isRetryable: params.isRetryable,
            details: params.details,
          },
          durationMs: params.durationMs,
          completedAt: !params.isRetryable ? new Date() : undefined,
        },
      },
      { new: true }
    );
  }

  /**
   * Retrieves an orchestration record by orchestrationId.
   */
  async getRecordByOrchestrationId(orchestrationId: string): Promise<IOrchestrationRecord | null> {
    return OrchestrationRecordModel.findOne({ orchestrationId });
  }

  /**
   * Retrieves an orchestration record by BullMQ jobId.
   */
  async getRecordByJobId(jobId: string): Promise<IOrchestrationRecord | null> {
    return OrchestrationRecordModel.findOne({ jobId });
  }

  /**
   * Finds the latest orchestration for an incident.
   */
  async getLatestRecordForIncident(incidentId: string): Promise<IOrchestrationRecord | null> {
    return OrchestrationRecordModel.findOne({ incidentId }).sort({ createdAt: -1 });
  }
}

export const orchestrationRecordService = new OrchestrationRecordService();
