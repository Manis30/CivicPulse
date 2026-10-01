import { apiClient } from './apiClient';

export type ReportSource = 'MOBILE_APP' | 'WEB_PORTAL' | 'CALL_CENTER' | 'IOT_SENSOR';

export interface SubmitReportPayload {
  reporterId?: string;
  categoryHint?: string;
  description: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
    address?: string;
  };
  evidenceIds?: string[];
  source?: ReportSource;
}

export interface SubmitReportResponse {
  success: boolean;
  data?: {
    id?: string;
    incident?: {
      _id?: string;
      id?: string;
      incidentNumber?: string;
      category?: string;
      status?: string;
      severity?: string;
      location?: {
        address?: string;
        coordinates?: [number, number];
      };
      ward?: string;
      zone?: string;
      createdAt?: string;
      sla?: {
        targetHours?: number;
      };
    };
    incidentId?: string;
    report?: any;
  };
  error?: {
    code: string;
    message: string;
  };
}

export const reportService = {
  async submitReport(payload: SubmitReportPayload): Promise<SubmitReportResponse> {
    try {
      const sanitizedPayload: SubmitReportPayload = {
        ...payload,
        source: payload.source || 'WEB_PORTAL',
      };
      const response = await apiClient.post<SubmitReportResponse>('/reports', sanitizedPayload);
      return response.data;
    } catch (err) {
      console.error('[reportService] Failed to submit report via live API:', err);
      throw err;
    }
  },

  async getReports(params?: { reporterId?: string; incidentId?: string; status?: string; page?: number; limit?: number }) {
    try {
      const response = await apiClient.get('/reports', { params });
      return response.data;
    } catch (err) {
      console.warn('[reportService] Failed to fetch reports via live API:', err);
      return {
        success: false,
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
      };
    }
  },
};

