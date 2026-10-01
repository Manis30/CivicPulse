import mongoose, { Schema, Document, Model } from 'mongoose';
import { ExecutionMode, IncidentStatus, OrchestrationStatus } from '@civicpulse/shared';
import { WorkflowErrorCode, WorkflowJobStatus } from '../queues/types.js';

export interface IOrchestrationRecord extends Document {
  orchestrationId: string;
  incidentId: string;
  reportId?: string;
  jobId: string;
  workflowStatus: OrchestrationStatus;
  jobStatus: WorkflowJobStatus;
  executionMode: ExecutionMode;
  requestedEngine?: string;
  currentAgent?: string;
  attempts: number;
  maxAttempts: number;
  startedAt?: Date;
  completedAt?: Date;
  durationMs?: number;
  executionIds: string[];
  agentResults: Record<string, unknown>;
  finalIncidentState?: IncidentStatus;
  requiresHumanReview: boolean;
  failure?: {
    code: WorkflowErrorCode;
    message: string;
    isRetryable: boolean;
    details?: unknown;
  };
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const OrchestrationRecordSchema = new Schema<IOrchestrationRecord>(
  {
    orchestrationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    incidentId: {
      type: String,
      required: true,
      index: true,
    },
    reportId: {
      type: String,
      required: false,
    },
    jobId: {
      type: String,
      required: true,
      index: true,
    },
    workflowStatus: {
      type: String,
      enum: ['PENDING', 'RUNNING', 'SUCCESS', 'PARTIAL', 'REQUIRES_HUMAN_REVIEW', 'FAILED'],
      default: 'PENDING',
      index: true,
    },
    jobStatus: {
      type: String,
      enum: ['QUEUED', 'ACTIVE', 'COMPLETED', 'FAILED', 'RETRYING'],
      default: 'QUEUED',
      index: true,
    },
    executionMode: {
      type: String,
      enum: ['GEMINI_AI', 'GROQ_LLM', 'DETERMINISTIC_ENGINE'],
      default: 'DETERMINISTIC_ENGINE',
    },
    requestedEngine: {
      type: String,
      required: false,
    },
    currentAgent: {
      type: String,
      required: false,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
    startedAt: {
      type: Date,
      required: false,
    },
    completedAt: {
      type: Date,
      required: false,
    },
    durationMs: {
      type: Number,
      required: false,
    },
    executionIds: {
      type: [String],
      default: [],
    },
    agentResults: {
      type: Schema.Types.Mixed,
      default: {},
    },
    finalIncidentState: {
      type: String,
      required: false,
    },
    requiresHumanReview: {
      type: Boolean,
      default: false,
    },
    failure: {
      code: { type: String, required: false },
      message: { type: String, required: false },
      isRetryable: { type: Boolean, required: false },
      details: { type: Schema.Types.Mixed, required: false },
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound index for querying incident orchestrations efficiently
OrchestrationRecordSchema.index({ incidentId: 1, createdAt: -1 });

export const OrchestrationRecordModel: Model<IOrchestrationRecord> =
  mongoose.models.OrchestrationRecord ||
  mongoose.model<IOrchestrationRecord>('OrchestrationRecord', OrchestrationRecordSchema);
