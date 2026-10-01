import { z } from 'zod';

export const IntelligenceAgentInputSchema = z.object({
  ward: z.string().optional(),
  category: z.string().optional(),
  timeWindowDays: z.number().default(30),
});

export type IntelligenceAgentInput = z.infer<typeof IntelligenceAgentInputSchema>;

export const IntelligenceAgentOutputSchema = z.object({
  summary: z.string(),
  cityHealthScore: z.number().min(0).max(100),
  hotspots: z.array(
    z.object({
      ward: z.string(),
      category: z.string(),
      incidentCount: number(),
      riskIndex: z.number(),
    })
  ).default([]),
  chronicInfrastructure: z.array(z.string()).default([]),
  requiresHumanReview: z.boolean().default(false),
});

export type IntelligenceAgentOutput = z.infer<typeof IntelligenceAgentOutputSchema>;

function number() {
  return z.number();
}
