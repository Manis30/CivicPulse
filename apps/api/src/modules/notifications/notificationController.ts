import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { NotificationModel } from '../../models/Notification.js';

export class NotificationController {
  async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const role = req.user?.role;

      const query: any = {
        $or: [
          ...(userId && mongoose.Types.ObjectId.isValid(userId) ? [{ recipientId: new mongoose.Types.ObjectId(userId) }] : []),
          ...(role ? [{ recipientRole: role }] : []),
        ],
      };

      // If neither specified, fetch latest platform notifications
      if (query.$or.length === 0) {
        delete query.$or;
      }

      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

      if (page && limit) {
        const total = await NotificationModel.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
        const notifications = await NotificationModel.find(query)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit);

        res.json({
          success: true,
          data: notifications,
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        });
        return;
      }

      const notifications = await NotificationModel.find(query)
        .sort({ createdAt: -1 })
        .limit(50);

      res.json({
        success: true,
        data: notifications,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, error: { message: 'Invalid notification ID' } });
        return;
      }

      const notification = await NotificationModel.findByIdAndUpdate(
        id,
        { read: true, readAt: new Date() },
        { new: true }
      );

      if (!notification) {
        res.status(404).json({ success: false, error: { message: 'Notification not found' } });
        return;
      }

      res.json({
        success: true,
        data: notification,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const query = userId && mongoose.Types.ObjectId.isValid(userId)
        ? { recipientId: new mongoose.Types.ObjectId(userId) }
        : {};

      await NotificationModel.updateMany(query, { read: true, readAt: new Date() });
      res.json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }
}

export const notificationController = new NotificationController();
