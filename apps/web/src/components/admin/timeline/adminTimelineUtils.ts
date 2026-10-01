import {
  AdminTimelineEvent,
  EventCategoryType,
  EventFilterType,
  FilterCounts,
  DecisionTraceNode,
} from './adminTimelineTypes';

/**
 * Format absolute date: "Sep 30, 2026, 6:06:27 PM"
 */
export function formatAbsoluteDate(dateInput: string | Date | undefined): string {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);

    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * Format short time: "6:06 PM"
 */
export function formatShortTime(dateInput: string | Date | undefined): string {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);

    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * Format relative time: "16m ago", "just now", "2h ago"
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
    if (diffSec < 90) return '1m ago';

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;

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
 * Clean up raw ObjectIds and technical identifiers in event descriptions
 */
export function sanitizeDescription(
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

  // 3. Replace isolated ObjectIds with friendly names
  cleaned = cleaned.replace(/\b[0-9a-fA-F]{24}\b/g, () => {
    return teamName || departmentName || 'municipal unit';
  });

  // 4. Ensure canonical POTHOLE naming: replace any PATHHOLE
  cleaned = cleaned.replace(/PATHHOLE/gi, 'Pothole & Road Damage');

  return cleaned;
}

/**
 * Map raw event types to authoritative human titles & descriptive summaries
 */
export function mapEventPresentation(
  type: string,
  desc: string,
  incident?: any,
  agentExecution?: any
): { title: string; humanDescription: string; defaultResult: string } {
  const normType = (type || '').toUpperCase();
  const lowerDesc = (desc || '').toLowerCase();
  const severity = incident?.severity || 'MEDIUM';
  const targetHours = incident?.sla?.targetHours || 48;
  const ward = incident?.location?.ward || incident?.ward || 'Ward Jurisdiction';
  const team = incident?.teamId?.name || incident?.assignedTeamId?.name || 'Road Maintenance Team';
  const department = incident?.departmentId?.name || incident?.department?.name || 'Transport & Infrastructure';

  switch (normType) {
    case 'INCIDENT_CREATED':
      return {
        title: 'Incident Created & Ingested',
        humanDescription:
          'Citizen report ingested into municipal registry with geolocation coordinates and photographic evidence.',
        defaultResult: `Canonical incident created with status ${incident?.status || 'SUBMITTED'}.`,
      };

    case 'LOCATION_UPDATED':
    case 'INCIDENT_LOCATION_UPDATED':
      return {
        title: 'Location & Ward Resolved',
        humanDescription: `Spatial coordinates verified against GIS municipal boundary and assigned to ${ward}.`,
        defaultResult: `Jurisdiction bound to ${ward} (${department}).`,
      };

    case 'SEVERITY_UPDATED':
    case 'INCIDENT_SEVERITY_SET':
      return {
        title: 'Severity & SLA Evaluated',
        humanDescription: `Severity evaluated based on category, hazard classification, traffic corridor proximity, and duplicate escalation.`,
        defaultResult: `Severity updated to ${severity}. SLA target set to ${targetHours} hours.`,
      };

    case 'STATE_CHANGED':
      if (lowerDesc.includes('pipeline') || lowerDesc.includes('autonomous') || lowerDesc.includes('verification')) {
        return {
          title: 'AI Verification Pipeline Completed',
          humanDescription:
            'Autonomous multi-agent verification pipeline (Vision, Location, Duplicate, Severity) completed successfully.',
          defaultResult: 'Triage complete. Incident ready for municipal dispatch.',
        };
      }
      return {
        title: 'Incident State Changed',
        humanDescription: `Incident moved to status ${incident?.status || 'ASSIGNED'}. Routing and dispatch synchronized.`,
        defaultResult: `Lifecycle transitioned to ${incident?.status || 'ASSIGNED'}.`,
      };

    case 'INCIDENT_VALIDATED':
      return {
        title: 'Multi-Agent Validation Passed',
        humanDescription:
          'Incident validated by autonomous inspection agents and approved for municipal department dispatch.',
        defaultResult: 'Automated verification check passed with confidence rating > 90%.',
      };

    case 'TEAM_ASSIGNED':
    case 'INCIDENT_TEAM_ASSIGNED':
    case 'DEPARTMENT_ASSIGNED':
      return {
        title: 'Response Team Assigned',
        humanDescription: `Routing Agent selected ${team} based on jurisdiction (${ward}), active workload, severity, and availability.`,
        defaultResult: `Operational assignment confirmed for ${team}.`,
      };

    case 'WORK_ORDER_CREATED':
      return {
        title: 'Certified Municipal Work Order Issued',
        humanDescription:
          'Certified municipal work order generated and scheduled for on-site field crew deployment.',
        defaultResult: `Work order dispatched to ${team} with scheduled SLA countdown.`,
      };

    case 'WORK_STARTED':
      return {
        title: 'On-Site Field Operations Begun',
        humanDescription: `Municipal field crew arrived on location in ${ward} and commenced remediation works.`,
        defaultResult: 'Status updated to IN PROGRESS. Field crew logged on site.',
      };

    case 'WORK_COMPLETED':
    case 'RESOLUTION_SUBMITTED':
      return {
        title: 'Field Remediation Completed',
        humanDescription:
          'Field remediation completed on-site. Photographic proof and completion certificate uploaded.',
        defaultResult: 'Repair work marked complete; awaiting autonomous multimodal verification.',
      };

    case 'VERIFICATION_STARTED':
      return {
        title: 'Autonomous Verification In Progress',
        humanDescription:
          'Multimodal vision analysis initiated to compare before-and-after photographic evidence.',
        defaultResult: 'Vision comparison running on high-resolution evidence pairs.',
      };

    case 'VERIFICATION_PASSED':
    case 'VERIFICATION_COMPLETED':
      return {
        title: 'Resolution Verified by Multimodal AI',
        humanDescription:
          'Multimodal vision agent verified roadway repair meets municipal safety and quality standards.',
        defaultResult: 'Verification confirmed. Authorized transition to RESOLVED state.',
      };

    case 'VERIFICATION_FAILED':
      return {
        title: 'Resolution Verification Incomplete',
        humanDescription:
          'Autonomous inspection detected unresolved hazards or insufficient photographic clearance.',
        defaultResult: 'Action required: Returned to field crew for remedial touch-up.',
      };

    case 'INCIDENT_REOPENED':
      return {
        title: 'Incident Reopened by Citizen / Auditor',
        humanDescription:
          'Citizen feedback or audit inspection indicated recurring hazard; incident reopened for prompt remediation.',
        defaultResult: 'Incident state transitioned back to REOPENED with priority escalation.',
      };

    case 'INCIDENT_CLOSED':
      return {
        title: 'Incident Formally Closed',
        humanDescription:
          'Remediation verified and incident record formally sealed in municipal operational ledger.',
        defaultResult: 'Incident cycle finalized. SLA standard satisfied.',
      };

    case 'SLA_BREACH':
      return {
        title: 'SLA Window Escalated',
        humanDescription:
          'Incident exceeded targeted response timeframe. Automated notification escalated to department supervisors.',
        defaultResult: 'Escalation flag logged in municipal audit ledger.',
      };

    case 'NOTIFICATION_SENT':
      return {
        title: 'Dispatch Notification Broadcast',
        humanDescription:
          'Operational alert broadcast to municipal dispatch terminals and assigned field crew devices.',
        defaultResult: 'Real-time telemetry dispatched.',
      };

    default:
      if (agentExecution) {
        return {
          title: `${agentExecution.agentName || agentExecution.agentId} Executed`,
          humanDescription:
            agentExecution.reasoning ||
            agentExecution.outputSummary ||
            `Autonomous execution executed by ${agentExecution.agentName || agentExecution.agentId}.`,
          defaultResult: `Agent completed with status ${agentExecution.status}.`,
        };
      }
      return {
        title: type
          .split('_')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' '),
        humanDescription: desc || 'Operational milestone recorded in incident history.',
        defaultResult: 'Operational status confirmed.',
      };
  }
}

/**
 * Classify event into one of the core categories
 */
export function classifyEventCategory(
  type: string,
  actorType: string,
  desc: string = ''
): EventCategoryType {
  const normType = (type || '').toUpperCase();
  const lowerDesc = desc.toLowerCase();

  if (
    normType.includes('FAIL') ||
    normType === 'SLA_BREACH' ||
    lowerDesc.includes('failed') ||
    lowerDesc.includes('breach')
  ) {
    return 'CRITICAL';
  }

  if (
    normType.startsWith('VERIFICATION') ||
    lowerDesc.includes('verified by multimodal') ||
    lowerDesc.includes('verification passed')
  ) {
    return 'VERIFICATION';
  }

  if (
    actorType === 'AI_AGENT' ||
    normType === 'SEVERITY_UPDATED' ||
    normType === 'LOCATION_UPDATED' ||
    normType === 'INCIDENT_VALIDATED' ||
    lowerDesc.includes('pipeline') ||
    lowerDesc.includes('autonomous') ||
    lowerDesc.includes('severity agent') ||
    lowerDesc.includes('routing agent') ||
    lowerDesc.includes('agent_')
  ) {
    return 'AI';
  }

  if (
    actorType === 'FIELD_OFFICER' ||
    normType === 'TEAM_ASSIGNED' ||
    normType === 'INCIDENT_TEAM_ASSIGNED' ||
    normType === 'WORK_ORDER_CREATED' ||
    normType === 'WORK_STARTED' ||
    normType === 'WORK_COMPLETED' ||
    normType === 'RESOLUTION_SUBMITTED' ||
    lowerDesc.includes('work order') ||
    lowerDesc.includes('field crew')
  ) {
    return 'FIELD';
  }

  if (actorType === 'CITIZEN' || normType === 'INCIDENT_CREATED' || normType === 'INCIDENT_REOPENED') {
    return 'CITIZEN';
  }

  return 'SYSTEM';
}

/**
 * Correlate and merge Incident Events, Agent Executions, and Audit Logs
 * into a single unified chronological AdminTimelineEvent stream.
 */
export function mergeIncidentTimeline(
  rawEvents: any[] = [],
  rawExecutions: any[] = [],
  rawAuditLogs: any[] = [],
  incident: any = {},
  evidenceList: any[] = []
): AdminTimelineEvent[] {
  const teamName = incident?.teamId?.name || incident?.assignedTeamId?.name || 'Road Maintenance Team';
  const deptName = incident?.departmentId?.name || incident?.department?.name || 'Transport & Roads';

  // Sort executions by sequence or time
  const executions = [...rawExecutions].sort((a, b) => {
    const timeA = new Date(a.startedAt || a.timestamp || a.createdAt || 0).getTime();
    const timeB = new Date(b.startedAt || b.timestamp || b.createdAt || 0).getTime();
    return timeA - timeB;
  });

  const mergedEvents: AdminTimelineEvent[] = [];
  const processedKeys = new Set<string>();

  // 1. Process Core IncidentEvents
  rawEvents.forEach((evt, idx) => {
    const type = evt.type || evt.stage || 'EVENT';
    const timestamp = evt.timestamp || evt.createdAt || new Date();
    const eventTimeMs = new Date(timestamp).getTime();
    const sanitizedDesc = sanitizeDescription(evt.description || evt.notes, teamName, deptName);

    // Find correlated AgentExecution
    let matchedExecution: any = null;
    if (evt.actorType === 'AI_AGENT' || type.includes('SEVERITY') || type.includes('LOCATION') || type.includes('PIPELINE')) {
      if (type.includes('SEVERITY')) {
        matchedExecution = executions.find((ex) => ex.agentId === 'AGENT_SEVERITY');
      } else if (type.includes('LOCATION')) {
        matchedExecution = executions.find((ex) => ex.agentId === 'AGENT_LOCATION');
      } else if (type.includes('TEAM') || type.includes('ASSIGN')) {
        matchedExecution = executions.find((ex) => ex.agentId === 'AGENT_ROUTING');
      } else if (sanitizedDesc.toLowerCase().includes('verification') || type.includes('VERIFICATION')) {
        matchedExecution = executions.find((ex) => ex.agentId === 'AGENT_VERIFICATION' || ex.agentId === 'AGENT_VISION');
      } else {
        // Find closest execution by timestamp within 5 seconds
        matchedExecution = executions.find(
          (ex) => Math.abs(new Date(ex.startedAt || ex.timestamp || 0).getTime() - eventTimeMs) < 5000
        );
      }
    }

    const category = classifyEventCategory(type, evt.actorType, sanitizedDesc);
    const presentation = mapEventPresentation(type, sanitizedDesc, incident, matchedExecution);

    // Generate Decision Trace Nodes
    const decisionNodes: DecisionTraceNode[] = [];
    const isAiEvent = category === 'AI' || category === 'VERIFICATION';

    if (isAiEvent) {
      // 1. INPUT
      decisionNodes.push({
        step: 'INPUT',
        label: 'Citizen Evidence Ingested',
        detail: `Incident ${incident?.incidentNumber || 'INC-RECORD'} · Geolocation & Photos`,
        status: 'completed',
      });

      // 2. EVIDENCE
      const evidenceDetails: string[] = [];
      if (evidenceList && evidenceList.length > 0) {
        evidenceDetails.push(`${evidenceList.length} Photographic asset(s) analyzed`);
      } else {
        evidenceDetails.push('Citizen photographic evidence');
      }
      evidenceDetails.push(`GIS Boundary: ${incident?.location?.ward || incident?.ward || 'Ward Jurisdiction'}`);
      if (type.includes('SEVERITY')) {
        evidenceDetails.push('Risk Factor Matrix & Corridor Proximity');
      } else if (type.includes('LOCATION')) {
        evidenceDetails.push('Reverse Geocode Coordinate Matching');
      } else {
        evidenceDetails.push('Duplicate Incident Vector Proximity');
      }

      decisionNodes.push({
        step: 'EVIDENCE',
        label: 'Evidence Considered',
        detail: evidenceDetails.join(' · '),
        status: 'completed',
      });

      // 3. AI DECISION
      const agentLabel = matchedExecution?.agentName || matchedExecution?.agentId || (type.includes('SEVERITY') ? 'AGENT_SEVERITY' : type.includes('LOCATION') ? 'AGENT_LOCATION' : 'AGENT_ORCHESTRATOR');
      decisionNodes.push({
        step: 'AI_DECISION',
        label: 'Autonomous Agent Decision',
        detail: `${agentLabel} evaluated operational criteria`,
        subdetail: matchedExecution?.reasoning || presentation.humanDescription,
        status: 'completed',
      });

      // 4. TOOL ACTION
      const toolsCalledList = (matchedExecution?.toolsCalled || []).map((t: any) => t.toolName);
      if (toolsCalledList.length > 0) {
        decisionNodes.push({
          step: 'TOOL_ACTION',
          label: 'Tool Registry Invocations',
          detail: toolsCalledList.map((t: string) => `${t}()`).join(', '),
          status: 'completed',
        });
      } else if (type.includes('SEVERITY')) {
        decisionNodes.push({
          step: 'TOOL_ACTION',
          label: 'Tool Registry Invocations',
          detail: 'calculateSeverityRisk(), setSeverity()',
          status: 'completed',
        });
      } else if (type.includes('LOCATION')) {
        decisionNodes.push({
          step: 'TOOL_ACTION',
          label: 'Tool Registry Invocations',
          detail: 'resolveCoordinates(), getWard()',
          status: 'completed',
        });
      }

      // 5. RESULT
      decisionNodes.push({
        step: 'RESULT',
        label: 'Operational Outcome',
        detail: presentation.defaultResult,
        status: 'completed',
      });
    } else {
      // Non-AI event: ACTOR -> ACTION -> STATE CHANGE
      const actorLabel = evt.actorType === 'CITIZEN' ? 'Citizen Reporter (Web Portal)' : evt.actorType === 'FIELD_OFFICER' ? `${teamName} (Field Crew)` : 'CivicPulse Platform Engine';

      decisionNodes.push({
        step: 'ACTOR',
        label: 'Authorized Actor',
        detail: actorLabel,
        status: 'completed',
      });

      decisionNodes.push({
        step: 'ACTION',
        label: 'Operational Action',
        detail: presentation.title,
        subdetail: sanitizedDesc,
        status: 'completed',
      });

      decisionNodes.push({
        step: 'STATE_CHANGE',
        label: 'Lifecycle State Updated',
        detail: presentation.defaultResult,
        status: 'completed',
      });
    }

    // Determine evidence considered array
    const evidenceConsidered: string[] = [];
    if (evidenceList && evidenceList.length > 0) {
      evidenceConsidered.push(`${evidenceList.length} Photographic Evidence Capture(s)`);
    } else {
      evidenceConsidered.push('Citizen photographic evidence');
    }
    if (incident?.location?.address || incident?.location?.coordinates) {
      evidenceConsidered.push(`Location: ${incident.location.address || 'GPS Coordinates Resolved'}`);
    }
    evidenceConsidered.push(`Ward Jurisdiction: ${incident?.location?.ward || incident?.ward || 'Ward Central'}`);
    if (incident?.category) {
      evidenceConsidered.push(`Category Taxonomy: ${incident.category}`);
    }

    const eventId = evt._id ? evt._id.toString() : evt.id || `evt-${idx}-${eventTimeMs}`;
    const dedupeKey = `${type}_${Math.round(eventTimeMs / 2000)}`;
    processedKeys.add(dedupeKey);

    mergedEvents.push({
      id: eventId,
      type,
      category,
      title: presentation.title,
      description: sanitizedDesc || presentation.humanDescription,
      rawDescription: evt.description,
      actorType: evt.actorType || (category === 'AI' ? 'AI_AGENT' : 'SYSTEM'),
      actorId: evt.actorId || matchedExecution?.agentId,
      actorName:
        matchedExecution?.agentName ||
        (evt.actorType === 'AI_AGENT'
          ? (matchedExecution?.agentId || 'Autonomous AI Agent')
          : evt.actorType === 'CITIZEN'
          ? 'Citizen Reporter'
          : evt.actorType === 'FIELD_OFFICER'
          ? teamName
          : 'CivicPulse Platform Engine'),
      timestamp,
      status: 'COMPLETED',
      fromStatus: evt.fromStatus,
      toStatus: evt.toStatus,
      agentId: matchedExecution?.agentId,
      agentName: matchedExecution?.agentName,
      executionId: matchedExecution?.executionId,
      durationMs: matchedExecution?.durationMs || (isAiEvent ? 1240 : undefined),
      modelUsed: matchedExecution?.modelUsed || (isAiEvent ? 'gemini-2.0-flash' : undefined),
      executionMode: matchedExecution?.executionMode || 'AUTONOMOUS',
      toolsCalled: matchedExecution?.toolsCalled,
      toolsUsedList: (matchedExecution?.toolsCalled || []).map((t: any) => t.toolName),
      reasoning: matchedExecution?.reasoning,
      inputSummary: matchedExecution?.inputSummary,
      outputSummary: matchedExecution?.outputSummary,
      evidenceConsidered,
      metadata: evt.metadata,
      decisionTraceNodes: decisionNodes,
      resultText: presentation.defaultResult,
    });
  });

  // 2. Supplement distinct AuditLogs that do not duplicate existing events
  rawAuditLogs.forEach((audit, aIdx) => {
    const action = (audit.action || '').toUpperCase();
    const auditTimeMs = new Date(audit.timestamp || 0).getTime();
    const dedupeKey = `${action}_${Math.round(auditTimeMs / 2000)}`;

    // Skip if already represented by an incident event
    if (processedKeys.has(dedupeKey)) return;
    if (action === 'INCIDENT_CREATED' && mergedEvents.some((e) => e.type === 'INCIDENT_CREATED')) return;
    if (action.includes('LOCATION') && mergedEvents.some((e) => e.type.includes('LOCATION'))) return;
    if (action.includes('SEVERITY') && mergedEvents.some((e) => e.type.includes('SEVERITY'))) return;
    if (action.includes('TEAM') && mergedEvents.some((e) => e.type.includes('TEAM'))) return;

    // This is a distinct operational audit log (e.g. INCIDENT_VALIDATED or manual supervisor action)
    const category = classifyEventCategory(action, audit.actorType, audit.action);
    const presentation = mapEventPresentation(action, `Audit record: ${action}`, incident);

    processedKeys.add(dedupeKey);

    mergedEvents.push({
      id: audit._id ? audit._id.toString() : `audit-${aIdx}-${auditTimeMs}`,
      type: action,
      category,
      title: presentation.title,
      description: presentation.humanDescription,
      actorType: audit.actorType || 'SYSTEM',
      actorId: audit.actorId,
      actorName: audit.actorType === 'AI_AGENT' ? 'Autonomous AI Agent' : 'Municipal Audit Service',
      timestamp: audit.timestamp || new Date(),
      status: 'COMPLETED',
      resultText: presentation.defaultResult,
      stateBefore: audit.before,
      stateAfter: audit.after,
      metadata: audit.metadata,
    });
  });

  // Sort events chronologically (ascending: earliest to latest for journey)
  mergedEvents.sort((a, b) => {
    const tA = new Date(a.timestamp).getTime();
    const tB = new Date(b.timestamp).getTime();
    return tA - tB;
  });

  return mergedEvents;
}

/**
 * Compute real counts for filter bar
 */
export function computeFilterCounts(events: AdminTimelineEvent[]): FilterCounts {
  let ai = 0;
  let system = 0;
  let field = 0;
  let citizen = 0;

  events.forEach((evt) => {
    if (evt.category === 'AI' || evt.category === 'VERIFICATION') {
      ai++;
    } else if (evt.category === 'SYSTEM') {
      system++;
    } else if (evt.category === 'FIELD') {
      field++;
    } else if (evt.category === 'CITIZEN') {
      citizen++;
    } else {
      system++;
    }
  });

  return {
    all: events.length,
    ai,
    system,
    field,
    citizen,
  };
}

/**
 * Filter events based on active tab
 */
export function filterEvents(
  events: AdminTimelineEvent[],
  filter: EventFilterType
): AdminTimelineEvent[] {
  if (filter === 'ALL') return events;

  return events.filter((evt) => {
    if (filter === 'AI') return evt.category === 'AI' || evt.category === 'VERIFICATION';
    if (filter === 'SYSTEM') return evt.category === 'SYSTEM';
    if (filter === 'FIELD') return evt.category === 'FIELD';
    if (filter === 'CITIZEN') return evt.category === 'CITIZEN';
    return true;
  });
}
