import React from 'react';
import { cn } from '@/lib/utils';

export interface CitizenPageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  eyebrow?: React.ReactNode;
  action?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Standard Global Citizen Page Header
 * Mandated Typography System:
 * - Title: 24px, weight 700, line-height 1.2
 * - Subtitle: 14px, weight 400, line-height 1.45
 * - Header Bottom Margin: 20px
 */
export function CitizenPageHeader({
  title,
  description,
  badge,
  eyebrow,
  action,
  actions,
  className,
}: CitizenPageHeaderProps) {
  const finalAction = action || actions;
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E3EAE6]/80 mb-5 select-none',
        className
      )}
    >
      <div className="space-y-1 min-w-0">
        {eyebrow && (
          <div>
            {typeof eyebrow === 'string' ? (
              <span className="text-[11px] font-bold text-[#159A68] tracking-wider uppercase font-heading bg-[#E7F7F0] px-2.5 py-0.5 rounded-full inline-block mb-1">
                {eyebrow}
              </span>
            ) : (
              eyebrow
            )}
          </div>
        )}
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-[24px] font-bold font-heading text-[#102A43] tracking-tight leading-[1.2]">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="text-[14px] text-[#526777] font-normal leading-[1.45]">
            {description}
          </p>
        )}
      </div>

      {finalAction && <div className="flex items-center gap-2 shrink-0">{finalAction}</div>}
    </div>
  );
}

export default CitizenPageHeader;
