import { Router } from 'express';
import { systemController } from './systemController.js';
import { requireAuth, requireRole } from '../../middleware/authMiddleware.js';

const router = Router();

// Health endpoint is public (for monitoring / load balancer health checks)
router.get('/system/health', (req, res) => systemController.getHealth(req, res));

// Queue inspection and config management require admin role
const adminGuard = [requireAuth, requireRole('PLATFORM_ADMIN')];

router.get('/system/queues', ...adminGuard, (req, res) => systemController.getQueues(req, res));
router.get('/system/config', ...adminGuard, (req, res) => systemController.getConfig(req, res));
router.put('/system/config', ...adminGuard, (req, res) => systemController.updateConfig(req, res));

export default router;
