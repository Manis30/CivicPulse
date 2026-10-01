import { Router } from 'express';
import { getOverview } from './analyticsController.js';

const router = Router();

router.get('/analytics/overview', getOverview);

export default router;
