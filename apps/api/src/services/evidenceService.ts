import mongoose from 'mongoose';
import { evidenceRepository } from '../repositories/evidenceRepository.js';
import { IEvidence } from '../models/Evidence.js';
import { EvidenceType } from '@civicpulse/shared';

export interface CreateEvidenceInput {
  incidentId?: string;
  reportId?: string;
  uploadedBy: string;
  type: EvidenceType;
  fileUrl: string;
  mimeType?: string;
  metadata?: Record<string, unknown>;
  source?: 'CITIZEN' | 'OFFICER' | 'AGENT';
}

export class EvidenceService {
  async createEvidence(input: CreateEvidenceInput): Promise<IEvidence> {
    return evidenceRepository.create({
      incidentId: input.incidentId ? new mongoose.Types.ObjectId(input.incidentId) : undefined,
      reportId: input.reportId ? new mongoose.Types.ObjectId(input.reportId) : undefined,
      uploadedBy: new mongoose.Types.ObjectId(input.uploadedBy),
      type: input.type,
      fileUrl: input.fileUrl,
      mimeType: input.mimeType || 'image/jpeg',
      metadata: input.metadata,
      source: input.source || 'CITIZEN',
      capturedAt: new Date(),
    });
  }

  async getEvidenceById(id: string): Promise<IEvidence | null> {
    return evidenceRepository.findById(id);
  }

  async getEvidenceByIncidentId(incidentId: string): Promise<IEvidence[]> {
    return evidenceRepository.findByIncidentId(incidentId);
  }
}

export const evidenceService = new EvidenceService();
