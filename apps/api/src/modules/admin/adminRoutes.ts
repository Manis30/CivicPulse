import { Router } from 'express';
import { adminController } from './adminController.js';
import { requireAuth, requireRole } from '../../middleware/authMiddleware.js';

const router = Router();

// All admin routes require authentication + PLATFORM_ADMIN role
const adminGuard = [requireAuth, requireRole('PLATFORM_ADMIN')];

router.get('/admin/overview', ...adminGuard, (req, res) => adminController.getOverview(req, res));
router.get('/admin/policies', ...adminGuard, (req, res) => adminController.getPolicies(req, res));
router.put('/admin/policies', ...adminGuard, (req, res) => adminController.updatePolicy(req, res));
router.get('/admin/users', ...adminGuard, (req, res) => adminController.getUsers(req, res));

// Agent Fleet & Control Center Endpoints
router.get('/agents', requireAuth, (req, res) => adminController.getAgentsTelemetry(req, res));
router.get('/admin/agents', ...adminGuard, (req, res) => adminController.getAgentsTelemetry(req, res));
router.get('/admin/agents/:agentId', ...adminGuard, (req, res) => adminController.getAgentById(req, res));
router.get('/admin/agents/:agentId/executions', ...adminGuard, (req, res) => adminController.getAgentExecutionsForAgent(req, res));
router.get('/admin/agents/:agentId/performance', ...adminGuard, (req, res) => adminController.getAgentPerformance(req, res));
router.get('/admin/agent-activity', ...adminGuard, (req, res) => adminController.getAgentActivity(req, res));
router.get('/admin/agent-metrics', ...adminGuard, (req, res) => adminController.getAgentMetrics(req, res));
router.get('/admin/agent-network', ...adminGuard, (req, res) => adminController.getAgentNetwork(req, res));

// Execution & Audit Endpoints (accessible to authenticated users, not just admins)
router.get('/agent-executions', requireAuth, (req, res) => adminController.getAgentExecutions(req, res));
router.get('/agent-executions/:id', requireAuth, (req, res) => adminController.getAgentExecutionById(req, res));
router.get('/audit-logs', ...adminGuard, (req, res) => adminController.getAuditLogs(req, res));

export default router;
