import { apiClient } from './apiClient';

export interface PolicyRule {
  ruleKey: string;
  description: string;
  value: any;
  type: string;
  editable: boolean;
}

export interface AIPolicy {
  _id: string;
  name: string;
  category: string;
  agentId: string;
  rules: Record<string, PolicyRule>;
  active: boolean;
  history?: any[];
  updatedAt?: string;
}

export interface UserRecord {
  _id: string;
  email: string;
  name: string;
  role: 'CITIZEN' | 'FIELD_OFFICER' | 'DEPARTMENT_MANAGER' | 'PLATFORM_ADMIN';
  departmentId?: any;
  teamId?: any;
  badgeNumber?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AgentTelemetry {
  agentId: string;
  name: string;
  roleDescription: string;
  status: 'ACTIVE' | 'IDLE' | 'BUSY' | 'DEGRADED' | 'RUNNING';
  executionMode: string;
  tools: string[];
  totalExecutions: number;
  successRate: number;
  failureCount: number;
  averageLatencyMs: number;
  lastActive: string;
}

export interface AgentMetrics {
  totalAgents: number;
  activeAgents: number;
  totalRuns: number;
  successRate: number;
  failedRuns: number;
  averageLatencyMs: number;
  clusterHealth: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    percentage: number;
    redis: string;
    mongodb: string;
    bullmq: string;
  };
}

export interface AgentActivityItem {
  id: string;
  executionId?: string;
  agentId: string;
  agentName: string;
  event: string;
  durationMs: number;
  status: 'SUCCESS' | 'DEGRADED' | 'FAILED' | 'RUNNING';
  startedAt: string;
  timestamp: string;
  incidentId?: string;
  reasoning?: string;
  toolsUsed?: string[];
}

export interface AgentNetworkData {
  orchestrator: {
    id: string;
    name: string;
    subtitle: string;
    tag: string;
    status: string;
  };
  hasChain: boolean;
  latestChain: Array<{
    agentId: string;
    agentName: string;
    sequence: number;
    event: string;
    durationMs: number;
    status: string;
    startedAt: string;
    timestamp: string;
  }>;
}

export interface AgentDetail extends AgentTelemetry {
  toolsDetailed?: Array<{ name: string; permission: string; status: string }>;
  recentExecutions?: AgentExecutionRecord[];
}

export interface AgentExecutionRecord {
  _id: string;
  executionId?: string;
  agentId: string;
  agentName?: string;
  incidentId?: any;
  status: 'STARTED' | 'COMPLETED' | 'SUCCESS' | 'FAILED';
  durationMs: number;
  modelUsed?: string;
  toolsUsed: string[];
  toolsCalled?: any[];
  inputPayload?: any;
  outputPayload?: any;
  confidence?: number;
  reasoning?: string;
  startedAt: string;
  completedAt?: string;
  error?: any;
}

export interface AuditLogRecord {
  _id: string;
  actorType: 'USER' | 'AI_AGENT' | 'SYSTEM';
  actorId?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  before?: any;
  after?: any;
  metadata?: any;
  requestId?: string;
  timestamp: string;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptimeSeconds: number;
  timestamp: string;
  services: {
    mongodb: { status: 'healthy' | 'unhealthy'; pingMs: number };
    redis: { status: 'healthy' | 'unhealthy'; pingMs: number };
    bullmq: { status: 'healthy' | 'unhealthy'; activeWorkers: number; workersReady: boolean };
    memory: { rssMb: number; heapUsedMb: number; heapTotalMb?: number };
  };
}

export interface SystemQueues {
  status: 'healthy' | 'unhealthy';
  queues: {
    orchestration: { waiting: number; active: number; completed: number; failed: number; delayed: number; total: number };
    deadLetter: { waiting: number; active: number; completed: number; failed: number; delayed: number; total: number };
  };
}

export const adminService = {
  async getPolicies(): Promise<AIPolicy[]> {
    const response = await apiClient.get('/admin/policies');
    if (response.data?.success && Array.isArray(response.data?.data)) {
      return response.data.data;
    }
    return [];
  },

  async updatePolicy(payload: { id?: string; category?: string; rules: any; reason?: string }): Promise<AIPolicy> {
    const response = await apiClient.put('/admin/policies', payload);
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error(response.data?.error?.message || 'Failed to update policy');
  },

  async getUsers(params?: {
    role?: string;
    active?: boolean | string;
    search?: string;
    departmentId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ users: UserRecord[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
    const response = await apiClient.get('/admin/users', { params });
    const users = Array.isArray(response.data?.data) ? response.data.data : [];
    const pagination = response.data?.pagination || {
      total: users.length,
      page: Number(params?.page || 1),
      limit: Number(params?.limit || 15),
      totalPages: 1,
    };
    return { users, pagination };
  },

  async getAgentTelemetry(): Promise<AgentTelemetry[]> {
    const response = await apiClient.get('/agents');
    if (response.data?.success && Array.isArray(response.data?.data)) {
      return response.data.data;
    }
    return [];
  },

  async getAgentMetrics(): Promise<AgentMetrics> {
    const response = await apiClient.get('/admin/agent-metrics');
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error('Failed to load agent metrics');
  },

  async getAgentActivity(limit = 40): Promise<AgentActivityItem[]> {
    const response = await apiClient.get('/admin/agent-activity', { params: { limit } });
    if (response.data?.success && Array.isArray(response.data?.data)) {
      return response.data.data;
    }
    return [];
  },

  async getAgentNetwork(): Promise<AgentNetworkData> {
    const response = await apiClient.get('/admin/agent-network');
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error('Failed to load agent network');
  },

  async getAgentById(agentId: string): Promise<AgentDetail | null> {
    const response = await apiClient.get(`/admin/agents/${agentId}`);
    return response.data?.data || null;
  },

  async getAgentPerformance(agentId: string): Promise<{ points: Array<{ index: number; executionId: string; durationMs: number; status: string; timestamp: string }> }> {
    const response = await apiClient.get(`/admin/agents/${agentId}/performance`);
    return response.data?.data || { points: [] };
  },

  async getAgentExecutions(params?: { agentId?: string; status?: string; incidentId?: string; limit?: number }): Promise<AgentExecutionRecord[]> {
    const response = await apiClient.get('/agent-executions', { params });
    if (response.data?.success && Array.isArray(response.data?.data)) {
      return response.data.data;
    }
    return [];
  },

  async getAgentExecutionById(id: string): Promise<AgentExecutionRecord> {
    const response = await apiClient.get(`/agent-executions/${id}`);
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error('Agent execution record not found');
  },

  async getAuditLogs(params?: {
    resourceType?: string;
    resourceId?: string;
    action?: string;
    actorType?: string;
    search?: string;
    incidentId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{ logs: AuditLogRecord[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
    const response = await apiClient.get('/audit-logs', { params });
    const logs = Array.isArray(response.data?.data) ? response.data.data : [];
    const pagination = response.data?.pagination || {
      total: logs.length,
      page: Number(params?.page || 1),
      limit: Number(params?.limit || 20),
      totalPages: 1,
    };
    return { logs, pagination };
  },

  async getSystemHealth(): Promise<SystemHealth> {
    const response = await apiClient.get('/system/health');
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error('Failed to query system health');
  },

  async getSystemQueues(): Promise<SystemQueues> {
    const response = await apiClient.get('/system/queues');
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error('Failed to query system queues');
  },

  async getOverview(): Promise<AdminOverviewData> {
    const response = await apiClient.get('/admin/overview');
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error('Failed to load platform overview metrics');
  },

  async getSystemConfig(): Promise<SystemConfigData> {
    const response = await apiClient.get('/system/config');
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error('Failed to load system configuration');
  },

  async updateSystemConfig(payload: Partial<SystemConfigData>): Promise<SystemConfigData> {
    const response = await apiClient.put('/system/config', payload);
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error(response.data?.error?.message || 'Failed to update system configuration');
  },
};

export interface SystemConfigData {
  _id: string;
  clusterName: string;
  timezone: string;
  autoDispatchThreshold: number;
  slaGraceMinutes: number;
  integrations: {
    gemini: { configured: boolean; model: string };
    redis: { configured: boolean };
    mapbox: { configured: boolean };
    webhooks: { configured: boolean };
  };
  featureFlags: {
    autonomousDispatch: boolean;
    strictJurisdictionMatching: boolean;
    multimodalVerification: boolean;
    telemetryStreaming: boolean;
  };
  updatedAt: string;
}

export interface AdminOverviewData {
  kpis: {
    registeredAgents: number;
    agentSuccessRate: number;
    activeExecutions: number;
    failedExecutions: number;
    auditEvents: number;
    openIncidents: number;
  };
  systemHealth: {
    redis: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
    mongodb: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
    bullmq: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
    api: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
    websocket: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
  };
  aiOperations: {
    reportsToday: number;
    aiTriaged: number;
    currentlyProcessing: number;
    failedExecutions: number;
    dlqJobs: number;
  };
  latestExecutions: AgentExecutionRecord[];
  attentionRequired: Array<{
    id: string;
    type: string;
    severity: 'danger' | 'warning' | 'info';
    title: string;
    description: string;
    href: string;
    timestamp: string;
  }>;
  latestAuditEvents: AuditLogRecord[];
}

