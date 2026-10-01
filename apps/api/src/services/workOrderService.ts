import mongoose from 'mongoose';
import { workOrderRepository } from '../repositories/workOrderRepository.js';
import { incidentRepository } from '../repositories/incidentRepository.js';
import { incidentEventRepository } from '../repositories/incidentEventRepository.js';
import { auditLogRepository } from '../repositories/auditLogRepository.js';
import { IWorkOrder, WorkOrderStatus } from '../models/WorkOrder.js';
import { PaginationParams, PaginatedResult } from '../repositories/baseRepository.js';
import { SeverityLevel } from '@civicpulse/shared';

export interface CreateWorkOrderInput {
  incidentId: string;
  departmentId: string;
  teamId: string;
  assignedOfficerId?: string;
  priority?: SeverityLevel;
  targetHours?: number;
  checklist?: Array<{ item: string; completed: boolean; notes?: string }>;
}

export class WorkOrderService {
  async createWorkOrder(
    input: CreateWorkOrderInput,
    actor: { actorType: 'FIELD_OFFICER' | 'DEPARTMENT_MANAGER' | 'PLATFORM_ADMIN' | 'AI_AGENT' | 'SYSTEM'; actorId?: string } = {
      actorType: 'SYSTEM',
    }
  ): Promise<IWorkOrder> {
    const list = await workOrderRepository.findWithPagination({}, { limit: 1 });
    const seq = 4000 + (list.pagination.total + 1);
    const workOrderNumber = `WO-2026-${seq}`;

    const priority = input.priority || 'MEDIUM';
    const targetHours = input.targetHours || 24;
    const deadlineAt = new Date(Date.now() + targetHours * 3600 * 1000);

    const workOrder = await workOrderRepository.create({
      workOrderNumber,
      incidentId: new mongoose.Types.ObjectId(input.incidentId),
      departmentId: new mongoose.Types.ObjectId(input.departmentId),
      teamId: new mongoose.Types.ObjectId(input.teamId),
      assignedOfficerId: input.assignedOfficerId
        ? new mongoose.Types.ObjectId(input.assignedOfficerId)
        : undefined,
      priority,
      status: 'CREATED',
      sla: {
        startedAt: new Date(),
        deadlineAt,
        targetHours,
      },
      checklist: input.checklist || [
        { item: 'Site safety perimeter established', completed: false },
        { item: 'Pre-repair inspection documented', completed: false },
        { item: 'Defect resolved according to municipal specifications', completed: false },
        { item: 'Mandatory AFTER-evidence photo captured', completed: false },
      ],
    });

    // Link workOrderId into the incident
    await incidentRepository.update(input.incidentId, {
      workOrderId: workOrder._id as mongoose.Types.ObjectId,
      teamId: new mongoose.Types.ObjectId(input.teamId),
      departmentId: new mongoose.Types.ObjectId(input.departmentId),
      assignedOfficerId: input.assignedOfficerId
        ? new mongoose.Types.ObjectId(input.assignedOfficerId)
        : undefined,
    });

    // Log event & audit
    await incidentEventRepository.create({
      incidentId: new mongoose.Types.ObjectId(input.incidentId),
      type: 'WORK_ORDER_CREATED',
      actorType: actor.actorType,
      actorId: actor.actorId,
      description: `Work order ${workOrderNumber} created and assigned to team`,
      metadata: { workOrderId: workOrder.id, teamId: input.teamId },
      timestamp: new Date(),
    });

    await auditLogRepository.append({
      actorType: actor.actorType === 'AI_AGENT' ? 'AI_AGENT' : actor.actorType === 'SYSTEM' ? 'SYSTEM' : 'USER',
      actorId: actor.actorId,
      action: 'WORK_ORDER_CREATED',
      resourceType: 'WORK_ORDER',
      resourceId: workOrder.id,
      after: { workOrderNumber, priority, status: 'CREATED' },
    });

    return workOrder;
  }

  async getWorkOrderById(id: string): Promise<IWorkOrder | null> {
    return workOrderRepository.findById(id);
  }

  async getWorkOrderByIncidentId(incidentId: string): Promise<IWorkOrder | null> {
    return workOrderRepository.findByIncidentId(incidentId);
  }

  async listWorkOrders(
    filter?: { teamId?: string; departmentId?: string; status?: WorkOrderStatus },
    pagination?: PaginationParams
  ): Promise<PaginatedResult<IWorkOrder>> {
    return workOrderRepository.findWithPagination(filter, pagination);
  }

  async updateWorkOrderStatus(
    id: string,
    status: WorkOrderStatus,
    actor: { actorType: 'FIELD_OFFICER' | 'DEPARTMENT_MANAGER' | 'PLATFORM_ADMIN' | 'AI_AGENT' | 'SYSTEM'; actorId?: string },
    extra?: { completionNotes?: string; inspectionNotes?: string; afterEvidenceIds?: string[] }
  ): Promise<IWorkOrder | null> {
    const existing = await workOrderRepository.findById(id);
    if (!existing) throw new Error(`Work order not found: ${id}`);

    const extraFields: Partial<IWorkOrder> = {};
    if (status === 'IN_PROGRESS' && !existing.startedAt) {
      extraFields.startedAt = new Date();
    }
    if (status === 'COMPLETED') {
      extraFields.completedAt = new Date();
      if (extra?.completionNotes) extraFields.completionNotes = extra.completionNotes;
      if (extra?.afterEvidenceIds) {
        extraFields.afterEvidenceIds = extra.afterEvidenceIds.map((e) => new mongoose.Types.ObjectId(e));
      }
    }

    const updated = await workOrderRepository.updateStatus(existing.id, status, extraFields);

    await incidentEventRepository.create({
      incidentId: existing.incidentId as unknown as mongoose.Types.ObjectId,
      type: status === 'COMPLETED' ? 'WORK_COMPLETED' : status === 'IN_PROGRESS' ? 'WORK_STARTED' : 'STATE_CHANGED',
      actorType: actor.actorType,
      actorId: actor.actorId,
      description: `Work order status updated to ${status}`,
      timestamp: new Date(),
    });

    return updated;
  }
}

export const workOrderService = new WorkOrderService();
