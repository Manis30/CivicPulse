import { Router } from 'express';
import {
  listIncidents,
  getIncidentById,
  createIncident,
  findNearbyIncidents,
  getIncidentTimeline,
  streamIncidentEvents,
  getIncidentDossier,
} from './incidentController.js';

import { optionalAuth } from '../../middleware/authMiddleware.js';

const router = Router();

// Specialized route before parametrized :id route
router.get('/incidents/events', streamIncidentEvents);
router.get('/incidents/nearby', findNearbyIncidents);

// Standard collection routes
router.get('/incidents', optionalAuth, listIncidents);
router.post('/incidents', optionalAuth, createIncident);

// Individual resource routes
router.get('/incidents/:id/timeline', getIncidentTimeline);
router.get('/incidents/:id/dossier', optionalAuth, getIncidentDossier);
router.get('/incidents/:id', optionalAuth, getIncidentById);

export default router;
