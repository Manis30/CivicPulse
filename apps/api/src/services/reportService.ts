import mongoose from 'mongoose';
import { reportRepository, ReportFilterOptions } from '../repositories/reportRepository.js';
import { IReport, ReportSource } from '../models/Report.js';
import { PaginationParams, PaginatedResult } from '../repositories/baseRepository.js';
import { IncidentCategory } from '@civicpulse/shared';
import { auditLogRepository } from '../repositories/auditLogRepository.js';
import { incidentService } from './incidentService.js';
import { incidentEventBus } from './incidentEventBus.js';
import { isRedisOnline } from '../config/redis.js';
import { enqueueWorkflowJob } from '../queues/agentWorkflowQueue.js';
import { agentOrchestrator } from '../agents/orchestrator/AgentOrchestrator.js';
import { EvidenceModel } from '../models/Evidence.js';
import { UserModel } from '../models/User.js';
import { orchestrationRecordService } from './orchestrationRecordService.js';
import { logger } from '../utils/logger.js';

export interface SubmitReportInput {
  reporterId?: string;
  description: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
  };
  categoryHint?: IncidentCategory;
  evidenceIds?: string[];
  source?: ReportSource;
}

export type SubmitReportResult = IReport & {
  report: IReport;
  incident: any;
  incidentId: string;
};

export class ReportService {
  async submitReport(input: SubmitReportInput): Promise<SubmitReportResult> {
    // 1. Resolve reporter ID (authenticated user, or fallback to first citizen user)
    let reporterId = input.reporterId;
    if (!reporterId || !mongoose.Types.ObjectId.isValid(reporterId)) {
      const defaultUser = await UserModel.findOne({ role: 'CITIZEN' });
      reporterId = defaultUser ? defaultUser._id.toString() : new mongoose.Types.ObjectId().toString();
    }

    // 2. Persist Report document
    const report = await reportRepository.create({
      reporterId: new mongoose.Types.ObjectId(reporterId),
      description: input.description,
      location: input.location,
      categoryHint: input.categoryHint || 'OTHER',
      evidenceIds: (input.evidenceIds || [])
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id)),
      source: input.source || 'WEB_PORTAL',
      status: 'SUBMITTED',
      submittedAt: new Date(),
    });

    await auditLogRepository.append({
      actorType: 'USER',
      actorId: reporterId,
      action: 'REPORT_SUBMITTED',
      resourceType: 'REPORT',
      resourceId: report.id,
      after: {
        categoryHint: input.categoryHint,
        coordinates: input.location.coordinates,
      },
    });

    // 3. Create Incident in SUBMITTED state (Phase 4 & Phase 19)
    const category = input.categoryHint || 'POTHOLE';
    const incident = await incidentService.createIncident(
      {
        category,
        description: input.description,
        location: {
          type: 'Point',
          coordinates: input.location.coordinates,
          address: input.location.address || 'Bagalur Road, Near Central Bus Stand',
        },
        ward: 'Ward 12 - Central Hosur',
        zone: 'Zone Alpha (Urban Core)',
        primaryReportId: report._id.toString(),
        evidenceIds: input.evidenceIds,
        reporterId,
      },
      {
        actorType: 'CITIZEN',
        actorId: reporterId,
      }
    );

    // Link report back to incident
    report.incidentId = incident._id as mongoose.Types.ObjectId;
    await report.save();

    // Link all uploaded evidence records to this incident and report
    if (input.evidenceIds && input.evidenceIds.length > 0) {
      const validEvidenceObjIds = input.evidenceIds
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      if (validEvidenceObjIds.length > 0) {
        await EvidenceModel.updateMany(
          { _id: { $in: validEvidenceObjIds } },
          {
            incidentId: incident._id as mongoose.Types.ObjectId,
            reportId: report._id as mongoose.Types.ObjectId,
          }
        );
      }
    }

    // 4. Resolve evidence URL for vision agent
    let imageUrl = 'https://images.civicpulse.org/pothole-default.jpg';
    if (input.evidenceIds && input.evidenceIds.length > 0) {
      const ev = await EvidenceModel.findById(input.evidenceIds[0]);
      if (ev && ev.fileUrl) {
        imageUrl = ev.fileUrl;
      }
    }

    const orchestrationId = `ORCH-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const initialFacts = {
      imageUrl,
      description: report.description,
      latitude: report.location.coordinates[1],
      longitude: report.location.coordinates[0],
      address: report.location.address || 'Bagalur Road, Near Central Bus Stand',
      categoryHint: category,
      ward: 'Ward 12 - Central Hosur',
      zone: 'Zone Alpha (Urban Core)',
    };

    // 5. Enqueue autonomous multi-agent pipeline into BullMQ (Phase 1, 4, 18)
    if (isRedisOnline()) {
      try {
        const deterministicJobId = `job-orch-${orchestrationId}`;
        await orchestrationRecordService.createRecord({
          orchestrationId,
          incidentId: incident._id.toString(),
          reportId: report._id.toString(),
          jobId: deterministicJobId,
          executionMode: 'GEMINI_AI',
          metadata: initialFacts,
        });

        await enqueueWorkflowJob(
          {
            orchestrationId,
            incidentId: incident._id.toString(),
            reportId: report._id.toString(),
            executionMode: 'GEMINI_AI',
            requestedAt: new Date().toISOString(),
            metadata: initialFacts,
          },
          { jobId: deterministicJobId }
        );
        logger.info(`Autonomous multi-agent workflow enqueued in BullMQ for incident ${incident.incidentNumber}`);
      } catch (queueErr) {
        logger.warn('BullMQ enqueue error, executing async workflow directly:', { error: String(queueErr) });
        setTimeout(() => {
          agentOrchestrator.runWorkflow({
            incidentId: incident._id.toString(),
            reportId: report._id.toString(),
            executionMode: 'GEMINI_AI',
            allowFallback: true,
            initialFacts,
          }).catch((err) => logger.error('Async workflow execution error:', { error: String(err) }));
        }, 50);
      }
    } else {
      // Execute asynchronously in background without blocking response
      logger.info(`Redis offline: executing multi-agent pipeline asynchronously for incident ${incident.incidentNumber}`);
      setTimeout(() => {
        agentOrchestrator.runWorkflow({
          incidentId: incident._id.toString(),
          reportId: report._id.toString(),
          executionMode: 'DETERMINISTIC_ENGINE',
          allowFallback: true,
          initialFacts,
        }).catch((err) => logger.error('Async workflow execution error:', { error: String(err) }));
      }, 50);
    }

    // 6. Broadcast real-time SSE event
    incidentEventBus.emitIncidentEvent('INCIDENT_CREATED', incident, {
      reportId: report._id.toString(),
      source: report.source,
    });

    return Object.assign(report, {
      report,
      incident,
      incidentId: incident.incidentNumber || incident.id,
    });
  }

  async getReportById(id: string): Promise<IReport | null> {
    return reportRepository.findById(id);
  }

  async listReports(
    filters: ReportFilterOptions,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<IReport>> {
    return reportRepository.findWithPagination(filters, pagination);
  }

  async findNearbyReports(
    coordinates: [number, number],
    maxDistanceMeters = 300,
    categoryHint?: IncidentCategory
  ): Promise<IReport[]> {
    return reportRepository.findReportsNearPoint(coordinates, maxDistanceMeters, categoryHint);
  }

  async linkReportToIncident(reportId: string, incidentId: string): Promise<IReport | null> {
    return reportRepository.linkToIncident(reportId, incidentId);
  }
}

export const reportService = new ReportService();
