import { Router } from 'express';
import { agentController } from './agentController.js';

const router = Router();

// Agent definition inspection
router.get('/', (req, res) => agentController.listAgents(req, res));

// Internal/development agent execution endpoint
router.post('/:agentId/execute', (req, res) => agentController.executeAgent(req, res));

export default router;
