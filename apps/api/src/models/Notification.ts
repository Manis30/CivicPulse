import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType = 'INFO' | 'WARNING' | 'ACTION_REQUIRED' | 'ALERT';
export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS';

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  incidentId?: mongoose.Types.ObjectId;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  body: string;
  readAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient reference is required'],
      index: true,
    },
    incidentId: {
      type: Schema.Types.ObjectId,
      ref: 'Incident',
      index: true,
    },
    type: {
      type: String,
      enum: ['INFO', 'WARNING', 'ACTION_REQUIRED', 'ALERT'],
      default: 'INFO',
    },
    channel: {
      type: String,
      enum: ['IN_APP', 'EMAIL', 'SMS'],
      default: 'IN_APP',
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    body: {
      type: String,
      required: [true, 'Notification body is required'],
      trim: true,
    },
    readAt: {
      type: Date,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

export const NotificationModel =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
