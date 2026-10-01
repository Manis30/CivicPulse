import { z } from 'zod';

/**
 * CivicPulse Agent Tool Registry Interface
 * 
 * In Phase 3, this registry registers all tools with Zod input/output schemas,
 * required permissions, and policy checks.
 * 
 * Flow:
 * Agent -> Tool Registry -> Agent Permission Check -> Policy Check -> 
 * Zod Input Validation -> Service Layer -> MongoDB -> Audit Log -> Tool Result -> Agent
 */

export interface RegisteredTool<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  requiredPermission: string;
  inputSchema: z.ZodSchema<TInput>;
  outputSchema: z.ZodSchema<TOutput>;
  idempotent: boolean;
}

export const registeredToolsPlaceholder: RegisteredTool[] = [
  {
    name: 'analyzeImage',
    description: 'Analyzes visual content of evidence image and extracts candidate issue categories',
    requiredPermission: 'tools:vision:analyze',
    inputSchema: z.object({ evidenceId: z.string(), mimeType: z.string() }),
    outputSchema: z.object({ category: z.string(), confidence: z.number(), observations: z.array(z.string()) }),
    idempotent: true,
  },
  {
    name: 'resolveCoordinates',
    description: 'Reverse geocodes coordinates to street address, municipal ward, and sensitive landmarks',
    requiredPermission: 'tools:location:geocode',
    inputSchema: z.object({ lat: z.number(), lng: z.number() }),
    outputSchema: z.object({ address: z.string(), ward: z.string(), zone: z.string() }),
    idempotent: true,
  },
  {
    name: 'verifyResolution',
    description: 'Compares BEFORE and AFTER evidence to verify issue resolution',
    requiredPermission: 'tools:verification:evaluate',
    inputSchema: z.object({ incidentId: z.string(), beforeEvidenceId: z.string(), afterEvidenceId: z.string() }),
    outputSchema: z.object({ outcome: z.enum(['LIKELY_RESOLVED', 'POSSIBLY_UNRESOLVED']), confidence: z.number(), explanation: z.string() }),
    idempotent: true,
  }
];
