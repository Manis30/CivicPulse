import { Request, Response } from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import { EvidenceModel } from '../../models/Evidence.js';
import { IncidentModel } from '../../models/Incident.js';
import { UserModel } from '../../models/User.js';
import { logger } from '../../utils/logger.js';
import { EvidenceType } from '@civicpulse/shared';
import { cloudinaryService } from '../../services/cloudinaryService.js';

export class EvidenceController {
  async uploadEvidence(req: Request, res: Response): Promise<void> {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({
          success: false,
          error: {
            code: 'FILE_REQUIRED',
            message: 'No image file was uploaded.',
          },
        });
        return;
      }

      const { type = 'BEFORE', incidentId, reportId, latitude, longitude, externalUrl, publicId } = req.body;

      // Determine uploader
      let uploaderId = req.user?.id;
      if (!uploaderId) {
        // Fallback to finding any citizen user if unauthenticated public report
        const defaultUser = await UserModel.findOne({ role: 'CITIZEN' });
        uploaderId = defaultUser ? defaultUser._id.toString() : new mongoose.Types.ObjectId().toString();
      }

      const source = req.user?.role === 'FIELD_OFFICER' ? 'OFFICER' : 'CITIZEN';

      // Store persistent URL (Cloudinary in 'civicpulse' folder, or static /uploads route)
      let fileUrl = externalUrl && (externalUrl.startsWith('http://') || externalUrl.startsWith('https://'))
        ? externalUrl
        : `/uploads/${file.filename}`;
      let cldPublicId = publicId || undefined;

      if (cloudinaryService.isConfigured() && (!externalUrl || !externalUrl.startsWith('http'))) {
        try {
          const cldResult = await cloudinaryService.uploadImage(file.path, {
            folder: 'civicpulse',
          });
          fileUrl = cldResult.secureUrl;
          cldPublicId = cldResult.publicId;
          logger.info(`Evidence uploaded to Cloudinary: ${cldResult.publicId} -> ${cldResult.secureUrl}`);

          // Remove local temporary file after successful upload to Cloudinary
          try {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          } catch (unlinkErr: any) {
            logger.debug(`Could not remove temp file ${file.path}: ${unlinkErr.message}`);
          }
        } catch (cldErr: any) {
          logger.warn(`Cloudinary upload failed, falling back to local file storage: ${cldErr.message}`);
        }
      }

      const evidence = await EvidenceModel.create({
        incidentId: incidentId ? new mongoose.Types.ObjectId(incidentId) : undefined,
        reportId: reportId ? new mongoose.Types.ObjectId(reportId) : undefined,
        uploadedBy: new mongoose.Types.ObjectId(uploaderId),
        type: (type as EvidenceType) || 'BEFORE',
        fileUrl,
        mimeType: file.mimetype,
        source,
        metadata: {
          sizeBytes: file.size,
          latitude: latitude ? parseFloat(latitude) : undefined,
          longitude: longitude ? parseFloat(longitude) : undefined,
          publicId: cldPublicId || publicId || undefined,
        },
        capturedAt: new Date(),
      });

      // If incidentId provided and type is AFTER or BEFORE, link into Incident
      if (incidentId && mongoose.Types.ObjectId.isValid(incidentId)) {
        const updateFields: any = { $addToSet: { evidenceIds: evidence._id } };
        if (type === 'AFTER') {
          updateFields.afterEvidenceId = evidence._id;
        } else if (type === 'BEFORE') {
          updateFields.beforeEvidenceId = evidence._id;
        }
        await IncidentModel.findByIdAndUpdate(incidentId, updateFields);
      }

      logger.info(`Evidence uploaded: ${evidence._id} (${evidence.type}) - ${fileUrl}`);

      res.status(201).json({
        success: true,
        data: {
          id: evidence._id.toString(),
          fileUrl,
          type: evidence.type,
          mimeType: evidence.mimeType,
          sizeBytes: file.size,
          incidentId: evidence.incidentId?.toString(),
          reportId: evidence.reportId?.toString(),
          source: evidence.source,
          createdAt: evidence.createdAt,
        },
      });
    } catch (err: any) {
      logger.error('Failed to upload evidence:', err);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPLOAD_FAILED',
          message: err.message || 'Evidence upload failed.',
        },
      });
    }
  }

  async getEvidenceById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_ID', message: 'Invalid evidence ID format.' },
        });
        return;
      }

      const evidence = await EvidenceModel.findById(id).populate('uploadedBy', 'name role');
      if (!evidence) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Evidence document not found.' },
        });
        return;
      }

      res.json({
        success: true,
        data: evidence,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: err.message },
      });
    }
  }

  async getEvidenceByIncident(req: Request, res: Response): Promise<void> {
    try {
      const { incidentId } = req.params;
      let incObjId: mongoose.Types.ObjectId | null = null;
      let incEvIds: any[] = [];

      if (mongoose.Types.ObjectId.isValid(incidentId)) {
        incObjId = new mongoose.Types.ObjectId(incidentId);
        const incident = await IncidentModel.findById(incObjId);
        if (incident && incident.evidenceIds) incEvIds = incident.evidenceIds;
      } else {
        // May be incidentNumber like INC-2026-1048
        const incident = await IncidentModel.findOne({ incidentNumber: incidentId });
        if (incident) {
          incObjId = incident._id as mongoose.Types.ObjectId;
          if (incident.evidenceIds) incEvIds = incident.evidenceIds;
        } else {
          res.json({ success: true, data: [] });
          return;
        }
      }

      const items = await EvidenceModel.find({
        $or: [
          { incidentId: incObjId },
          { _id: { $in: incEvIds } }
        ]
      }).sort({ createdAt: -1 });

      res.json({
        success: true,
        data: items,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: err.message },
      });
    }
  }
}

export const evidenceController = new EvidenceController();
