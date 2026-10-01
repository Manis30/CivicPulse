import { Router } from 'express';
import { listTeams, getTeamById } from './teamController.js';

const router = Router();

router.get('/teams', listTeams);
router.get('/teams/:id', getTeamById);

export default router;
