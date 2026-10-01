import { z } from 'zod';

export const DuplicateAgentInputSchema = z.object({
  incidentId: z.string().min(1, 'incidentId is required'),
  reportId: z.string().optional(),
  category: z.string().min(1, 'category is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  description: z.string().min(1, 'description is required'),
  radiusMeters: z.number().min(1).max(50000).optional().default(500),
});

export type DuplicateAgentInput = z.infer<typeof DuplicateAgentInputSchema>;

export const DuplicateAgentOutputSchema = z.object({
  isDuplicate: z.boolean(),
  confidence: z.number().min(0).max(1),
  matchedIncidentId: z.string().optional(),
  matchedIncidentNumber: z.string().optional(),
  action: z.enum(['NEW_INCIDENT', 'LINK_EXISTING', 'REVIEW']),
  requiresHumanReview: z.boolean(),
  rationaleSummary: z.string().min(3).max(500),
});

export type DuplicateAgentOutput = z.infer<typeof DuplicateAgentOutputSchema>;
