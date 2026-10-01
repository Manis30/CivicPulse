import { z } from 'zod';

export const LocationAgentInputSchema = z.object({
  incidentId: z.string().min(1, 'incidentId is required'),
  reportId: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  address: z.string().optional(),
  ward: z.string().optional(),
  zone: z.string().optional(),
});

export type LocationAgentInput = z.infer<typeof LocationAgentInputSchema>;

export const LocationAgentOutputSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string(),
  wardId: z.string(),
  zone: z.string().optional(),
  confidence: z.number().min(0).max(1),
  locationResolved: z.boolean(),
  requiresHumanReview: z.boolean(),
  rationaleSummary: z.string().min(3).max(500),
});

export type LocationAgentOutput = z.infer<typeof LocationAgentOutputSchema>;
