import { z } from 'zod';
import { SeverityLevel } from '@civicpulse/shared';

export const OperationsAgentInputSchema = z.object({
  incidentId: z.string().min(1, 'incidentId is required'),
  departmentId: z.string().min(1, 'departmentId is required'),
  teamId: z.string().min(1, 'teamId is required'),
  assignedOfficerId: z.string().optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  category: z.string().default('POTHOLE'),
});

export type OperationsAgentInput = z.infer<typeof OperationsAgentInputSchema>;

export const OperationsAgentOutputSchema = z.object({
  workOrderId: z.string(),
  workOrderNumber: z.string(),
  status: z.string(),
  requiredEquipment: z.array(z.string()).default([]),
  checklist: z.array(
    z.object({
      item: z.string(),
      completed: z.boolean(),
      notes: z.string().optional(),
    })
  ),
  slaHours: z.number(),
  deadlineAt: z.string(),
  requiresHumanReview: z.boolean().default(false),
});

export type OperationsAgentOutput = z.infer<typeof OperationsAgentOutputSchema>;
