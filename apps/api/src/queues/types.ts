import { z } from 'zod';
import { ExecutionMode, IncidentStatus, OrchestrationStatus } from '@civicpulse/shared';

/**
 * Dedicated queue name for CivicPulse autonomous agent workflow.
 * Authoritative system constant.
 */
export const AGENT_WORKFLOW_QUEUE_NAME = 'civicpulse-agent-workflow';

/**
 * Strict schema for workflow jobs enqueued to BullMQ.
 * 
 * GUARANTEES:
 * - Small and serializable
 * - Never contains passwords, JWTs, API keys, credentials, or unrestricted DB documents
 */
export const WorkflowJobPayloadSchema = z.object({
  orchestrationId: z.string().min(1, 'orchestrationId is required'),
  incidentId: z.string().min(1, 'incidentId is required'),
  reportId: z.string().optional(),
  executionMode: z.enum(['GEMINI_AI', 'GROQ_LLM', 'DETERMINISTIC_ENGINE']).default('DETERMINISTIC_ENGINE'),
  requestedEngine: z.string().optional(),
  requestedAt: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

export type WorkflowJobPayload = z.infer<typeof WorkflowJobPayloadSchema>;

/**
 * Asynchronous workflow job states in BullMQ / Worker execution.
 */
export type WorkflowJobStatus = 'QUEUED' | 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'RETRYING';

/**
 * Structured workflow error categories for retry classification.
 */
export type WorkflowErrorCode =
  | 'VALIDATION_ERROR'
  | 'PERMISSION_DENIED'
  | 'POLICY_REJECTED'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'TRANSIENT_FAILURE'
  | 'PROVIDER_FAILURE'
  | 'DATABASE_FAILURE'
  | 'ORCHESTRATION_FAILURE'
  | 'UNKNOWN_FAILURE';

/**
 * Determines whether a failure is transient and eligible for BullMQ exponential backoff retry.
 * Non-retryable failures: validation, permission, policy, not found, conflict.
 */
export function isRetryableError(code: WorkflowErrorCode): boolean {
  const nonRetryable: WorkflowErrorCode[] = [
    'VALIDATION_ERROR',
    'PERMISSION_DENIED',
    'POLICY_REJECTED',
    'NOT_FOUND',
    'CONFLICT',
  ];
  return !nonRetryable.includes(code);
}

/**
 * Persisted structured job result.
 * Never stores chain-of-thought, model monologue, or raw internal reasoning.
 */
export interface WorkflowJobResult {
  jobId: string;
  orchestrationId: string;
  incidentId: string;
  status: 'COMPLETED' | 'FAILED';
  orchestrationStatus: OrchestrationStatus;
  finalIncidentState: IncidentStatus;
  requiresHumanReview: boolean;
  attempt: number;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  executionIds: string[];
  error?: {
    code: WorkflowErrorCode;
    message: string;
    isRetryable: boolean;
  };
  engineMetadata?: Record<string, unknown>;
}
