import { apiClient } from './apiClient';

export interface WorkOrderTask {
  id: string;
  incidentId: any;
  workOrderNumber: string;
  departmentId: any;
  assignedTeamId: any;
  leadOfficerId?: any;
  status: 'PENDING' | 'ACCEPTED' | 'EN_ROUTE' | 'IN_PROGRESS' | 'EVIDENCE_SUBMITTED' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  slaDeadline: string;
  checklist: Array<{
    item: string;
    completed: boolean;
    completedAt?: string;
  }>;
  equipment: string[];
  evidenceIds: string[];
  beforeEvidenceId?: any;
  afterEvidenceId?: any;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const workOrderService = {
  async getOfficerTasks(): Promise<WorkOrderTask[]> {
    const response = await apiClient.get('/officer/tasks');
    if (response.data?.success && Array.isArray(response.data?.data)) {
      return response.data.data;
    }
    return [];
  },

  async getWorkOrderById(id: string): Promise<WorkOrderTask> {
    const response = await apiClient.get(`/work-orders/${id}`);
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error('Work order not found');
  },

  async acceptTask(id: string): Promise<WorkOrderTask> {
    const response = await apiClient.post(`/work-orders/${id}/accept`);
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error(response.data?.error?.message || 'Failed to accept task');
  },

  async startTask(id: string): Promise<WorkOrderTask> {
    const response = await apiClient.post(`/work-orders/${id}/start`);
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error(response.data?.error?.message || 'Failed to start task');
  },

  async submitEvidence(id: string, evidenceId: string): Promise<WorkOrderTask> {
    const response = await apiClient.post(`/work-orders/${id}/evidence`, { evidenceId });
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error(response.data?.error?.message || 'Failed to attach evidence');
  },

  async completeTask(id: string, payload: { afterEvidenceId?: string; notes?: string }): Promise<{
    workOrder: WorkOrderTask;
    verification: any;
    incidentStatus: string;
  }> {
    const response = await apiClient.post(`/work-orders/${id}/complete`, payload);
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error(response.data?.error?.message || 'Failed to complete task');
  },
};
