import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'muted' | 'glass';
  glow?: 'none' | 'cyan' | 'purple' | 'danger';
}

export function Card({
  className,
  variant = 'default',
  glow = 'none',
  children,
  ...props
}: CardProps) {
  const variants = {
    default: 'bg-white border border-slate-200 rounded-2xl shadow-civic-card',
    elevated: 'bg-white border border-slate-200 rounded-2xl shadow-civic-hover',
    muted: 'bg-slate-50 border border-slate-200 rounded-2xl',
    glass: 'bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl shadow-civic-card',
  };

  const glows = {
    none: '',
    cyan: 'border-blue-500 ring-1 ring-blue-500/20',
    purple: 'border-indigo-500 ring-1 ring-indigo-500/20',
    danger: 'border-rose-500 ring-1 ring-rose-500/20',
  };

  return (
    <div className={cn(variants[variant], glows[glow], className)} {...props}>
      {children}
    </div>
  );
}

export interface PanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
}

export function Panel({
  className,
  title,
  subtitle,
  headerAction,
  children,
  ...props
}: PanelProps) {
  return (
    <div className={cn('bg-white border border-slate-200 rounded-2xl shadow-civic-card overflow-hidden', className)} {...props}>
      {(title || headerAction) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-sm font-bold font-heading text-slate-900 tracking-tight">{title}</h3>
            ) : (
              title
            )}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5 font-sans">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

export function GlassPanel({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-6 shadow-civic-card', className)} {...props}>
      {children}
    </div>
  );
}

export interface MetricCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: string;
  isPositiveTrend?: boolean;
  icon?: React.ReactNode;
  sublabel?: string;
  accent?: 'cyan' | 'purple' | 'success' | 'warning' | 'danger' | 'blue' | 'indigo';
  className?: string;
}

export function MetricCard({
  label,
  value,
  change,
  trend,
  isPositiveTrend,
  icon,
  sublabel,
  accent = 'blue',
  className,
}: MetricCardProps) {
  // Soft pastel badge backgrounds with clean modern strokes
  const accentIcons = {
    cyan: 'text-blue-600 bg-blue-50 border border-blue-100',
    blue: 'text-blue-600 bg-blue-50 border border-blue-100',
    purple: 'text-indigo-600 bg-indigo-50 border border-indigo-100',
    indigo: 'text-indigo-600 bg-indigo-50 border border-indigo-100',
    success: 'text-emerald-600 bg-emerald-50 border border-emerald-100',
    warning: 'text-amber-600 bg-amber-50 border border-amber-100',
    danger: 'text-rose-600 bg-rose-50 border border-rose-100',
  };

  const trendText = trend || change;

  return (
    <div
      className={cn(
        'bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-civic-card hover:shadow-civic-hover transition-all duration-200 group relative',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-slate-500 tracking-wider font-sans uppercase">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-heading text-slate-900 tracking-tight">
              {value}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {trendText && (
              <span
                className={cn(
                  'inline-flex items-center text-xs font-semibold font-sans text-emerald-600',
                  isPositiveTrend === false ? 'text-rose-600' : 'text-emerald-600'
                )}
              >
                <TrendingUp className="w-3.5 h-3.5 mr-0.5 text-emerald-600" />
                {trendText}
              </span>
            )}
            {sublabel && (
              <span className="text-xs text-slate-400">
                {change && '•'} {sublabel}
              </span>
            )}
          </div>
        </div>

        {icon && (
          <div className={cn('p-3 rounded-xl shrink-0 transition-transform group-hover:scale-105', accentIcons[accent])}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
