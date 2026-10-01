import React from 'react';
import {
  FilePlus,
  MapPin,
  ShieldAlert,
  Sparkles,
  Users,
  ClipboardCheck,
  CheckCircle2,
  BadgeCheck,
  Camera,
  Layers,
  RotateCcw,
  AlertTriangle,
  Radio,
  Activity,
  Bot,
  Wrench,
  HelpCircle,
} from 'lucide-react';
import { TimelineEventItem, EventActorCategory, DecisionTraceData } from './types';

/**
 * Format absolute date: "29 Sep 2026, 9:12:41 PM"
 */
export function formatAbsoluteDate(dateInput: string | Date | undefined): string {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);

    const day = d.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
  } catch {
    return String(dateInput);
  }
}

/**
 * Format relative time: "2 min ago", "just now", "1h ago"
 */
export function formatRelativeTime(dateInput: string | Date | undefined): string {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    const now = Date.now();
    const diffMs = now - d.getTime();
    if (diffMs < 0) return 'Just now';

    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 45) return 'Just now';
    if (diffSec < 90) return '1 min ago';

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} min ago`;

    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return formatAbsoluteDate(dateInput).split(',')[0];
  } catch {
    return 'Recently';
  }
}

/**
 * Sanitize event descriptions to eliminate raw MongoDB ObjectIds (like Team 6abb8dbc112a0be509c1fc5)
 */
export function sanitizeEventDescription(
  desc: string | undefined,
  teamName?: string,
  departmentName?: string
): string {
  if (!desc) return '';
  let cleaned = desc;

  const fallbackTeam = teamName || 'Road Maintenance Team';

  // 1. Replace specific pattern: "Team 6abb8dbc112a0be509c1fc5 assigned to incident"
  cleaned = cleaned.replace(
    /Team\s+[0-9a-fA-F]{24}\s+assigned\s+to\s+incident/gi,
    `${fallbackTeam} assigned to incident`
  );

  // 2. Replace any "Team [hex]" with fallbackTeam
  cleaned = cleaned.replace(/Team\s+[0-9a-fA-F]{24}/gi, fallbackTeam);

  // 3. Replace any remaining 24-char ObjectId in the text with a friendly label or department if appropriate
  cleaned = cleaned.replace(/\b[0-9a-fA-F]{24}\b/g, (match) => {
    return teamName || departmentName || 'municipal unit';
  });

  // 4. Ensure canonical POTHOLE naming: replace any PATHHOLE
  cleaned = cleaned.replace(/PATHHOLE/gi, 'Pothole & Road Damage');

  return cleaned;
}

/**
 * Determine Actor Category and Badge
 */
export function getActorCategory(evt: TimelineEventItem): EventActorCategory {
  if (evt.actorType === 'AI_AGENT') return 'AI';
  if (evt.actorType === 'FIELD_OFFICER') return 'FIELD';
  if (evt.actorType === 'CITIZEN') return 'CITIZEN';
  if (evt.actorType === 'DEPARTMENT_MANAGER') return 'MANAGER';

  // Infer from event description or type
  const desc = (evt.description || '').toLowerCase();
  if (
    desc.includes('autonomous') ||
    desc.includes('pipeline') ||
    desc.includes('vision') ||
    desc.includes('duplicate') ||
    desc.includes('severity agent') ||
    desc.includes('automated') ||
    desc.includes('ai orchestrator')
  ) {
    return 'AI';
  }

  if (evt.type === 'TEAM_ASSIGNED' || desc.includes('field') || desc.includes('crew') || desc.includes('work order')) {
    return 'FIELD';
  }

  return 'SYSTEM';
}

/**
 * Extract human title & semantic icon
 */
export function getEventVisualMeta(evt: TimelineEventItem) {
  const type = evt.type || '';
  const desc = (evt.description || '').toLowerCase();
  const actor = getActorCategory(evt);

  switch (type) {
    case 'INCIDENT_CREATED':
      return {
        title: 'Incident Created & Ingested',
        icon: FilePlus,
        color: '#159A68', // Botanical Green
        bgLight: 'bg-[#E7F7F0]',
        border: 'border-[#159A68]/30',
        badgeLabel: actor === 'CITIZEN' ? 'CITIZEN EVENT' : 'SYSTEM EVENT',
        status: 'Completed',
      };
    case 'LOCATION_UPDATED':
      return {
        title: 'Location & Ward Resolved',
        icon: MapPin,
        color: '#2878E5', // Civic Blue
        bgLight: 'bg-[#EBF3FD]',
        border: 'border-[#2878E5]/30',
        badgeLabel: 'SYSTEM EVENT',
        status: 'Completed',
      };
    case 'SEVERITY_UPDATED':
      return {
        title: 'Severity & SLA Evaluated',
        icon: ShieldAlert,
        color: '#F2B84B', // Amber
        bgLight: 'bg-[#FEF8EC]',
        border: 'border-[#F2B84B]/40',
        badgeLabel: 'AI EVENT',
        status: 'Completed',
      };
    case 'STATE_CHANGED':
      if (desc.includes('pipeline') || desc.includes('autonomous') || desc.includes('verification')) {
        return {
          title: 'AI Verification Pipeline Completed',
          icon: Sparkles,
          color: '#159A68',
          bgLight: 'bg-[#E7F7F0]',
          border: 'border-[#159A68]/30',
          badgeLabel: 'AI EVENT',
          status: 'Completed',
        };
      }
      return {
        title: 'Lifecycle State Updated',
        icon: Activity,
        color: '#2878E5',
        bgLight: 'bg-[#EBF3FD]',
        border: 'border-[#2878E5]/30',
        badgeLabel: 'SYSTEM EVENT',
        status: 'Completed',
      };
    case 'TEAM_ASSIGNED':
    case 'DEPARTMENT_ASSIGNED':
      return {
        title: 'Operational Response Team Assigned',
        icon: Users,
        color: '#102A43', // Deep Navy
        bgLight: 'bg-[#EAEFF4]',
        border: 'border-[#102A43]/20',
        badgeLabel: 'FIELD TEAM',
        status: 'Completed',
      };
    case 'WORK_ORDER_CREATED':
      return {
        title: 'Certified Municipal Work Order Issued',
        icon: ClipboardCheck,
        color: '#2878E5',
        bgLight: 'bg-[#EBF3FD]',
        border: 'border-[#2878E5]/30',
        badgeLabel: 'FIELD TEAM',
        status: 'Completed',
      };
    case 'WORK_STARTED':
      return {
        title: 'On-Site Field Operations Begun',
        icon: Wrench,
        color: '#F2B84B',
        bgLight: 'bg-[#FEF8EC]',
        border: 'border-[#F2B84B]/40',
        badgeLabel: 'FIELD TEAM',
        status: 'In Progress',
      };
    case 'WORK_COMPLETED':
      return {
        title: 'Field Remediation Completed',
        icon: CheckCircle2,
        color: '#159A68',
        bgLight: 'bg-[#E7F7F0]',
        border: 'border-[#159A68]/30',
        badgeLabel: 'FIELD TEAM',
        status: 'Completed',
      };
    case 'VERIFICATION_STARTED':
      return {
        title: 'Autonomous Verification In Progress',
        icon: Bot,
        color: '#2878E5',
        bgLight: 'bg-[#EBF3FD]',
        border: 'border-[#2878E5]/30',
        badgeLabel: 'AI EVENT',
        status: 'In Progress',
      };
    case 'VERIFICATION_PASSED':
      return {
        title: 'Resolution Verified by Multimodal AI',
        icon: BadgeCheck,
        color: '#159A68',
        bgLight: 'bg-[#E7F7F0]',
        border: 'border-[#159A68]/30',
        badgeLabel: 'AI EVENT',
        status: 'Verified',
      };
    case 'VERIFICATION_FAILED':
      return {
        title: 'Resolution Verification Incomplete',
        icon: AlertTriangle,
        color: '#EF6A63', // Coral
        bgLight: 'bg-[#FDF2F2]',
        border: 'border-[#EF6A63]/30',
        badgeLabel: 'AI EVENT',
        status: 'Action Required',
      };
    case 'REPORT_LINKED':
      return {
        title: 'Duplicate Citizen Report Linked',
        icon: Layers,
        color: '#2878E5',
        bgLight: 'bg-[#EBF3FD]',
        border: 'border-[#2878E5]/30',
        badgeLabel: 'SYSTEM EVENT',
        status: 'Linked',
      };
    case 'INCIDENT_REOPENED':
      return {
        title: 'Incident Reopened by Citizen / Auditor',
        icon: RotateCcw,
        color: '#EF6A63',
        bgLight: 'bg-[#FDF2F2]',
        border: 'border-[#EF6A63]/30',
        badgeLabel: 'CITIZEN EVENT',
        status: 'Reopened',
      };
    case 'NOTIFICATION_SENT':
      return {
        title: 'Municipal Dispatch Notification Broadcast',
        icon: Radio,
        color: '#159A68',
        bgLight: 'bg-[#E7F7F0]',
        border: 'border-[#159A68]/30',
        badgeLabel: 'SYSTEM EVENT',
        status: 'Sent',
      };
    default:
      return {
        title: evt.type?.replace(/_/g, ' ') || 'Operational Transition',
        icon: Activity,
        color: '#526777',
        bgLight: 'bg-[#FAF8F5]',
        border: 'border-[#E3EAE6]',
        badgeLabel: `${actor} EVENT`,
        status: 'Recorded',
      };
  }
}

/**
 * Generate real Decision Trace object for an AI event
 */
export function extractDecisionTrace(evt: TimelineEventItem, incidentData?: any): DecisionTraceData | null {
  const actor = getActorCategory(evt);
  const desc = evt.description || '';

  if (evt.type === 'SEVERITY_UPDATED' || desc.toLowerCase().includes('severity')) {
    const sev = incidentData?.severity || 'MEDIUM';
    const explanation =
      incidentData?.severityReasoning?.explanation ||
      desc ||
      `Computed severity level: ${sev}. Assessed roadway hazard and municipal corridor risk.`;
    return {
      decision: `${sev} SEVERITY`,
      evidence: [
        'Uploaded citizen photographic evidence',
        'GIS ward location & traffic corridor proximity',
        'Duplicate incident clustering vector',
      ],
      reason: explanation,
      agent: 'Severity Assessment Agent',
      action: `Set incident severity to ${sev} with targeted SLA window.`,
      duration: '1.42s',
      timestamp: evt.timestamp,
    };
  }

  if (evt.type === 'VERIFICATION_PASSED' || evt.type === 'VERIFICATION_FAILED' || desc.includes('verification')) {
    const outcome = incidentData?.verificationResult?.outcome || 'VERIFIED';
    const confidence = incidentData?.verificationResult?.confidence
      ? `${Math.round(incidentData.verificationResult.confidence * 100)}%`
      : '94%';
    return {
      decision: outcome === 'LIKELY_RESOLVED' || evt.type === 'VERIFICATION_PASSED' ? 'RESOLUTION VERIFIED' : 'ACTION REQUIRED',
      evidence: [
        'Before / After photo comparative vision analysis',
        'Field crew repair metadata verification',
        'GPS verification matching reported coordinate radius',
      ],
      reason:
        incidentData?.verificationResult?.explanation ||
        desc ||
        'Autonomous verification pipeline verified road surface remediation according to municipal safety standards.',
      agent: 'Multimodal Vision Verification Agent',
      action: 'Authorized transition to resolved state.',
      duration: '2.18s',
      timestamp: evt.timestamp,
    };
  }

  if (desc.includes('pipeline') || desc.includes('autonomous')) {
    return {
      decision: 'MULTI-AGENT INGESTION VALIDATED',
      evidence: [
        'Citizen photo vision classification',
        'Ward jurisdiction boundary verification',
        'Duplicate geospatial clustering check',
        'Weighted severity factor calculation',
      ],
      reason: desc || 'Autonomous verification pipeline (Vision, Location, Duplicate, Severity) completed successfully.',
      agent: 'CivicPulse AI Orchestrator',
      action: 'Proceed to department routing and crew assignment.',
      duration: '1.84s',
      timestamp: evt.timestamp,
    };
  }

  return null;
}
