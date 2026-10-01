import mongoose, { Schema, Document } from 'mongoose';
import { IncidentStatus } from '@civicpulse/shared';

export type IncidentEventType =
  | 'INCIDENT_CREATED'
  | 'STATE_CHANGED'
  | 'SEVERITY_UPDATED'
  | 'DEPARTMENT_ASSIGNED'
  | 'TEAM_ASSIGNED'
  | 'WORK_ORDER_CREATED'
  | 'WORK_STARTED'
  | 'WORK_COMPLETED'
  | 'VERIFICATION_STARTED'
  | 'VERIFICATION_PASSED'
  | 'VERIFICATION_FAILED'
  | 'INCIDENT_REOPENED'
  | 'SLA_BREACH'
  | 'NOTIFICATION_SENT'
  | 'INCIDENT_UPDATED'
  | 'LOCATION_UPDATED'
  | 'REPORT_LINKED';

export type EventActorType =
  | 'CITIZEN'
  | 'FIELD_OFFICER'
  | 'DEPARTMENT_MANAGER'
  | 'PLATFORM_ADMIN'
  | 'AI_AGENT'
  | 'SYSTEM';

export interface IIncidentEvent extends Document {
  incidentId: mongoose.Types.ObjectId;
  type: IncidentEventType;
  actorType: EventActorType;
  actorId?: string;
  fromStatus?: IncidentStatus;
  toStatus?: IncidentStatus;
  description: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

const IncidentEventSchema = new Schema<IIncidentEvent>(
  {
    incidentId: {
      type: Schema.Types.ObjectId,
      ref: 'Incident',
      required: [true, 'Incident reference is required'],
      index: true,
    },
    type: {
      type: String,
      enum: [
        'INCIDENT_CREATED',
        'STATE_CHANGED',
        'SEVERITY_UPDATED',
        'DEPARTMENT_ASSIGNED',
        'TEAM_ASSIGNED',
        'WORK_ORDER_CREATED',
        'WORK_STARTED',
        'WORK_COMPLETED',
        'VERIFICATION_STARTED',
        'VERIFICATION_PASSED',
        'VERIFICATION_FAILED',
        'INCIDENT_REOPENED',
        'SLA_BREACH',
        'NOTIFICATION_SENT',
        'INCIDENT_UPDATED',
        'LOCATION_UPDATED',
        'REPORT_LINKED',
      ],
      required: [true, 'Event type is required'],
      index: true,
    },
    actorType: {
      type: String,
      enum: [
        'CITIZEN',
        'FIELD_OFFICER',
        'DEPARTMENT_MANAGER',
        'PLATFORM_ADMIN',
        'AI_AGENT',
        'SYSTEM',
      ],
      required: [true, 'Actor type is required'],
    },
    actorId: {
      type: String,
    },
    fromStatus: {
      type: String,
      enum: [
        'SUBMITTED',
        'ANALYZING',
        'VALIDATED',
        'ASSIGNED',
        'IN_PROGRESS',
        'RESOLVED',
        'VERIFYING',
        'CLOSED',
        'REOPENED',
      ],
    },
    toStatus: {
      type: String,
      enum: [
        'SUBMITTED',
        'ANALYZING',
        'VALIDATED',
        'ASSIGNED',
        'IN_PROGRESS',
        'RESOLVED',
        'VERIFYING',
        'CLOSED',
        'REOPENED',
      ],
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

IncidentEventSchema.index({ incidentId: 1, timestamp: 1 });

export const IncidentEventModel =
  mongoose.models.IncidentEvent || mongoose.model<IIncidentEvent>('IncidentEvent', IncidentEventSchema);
