import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { teamService } from '../../services/teamService.js';
import { TeamAvailabilityStatus } from '../../models/Team.js';

const TeamQuerySchema = z.object({
  departmentId: z.string().optional(),
  availabilityStatus: z.enum(['AVAILABLE', 'BUSY', 'OFF_DUTY']).optional(),
  wardId: z.string().optional(),
});

export async function listTeams(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = TeamQuerySchema.parse(req.query);
    const teams = await teamService.getTeams({
      departmentId: filters.departmentId,
      availabilityStatus: filters.availabilityStatus as TeamAvailabilityStatus,
      wardId: filters.wardId,
    });

    res.status(200).json({
      count: teams.length,
      data: teams,
    });
  } catch (err) {
    next(err);
  }
}

export async function getTeamById(req: Request, res: Response, next: NextFunction) {
  try {
    const team = await teamService.getTeamById(req.params.id);
    if (!team) {
      res.status(404).json({ error: 'Team not found', id: req.params.id });
      return;
    }
    res.status(200).json(team);
  } catch (err) {
    next(err);
  }
}
