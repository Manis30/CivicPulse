import mongoose, { Schema, Document } from 'mongoose';
import { AgentId, ExecutionMode, AgentExecutionStatus } from '@civicpulse/shared';

export interface IToolInvocation {
  toolName: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  durationMs: number;
  success: boolean;
  error?: string;
}

export interface IAgentExecution extends Document {
  executionId: string;
  agentId: AgentId;
  agentName: string;
  executionMode: ExecutionMode;
  requestedEngine?: ExecutionMode;
  actualEngine?: ExecutionMode;
  fallbackReason?: string;
  orchestrationId?: string;
  parentExecutionId?: string;
  sequence?: number;
  incidentId?: mongoose.Types.ObjectId;
  reportId?: mongoose.Types.ObjectId;
  toolsCalled: IToolInvocation[];
  toolCalled?: string;
  inputSummary?: string;
  permissionResult?: Record<string, unknown>;
  policyResult?: Record<string, unknown>;
  outputSummary?: string;
  reasoning?: string;
  iterations?: number;
  durationMs: number;
  status: AgentExecutionStatus;
  error?: {
    code: string;
    message: string;
  };
  retryCount: number;
  startedAt?: Date;
  completedAt?: Date;
  timestamp: Date;
  createdAt: Date;
}

const ToolInvocationSchema = new Schema<IToolInvocation>(
  {
    toolName: { type: String, required: true },
    input: { type: Schema.Types.Mixed, default: {} },
    output: { type: Schema.Types.Mixed, default: {} },
    durationMs: { type: Number, required: true },
    success: { type: Boolean, required: true },
    error: { type: String },
  },
  { _id: false }
);

const AgentExecutionSchema = new Schema<IAgentExecution>(
  {
    executionId: {
      type: String,
      required: [true, 'Execution ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    agentId: {
      type: String,
      enum: [
        'AGENT_VISION',
        'AGENT_LOCATION',
        'AGENT_DUPLICATE',
        'AGENT_SEVERITY',
        'AGENT_ROUTING',
        'AGENT_INVESTIGATION',
        'AGENT_OPERATIONS',
        'AGENT_VERIFICATION',
        'AGENT_NOTIFICATION',
        'AGENT_INTELLIGENCE',
      ],
      required: [true, 'Agent ID is required'],
      index: true,
    },
    agentName: {
      type: String,
      required: [true, 'Agent Name is required'],
    },
    executionMode: {
      type: String,
      enum: ['GEMINI_AI', 'GROQ_LLM', 'DETERMINISTIC_ENGINE'],
      required: [true, 'Execution Mode is required'],
      index: true,
    },
    requestedEngine: {
      type: String,
      enum: ['GEMINI_AI', 'GROQ_LLM', 'DETERMINISTIC_ENGINE'],
    },
    actualEngine: {
      type: String,
      enum: ['GEMINI_AI', 'GROQ_LLM', 'DETERMINISTIC_ENGINE'],
    },
    fallbackReason: { type: String },
    orchestrationId: { type: String, index: true },
    parentExecutionId: { type: String, index: true },
    sequence: { type: Number },
    incidentId: {
      type: Schema.Types.ObjectId,
      ref: 'Incident',
      index: true,
    },
    reportId: {
      type: Schema.Types.ObjectId,
      ref: 'Report',
    },
    toolsCalled: {
      type: [ToolInvocationSchema],
      default: [],
    },
    toolCalled: { type: String },
    inputSummary: { type: String },
    permissionResult: { type: Schema.Types.Mixed },
    policyResult: { type: Schema.Types.Mixed },
    outputSummary: { type: String },
    reasoning: { type: String },
    iterations: { type: Number, min: 0 },
    startedAt: { type: Date },
    completedAt: { type: Date },
    durationMs: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    status: {
      type: String,
      enum: ['RUNNING', 'SUCCESS', 'FAILED', 'FALLBACK'],
      required: true,
      index: true,
    },
    error: {
      code: { type: String },
      message: { type: String },
    },
    retryCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const AgentExecutionModel =
  mongoose.models.AgentExecution ||
  mongoose.model<IAgentExecution>('AgentExecution', AgentExecutionSchema);
