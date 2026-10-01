import React from 'react';
import { motion } from 'framer-motion';
import { LuCheck } from 'react-icons/lu';
import { cn } from '@/lib/utils';

export interface StepItem {
  num: number;
  label: string;
}

interface ReportProcessRailProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

const STEPS: StepItem[] = [
  { num: 1, label: 'Category' },
  { num: 2, label: 'Evidence' },
  { num: 3, label: 'Location' },
  { num: 4, label: 'Details' },
  { num: 5, label: 'Review' },
];

export function ReportProcessRail({ currentStep, onStepClick }: ReportProcessRailProps) {
  return (
    <div className="w-full bg-white/80 backdrop-blur-xs px-4 py-2 rounded-xl border border-[#E3EAE6] shadow-2xs select-none">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {STEPS.map((s, idx) => {
          const isCompleted = currentStep > s.num;
          const isCurrent = currentStep === s.num;
          const isClickable = s.num < currentStep && onStepClick;

          return (
            <React.Fragment key={s.num}>
              <div
                onClick={() => {
                  if (isClickable) onStepClick(s.num);
                }}
                className={cn(
                  'flex items-center gap-2 transition-all',
                  isClickable ? 'cursor-pointer hover:opacity-85' : 'cursor-default'
                )}
              >
                {/* Numbered Pill / Circle */}
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.05 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-[10.5px] font-heading transition-colors',
                    isCurrent
                      ? 'bg-[#159A68] text-white font-extrabold ring-4 ring-[#E7F7F0] shadow-xs'
                      : isCompleted
                      ? 'bg-[#E7F7F0] text-[#159A68] border border-[#159A68]/30 font-bold'
                      : 'bg-slate-100 text-[#829AB1] font-medium'
                  )}
                >
                  {isCompleted ? (
                    <LuCheck className="w-3.5 h-3.5 stroke-[3] text-[#159A68]" />
                  ) : (
                    `0${s.num}`
                  )}
                </motion.div>

                {/* Step Name */}
                <span
                  className={cn(
                    'text-[11px] font-heading hidden sm:inline tracking-tight',
                    isCurrent
                      ? 'text-[#102A43] font-extrabold'
                      : isCompleted
                      ? 'text-[#159A68] font-bold'
                      : 'text-[#829AB1] font-medium'
                  )}
                >
                  {s.label}
                </span>
              </div>

              {/* Connecting rail line */}
              {idx < STEPS.length - 1 && (
                <div className="h-0.5 flex-1 mx-2 sm:mx-3 bg-[#E3EAE6] relative overflow-hidden rounded-full">
                  <motion.div
                    initial={false}
                    animate={{
                      width: currentStep > idx + 1 ? '100%' : '0%',
                    }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    className="h-full bg-[#159A68]"
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default ReportProcessRail;
