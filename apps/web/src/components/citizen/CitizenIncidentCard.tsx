import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  LuMapPin,
  LuClock3,
  LuShieldAlert,
  LuArrowRight,
  LuCheck
} from 'react-icons/lu';
import { Incident, IncidentStatus, SeverityLevel } from '@civicpulse/shared';
import { getIncidentTitle, getCategoryDisplayLabel } from '@/services/incidentService';
import { cn } from '@/lib/utils';

interface CitizenIncidentCardProps {
  incident: Incident;
  onClick: () => void;
  index?: number;
}

const LIFECYCLE_STEPS = [
  { key: 'SUBMITTED', label: 'Submitted' },
  { key: 'ANALYZED', label: 'Analyzed' },
  { key: 'ASSIGNED', label: 'Assigned' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'VERIFIED', label: 'Verified' },
];

function getStageIndex(status: IncidentStatus | string): number {
  switch (status) {
    case 'SUBMITTED':
      return 0;
    case 'ANALYZING':
    case 'VALIDATED':
      return 1;
    case 'ASSIGNED':
    case 'DISPATCHED':
      return 2;
    case 'IN_PROGRESS':
    case 'INVESTIGATING':
    case 'VERIFYING':
      return 3;
    case 'RESOLVED':
    case 'CLOSED':
      return 4;
    default:
      return 0;
  }
}

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return '56 minutes ago';
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `Reported ${Math.floor(diffSec / 60)} minutes ago`;
  if (diffSec < 86400) return `Reported ${Math.floor(diffSec / 3600)} hours ago`;
  const days = Math.floor(diffSec / 86400);
  if (days === 1) return 'Reported yesterday';
  if (days < 7) return `Reported ${days} days ago`;
  return `Reported on ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

// Clean human-readable location representation without exposing raw coordinate brackets in primary text
function formatHumanLocation(address?: string, ward?: string): { label: string; coords?: string } {
  let coords: string | undefined;
  let cleanAddress = address || '';

  const coordMatch = cleanAddress.match(/\[(-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?)\]/);
  if (coordMatch) {
    coords = coordMatch[1];
    cleanAddress = cleanAddress.replace(/\s*at\s*\[-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?\]/gi, '').trim();
  }

  const cleanWard = (ward || '')
    .replace(/^Ward\s*/i, 'Ward ')
    .replace(/\s*-\s*/g, ' · ')
    .trim();

  let label = cleanAddress;
  if (cleanWard) {
    label = label ? `${label} · ${cleanWard}` : cleanWard;
  }
  if (!label) {
    label = 'Municipal Sector · Downtown Ward';
  }

  return { label, coords };
}

// Map severity to semantic colors
function getSeverityConfig(severity?: SeverityLevel | string) {
  const sev = (severity || 'MEDIUM').toUpperCase();
  if (sev === 'CRITICAL' || sev === 'HIGH') {
    return {
      label: sev === 'CRITICAL' ? 'Critical' : 'High',
      dotColor: '#EF6A63',
      textColor: '#DC2626',
      bgLight: '#FDEEED',
      borderColor: 'rgba(239, 106, 99, 0.25)',
    };
  }
  if (sev === 'MEDIUM') {
    return {
      label: 'Medium',
      dotColor: '#F2B84B',
      textColor: '#D97706',
      bgLight: '#FEF8EC',
      borderColor: 'rgba(242, 184, 75, 0.3)',
    };
  }
  return {
    label: 'Low',
    dotColor: '#159A68',
    textColor: '#159A68',
    bgLight: '#E7F7F0',
    borderColor: 'rgba(21, 154, 104, 0.25)',
  };
}

// Map status to semantic colors
function getStatusConfig(status: IncidentStatus | string) {
  switch (status) {
    case 'ASSIGNED':
    case 'DISPATCHED':
      return {
        label: 'Assigned',
        dotColor: '#2878E5',
        textColor: '#2563EB',
        bgLight: '#EBF3FD',
        borderColor: 'rgba(40, 120, 229, 0.25)',
        isActive: true,
      };
    case 'IN_PROGRESS':
    case 'INVESTIGATING':
    case 'VERIFYING':
      return {
        label: 'In Progress',
        dotColor: '#F2B84B',
        textColor: '#D97706',
        bgLight: '#FEF8EC',
        borderColor: 'rgba(242, 184, 75, 0.3)',
        isActive: true,
      };
    case 'RESOLVED':
    case 'CLOSED':
      return {
        label: 'Resolved',
        dotColor: '#159A68',
        textColor: '#159A68',
        bgLight: '#E7F7F0',
        borderColor: 'rgba(21, 154, 104, 0.25)',
        isActive: false,
      };
    case 'ANALYZING':
    case 'VALIDATED':
      return {
        label: 'Analyzed',
        dotColor: '#2878E5',
        textColor: '#2563EB',
        bgLight: '#EBF3FD',
        borderColor: 'rgba(40, 120, 229, 0.25)',
        isActive: true,
      };
    case 'SUBMITTED':
    default:
      return {
        label: 'Submitted',
        dotColor: '#627D98',
        textColor: '#486581',
        bgLight: '#FAF8F5',
        borderColor: '#E3EAE6',
        isActive: true,
      };
  }
}

// Lightweight smooth number count-up for AI Risk score
function AnimatedRiskNumber({ targetScore }: { targetScore: number }) {
  const shouldReduceMotion = useReducedMotion();
  const [displayScore, setDisplayScore] = useState(shouldReduceMotion ? targetScore : 0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayScore(targetScore);
      return;
    }
    let startTime: number | null = null;
    let frameId: number;

    const timeout = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / 700, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        setDisplayScore(Math.round(ease * targetScore));

        if (progress < 1) {
          frameId = requestAnimationFrame(step);
        } else {
          setDisplayScore(targetScore);
        }
      };
      frameId = requestAnimationFrame(step);
    }, 200);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(frameId);
    };
  }, [targetScore, shouldReduceMotion]);

  return <span>{displayScore}</span>;
}

export function CitizenIncidentCard({
  incident,
  onClick,
  index = 0,
}: CitizenIncidentCardProps) {
  const shouldReduceMotion = useReducedMotion();

  const currentStageIdx = getStageIndex(incident.status);
  const severityConfig = getSeverityConfig(incident.severity);
  const statusConfig = getStatusConfig(incident.status);
  const locationInfo = formatHumanLocation(incident.location?.address, incident.location?.ward);

  // Risk Score: extract real value or derive semantically
  const rawScore = incident.severityReasoning?.score;
  const riskScore = rawScore !== undefined
    ? rawScore
    : incident.severity === 'CRITICAL'
      ? 88
      : incident.severity === 'HIGH'
        ? 68
        : incident.severity === 'MEDIUM'
          ? 45
          : 24;

  const riskMeterColor =
    riskScore >= 70 ? '#EF6A63' : riskScore >= 40 ? '#F2B84B' : '#159A68';

  const categoryLabel = getCategoryDisplayLabel(incident.category);
  const incidentTitle = getIncidentTitle(incident);

  // Completed percentage along the 5 stages (0..4)
  const progressPercent = Math.min(100, Math.max(0, (currentStageIdx / (LIFECYCLE_STEPS.length - 1)) * 100));

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: 'easeOut' }}
      whileHover={shouldReduceMotion ? {} : { y: -2 }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="w-full min-h-[150px] max-h-[185px] bg-white border border-[#DCE6E1] rounded-2xl p-3.5 sm:p-4 shadow-xs hover:border-[#159A68]/45 hover:shadow-md transition-all duration-200 cursor-pointer group select-none flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-[#159A68]/30"
    >
      {/* =========================================================================
          LAYER 1: Identity + Badges (Top: ~24px)
          ========================================================================= */}
      <div className="flex items-center justify-between gap-2.5 pb-1.5 border-b border-[#102A43]/[0.05]">
        {/* Left: Incident ID + Clean Category Badge */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-heading font-bold text-xs sm:text-[13px] text-[#102A43] tracking-tight">
            {incident.id}
          </span>
          <span className="text-[#CBD5E1] text-xs">•</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#E7F7F0] border border-[#159A68]/15 text-[#159A68] text-[11px] font-semibold font-heading group-hover:bg-[#d8f3e5] transition-colors truncate max-w-[190px] sm:max-w-none">
            {categoryLabel}
          </span>
        </div>

        {/* Right: Severity Badge + Status Badge */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className="inline-flex items-center gap-1.5 h-5.5 px-2 rounded-full text-[11px] font-semibold font-heading border shadow-2xs"
            style={{
              backgroundColor: severityConfig.bgLight,
              color: severityConfig.textColor,
              borderColor: severityConfig.borderColor,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: severityConfig.dotColor }}
            />
            <span>{severityConfig.label}</span>
          </div>

          <div
            className="inline-flex items-center gap-1.5 h-5.5 px-2 rounded-full text-[11px] font-semibold font-heading border shadow-2xs"
            style={{
              backgroundColor: statusConfig.bgLight,
              color: statusConfig.textColor,
              borderColor: statusConfig.borderColor,
            }}
          >
            {statusConfig.isActive ? (
              <motion.span
                animate={shouldReduceMotion ? {} : { opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: statusConfig.dotColor }}
              />
            ) : (
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: statusConfig.dotColor }}
              />
            )}
            <span>{statusConfig.label}</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          LAYER 2: Middle Content (Title + Location + Time + AI Risk Meter: ~40px)
          ========================================================================= */}
      <div className="py-0.5 text-left space-y-1">
        {/* Title — Strict 15-16px Card Title Hierarchy */}
        <h3 className="font-heading font-bold text-[15px] sm:text-[16px] text-[#102A43] group-hover:text-[#159A68] transition-colors leading-snug tracking-tight truncate">
          {incidentTitle}
        </h3>

        {/* Context Row: Location + Time + AI Risk */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: index * 0.06 + 0.15 }}
          className="flex flex-wrap items-center justify-between gap-y-1 gap-x-3 text-xs font-sans text-[#627D98]"
        >
          {/* Location & Time */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="flex items-center gap-1.5 min-w-0"
              title={locationInfo.coords ? `GPS: ${locationInfo.coords}` : undefined}
            >
              <LuMapPin className="w-3.5 h-3.5 text-[#159A68] shrink-0" />
              <span className="truncate max-w-[220px] sm:max-w-xs font-medium text-[#102A43]/85 text-[12px]">
                {locationInfo.label}
              </span>
            </div>

            <span className="text-[#CBD5E1] text-[10px] hidden sm:inline">•</span>

            <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#829AB1]">
              <LuClock3 className="w-3 h-3 shrink-0" />
              <span>{formatRelativeTime(incident.createdAt)}</span>
            </div>
          </div>

          {/* AI Risk Index Meter */}
          <div className="flex items-center gap-2 bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#102A43]/[0.06] shrink-0">
            <div className="flex items-center gap-1 text-[10px] font-bold font-mono text-[#526777]">
              <LuShieldAlert className="w-3 h-3 text-[#F2B84B]" />
              <span>
                AI RISK <AnimatedRiskNumber targetScore={riskScore} />/100
              </span>
            </div>

            <div className="w-14 h-1.5 bg-slate-200/80 rounded-full overflow-hidden shrink-0">
              <motion.div
                initial={shouldReduceMotion ? { width: `${riskScore}%` } : { width: '0%' }}
                animate={{ width: `${riskScore}%` }}
                transition={{ duration: 0.7, delay: index * 0.06 + 0.25, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ backgroundColor: riskMeterColor }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* =========================================================================
          LAYER 3: Incident Lifecycle Stepper Rail + View Action (Bottom: ~38px)
          ========================================================================= */}
      <div className="pt-2 border-t border-[#102A43]/[0.05] flex items-center justify-between gap-3">
        {/* Horizontal Lifecycle Stepper Rail */}
        <div className="flex-1 max-w-md sm:max-w-lg relative py-1">
          <div className="relative flex items-center justify-between w-full select-none">
            {/* Background connecting track */}
            <div className="absolute top-2 left-2.5 right-2.5 h-[2px] bg-slate-200 z-0 group-hover:bg-slate-300 transition-colors" />

            {/* Filled green connecting track up to ACTUAL state */}
            <motion.div
              initial={shouldReduceMotion ? { width: `${progressPercent}%` } : { width: '0%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.75, delay: index * 0.06 + 0.35, ease: 'easeOut' }}
              className="absolute top-2 left-2.5 h-[2px] bg-[#159A68] z-0 rounded-full"
            />

            {/* 5 Milestone Nodes */}
            {LIFECYCLE_STEPS.map((step, idx) => {
              const isCompleted = idx < currentStageIdx || (idx === 4 && currentStageIdx >= 4);
              const isCurrent = idx === currentStageIdx && currentStageIdx < 4;

              return (
                <div
                  key={step.key}
                  className="relative z-10 flex flex-col items-center group/step"
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {/* Node icon / indicator */}
                  {isCurrent ? (
                    <motion.div
                      animate={
                        shouldReduceMotion
                          ? {}
                          : {
                              boxShadow: [
                                '0 0 0 0px rgba(40, 120, 229, 0.45)',
                                '0 0 0 4px rgba(40, 120, 229, 0)',
                                '0 0 0 0px rgba(40, 120, 229, 0.45)',
                              ],
                            }
                      }
                      transition={{
                        duration: 2.0,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="w-4 h-4 rounded-full flex items-center justify-center bg-[#2878E5] text-white ring-2 ring-white border border-[#2878E5] shadow-xs"
                      title={`Current Stage: ${step.label}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </motion.div>
                  ) : (
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xs',
                        isCompleted
                          ? 'bg-[#159A68] text-white ring-2 ring-white'
                          : 'bg-white border border-slate-300 text-slate-300'
                      )}
                      title={step.label}
                    >
                      {isCompleted ? (
                        <LuCheck className="w-2.5 h-2.5 stroke-[3]" />
                      ) : (
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                      )}
                    </div>
                  )}

                  {/* Step Label */}
                  <span
                    className={cn(
                      'text-[9.5px] mt-1 font-sans whitespace-nowrap transition-colors',
                      isCurrent
                        ? 'font-bold text-[#102A43]'
                        : isCompleted
                          ? 'font-semibold text-[#159A68]'
                          : 'font-medium text-[#829AB1]'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* View Incident Text Action */}
        <div className="shrink-0 flex items-center justify-end">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#159A68] group-hover:text-[#128358] transition-colors">
            <span>View Incident</span>
            <LuArrowRight className="w-3.5 h-3.5 group-hover:translate-x-[3px] transition-transform duration-200" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default CitizenIncidentCard;
