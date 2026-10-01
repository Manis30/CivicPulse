import { apiClient } from './apiClient';

export interface EvidenceRecord {
  id: string;
  _id?: string;
  incidentId?: string;
  reportId?: string;
  uploadedBy?: string | { _id: string; name?: string; role?: string };
  type: 'BEFORE' | 'INSPECTION' | 'REPAIR' | 'AFTER' | 'SUPPORTING';
  fileUrl: string;
  mimeType?: string;
  source?: 'CITIZEN' | 'OFFICER' | 'AI_AGENT' | 'SYSTEM';
  metadata?: {
    sizeBytes?: number;
    latitude?: number;
    longitude?: number;
    publicId?: string;
  };
  capturedAt?: string;
  createdAt?: string;
}

export function getEvidenceImageUrl(fileUrl?: string): string {
  if (!fileUrl) return '';
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://') || fileUrl.startsWith('blob:') || fileUrl.startsWith('data:')) {
    return fileUrl;
  }
  const apiOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
  const cleanPath = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
  return `${apiOrigin}${cleanPath}`;
}

export const evidenceService = {
  async uploadEvidence(
    file: File,
    options?: {
      type?: 'BEFORE' | 'INSPECTION' | 'REPAIR' | 'AFTER' | 'SUPPORTING';
      incidentId?: string;
      reportId?: string;
      latitude?: number;
      longitude?: number;
    }
  ): Promise<EvidenceRecord> {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.type) formData.append('type', options.type);
    if (options?.incidentId) formData.append('incidentId', options.incidentId);
    if (options?.reportId) formData.append('reportId', options.reportId);
    if (options?.latitude !== undefined) formData.append('latitude', String(options.latitude));
    if (options?.longitude !== undefined) formData.append('longitude', String(options.longitude));

    // Optional Cloudinary direct upload if env variables are present in environment
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (cloudName && uploadPreset) {
      try {
        const cldData = new FormData();
        cldData.append('file', file);
        cldData.append('upload_preset', uploadPreset);
        const cldRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: cldData,
        });
        if (cldRes.ok) {
          const cldJson = await cldRes.json();
          if (cldJson.secure_url) {
            formData.append('externalUrl', cldJson.secure_url);
            formData.append('publicId', cldJson.public_id || '');
          }
        }
      } catch (cldErr) {
        console.warn('Cloudinary upload fallback to backend persistent storage:', cldErr);
      }
    }

    const response = await apiClient.post('/evidence', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error(response.data?.error?.message || 'Failed to upload evidence');
  },

  async getEvidenceById(id: string): Promise<EvidenceRecord> {
    const response = await apiClient.get(`/evidence/${id}`);
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    throw new Error('Evidence not found');
  },

  async getIncidentEvidence(incidentId: string): Promise<EvidenceRecord[]> {
    const response = await apiClient.get(`/incidents/${incidentId}/evidence`);
    if (response.data?.success && Array.isArray(response.data?.data)) {
      return response.data.data;
    }
    return [];
  },
};

export default evidenceService;
