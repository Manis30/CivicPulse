import { z } from 'zod';

export const SeverityAgentInputSchema = z.object({
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
  nearbyDuplicatesCount: z.number().min(0).optional().default(0),
  isNearCriticalInfrastructure: z.boolean().optional().default(false),
  citizenReportsWithinHour: z.number().min(0).optional().default(1),
  locationContext: z
    .object({
      address: z.string().optional(),
      ward: z.string().optional(),
      zone: z.string().optional(),
      nearbyLandmarks: z.array(z.string()).optional(),
    })
    .optional(),
});

export type SeverityAgentInput = z.infer<typeof SeverityAgentInputSchema>;

export const SeverityAgentOutputSchema = z.object({
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  confidence: z.number().min(0).max(1),
  riskFactors: z.array(z.string()),
  targetHours: z.number().positive(),
  requiresHumanReview: z.boolean(),
  rationaleSummary: z.string().min(3).max(500),
});

export type SeverityAgentOutput = z.infer<typeof SeverityAgentOutputSchema>;
