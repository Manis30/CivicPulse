import { z } from 'zod';

export const VerificationAgentInputSchema = z.object({
  incidentId: z.string().min(1, 'incidentId is required'),
  category: z.string().optional(),
  beforeImageUrl: z.string().min(1, 'beforeImageUrl is required'),
  afterImageUrl: z.string().min(1, 'afterImageUrl is required'),
  threshold: z.number().min(0).max(1).default(0.75),
});

export type VerificationAgentInput = z.infer<typeof VerificationAgentInputSchema>;

export const VerificationAgentOutputSchema = z.object({
  decision: z.enum(['PASS', 'FAIL']),
  confidence: z.number().min(0).max(1),
  observations: z.array(z.string()).default([]),
  remainingIssues: z.array(z.string()).default([]),
  reasoning: z.string().min(3),
  engineUsed: z.enum(['GEMINI_AI', 'GROQ_LLM', 'DETERMINISTIC_ENGINE']).default('DETERMINISTIC_ENGINE'),
  requiresHumanReview: z.boolean().default(false),
});

export type VerificationAgentOutput = z.infer<typeof VerificationAgentOutputSchema>;
