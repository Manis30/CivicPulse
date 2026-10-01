import React from 'react';
import { LuLoader } from 'react-icons/lu';
import { cn } from '@/lib/utils';

export interface AdminLoadingStateProps {
  message?: string;
  submessage?: string;
  className?: string;
}

export function AdminLoadingState({
  message = 'Loading operational telemetry...',
  submessage = 'Connecting to real-time cluster backend and database pools...',
  className,
}: AdminLoadingStateProps) {
  return (
    <div
      className={cn(
        'p-16 rounded-2xl bg-[#0E1B2D] border border-[rgba(148,163,184,0.16)] text-center flex flex-col items-center justify-center space-y-3.5',
        className
      )}
    >
      <div className="relative">
        <LuLoader className="w-8 h-8 text-[#5B5BF7] animate-spin" />
        <span className="absolute inset-0 rounded-full bg-indigo-500/20 blur-md -z-10" />
      </div>

      <div className="space-y-1 max-w-sm">
        <p className="text-sm font-semibold text-[#F8FAFC] font-heading">{message}</p>
        {submessage && <p className="text-xs text-[#94A3B8] font-sans">{submessage}</p>}
      </div>
    </div>
  );
}
