import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { reportService } from '../../services/reportService.js';
import { IncidentCategory } from '@civicpulse/shared';
import { ReportStatus } from '../../models/Report.js';

const ReportListQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  reporterId: z.string().optional(),
  incidentId: z.string().optional(),
  categoryHint: z
    .enum([
      'POTHOLE',
      'GARBAGE',
      'STREETLIGHT',
      'WATER_LEAK',
      'DRAINAGE',
      'FALLEN_TREE',
      'ROAD_DAMAGE',
      'ILLEGAL_DUMPING',
      'OTHER',
    ])
    .optional(),
  status: z.enum(['SUBMITTED', 'PROCESSED', 'LINKED', 'REJECTED']).optional(),
});

const SubmitReportSchema = z.object({
  reporterId: z.string().optional(),
  description: z.string().min(5).max(2000),
  location: z.object({
    type: z.literal('Point').default('Point'),
    coordinates: z.tuple([
      z.number().min(-180).max(180), // longitude
      z.number().min(-90).max(90),   // latitude
    ]),
    address: z.string().optional(),
  }),
  categoryHint: z
    .enum([
      'POTHOLE',
      'GARBAGE',
      'STREETLIGHT',
      'WATER_LEAK',
      'DRAINAGE',
      'FALLEN_TREE',
      'ROAD_DAMAGE',
      'ILLEGAL_DUMPING',
      'OTHER',
    ])
    .optional(),
  evidenceIds: z.array(z.string()).optional(),
  source: z.enum(['MOBILE_APP', 'WEB_PORTAL', 'CALL_CENTER', 'IOT_SENSOR']).optional(),
});

export async function listReports(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = ReportListQuerySchema.parse(req.query);
    const { page, limit, ...filters } = validated;

    const result = await reportService.listReports(
      {
        reporterId: filters.reporterId,
        incidentId: filters.incidentId,
        categoryHint: filters.categoryHint as IncidentCategory,
        status: filters.status as ReportStatus,
      },
      { page, limit }
    );

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function submitReport(req: Request, res: Response, next: NextFunction) {
  try {
    const body = SubmitReportSchema.parse(req.body);
    if (!body.reporterId && req.user?.id) {
      body.reporterId = req.user.id;
    }
    const result = await reportService.submitReport(body);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getReportById(req: Request, res: Response, next: NextFunction) {
  try {
    const report = await reportService.getReportById(req.params.id);
    if (!report) {
      res.status(404).json({ error: 'Report not found', id: req.params.id });
      return;
    }
    res.status(200).json(report);
  } catch (err) {
    next(err);
  }
}
