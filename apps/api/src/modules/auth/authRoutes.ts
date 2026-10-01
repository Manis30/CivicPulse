import { Router } from 'express';
import { authController } from './authController.js';
import { requireAuth } from '../../middleware/authMiddleware.js';

const router = Router();

router.post('/auth/register', (req, res) => authController.register(req, res));
router.post('/auth/login', (req, res) => authController.login(req, res));
router.post('/auth/refresh', (req, res) => authController.refresh(req, res));
router.post('/auth/logout', (req, res) => authController.logout(req, res));
router.post('/auth/forgot-password', (req, res) => authController.forgotPassword(req, res));
router.post('/auth/reset-password', (req, res) => authController.resetPassword(req, res));
router.get('/auth/me', requireAuth, (req, res) => authController.me(req, res));

export default router;
