import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  incidentService,
  getIncidentTitle,
  normalizeCategory,
  getCategoryDisplayLabel,
} from '@/services/incidentService';
import { evidenceService, getEvidenceImageUrl } from '@/services/evidenceService';
import {
  AdminPageHeader,
  AdminCard,
  AdminBadge,
  AdminLoadingState,
  AdminEmptyState,
  AdminErrorState,
} from '@/components/admin/primitives';
import {
  LuMapPin,
  LuClock,
  LuBot,
  LuBuilding2,
  LuUsers,
  LuCircleCheck,
  LuFileText,
  LuCamera,
  LuLayers,
  LuSparkles,
  LuArrowLeft,
  LuSquareCheck,
  LuActivity,
  LuChevronRight,
  LuShield,
  LuGauge,
  LuRadio,
  LuExternalLink,
  LuEye,
  LuDownload,
  LuRefreshCw,
  LuX,
  LuCircleX,
  LuCpu,
} from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { EvidenceTheaterModal } from '@/components/incident/EvidenceTheaterModal';
import { AdminIncidentTimelineWorkspace } from '@/components/admin/timeline';

function computeSlaDetails(incident: any) {
  const status = incident?.status;
  const isResolved = ['RESOLVED', 'CLOSED'].includes(status || '');
  const deadlineStr = incident?.sla?.deadline;
  const targetHours = incident?.sla?.targetHours || 48;

  if (isResolved) {
    return {
      label: 'SLA STATUS',
      badgeText: 'TARGET MET',
      primaryTime: 'Target Met',
      subText: `${targetHours}h SLA Standard`,
      isOverdue: false,
      isResolved: true,
      percentage: 100,
      barColor: '#22C55E',
      textColor: 'text-[#22C55E]',
    };
  }

  if (!deadlineStr) {
    return {
      label: 'SLA TARGET',
      badgeText: `${targetHours}H TARGET`,
      primaryTime: `${targetHours}h Target`,
      subText: 'Resolution in progress',
      isOverdue: false,
      isResolved: false,
      percentage: 35,
      barColor: '#38BDF8',
      textColor: 'text-[#38BDF8]',
    };
  }

  const deadline = new Date(deadlineStr).getTime();
  const created = new Date(incident.createdAt || Date.now()).getTime();
  const now = Date.now();
  const diffMs = deadline - now;
  const totalDuration = Math.max(1, deadline - created);
  const elapsed = Math.max(0, now - created);
  const percentElapsed = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));

  if (diffMs <= 0) {
    const overdueMins = Math.floor(Math.abs(diffMs) / (1000 * 60));
    const hours = Math.floor(overdueMins / 60);
    const mins = overdueMins % 60;
    const timeStr = hours > 0 ? `${hours}h ${mins}m overdue` : `${mins}m overdue`;
    return {
      label: 'SLA ESCALATED',
      badgeText: 'TARGET EXCEEDED',
      primaryTime: timeStr,
      subText: `Target: ${targetHours}h (${new Date(deadlineStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})`,
      isOverdue: true,
      isResolved: false,
      percentage: 100,
      barColor: '#EF4444',
      textColor: 'text-[#EF4444]',
    };
  }

  const remainingMins = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(remainingMins / 60);
  const mins = remainingMins % 60;
  const timeStr = hours > 0 ? `${hours}h ${mins}m remaining` : `${mins}m remaining`;

  return {
    label: 'SLA TARGET',
    badgeText: `${targetHours}H TARGET`,
    primaryTime: timeStr,
    subText: `Deadline: ${new Date(deadlineStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
    isOverdue: false,
    isResolved: false,
    percentage: percentElapsed,
    barColor: hours < 6 ? '#F59E0B' : '#22D3EE',
    textColor: hours < 6 ? 'text-[#F59E0B]' : 'text-[#F8FAFC]',
  };
}

export function AdminIncidentDossierPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dossier, setDossier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Photographic Evidence Lightbox State
  const [viewerEvidence, setViewerEvidence] = useState<any | null>(null);

  const handleBack = () => {
    navigate('/admin/incidents');
  };

  const handleDownload = (fileUrl: string, fileName?: string) => {
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileName || 'photographic-evidence.jpg';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const fetchDossier = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await incidentService.getIncidentDossier(id);
      let evidenceList = data.evidence || [];
      if (evidenceList.length === 0 && id) {
        try {
          const directEvidence = await evidenceService.getIncidentEvidence(id);
          if (directEvidence && directEvidence.length > 0) {
            evidenceList = directEvidence;
          }
        } catch (e) {
          console.warn('Direct evidence fetch notice:', e);
        }
      }
      setDossier({ ...data, evidence: evidenceList });
    } catch (err: any) {
      setError(err.message || 'Failed to load canonical incident dossier');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDossier();
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4 w-full">
        <AdminLoadingState message="Loading incident telemetry, agent traces, and operational dossier..." />
      </div>
    );
  }

  if (error || !dossier || !dossier.incident) {
    return (
      <div className="space-y-6 w-full pb-16 font-sans text-[#F8FAFC]">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] transition-colors cursor-pointer group"
        >
          <LuArrowLeft className="w-4 h-4 text-[#5B5BF7] transition-transform group-hover:-translate-x-0.5" />
          <span>Return to Incident Dossiers</span>
        </button>

        <AdminErrorState
          title="Incident Dossier Unavailable"
          reason={error || `The incident record "${id}" could not be retrieved from the database.`}
          onRetry={fetchDossier}
        />
      </div>
    );
  }

  const {
    incident,
    reports = [],
    evidence = [],
    timeline = [],
    agentExecutions = [],
    notifications = [],
  } = dossier;

  const workOrders = dossier.workOrders || (dossier.workOrder ? [dossier.workOrder] : []);
  const auditLogs = dossier.auditEvents || dossier.auditLogs || [];

  const title = getIncidentTitle(incident);
  const address = incident.location?.address || 'Municipal Ward Corridor';
  const wardLabel = incident.ward || incident.location?.ward || 'Ward Jurisdiction Unspecified';
  const departmentName = incident.departmentId?.name || incident.department?.name || 'Not assigned';
  const teamName = incident.teamId?.name || incident.assignedTeamId?.name || 'No team assigned';
  const sla = computeSlaDetails(incident);

  const statusVariantMap: Record<string, 'default' | 'primary' | 'ai' | 'success' | 'warning' | 'danger' | 'info'> = {
    SUBMITTED: 'info',
    ANALYZING: 'ai',
    ASSIGNED: 'primary',
    IN_PROGRESS: 'warning',
    VERIFYING: 'ai',
    RESOLVED: 'success',
    CLOSED: 'default',
    REOPENED: 'danger',
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LuFileText className="w-4 h-4" /> },
    {
      id: 'evidence',
      label: 'Photographic Evidence',
      badge: evidence.length,
      icon: <LuCamera className="w-4 h-4" />,
    },
    {
      id: 'ai-analysis',
      label: '10-Agent Intelligence',
      badge: agentExecutions.length,
      icon: <LuBot className="w-4 h-4" />,
    },
    {
      id: 'work-orders',
      label: 'Work Orders',
      badge: workOrders.length,
      icon: <LuSquareCheck className="w-4 h-4" />,
    },
    {
      id: 'timeline',
      label: 'Timeline',
      badge: timeline.length,
      icon: <LuClock className="w-4 h-4" />,
    },
    {
      id: 'audit',
      label: 'Audit & Executions',
      badge: auditLogs.length,
      icon: <LuLayers className="w-4 h-4" />,
    },
  ];

  return (
    <div className="w-full space-y-6 pb-16 font-sans text-[#F8FAFC]">
      {/* 1. Navigation Breadcrumb Rail */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] transition-colors cursor-pointer group"
        >
          <LuArrowLeft className="w-4 h-4 text-[#5B5BF7] transition-transform group-hover:-translate-x-1" />
          <span>Return to Incident Dossiers</span>
        </button>

        <button
          onClick={fetchDossier}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E1B2D] hover:bg-[#13243A] border border-[rgba(148,163,184,0.16)] text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition-colors shadow-2xs cursor-pointer"
          title="Refresh dossier telemetry"
        >
          <LuRefreshCw className="w-3.5 h-3.5 text-[#5B5BF7]" />
          <span>Refresh Dossier</span>
        </button>
      </div>

      {/* 2. Elevated Dark Incident Command Header */}
      <AdminCard variant="elevated" className="p-4 sm:p-5 space-y-3.5 select-none">
        {/* Top Identification Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[rgba(148,163,184,0.12)]">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748B] font-mono">
              INCIDENT
            </span>
            <span className="font-mono font-bold text-xs text-[#818CF8] tracking-wide bg-[#101F33] px-2.5 py-1 rounded-lg border border-[#5B5BF7]/30 shadow-2xs">
              {incident.incidentNumber || incident._id}
            </span>
            <span className="text-[#334155]">•</span>
            <span className="text-xs font-medium text-[#22D3EE] bg-[#22D3EE]/10 px-2.5 py-0.5 rounded-full border border-[#22D3EE]/25">
              {getCategoryDisplayLabel(incident.category)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <AdminBadge
              variant={statusVariantMap[incident.status] || 'primary'}
              size="md"
              dot
            >
              {incident.status}
            </AdminBadge>
          </div>
        </div>

        {/* Center Row: Title, Location & Compact SLA Window */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-1">
          <div className="space-y-1.5 flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#F8FAFC] tracking-tight leading-snug truncate">
              {title}
            </h1>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[#94A3B8]">
              <LuMapPin className="w-4 h-4 text-[#22D3EE] shrink-0" />
              <span className="truncate">{address}</span>
            </div>
          </div>

          {/* Dark SLA Pod */}
          <div className="w-full lg:w-[280px] p-3 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.16)] flex flex-col justify-between shrink-0 shadow-inner space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#64748B] text-[10px] font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
                <LuClock className="w-3.5 h-3.5 text-[#5B5BF7]" />
                <span>{sla.label}</span>
              </span>
              <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#13243A] text-[#94A3B8] border border-[rgba(148,163,184,0.16)]">
                {sla.badgeText}
              </span>
            </div>

            <div>
              <div className={cn('font-mono font-bold text-base tracking-tight leading-tight', sla.textColor)}>
                {sla.primaryTime}
              </div>
              <div className="text-[10.5px] text-[#64748B] font-mono mt-0.5 leading-none">
                {sla.subText}
              </div>
            </div>

            {/* SLA Progress Bar */}
            <div className="w-full bg-[#13243A] h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${sla.percentage}%`,
                  backgroundColor: sla.barColor,
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Metadata Rail */}
        <div className="pt-2.5 border-t border-[rgba(148,163,184,0.12)] flex flex-wrap items-center gap-2.5 text-xs text-[#94A3B8]">
          <AdminBadge variant={incident.severity === 'CRITICAL' ? 'danger' : incident.severity === 'HIGH' ? 'warning' : 'default'} size="sm">
            {incident.severity || 'MEDIUM'}
          </AdminBadge>
          <span className="text-[#334155]">·</span>
          <span>
            Reported{' '}
            {new Date(incident.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          <span className="text-[#334155]">·</span>
          <span className="text-[#F8FAFC] font-medium">{wardLabel}</span>
          <span className="text-[#334155]">·</span>
          <span className="text-[#F8FAFC] font-medium">{teamName}</span>
          {incident.severityReasoning?.score !== undefined && (
            <>
              <span className="text-[#334155]">·</span>
              <span className="font-mono font-bold text-xs text-[#F59E0B] bg-[#F59E0B]/15 px-2 py-0.5 rounded-md border border-[#F59E0B]/30">
                AI Risk {incident.severityReasoning.score}/100
              </span>
            </>
          )}
        </div>
      </AdminCard>

      {/* 3. Dark Admin Tabs */}
      <div className="w-full border-b border-[rgba(148,163,184,0.16)] flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar pt-1 h-[56px]">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 h-[56px] text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer border-b-2',
                isActive
                  ? 'border-[#5B5BF7] text-[#F8FAFC] bg-[#5B5BF7]/10 font-bold'
                  : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#13243A]/40'
              )}
            >
              <span className={isActive ? 'text-[#818CF8]' : 'text-[#64748B]'}>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10.5px] font-mono font-bold',
                    isActive
                      ? 'bg-[#5B5BF7] text-white shadow-2xs'
                      : 'bg-[#13243A] text-[#94A3B8] border border-[rgba(148,163,184,0.16)]'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Tab Contents */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols): Details & Operational Assignment */}
          <div className="lg:col-span-8 space-y-6">
            {/* Incident Details & Context Card */}
            <AdminCard className="p-5 sm:p-6 space-y-4">
              <h3 className="text-base font-bold font-heading text-[#F8FAFC] uppercase tracking-wide">
                Incident Details & Context
              </h3>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                {incident.description ||
                  (reports[0] && reports[0].description) ||
                  'No additional citizen description recorded in database.'}
              </p>

              {incident.investigationSummary && (
                <div className="p-4 rounded-xl bg-[#101F33] border border-[#22D3EE]/30 text-xs text-[#22D3EE] space-y-1.5 shadow-2xs">
                  <span className="font-bold flex items-center gap-2 font-heading tracking-wide uppercase">
                    <LuSparkles className="w-4 h-4 text-[#22D3EE]" />
                    Investigation Agent Diagnostic Summary
                  </span>
                  <p className="leading-relaxed text-[#F8FAFC] font-sans">
                    {incident.investigationSummary}
                  </p>
                </div>
              )}
            </AdminCard>

            {/* Operational Assignment Card */}
            <AdminCard className="p-5 sm:p-6 space-y-4">
              <h3 className="text-base font-bold font-heading text-[#F8FAFC] uppercase tracking-wide">
                Operational Assignment
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.14)] space-y-1">
                  <span className="text-[#64748B] block text-[10.5px] font-semibold uppercase tracking-wider font-mono">
                    Department
                  </span>
                  <span className="font-bold text-[#F8FAFC] block text-sm">
                    {departmentName}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.14)] space-y-1">
                  <span className="text-[#64748B] block text-[10.5px] font-semibold uppercase tracking-wider font-mono">
                    Assigned Crew
                  </span>
                  <span className="font-bold text-[#F8FAFC] block text-sm">
                    {teamName}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.14)] space-y-1">
                  <span className="text-[#64748B] block text-[10.5px] font-semibold uppercase tracking-wider font-mono">
                    Ward Jurisdiction
                  </span>
                  <span className="font-bold text-[#F8FAFC] block text-sm">
                    {wardLabel}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.14)] space-y-1">
                  <span className="text-[#64748B] block text-[10.5px] font-semibold uppercase tracking-wider font-mono">
                    Routing Rationale
                  </span>
                  <span className="font-medium text-[#94A3B8] block text-sm">
                    {incident.routingReason || 'Optimal jurisdiction and team availability matching'}
                  </span>
                </div>
              </div>
            </AdminCard>
          </div>

          {/* Right Column (4 cols): Severity & Dispatch Broadcasts */}
          <div className="lg:col-span-4 space-y-6">
            {/* Explainable Severity Score Card */}
            <AdminCard className="p-5 space-y-4">
              <h3 className="text-base font-bold font-heading text-[#F8FAFC] uppercase tracking-wide">
                Explainable Severity Score
              </h3>

              <div className="p-5 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.14)] text-center space-y-2">
                <span className="text-4xl font-extrabold font-heading text-[#F59E0B] block leading-none">
                  {incident.severityReasoning?.score !== undefined ? incident.severityReasoning.score : 45}{' '}
                  <span className="text-sm font-semibold text-[#64748B] font-mono">/ 100</span>
                </span>
                <span className="text-[11px] text-[#94A3B8] block font-mono">
                  Multi-Signal Weighted Index
                </span>

                {/* Horizontal Risk Bar */}
                <div className="w-full bg-[#13243A] h-2 rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full rounded-full bg-[#F59E0B] transition-all duration-500"
                    style={{
                      width: `${Math.min(100, incident.severityReasoning?.score || 45)}%`,
                    }}
                  />
                </div>
              </div>

              {incident.severityReasoning?.factors ? (
                <div className="space-y-2 text-xs pt-1">
                  <div className="flex justify-between py-1.5 border-b border-[rgba(148,163,184,0.1)] text-[#94A3B8]">
                    <span className="text-[#64748B]">Base Category Risk:</span>
                    <span className="font-semibold text-[#F8FAFC]">
                      {incident.severityReasoning.factors.baseCategoryRisk || 'Moderate'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[rgba(148,163,184,0.1)] text-[#94A3B8]">
                    <span className="text-[#64748B]">Infrastructure Proximity:</span>
                    <span className="font-semibold text-[#F8FAFC]">
                      {incident.severityReasoning.factors.infrastructureProximity || 'Standard'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 text-[#94A3B8]">
                    <span className="text-[#64748B]">Duplicate Escalation:</span>
                    <span className="font-semibold text-[#F8FAFC]">
                      +{incident.duplicateCount || 0} Reports
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#101F33] text-[11px] text-[#94A3B8] leading-relaxed">
                  {incident.severityReasoning?.explanation ||
                    'Multi-factor risk index evaluated by autonomous severity agents.'}
                </div>
              )}
            </AdminCard>

            {/* Dispatch Broadcasts Card */}
            <AdminCard className="p-5 space-y-3.5">
              <h3 className="text-base font-bold font-heading text-[#F8FAFC] uppercase tracking-wide">
                Dispatch Broadcasts
              </h3>
              {notifications.length === 0 ? (
                <p className="text-xs text-[#64748B] py-3 text-center">
                  No dispatch notifications have been recorded.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {notifications.map((n: any) => (
                    <div
                      key={n._id || n.id}
                      className="p-3 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.14)] text-xs space-y-1"
                    >
                      <span className="text-[10px] font-bold text-[#22D3EE] uppercase tracking-wide block font-mono">
                        {n.channel} • {n.status}
                      </span>
                      <p className="text-[#94A3B8] leading-snug">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </AdminCard>
          </div>
        </div>
      )}

      {/* TAB 2: PHOTOGRAPHIC EVIDENCE */}
      {activeTab === 'evidence' && (
        <AdminCard className="p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[rgba(148,163,184,0.12)] gap-2">
            <div>
              <h3 className="text-base font-bold font-heading text-[#F8FAFC] uppercase tracking-wide">
                Photographic Evidence ({evidence.length})
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Real stored photographic evidence from MongoDB records.
              </p>
            </div>
            <AdminBadge variant="ai" size="md">
              {evidence.length} {evidence.length === 1 ? 'file' : 'files'} attached
            </AdminBadge>
          </div>

          {evidence.length === 0 ? (
            <div className="py-16 text-center text-[#64748B] text-xs space-y-2">
              <LuCamera className="w-8 h-8 text-[#64748B] mx-auto opacity-50" />
              <p>No evidence uploaded for this incident yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {evidence.map((ev: any, index: number) => {
                const isAfter = ev.type === 'AFTER';
                const isBefore = ev.type === 'BEFORE' || !ev.type;
                const isInspection = ev.type === 'INSPECTION';
                const isRepair = ev.type === 'REPAIR';

                const fileUrl = getEvidenceImageUrl(ev.fileUrl);

                const typeLabel = isBefore
                  ? 'Before Report'
                  : isAfter
                  ? 'After Resolution'
                  : isInspection
                  ? 'Field Inspection'
                  : isRepair
                  ? 'Repair Verification'
                  : 'Supporting Evidence';

                const formattedDate = new Date(
                  ev.capturedAt || ev.createdAt || incident.createdAt
                ).toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                const uploaderName =
                  typeof ev.uploadedBy === 'object' && ev.uploadedBy?.name
                    ? ev.uploadedBy.name
                    : ev.source === 'CITIZEN' || !ev.source || ev.source === 'CITIZEN_UPLOAD'
                    ? 'Citizen'
                    : ev.source === 'OFFICER'
                    ? 'Municipal Field Officer'
                    : 'Operations Agent';

                return (
                  <div
                    key={ev._id || ev.id || index}
                    className="rounded-2xl border border-[rgba(148,163,184,0.16)] overflow-hidden bg-[#101F33] flex flex-col justify-between group transition-all duration-200 hover:border-[#5B5BF7]/50 shadow-md"
                  >
                    <div
                      onClick={() => setViewerEvidence(ev)}
                      className="h-52 bg-[#07111F] relative overflow-hidden cursor-pointer group/img"
                    >
                      <img
                        src={fileUrl}
                        alt={typeLabel}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-[#07111F]/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#13243A]/90 text-[#F8FAFC] text-xs font-semibold backdrop-blur-xs border border-[rgba(148,163,184,0.2)]">
                          <LuEye className="w-3.5 h-3.5 text-[#22D3EE]" />
                          <span>Inspect Full Resolution</span>
                        </span>
                      </div>
                      <span
                        className={cn(
                          'absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs font-mono',
                          isAfter
                            ? 'bg-[#22C55E]'
                            : isBefore
                            ? 'bg-[#5B5BF7]'
                            : isInspection
                            ? 'bg-[#F59E0B]'
                            : 'bg-[#13243A]'
                        )}
                      >
                        {ev.type || 'BEFORE'}
                      </span>
                    </div>

                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                      <div className="space-y-1">
                        <h4 className="font-bold text-[#F8FAFC] font-heading text-sm">
                          {typeLabel}
                        </h4>
                        <p className="text-[11px] text-[#64748B]">
                          Uploaded by {uploaderName} • {formattedDate}
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-[rgba(148,163,184,0.1)] flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setViewerEvidence(ev)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#818CF8] hover:text-[#A78BFA] transition-colors cursor-pointer"
                        >
                          <LuEye className="w-3.5 h-3.5" />
                          <span>View Full Image</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDownload(
                              fileUrl,
                              ev.fileUrl?.split('/').pop() || 'photographic-evidence.jpg'
                            )
                          }
                          className="p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] rounded-lg hover:bg-[#13243A] transition-colors cursor-pointer"
                          title="Download Image"
                        >
                          <LuDownload className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </AdminCard>
      )}

      {/* TAB 3: 10-AGENT INTELLIGENCE */}
      {activeTab === 'ai-analysis' && (
        <AdminCard className="p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[rgba(148,163,184,0.12)] gap-2">
            <div>
              <h3 className="text-base font-bold font-heading text-[#F8FAFC] uppercase tracking-wide flex items-center gap-2">
                <LuBot className="w-5 h-5 text-[#5B5BF7]" />
                <span>10-Agent Intelligence Fleet Traces ({agentExecutions.length})</span>
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Real-time autonomous agent executions, deterministic tool invocations, and policy audit ledgers.
              </p>
            </div>
            <AdminBadge variant="ai" size="md">
              LIVE MONGODB AUDIT
            </AdminBadge>
          </div>

          {agentExecutions.length === 0 ? (
            <div className="py-16 text-center text-[#64748B] text-xs space-y-2">
              <LuBot className="w-8 h-8 text-[#5B5BF7] mx-auto opacity-40" />
              <p>No agent executions recorded for this incident.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {agentExecutions.map((exec: any, idx: number) => {
                const isFailed = exec.status === 'FAILED';
                const isRunning = exec.status === 'RUNNING' || exec.status === 'STARTED';
                const isSuccess = exec.status === 'SUCCESS' || exec.status === 'COMPLETED';

                return (
                  <div
                    key={exec._id || exec.executionId || idx}
                    className={cn(
                      'p-4 rounded-xl border transition-all text-xs space-y-3',
                      isFailed
                        ? 'bg-[#181520] border-[#EF4444]/40'
                        : isRunning
                        ? 'bg-[#101F33] border-[#38BDF8]/40'
                        : 'bg-[#101F33] border-[rgba(148,163,184,0.14)] hover:border-[#5B5BF7]/40'
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            'p-2 rounded-lg',
                            isFailed
                              ? 'bg-[#EF4444]/20 text-[#EF4444]'
                              : isRunning
                              ? 'bg-[#38BDF8]/20 text-[#38BDF8] animate-pulse'
                              : 'bg-[#5B5BF7]/20 text-[#818CF8]'
                          )}
                        >
                          <LuCpu className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#F8FAFC]">
                              {exec.agentName || exec.agentId}
                            </span>
                            <span className="font-mono text-[10px] text-[#64748B]">
                              {exec.executionId}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#94A3B8] font-mono mt-0.5">
                            Mode: {exec.actualEngine || exec.executionMode || 'DETERMINISTIC_ENGINE'} • Duration: {exec.durationMs || 0}ms
                          </p>
                        </div>
                      </div>

                      <div>
                        <AdminBadge
                          variant={isFailed ? 'danger' : isRunning ? 'info' : 'success'}
                          size="sm"
                          dot
                        >
                          {exec.status}
                        </AdminBadge>
                      </div>
                    </div>

                    {/* Tools called & Decision */}
                    {exec.toolsCalled && exec.toolsCalled.length > 0 && (
                      <div className="p-3 rounded-lg bg-[#07111F] border border-[rgba(148,163,184,0.08)] space-y-1.5 font-mono text-[11px]">
                        <span className="text-[#64748B] block font-semibold">Tools Invoked:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {exec.toolsCalled.map((t: any, tidx: number) => (
                            <span
                              key={tidx}
                              className="px-2 py-0.5 rounded bg-[#13243A] text-[#22D3EE] border border-[rgba(148,163,184,0.12)]"
                            >
                              {t.toolName} ({t.durationMs}ms)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reasoning or Error info */}
                    {isFailed ? (
                      <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444] space-y-1">
                        <span className="font-bold flex items-center gap-1.5">
                          <LuCircleX className="w-4 h-4" />
                          Execution Failure Rationale:
                        </span>
                        <p className="text-[#FB7185] font-mono">
                          {exec.error?.message || exec.failureReason || 'Agent execution encountered runtime exception.'}
                        </p>
                      </div>
                    ) : exec.reasoning ? (
                      <div className="p-3 rounded-lg bg-[#0E1B2D] border border-[rgba(148,163,184,0.1)] text-xs text-[#94A3B8]">
                        <span className="font-bold text-[#F8FAFC] block mb-1">Agent Reasoning:</span>
                        <p className="leading-relaxed">{exec.reasoning}</p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </AdminCard>
      )}

      {/* TAB 4: WORK ORDERS */}
      {activeTab === 'work-orders' && (
        <AdminCard className="p-5 sm:p-6 space-y-4">
          <div className="pb-3 border-b border-[rgba(148,163,184,0.12)]">
            <h3 className="text-base font-bold font-heading text-[#F8FAFC] uppercase tracking-wide">
              Municipal Work Orders ({workOrders.length})
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Dispatched field work orders, assigned officers, and SLA deadlines.
            </p>
          </div>

          {workOrders.length === 0 ? (
            <p className="text-xs text-[#64748B] py-12 text-center">
              No work orders have been created for this incident.
            </p>
          ) : (
            <div className="space-y-3.5">
              {workOrders.map((wo: any) => (
                <div
                  key={wo._id || wo.id}
                  className="p-5 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.14)] text-xs space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-[#F8FAFC] font-heading font-mono">
                      {wo.workOrderNumber}
                    </span>
                    <AdminBadge variant={statusVariantMap[wo.status] || 'primary'} size="sm">
                      {wo.status}
                    </AdminBadge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[#94A3B8]">
                    <div>
                      <span className="text-[#64748B] block text-[10.5px] font-semibold uppercase">Priority</span>
                      <span className="font-bold text-[#F8FAFC] mt-0.5 block">{wo.priority || 'STANDARD'}</span>
                    </div>
                    <div>
                      <span className="text-[#64748B] block text-[10.5px] font-semibold uppercase">SLA Deadline</span>
                      <span className="mt-0.5 block font-mono text-[#F8FAFC]">
                        {wo.slaDeadline ? new Date(wo.slaDeadline).toLocaleString() : 'Not set'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748B] block text-[10.5px] font-semibold uppercase">Assigned Officer</span>
                      <span className="mt-0.5 block text-[#F8FAFC]">
                        {wo.assignedOfficerId?.name || 'Unassigned'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748B] block text-[10.5px] font-semibold uppercase">Created At</span>
                      <span className="mt-0.5 block font-mono text-[#F8FAFC]">
                        {new Date(wo.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdminCard>
      )}

      {/* TAB 5: TIMELINE */}
      {activeTab === 'timeline' && (
        <AdminIncidentTimelineWorkspace
          timeline={timeline}
          agentExecutions={agentExecutions}
          auditLogs={auditLogs}
          incident={incident}
          evidence={evidence}
          onRefresh={fetchDossier}
          isRefreshing={loading}
        />
      )}

      {/* TAB 6: AUDIT & EXECUTIONS */}
      {activeTab === 'audit' && (
        <AdminCard className="p-5 sm:p-6 space-y-4">
          <div className="pb-3 border-b border-[rgba(148,163,184,0.12)]">
            <h3 className="text-base font-bold font-heading text-[#F8FAFC] uppercase tracking-wide">
              Append-Only Operational Audit Trail ({auditLogs.length})
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Immutable cryptographic ledger events recording every mutation, tool execution, and state transition.
            </p>
          </div>

          {auditLogs.length === 0 ? (
            <p className="text-xs text-[#64748B] py-12 text-center">
              No audit log entries recorded for this incident.
            </p>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log: any, idx: number) => (
                <div
                  key={log._id || log.id || idx}
                  className="p-4 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.12)] space-y-2 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#818CF8] font-mono text-xs">
                        {log.action}
                      </span>
                      <AdminBadge variant={log.actorType === 'AI_AGENT' ? 'ai' : 'default'} size="sm">
                        {log.actorId || log.actorType}
                      </AdminBadge>
                    </div>
                    <span className="text-[#64748B] font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>

                  {/* Metadata / State delta */}
                  {(log.after || log.metadata) && (
                    <div className="p-2.5 rounded-lg bg-[#07111F] border border-[rgba(148,163,184,0.08)] font-mono text-[11px] text-[#94A3B8] overflow-x-auto">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(log.after || log.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </AdminCard>
      )}

      {/* 5. Photographic Evidence Theater Modal */}
      {viewerEvidence && (
        <EvidenceTheaterModal
          evidence={viewerEvidence}
          allEvidence={evidence}
          incident={incident}
          onClose={() => setViewerEvidence(null)}
          onSelectEvidence={(ev) => setViewerEvidence(ev)}
        />
      )}
    </div>
  );
}

export default AdminIncidentDossierPage;
