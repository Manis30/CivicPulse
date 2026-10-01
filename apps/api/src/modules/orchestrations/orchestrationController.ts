import { Request, Response } from 'express';
import { z } from 'zod';
import { ExecutionMode } from '@civicpulse/shared';
import { agentOrchestrator } from '../../agents/orchestrator/AgentOrchestrator.js';
import { orchestrationRecordService } from '../../services/orchestrationRecordService.js';
import { enqueueWorkflowJob, getWorkflowJob } from '../../queues/agentWorkflowQueue.js';
import { IdempotencyManager } from '../../tools/registry/IdempotencyManager.js';
import { incidentService } from '../../services/incidentService.js';
import { reportService } from '../../services/reportService.js';
import { evidenceService } from '../../services/evidenceService.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

const RunOrchestrationSchema = z.object({
  reportId: z.string().optional(),
  executionMode: z.enum(['GEMINI_AI', 'GROQ_LLM', 'DETERMINISTIC_ENGINE']).optional(),
  requestedEngine: z.string().optional(),
  sync: z.boolean().optional(),
});

export class OrchestrationController {
  /**
   * Asynchronous multi-agent orchestration execution endpoint.
   * POST /api/orchestrations/incidents/:incidentId/run
   * 
   * Phase 4C Architecture:
   * Validates request -> creates orchestration record -> enqueues BullMQ job -> returns job information.
   * Does NOT block HTTP request during 5-agent execution unless explicitly requested via sync=true.
   */
  async runIncidentOrchestration(req: Request, res: Response): Promise<void> {
    const { incidentId } = req.params;

    // 1. Zod input validation
    const parsedBody = RunOrchestrationSchema.safeParse(req.body || {});
    if (!parsedBody.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ORCHESTRATION_REQUEST',
          message: 'Request validation failed',
          details: parsedBody.error.format(),
        },
      });
      return;
    }

    // 2. Enforce strict authorization
    const isDevelopment = (process.env.NODE_ENV || env.NODE_ENV) === 'development';
    const devHeader = req.headers['x-dev-internal'] === 'true';

    if (!isDevelopment) {
      const user = (req as any).user;
      if (!user || (user.role !== 'PLATFORM_ADMIN' && user.role !== 'SYSTEM')) {
        res.status(403).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED_ORCHESTRATION_ACCESS',
            message: 'Orchestration execution is restricted to internal SYSTEM processes or PLATFORM_ADMIN in production.',
          },
        });
        return;
      }
    } else {
      const user = (req as any).user;
      const isAdminOrSystem = user && (user.role === 'PLATFORM_ADMIN' || user.role === 'SYSTEM' || user.role === 'DEPARTMENT_MANAGER');
      if (!devHeader && !isAdminOrSystem) {
        res.status(403).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED_ORCHESTRATION_ACCESS',
            message: 'Direct orchestration execution requires development authorization header (x-dev-internal: true) or administrative credentials.',
          },
        });
        return;
      }
    }

    // 3. Resolve target incident
    const incident = await incidentService.getIncidentById(incidentId);
    if (!incident) {
      res.status(404).json({
        success: false,
        error: {
          code: 'INCIDENT_NOT_FOUND',
          message: `Target incident '${incidentId}' not found.`,
        },
      });
      return;
    }

    // 4. Initial status transition SUBMITTED -> ANALYZING if needed
    if (incident.status === 'SUBMITTED') {
      try {
        await incidentService.updateIncidentStatus(
          incident.id,
          'ANALYZING',
          { actorType: 'SYSTEM' },
          'Autonomous multi-agent workflow started'
        );
      } catch (statusErr) {
        logger.warn(`Could not transition incident ${incident.id} to ANALYZING: ${statusErr}`);
      }
    }

    // 5. Gather initial evidence & facts
    let imageUrl = 'https://images.civicpulse.org/pothole-default.jpg';
    const reportId = parsedBody.data.reportId || (incident.reportIds?.[0] ? String(incident.reportIds[0]) : undefined);

    if (reportId) {
      const report = await reportService.getReportById(reportId);
      if (report?.evidenceIds?.[0]) {
        const evidenceId = String(report.evidenceIds[0]);
        const evidence = await evidenceService.getEvidenceById(evidenceId);
        if (evidence?.fileUrl) {
          imageUrl = evidence.fileUrl;
        }
      }
    } else if (incident.evidenceIds?.[0]) {
      const evidenceId = String(incident.evidenceIds[0]);
      const evidence = await evidenceService.getEvidenceById(evidenceId);
      if (evidence?.fileUrl) {
        imageUrl = evidence.fileUrl;
      }
    }

    const executionMode: ExecutionMode = parsedBody.data.executionMode || 'DETERMINISTIC_ENGINE';
    const orchestrationId = `ORCH-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const initialFacts = {
      imageUrl,
      description: incident.description,
      latitude: incident.location.coordinates[1],
      longitude: incident.location.coordinates[0],
      address: incident.location.address,
      ward: incident.ward,
      zone: incident.zone,
      categoryHint: incident.category,
      isNearCriticalInfrastructure: incident.location.nearbyLandmarks?.some((l) =>
        ['hospital', 'transit', 'school', 'arterial'].some((k) => l.toLowerCase().includes(k))
      ),
    };

    // 6. Optional Synchronous Execution (for testing or direct synchronous requirements)
    if (parsedBody.data.sync === true) {
      const result = await agentOrchestrator.runWorkflow({
        incidentId: incident.id,
        reportId,
        executionMode,
        requestedEngine: parsedBody.data.requestedEngine,
        actorType: (req as any).user?.role === 'PLATFORM_ADMIN' ? 'USER' : 'AI_AGENT',
        actorId: (req as any).user?.id || 'ORCHESTRATOR',
        initialFacts,
      });

      res.status(200).json({
        success: true,
        orchestrationId: result.orchestrationId,
        status: result.status,
        incidentId: result.incidentId,
        agentResults: result.agentResults,
        finalState: result.finalState,
        requiresHumanReview: result.requiresHumanReview,
        executionIds: result.executionIds,
      });
      return;
    }

    // 7. Phase 4C Default Path: Asynchronous Queue-Backed Worker Dispatch
    const isAlreadyRunning = await IdempotencyManager.isWorkflowActive(incident.id);
    if (isAlreadyRunning) {
      const latestRecord = await orchestrationRecordService.getLatestRecordForIncident(incident.id);
      if (latestRecord && (latestRecord.jobStatus === 'ACTIVE' || latestRecord.jobStatus === 'QUEUED')) {
        res.status(409).json({
          success: false,
          error: {
            code: 'CONFLICT',
            message: `A workflow is already active or queued for incident '${incident.id}'.`,
            activeOrchestrationId: latestRecord.orchestrationId,
            jobId: latestRecord.jobId,
            status: latestRecord.jobStatus,
          },
        });
        return;
      }
    }

    const deterministicJobId = `job-orch-${orchestrationId}`;

    // 8. Create persistent MongoDB OrchestrationRecord
    await orchestrationRecordService.createRecord({
      orchestrationId,
      incidentId: incident.id,
      reportId,
      jobId: deterministicJobId,
      executionMode,
      requestedEngine: parsedBody.data.requestedEngine,
      metadata: initialFacts,
    });

    // 9. Enqueue into BullMQ Queue
    const job = await enqueueWorkflowJob(
      {
        orchestrationId,
        incidentId: incident.id,
        reportId,
        executionMode,
        requestedEngine: parsedBody.data.requestedEngine,
        requestedAt: new Date().toISOString(),
        metadata: initialFacts,
      },
      { jobId: deterministicJobId }
    );

    // 10. Return job metadata immediately (Non-blocking response)
    res.status(200).json({
      success: true,
      jobId: job.id,
      orchestrationId,
      status: 'QUEUED',
      incidentId: incident.id,
    });
  }

  /**
   * Retrieves status of an asynchronous orchestration.
   * GET /api/orchestrations/:orchestrationId
   */
  async getOrchestrationStatus(req: Request, res: Response): Promise<void> {
    const { orchestrationId } = req.params;

    const record = await orchestrationRecordService.getRecordByOrchestrationId(orchestrationId);
    if (!record) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Orchestration '${orchestrationId}' not found.`,
        },
      });
      return;
    }

    // Optionally inspect BullMQ job status
    let queueState: string | undefined;
    try {
      const job = await getWorkflowJob(record.jobId);
      if (job) {
        queueState = await job.getState();
      }
    } catch {
      // Redis unavailable or job cleaned up: rely on persistent MongoDB record
    }

    res.status(200).json({
      success: true,
      orchestrationId: record.orchestrationId,
      incidentId: record.incidentId,
      reportId: record.reportId,
      status: record.workflowStatus,
      jobStatus: record.jobStatus,
      queueState,
      currentAgent: record.currentAgent,
      jobId: record.jobId,
      executionMode: record.executionMode,
      attempts: record.attempts,
      startedAt: record.startedAt ? record.startedAt.toISOString() : undefined,
      completedAt: record.completedAt ? record.completedAt.toISOString() : undefined,
      durationMs: record.durationMs,
      executionIds: record.executionIds,
      finalIncidentState: record.finalIncidentState,
      requiresHumanReview: record.requiresHumanReview,
      failure: record.failure,
      createdAt: record.createdAt.toISOString(),
    });
  }

  /**
   * Retrieves status of a job directly by BullMQ jobId.
   * GET /api/orchestrations/jobs/:jobId
   */
  async getJobStatus(req: Request, res: Response): Promise<void> {
    const { jobId } = req.params;

    const record = await orchestrationRecordService.getRecordByJobId(jobId);
    if (!record) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Job '${jobId}' not found.`,
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      jobId: record.jobId,
      orchestrationId: record.orchestrationId,
      incidentId: record.incidentId,
      status: record.jobStatus,
      workflowStatus: record.workflowStatus,
      attempts: record.attempts,
      startedAt: record.startedAt,
      completedAt: record.completedAt,
      durationMs: record.durationMs,
      failure: record.failure,
    });
  }
}

export const orchestrationController = new OrchestrationController();
