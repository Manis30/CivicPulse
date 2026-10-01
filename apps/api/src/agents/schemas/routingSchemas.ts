import { z } from 'zod';

export const RoutingAgentInputSchema = z.object({
  incidentId: z.string().min(1, 'incidentId is required'),
  reportId: z.string().optional(),
  category: z.enum([
    'POTHOLE',
    'GARBAGE',
    'STREETLIGHT',
    'WATER_LEAK',
    'DRAINAGE',
    'FALLEN_TREE',
    'ROAD_DAMAGE',
    'ILLEGAL_DUMPING',
    'OTHER',
  ]),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  ward: z.string().min(1, 'ward is required'),
  zone: z.string().optional(),
  departmentId: z.string().optional(),
});

export type RoutingAgentInput = z.infer<typeof RoutingAgentInputSchema>;

export const RoutingAgentOutputSchema = z.object({
  departmentId: z.string(),
  departmentCode: z.string().optional(),
  departmentName: z.string().optional(),
  teamId: z.string().optional(),
  teamName: z.string().optional(),
  assigned: z.boolean(),
  routingStatus: z.enum(['ASSIGNED', 'UNASSIGNED', 'REQUIRES_HUMAN_REVIEW']),
  requiresHumanReview: z.boolean(),
  rationaleSummary: z.string().min(3).max(500),
});

export type RoutingAgentOutput = z.infer<typeof RoutingAgentOutputSchema>;
