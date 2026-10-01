import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IncidentStatus } from '@civicpulse/shared';

interface IncidentProgressTimelineProps {
  status: IncidentStatus | string;
  className?: string;
  delay?: number;
}

const STAGES = [
  { key: 'SUBMITTED', label: 'Submitted' },
  { key: 'ANALYZED', label: 'Analyzed' },
  { key: 'ASSIGNED', label: 'Assigned' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'VERIFIED', label: 'Verified' },
];

export function IncidentProgressTimeline({
  status,
  className,
  delay = 0,
}: IncidentProgressTimelineProps) {
  const shouldReduceMotion = useReducedMotion();

  // Determine which step (0..4) is active
  const getActiveStepIndex = (st: string): number => {
    switch (st) {
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
        return 3;
      case 'PENDING_VERIFICATION':
      case 'AWAITING_VERIFICATION':
        return 3.5;
      case 'RESOLVED':
      case 'CLOSED':
        return 4;
      default:
        return 0;
    }
  };

  const activeIndex = getActiveStepIndex(status);
  // Calculate percentage of progress between the first and last stage
  const progressPercent = Math.min(100, Math.max(0, (activeIndex / (STAGES.length - 1)) * 100));

  return (
    <div className={cn('w-full select-none', className)}>
      <div className="relative flex items-center justify-between w-full">
        {/* Background Connecting Line */}
        <div className="absolute top-2.5 left-4 right-4 h-0.5 bg-slate-200 z-0" />

        {/* Dynamic Green Filled Progress Line: Animates left -> right up to ACTUAL stage */}
        <motion.div
          initial={shouldReduceMotion ? { width: `${progressPercent}%` } : { width: '0%' }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.7, delay: delay + 0.15, ease: 'easeOut' }}
          className="absolute top-2.5 left-4 h-0.5 bg-[#159A68] z-0 rounded-full"
        />

        {/* 5 Milestone Nodes */}
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < activeIndex || (idx === 4 && activeIndex >= 4);
          const isCurrent = idx === Math.floor(activeIndex) && activeIndex < 4;

          return (
            <div
              key={stage.key}
              className="relative z-10 flex flex-col items-center group cursor-default"
            >
              {/* Node Indicator */}
              {isCurrent ? (
                <motion.div
                  animate={
                    shouldReduceMotion
                      ? {}
                      : {
                          boxShadow: [
                            '0 0 0 0px rgba(21, 154, 104, 0.45)',
                            '0 0 0 5px rgba(21, 154, 104, 0)',
                            '0 0 0 0px rgba(21, 154, 104, 0.45)',
                          ],
                        }
                  }
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="w-5 h-5 rounded-full flex items-center justify-center bg-[#159A68] text-white ring-2 ring-white border-2 border-[#159A68] shadow-xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                </motion.div>
              ) : (
                <div
                  className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 text-[9px] font-bold shadow-xs',
                    isCompleted
                      ? 'bg-[#159A68] text-white ring-2 ring-white'
                      : 'bg-white border-2 border-slate-300 text-slate-300'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-3 h-3 stroke-[3]" />
                  ) : (
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                  )}
                </div>
              )}

              {/* Step Label */}
              <span
                className={cn(
                  'text-[10px] mt-1.5 font-sans whitespace-nowrap transition-colors',
                  isCurrent
                    ? 'font-bold text-[#102A43]'
                    : isCompleted
                      ? 'font-semibold text-[#159A68]'
                      : 'font-medium text-[#829AB1]'
                )}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default IncidentProgressTimeline;
