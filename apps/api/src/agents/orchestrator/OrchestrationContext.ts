import { AgentId, JsonValue, OrchestrationStatus } from '@civicpulse/shared';

export interface OrchestrationContext {
  orchestrationId: string;
  incidentId: string;
  reportId?: string;
  currentAgent?: AgentId;
  previousAgent?: AgentId;
  agentResults: Record<string, JsonValue>;
  workflowStatus: OrchestrationStatus;
  startedAt: Date;
  metadata?: Record<string, JsonValue>;
}

export interface CreateOrchestrationContextParams {
  orchestrationId: string;
  incidentId: string;
  reportId?: string;
  metadata?: Record<string, unknown>;
}

const FORBIDDEN_SENSITIVE_KEYS = new Set([
  'password',
  'jwt',
  'token',
  'secret',
  'apikey',
  'api_key',
  'authorization',
  'cookie',
  'credentials',
  'mongouri',
  'mongodb_uri',
]);

/**
 * Sanitizes context metadata to prevent secret leakage or unbounded objects.
 * Never passes database models, Mongoose documents, or HTTP request objects.
 */
export function sanitizeContextMetadata(raw: Record<string, unknown> = {}): Record<string, JsonValue> {
  const sanitized: Record<string, JsonValue> = {};

  for (const [key, val] of Object.entries(raw)) {
    if (FORBIDDEN_SENSITIVE_KEYS.has(key.toLowerCase())) {
      continue;
    }

    // Do not pass Mongoose documents or deep functions
    if (val && typeof val === 'object' && ('_doc' in (val as any) || '$__' in (val as any))) {
      continue;
    }

    if (typeof val === 'function') {
      continue;
    }

    try {
      // Ensure JSON serializability
      sanitized[key] = JSON.parse(JSON.stringify(val));
    } catch {
      // Drop circular or non-serializable fields
    }
  }

  return sanitized;
}

export function createOrchestrationContext(params: CreateOrchestrationContextParams): OrchestrationContext {
  return {
    orchestrationId: params.orchestrationId,
    incidentId: params.incidentId,
    reportId: params.reportId,
    agentResults: {},
    workflowStatus: 'RUNNING',
    startedAt: new Date(),
    metadata: sanitizeContextMetadata(params.metadata),
  };
}
