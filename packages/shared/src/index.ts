/**
 * CivicPulse - Enterprise Shared Types & Domain Models
 * Authoritative system contracts for Frontend and Backend
 */

// ==========================================
// 1. User & Identity Contracts
// ==========================================

export type UserRole = 
  | 'CITIZEN'
  | 'FIELD_OFFICER'
  | 'DEPARTMENT_MANAGER'
  | 'PLATFORM_ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  departmentId?: string;
  teamId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 2. Incident & Workflow State Machine
// ==========================================

/**
 * Official CivicPulse Incident State Machine:
 * SUBMITTED -> ANALYZING -> VALIDATED -> ASSIGNED -> IN_PROGRESS -> RESOLVED -> VERIFYING -> CLOSED
 *                                                                            -> REOPENED -> ASSIGNED
 * Note: VALIDATED is the state prior to assignment.
 * Verification is strictly reserved for post-resolution.
 */
export type IncidentStatus = 
  | 'SUBMITTED'
  | 'ANALYZING'
  | 'VALIDATED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'VERIFYING'
  | 'CLOSED'
  | 'REOPENED';

export type OperationalFlag = 
  | 'SLA_BREACH'
  | 'ATTENTION_REQUIRED'
  | 'REQUIRES_HUMAN_REVIEW'
  | 'ESCALATED';

export type SeverityLevel = 
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export type IncidentCategory = 
  | 'POTHOLE'
  | 'GARBAGE'
  | 'STREETLIGHT'
  | 'WATER_LEAK'
  | 'DRAINAGE'
  | 'FALLEN_TREE'
  | 'ROAD_DAMAGE'
  | 'ILLEGAL_DUMPING'
  | 'OTHER';

export type EvidenceType = 
  | 'BEFORE'
  | 'INSPECTION'
  | 'REPAIR'
  | 'AFTER'
  | 'SUPPORTING';

// ==========================================
// 3. AI Agent Ecosystem & Engine Modes
// ==========================================

export type AgentId = 
  | 'AGENT_VISION'
  | 'AGENT_LOCATION'
  | 'AGENT_DUPLICATE'
  | 'AGENT_SEVERITY'
  | 'AGENT_ROUTING'
  | 'AGENT_INVESTIGATION'
  | 'AGENT_OPERATIONS'
  | 'AGENT_VERIFICATION'
  | 'AGENT_NOTIFICATION'
  | 'AGENT_INTELLIGENCE';

/**
 * JSON-Safe Value type representing any valid JSON payload.
 * Supports primitives, arrays, nested objects, and null without using `any`.
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/**
 * Execution Engine Modes:
 * GEMINI_AI: Multimodal and LLM reasoning via Google Gemini API
 * GROQ_LLM: High-speed LLM reasoning via Groq API
 * DETERMINISTIC_ENGINE: Algorithmic fallback (geospatial, heuristic risk matrix, state checks)
 * Must NEVER call deterministic execution 'AI'.
 */
export type ExecutionMode = 
  | 'GEMINI_AI'
  | 'GROQ_LLM'
  | 'DETERMINISTIC_ENGINE';

export type AgentExecutionStatus = 
  | 'RUNNING'
  | 'SUCCESS'
  | 'FAILED'
  | 'FALLBACK';

export interface ToolInvocationTrace {
  toolName: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  durationMs: number;
  success: boolean;
  error?: string;
}

export interface AgentExecution {
  id: string;
  agentId: AgentId;
  agentName: string;
  executionMode: ExecutionMode;
  orchestrationId?: string;
  parentExecutionId?: string;
  sequence?: number;
  incidentId?: string;
  reportId?: string;
  status: AgentExecutionStatus;
  toolsCalled: ToolInvocationTrace[];
  reasoning: string;
  durationMs: number;
  startedAt: string;
  completedAt?: string;
  retryCount: number;
  error?: {
    code: string;
    message: string;
  };
}

export type OrchestrationStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'SUCCESS'
  | 'PARTIAL'
  | 'REQUIRES_HUMAN_REVIEW'
  | 'FAILED';

export interface OrchestrationAgentTrace {
  agentId: AgentId;
  sequence: number;
  status: 'SUCCESS' | 'FAILED' | 'SKIPPED' | 'REQUIRES_HUMAN_REVIEW';
  executionId: string;
  durationMs: number;
  toolCalls: string[];
  error?: { code: string; message: string };
}

export interface OrchestrationResult {
  orchestrationId: string;
  status: OrchestrationStatus;
  incidentId: string;
  reportId?: string;
  agentResults: Record<string, JsonValue>;
  finalState: IncidentStatus;
  requiresHumanReview: boolean;
  executionIds: string[];
  durationMs: number;
  trace: OrchestrationAgentTrace[];
}

// ==========================================
// 4. Incident, Evidence & Work Order Entities
// ==========================================

export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
  ward: string;
  zone: string;
  municipality?: string;
  nearbyLandmarks?: string[];
}

export interface SeverityReasoning {
  level: SeverityLevel;
  score: number;
  factors: string[];
  explanation: string;
  calculatedAt: string;
  calculatedBy: AgentId | string;
}

export interface VerificationResult {
  outcome: 'LIKELY_RESOLVED' | 'POSSIBLY_UNRESOLVED';
  confidence: number;
  explanation: string;
  beforeEvidenceId: string;
  afterEvidenceId: string;
  verifiedAt: string;
  verifiedByAgent: AgentId;
}

export interface Incident {
  id: string; // e.g. "INC-2026-1048"
  primaryReportId: string;
  linkedReportIds: string[];
  category: IncidentCategory;
  status: IncidentStatus;
  severity: SeverityLevel;
  severityReasoning?: SeverityReasoning;
  operationalFlags: OperationalFlag[];
  location: GeoLocation;
  departmentId?: string;
  assignedTeamId?: string;
  assignedOfficerId?: string;
  workOrderId?: string;
  sla: {
    targetHours: number;
    deadline: string;
    isOverdue: boolean;
    escalated: boolean;
  };
  investigationSummary?: string;
  verificationResult?: VerificationResult;
  reopenCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Evidence {
  id: string;
  incidentId?: string;
  reportId?: string;
  type: EvidenceType;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy: string;
  source: 'CITIZEN' | 'OFFICER' | 'AGENT';
  metadata?: Record<string, unknown>;
  aiAnalysis?: {
    labels: string[];
    confidence: number;
    quality: 'POOR' | 'ACCEPTABLE' | 'GOOD' | 'HIGH';
    observations: string[];
  };
  createdAt: string;
}

export interface WorkOrder {
  id: string; // e.g. "WO-2026-4091"
  incidentId: string;
  departmentId: string;
  teamId: string;
  assignedOfficerId?: string;
  priority: SeverityLevel;
  status: 'DRAFT' | 'DISPATCHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledStart: string;
  slaDeadline: string;
  actualStart?: string;
  completedAt?: string;
  fieldNotes?: string;
  checklist: Array<{
    item: string;
    completed: boolean;
    notes?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  code: string; // "ROADS", "SANITATION", "ELECTRICAL", "WATER", "ENVIRONMENT"
  name: string;
  description: string;
  categoriesHandled: IncidentCategory[];
  activeTeamsCount: number;
  contactEmail: string;
  slaHoursConfig: Record<SeverityLevel, number>;
}

export interface Team {
  id: string;
  departmentId: string;
  name: string;
  leaderId: string;
  memberIds: string[];
  currentWorkload: number;
  maxCapacity: number;
  status: 'AVAILABLE' | 'BUSY' | 'OFF_DUTY';
  currentIncidentId?: string;
}

// ==========================================
// 5. Notifications & Audit Logs
// ==========================================

export interface Notification {
  id: string;
  recipientId: string;
  recipientRole: UserRole;
  incidentId?: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ACTION_REQUIRED' | 'ALERT';
  read: boolean;
  channels: ('IN_APP' | 'EMAIL')[];
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: 'INCIDENT' | 'WORK_ORDER' | 'EVIDENCE' | 'POLICY' | 'USER';
  entityId: string;
  actorId: string;
  actorType: 'USER' | 'AGENT';
  ipAddress?: string;
  changes?: Record<string, { before: unknown; after: unknown }>;
  timestamp: string;
}

// ==========================================
// 6. AI Policy Foundation (Requirement 21)
// ==========================================

export interface PolicyRule<T = unknown> {
  ruleKey: string;
  description: string;
  value: T;
  type: 'number' | 'string' | 'boolean' | 'array' | 'object';
  editable: boolean;
}

export interface PolicyVersion {
  version: number;
  changedBy: string;
  changedAt: string;
  previousValue: unknown;
  newValue: unknown;
  reason: string;
}

export interface AIPolicy {
  id: string;
  name: string;
  agentId?: AgentId;
  category: 'DUPLICATE' | 'SEVERITY' | 'ROUTING' | 'VERIFICATION' | 'EXECUTION';
  rules: Record<string, PolicyRule>;
  history: PolicyVersion[];
  active: boolean;
  updatedAt: string;
}

export interface PolicyContext {
  agentId: AgentId;
  incidentId?: string;
  userId?: string;
  timestamp: string;
  attributes: Record<string, unknown>;
}

// ==========================================
// 7. Idempotency Foundation (Requirement 20)
// ==========================================

export interface IdempotencyRecord {
  idempotencyKey: string;
  executionId: string;
  toolName: string;
  resourceId: string;
  status: 'PENDING' | 'RESOLVED' | 'FAILED';
  result?: Record<string, unknown>;
  createdAt: string;
  expiresAt: string;
}

// ==========================================
// 8. Design Tokens & System Constants
// ==========================================

export const CIVIC_DESIGN_TOKENS = {
  colors: {
    bgVoid: '#05070B',
    bgSurface: '#0B1017',
    bgSurfaceElevated: '#111827',
    bgSurfaceOverlay: 'rgba(17, 24, 39, 0.75)',
    borderSubtle: 'rgba(255, 255, 255, 0.08)',
    borderActive: 'rgba(56, 189, 248, 0.35)',
    accentCyan: '#0EA5E9',
    accentPurple: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#F43F5E',
  },
  severityColors: {
    LOW: '#0EA5E9',       // neutral / cyan
    MEDIUM: '#F59E0B',    // amber
    HIGH: '#F97316',      // orange / danger
    CRITICAL: '#F43F5E',  // rose / red
  },
  statusColors: {
    SUBMITTED: '#64748B',
    ANALYZING: '#8B5CF6',
    VALIDATED: '#0EA5E9',
    ASSIGNED: '#38BDF8',
    IN_PROGRESS: '#F59E0B',
    RESOLVED: '#10B981',
    VERIFYING: '#8B5CF6',
    CLOSED: '#059669',
    REOPENED: '#F43F5E',
  }
} as const;

export const VALID_STATUS_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  SUBMITTED: ['ANALYZING'],
  ANALYZING: ['VALIDATED'],
  VALIDATED: ['ASSIGNED'],
  ASSIGNED: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: ['VERIFYING'],
  VERIFYING: ['CLOSED', 'REOPENED'],
  REOPENED: ['ASSIGNED'],
  CLOSED: [] // Terminal state in standard state machine
};

