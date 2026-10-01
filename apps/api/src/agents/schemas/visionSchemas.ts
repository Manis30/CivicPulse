import { z } from 'zod';
import { validateSafeImageUrl } from './imageSafety.js';

export const VisionAgentInputSchema = z.object({
  incidentId: z.string().min(1, 'incidentId is required'),
  reportId: z.string().optional(),
  imageUrl: z
    .string()
    .min(1, 'imageUrl is required')
    .refine((url) => validateSafeImageUrl(url).valid, {
      message: 'imageUrl failed SSRF/HTTPS safety policy validation',
    }),
  issueDescription: z.string().max(2000).optional(),
});

export type VisionAgentInput = z.infer<typeof VisionAgentInputSchema>;

export const VisionAgentOutputSchema = z.object({
  issueType: z.enum([
    'POTHOLE',
    'GARBAGE',
    'STREETLIGHT',
    'DRAINAGE',
    'ROAD_DAMAGE',
    'FLOODING',
    'OTHER',
  ]),
  confidence: z.number().min(0).max(1),
  observations: z.array(z.string()).min(1),
  requiresHumanReview: z.boolean(),
  rationaleSummary: z.string().min(3).max(500),
});

export type VisionAgentOutput = z.infer<typeof VisionAgentOutputSchema>;
