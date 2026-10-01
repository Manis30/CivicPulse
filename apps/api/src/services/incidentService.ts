import mongoose from 'mongoose';
import {
  incidentRepository,
  IncidentFilterOptions,
} from '../repositories/incidentRepository.js';
import { incidentEventRepository } from '../repositories/incidentEventRepository.js';
import { auditLogRepository } from '../repositories/auditLogRepository.js';
import { reportRepository } from '../repositories/reportRepository.js';
import {
  IIncident,
  IncidentModel,
  IVerificationResult,
  isValidTransition,
} from '../models/Incident.js';
import { PaginationParams, PaginatedResult } from '../repositories/baseRepository.js';
import {
  IncidentCategory,
  IncidentStatus,
  SeverityLevel,
} from '@civicpulse/shared';
import { logger } from '../utils/logger.js';
import { incidentEventBus } from './incidentEventBus.js';
import { cacheService } from './cacheService.js';

export interface CreateIncidentInput {
  category: IncidentCategory;
  description: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address: string;
    nearbyLandmarks?: string[];
  };
  ward: string;
  zone: string;
  severity?: SeverityLevel;
  primaryReportId?: string;
  evidenceIds?: string[];
  departmentId?: string;
  targetHours?: number;
  reporterId?: string;
}

export class IncidentService {
  async createIncident(
    input: CreateIncidentInput,
    actor: { actorType: 'CITIZEN' | 'FIELD_OFFICER' | 'DEPARTMENT_MANAGER' | 'PLATFORM_ADMIN' | 'AI_AGENT' | 'SYSTEM'; actorId?: string } = {
      actorType: 'SYSTEM',
    }
  ): Promise<IIncident> {
    // Robust unique incident number generation
    const highestIncident = await IncidentModel.findOne(
      { incidentNumber: /^INC-2026-\d+$/ },
      { incidentNumber: 1 }
    ).sort({ incidentNumber: -1 });

    let nextSeq = 1001;
    if (highestIncident && highestIncident.incidentNumber) {
      const match = highestIncident.incidentNumber.match(/^INC-2026-(\d+)$/);
      if (match) {
        nextSeq = Math.max(nextSeq, parseInt(match[1], 10) + 1);
      }
    }

    let incidentNumber = `INC-2026-${nextSeq}`;
    while (await IncidentModel.exists({ incidentNumber })) {
      nextSeq++;
      incidentNumber = `INC-2026-${nextSeq}`;
    }

    const severity = input.severity || 'MEDIUM';
    const defaultSlaHours: Record<SeverityLevel, number> = {
      LOW: 72,
      MEDIUM: 48,
      HIGH: 24,
      CRITICAL: 4,
    };
    const targetHours = input.targetHours || defaultSlaHours[severity];
    const deadline = new Date(Date.now() + targetHours * 3600 * 1000);

    const reportIds: mongoose.Types.ObjectId[] = [];
    if (input.primaryReportId && mongoose.Types.ObjectId.isValid(input.primaryReportId)) {
      reportIds.push(new mongoose.Types.ObjectId(input.primaryReportId));
    }

    const evidenceIds: mongoose.Types.ObjectId[] = (input.evidenceIds || [])
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    const effectiveReporterId = input.reporterId || actor.actorId;

    // Note on Transaction Strategy:
    // When MongoDB is running as a replica set, this sequence can be wrapped in a session transaction.
    // In standalone local development instances, we execute sequential writes with rollbacks.
    const incident = await incidentRepository.create({
      incidentNumber,
      category: input.category,
      description: input.description,
      location: input.location,
      ward: input.ward,
      zone: input.zone,
      severity,
      status: 'SUBMITTED',
      reportIds,
      evidenceIds,
      reporterId: effectiveReporterId && mongoose.Types.ObjectId.isValid(effectiveReporterId)
        ? new mongoose.Types.ObjectId(effectiveReporterId)
        : undefined,
      departmentId: input.departmentId ? new mongoose.Types.ObjectId(input.departmentId) : undefined,
      sla: {
        targetHours,
        deadline,
        isOverdue: false,
        escalated: false,
      },
      operationalFlags: severity === 'CRITICAL' ? ['ATTENTION_REQUIRED'] : [],
      firstReportedAt: new Date(),
      lastReportedAt: new Date(),
      reopenCount: 0,
    });

    // Link report if provided
    if (input.primaryReportId) {
      await reportRepository.linkToIncident(input.primaryReportId, incident.id);
    }

    // Link uploaded evidence to this incident
    if (evidenceIds.length > 0 && mongoose.models.Evidence) {
      await mongoose.models.Evidence.updateMany(
        { _id: { $in: evidenceIds } },
        { incidentId: incident._id as mongoose.Types.ObjectId }
      );
    }

    // Create initial timeline event
    await incidentEventRepository.create({
      incidentId: incident._id as mongoose.Types.ObjectId,
      type: 'INCIDENT_CREATED',
      actorType: actor.actorType,
      actorId: actor.actorId,
      toStatus: 'SUBMITTED',
      description: `Incident ${incidentNumber} created with initial category ${input.category} and severity ${severity}`,
      metadata: {
        ward: input.ward,
        coordinates: input.location.coordinates,
      },
      timestamp: new Date(),
    });

    // Append to audit log
    await auditLogRepository.append({
      actorType: actor.actorType === 'AI_AGENT' ? 'AI_AGENT' : actor.actorType === 'SYSTEM' ? 'SYSTEM' : 'USER',
      actorId: actor.actorId,
      action: 'INCIDENT_CREATED',
      resourceType: 'INCIDENT',
      resourceId: incident.id,
      after: {
        incidentNumber,
        category: input.category,
        severity,
        status: 'SUBMITTED',
      },
    });

    logger.info(`Incident created: ${incidentNumber}`, {
      incidentId: incident.id,
      incidentNumber,
      ward: input.ward,
    });

    incidentEventBus.emitIncidentEvent('INCIDENT_CREATED', incident);
    cacheService.invalidateIncident(incident._id.toString(), incident.incidentNumber).catch(() => {});

    return incident;
  }

  async getIncidentById(id: string): Promise<IIncident | null> {
    return cacheService.wrap(`incident:${id}:detail`, 60, async () => {
      return incidentRepository.findById(id);
    });
  }

  async listIncidents(
    filters: IncidentFilterOptions,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<IIncident>> {
    return incidentRepository.findWithPagination(filters, pagination);
  }

  async findNearbyIncidents(
    coordinates: [number, number],
    radiusMeters = 500,
    filters?: {
      category?: IncidentCategory;
      status?: IncidentStatus;
      severity?: SeverityLevel;
      excludeId?: string;
    }
  ): Promise<IIncident[]> {
    return incidentRepository.findIncidentsNearPoint(coordinates, radiusMeters, filters);
  }

  async getIncidentTimeline(incidentId: string) {
    const events = await incidentEventRepository.findByIncidentId(incidentId);
    let teamName = 'Road Maintenance Team';
    try {
      const inc = await incidentRepository.findById(incidentId);
      if (inc?.teamId && (inc.teamId as any).name) {
        teamName = (inc.teamId as any).name;
      }
    } catch {
      // fallback
    }
    return (events || []).map((evt: any) => {
      const obj = evt.toObject ? evt.toObject() : { ...evt };
      if (typeof obj.description === 'string') {
        obj.description = obj.description.replace(
          /Team\s+[0-9a-fA-F]{24}\s+assigned\s+to\s+incident/i,
          `${teamName} assigned to incident`
        );
      }
      return obj;
    });
  }

  async updateIncidentStatus(
    id: string,
    newStatus: IncidentStatus,
    actor: { actorType: 'CITIZEN' | 'FIELD_OFFICER' | 'DEPARTMENT_MANAGER' | 'PLATFORM_ADMIN' | 'AI_AGENT' | 'SYSTEM'; actorId?: string },
    reason?: string
  ): Promise<IIncident> {
    const existing = await incidentRepository.findById(id);
    if (!existing) {
      throw new Error(`Incident not found: ${id}`);
    }

    const currentStatus = existing.status;
    if (!isValidTransition(currentStatus, newStatus)) {
      throw new Error(
        `Invalid status transition from ${currentStatus} to ${newStatus}. Allowed transitions: ${
          existing.status
        } -> [ANALYZING, VALIDATED, ASSIGNED, IN_PROGRESS, RESOLVED, VERIFYING, CLOSED, REOPENED]`
      );
    }

    const updates: Partial<IIncident> = { status: newStatus };
    if (newStatus === 'RESOLVED') {
      updates.resolvedAt = new Date();
    } else if (newStatus === 'CLOSED') {
      updates.closedAt = new Date();
    } else if (newStatus === 'REOPENED') {
      updates.reopenedAt = new Date();
      updates.reopenCount = (existing.reopenCount || 0) + 1;
      updates.operationalFlags = Array.from(new Set([...(existing.operationalFlags || []), 'ATTENTION_REQUIRED']));
    }

    const updated = await incidentRepository.update(existing.id, updates);
    if (!updated) {
      throw new Error(`Failed to update incident: ${id}`);
    }

    await incidentEventRepository.create({
      incidentId: existing._id as mongoose.Types.ObjectId,
      type: newStatus === 'REOPENED' ? 'INCIDENT_REOPENED' : 'STATE_CHANGED',
      actorType: actor.actorType,
      actorId: actor.actorId,
      fromStatus: currentStatus,
      toStatus: newStatus,
      description: reason || `Incident state transitioned from ${currentStatus} to ${newStatus}`,
      timestamp: new Date(),
    });

    await auditLogRepository.append({
      actorType: actor.actorType === 'AI_AGENT' ? 'AI_AGENT' : actor.actorType === 'SYSTEM' ? 'SYSTEM' : 'USER',
      actorId: actor.actorId,
      action: 'STATE_CHANGED',
      resourceType: 'INCIDENT',
      resourceId: existing.id,
      before: { status: currentStatus },
      after: { status: newStatus },
      metadata: { reason },
    });

    incidentEventBus.emitIncidentEvent(newStatus === 'REOPENED' ? 'INCIDENT_REOPENED' : 'STATUS_CHANGED', updated);
    cacheService.invalidateIncident(existing.id || existing._id.toString(), existing.incidentNumber).catch(() => {});

    return updated;
  }

  async updateIncident(id: string, updates: Partial<IIncident>): Promise<IIncident | null> {
    const updated = await incidentRepository.update(id, updates);
    if (updated) {
      incidentEventBus.emitIncidentEvent('INCIDENT_UPDATED', updated);
      cacheService.invalidateIncident(updated.id || updated._id.toString(), updated.incidentNumber).catch(() => {});
    }
    return updated;
  }

  async assignTeam(
    incidentId: string,
    teamId: string,
    actor: { actorType: 'CITIZEN' | 'FIELD_OFFICER' | 'DEPARTMENT_MANAGER' | 'PLATFORM_ADMIN' | 'AI_AGENT' | 'SYSTEM'; actorId?: string }
  ): Promise<IIncident> {
    const existing = await incidentRepository.findById(incidentId);
    if (!existing) throw new Error(`Incident not found: ${incidentId}`);

    const nextStatus = existing.status === 'SUBMITTED' || existing.status === 'VALIDATED' ? 'ASSIGNED' : existing.status;
    const updated = await incidentRepository.update(incidentId, {
      teamId: new mongoose.Types.ObjectId(teamId),
      status: nextStatus,
    });
    if (!updated) throw new Error(`Failed to assign team to incident ${incidentId}`);

    let teamName = 'Road Maintenance Team';
    try {
      if (mongoose.models.Team) {
        const teamDoc = await mongoose.models.Team.findById(teamId);
        if (teamDoc?.name) {
          teamName = teamDoc.name;
        }
      }
    } catch {
      // fallback to teamName
    }

    await incidentEventRepository.create({
      incidentId: existing._id as mongoose.Types.ObjectId,
      type: 'TEAM_ASSIGNED',
      actorType: actor.actorType,
      actorId: actor.actorId,
      description: `${teamName} assigned to incident`,
      timestamp: new Date(),
    });

    await auditLogRepository.append({
      actorType: actor.actorType === 'AI_AGENT' ? 'AI_AGENT' : actor.actorType === 'SYSTEM' ? 'SYSTEM' : 'USER',
      actorId: actor.actorId,
      action: 'TEAM_ASSIGNED',
      resourceType: 'INCIDENT',
      resourceId: existing.id,
      before: { teamId: existing.teamId?.toString(), status: existing.status },
      after: { teamId, status: nextStatus },
    });

    incidentEventBus.emitIncidentEvent('INCIDENT_ASSIGNED', updated);
    cacheService.invalidateIncident(existing.id || existing._id.toString(), existing.incidentNumber).catch(() => {});

    return updated;
  }

  async closeIncident(
    id: string,
    actor: { actorType: 'CITIZEN' | 'FIELD_OFFICER' | 'DEPARTMENT_MANAGER' | 'PLATFORM_ADMIN' | 'AI_AGENT' | 'SYSTEM'; actorId?: string },
    notes?: string
  ): Promise<IIncident> {
    return this.updateIncidentStatus(id, 'CLOSED', actor, notes);
  }

  async reopenIncident(
    id: string,
    reason: string,
    actor: { actorType: 'CITIZEN' | 'FIELD_OFFICER' | 'DEPARTMENT_MANAGER' | 'PLATFORM_ADMIN' | 'AI_AGENT' | 'SYSTEM'; actorId?: string }
  ): Promise<IIncident> {
    return this.updateIncidentStatus(id, 'REOPENED', actor, reason);
  }

  async recordVerificationResult(
    incidentId: string,
    result: Omit<IVerificationResult, 'verifiedAt'>
  ): Promise<IIncident> {
    const verification: IVerificationResult = {
      ...result,
      verifiedAt: new Date(),
    };
    const updated = await incidentRepository.update(incidentId, {
      verificationResult: verification,
    });
    if (!updated) throw new Error(`Incident not found for verification: ${incidentId}`);

    await incidentEventRepository.create({
      incidentId: updated._id as mongoose.Types.ObjectId,
      type: result.outcome === 'LIKELY_RESOLVED' ? 'VERIFICATION_PASSED' : 'VERIFICATION_FAILED',
      actorType: 'AI_AGENT',
      actorId: result.verifiedBy,
      description: `Resolution verified: ${result.outcome} (${Math.round(result.confidence * 100)}% confidence). ${result.explanation}`,
      timestamp: new Date(),
    });

    incidentEventBus.emitIncidentEvent('VERIFICATION_COMPLETED', updated);
    cacheService.invalidateIncident(updated.id || updated._id.toString(), updated.incidentNumber).catch(() => {});

    return updated;
  }

  async updateIncidentClassification(
    incidentId: string,
    category: IncidentCategory,
    actor: { actorType: 'CITIZEN' | 'FIELD_OFFICER' | 'DEPARTMENT_MANAGER' | 'PLATFORM_ADMIN' | 'AI_AGENT' | 'SYSTEM'; actorId?: string } = { actorType: 'AI_AGENT' },
    reason?: string
  ): Promise<IIncident> {
    const existing = await incidentRepository.findById(incidentId);
    if (!existing) throw new Error(`Incident not found: ${incidentId}`);

    const previousCategory = existing.category;
    const updated = await incidentRepository.update(incidentId, { category });
    if (!updated) throw new Error(`Failed to update classification for incident: ${incidentId}`);

    await incidentEventRepository.create({
      incidentId: existing._id as mongoose.Types.ObjectId,
      type: 'INCIDENT_UPDATED',
      actorType: actor.actorType,
      actorId: actor.actorId,
      description: reason || `Classification updated from ${previousCategory} to ${category}`,
      timestamp: new Date(),
    });

    await auditLogRepository.append({
      actorType: actor.actorType === 'AI_AGENT' ? 'AI_AGENT' : actor.actorType === 'SYSTEM' ? 'SYSTEM' : 'USER',
      actorId: actor.actorId,
      action: 'INCIDENT_CLASSIFICATION_UPDATED',
      resourceType: 'INCIDENT',
      resourceId: existing.id,
      before: { category: previousCategory },
      after: { category },
      metadata: { reason },
    });

    incidentEventBus.emitIncidentEvent('INCIDENT_UPDATED', updated);
    cacheService.invalidateIncident(existing.id || existing._id.toString(), existing.incidentNumber).catch(() => {});

    return updated;
  }

  async updateIncidentLocation(
    incidentId: string,
    locationData: {
      coordinates: [number, number];
      address: string;
      ward: string;
      zone: string;
      nearbyLandmarks?: string[];
    },
    actor: { actorType: 'CITIZEN' | 'FIELD_OFFICER' | 'DEPARTMENT_MANAGER' | 'PLATFORM_ADMIN' | 'AI_AGENT' | 'SYSTEM'; actorId?: string } = { actorType: 'AI_AGENT' }
  ): Promise<IIncident> {
    const existing = await incidentRepository.findById(incidentId);
    if (!existing) throw new Error(`Incident not found: ${incidentId}`);

    const previousLocation = existing.location;
    const updated = await incidentRepository.update(incidentId, {
      location: {
        type: 'Point',
        coordinates: locationData.coordinates,
        address: locationData.address,
        nearbyLandmarks: locationData.nearbyLandmarks || existing.location?.nearbyLandmarks || [],
      },
      ward: locationData.ward,
      zone: locationData.zone,
    });
    if (!updated) throw new Error(`Failed to update location for incident: ${incidentId}`);

    await incidentEventRepository.create({
      incidentId: existing._id as mongoose.Types.ObjectId,
      type: 'LOCATION_UPDATED',
      actorType: actor.actorType,
      actorId: actor.actorId,
      description: `Location updated to [${locationData.coordinates.join(', ')}], Ward: ${locationData.ward}`,
      timestamp: new Date(),
    });

    await auditLogRepository.append({
      actorType: actor.actorType === 'AI_AGENT' ? 'AI_AGENT' : actor.actorType === 'SYSTEM' ? 'SYSTEM' : 'USER',
      actorId: actor.actorId,
      action: 'INCIDENT_LOCATION_UPDATED',
      resourceType: 'INCIDENT',
      resourceId: existing.id,
      before: { location: previousLocation, ward: existing.ward, zone: existing.zone },
      after: { location: locationData.coordinates, ward: locationData.ward, zone: locationData.zone },
    });

    cacheService.invalidateIncident(existing.id || existing._id.toString(), existing.incidentNumber).catch(() => {});
    return updated;
  }

  async setIncidentSeverity(
    incidentId: string,
    severity: SeverityLevel,
    actor: { actorType: 'CITIZEN' | 'FIELD_OFFICER' | 'DEPARTMENT_MANAGER' | 'PLATFORM_ADMIN' | 'AI_AGENT' | 'SYSTEM'; actorId?: string } = { actorType: 'AI_AGENT' },
    rationale?: string
  ): Promise<IIncident> {
    const existing = await incidentRepository.findById(incidentId);
    if (!existing) throw new Error(`Incident not found: ${incidentId}`);

    const defaultSlaHours: Record<SeverityLevel, number> = {
      LOW: 72,
      MEDIUM: 48,
      HIGH: 24,
      CRITICAL: 4,
    };
    const targetHours = defaultSlaHours[severity] || 48;
    const deadline = new Date(Date.now() + targetHours * 3600 * 1000);

    const previousSeverity = existing.severity;
    // NOTE: PER USER CORRECTION 4: setSeverity MUST NOT change incident status!
    const updated = await incidentRepository.update(incidentId, {
      severity,
      sla: {
        targetHours,
        deadline,
        isOverdue: false,
        escalated: false,
      },
      severityReasoning: {
        level: severity,
        score: severity === 'CRITICAL' ? 85 : severity === 'HIGH' ? 65 : severity === 'MEDIUM' ? 45 : 25,
        factors: [rationale || `Severity evaluated at ${severity}`],
        explanation: rationale || `Computed severity level: ${severity}`,
        calculatedAt: new Date(),
        calculatedBy: actor.actorId || 'AGENT_SEVERITY',
      },
    });
    if (!updated) throw new Error(`Failed to update severity for incident: ${incidentId}`);

    await incidentEventRepository.create({
      incidentId: existing._id as mongoose.Types.ObjectId,
      type: 'SEVERITY_UPDATED',
      actorType: actor.actorType,
      actorId: actor.actorId,
      description: `Severity set to ${severity}. SLA target: ${targetHours}h`,
      timestamp: new Date(),
    });

    await auditLogRepository.append({
      actorType: actor.actorType === 'AI_AGENT' ? 'AI_AGENT' : actor.actorType === 'SYSTEM' ? 'SYSTEM' : 'USER',
      actorId: actor.actorId,
      action: 'INCIDENT_SEVERITY_SET',
      resourceType: 'INCIDENT',
      resourceId: existing.id,
      before: { severity: previousSeverity },
      after: { severity, targetHours, deadline: deadline.toISOString() },
    });

    cacheService.invalidateIncident(existing.id || existing._id.toString(), existing.incidentNumber).catch(() => {});
    return updated;
  }

  async linkReportToIncident(
    reportId: string,
    targetIncidentId: string,
    actor: { actorType: 'CITIZEN' | 'FIELD_OFFICER' | 'DEPARTMENT_MANAGER' | 'PLATFORM_ADMIN' | 'AI_AGENT' | 'SYSTEM'; actorId?: string } = { actorType: 'AI_AGENT' },
    reason?: string
  ): Promise<{ report: any; incident: IIncident }> {
    const incident = await incidentRepository.findById(targetIncidentId);
    if (!incident) throw new Error(`Target incident not found: ${targetIncidentId}`);

    const report = await reportRepository.linkToIncident(reportId, targetIncidentId);
    if (!report) throw new Error(`Report not found or could not be linked: ${reportId}`);

    const updated = await incidentRepository.update(targetIncidentId, {
      $addToSet: { reportIds: new mongoose.Types.ObjectId(reportId) },
      lastReportedAt: new Date(),
    } as any);

    await incidentEventRepository.create({
      incidentId: incident._id as mongoose.Types.ObjectId,
      type: 'REPORT_LINKED',
      actorType: actor.actorType,
      actorId: actor.actorId,
      description: reason || `Duplicate report ${reportId} linked to incident ${incident.incidentNumber}`,
      timestamp: new Date(),
    });

    await auditLogRepository.append({
      actorType: actor.actorType === 'AI_AGENT' ? 'AI_AGENT' : actor.actorType === 'SYSTEM' ? 'SYSTEM' : 'USER',
      actorId: actor.actorId,
      action: 'REPORT_LINKED_TO_INCIDENT',
      resourceType: 'INCIDENT',
      resourceId: incident.id,
      after: { reportId, targetIncidentId },
      metadata: { reason },
    });

    cacheService.invalidateIncident(incident.id || incident._id.toString(), incident.incidentNumber).catch(() => {});
    return { report, incident: updated || incident };
  }

  async getIncidentDossier(id: string): Promise<any | null> {
    return cacheService.wrap(`incident:${id}:dossier`, 60, async () => {
      const incident = await incidentRepository.findById(id);
      if (!incident) return null;

      const incidentId = incident._id;
      const incidentIdStr = incidentId.toString();

      const incidentEvidenceIds = (incident.evidenceIds || []).map((e: any) => (e?._id ? e._id : e));
      const incidentReportIds = (incident.reportIds || []).map((r: any) => (r?._id ? r._id : r));

      // Concurrently fetch all associated operational records
      const [reports, evidence, workOrdersList, events, executions, auditLogs, notifications] = await Promise.all([
        mongoose.models.Report
          ? mongoose.models.Report.find({
              $or: [{ incidentId }, { _id: { $in: incidentReportIds } }],
            })
          : [],
        mongoose.models.Evidence
          ? mongoose.models.Evidence.find({
              $or: [{ incidentId }, { _id: { $in: incidentEvidenceIds } }],
            }).sort({ createdAt: -1 })
          : [],
        mongoose.models.WorkOrder
          ? mongoose.models.WorkOrder.find({
              $or: [
                { incidentId: incident._id },
                ...(incident.workOrderId ? [{ _id: incident.workOrderId }] : []),
              ],
            })
              .populate('assignedOfficerId', 'name email role phone')
              .populate('teamId')
          : [],
        incidentEventRepository.findByIncidentId(incidentIdStr),
        mongoose.models.AgentExecution
          ? mongoose.models.AgentExecution.find({
              incidentId: incident._id,
            }).sort({ sequence: 1, startedAt: 1, timestamp: 1 })
          : [],
        mongoose.models.AuditLog
          ? mongoose.models.AuditLog.find({
              resourceType: 'INCIDENT',
              $or: [
                { resourceId: incidentIdStr },
                { resourceId: incident.incidentNumber },
                { resourceId: incident._id?.toString() },
              ],
            }).sort({ timestamp: -1 })
          : [],
        mongoose.models.Notification ? mongoose.models.Notification.find({ incidentId }).sort({ createdAt: -1 }) : [],
      ]);

      const teamName = (incident.teamId as any)?.name || 'Road Maintenance Team';
      const sanitizedTimeline = (events || []).map((evt: any) => {
        const obj = evt.toObject ? evt.toObject() : { ...evt };
        if (typeof obj.description === 'string') {
          obj.description = obj.description.replace(
            /Team\s+[0-9a-fA-F]{24}\s+assigned\s+to\s+incident/i,
            `${teamName} assigned to incident`
          );
        }
        return obj;
      });

      const singleWorkOrder = Array.isArray(workOrdersList) && workOrdersList.length > 0 ? workOrdersList[0] : null;

      return {
        incident,
        reports,
        evidence,
        workOrder: singleWorkOrder,
        workOrders: Array.isArray(workOrdersList) ? workOrdersList : singleWorkOrder ? [singleWorkOrder] : [],
        timeline: sanitizedTimeline,
        agentExecutions: executions,
        auditEvents: auditLogs,
        auditLogs,
        notifications,
        aiAnalysis: {
          severityReasoning: incident.severityReasoning,
          investigationSummary: incident.investigationSummary,
          verificationResult: incident.verificationResult,
        },
        sla: incident.sla,
        reopenCount: incident.reopenCount || 0,
        operationalFlags: incident.operationalFlags || [],
      };
    });
  }
}

export const incidentService = new IncidentService();

