import mongoose, { Schema, Document } from 'mongoose';

export type PolicyCategory =
  | 'duplicateDetection'
  | 'severityRules'
  | 'executionPolicies'
  | 'autoReopenRules'
  | 'investigationTriggerPolicy';

export interface IPolicyRuleItem {
  ruleKey: string;
  description: string;
  value: unknown;
  type: 'number' | 'string' | 'boolean' | 'array' | 'object';
  editable: boolean;
}

export interface IPolicyHistoryItem {
  version: number;
  changedBy: string;
  changedAt: Date;
  previousValue: unknown;
  newValue: unknown;
  reason: string;
}

export interface IAIPolicy extends Document {
  name: string;
  version: number;
  category: PolicyCategory;
  agentId?: string;
  description: string;
  rules: Record<string, IPolicyRuleItem>;
  isActive: boolean;
  history: IPolicyHistoryItem[];
  changedBy?: string;
  changedAt?: Date;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PolicyRuleItemSchema = new Schema<IPolicyRuleItem>(
  {
    ruleKey: { type: String, required: true },
    description: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },
    type: {
      type: String,
      enum: ['number', 'string', 'boolean', 'array', 'object'],
      required: true,
    },
    editable: { type: Boolean, default: true },
  },
  { _id: false }
);

const PolicyHistoryItemSchema = new Schema<IPolicyHistoryItem>(
  {
    version: { type: Number, required: true },
    changedBy: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    previousValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed, required: true },
    reason: { type: String, required: true },
  },
  { _id: false }
);

const AIPolicySchema = new Schema<IAIPolicy>(
  {
    name: {
      type: String,
      required: [true, 'Policy name is required'],
      trim: true,
    },
    version: {
      type: Number,
      required: [true, 'Policy version is required'],
      default: 1,
    },
    category: {
      type: String,
      enum: [
        'duplicateDetection',
        'severityRules',
        'executionPolicies',
        'autoReopenRules',
        'investigationTriggerPolicy',
      ],
      required: [true, 'Policy category is required'],
      index: true,
    },
    agentId: {
      type: String,
    },
    description: {
      type: String,
      required: [true, 'Policy description is required'],
      trim: true,
    },
    rules: {
      type: Map,
      of: PolicyRuleItemSchema,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    history: {
      type: [PolicyHistoryItemSchema],
      default: [],
    },
    changedBy: { type: String },
    changedAt: { type: Date },
    reason: { type: String },
  },
  {
    timestamps: true,
  }
);

AIPolicySchema.index({ name: 1, version: 1 }, { unique: true });

export const AIPolicyModel =
  mongoose.models.AIPolicy || mongoose.model<IAIPolicy>('AIPolicy', AIPolicySchema);
