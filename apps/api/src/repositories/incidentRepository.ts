import mongoose from 'mongoose';
import { IIncident, IncidentModel } from '../models/Incident.js';
import { PaginationParams, PaginatedResult, sanitizePagination, FilterQuery } from './baseRepository.js';
import { IncidentCategory, IncidentStatus, SeverityLevel } from '@civicpulse/shared';

export interface IncidentFilterOptions {
  status?: IncidentStatus;
  severity?: SeverityLevel;
  category?: IncidentCategory;
  ward?: string;
  departmentId?: string;
  teamId?: string;
  isOverdue?: boolean;
  reporterId?: string;
  fromDate?: Date;
  toDate?: Date;
}

export class IncidentRepository {
  async create(data: Partial<IIncident>): Promise<IIncident> {
    return IncidentModel.create(data);
  }

  async findById(id: string): Promise<IIncident | null> {
    if (mongoose.Types.ObjectId.isValid(id)) {
      return IncidentModel.findById(id)
        .populate('reportIds')
        .populate('evidenceIds')
        .populate('departmentId')
        .populate('teamId')
        .populate('assignedOfficerId')
        .populate('workOrderId');
    }
    return IncidentModel.findOne({ incidentNumber: id })
      .populate('reportIds')
      .populate('evidenceIds')
      .populate('departmentId')
      .populate('teamId')
      .populate('assignedOfficerId')
      .populate('workOrderId');
  }

  async findWithPagination(
    options: IncidentFilterOptions = {},
    pagination?: PaginationParams
  ): Promise<PaginatedResult<IIncident>> {
    const { page, limit, skip } = sanitizePagination(pagination);
    const query: FilterQuery<IIncident> = {};

    if (options.status) query.status = options.status;
    if (options.severity) query.severity = options.severity;
    if (options.category) query.category = options.category;
    if (options.ward) query.ward = options.ward;
    if (options.departmentId && mongoose.Types.ObjectId.isValid(options.departmentId)) {
      query.departmentId = new mongoose.Types.ObjectId(options.departmentId);
    }
    if (options.teamId && mongoose.Types.ObjectId.isValid(options.teamId)) {
      query.teamId = new mongoose.Types.ObjectId(options.teamId);
    }
    if (typeof options.isOverdue === 'boolean') {
      query['sla.isOverdue'] = options.isOverdue;
    }
    if (options.reporterId && mongoose.Types.ObjectId.isValid(options.reporterId)) {
      const reporterObjId = new mongoose.Types.ObjectId(options.reporterId);
      const ReportModel = mongoose.models.Report || mongoose.model('Report');
      const userReportIds = await ReportModel.find({ reporterId: reporterObjId }).distinct('_id');
      query.$or = [
        { reporterId: reporterObjId },
        { reportIds: { $in: userReportIds } },
      ];
    }
    if (options.fromDate || options.toDate) {
      query.createdAt = {};
      if (options.fromDate) query.createdAt.$gte = options.fromDate;
      if (options.toDate) query.createdAt.$lte = options.toDate;
    }

    const [data, total] = await Promise.all([
      IncidentModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('departmentId', 'name code')
        .populate('teamId', 'name'),
      IncidentModel.countDocuments(query),
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

  /**
   * 2dsphere Geospatial Search: Find incidents within a radius from [longitude, latitude]
   */
  async findIncidentsNearPoint(
    coordinates: [number, number],
    maxDistanceMeters: number = 500,
    filters?: {
      category?: IncidentCategory;
      status?: IncidentStatus;
      severity?: SeverityLevel;
      excludeId?: string;
    }
  ): Promise<IIncident[]> {
    const query: FilterQuery<IIncident> = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates, // [longitude, latitude]
          },
          $maxDistance: maxDistanceMeters,
        },
      },
    };

    if (filters?.category) query.category = filters.category;
    if (filters?.status) query.status = filters.status;
    if (filters?.severity) query.severity = filters.severity;
    if (filters?.excludeId && mongoose.Types.ObjectId.isValid(filters.excludeId)) {
      query._id = { $ne: new mongoose.Types.ObjectId(filters.excludeId) };
    }

    return IncidentModel.find(query).limit(50);
  }

  async getPreviousIncidentsAtLocation(
    coordinates: [number, number],
    radiusMeters: number = 100
  ): Promise<IIncident[]> {
    return this.findIncidentsNearPoint(coordinates, radiusMeters);
  }

  async getReopenedIncidents(limit = 20): Promise<IIncident[]> {
    return IncidentModel.find({ reopenCount: { $gt: 0 } })
      .sort({ reopenedAt: -1, updatedAt: -1 })
      .limit(limit);
  }

  async update(id: string, data: Partial<IIncident>): Promise<IIncident | null> {
    return IncidentModel.findByIdAndUpdate(id, data, { returnDocument: 'after' });
  }

  // ==========================================
  // Aggregation Pipeline Functions
  // ==========================================

  async getIncidentCountsByStatus(): Promise<Array<{ status: IncidentStatus; count: number }>> {
    return IncidentModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', count: 1 } },
      { $sort: { count: -1 } },
    ]);
  }

  async getIncidentCountsBySeverity(): Promise<Array<{ severity: SeverityLevel; count: number }>> {
    return IncidentModel.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $project: { _id: 0, severity: '$_id', count: 1 } },
      { $sort: { count: -1 } },
    ]);
  }

  async getIncidentCountsByCategory(): Promise<Array<{ category: IncidentCategory; count: number }>> {
    return IncidentModel.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { _id: 0, category: '$_id', count: 1 } },
      { $sort: { count: -1 } },
    ]);
  }

  async getIncidentCountsByWard(): Promise<Array<{ ward: string; count: number }>> {
    return IncidentModel.aggregate([
      { $group: { _id: '$ward', count: { $sum: 1 } } },
      { $project: { _id: 0, ward: '$_id', count: 1 } },
      { $sort: { count: -1 } },
    ]);
  }

  async getAverageResolutionTime(): Promise<{ avgHours: number; count: number }> {
    const result = await IncidentModel.aggregate([
      {
        $match: {
          resolvedAt: { $exists: true, $ne: null },
          firstReportedAt: { $exists: true },
        },
      },
      {
        $project: {
          durationHours: {
            $divide: [{ $subtract: ['$resolvedAt', '$firstReportedAt'] }, 3600000],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgHours: { $avg: '$durationHours' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (!result.length) return { avgHours: 0, count: 0 };
    return {
      avgHours: Math.round(result[0].avgHours * 10) / 10,
      count: result[0].count,
    };
  }

  async getSLABreachRate(): Promise<{ total: number; breached: number; breachRatePercentage: number }> {
    const result = await IncidentModel.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          breached: [
            {
              $match: {
                $or: [{ 'sla.isOverdue': true }, { operationalFlags: 'SLA_BREACH' }],
              },
            },
            { $count: 'count' },
          ],
        },
      },
    ]);

    const total = result[0]?.total[0]?.count || 0;
    const breached = result[0]?.breached[0]?.count || 0;
    const breachRatePercentage = total > 0 ? Math.round((breached / total) * 1000) / 10 : 0;

    return { total, breached, breachRatePercentage };
  }

  async getReopenedIncidentRate(): Promise<{ total: number; reopened: number; reopenRatePercentage: number }> {
    const result = await IncidentModel.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          reopened: [{ $match: { reopenCount: { $gt: 0 } } }, { $count: 'count' }],
        },
      },
    ]);

    const total = result[0]?.total[0]?.count || 0;
    const reopened = result[0]?.reopened[0]?.count || 0;
    const reopenRatePercentage = total > 0 ? Math.round((reopened / total) * 1000) / 10 : 0;

    return { total, reopened, reopenRatePercentage };
  }

  async getDepartmentWorkload(): Promise<
    Array<{ departmentId: string; departmentName?: string; activeCount: number }>
  > {
    return IncidentModel.aggregate([
      {
        $match: {
          status: { $in: ['VALIDATED', 'ASSIGNED', 'IN_PROGRESS'] },
          departmentId: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$departmentId',
          activeCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'department',
        },
      },
      {
        $project: {
          _id: 0,
          departmentId: '$_id',
          departmentName: { $arrayElemAt: ['$department.name', 0] },
          activeCount: 1,
        },
      },
      { $sort: { activeCount: -1 } },
    ]);
  }
}

export const incidentRepository = new IncidentRepository();
