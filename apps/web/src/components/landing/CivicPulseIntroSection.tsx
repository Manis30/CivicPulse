import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Camera,
  Cpu,
  Route,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Check,
  Sparkles,
  ArrowRight,
  Play,
  Pause,
  Info,
  Clock,
  MapPin,
  AlertCircle,
  FileCheck,
  ChevronRight,
  X
} from 'lucide-react';
import { useIncidents } from '../../contexts/IncidentContext';

// Transparent Decision Metadata for Agent Chips (Part 7)
export interface AgentDecisionMetadata {
  id: string;
  name: string;
  role: string;
  color: string;
  input: string;
  decision: string;
  evidence: string;
  metricLabel: string;
  metricValue: string;
}

const AGENT_DECISION_REGISTRY: Record<string, AgentDecisionMetadata> = {
  // UNDERSTAND AGENTS
  'Vision Agent': {
    id: 'AGENT_VISION',
    name: 'Vision Agent',
    role: 'Computer Vision & Defect Triage',
    color: '#2878E5',
    input: 'Uploaded citizen image capture',
    decision: 'Pothole detected (depth ~14cm, asphalt fissure)',
    evidence: 'Edge segmentation, depth contour, EXIF photo integrity',
    metricLabel: 'Confidence',
    metricValue: '94.6%',
  },
  'Location Agent': {
    id: 'AGENT_LOCATION',
    name: 'Location Agent',
    role: 'GIS & Municipal Boundary Resolver',
    color: '#2878E5',
    input: 'GPS coordinates [40.7418, -73.9876] ±3m',
    decision: 'Ward 18 · Zone 01 (Madison Corridor)',
    evidence: 'Municipal boundary shapefiles & street centerline query',
    metricLabel: 'Spatial Accuracy',
    metricValue: '±3 meters',
  },
  'Duplicate Agent': {
    id: 'AGENT_DUPLICATE',
    name: 'Duplicate Detection Agent',
    role: 'Spatial & Semantic Clustering',
    color: '#2878E5',
    input: '15-meter spatial radius + description embeddings',
    decision: 'Unique root defect (0 existing active duplicates)',
    evidence: '2dsphere index scan & Levenshtein title distance',
    metricLabel: 'Cluster Confidence',
    metricValue: '98.9%',
  },
  'Severity Agent': {
    id: 'AGENT_SEVERITY',
    name: 'Severity Agent',
    role: 'Risk Scoring & Urgency Evaluation',
    color: '#2878E5',
    input: 'Depth >10cm, bus transit corridor, pedestrian proximity',
    decision: 'High Priority (Risk score 78/100)',
    evidence: 'Peak two-wheeler flow & transit arterial hazard matrix',
    metricLabel: 'Risk Score',
    metricValue: '78 / 100',
  },

  // COORDINATE AGENTS
  'Routing Agent': {
    id: 'AGENT_ROUTING',
    name: 'Routing Agent',
    role: 'Jurisdiction & Dispatch Matcher',
    color: '#F59E0B',
    input: 'High-priority road cavity · Ward 18',
    decision: 'Assigned: Roads & Transit Dept · Team 04',
    evidence: 'Proximity (0.6 km) + current lowest workload queue (2/5)',
    metricLabel: 'SLA Window',
    metricValue: '04h 32m',
  },
  'Investigation Agent': {
    id: 'AGENT_INVESTIGATION',
    name: 'Investigation Agent',
    role: 'Historical Maintenance Synthesizer',
    color: '#F59E0B',
    input: 'Segment 5A historical repair ledger',
    decision: 'Recurrence root cause: Sub-base water erosion',
    evidence: 'Work order #WO-2025-0812 sealed 14 months prior',
    metricLabel: 'Recurrence Index',
    metricValue: 'Medium Risk',
  },
  'Operations Agent': {
    id: 'AGENT_OPERATIONS',
    name: 'Operations Agent',
    role: 'Work Order & SLA Lifecycle Engine',
    color: '#F59E0B',
    input: 'Approved incident #INC-2026-1049 bundle',
    decision: 'Work Order #WO-2026-3041 generated & locked',
    evidence: 'Material manifest: Hot asphalt mix, vibratory compactor',
    metricLabel: 'Order Status',
    metricValue: 'Dispatched',
  },

  // VERIFY AGENTS
  'Verification Agent': {
    id: 'AGENT_VERIFICATION',
    name: 'Resolution Verification Agent',
    role: 'Photometric Dual-Frame Auditor',
    color: '#10B981',
    input: 'Before (citizen signal) vs After (crew repair) imagery',
    decision: 'Defect successfully remediated to municipal standard',
    evidence: 'Asphalt edge seam continuity & depth leveling audit',
    metricLabel: 'Audit Confidence',
    metricValue: '98.4%',
  },
  'Notification Agent': {
    id: 'AGENT_NOTIFICATION',
    name: 'Notification Agent',
    role: 'Multi-Channel Citizen Communicator',
    color: '#10B981',
    input: 'Lifecycle event: INCIDENT_VERIFIED_CLOSED',
    decision: 'Multi-channel citizen closure alert generated',
    evidence: 'Citizen receipt SMS, email audit trail, open portal feed',
    metricLabel: 'Delivery Status',
    metricValue: 'Delivered (100%)',
  },
};

// Five Core Operational Stages
export interface WorkflowStageDefinition {
  step: string;
  phase: 'REPORT' | 'UNDERSTAND' | 'COORDINATE' | 'RESOLVE' | 'VERIFY';
  concept: string; // SIGNAL → INTELLIGENCE → DECISION → EXECUTION → PROOF
  label: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  lightBg: string;
  borderActive: string;
  structuredRow: {
    category: string;
    items: string[];
  };
  agentChips: string[];
  executionDetail: {
    badge: string;
    action: string;
    progressPercent: number;
    outcome: string;
  };
}

const WORKFLOW_STAGES: WorkflowStageDefinition[] = [
  // 01 REPORT
  {
    step: '01',
    phase: 'REPORT',
    concept: 'SIGNAL',
    label: 'Citizen Signal',
    tagline: 'Instant geo-located reporting',
    icon: Camera,
    color: '#159A68',
    lightBg: '#E7F7F0',
    borderActive: 'rgba(21, 154, 104, 0.45)',
    structuredRow: {
      category: 'INPUT',
      items: ['Photo', 'GPS', 'Description'],
    },
    agentChips: [],
    executionDetail: {
      badge: 'CITIZEN SIGNAL INGESTION',
      action: 'Validating EXIF metadata & GPS coordinates...',
      progressPercent: 100,
      outcome: 'Citizen photo verified · Geo-hash locked · Ward 18',
    },
  },

  // 02 UNDERSTAND
  {
    step: '02',
    phase: 'UNDERSTAND',
    concept: 'INTELLIGENCE',
    label: 'AI Multimodal Triage',
    tagline: 'Neural vision & context audit',
    icon: Cpu,
    color: '#2878E5',
    lightBg: '#EBF3FD',
    borderActive: 'rgba(40, 120, 229, 0.45)',
    structuredRow: {
      category: 'AI ANALYSIS',
      items: ['Vision', 'Location', 'Duplicate', 'Severity'],
    },
    agentChips: ['Vision Agent', 'Location Agent', 'Duplicate Agent', 'Severity Agent'],
    executionDetail: {
      badge: 'VISION AGENT ACTIVE',
      action: 'Analyzing uploaded image features & depth...',
      progressPercent: 82,
      outcome: 'Pothole detected · Confidence: 94% · High Priority',
    },
  },

  // 03 COORDINATE
  {
    step: '03',
    phase: 'COORDINATE',
    concept: 'DECISION',
    label: 'Autonomous Routing',
    tagline: 'Department & crew dispatch',
    icon: Route,
    color: '#F59E0B',
    lightBg: '#FEF8EC',
    borderActive: 'rgba(245, 158, 11, 0.45)',
    structuredRow: {
      category: 'DECISION',
      items: ['Department', 'Team', 'Priority', 'SLA'],
    },
    agentChips: ['Routing Agent', 'Investigation Agent', 'Operations Agent'],
    executionDetail: {
      badge: 'ROUTING AGENT ACTIVE',
      action: 'Evaluating crew proximity & queue capacity...',
      progressPercent: 91,
      outcome: 'Assigned: Roads Dept · Team 04 · SLA: 04h 32m',
    },
  },

  // 04 RESOLVE
  {
    step: '04',
    phase: 'RESOLVE',
    concept: 'EXECUTION',
    label: 'Physical Execution',
    tagline: 'Field repair on the ground',
    icon: Wrench,
    color: '#526777',
    lightBg: '#EEF4F7',
    borderActive: 'rgba(82, 103, 119, 0.45)',
    structuredRow: {
      category: 'ACTION',
      items: ['Work Order', 'Field Team', 'Evidence'],
    },
    agentChips: [],
    executionDetail: {
      badge: 'OPERATIONS AGENT DISPATCHED',
      action: 'Field crew on-site · Compaction underway...',
      progressPercent: 68,
      outcome: 'Work Order #WO-3041 · Bitumen compaction verified',
    },
  },

  // 05 VERIFY
  {
    step: '05',
    phase: 'VERIFY',
    concept: 'PROOF',
    label: 'Autonomous Audit',
    tagline: 'Photometric audit & closure',
    icon: ShieldCheck,
    color: '#10B981',
    lightBg: '#EBF8F2',
    borderActive: 'rgba(16, 185, 129, 0.45)',
    structuredRow: {
      category: 'PROOF',
      items: ['Before', 'After', 'AI Verification'],
    },
    agentChips: ['Verification Agent', 'Notification Agent'],
    executionDetail: {
      badge: 'RESOLUTION VERIFICATION AGENT ACTIVE',
      action: 'Comparing before/after imagery & seam continuity...',
      progressPercent: 100,
      outcome: 'Resolution Verified ✓ · Ticket closed · Citizen notified',
    },
  },
];

// Live Incident Telemetry Progress Steps
const INCIDENT_LIFECYCLE_STEPS = [
  { key: 'REPORTED', label: 'Reported', stageIdx: 0 },
  { key: 'CLASSIFIED', label: 'Classified', stageIdx: 1 },
  { key: 'PRIORITIZED', label: 'Prioritized', stageIdx: 1 },
  { key: 'ASSIGNED', label: 'Assigned', stageIdx: 2 },
  { key: 'RESOLVED', label: 'Resolved', stageIdx: 3 },
  { key: 'VERIFIED', label: 'Verified', stageIdx: 4 },
];

export function CivicPulseIntroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [hasEnteredViewport, setHasEnteredViewport] = useState<boolean>(false);

  // Agent Popover / Transparency Modal State
  const [selectedAgent, setSelectedAgent] = useState<AgentDecisionMetadata | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const { incidents, activeCount, aiOpsCount } = useIncidents();

  // Find primary representative active incident from centralized data
  const realIncident = useMemo(() => {
    const primary =
      incidents.find((i) => i.category === 'POTHOLE') ||
      incidents.find((i) => i.severity === 'HIGH') ||
      incidents[0];

    if (!primary) {
      return {
        id: 'INC-2026-1049',
        category: 'POTHOLE',
        ward: 'Ward 18',
        zone: 'Zone 01',
        severity: 'HIGH PRIORITY',
        department: 'Roads & Infrastructure',
        team: 'Team 04',
        reportsCount: 8,
        address: 'Lexington Ave & 42nd St',
      };
    }

    return {
      id: primary.id,
      category: primary.category?.replace('_', ' ') || 'POTHOLE',
      ward: primary.location?.ward || 'Ward 18',
      zone: primary.location?.zone || 'Zone 01',
      severity: primary.severity === 'CRITICAL' ? 'CRITICAL PRIORITY' : 'HIGH PRIORITY',
      department: primary.departmentId ? 'Roads & Infrastructure' : 'Municipal Operations',
      team: 'Ward 18 Team 04',
      reportsCount: primary.linkedReportIds?.length ? primary.linkedReportIds.length + 1 : 8,
      address: primary.location?.address || 'Lexington Ave Arterial Corridor',
    };
  }, [incidents]);

  const livePipelineStats = useMemo(() => ({
    agentsCount: 9,
    activeIncidents: activeCount,
    runningOps: aiOpsCount,
  }), [activeCount, aiOpsCount]);

  // Intersection Observer: Start animations once when scrolled into view (Part 1 & Part 11)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasEnteredViewport(true);
            observer.disconnect(); // Execute once, do not restart constantly on scroll
          }
        });
      },
      { threshold: 0.22 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Controlled Stage Timer (Progresses every 3.8s when playing and in viewport)
  useEffect(() => {
    if (!hasEnteredViewport || !isPlaying) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % WORKFLOW_STAGES.length);
    }, 3800);

    return () => clearInterval(interval);
  }, [hasEnteredViewport, isPlaying]);

  // Close popover on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setSelectedAgent(null);
      }
    };

    if (selectedAgent) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [selectedAgent]);

  const handleStepClick = useCallback((index: number) => {
    setActiveStep(index);
    // Keep user's selection in focus
  }, []);

  const handleAgentChipClick = (e: React.MouseEvent, agentName: string) => {
    e.stopPropagation();
    const meta = AGENT_DECISION_REGISTRY[agentName];
    if (meta) {
      setSelectedAgent(meta);
    }
  };

  const currentStage = WORKFLOW_STAGES[activeStep];

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="py-20 lg:py-28 bg-[#F7F8F4] border-t border-[#102A43]/[0.06] relative overflow-hidden select-none"
    >
      {/* Background Soft Natural Lighting Gradients */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-[#159A68]/[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-[#2878E5]/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* =========================================================================
            PART 8 & PART 9: SECTION HEADER & LIVE SYSTEM STATUS
            ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
          <div className="max-w-2xl space-y-3.5 text-left">
            {/* Part 8 Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E7F7F0] border border-[#159A68]/20 text-[#159A68] text-xs font-bold tracking-wider uppercase font-heading">
              <span className="w-1.5 h-1.5 rounded-full bg-[#159A68] animate-pulse" />
              <span>HOW CIVICPULSE OPERATES</span>
            </div>

            {/* Part 8 Main Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#102A43] font-heading tracking-tight leading-[1.14]">
              One report can start a <br className="hidden sm:inline" />
              <span className="text-[#159A68]">chain of action.</span>
            </h2>

            {/* Part 8 Shorter Supporting Sentence */}
            <p className="text-base sm:text-lg text-[#526777] font-sans leading-relaxed">
              From citizen signal to verified resolution, autonomous agents coordinate every step.
            </p>
          </div>

          {/* Part 9: Live System Status Pill */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white/92 backdrop-blur-md border border-[#102A43]/10 shadow-xs text-xs">
              <span className="w-2 h-2 rounded-full bg-[#159A68] animate-pulse" />
              <span className="font-heading font-bold text-[#102A43] tracking-wide text-[10.5px] uppercase">
                LIVE AGENT PIPELINE
              </span>
              <span className="text-[#CBD5E1]">|</span>
              <div className="flex items-center gap-2 text-xs font-medium">
                <span className="font-bold text-[#102A43]">{livePipelineStats.agentsCount} agents</span>
                <span className="text-[#829AB1]">•</span>
                <span className="font-bold text-[#EF4444]">{livePipelineStats.activeIncidents} active</span>
                <span className="text-[#829AB1]">•</span>
                <span className="font-bold text-[#2878E5]">{livePipelineStats.runningOps} ops running</span>
              </div>
            </div>

            {/* Play / Pause Interactive Toggle */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/92 hover:bg-white text-[#526777] hover:text-[#102A43] border border-[#102A43]/10 shadow-xs text-xs font-semibold transition-all"
              title={isPlaying ? 'Pause automated pipeline demonstration' : 'Resume demonstration'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-[#159A68]" />
                  <span className="hidden sm:inline">Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-[#159A68]" />
                  <span className="hidden sm:inline">Play</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* =========================================================================
            PART 1 & PART 2: ANIMATED CONNECTION & 5 WORKFLOW CARDS
            ========================================================================= */}
        <div className="relative">
          {/* Part 1: Horizontal Animated Connecting Rail on Desktop (Desktop Pipeline) */}
          <div className="hidden lg:block absolute top-[62px] left-[5%] right-[5%] h-1 bg-[#102A43]/[0.08] rounded-full z-0 overflow-hidden">
            {/* Dynamic Progress Fill Line */}
            <div
              className="h-full bg-gradient-to-r from-[#159A68] via-[#2878E5] to-[#10B981] transition-all duration-700 ease-out"
              style={{
                width: `${(activeStep / (WORKFLOW_STAGES.length - 1)) * 100}%`,
              }}
            />
          </div>

          {/* Part 1: Glowing Traveling Signal Pulse Node */}
          <div
            className="hidden lg:block absolute top-[58px] z-10 transition-all duration-700 ease-out pointer-events-none"
            style={{
              left: `calc(5% + ${(activeStep / (WORKFLOW_STAGES.length - 1)) * 90}% - 6px)`,
            }}
          >
            <div className="w-4 h-4 rounded-full bg-white border-2 border-[#159A68] shadow-md flex items-center justify-center journey-signal-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-[#159A68]" />
            </div>
          </div>

          {/* 5-Card Grid Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 relative z-10">
            {WORKFLOW_STAGES.map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeStep === idx;
              const isCompleted = activeStep > idx;

              return (
                <div
                  key={item.step}
                  onClick={() => handleStepClick(idx)}
                  className={`group relative rounded-2xl p-5 sm:p-5.5 text-left transition-all duration-300 flex flex-col justify-between cursor-pointer border ${
                    isActive
                      ? 'bg-white shadow-xl shadow-[#102A43]/[0.07] border-[#159A68] -translate-y-1.5 ring-2 ring-[#159A68]/20'
                      : isCompleted
                      ? 'bg-white/90 hover:bg-white border-[#102A43]/[0.09] shadow-xs'
                      : 'bg-white/70 hover:bg-white/95 border-[#102A43]/[0.07] hover:shadow-sm'
                  }`}
                  style={{
                    borderColor: isActive ? item.color : undefined,
                  }}
                >
                  {/* Top Row: Concept Chip, Step Number & Completed Badge */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      {/* Concept Label (SIGNAL, INTELLIGENCE, DECISION, EXECUTION, PROOF) */}
                      <span
                        className="text-[10px] font-extrabold uppercase tracking-wider font-heading px-2 py-0.5 rounded-md"
                        style={{
                          backgroundColor: isActive ? item.lightBg : 'rgba(16, 42, 67, 0.04)',
                          color: isActive ? item.color : '#526777',
                        }}
                      >
                        {item.concept}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {isCompleted && (
                          <span
                            className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#E7F7F0] text-[#159A68]"
                            title="Completed stage"
                          >
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                        <span
                          className={`text-xs font-mono font-bold ${
                            isActive ? 'text-[#102A43]' : 'text-[#829AB1]'
                          }`}
                        >
                          {item.step}
                        </span>
                      </div>
                    </div>

                    {/* Stage Header: Icon & Title */}
                    <div className="flex items-center gap-3 mb-2.5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105"
                        style={{
                          backgroundColor: item.lightBg,
                          color: item.color,
                        }}
                      >
                        <Icon className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <div>
                        <span
                          className="text-[10.5px] font-bold uppercase tracking-wider font-heading block"
                          style={{ color: item.color }}
                        >
                          {item.phase}
                        </span>
                        <h3 className="font-heading font-extrabold text-sm sm:text-base text-[#102A43] leading-snug">
                          {item.label}
                        </h3>
                      </div>
                    </div>

                    {/* Tagline */}
                    <p className="text-xs text-[#526777] font-medium leading-relaxed mb-4">
                      {item.tagline}
                    </p>

                    {/* =========================================================
                        PART 4: COMPACT STRUCTURED ROW (INPUT / DECISION / ACTION)
                        ========================================================= */}
                    <div className="bg-[#FAFBF9] rounded-xl p-2.5 border border-[#102A43]/[0.05] mb-3">
                      <span className="text-[9px] font-extrabold tracking-wider uppercase text-[#829AB1] font-heading block mb-1.5">
                        {item.structuredRow.category}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {item.structuredRow.items.map((sub) => (
                          <span
                            key={sub}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-[#102A43]/[0.08] text-[#102A43] font-semibold tracking-tight"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* =========================================================
                        PART 3 & PART 7: SHOW ACTUAL AGENT CHIPS & DECISION MODAL
                        ========================================================= */}
                    {item.agentChips.length > 0 && (
                      <div className="mb-3 space-y-1.5">
                        <span className="text-[9px] font-extrabold tracking-wider uppercase text-[#829AB1] font-heading block">
                          AUTONOMOUS AGENTS
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {item.agentChips.map((agentName) => {
                            return (
                              <button
                                key={agentName}
                                type="button"
                                onClick={(e) => handleAgentChipClick(e, agentName)}
                                className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#EEF4F7] hover:bg-white text-[#102A43] border border-[#102A43]/[0.09] hover:border-[#2878E5]/40 hover:text-[#2878E5] transition-all group/chip shadow-2xs"
                                title={`Click to inspect ${agentName} decision transparency`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-[#2878E5]" />
                                <span>{agentName}</span>
                                <Info className="w-2.5 h-2.5 text-[#829AB1] group-hover/chip:text-[#2878E5] opacity-60 group-hover/chip:opacity-100" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* =========================================================
                      PART 2 & PART 6: ACTIVE CARD EXECUTION DETAIL
                      ========================================================= */}
                  <div className="mt-3 pt-3 border-t border-[#102A43]/[0.06]">
                    {isActive ? (
                      <div className="space-y-2 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between text-[10px]">
                          <span
                            className="font-bold tracking-wider uppercase font-heading flex items-center gap-1.5"
                            style={{ color: item.color }}
                          >
                            <span
                              className="w-2 h-2 rounded-full animate-ping"
                              style={{ backgroundColor: item.color }}
                            />
                            {item.executionDetail.badge}
                          </span>
                          <span className="font-mono font-bold text-[#102A43]">
                            {item.executionDetail.progressPercent}%
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-[#EEF4F7] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500 ease-out"
                            style={{
                              width: `${item.executionDetail.progressPercent}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>

                        <p className="text-[10px] text-[#526777] font-medium leading-snug truncate">
                          {item.executionDetail.outcome}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-[11px] text-[#829AB1] py-0.5">
                        <span className="font-medium">
                          {isCompleted ? 'Completed ✓' : 'Awaiting signal'}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1] group-hover:text-[#102A43] transition-colors" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            PART 5: LIVE INCIDENT PROGRESSION (BENEATH CARDS)
            ========================================================================= */}
        <div className="mt-10 bg-white/94 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-[#102A43]/[0.08] shadow-sm text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#102A43]/[0.06]">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-[#E7F7F0] border border-[#159A68]/20 text-[#159A68] text-[10px] font-bold font-heading uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#159A68] animate-pulse" />
                LIVE INCIDENT PIPELINE
              </span>
              <span className="font-mono font-bold text-xs text-[#102A43]">
                {realIncident.id}
              </span>
              <span className="text-[#CBD5E1]">·</span>
              <span className="font-heading font-extrabold text-xs text-[#102A43] tracking-wide">
                {realIncident.category} · {realIncident.ward}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-[#526777] font-medium hidden md:inline">
                {realIncident.address}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-heading bg-[#FEF3F2] text-[#EF4444] border border-[#EF4444]/20">
                {realIncident.severity}
              </span>
            </div>
          </div>

          {/* Stepper Progress Trail: Reported ↓ Classified ↓ Prioritized ↓ Assigned ↓ Resolved ↓ Verified */}
          <div className="pt-5 pb-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {INCIDENT_LIFECYCLE_STEPS.map((step, idx) => {
                const isPassed = activeStep > step.stageIdx;
                const isCurrent = activeStep === step.stageIdx;

                return (
                  <div
                    key={step.key}
                    className={`relative p-3 rounded-xl border transition-all duration-300 ${
                      isCurrent
                        ? 'bg-[#E7F7F0] border-[#159A68]/40 shadow-xs'
                        : isPassed
                        ? 'bg-[#FAFBF9] border-[#102A43]/[0.08]'
                        : 'bg-[#F8FAFC] border-transparent opacity-55'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-mono font-bold text-[#829AB1]">
                        STEP 0{idx + 1}
                      </span>
                      {isPassed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#159A68]" />
                      ) : isCurrent ? (
                        <span className="w-2 h-2 rounded-full bg-[#159A68] animate-ping" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]" />
                      )}
                    </div>

                    <div className="font-heading font-bold text-xs text-[#102A43]">
                      {step.label}
                    </div>

                    <div className="text-[10px] text-[#526777] mt-0.5 font-medium truncate">
                      {idx === 0 && 'Citizen GPS logged'}
                      {idx === 1 && 'Vision neural tag'}
                      {idx === 2 && 'Urgency score 78'}
                      {idx === 3 && 'Team 04 dispatched'}
                      {idx === 4 && 'Pavement patched'}
                      {idx === 5 && 'Photometric closure'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Live Stage Footer Note */}
          <div className="mt-4 pt-3 border-t border-[#102A43]/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#526777]">
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-[#102A43]">Current Execution:</span>
              <span className="text-[#159A68] font-medium font-mono">
                Stage 0{activeStep + 1} · {currentStage.label} ({currentStage.phase})
              </span>
            </div>
            <div className="text-[11px] text-[#829AB1]">
              Zero manual triage bottlenecks · Autonomous end-to-end audit trail
            </div>
          </div>
        </div>

        {/* =========================================================================
            PART 7: DECISION TRANSPARENCY MODAL / POPOVER
            ========================================================================= */}
        {selectedAgent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#102A43]/30 backdrop-blur-xs animate-in fade-in duration-150">
            <div
              ref={popoverRef}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[#102A43]/12 text-left space-y-4 animate-in zoom-in-95 duration-150 relative"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#102A43]/[0.08]">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-heading uppercase tracking-wider mb-1 bg-[#EBF3FD] text-[#2878E5]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2878E5]" />
                    <span>DECISION TRANSPARENCY</span>
                  </div>
                  <h3 className="font-heading font-extrabold text-lg text-[#102A43]">
                    {selectedAgent.name}
                  </h3>
                  <p className="text-xs text-[#526777] font-medium">
                    {selectedAgent.role}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedAgent(null)}
                  className="p-1.5 rounded-xl hover:bg-[#EEF4F7] text-[#526777] transition-colors"
                  title="Close transparency view"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Structured Transparency Fields */}
              <div className="space-y-3 text-xs font-sans">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#829AB1] font-heading block mb-0.5">
                    Input:
                  </span>
                  <div className="p-2.5 rounded-xl bg-[#FAFBF9] border border-[#102A43]/[0.06] text-[#102A43] font-medium">
                    {selectedAgent.input}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#829AB1] font-heading block mb-0.5">
                    Decision:
                  </span>
                  <div className="p-2.5 rounded-xl bg-[#E7F7F0] border border-[#159A68]/20 text-[#159A68] font-bold">
                    {selectedAgent.decision}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#829AB1] font-heading block mb-0.5">
                    Evidence:
                  </span>
                  <div className="p-2.5 rounded-xl bg-[#FAFBF9] border border-[#102A43]/[0.06] text-[#526777]">
                    {selectedAgent.evidence}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#102A43]/[0.06] flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#829AB1] font-heading">
                    {selectedAgent.metricLabel}:
                  </span>
                  <span className="font-heading font-extrabold text-sm text-[#102A43] font-mono">
                    {selectedAgent.metricValue}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedAgent(null)}
                className="w-full py-2.5 rounded-xl bg-[#159A68] hover:bg-[#128358] text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Close Decision Inspector
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default CivicPulseIntroSection;
