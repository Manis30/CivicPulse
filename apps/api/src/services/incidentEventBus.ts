import { EventEmitter } from 'events';
import { IIncident } from '../models/Incident.js';

export type IncidentEventType =
  | 'INCIDENT_CREATED'
  | 'INCIDENT_UPDATED'
  | 'STATUS_CHANGED'
  | 'INCIDENT_ASSIGNED'
  | 'INCIDENT_REOPENED'
  | 'VERIFICATION_COMPLETED'
  | 'AGENT_STARTED'
  | 'AGENT_COMPLETED'
  | 'AGENT_FAILED'
  | 'NOTIFICATION_CREATED';

export interface IncidentEventPayload {
  type: IncidentEventType;
  incident: Partial<IIncident> & { id: string };
  timestamp: string;
  metadata?: Record<string, any>;
}

class IncidentEventBus extends EventEmitter {
  constructor() {
    super();
    // Allow ample listeners for concurrent SSE client connections
    this.setMaxListeners(200);
  }

  /**
   * Broadcast an incident lifecycle event to all subscribed clients and listeners.
   */
  emitIncidentEvent(type: IncidentEventType, incident: IIncident | any, metadata?: Record<string, any>): void {
    const payload: IncidentEventPayload = {
      type,
      incident: {
        id: incident.incidentNumber || incident.id || incident._id?.toString(),
        incidentNumber: incident.incidentNumber,
        category: incident.category,
        status: incident.status,
        severity: incident.severity,
        location: incident.location,
        ward: incident.ward,
        zone: incident.zone,
        departmentId: incident.departmentId,
        teamId: incident.teamId || incident.assignedTeamId,
        assignedOfficerId: incident.assignedOfficerId,
        workOrderId: incident.workOrderId,
        sla: incident.sla,
        severityReasoning: incident.severityReasoning,
        investigationSummary: incident.investigationSummary,
        verificationResult: incident.verificationResult,
        updatedAt: incident.updatedAt ? new Date(incident.updatedAt) : new Date(),
      },
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.emit('incident_event', payload);
  }

  /**
   * Subscribe to incident lifecycle events.
   */
  onIncidentEvent(listener: (payload: IncidentEventPayload) => void): () => void {
    this.on('incident_event', listener);
    return () => {
      this.off('incident_event', listener);
    };
  }
}

export const incidentEventBus = new IncidentEventBus();
