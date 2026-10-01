import { z } from 'zod';

export const InvestigationAgentInputSchema = z.object({
  incidentId: z.string().min(1, 'incidentId is required'),
  category: z.string().optional(),
  ward: z.string().optional(),
  zone: z.string().optional(),
  coordinates: z.tuple([z.number(), z.number()]).optional(),
});

export type InvestigationAgentInput = z.infer<typeof InvestigationAgentInputSchema>;

export const InvestigationAgentOutputSchema = z.object({
  investigationSummary: z.string().min(3),
  isChronicIssue: z.boolean(),
  recurrenceSignal: z.number().min(0),
  relatedIncidentIds: z.array(z.string()).default([]),
  recommendedAction: z.string(),
  requiresHumanReview: z.boolean().default(false),
});

export type InvestigationAgentOutput = z.infer<typeof InvestigationAgentOutputSchema>;
