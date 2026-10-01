import { apiClient } from './apiClient';

export type NotificationWorkflowType =
  | 'REPORT_RECEIVED'
  | 'AI_ANALYSIS_COMPLETED'
  | 'LOCATION_VERIFIED'
  | 'DUPLICATE_CHECK_COMPLETED'
  | 'INCIDENT_ASSIGNED'
  | 'TEAM_ASSIGNED'
  | 'WORK_STARTED'
  | 'RESOLUTION_SUBMITTED'
  | 'VERIFICATION_REQUIRED'
  | 'INCIDENT_RESOLVED'
  | 'INCIDENT_REOPENED'
  | 'NEARBY_ALERT'
  | 'SYSTEM_INFO';

export type NotificationCategoryType = 'REPORTS' | 'RESPONSES' | 'NEARBY' | 'SYSTEM';

export interface StructuredNotification {
  id: string;
  type: NotificationWorkflowType;
  categoryType: NotificationCategoryType;
  title: string;
  message: string;
  incidentId?: string;
  incidentNumber?: string;
  incidentTitle?: string;
  category?: string;
  location?: string;
  timestamp: string;
  read: boolean;
  priority: 'info' | 'action_required' | 'resolved' | 'important';
  actionUrl?: string;
  channel?: 'IN_APP' | 'SMS' | 'EMAIL';
}

export interface NotificationRecord {
  id: string;
  recipientId: string;
  incidentId?: any;
  channel: 'IN_APP' | 'SMS' | 'EMAIL' | 'PUSH' | 'WEBHOOK';
  recipientType: 'CITIZEN' | 'OFFICER' | 'MANAGER' | 'ADMIN';
  title?: string;
  body?: string;
  message: string;
  payload?: any;
  status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED' | 'READ';
  readAt?: string;
  read?: boolean;
  createdAt: string;
}

const READ_STATUS_STORAGE_KEY = 'civicpulse_read_notification_ids';

function getLocallyReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_STATUS_STORAGE_KEY);
    if (raw) {
      return new Set(JSON.parse(raw));
    }
  } catch {
    // Ignore error
  }
  return new Set();
}

function persistLocallyReadId(id: string) {
  try {
    const current = getLocallyReadIds();
    current.add(id);
    localStorage.setItem(READ_STATUS_STORAGE_KEY, JSON.stringify(Array.from(current)));
    window.dispatchEvent(new Event('civicpulse_notifications_updated'));
  } catch (err) {
    console.warn('Failed to persist locally read id:', err);
  }
}

function persistAllLocallyRead(ids: string[]) {
  try {
    const current = getLocallyReadIds();
    ids.forEach((id) => current.add(id));
    localStorage.setItem(READ_STATUS_STORAGE_KEY, JSON.stringify(Array.from(current)));
    window.dispatchEvent(new Event('civicpulse_notifications_updated'));
  } catch (err) {
    console.warn('Failed to persist locally read ids:', err);
  }
}

/**
 * Canonical CivicPulse Demo Event Workflow Dataset.
 * Logically maps to the user's reported incident INC-2026-1007 (Pothole & Road Damage)
 * in Ward 12 — Central Hosur, guaranteeing rich municipal context.
 */
const CANONICAL_WORKFLOW_NOTIFICATIONS: StructuredNotification[] = [
  {
    id: 'notif-wf-1007-assign',
    type: 'INCIDENT_ASSIGNED',
    categoryType: 'RESPONSES',
    title: 'Incident update',
    message: 'Your report INC-2026-1007 has been assigned to the Department of Transport & Roads.',
    incidentId: 'INC-2026-1007',
    incidentNumber: 'INC-2026-1007',
    incidentTitle: 'Pothole & Road Damage',
    category: 'POTHOLE',
    location: 'Ward 12 — Central Hosur',
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(), // 12 mins ago
    read: false,
    priority: 'action_required',
    actionUrl: '/citizen/incidents/INC-2026-1007',
    channel: 'IN_APP',
  },
  {
    id: 'notif-wf-1007-team',
    type: 'TEAM_ASSIGNED',
    categoryType: 'RESPONSES',
    title: 'Field Team Assigned',
    message: 'Field response team Team Alpha-01 has acknowledged your report with a 48-hour resolution SLA.',
    incidentId: 'INC-2026-1007',
    incidentNumber: 'INC-2026-1007',
    incidentTitle: 'Pothole & Road Damage',
    category: 'POTHOLE',
    location: 'Ward 12 — Central Hosur',
    timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(), // 28 mins ago
    read: false,
    priority: 'info',
    actionUrl: '/citizen/incidents/INC-2026-1007',
    channel: 'SMS',
  },
  {
    id: 'notif-wf-1007-ai',
    type: 'AI_ANALYSIS_COMPLETED',
    categoryType: 'REPORTS',
    title: 'AI Analysis Completed',
    message: 'Your report has been analyzed and classified as Pothole & Road Damage with Risk Index 45/100.',
    incidentId: 'INC-2026-1007',
    incidentNumber: 'INC-2026-1007',
    incidentTitle: 'Pothole & Road Damage',
    category: 'POTHOLE',
    location: 'Ward 12 — Central Hosur',
    timestamp: new Date(Date.now() - 56 * 60 * 1000).toISOString(), // 56 mins ago
    read: true,
    priority: 'info',
    actionUrl: '/citizen/incidents/INC-2026-1007',
    channel: 'IN_APP',
  },
  {
    id: 'notif-wf-1007-loc',
    type: 'LOCATION_VERIFIED',
    categoryType: 'REPORTS',
    title: 'Location Verified',
    message: 'Your incident location was verified in Ward 12 at Municipal Sector [77.8285, 12.7375].',
    incidentId: 'INC-2026-1007',
    incidentNumber: 'INC-2026-1007',
    incidentTitle: 'Pothole & Road Damage',
    category: 'POTHOLE',
    location: 'Ward 12 — Central Hosur',
    timestamp: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    read: true,
    priority: 'resolved',
    actionUrl: '/citizen/incidents/INC-2026-1007',
    channel: 'IN_APP',
  },
  {
    id: 'notif-wf-1007-rcv',
    type: 'REPORT_RECEIVED',
    categoryType: 'REPORTS',
    title: 'Report Received',
    message: 'Your civic report has been received and registered into the autonomous operations queue.',
    incidentId: 'INC-2026-1007',
    incidentNumber: 'INC-2026-1007',
    incidentTitle: 'Pothole & Road Damage',
    category: 'POTHOLE',
    location: 'Ward 12 — Central Hosur',
    timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    read: true,
    priority: 'info',
    actionUrl: '/citizen/incidents/INC-2026-1007',
    channel: 'IN_APP',
  },
  {
    id: 'notif-wf-nearby-1',
    type: 'NEARBY_ALERT',
    categoryType: 'NEARBY',
    title: 'Nearby Civic Alert',
    message: 'Scheduled stormwater drainage clearing scheduled along Mathigiri corridor adjacent to Ward 12.',
    location: 'Ward 14 · Mathigiri South',
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    read: true,
    priority: 'info',
    channel: 'SMS',
  },
  {
    id: 'notif-wf-nearby-2',
    type: 'NEARBY_ALERT',
    categoryType: 'NEARBY',
    title: 'Traffic Diversion Alert',
    message: 'Heavy vehicle transit rerouted via Bagalur Road due to active underground pipe inspection.',
    location: 'Ward 08 · Bagalur Road Corridor',
    timestamp: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
    read: true,
    priority: 'info',
    channel: 'IN_APP',
  },
  {
    id: 'notif-wf-sys-1',
    type: 'SYSTEM_INFO',
    categoryType: 'SYSTEM',
    title: 'Civic Member Verification',
    message: 'Your citizen identity was verified by Ward 12 Municipal Registry. Priority dispatch protocol active.',
    location: 'Central Hosur Municipal Ward',
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    read: true,
    priority: 'resolved',
    channel: 'EMAIL',
  },
  {
    id: 'notif-wf-sys-2',
    type: 'SYSTEM_INFO',
    categoryType: 'SYSTEM',
    title: 'Autonomous Operations Notice',
    message: 'CivicPulse Municipal autonomous routing gateway telemetry sync completed.',
    location: 'City Operations Center',
    timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    read: true,
    priority: 'info',
    channel: 'IN_APP',
  },
];

/**
 * Normalizes any notification type/status/text into the 4 canonical categories:
 * - REPORTS: Report received, AI analysis, verification, ingestion
 * - RESPONSES: Assignment, dispatch, in-progress, resolution, team updates
 * - NEARBY: Nearby civic alerts, area warnings, traffic notices
 * - SYSTEM: System notices, member verification, telemetry
 */
export function normalizeNotificationCategory(
  rawType?: string,
  title?: string,
  body?: string,
  payloadType?: string
): NotificationCategoryType {
  const t = (payloadType || rawType || '').toUpperCase();
  const text = `${title || ''} ${body || ''}`.toUpperCase();

  // 1. NEARBY
  if (
    t.includes('NEARBY') ||
    text.includes('NEARBY') ||
    text.includes('CIVIC ALERT') ||
    text.includes('STORMWATER') ||
    text.includes('TRAFFIC DIVERSION') ||
    text.includes('AREA ADVISORY')
  ) {
    return 'NEARBY';
  }

  // 2. SYSTEM
  if (
    t.includes('SYSTEM') ||
    text.includes('SYSTEM NOTICE') ||
    text.includes('MEMBER VERIFICATION') ||
    text.includes('MUNICIPAL REGISTRY') ||
    text.includes('TELEMETRY') ||
    text.includes('OPERATIONS NOTICE') ||
    text.includes('PLATFORM')
  ) {
    return 'SYSTEM';
  }

  // 3. REPORTS (Creation, ingestion, AI triage, location verification)
  if (
    t.includes('REPORT_RECEIVED') ||
    t.includes('REPORT_SUBMITTED') ||
    t.includes('AI_ANALYSIS') ||
    t.includes('LOCATION_VERIFIED') ||
    t.includes('DUPLICATE_CHECK') ||
    t === 'REPORT' ||
    text.includes('REPORT INGESTED') ||
    text.includes('REPORT RECEIVED') ||
    text.includes('CURRENTLY ANALYZING') ||
    text.includes('CURRENTLY VERIFYING') ||
    text.includes('ANALYZING') ||
    text.includes('SUBMITTED')
  ) {
    return 'REPORTS';
  }

  // 4. RESPONSES (Department assignment, dispatch, field team, resolution, updates)
  if (
    t.includes('ASSIGNED') ||
    t.includes('TEAM') ||
    t.includes('WORK_STARTED') ||
    t.includes('IN_PROGRESS') ||
    t.includes('DISPATCH') ||
    t.includes('RESOLUTION') ||
    t.includes('RESOLVED') ||
    t.includes('CLOSED') ||
    t.includes('REOPENED') ||
    t.includes('INCIDENT_UPDATE') ||
    t === 'RESPONSE' ||
    text.includes('IN_PROGRESS') ||
    text.includes('CURRENTLY ASSIGNED') ||
    text.includes('CURRENTLY RESOLVED') ||
    text.includes('CURRENTLY CLOSED') ||
    text.includes('WORK ORDER') ||
    text.includes('UPDATE ON INC')
  ) {
    return 'RESPONSES';
  }

  return text.includes('INC-') ? 'RESPONSES' : 'SYSTEM';
}

export const notificationService = {
  /**
   * Retrieves enriched structured notifications by unifying real backend API responses
   * with canonical workflow events for the active citizen persona.
   */
  async getStructuredNotifications(): Promise<StructuredNotification[]> {
    const locallyRead = getLocallyReadIds();
    let backendRecords: NotificationRecord[] = [];

    try {
      const response = await apiClient.get('/notifications');
      if (response.data?.success && Array.isArray(response.data?.data)) {
        backendRecords = response.data.data;
      }
    } catch (err) {
      console.warn('API notifications fetch notice:', err);
    }

    // Map any real backend notifications into structured models
    const backendStructured: StructuredNotification[] = backendRecords.map((rec) => {
      const notifId = (rec as any)._id || rec.id;
      const isRead = Boolean(rec.read || rec.readAt || rec.status === 'READ' || locallyRead.has(notifId));
      const text = rec.body || rec.message || rec.title || 'Municipal alert notification';
      const title = rec.title || `${rec.channel || 'Civic'} Alert`;

      let priority: 'info' | 'action_required' | 'resolved' | 'important' = 'info';
      if (text.toLowerCase().includes('critical') || text.toLowerCase().includes('urgent')) {
        priority = 'important';
      } else if (text.toLowerCase().includes('require') || text.toLowerCase().includes('action') || ((rec as any).type && (rec as any).type.includes('ACTION_REQUIRED'))) {
        priority = 'action_required';
      } else if (text.toLowerCase().includes('resolve') || text.toLowerCase().includes('closed') || text.toLowerCase().includes('verified')) {
        priority = 'resolved';
      }

      // Extract real human incident number e.g. "INC-2026-1076"
      const incNumMatch = `${title} ${text}`.match(/INC-\d{4}-\d{4}/i);
      const incidentNumber = incNumMatch ? incNumMatch[0].toUpperCase() : undefined;
      const incTargetId = (typeof rec.incidentId === 'string' ? rec.incidentId : rec.incidentId?._id || rec.incidentId?.id) || incidentNumber;

      // Extract specific issue title and location from body if present
      let extractedTitle = rec.payload?.incidentTitle;
      let extractedLocation = rec.payload?.location;
      const bodyMatch = text.match(/Your report for (.*?) in (Ward \d+[^.]*?) is currently ([A-Z_]+)/i);
      if (bodyMatch) {
        if (!extractedTitle) extractedTitle = bodyMatch[1].trim();
        if (!extractedLocation) extractedLocation = bodyMatch[2].trim();
      }

      const categoryType = normalizeNotificationCategory((rec as any).type, title, text, rec.payload?.type);

      let workflowType: NotificationWorkflowType = 'SYSTEM_INFO';
      const upperText = text.toUpperCase();
      if (categoryType === 'NEARBY' || upperText.includes('NEARBY')) {
        workflowType = 'NEARBY_ALERT';
      } else if (categoryType === 'SYSTEM') {
        workflowType = 'SYSTEM_INFO';
      } else if (upperText.includes('INGESTED') || upperText.includes('REPORT RECEIVED') || upperText.includes('SUBMITTED')) {
        workflowType = 'REPORT_RECEIVED';
      } else if (upperText.includes('ANALYZING') || upperText.includes('AI_ANALYSIS')) {
        workflowType = 'AI_ANALYSIS_COMPLETED';
      } else if (upperText.includes('VERIFYING') || upperText.includes('LOCATION_VERIFIED')) {
        workflowType = 'LOCATION_VERIFIED';
      } else if (upperText.includes('RESOLVED') || upperText.includes('CLOSED')) {
        workflowType = 'INCIDENT_RESOLVED';
      } else if (upperText.includes('IN_PROGRESS') || upperText.includes('WORK_STARTED')) {
        workflowType = 'WORK_STARTED';
      } else if (upperText.includes('ASSIGNED')) {
        workflowType = 'INCIDENT_ASSIGNED';
      } else if (incTargetId) {
        workflowType = 'INCIDENT_ASSIGNED';
      }

      return {
        id: notifId,
        type: workflowType,
        categoryType,
        title,
        message: text,
        incidentId: incTargetId,
        incidentNumber,
        incidentTitle: extractedTitle,
        category: rec.payload?.category || 'POTHOLE',
        location: extractedLocation || 'Ward 12 · Central Hosur',
        timestamp: rec.createdAt || new Date().toISOString(),
        read: isRead,
        priority,
        actionUrl: incTargetId ? `/citizen/incidents/${incTargetId}` : undefined,
        channel: rec.channel === 'SMS' ? 'SMS' : rec.channel === 'EMAIL' ? 'EMAIL' : 'IN_APP',
      };
    });

    // Merge backend records with canonical workflow events (preventing duplicate IDs)
    const existingIds = new Set(backendStructured.map((n) => n.id));
    const mergedCanonical = CANONICAL_WORKFLOW_NOTIFICATIONS.filter((n) => !existingIds.has(n.id)).map((n) => ({
      ...n,
      read: locallyRead.has(n.id) ? true : n.read,
    }));

    const all = [...backendStructured, ...mergedCanonical];
    // Sort descending by timestamp
    all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return all;
  },

  /**
   * Legacy raw notification getter
   */
  async getNotifications(): Promise<NotificationRecord[]> {
    try {
      const response = await apiClient.get('/notifications');
      if (response.data?.success && Array.isArray(response.data?.data)) {
        return response.data.data;
      }
    } catch {
      // Fallback
    }
    return [];
  },

  /**
   * Mark a single notification as read across API and local persistence
   */
  async markAsRead(id: string): Promise<void> {
    persistLocallyReadId(id);
    try {
      await apiClient.post(`/notifications/${id}/read`);
    } catch {
      // Handled by local persistence cache
    }
  },

  /**
   * Mark all notifications as read across API and local persistence
   */
  async markAllAsRead(allIds: string[] = []): Promise<void> {
    persistAllLocallyRead(allIds);
    try {
      await apiClient.post('/notifications/read-all');
    } catch {
      // Fallback: batch mark individual IDs if read-all route isn't available
      allIds.forEach((id) => {
        apiClient.post(`/notifications/${id}/read`).catch(() => {});
      });
    }
  },

  /**
   * Get unread count quickly
   */
  async getUnreadCount(): Promise<number> {
    try {
      const list = await this.getStructuredNotifications();
      return list.filter((n) => !n.read).length;
    } catch {
      return 0;
    }
  },
};
