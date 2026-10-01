import { z } from 'zod';
import { ToolDefinition } from '../registry/ToolDefinition.js';
import { notificationService } from '../../services/notificationService.js';

export const sendNotificationTool: ToolDefinition = {
  name: 'sendNotification',
  description: 'Sends automated operational notification to a user, field crew, or manager',
  category: 'WRITE',
  requiredPermission: 'tools:notification:send',
  inputSchema: z.object({
    recipientId: z.string().min(1),
    incidentId: z.string().optional(),
    title: z.string().min(3).max(100),
    body: z.string().min(3).max(1000),
    type: z.enum(['INFO', 'WARNING', 'ACTION_REQUIRED', 'ALERT']).default('INFO'),
    channel: z.enum(['IN_APP', 'EMAIL', 'SMS']).default('IN_APP'),
  }),
  outputSchema: z.object({
    notificationId: z.string(),
    recipientId: z.string(),
    delivered: z.boolean(),
    timestamp: z.string(),
  }),
  auditConfig: {
    resourceType: 'NOTIFICATION',
    getResourceId: (_input, output) => output.notificationId,
    action: 'NOTIFICATION_DISPATCHED',
  },
  execute: async (input) => {
    const notification = await notificationService.createNotification({
      recipientId: input.recipientId as any,
      incidentId: input.incidentId as any,
      title: input.title,
      body: input.body,
      type: input.type,
      channel: input.channel,
    });

    return {
      notificationId: notification._id.toString(),
      recipientId: input.recipientId,
      delivered: true,
      timestamp: new Date().toISOString(),
    };
  },
};
