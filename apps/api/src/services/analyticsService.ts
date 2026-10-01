import { incidentRepository } from '../repositories/incidentRepository.js';

export interface AnalyticsOverview {
  countsByStatus: Array<{ status: string; count: number }>;
  countsBySeverity: Array<{ severity: string; count: number }>;
  countsByCategory: Array<{ category: string; count: number }>;
  countsByWard: Array<{ ward: string; count: number }>;
  resolutionTime: { avgHours: number; count: number };
  slaBreach: { total: number; breached: number; breachRatePercentage: number };
  reopenedRate: { total: number; reopened: number; reopenRatePercentage: number };
  departmentWorkload: Array<{ departmentId: string; departmentName?: string; activeCount: number }>;
}

export class AnalyticsService {
  async getOperationalOverview(): Promise<AnalyticsOverview> {
    const [
      countsByStatus,
      countsBySeverity,
      countsByCategory,
      countsByWard,
      resolutionTime,
      slaBreach,
      reopenedRate,
      departmentWorkload,
    ] = await Promise.all([
      incidentRepository.getIncidentCountsByStatus(),
      incidentRepository.getIncidentCountsBySeverity(),
      incidentRepository.getIncidentCountsByCategory(),
      incidentRepository.getIncidentCountsByWard(),
      incidentRepository.getAverageResolutionTime(),
      incidentRepository.getSLABreachRate(),
      incidentRepository.getReopenedIncidentRate(),
      incidentRepository.getDepartmentWorkload(),
    ]);

    return {
      countsByStatus,
      countsBySeverity,
      countsByCategory,
      countsByWard,
      resolutionTime,
      slaBreach,
      reopenedRate,
      departmentWorkload,
    };
  }
}

export const analyticsService = new AnalyticsService();
