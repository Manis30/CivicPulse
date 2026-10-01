import { apiClient } from './apiClient';

export interface AnalyticsData {
  countsByStatus: Array<{ status: string; count: number }>;
  countsBySeverity: Array<{ severity: string; count: number }>;
  countsByCategory: Array<{ category: string; count: number }>;
  countsByWard: Array<{ ward: string; count: number }>;
  resolutionTime: { avgHours: number; count: number };
  slaBreach: { total: number; breached: number; breachRatePercentage: number };
  reopenedRate: { total: number; reopened: number; reopenRatePercentage: number };
  departmentWorkload: Array<{ departmentId: string; departmentName?: string; activeCount: number }>;
}

export const analyticsService = {
  async getOverview(): Promise<AnalyticsData> {
    const response = await apiClient.get('/analytics/overview');
    if (response.data?.data) {
      return response.data.data;
    }
    if (response.data?.countsByStatus) {
      return response.data;
    }
    throw new Error('Failed to load analytics overview');
  },
};
