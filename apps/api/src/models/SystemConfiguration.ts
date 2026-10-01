import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemConfiguration extends Document {
  clusterName: string;
  timezone: string;
  autoDispatchThreshold: number;
  slaGraceMinutes: number;
  integrations: {
    gemini: { configured: boolean; model: string };
    redis: { configured: boolean };
    mapbox: { configured: boolean };
    webhooks: { configured: boolean };
  };
  featureFlags: {
    autonomousDispatch: boolean;
    strictJurisdictionMatching: boolean;
    multimodalVerification: boolean;
    telemetryStreaming: boolean;
  };
  updatedAt: Date;
}

const SystemConfigurationSchema = new Schema<ISystemConfiguration>(
  {
    clusterName: {
      type: String,
      default: 'Hosur City Municipal Corporation (District Central)',
      required: true,
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata (IST)',
      required: true,
    },
    autoDispatchThreshold: {
      type: Number,
      default: 0.75,
      required: true,
    },
    slaGraceMinutes: {
      type: Number,
      default: 30,
      required: true,
    },
    integrations: {
      gemini: {
        configured: { type: Boolean, default: true },
        model: { type: String, default: 'gemini-1.5-flash' },
      },
      redis: {
        configured: { type: Boolean, default: true },
      },
      mapbox: {
        configured: { type: Boolean, default: true },
      },
      webhooks: {
        configured: { type: Boolean, default: false },
      },
    },
    featureFlags: {
      autonomousDispatch: { type: Boolean, default: true },
      strictJurisdictionMatching: { type: Boolean, default: true },
      multimodalVerification: { type: Boolean, default: true },
      telemetryStreaming: { type: Boolean, default: true },
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'system_configurations',
  }
);

export const SystemConfigurationModel = mongoose.model<ISystemConfiguration>(
  'SystemConfiguration',
  SystemConfigurationSchema
);
