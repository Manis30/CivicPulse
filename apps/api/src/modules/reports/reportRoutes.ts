import { Router } from 'express';
import { listReports, submitReport, getReportById } from './reportController.js';
import { optionalAuth } from '../../middleware/authMiddleware.js';

const router = Router();

router.get('/reports', optionalAuth, listReports);
router.post('/reports', optionalAuth, submitReport);
router.get('/reports/:id', optionalAuth, getReportById);

export default router;
