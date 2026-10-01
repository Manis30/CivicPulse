import mongoose, { Schema, Document } from 'mongoose';
import { SeverityLevel } from '@civicpulse/shared';

export type WorkOrderStatus = 'CREATED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface IWorkOrderChecklistItem {
  item: string;
  completed: boolean;
  notes?: string;
}

export interface IWorkOrderSla {
  startedAt?: Date;
  deadlineAt: Date;
  targetHours: number;
  breachedAt?: Date;
}

export interface IWorkOrder extends Document {
  _id: mongoose.Types.ObjectId;
  id: string;
  workOrderNumber: string;
  incidentId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  teamId: mongoose.Types.ObjectId;
  assignedOfficerId?: mongoose.Types.ObjectId;
  priority: SeverityLevel;
  status: WorkOrderStatus;
  sla: IWorkOrderSla;
  checklist: IWorkOrderChecklistItem[];
  inspectionNotes?: string;
  completionNotes?: string;
  beforeEvidenceIds: mongoose.Types.ObjectId[];
  afterEvidenceIds: mongoose.Types.ObjectId[];
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChecklistItemSchema = new Schema<IWorkOrderChecklistItem>(
  {
    item: { type: String, required: true },
    completed: { type: Boolean, default: false },
    notes: { type: String },
  },
  { _id: false }
);

const WorkOrderSlaSchema = new Schema<IWorkOrderSla>(
  {
    startedAt: { type: Date },
    deadlineAt: { type: Date, required: true, index: true },
    targetHours: { type: Number, required: true },
    breachedAt: { type: Date },
  },
  { _id: false }
);

const WorkOrderSchema = new Schema<IWorkOrder>(
  {
    workOrderNumber: {
      type: String,
      required: [true, 'Work order number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    incidentId: {
      type: Schema.Types.ObjectId,
      ref: 'Incident',
      required: [true, 'Incident reference is required'],
      index: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required'],
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Team reference is required'],
      index: true,
    },
    assignedOfficerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['CREATED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'CREATED',
      index: true,
    },
    sla: {
      type: WorkOrderSlaSchema,
      required: true,
    },
    checklist: {
      type: [ChecklistItemSchema],
      default: [],
    },
    inspectionNotes: { type: String },
    completionNotes: { type: String },
    beforeEvidenceIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Evidence',
      },
    ],
    afterEvidenceIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Evidence',
      },
    ],
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const WorkOrderModel =
  mongoose.models.WorkOrder || mongoose.model<IWorkOrder>('WorkOrder', WorkOrderSchema);
