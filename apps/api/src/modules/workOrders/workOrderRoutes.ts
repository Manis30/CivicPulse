import { Router } from 'express';
import { workOrderController } from './workOrderController.js';
import { requireAuth } from '../../middleware/authMiddleware.js';

const router = Router();

// Officer Tasks & Work Orders endpoints
router.get('/officer/tasks', requireAuth, (req, res) => workOrderController.getOfficerTasks(req, res));
router.get('/work-orders/:id', requireAuth, (req, res) => workOrderController.getWorkOrderById(req, res));
router.post('/work-orders/:id/accept', requireAuth, (req, res) => workOrderController.acceptTask(req, res));
router.post('/work-orders/:id/start', requireAuth, (req, res) => workOrderController.startTask(req, res));
router.post('/work-orders/:id/evidence', requireAuth, (req, res) => workOrderController.attachEvidence(req, res));
router.post('/work-orders/:id/complete', requireAuth, (req, res) => workOrderController.completeTask(req, res));

export default router;
