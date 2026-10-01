import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { incidentService } from '../../services/incidentService.js';
import { incidentEventBus } from '../../services/incidentEventBus.js';
import { IncidentCategory, IncidentStatus, SeverityLevel } from '@civicpulse/shared';

// Zod query schema for filtering and pagination
const IncidentListQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z
    .enum([
      'SUBMITTED',
      'ANALYZING',
      'VALIDATED',
      'ASSIGNED',
      'IN_PROGRESS',
      'RESOLVED',
      'VERIFYING',
      'CLOSED',
      'REOPENED',
    ])
    .optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  category: z
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
  ward: z.string().optional(),
  departmentId: z.string().optional(),
  teamId: z.string().optional(),
  reporterId: z.string().optional(),
  mine: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  isOverdue: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  fromDate: z.string().datetime().optional().transform((d) => (d ? new Date(d) : undefined)),
  toDate: z.string().datetime().optional().transform((d) => (d ? new Date(d) : undefined)),
});

// Zod query schema for 2dsphere near search
const NearbyQuerySchema = z.object({
  lng: z.coerce.number().min(-180).max(180),
  lat: z.coerce.number().min(-90).max(90),
  radius: z.coerce.number().min(1).max(50000).default(500), // Default 500m, max 50km
  category: z
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
  status: z
    .enum([
      'SUBMITTED',
      'ANALYZING',
      'VALIDATED',
      'ASSIGNED',
      'IN_PROGRESS',
      'RESOLVED',
      'VERIFYING',
      'CLOSED',
      'REOPENED',
    ])
    .optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
});

// Zod schema for creating an incident
const CreateIncidentSchema = z.object({
  category: z.enum([
    'POTHOLE',
    'GARBAGE',
    'STREETLIGHT',
    'WATER_LEAK',
    'DRAINAGE',
    'FALLEN_TREE',
    'ROAD_DAMAGE',
    'ILLEGAL_DUMPING',
    'OTHER',
  ]),
  description: z.string().min(5).max(2000),
  location: z.object({
    type: z.literal('Point').default('Point'),
    coordinates: z.tuple([
      z.number().min(-180).max(180), // longitude
      z.number().min(-90).max(90),   // latitude
    ]),
    address: z.string().min(3),
    nearbyLandmarks: z.array(z.string()).optional(),
  }),
  ward: z.string().min(1),
  zone: z.string().min(1),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  primaryReportId: z.string().optional(),
  evidenceIds: z.array(z.string()).optional(),
  departmentId: z.string().optional(),
  targetHours: z.number().positive().optional(),
});

export async function listIncidents(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = IncidentListQuerySchema.parse(req.query);
    const { page, limit, ...filters } = validated;

    let reporterId = filters.reporterId;
    if (!reporterId && filters.mine && req.user?.id) {
      reporterId = req.user.id;
    }

    const result = await incidentService.listIncidents(
      {
        status: filters.status as IncidentStatus,
        severity: filters.severity as SeverityLevel,
        category: filters.category as IncidentCategory,
        ward: filters.ward,
        departmentId: filters.departmentId,
        teamId: filters.teamId,
        isOverdue: filters.isOverdue,
        reporterId,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
      },
      { page, limit }
    );

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

export async function getIncidentById(req: Request, res: Response, next: NextFunction) {
  try {
    const incident = await incidentService.getIncidentById(req.params.id);
    if (!incident) {
      res.status(404).json({ success: false, error: { message: 'Incident not found', id: req.params.id } });
      return;
    }
    res.status(200).json({
      success: true,
      data: incident,
    });
  } catch (err) {
    next(err);
  }
}

export async function createIncident(req: Request, res: Response, next: NextFunction) {
  try {
    const body = CreateIncidentSchema.parse(req.body);
    const actorId = req.user?.id || (req.headers['x-user-id'] as string | undefined);

    const incident = await incidentService.createIncident(body, {
      actorType: 'CITIZEN',
      actorId,
    });

    res.status(201).json({
      success: true,
      data: incident,
    });
  } catch (err) {
    next(err);
  }
}

export async function findNearbyIncidents(req: Request, res: Response, next: NextFunction) {
  try {
    const query = NearbyQuerySchema.parse(req.query);
    const results = await incidentService.findNearbyIncidents(
      [query.lng, query.lat], // [longitude, latitude]
      query.radius,
      {
        category: query.category as IncidentCategory,
        status: query.status as IncidentStatus,
        severity: query.severity as SeverityLevel,
      }
    );

    res.status(200).json({
      success: true,
      coordinates: [query.lng, query.lat],
      radiusMeters: query.radius,
      count: results.length,
      data: results,
    });
  } catch (err) {
    next(err);
  }
}

export async function getIncidentTimeline(req: Request, res: Response, next: NextFunction) {
  try {
    const timeline = await incidentService.getIncidentTimeline(req.params.id);
    res.status(200).json({
      incidentId: req.params.id,
      count: timeline.length,
      data: timeline,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Real-time Server-Sent Events stream for incident lifecycle events.
 * GET /api/incidents/events
 */
export function streamIncidentEvents(req: Request, res: Response): void {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  res.write(`:keepalive\n\n`);

  const heartbeat = setInterval(() => {
    res.write(`:ping\n\n`);
  }, 20000);

  const unsubscribe = incidentEventBus.onIncidentEvent((payload) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  });

  req.on('close', () => {
    clearInterval(heartbeat);
    unsubscribe();
  });
}

/**
 * Canonical Incident Dossier endpoint (Phase 30).
 * GET /api/incidents/:id/dossier
 */
export async function getIncidentDossier(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const dossier = await incidentService.getIncidentDossier(id);
    if (!dossier) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Incident dossier not found for ${id}` },
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: dossier,
    });
  } catch (err) {
    next(err);
  }
}

