import mongoose from 'mongoose';
import { IReport, ReportModel, ReportStatus } from '../models/Report.js';
import { PaginationParams, PaginatedResult, sanitizePagination, FilterQuery } from './baseRepository.js';
import { IncidentCategory } from '@civicpulse/shared';

export interface ReportFilterOptions {
  reporterId?: string;
  incidentId?: string;
  categoryHint?: IncidentCategory;
  status?: ReportStatus;
}

export class ReportRepository {
  async create(data: Partial<IReport>): Promise<IReport> {
    return ReportModel.create(data);
  }

  async findById(id: string): Promise<IReport | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return ReportModel.findById(id).populate('reporterId', 'name email').populate('evidenceIds');
  }

  async findWithPagination(
    options: ReportFilterOptions = {},
    pagination?: PaginationParams
  ): Promise<PaginatedResult<IReport>> {
    const { page, limit, skip } = sanitizePagination(pagination);
    const query: FilterQuery<IReport> = {};

    if (options.reporterId && mongoose.Types.ObjectId.isValid(options.reporterId)) {
      query.reporterId = new mongoose.Types.ObjectId(options.reporterId);
    }
    if (options.incidentId && mongoose.Types.ObjectId.isValid(options.incidentId)) {
      query.incidentId = new mongoose.Types.ObjectId(options.incidentId);
    }
    if (options.categoryHint) query.categoryHint = options.categoryHint;
    if (options.status) query.status = options.status;

    const [data, total] = await Promise.all([
      ReportModel.find(query)
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('reporterId', 'name email'),
      ReportModel.countDocuments(query),
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
   * 2dsphere Geospatial Search: Find reports near a point [longitude, latitude]
   */
  async findReportsNearPoint(
    coordinates: [number, number],
    maxDistanceMeters: number = 300,
    categoryHint?: IncidentCategory
  ): Promise<IReport[]> {
    const query: FilterQuery<IReport> = {
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

    if (categoryHint) {
      query.categoryHint = categoryHint;
    }

    return ReportModel.find(query).limit(50);
  }

  async linkToIncident(reportId: string, incidentId: string): Promise<IReport | null> {
    return ReportModel.findByIdAndUpdate(
      reportId,
      {
        incidentId: new mongoose.Types.ObjectId(incidentId),
        status: 'LINKED',
      },
      { returnDocument: 'after' }
    );
  }
}

export const reportRepository = new ReportRepository();
