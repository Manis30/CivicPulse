import mongoose, { Schema, Document } from 'mongoose';
import { IncidentCategory } from '@civicpulse/shared';

export type ReportStatus = 'SUBMITTED' | 'PROCESSED' | 'LINKED' | 'REJECTED';
export type ReportSource = 'MOBILE_APP' | 'WEB_PORTAL' | 'CALL_CENTER' | 'IOT_SENSOR';

export interface IReport extends Document {
  _id: mongoose.Types.ObjectId;
  id: string;
  reporterId: mongoose.Types.ObjectId;
  incidentId?: mongoose.Types.ObjectId;
  description: string;
  categoryHint?: IncidentCategory;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
  };
  evidenceIds: mongoose.Types.ObjectId[];
  submittedAt: Date;
  source: ReportSource;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter reference is required'],
      index: true,
    },
    incidentId: {
      type: Schema.Types.ObjectId,
      ref: 'Incident',
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Report description is required'],
      trim: true,
    },
    categoryHint: {
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
      index: true,
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
          message: 'Coordinates must be [longitude, latitude] with valid ranges (-180..180, -90..90)',
        },
      },
      address: { type: String, trim: true },
    },
    evidenceIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Evidence',
      },
    ],
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    source: {
      type: String,
      enum: ['MOBILE_APP', 'WEB_PORTAL', 'CALL_CENTER', 'IOT_SENSOR'],
      default: 'WEB_PORTAL',
    },
    status: {
      type: String,
      enum: ['SUBMITTED', 'PROCESSED', 'LINKED', 'REJECTED'],
      default: 'SUBMITTED',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

ReportSchema.index({ location: '2dsphere' });

export const ReportModel = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
