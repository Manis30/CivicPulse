import mongoose, { Schema, Document } from 'mongoose';
import { IncidentCategory, SeverityLevel } from '@civicpulse/shared';

export interface IDepartment extends Document {
  name: string;
  code: string;
  description: string;
  categories: IncidentCategory[];
  wardIds: string[];
  slaPolicies: Record<SeverityLevel, number>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Department description is required'],
      trim: true,
    },
    categories: {
      type: [String],
      required: [true, 'Handled categories are required'],
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
    wardIds: {
      type: [String],
      default: [],
      index: true,
    },
    slaPolicies: {
      LOW: { type: Number, default: 72 },
      MEDIUM: { type: Number, default: 48 },
      HIGH: { type: Number, default: 24 },
      CRITICAL: { type: Number, default: 4 },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const DepartmentModel = mongoose.models.Department || mongoose.model<IDepartment>('Department', DepartmentSchema);
