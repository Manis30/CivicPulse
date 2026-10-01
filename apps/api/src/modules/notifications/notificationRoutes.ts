import { Router } from 'express';
import { notificationController } from './notificationController.js';

const router = Router();

router.get('/notifications', (req, res) => notificationController.getNotifications(req, res));
router.post('/notifications/read-all', (req, res) => notificationController.markAllAsRead(req, res));
router.post('/notifications/:id/read', (req, res) => notificationController.markAsRead(req, res));

export default router;
