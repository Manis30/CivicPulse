import { apiClient } from './apiClient.js';

export interface HealthCheckResponse {
  status: string;
  service: string;
  timestamp: string;
  version: string;
  environment: string;
  requestId?: string;
}

export async function fetchHealth(): Promise<HealthCheckResponse> {
  const response = await apiClient.get<HealthCheckResponse>('/health');
  return response.data;
}
