import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../../services/analyticsService.js';

export async function getOverview(_req: Request, res: Response, next: NextFunction) {
  try {
    const overview = await analyticsService.getOperationalOverview();
    res.status(200).json({ success: true, data: overview });
  } catch (err) {
    next(err);
  }
}
