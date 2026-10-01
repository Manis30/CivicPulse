import mongoose, { Schema, Document } from 'mongoose';
import { EvidenceType } from '@civicpulse/shared';

export interface IEvidenceMetadata {
  width?: number;
  height?: number;
  sizeBytes?: number;
  device?: string;
  latitude?: number;
  longitude?: number;
}

export interface IEvidenceAiAnalysis {
  labels: string[];
  confidence: number;
  quality: 'POOR' | 'ACCEPTABLE' | 'GOOD' | 'HIGH';
  observations: string[];
}

export interface IEvidence extends Document {
  incidentId?: mongoose.Types.ObjectId;
  reportId?: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  type: EvidenceType;
  fileUrl: string;
  mimeType: string;
  metadata?: IEvidenceMetadata;
  capturedAt: Date;
  source: 'CITIZEN' | 'OFFICER' | 'AGENT';
  aiAnalysis?: IEvidenceAiAnalysis;
  verificationResult?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const EvidenceSchema = new Schema<IEvidence>(
  {
    incidentId: {
      type: Schema.Types.ObjectId,
      ref: 'Incident',
      index: true,
    },
    reportId: {
      type: Schema.Types.ObjectId,
      ref: 'Report',
      index: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader reference is required'],
      index: true,
    },
    type: {
      type: String,
      enum: ['BEFORE', 'INSPECTION', 'REPAIR', 'AFTER', 'SUPPORTING'],
      required: [true, 'Evidence type is required'],
      index: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File reference URL is required'],
      trim: true,
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
      default: 'image/jpeg',
    },
    metadata: {
      width: { type: Number },
      height: { type: Number },
      sizeBytes: { type: Number },
      device: { type: String },
      latitude: { type: Number },
      longitude: { type: Number },
    },
    capturedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    source: {
      type: String,
      enum: ['CITIZEN', 'OFFICER', 'AGENT'],
      default: 'CITIZEN',
    },
    aiAnalysis: {
      labels: { type: [String], default: [] },
      confidence: { type: Number, min: 0, max: 1 },
      quality: {
        type: String,
        enum: ['POOR', 'ACCEPTABLE', 'GOOD', 'HIGH'],
      },
      observations: { type: [String], default: [] },
    },
    verificationResult: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

export const EvidenceModel = mongoose.models.Evidence || mongoose.model<IEvidence>('Evidence', EvidenceSchema);
