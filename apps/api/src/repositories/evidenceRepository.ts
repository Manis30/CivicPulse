import mongoose from 'mongoose';
import { IEvidence, EvidenceModel } from '../models/Evidence.js';

export class EvidenceRepository {
  async create(data: Partial<IEvidence>): Promise<IEvidence> {
    return EvidenceModel.create(data);
  }

  async findById(id: string): Promise<IEvidence | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return EvidenceModel.findById(id).populate('uploadedBy', 'name role email');
  }

  async findByIncidentId(incidentId: string): Promise<IEvidence[]> {
    if (!mongoose.Types.ObjectId.isValid(incidentId)) return [];
    return EvidenceModel.find({ incidentId: new mongoose.Types.ObjectId(incidentId) })
      .populate('uploadedBy', 'name role')
      .sort({ capturedAt: 1 });
  }

  async findByReportId(reportId: string): Promise<IEvidence[]> {
    if (!mongoose.Types.ObjectId.isValid(reportId)) return [];
    return EvidenceModel.find({ reportId: new mongoose.Types.ObjectId(reportId) }).sort({ capturedAt: 1 });
  }
}

export const evidenceRepository = new EvidenceRepository();
