import { Router } from 'express';
import { orchestrationController } from './orchestrationController.js';

const router = Router();

// Asynchronous multi-agent workflow enqueue endpoint
router.post('/incidents/:incidentId/run', (req, res) =>
  orchestrationController.runIncidentOrchestration(req, res)
);

// Retrieve asynchronous workflow status by BullMQ jobId
router.get('/jobs/:jobId', (req, res) =>
  orchestrationController.getJobStatus(req, res)
);

// Retrieve asynchronous workflow status by orchestrationId
router.get('/:orchestrationId', (req, res) =>
  orchestrationController.getOrchestrationStatus(req, res)
);

export default router;
