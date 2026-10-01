import mongoose, { Schema, Document } from 'mongoose';

export type TeamAvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'OFF_DUTY';

export interface ITeam extends Document {
  name: string;
  departmentId: mongoose.Types.ObjectId;
  wardIds: string[];
  specializations: string[];
  officerIds: mongoose.Types.ObjectId[];
  capacity: number;
  activeWorkload: number;
  availabilityStatus: TeamAvailabilityStatus;
  currentLocation?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address?: string;
  };
  shift: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required'],
      index: true,
    },
    wardIds: {
      type: [String],
      default: [],
      index: true,
    },
    specializations: {
      type: [String],
      default: [],
      index: true,
    },
    officerIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    capacity: {
      type: Number,
      default: 5,
      min: 1,
    },
    activeWorkload: {
      type: Number,
      default: 0,
      min: 0,
    },
    availabilityStatus: {
      type: String,
      enum: ['AVAILABLE', 'BUSY', 'OFF_DUTY'],
      default: 'AVAILABLE',
      index: true,
    },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        validate: {
          validator: function (v: number[]) {
            return !v || (v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90);
          },
          message: 'Coordinates must be valid [longitude, latitude] where -180 <= lng <= 180 and -90 <= lat <= 90',
        },
      },
      address: { type: String },
    },
    shift: {
      type: String,
      enum: ['MORNING', 'EVENING', 'NIGHT', 'ON_CALL'],
      default: 'MORNING',
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

TeamSchema.index({ currentLocation: '2dsphere' }, { sparse: true });

export const TeamModel = mongoose.models.Team || mongoose.model<ITeam>('Team', TeamSchema);
