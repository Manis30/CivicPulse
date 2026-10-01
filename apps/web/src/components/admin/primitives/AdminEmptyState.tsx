import React from 'react';
import { LuFolderOpen } from 'react-icons/lu';
import { cn } from '@/lib/utils';

export interface AdminEmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  className?: string;
}

export function AdminEmptyState({
  title = 'No records found',
  description = 'There are no active entries or telemetry records matching this query.',
  icon: Icon = LuFolderOpen,
  action,
  className,
}: AdminEmptyStateProps) {
  return (
    <div
      className={cn(
        'p-10 rounded-2xl bg-[#0E1B2D] border border-[rgba(148,163,184,0.16)] text-center flex flex-col items-center justify-center space-y-3.5',
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-[#13243A] border border-[rgba(148,163,184,0.16)] text-[#94A3B8] flex items-center justify-center shadow-inner">
        <Icon className="w-6 h-6 stroke-[1.5]" />
      </div>

      <div className="space-y-1 max-w-md">
        <h4 className="text-sm font-bold font-heading text-[#F8FAFC]">{title}</h4>
        <p className="text-xs text-[#94A3B8] font-sans leading-relaxed">{description}</p>
      </div>

      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
