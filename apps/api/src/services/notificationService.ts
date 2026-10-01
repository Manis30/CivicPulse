import mongoose from 'mongoose';
import { notificationRepository } from '../repositories/notificationRepository.js';
import { INotification, NotificationType, NotificationChannel } from '../models/Notification.js';

export class NotificationService {
  async sendNotification(params: {
    recipientId: string;
    incidentId?: string;
    title: string;
    body: string;
    type?: NotificationType;
    channel?: NotificationChannel;
    metadata?: Record<string, unknown>;
  }): Promise<INotification> {
    return notificationRepository.create({
      recipientId: new mongoose.Types.ObjectId(params.recipientId),
      incidentId: params.incidentId ? new mongoose.Types.ObjectId(params.incidentId) : undefined,
      title: params.title,
      body: params.body,
      type: params.type || 'INFO',
      channel: params.channel || 'IN_APP',
      metadata: params.metadata,
      createdAt: new Date(),
    });
  }

  async createNotification(params: {
    recipientId: string;
    incidentId?: string;
    title: string;
    body: string;
    type?: NotificationType;
    channel?: NotificationChannel;
    metadata?: Record<string, unknown>;
  }): Promise<INotification> {
    return this.sendNotification(params);
  }

  async getCitizenNotifications(citizenId: string, limit = 50): Promise<INotification[]> {
    return notificationRepository.findByRecipientId(citizenId, limit);
  }

  async markAsRead(notificationId: string): Promise<INotification | null> {
    return notificationRepository.markAsRead(notificationId);
  }
}

export const notificationService = new NotificationService();
