import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LuArrowUpRight } from 'react-icons/lu';

export interface AdminStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  accentColor?: string; // e.g. text-indigo-400, text-emerald-400, etc.
  href?: string;
  badge?: string;
  statusDot?: 'healthy' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function AdminStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = 'text-[#5B5BF7]',
  href,
  badge,
  statusDot,
  className,
}: AdminStatCardProps) {
  const content = (
    <div
      className={cn(
        'group p-5 rounded-2xl bg-[#0E1B2D] border border-[rgba(148,163,184,0.16)] flex flex-col justify-between transition-all duration-200 h-full select-none',
        href && 'hover:bg-[#101F33] hover:border-[#5B5BF7]/50 hover:shadow-lg hover:shadow-indigo-500/10 cursor-pointer',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-xs font-medium text-[#94A3B8] tracking-wide uppercase font-sans truncate">
          {title}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {statusDot && (
            <span
              className={cn(
                'w-2 h-2 rounded-full animate-pulse',
                statusDot === 'healthy' && 'bg-[#22C55E]',
                statusDot === 'warning' && 'bg-[#F59E0B]',
                statusDot === 'danger' && 'bg-[#F0526B]',
                statusDot === 'info' && 'bg-[#38BDF8]'
              )}
            />
          )}
          {badge && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#13243A] text-[#94A3B8] border border-[rgba(148,163,184,0.16)]">
              {badge}
            </span>
          )}
          {Icon && (
            <div className={cn('p-1.5 rounded-lg bg-[#13243A] border border-[rgba(148,163,184,0.12)]', accentColor)}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      <div className="my-1 flex items-baseline justify-between gap-2">
        <span className={cn('text-2xl sm:text-3xl font-bold font-heading tracking-tight text-[#F8FAFC]', accentColor)}>
          {value}
        </span>
        {href && (
          <LuArrowUpRight className="w-4 h-4 text-[#64748B] group-hover:text-[#5B5BF7] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] text-[#64748B] font-sans truncate mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );

  if (href) {
    return (
      <Link to={href} className="block focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
