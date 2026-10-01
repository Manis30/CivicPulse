import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '@civicpulse/shared';

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  departmentId?: mongoose.Types.ObjectId;
  teamId?: mongoose.Types.ObjectId;
  isActive: boolean;
  avatarUrl?: string;
  notificationPreferences: {
    channels: ('IN_APP' | 'EMAIL' | 'SMS')[];
    alertOnCritical: boolean;
    weeklyDigest: boolean;
  };
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'User email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false, // Do not return passwordHash in standard queries
    },
    role: {
      type: String,
      enum: ['CITIZEN', 'FIELD_OFFICER', 'DEPARTMENT_MANAGER', 'PLATFORM_ADMIN'],
      required: [true, 'User role is required'],
      index: true,
    },
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
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    avatarUrl: {
      type: String,
    },
    notificationPreferences: {
      channels: {
        type: [String],
        enum: ['IN_APP', 'EMAIL', 'SMS'],
        default: ['IN_APP', 'EMAIL'],
      },
      alertOnCritical: {
        type: Boolean,
        default: true,
      },
      weeklyDigest: {
        type: Boolean,
        default: false,
      },
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as Record<string, unknown>).passwordHash;
        return ret;
      },
    },
  }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
