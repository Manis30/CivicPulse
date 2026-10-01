import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  LuCheck,
  LuClock,
  LuUser,
  LuRotateCcw
} from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { IncidentStatus } from '@civicpulse/shared';

export interface IncidentLifecycleRailProps {
  status: IncidentStatus | string;
  reopenCount?: number;
  className?: string;
  incident?: any;
  timeline?: any[];
  agentExecutions?: any[];
}

interface JourneyMilestone {
  key: string;
  label: string;
  statusMatch: string[];
  x: number;
  y: number;
  defaultWhat: string;
  defaultWhy: string;
  defaultActor: string;
  defaultResult: string;
}

const MILESTONES: JourneyMilestone[] = [
  {
    key: 'SUBMITTED',
    label: 'Submitted',
    statusMatch: ['SUBMITTED'],
    x: 55,
    y: 110,
    defaultWhat: 'Citizen incident report received and ingested into municipal repository.',
    defaultWhy: 'Photographic evidence and geolocation submitted via citizen mobile interface.',
    defaultActor: 'Citizen Reporter',
    defaultResult: 'Canonical record created with real-time tracking token.',
  },
  {
    key: 'ANALYZING',
    label: 'Analyzed',
    statusMatch: ['ANALYZING', 'VALIDATED'],
    x: 175,
    y: 65,
    defaultWhat: 'Autonomous multimodal AI vision inspection and hazard severity scoring.',
    defaultWhy: 'Automated triage trigger executed within milliseconds of image upload.',
    defaultActor: 'Vision & Triage Agent (Gemini AI)',
    defaultResult: 'Defect classified with confidence rating and automated AI risk score.',
  },
  {
    key: 'VERIFIED',
    label: 'Verified',
    statusMatch: ['VALIDATED'],
    x: 300,
    y: 42,
    defaultWhat: 'Geospatial proximity validation and duplicate cluster evaluation.',
    defaultWhy: 'Confirmed incident is an isolated occurrence within municipal ward boundary.',
    defaultActor: 'GIS & Spatial Agent',
    defaultResult: 'Verified location coordinates and assigned priority matrix.',
  },
  {
    key: 'ASSIGNED',
    label: 'Assigned',
    statusMatch: ['ASSIGNED', 'DISPATCHED'],
    x: 435,
    y: 85,
    defaultWhat: 'Certified municipal work order generated and field crew dispatched.',
    defaultWhy: 'Response team allocated based on ward jurisdiction and crew capacity.',
    defaultActor: 'Operations Dispatch Engine',
    defaultResult: 'Assigned to active maintenance division with countdown SLA.',
  },
  {
    key: 'IN_PROGRESS',
    label: 'In Progress',
    statusMatch: ['IN_PROGRESS', 'INVESTIGATING'],
    x: 570,
    y: 125,
    defaultWhat: 'Municipal maintenance crew on-site executing corrective repair.',
    defaultWhy: 'Field unit deployed according to authorized department work checklist.',
    defaultActor: 'Field Operations Crew',
    defaultResult: 'Physical works underway; real-time telemetry streaming to dashboard.',
  },
  {
    key: 'RESOLVED',
    label: 'Resolved',
    statusMatch: ['RESOLVED'],
    x: 700,
    y: 75,
    defaultWhat: 'Remediation completed; after-repair photographic evidence captured.',
    defaultWhy: 'Field crew completed all scheduled checklist items and safety clearances.',
    defaultActor: 'Field Crew Supervisor',
    defaultResult: 'Remediation validated and prepared for citizen verification.',
  },
  {
    key: 'VERIFYING',
    label: 'Verifying',
    statusMatch: ['VERIFYING'],
    x: 815,
    y: 45,
    defaultWhat: 'Dual-confirmation audit between reporting citizen and municipal supervisor.',
    defaultWhy: 'CivicPulse verification gate ensures physical repair meets quality bar.',
    defaultActor: 'Citizen & Verification Agent',
    defaultResult: 'Quality inspection confirmed prior to permanent record archiving.',
  },
  {
    key: 'CLOSED',
    label: 'Closed',
    statusMatch: ['CLOSED'],
    x: 900,
    y: 85,
    defaultWhat: 'Incident lifecycle concluded and immutable audit trail sealed.',
    defaultWhy: 'All SLA parameters and stakeholder verifications successfully fulfilled.',
    defaultActor: 'Municipal Central Registry',
    defaultResult: 'Incident record archived in civic operations repository.',
  },
];

// Beautiful organic cubic bezier route passing through all 8 milestones
const ROUTE_PATH_D =
  'M 55,110 C 110,88 135,65 175,65 C 225,65 255,42 300,42 C 355,42 385,85 435,85 C 490,85 520,125 570,125 C 625,125 655,75 700,75 C 745,75 775,45 815,45 C 850,45 875,85 900,85';

export function IncidentLifecycleRail({
  status,
  reopenCount = 0,
  className,
  incident,
  timeline = [],
}: IncidentLifecycleRailProps) {
  const shouldReduceMotion = useReducedMotion();

  // Normalized status
  const normalizedStatus = (status || 'SUBMITTED').toUpperCase();
  const isReopened = normalizedStatus === 'REOPENED' || reopenCount > 0;

  // Determine active milestone index
  let activeIndex = MILESTONES.findIndex((m) => m.statusMatch.includes(normalizedStatus));
  if (activeIndex === -1) {
    if (normalizedStatus === 'CLOSED') activeIndex = 7;
    else if (normalizedStatus === 'RESOLVED') activeIndex = 5;
    else if (normalizedStatus === 'ASSIGNED') activeIndex = 3;
    else if (normalizedStatus === 'IN_PROGRESS') activeIndex = 4;
    else activeIndex = 0;
  }

  // Selected milestone for camera/focus detail (defaults to active index)
  const [selectedMilestoneIdx, setSelectedMilestoneIdx] = useState<number>(activeIndex);

  useEffect(() => {
    setSelectedMilestoneIdx(activeIndex);
  }, [activeIndex]);

  const selectedMilestone = MILESTONES[selectedMilestoneIdx] || MILESTONES[0];
  const isSelectedCurrent = selectedMilestoneIdx === activeIndex;
  const isSelectedCompleted = selectedMilestoneIdx < activeIndex;
  const isSelectedFuture = selectedMilestoneIdx > activeIndex;

  // Calculate completed progress ratio (0 to 1) along the 7 path intervals
  const completedRatio = Math.min(1, Math.max(0, activeIndex / (MILESTONES.length - 1)));

  // Extract real timeline context matching the selected milestone
  const matchingEvent = useMemo(() => {
    if (!timeline || timeline.length === 0) return null;
    return timeline.find((evt: any) => {
      const type = (evt.type || '').toUpperCase();
      const desc = (evt.description || '').toUpperCase();
      const key = selectedMilestone.key;
      if (key === 'SUBMITTED' && (type.includes('CREATED') || type.includes('SUBMITTED') || desc.includes('CREATED'))) {
        return true;
      }
      if (key === 'ANALYZING' && (type.includes('VISION') || type.includes('ANALYZ') || desc.includes('ANALYSIS'))) {
        return true;
      }
      if (key === 'VERIFIED' && (type.includes('VALIDAT') || type.includes('VERIF') || desc.includes('WARD'))) {
        return true;
      }
      if (key === 'ASSIGNED' && (type.includes('ASSIGN') || type.includes('DISPATCH') || desc.includes('ASSIGNED'))) {
        return true;
      }
      if (key === 'IN_PROGRESS' && (type.includes('PROGRESS') || type.includes('CREW'))) {
        return true;
      }
      if (key === 'RESOLVED' && (type.includes('RESOLV') || desc.includes('RESOLVED'))) {
        return true;
      }
      return false;
    });
  }, [timeline, selectedMilestone.key]);

  // Derived real data fields
  const teamName = incident?.assignedTeamId?.name || incident?.teamId?.name || 'Road Maintenance Team';
  const departmentName = incident?.departmentId?.name || incident?.assignedDepartment || 'Transport & Public Works';

  const actorText = useMemo(() => {
    if (matchingEvent?.actorId) return matchingEvent.actorId;
    if (matchingEvent?.actorType === 'CITIZEN') return 'Citizen Reporter';
    if (matchingEvent?.actorType === 'AI') return 'Autonomous AI Agent';
    if (matchingEvent?.actorType === 'FIELD') return teamName;
    if (selectedMilestone.key === 'ASSIGNED') return `${teamName} (${departmentName})`;
    return selectedMilestone.defaultActor;
  }, [matchingEvent, selectedMilestone, teamName, departmentName]);

  const timestampText = useMemo(() => {
    if (matchingEvent?.timestamp || matchingEvent?.createdAt) {
      const d = new Date(matchingEvent.timestamp || matchingEvent.createdAt);
      return `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · ${d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
    }
    if (selectedMilestoneIdx <= activeIndex && incident?.createdAt) {
      const d = new Date(incident.createdAt);
      return `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · ${d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
    }
    return isSelectedFuture ? 'Pending stage' : 'Recorded in incident history';
  }, [matchingEvent, selectedMilestoneIdx, activeIndex, incident, isSelectedFuture]);

  const whatText = useMemo(() => {
    if (matchingEvent?.description) return matchingEvent.description;
    if (isSelectedFuture) {
      return `Scheduled operational phase. This stage will initiate automatically once preceding requirements are fulfilled.`;
    }
    return selectedMilestone.defaultWhat;
  }, [matchingEvent, isSelectedFuture, selectedMilestone]);

  const whyText = useMemo(() => {
    if (matchingEvent?.notes) return matchingEvent.notes;
    if (selectedMilestone.key === 'ASSIGNED') {
      return `Response team assigned based on incident location, department workload, and severity rating.`;
    }
    if (isSelectedFuture) {
      return `Requires completion of previous lifecycle milestones and field verification.`;
    }
    return selectedMilestone.defaultWhy;
  }, [matchingEvent, selectedMilestone, isSelectedFuture]);

  const resultText = useMemo(() => {
    if (matchingEvent?.metadata?.result) return matchingEvent.metadata.result;
    if (isSelectedFuture) {
      return `Pending progression to this phase.`;
    }
    if (selectedMilestone.key === 'ASSIGNED') {
      return `Active work order dispatched to ${teamName}.`;
    }
    return selectedMilestone.defaultResult;
  }, [matchingEvent, selectedMilestone, isSelectedFuture, teamName]);

  return (
    <div
      className={cn(
        'w-full bg-white rounded-2xl border border-[#E3EAE6] p-4 sm:p-6 shadow-xs space-y-4 select-none',
        className
      )}
    >
      {/* =========================================================================
          TOP HEADER: Title + Active Phase Badge
          ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E3EAE6]/70">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#159A68] animate-pulse" />
          <h2 className="text-xs sm:text-[13px] font-bold uppercase tracking-wider text-[#102A43] font-heading">
            CivicPulse Incident Journey
          </h2>
          {isReopened && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FDF2F2] text-[#EF6A63] border border-[#EF6A63]/30">
              <LuRotateCcw className="w-3 h-3" />
              <span>Reopened ({reopenCount})</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#829AB1] font-sans">Current Phase:</span>
          <span className="inline-flex items-center gap-1.5 font-bold text-[#102A43] font-heading bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#E3EAE6]">
            <span className="w-2 h-2 rounded-full bg-[#2878E5] animate-ping" />
            <span>{MILESTONES[activeIndex]?.label || normalizedStatus}</span>
          </span>
        </div>
      </div>

      {/* =========================================================================
          CURVED SVG JOURNEY PATH: City Route Metaphor
          ========================================================================= */}
      <div className="relative pt-2 pb-2 overflow-x-auto no-scrollbar">
        <div className="min-w-[780px] sm:min-w-0 relative h-[155px] flex items-center justify-center">
          <svg
            viewBox="0 0 950 155"
            className="w-full h-full overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Defs for gradients & filters */}
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#159A68" />
                <stop offset="50%" stopColor="#36B37E" />
                <stop offset="100%" stopColor="#2878E5" />
              </linearGradient>
              <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* 1. Underlying Abstract City Road (Muted dashed line) */}
            <path
              d={ROUTE_PATH_D}
              stroke="#E3EAE6"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={ROUTE_PATH_D}
              stroke="#CBD5E1"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="4 6"
            />

            {/* 2. Completed Route: Draws pathLength 0 -> completedRatio on first load */}
            <motion.path
              d={ROUTE_PATH_D}
              stroke="url(#routeGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={shouldReduceMotion ? { pathLength: completedRatio } : { pathLength: 0 }}
              animate={{ pathLength: completedRatio }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
            />

            {/* 3. Innovative Detail: Traveling Incident Pulse along completed route (one-shot on load) */}
            {!shouldReduceMotion && activeIndex > 0 && (
              <motion.circle
                r="4.5"
                fill="#36B37E"
                filter="url(#nodeGlow)"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  cx: [
                    MILESTONES[0].x,
                    ...MILESTONES.slice(1, activeIndex + 1).map((m) => m.x),
                  ],
                  cy: [
                    MILESTONES[0].y,
                    ...MILESTONES.slice(1, activeIndex + 1).map((m) => m.y),
                  ],
                }}
                transition={{
                  duration: 1.4,
                  times: [0, 0.1, 0.9, 1],
                  ease: 'easeInOut',
                  delay: 0.1,
                }}
              />
            )}

            {/* 4. Interactive Milestones Nodes along the Curve */}
            {MILESTONES.map((m, idx) => {
              const isCompleted = idx < activeIndex;
              const isCurrent = idx === activeIndex;
              const isSelected = idx === selectedMilestoneIdx;

              return (
                <g
                  key={m.key}
                  transform={`translate(${m.x}, ${m.y})`}
                  className="cursor-pointer group"
                  onClick={() => setSelectedMilestoneIdx(idx)}
                >
                  {/* Outer selection ring if selected */}
                  {isSelected && (
                    <circle
                      r="19"
                      fill="none"
                      stroke="#2878E5"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                      className="animate-spin"
                      style={{ animationDuration: '8s' }}
                    />
                  )}

                  {/* Pulsing halo around current live phase */}
                  {isCurrent && !shouldReduceMotion && (
                    <circle r="16" fill="rgba(40, 120, 229, 0.18)" className="animate-ping" />
                  )}

                  {/* Node Circle */}
                  <circle
                    r={isCurrent ? '13' : '10'}
                    fill={isCurrent ? '#2878E5' : isCompleted ? '#159A68' : '#FAF8F5'}
                    stroke={isCurrent ? '#FFFFFF' : isCompleted ? '#FFFFFF' : '#CBD5E1'}
                    strokeWidth="2.5"
                    className="transition-all duration-200 group-hover:scale-110 drop-shadow-sm"
                  />

                  {/* Inner Node Icon or Center Dot */}
                  {isCompleted ? (
                    <path
                      d="M -3.5,0 L -1,2.5 L 4,-2.5"
                      stroke="#FFFFFF"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : isCurrent ? (
                    <circle r="3.5" fill="#FFFFFF" />
                  ) : (
                    <circle r="2" fill="#829AB1" />
                  )}

                  {/* Milestone Label */}
                  <text
                    x="0"
                    y={m.y > 80 ? '24' : '-16'}
                    textAnchor="middle"
                    className={cn(
                      'text-[11px] font-heading tracking-tight select-none transition-all duration-200 pointer-events-none',
                      isSelected
                        ? 'font-extrabold fill-[#102A43] underline decoration-[#159A68] decoration-2'
                        : isCurrent
                          ? 'font-bold fill-[#2878E5]'
                          : isCompleted
                            ? 'font-semibold fill-[#159A68]'
                            : 'font-medium fill-[#829AB1]'
                    )}
                  >
                    {m.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* =========================================================================
          JOURNEY CAMERA / FOCUS DETAIL CARD: What Happened, Why, Who, When, Result
          ========================================================================= */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedMilestone.key}
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.24, ease: 'easeOut' }}
          className="rounded-xl bg-[#FAF8F5] border border-[#E3EAE6] p-4 text-xs space-y-3"
        >
          {/* Milestone Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E3EAE6]">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'px-2.5 py-0.5 rounded-full text-[11px] font-bold font-heading uppercase tracking-wide',
                  isSelectedCurrent
                    ? 'bg-[#EBF3FD] text-[#2878E5] border border-[#2878E5]/25'
                    : isSelectedCompleted
                      ? 'bg-[#E7F7F0] text-[#159A68] border border-[#159A68]/25'
                      : 'bg-slate-100 text-[#829AB1] border border-slate-200'
                )}
              >
                {isSelectedCurrent
                  ? 'Active Milestone'
                  : isSelectedCompleted
                    ? 'Completed Milestone'
                    : 'Scheduled Milestone'}
              </span>
              <span className="font-heading font-extrabold text-sm text-[#102A43]">
                {selectedMilestone.label}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-[#829AB1]">
              <LuClock className="w-3.5 h-3.5 text-[#159A68]" />
              <span>{timestampText}</span>
            </div>
          </div>

          {/* 5-Attribute Narrative Grid: What, Why, Who/What Acted, Result */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left font-sans">
            {/* 1. What Happened */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#829AB1] font-heading block">
                What Happened
              </span>
              <p className="text-[#102A43] font-medium leading-relaxed">{whatText}</p>
            </div>

            {/* 2. Why It Happened */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#829AB1] font-heading block">
                Why It Happened
              </span>
              <p className="text-[#526777] leading-relaxed">{whyText}</p>
            </div>

            {/* 3. Who / What Acted */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#829AB1] font-heading block">
                Who / What Acted
              </span>
              <div className="flex items-center gap-1.5 text-[#102A43] font-semibold">
                <LuUser className="w-3.5 h-3.5 text-[#2878E5] shrink-0" />
                <span className="truncate">{actorText}</span>
              </div>
            </div>

            {/* 4. Result */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#829AB1] font-heading block">
                Result
              </span>
              <p className="text-[#159A68] font-semibold leading-relaxed">{resultText}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default IncidentLifecycleRail;
