import mongoose from 'mongoose';
import { incidentEventRepository } from '../repositories/incidentEventRepository.js';
import { IIncidentEvent, IncidentEventType, EventActorType } from '../models/IncidentEvent.js';
import { IncidentStatus } from '@civicpulse/shared';

export class IncidentEventService {
  async logEvent(params: {
    incidentId: string;
    type: IncidentEventType;
    actorType: EventActorType;
    actorId?: string;
    fromStatus?: IncidentStatus;
    toStatus?: IncidentStatus;
    description: string;
    metadata?: Record<string, unknown>;
  }): Promise<IIncidentEvent> {
    return incidentEventRepository.create({
      incidentId: new mongoose.Types.ObjectId(params.incidentId),
      type: params.type,
      actorType: params.actorType,
      actorId: params.actorId,
      fromStatus: params.fromStatus,
      toStatus: params.toStatus,
      description: params.description,
      metadata: params.metadata,
      timestamp: new Date(),
    });
  }

  async getIncidentTimeline(incidentId: string): Promise<IIncidentEvent[]> {
    return incidentEventRepository.findByIncidentId(incidentId);
  }
}

export const incidentEventService = new IncidentEventService();
