import { Router } from 'express';
import { listRegisteredTools, executeTool } from './toolController.js';

const router = Router();

router.get('/tools', listRegisteredTools);
router.post('/tools/:toolName/execute', executeTool);

export default router;
