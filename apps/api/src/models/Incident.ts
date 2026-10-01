import mongoose, { Schema, Document } from 'mongoose';
import {
  IncidentCategory,
  IncidentStatus,
  SeverityLevel,
  OperationalFlag,
  VALID_STATUS_TRANSITIONS,
} from '@civicpulse/shared';

export interface ISeverityReasoning {
  level: SeverityLevel;
  score: number;
  factors: string[];
  explanation: string;
  calculatedAt: Date;
  calculatedBy: string;
}

export interface IVerificationResult {
  outcome: 'LIKELY_RESOLVED' | 'POSSIBLY_UNRESOLVED';
  confidence: number;
  explanation: string;
  beforeEvidenceId?: string;
  afterEvidenceId?: string;
  verifiedAt: Date;
  verifiedBy: string;
}

export interface ISlaState {
  targetHours: number;
  deadline: Date;
  isOverdue: boolean;
  escalated: boolean;
  breachedAt?: Date;
}

export interface IIncident extends Document {
  _id: mongoose.Types.ObjectId;
  id: string;
  incidentNumber: string;
  category: IncidentCategory;
  description: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address: string;
    nearbyLandmarks?: string[];
  };
  ward: string;
  zone: string;
  severity: SeverityLevel;
  severityReasoning?: ISeverityReasoning;
  status: IncidentStatus;
  reportIds: mongoose.Types.ObjectId[];
  reporterId?: mongoose.Types.ObjectId;
  evidenceIds: mongoose.Types.ObjectId[];
  departmentId?: mongoose.Types.ObjectId;
  teamId?: mongoose.Types.ObjectId;
  assignedOfficerId?: mongoose.Types.ObjectId;
  workOrderId?: mongoose.Types.ObjectId;
  sla: ISlaState;
  operationalFlags: OperationalFlag[];
  investigationSummary?: string;
  verificationResult?: IVerificationResult;
  firstReportedAt: Date;
  lastReportedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  reopenedAt?: Date;
  reopenCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const SeverityReasoningSchema = new Schema<ISeverityReasoning>(
  {
    level: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true,
    },
    score: { type: Number, min: 0, max: 100, required: true },
    factors: { type: [String], default: [] },
    explanation: { type: String, required: true },
    calculatedAt: { type: Date, default: Date.now },
    calculatedBy: { type: String, required: true },
  },
  { _id: false }
);

const VerificationResultSchema = new Schema<IVerificationResult>(
  {
    outcome: {
      type: String,
      enum: ['LIKELY_RESOLVED', 'POSSIBLY_UNRESOLVED'],
      required: true,
    },
    confidence: { type: Number, min: 0, max: 1, required: true },
    explanation: { type: String, required: true },
    beforeEvidenceId: { type: String },
    afterEvidenceId: { type: String },
    verifiedAt: { type: Date, default: Date.now },
    verifiedBy: { type: String, required: true },
  },
  { _id: false }
);

const SlaSchema = new Schema<ISlaState>(
  {
    targetHours: { type: Number, required: true },
    deadline: { type: Date, required: true, index: true },
    isOverdue: { type: Boolean, default: false },
    escalated: { type: Boolean, default: false },
    breachedAt: { type: Date },
  },
  { _id: false }
);

const IncidentSchema = new Schema<IIncident>(
  {
    incidentNumber: {
      type: String,
      required: [true, 'Incident number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: [
        'POTHOLE',
        'GARBAGE',
        'STREETLIGHT',
        'WATER_LEAK',
        'DRAINAGE',
        'FALLEN_TREE',
        'ROAD_DAMAGE',
        'ILLEGAL_DUMPING',
        'OTHER',
      ],
      required: [true, 'Category is required'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Coordinates [longitude, latitude] are required'],
        validate: {
          validator: function (v: number[]) {
            return (
              Array.isArray(v) &&
              v.length === 2 &&
              v[0] >= -180 &&
              v[0] <= 180 &&
              v[1] >= -90 &&
              v[1] <= 90
            );
          },
          message: 'Coordinates must be valid [longitude, latitude]',
        },
      },
      address: { type: String, required: true, trim: true },
      nearbyLandmarks: { type: [String], default: [] },
    },
    ward: {
      type: String,
      required: [true, 'Municipal ward is required'],
      trim: true,
      index: true,
    },
    zone: {
      type: String,
      required: [true, 'Municipal zone is required'],
      trim: true,
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
      required: true,
      index: true,
    },
    severityReasoning: {
      type: SeverityReasoningSchema,
    },
    status: {
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
      default: 'SUBMITTED',
      required: true,
      index: true,
    },
    reportIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Report',
      },
    ],
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    evidenceIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Evidence',
      },
    ],
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      index: true,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      index: true,
    },
    assignedOfficerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    workOrderId: {
      type: Schema.Types.ObjectId,
      ref: 'WorkOrder',
    },
    sla: {
      type: SlaSchema,
      required: true,
    },
    operationalFlags: {
      type: [String],
      enum: ['SLA_BREACH', 'ATTENTION_REQUIRED', 'REQUIRES_HUMAN_REVIEW', 'ESCALATED'],
      default: [],
      index: true,
    },
    investigationSummary: {
      type: String,
    },
    verificationResult: {
      type: VerificationResultSchema,
    },
    firstReportedAt: {
      type: Date,
      default: Date.now,
    },
    lastReportedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    resolvedAt: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },
    reopenedAt: {
      type: Date,
    },
    reopenCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Mandatory 2dsphere index for spatial radius searches and duplicate detection
IncidentSchema.index({ location: '2dsphere' });

// Compound indexes for active operational filters
IncidentSchema.index({ status: 1, severity: 1 });
IncidentSchema.index({ ward: 1, status: 1 });

/**
 * State Transition Guard Helper
 */
export function isValidTransition(from: IncidentStatus, to: IncidentStatus): boolean {
  const allowed = VALID_STATUS_TRANSITIONS[from];
  return !!allowed && allowed.includes(to);
}

export const IncidentModel = mongoose.models.Incident || mongoose.model<IIncident>('Incident', IncidentSchema);
