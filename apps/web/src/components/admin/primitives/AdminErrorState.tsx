import React from 'react';
import { LuTriangleAlert, LuRotateCcw } from 'react-icons/lu';
import { cn } from '@/lib/utils';

export interface AdminErrorStateProps {
  title?: string;
  reason?: string;
  onRetry?: () => void;
  className?: string;
}

export function AdminErrorState({
  title = 'Unable to Load Telemetry',
  reason,
  onRetry,
  className,
}: AdminErrorStateProps) {
  return (
    <div
      className={cn(
        'p-8 rounded-2xl bg-[#0E1B2D] border border-[#F0526B]/30 text-center flex flex-col items-center justify-center space-y-4 shadow-lg shadow-rose-950/20',
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-[#F0526B]/15 border border-[#F0526B]/35 text-[#F0526B] flex items-center justify-center">
        <LuTriangleAlert className="w-6 h-6 stroke-[2]" />
      </div>

      <div className="space-y-1.5 max-w-md">
        <h4 className="text-sm font-bold font-heading text-[#F8FAFC]">{title}</h4>
        {reason && (
          <p className="text-xs text-[#FB7185] font-sans font-medium bg-[#13243A] px-3 py-1.5 rounded-lg border border-[rgba(148,163,184,0.14)] inline-block">
            Reason: {reason}
          </p>
        )}
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#13243A] hover:bg-[#1a2d48] border border-[rgba(148,163,184,0.2)] text-[#F8FAFC] text-xs font-semibold font-sans hover:border-[#5B5BF7]/50 transition-colors cursor-pointer"
        >
          <LuRotateCcw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
}
