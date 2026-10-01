import React from 'react';
import { cn } from '@/lib/utils';

export interface AdminPageHeaderProps {
  title: string;
  description?: string;
  tag?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function AdminPageHeader({
  title,
  description,
  tag,
  actions,
  children,
  className,
}: AdminPageHeaderProps) {
  return (
    <div className={cn('space-y-4 pb-2 border-b border-[rgba(148,163,184,0.12)]', className)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#F8FAFC] tracking-tight">
              {title}
            </h1>
            {tag && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#13243A] text-[#6D5DFB] border border-[#5B5BF7]/30 shadow-2xs">
                {tag}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs sm:text-sm text-[#94A3B8] font-sans leading-relaxed max-w-4xl">
              {description}
            </p>
          )}
        </div>

        {actions && <div className="flex items-center gap-2.5 shrink-0 flex-wrap">{actions}</div>}
      </div>

      {children && <div className="pt-2">{children}</div>}
    </div>
  );
}
