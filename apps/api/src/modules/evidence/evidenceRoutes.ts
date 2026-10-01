import { Router } from 'express';
import { evidenceController } from './evidenceController.js';
import { evidenceUpload } from './uploadMiddleware.js';

const router = Router();

// Accept both 'file' and 'image' field names for compatibility
router.post('/evidence', evidenceUpload.single('file'), (req, res) => evidenceController.uploadEvidence(req, res));
router.get('/evidence/:id', (req, res) => evidenceController.getEvidenceById(req, res));
router.get('/incidents/:incidentId/evidence', (req, res) => evidenceController.getEvidenceByIncident(req, res));

export default router;
