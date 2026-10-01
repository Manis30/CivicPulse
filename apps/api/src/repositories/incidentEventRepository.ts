import mongoose from 'mongoose';
import { IIncidentEvent, IncidentEventModel } from '../models/IncidentEvent.js';

export class IncidentEventRepository {
  async create(data: Partial<IIncidentEvent>): Promise<IIncidentEvent> {
    return IncidentEventModel.create(data);
  }

  async findByIncidentId(incidentId: string): Promise<IIncidentEvent[]> {
    if (!mongoose.Types.ObjectId.isValid(incidentId)) return [];
    return IncidentEventModel.find({ incidentId: new mongoose.Types.ObjectId(incidentId) }).sort({
      timestamp: 1,
    });
  }

  async getRecentEvents(limit = 50): Promise<IIncidentEvent[]> {
    return IncidentEventModel.find().sort({ timestamp: -1 }).limit(limit);
  }
}

export const incidentEventRepository = new IncidentEventRepository();
