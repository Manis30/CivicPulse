import React from 'react';
import { cn } from '@/lib/utils';

export type AdminBadgeVariant =
  | 'default'
  | 'primary'
  | 'ai'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'outline';

export interface AdminBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: AdminBadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export function AdminBadge({
  variant = 'default',
  size = 'md',
  dot = false,
  className,
  children,
  ...props
}: AdminBadgeProps) {
  const variantStyles: Record<AdminBadgeVariant, string> = {
    default: 'bg-[#13243A] text-[#94A3B8] border-[rgba(148,163,184,0.16)]',
    primary: 'bg-[#5B5BF7]/15 text-[#818CF8] border-[#5B5BF7]/35',
    ai: 'bg-[#6D5DFB]/15 text-[#A78BFA] border-[#6D5DFB]/40 shadow-2xs',
    success: 'bg-[#22C55E]/15 text-[#4ADE80] border-[#22C55E]/30',
    warning: 'bg-[#F59E0B]/15 text-[#FBBF24] border-[#F59E0B]/30',
    danger: 'bg-[#F0526B]/15 text-[#FB7185] border-[#F0526B]/35',
    info: 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/30',
    outline: 'bg-transparent text-[#94A3B8] border-[rgba(148,163,184,0.2)]',
  };

  const dotColors: Record<AdminBadgeVariant, string> = {
    default: 'bg-[#94A3B8]',
    primary: 'bg-[#5B5BF7]',
    ai: 'bg-[#6D5DFB]',
    success: 'bg-[#22C55E]',
    warning: 'bg-[#F59E0B]',
    danger: 'bg-[#F0526B]',
    info: 'bg-[#38BDF8]',
    outline: 'bg-[#94A3B8]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono font-semibold rounded-md border tracking-wide uppercase',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0 animate-pulse', dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
}
