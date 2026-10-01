import mongoose from 'mongoose';
import { INotification, NotificationModel } from '../models/Notification.js';

export class NotificationRepository {
  async create(data: Partial<INotification>): Promise<INotification> {
    return NotificationModel.create(data);
  }

  async findByRecipientId(recipientId: string, limit = 50): Promise<INotification[]> {
    if (!mongoose.Types.ObjectId.isValid(recipientId)) return [];
    return NotificationModel.find({ recipientId: new mongoose.Types.ObjectId(recipientId) })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async markAsRead(notificationId: string): Promise<INotification | null> {
    if (!mongoose.Types.ObjectId.isValid(notificationId)) return null;
    return NotificationModel.findByIdAndUpdate(notificationId, { readAt: new Date() }, { returnDocument: 'after' });
  }
}

export const notificationRepository = new NotificationRepository();
