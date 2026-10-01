import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  incidentService,
  getIncidentTitle,
  normalizeCategory,
  getCategoryDisplayLabel,
} from '@/services/incidentService';
import { evidenceService, getEvidenceImageUrl, EvidenceRecord } from '@/services/evidenceService';
import { StatusBadge, SeverityBadge } from '@/components/ui/Badge';
import {
  CitizenContentContainer,
  CitizenCard,
  CitizenErrorState,
} from '@/components/citizen/CitizenContentContainer';
import {
  MapPin,
  Clock,
  Bot,
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Camera,
  Layers,
  Sparkles,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  CheckSquare,
  Activity,
  ChevronRight,
  Shield,
  Gauge,
  Radio,
  ExternalLink,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  X,
  Maximize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { IncidentJourneyView } from '@/components/incident-journey';
import { EvidenceTheaterModal } from '@/components/incident/EvidenceTheaterModal';
import { AiExecutionStream } from '@/components/incident/AiExecutionStream';
import { TenAgentOrchestrationWorkspace } from '@/components/incident/TenAgentOrchestrationWorkspace';

function computeSlaDetails(incident: any) {
  const status = incident?.status;
  const isResolved = ['RESOLVED', 'CLOSED'].includes(status || '');
  const deadlineStr = incident?.sla?.deadline;
  const targetHours = incident?.sla?.targetHours || 24;

  if (isResolved) {
    return {
      label: 'SLA Status',
      badgeText: 'Resolved in Target',
      primaryTime: 'Target Met',
      subText: `${targetHours}h SLA Standard`,
      isOverdue: false,
      isResolved: true,
      percentage: 100,
      color: '#159A68',
    };
  }

  if (!deadlineStr) {
    return {
      label: 'Municipal SLA',
      badgeText: 'Standard',
      primaryTime: `${targetHours}h Target`,
      subText: 'Resolution in progress',
      isOverdue: false,
      isResolved: false,
      percentage: 35,
      color: '#2878E5',
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
      label: 'SLA Escalated',
      badgeText: 'Target Exceeded',
      primaryTime: timeStr,
      subText: `Target: ${targetHours}h (${new Date(deadlineStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})`,
      isOverdue: true,
      isResolved: false,
      percentage: 100,
      color: '#EF6A63',
    };
  }

  const remainingMins = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(remainingMins / 60);
  const mins = remainingMins % 60;
  const timeStr = hours > 0 ? `${hours}h ${mins}m remaining` : `${mins}m remaining`;

  return {
    label: 'SLA Target Window',
    badgeText: `${targetHours}h Target`,
    primaryTime: timeStr,
    subText: `Deadline: ${new Date(deadlineStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
    isOverdue: false,
    isResolved: false,
    percentage: percentElapsed,
    color: hours < 6 ? '#F2B84B' : '#159A68',
  };
}

export function IncidentDossierPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [dossier, setDossier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Photographic Evidence Lightbox State
  const [viewerEvidence, setViewerEvidence] = useState<any | null>(null);
  const [zoom, setZoom] = useState<number>(1);

  const isCitizenPortal = location.pathname.startsWith('/citizen');

  const handleBack = () => {
    if (isCitizenPortal) {
      navigate('/citizen/incidents');
    } else {
      navigate(-1);
    }
  };

  // Close lightbox on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setViewerEvidence(null);
        setZoom(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openLightbox = (ev: any) => {
    setViewerEvidence(ev);
    setZoom(1);
  };

  const closeLightbox = () => {
    setViewerEvidence(null);
    setZoom(1);
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

  useEffect(() => {
    if (!id) return;
    const fetchDossier = async () => {
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
    fetchDossier();
  }, [id]);

  if (loading) {
    return (
      <CitizenContentContainer>
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#159A68]" />
          <p className="text-xs text-[#6B7C8F] font-sans">
            Loading photographic evidence & incident dossier...
          </p>
        </div>
      </CitizenContentContainer>
    );
  }

  if (error || !dossier) {
    return (
      <CitizenContentContainer>
        <div className="pt-4">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#526777] hover:text-[#102A43] transition-colors cursor-pointer group mb-4"
          >
            <ArrowLeft className="w-4 h-4 text-[#159A68] transition-transform group-hover:-translate-x-0.5" />
            <span>Back to My Incidents</span>
          </button>
        </div>

        <CitizenErrorState
          title="Incident Dossier Unavailable"
          message={error || 'This incident was not found in the municipal records database.'}
          onRetry={handleBack}
        />
      </CitizenContentContainer>
    );
  }

  const {
    incident,
    reports = [],
    evidence = [],
    workOrders = [],
    agentExecutions = [],
    timeline = [],
    auditLogs = [],
    notifications = [],
  } = dossier;

  const title = getIncidentTitle(incident);
  const address = incident.location?.address || 'Hosur Municipal Ward';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FileText className="w-4 h-4" /> },
    {
      id: 'evidence',
      label: `Photographic Evidence`,
      badge: evidence.length,
      icon: <Camera className="w-4 h-4" />,
    },
    { id: 'ai-analysis', label: '10-Agent Intelligence', icon: <Bot className="w-4 h-4" /> },
    {
      id: 'work-orders',
      label: `Work Orders`,
      badge: workOrders.length,
      icon: <CheckSquare className="w-4 h-4" />,
    },
    {
      id: 'timeline',
      label: `Timeline`,
      badge: timeline.length,
      icon: <Clock className="w-4 h-4" />,
    },
    {
      id: 'audit',
      label: `Audit & Executions`,
      badge: agentExecutions.length,
      icon: <Layers className="w-4 h-4" />,
    },
  ];

  return (
    <>
      <CitizenContentContainer className="space-y-4 text-left">
      {/* 1. Back Button — Aligned to exact same left grid edge */}
      <div>
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#526777] hover:text-[#102A43] transition-colors cursor-pointer group py-0.5"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#159A68] transition-transform group-hover:-translate-x-1" />
          <span>Back to My Incidents</span>
        </button>
      </div>

      {/* 2. Civic Incident Command Header — Compact, Elegant Proportions */}
      {(() => {
        const sla = computeSlaDetails(incident);
        const wardLabel = incident.ward || incident.location?.ward || 'Ward 12 - Central Hosur';
        const departmentName = incident.departmentId?.name || incident.department?.name || 'Municipal Infrastructure Dept';
        const teamName = incident.teamId?.name || incident.assignedTeamId?.name;

        return (
          <CitizenCard className="p-3 sm:px-4 sm:py-3 space-y-2 border border-[#E3EAE6] bg-white shadow-[0_2px_12px_rgba(16,42,67,0.03)] rounded-2xl select-none">
            {/* Top Row: INCIDENT System ID • Category Pill ● Status */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0F4F2] pb-1.5">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-[10.5px] font-bold uppercase tracking-wider text-[#829AB1] font-heading">
                  INCIDENT
                </span>
                <span className="font-mono font-bold text-[11.5px] sm:text-[12px] text-[#102A43] tracking-wide bg-[#F4F7F5] px-2 py-0.5 rounded-md border border-[#E3EAE6]">
                  {incident.incidentNumber || incident._id}
                </span>
                <span className="text-[#D0DFD6]">•</span>
                <span className="text-[11px] sm:text-[11.5px] font-semibold text-[#159A68] bg-[#E7F7F0] px-2.5 py-0.5 rounded-full border border-[#159A68]/20 font-sans">
                  {getCategoryDisplayLabel(incident.category)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge status={incident.status} />
              </div>
            </div>

            {/* Core Command Row: Title & Location (Left) vs Compact SLA Pod (Right) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-0.5">
              <div className="space-y-0.5 flex-1 min-w-0">
                {/* Incident Title: Refined to 18-20px */}
                <h1 className="text-[18px] sm:text-[20px] font-bold font-heading text-[#102A43] tracking-tight leading-snug truncate">
                  {title}
                </h1>
                {/* Location: 12.5-13px */}
                <div className="flex items-center gap-1.5 text-[12.5px] sm:text-[13px] text-[#526777]">
                  <MapPin className="w-3.5 h-3.5 text-[#159A68] shrink-0" />
                  <span className="font-normal text-[#627D98] truncate">{address}</span>
                </div>
              </div>

              {/* Dynamic SLA Command Pod — Streamlined height */}
              <div className="w-full sm:w-[240px] md:w-[250px] px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8EDE9] flex flex-col justify-between shrink-0 shadow-2xs space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#829AB1] text-[9.5px] font-bold uppercase tracking-wider font-heading flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#159A68]" />
                    <span>{sla.isResolved ? 'SLA STATUS' : 'SLA TARGET'}</span>
                  </span>
                  <span
                    className={cn(
                      'text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded font-mono',
                      sla.isOverdue
                        ? 'bg-[#FEECEC] text-[#D64545]'
                        : sla.isResolved
                        ? 'bg-[#E7F7F0] text-[#159A68]'
                        : 'bg-white border border-[#E3EAE6] text-[#526777]'
                    )}
                  >
                    {sla.isResolved ? '✓ TARGET MET' : sla.badgeText}
                  </span>
                </div>

                <div>
                  <div
                    className={cn(
                      'font-mono font-bold text-[14px] sm:text-[15px] tracking-tight leading-tight',
                      sla.isOverdue
                        ? 'text-[#D64545]'
                        : sla.isResolved
                        ? 'text-[#159A68]'
                        : 'text-[#102A43]'
                    )}
                  >
                    {sla.primaryTime}
                  </div>
                  <div className="text-[10px] text-[#829AB1] mt-0.5 leading-none">
                    {sla.subText}
                  </div>
                </div>

                {/* SLA Progress Bar */}
                <div className="w-full bg-[#E8EDE9] h-1 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${sla.percentage}%`,
                      backgroundColor: sla.color,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Metadata Row: Single horizontal metadata rail with · separators */}
            <div className="pt-1.5 border-t border-[#F0F4F2] flex flex-wrap items-center gap-2 text-[11.5px] sm:text-[12px] text-[#627D98]">
              <span className="font-bold text-[#102A43] uppercase text-[11px] tracking-wide">{incident.severity || 'Medium'}</span>
              <span className="text-[#CBD5E1]">·</span>
              <span>Reported {new Date(incident.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <span className="text-[#CBD5E1]">·</span>
              <span className="font-medium text-[#102A43]">{wardLabel}</span>
              {teamName && (
                <>
                  <span className="text-[#CBD5E1]">·</span>
                  <span className="font-medium text-[#102A43]">{teamName}</span>
                </>
              )}
              {incident.severityReasoning?.score !== undefined && (
                <>
                  <span className="text-[#CBD5E1]">·</span>
                  <span className="font-mono font-bold text-[#159A68] bg-[#E7F7F0] px-1.5 py-0.5 rounded border border-[#159A68]/15">AI Risk {incident.severityReasoning.score}/100</span>
                </>
              )}
            </div>
          </CitizenCard>
        );
      })()}

      {/* 3. Incident Tabs (Requirement 10: 56-60px height, 14px typography, subtle tint) */}
      <div className="w-full border-b border-[#E3EAE6] flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar pt-1 h-[56px]">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-3.5 sm:px-4 h-[56px] text-[14px] font-semibold transition-all shrink-0 cursor-pointer border-b-2',
                isActive
                  ? 'border-[#159A68] text-[#159A68] bg-[#E7F7F0]/30 font-bold'
                  : 'border-transparent text-[#6B7C8F] hover:text-[#102A43] hover:bg-slate-50'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[11px] font-mono font-bold',
                    isActive ? 'bg-[#159A68] text-white' : 'bg-[#FAF8F5] text-[#6B7C8F] border border-[#E3EAE6]'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. TAB CONTENTS */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (65–70% width, 8 cols): Details & Assignment */}
          <div className="lg:col-span-8 space-y-6">
            {/* Incident Details & Context Card */}
            <CitizenCard className="p-5 sm:p-6 space-y-3.5">
              <h3 className="text-[17px] font-bold font-heading text-[#102A43]">
                Incident Details & Context
              </h3>
              <p className="text-xs sm:text-sm text-[#526777] leading-relaxed">
                {incident.description ||
                  (reports[0] && reports[0].description) ||
                  'No additional citizen description provided.'}
              </p>

              {incident.investigationSummary && (
                <div className="p-4 rounded-2xl bg-[#EBF3FD] border border-[#2878E5]/25 text-xs text-[#1652A5] space-y-1.5">
                  <span className="font-bold flex items-center gap-1.5 font-heading">
                    <Sparkles className="w-4 h-4 text-[#2878E5]" />
                    Investigation Agent Diagnostic Summary
                  </span>
                  <p className="leading-relaxed">{incident.investigationSummary}</p>
                </div>
              )}
            </CitizenCard>

            {/* Operational Assignment Card */}
            <CitizenCard className="p-5 sm:p-6 space-y-3.5">
              <h3 className="text-[17px] font-bold font-heading text-[#102A43]">
                Operational Assignment
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E3EAE6]">
                  <span className="text-[#829AB1] block text-[11px] font-semibold uppercase tracking-wider">
                    Department
                  </span>
                  <span className="font-bold text-[#102A43] mt-1 block text-xs sm:text-sm">
                    {incident.departmentId?.name ||
                      incident.assignedDepartment ||
                      'Roads & Infrastructure'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E3EAE6]">
                  <span className="text-[#829AB1] block text-[11px] font-semibold uppercase tracking-wider">
                    Assigned Crew
                  </span>
                  <span className="font-bold text-[#102A43] mt-1 block text-xs sm:text-sm">
                    {incident.assignedTeamId?.name || incident.teamId?.name || 'Road Maintenance Team'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E3EAE6]">
                  <span className="text-[#829AB1] block text-[11px] font-semibold uppercase tracking-wider">
                    Ward Jurisdiction
                  </span>
                  <span className="font-bold text-[#102A43] mt-1 block text-xs sm:text-sm">
                    {incident.location?.ward || 'Ward 12 — Central Hosur'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E3EAE6]">
                  <span className="text-[#829AB1] block text-[11px] font-semibold uppercase tracking-wider">
                    Routing Rationale
                  </span>
                  <span className="font-medium text-[#526777] mt-1 block text-xs sm:text-sm">
                    {incident.routingReason || 'Optimal jurisdiction and team availability matching'}
                  </span>
                </div>
              </div>
            </CitizenCard>
          </div>

          {/* Right Column (30–35% width, 4 cols): Severity & Dispatch */}
          <div className="lg:col-span-4 space-y-6">
            {/* Explainable Severity Score Card */}
            <CitizenCard className="p-5 space-y-3.5">
              <h3 className="text-[17px] font-bold font-heading text-[#102A43]">
                Explainable Severity Score
              </h3>

              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E3EAE6] text-center space-y-1">
                <span className="text-3xl font-extrabold font-heading text-[#F2B84B] block">
                  {incident.severityReasoning?.score ||
                    incident.severityReasoning?.calculatedScore ||
                    75}{' '}
                  <span className="text-sm font-semibold text-[#829AB1]">/ 100</span>
                </span>
                <span className="text-[11px] text-[#829AB1] block font-sans">
                  Multi-Signal Weighted Index
                </span>
              </div>

              {incident.severityReasoning?.factors ? (
                <div className="space-y-2 text-xs pt-1">
                  <div className="flex justify-between py-1.5 border-b border-[#E3EAE6]/60 text-[#526777]">
                    <span className="text-[#829AB1]">Base Category Risk:</span>
                    <span className="font-semibold text-[#102A43]">
                      {incident.severityReasoning.factors.baseCategoryRisk || 'Moderate'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#E3EAE6]/60 text-[#526777]">
                    <span className="text-[#829AB1]">Infrastructure Proximity:</span>
                    <span className="font-semibold text-[#102A43]">
                      {incident.severityReasoning.factors.infrastructureProximity || 'Standard'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 text-[#526777]">
                    <span className="text-[#829AB1]">Duplicate Escalation:</span>
                    <span className="font-semibold text-[#102A43]">
                      +{incident.duplicateCount || 0} Reports
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 text-[11px] text-[#526777] leading-relaxed">
                  {incident.severityReasoning?.explanation ||
                    'Multi-factor risk index evaluated by autonomous severity agents.'}
                </div>
              )}
            </CitizenCard>

            {/* Dispatch Broadcasts Card */}
            <CitizenCard className="p-5 space-y-3">
              <h3 className="text-[15px] font-bold font-heading text-[#102A43]">
                Dispatch Broadcasts
              </h3>
              {notifications.length === 0 ? (
                <p className="text-xs text-[#829AB1] py-2">No outgoing dispatch notifications logged.</p>
              ) : (
                <div className="space-y-2.5">
                  {notifications.map((n: any) => (
                    <div
                      key={n._id || n.id}
                      className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E3EAE6] text-xs space-y-1"
                    >
                      <span className="text-[10px] font-bold text-[#159A68] uppercase tracking-wide block">
                        {n.channel} • {n.status}
                      </span>
                      <p className="text-[#526777] leading-snug">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </CitizenCard>
          </div>
        </div>
      )}

      {/* TAB 2: EVIDENCE */}
      {activeTab === 'evidence' && (
        <CitizenCard className="p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E3EAE6] gap-2">
            <div>
              <h3 className="text-[17px] font-bold font-heading text-[#102A43]">
                Photographic Evidence ({evidence.length})
              </h3>
              <p className="text-xs text-[#6B7C8F]">
                Verified photographic evidence for this incident.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#E7F7F0] text-[#159A68] text-xs font-bold font-mono self-start sm:self-auto border border-[#159A68]/20">
              {evidence.length} {evidence.length === 1 ? 'file' : 'files'} attached
            </span>
          </div>

          {evidence.length === 0 ? (
            <div className="py-16 text-center text-[#829AB1] text-xs space-y-2">
              <Camera className="w-8 h-8 text-[#829AB1] mx-auto opacity-50" />
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
                    className="rounded-[18px] border border-[#E3EAE6] overflow-hidden bg-white shadow-[0_8px_30px_rgba(15,40,30,0.06)] flex flex-col justify-between group transition-all duration-200 hover:shadow-md hover:border-[#159A68]/30"
                  >
                    <div
                      onClick={() => openLightbox(ev)}
                      className="h-52 bg-slate-900 relative overflow-hidden cursor-pointer group/img"
                    >
                      <img
                        src={fileUrl}
                        alt={typeLabel}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 text-white text-xs font-semibold backdrop-blur-xs">
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Full Image</span>
                        </span>
                      </div>
                      <span
                        className={cn(
                          'absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs font-heading',
                          isAfter
                            ? 'bg-[#159A68]'
                            : isBefore
                            ? 'bg-[#2878E5]'
                            : isInspection
                            ? 'bg-[#F2B84B]'
                            : 'bg-[#102A43]'
                        )}
                      >
                        {ev.type || 'BEFORE'}
                      </span>
                    </div>

                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                      <div className="space-y-1">
                        <h4 className="font-bold text-[#102A43] font-heading text-sm">
                          {typeLabel}
                        </h4>
                        <p className="text-[11px] text-[#6B7C8F]">
                          Uploaded by {uploaderName} • {formattedDate}
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-[#E3EAE6] flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => openLightbox(ev)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#159A68] hover:text-[#128358] transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
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
                          className="p-1.5 text-[#6B7C8F] hover:text-[#102A43] rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                          title="Download Image"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CitizenCard>
      )}

      {/* TAB 3: 10-AGENT INTELLIGENCE (AI Orchestration Workspace) */}
      {activeTab === 'ai-analysis' && (
        <TenAgentOrchestrationWorkspace
          incident={incident}
          dossier={dossier}
        />
      )}

      {/* TAB 4: WORK ORDERS */}
      {activeTab === 'work-orders' && (
        <CitizenCard className="p-5 sm:p-6 space-y-4">
          <div className="pb-3 border-b border-[#E3EAE6]">
            <h3 className="text-[17px] font-bold font-heading text-[#102A43]">
              Municipal Work Orders
            </h3>
            <p className="text-xs text-[#6B7C8F]">
              Dispatched field work orders, checklist requirements, and contractor SLAs.
            </p>
          </div>

          {workOrders.length === 0 ? (
            <p className="text-xs text-[#829AB1] py-12 text-center">
              No work orders linked to this incident.
            </p>
          ) : (
            <div className="space-y-3.5">
              {workOrders.map((wo: any) => (
                <div
                  key={wo._id || wo.id}
                  className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E3EAE6] text-xs space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-[#102A43] font-heading font-mono">
                      {wo.workOrderNumber}
                    </span>
                    <StatusBadge status={wo.status} />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[#526777]">
                    <div>
                      <span className="text-[#829AB1] block text-[11px] font-semibold">Priority</span>
                      <span className="font-bold text-[#102A43] mt-0.5 block">{wo.priority}</span>
                    </div>
                    <div>
                      <span className="text-[#829AB1] block text-[11px] font-semibold">SLA Deadline</span>
                      <span className="mt-0.5 block font-mono">
                        {new Date(wo.slaDeadline).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#829AB1] block text-[11px] font-semibold">Checklist Items</span>
                      <span className="mt-0.5 block">{wo.checklist?.length || 0} checks</span>
                    </div>
                    <div>
                      <span className="text-[#829AB1] block text-[11px] font-semibold">Created At</span>
                      <span className="mt-0.5 block font-mono">
                        {new Date(wo.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CitizenCard>
      )}

      {/* TAB 5: TIMELINE / INCIDENT JOURNEY */}
      {activeTab === 'timeline' && (
        <IncidentJourneyView
          incident={incident}
          timeline={timeline}
          agentExecutions={agentExecutions}
          isLoading={false}
          onRefresh={async () => {
            if (!id) return;
            try {
              const data = await incidentService.getIncidentDossier(id);
              setDossier((prev: any) => ({ ...prev, ...data }));
            } catch (err) {
              console.warn('Failed to refresh dossier on live event:', err);
            }
          }}
        />
      )}

      {/* TAB 6: AUDIT & EXECUTIONS (AI Execution Stream) */}
      {activeTab === 'audit' && (
        <AiExecutionStream
          executions={agentExecutions}
          incident={incident}
        />
      )}

      </CitizenContentContainer>

      {/* 5. PHOTOGRAPHIC EVIDENCE THEATER MODAL */}
      {viewerEvidence && (
        <EvidenceTheaterModal
          evidence={viewerEvidence}
          allEvidence={evidence}
          incident={incident}
          onClose={closeLightbox}
          onSelectEvidence={(ev) => setViewerEvidence(ev)}
        />
      )}
    </>
  );
}

export default IncidentDossierPage;
