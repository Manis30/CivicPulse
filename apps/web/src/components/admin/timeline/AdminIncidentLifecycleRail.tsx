import React from 'react';
import { motion } from 'framer-motion';
import {
  LuCheck,
  LuSparkles,
  LuShieldCheck,
  LuUserCheck,
  LuWrench,
  LuCircleCheck,
  LuEye,
  LuArchive,
  LuRotateCcw,
} from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { IncidentStatus } from '@civicpulse/shared';

interface AdminIncidentLifecycleRailProps {
  status: IncidentStatus | string;
  reopenCount?: number;
  className?: string;
  hasReopenedEvent?: boolean;
}

interface LifecycleStep {
  key: string;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STANDARD_STEPS: LifecycleStep[] = [
  { key: 'SUBMITTED', label: 'Submitted', shortLabel: 'Sub', icon: LuCircleCheck },
  { key: 'ANALYZING', label: 'Analyzing', shortLabel: 'Analyze', icon: LuSparkles },
  { key: 'VALIDATED', label: 'Validated', shortLabel: 'Valid', icon: LuShieldCheck },
  { key: 'ASSIGNED', label: 'Assigned', shortLabel: 'Assign', icon: LuUserCheck },
  { key: 'IN_PROGRESS', label: 'In Progress', shortLabel: 'Work', icon: LuWrench },
  { key: 'RESOLVED', label: 'Resolved', shortLabel: 'Done', icon: LuCheck },
  { key: 'VERIFYING', label: 'Verifying', shortLabel: 'Verify', icon: LuEye },
  { key: 'CLOSED', label: 'Closed', shortLabel: 'Close', icon: LuArchive },
];

export function AdminIncidentLifecycleRail({
  status,
  reopenCount = 0,
  className,
  hasReopenedEvent = false,
}: AdminIncidentLifecycleRailProps) {
  const normStatus = (status || 'SUBMITTED').toUpperCase();
  const isReopened = normStatus === 'REOPENED' || (reopenCount > 0 && hasReopenedEvent);

  // If incident was reopened, incorporate REOPENED into the lifecycle steps
  const steps: LifecycleStep[] = React.useMemo(() => {
    if (!isReopened) return STANDARD_STEPS;

    return [
      { key: 'SUBMITTED', label: 'Submitted', shortLabel: 'Sub', icon: LuCircleCheck },
      { key: 'ANALYZING', label: 'Analyzing', shortLabel: 'Analyze', icon: LuSparkles },
      { key: 'VALIDATED', label: 'Validated', shortLabel: 'Valid', icon: LuShieldCheck },
      { key: 'ASSIGNED', label: 'Assigned', shortLabel: 'Assign', icon: LuUserCheck },
      { key: 'IN_PROGRESS', label: 'In Progress', shortLabel: 'Work', icon: LuWrench },
      { key: 'RESOLVED', label: 'Resolved', shortLabel: 'Done', icon: LuCheck },
      { key: 'VERIFYING', label: 'Verifying', shortLabel: 'Verify', icon: LuEye },
      { key: 'REOPENED', label: 'Reopened', shortLabel: 'Reopen', icon: LuRotateCcw },
      { key: 'CLOSED', label: 'Closed', shortLabel: 'Close', icon: LuArchive },
    ];
  }, [isReopened]);

  // Determine active index based on current status
  const getStepIndex = (key: string) => {
    switch (key) {
      case 'SUBMITTED':
        return 0;
      case 'ANALYZING':
        return 1;
      case 'VALIDATED':
        return 2;
      case 'ASSIGNED':
      case 'DISPATCHED':
        return isReopened && normStatus === 'REOPENED' ? 7 : 3;
      case 'IN_PROGRESS':
      case 'INVESTIGATING':
        return 4;
      case 'RESOLVED':
        return 5;
      case 'VERIFYING':
        return 6;
      case 'REOPENED':
        return 7;
      case 'CLOSED':
        return isReopened ? 8 : 7;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(normStatus);

  return (
    <div
      className={cn(
        'p-4 rounded-xl bg-[#0D1A2B] border border-[rgba(148,163,184,0.12)] space-y-3',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] font-heading">
            Operational Lifecycle State
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#101F33] text-[#38BDF8] border border-[rgba(56,189,248,0.2)]">
            CURRENT: {normStatus}
          </span>
        </div>
        {reopenCount > 0 && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 flex items-center gap-1">
            <LuRotateCcw className="w-3 h-3" />
            REOPENED ({reopenCount}x)
          </span>
        )}
      </div>

      {/* Horizontal Lifecycle Stepper */}
      <div className="relative pt-1 pb-1 overflow-x-auto no-scrollbar">
        <div className="min-w-[620px] flex items-center justify-between relative px-2">
          {/* Background Connecting Rail */}
          <div className="absolute left-6 right-6 top-4 h-[2px] bg-[#16273F] z-0" />

          {/* Active Gradient Rail fill */}
          <div
            className="absolute left-6 top-4 h-[2px] bg-gradient-to-r from-[#22C55E] via-[#38BDF8] to-[#5B5BF7] z-0 transition-all duration-500"
            style={{
              width: `${(Math.min(currentIndex, steps.length - 1) / (steps.length - 1)) * 100 * 0.88}%`,
            }}
          />

          {steps.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const isFuture = idx > currentIndex;
            const StepIcon = step.icon;

            return (
              <div key={step.key} className="flex flex-col items-center relative z-10 group">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-300',
                    isCompleted &&
                      'bg-[#132A26] border border-[#22C55E]/40 text-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.2)]',
                    isCurrent &&
                      'bg-[#5B5BF7] text-white ring-4 ring-[#5B5BF7]/25 border border-white/20 shadow-[0_0_12px_rgba(91,91,247,0.5)] scale-110',
                    isFuture &&
                      'bg-[#0D1A2B] border border-[rgba(148,163,184,0.14)] text-[#64748B]'
                  )}
                >
                  {isCompleted ? (
                    <LuCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <StepIcon className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="mt-2 text-center">
                  <span
                    className={cn(
                      'text-[10.5px] font-mono tracking-tight block transition-colors',
                      isCurrent && 'text-[#F8FAFC] font-bold',
                      isCompleted && 'text-[#94A3B8] font-medium',
                      isFuture && 'text-[#64748B]'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
