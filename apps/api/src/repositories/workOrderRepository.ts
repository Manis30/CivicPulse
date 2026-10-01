import mongoose from 'mongoose';
import { IWorkOrder, WorkOrderModel, WorkOrderStatus } from '../models/WorkOrder.js';
import { PaginationParams, PaginatedResult, sanitizePagination, FilterQuery } from './baseRepository.js';

export class WorkOrderRepository {
  async create(data: Partial<IWorkOrder>): Promise<IWorkOrder> {
    return WorkOrderModel.create(data);
  }

  async findById(id: string): Promise<IWorkOrder | null> {
    if (mongoose.Types.ObjectId.isValid(id)) {
      return WorkOrderModel.findById(id)
        .populate('incidentId')
        .populate('departmentId')
        .populate('teamId')
        .populate('assignedOfficerId', 'name email');
    }
    return WorkOrderModel.findOne({ workOrderNumber: id })
      .populate('incidentId')
      .populate('departmentId')
      .populate('teamId')
      .populate('assignedOfficerId', 'name email');
  }

  async findByIncidentId(incidentId: string): Promise<IWorkOrder | null> {
    if (!mongoose.Types.ObjectId.isValid(incidentId)) return null;
    return WorkOrderModel.findOne({ incidentId: new mongoose.Types.ObjectId(incidentId) })
      .populate('teamId')
      .populate('assignedOfficerId', 'name email');
  }

  async findWithPagination(
    filter: { teamId?: string; departmentId?: string; status?: WorkOrderStatus } = {},
    pagination?: PaginationParams
  ): Promise<PaginatedResult<IWorkOrder>> {
    const { page, limit, skip } = sanitizePagination(pagination);
    const query: FilterQuery<IWorkOrder> = {};

    if (filter.teamId && mongoose.Types.ObjectId.isValid(filter.teamId)) {
      query.teamId = new mongoose.Types.ObjectId(filter.teamId);
    }
    if (filter.departmentId && mongoose.Types.ObjectId.isValid(filter.departmentId)) {
      query.departmentId = new mongoose.Types.ObjectId(filter.departmentId);
    }
    if (filter.status) {
      query.status = filter.status;
    }

    const [data, total] = await Promise.all([
      WorkOrderModel.find(query).sort({ 'sla.deadlineAt': 1 }).skip(skip).limit(limit),
      WorkOrderModel.countDocuments(query),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async updateStatus(
    id: string,
    status: WorkOrderStatus,
    extraFields?: Partial<IWorkOrder>
  ): Promise<IWorkOrder | null> {
    return WorkOrderModel.findByIdAndUpdate(
      id,
      {
        status,
        ...extraFields,
      },
      { returnDocument: 'after' }
    );
  }
}

export const workOrderRepository = new WorkOrderRepository();
