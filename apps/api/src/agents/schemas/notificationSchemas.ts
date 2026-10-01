import { z } from 'zod';

export const NotificationAgentInputSchema = z.object({
  incidentId: z.string().optional(),
  recipientId: z.string().optional(),
  recipientRole: z.enum(['CITIZEN', 'FIELD_OFFICER', 'DEPARTMENT_MANAGER', 'PLATFORM_ADMIN']).optional(),
  type: z.enum(['INFO', 'WARNING', 'ACTION_REQUIRED', 'ALERT']).default('INFO'),
  title: z.string().min(1),
  message: z.string().min(1),
  channels: z.array(z.enum(['IN_APP', 'EMAIL'])).default(['IN_APP']),
});

export type NotificationAgentInput = z.infer<typeof NotificationAgentInputSchema>;

export const NotificationAgentOutputSchema = z.object({
  notificationId: z.string(),
  delivered: z.boolean(),
  channelsDelivered: z.array(z.string()),
  timestamp: z.string(),
  requiresHumanReview: z.boolean().default(false),
});

export type NotificationAgentOutput = z.infer<typeof NotificationAgentOutputSchema>;
