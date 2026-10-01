import React from 'react';
import { cn } from '@/lib/utils';
import { IncidentStatus, SeverityLevel, AgentId } from '@civicpulse/shared';
import { AlertTriangle, CheckCircle2, Clock, RefreshCw, ShieldAlert, Cpu } from 'lucide-react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'cyan' | 'purple' | 'success' | 'warning' | 'danger' | 'outline' | 'blue';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium font-sans rounded-full transition-colors select-none';

  const variants = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    cyan: 'bg-blue-50 text-blue-700 border border-blue-200',
    blue: 'bg-blue-50 text-blue-700 border border-blue-200',
    purple: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    outline: 'bg-transparent text-slate-700 border border-slate-300',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-0.5 gap-1.5',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}

export interface StatusBadgeProps {
  status: IncidentStatus;
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config: Record<
    IncidentStatus,
    { label: string; dotColor: string; bg: string; text: string; border: string }
  > = {
    SUBMITTED: {
      label: 'Submitted',
      dotColor: 'bg-slate-400',
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      border: 'border-slate-200',
    },
    ANALYZING: {
      label: 'AI Ingestion',
      dotColor: 'bg-indigo-500 animate-pulse',
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
    },
    VALIDATED: {
      label: 'Validated',
      dotColor: 'bg-blue-500',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
    },
    ASSIGNED: {
      label: 'Assigned',
      dotColor: 'bg-blue-600',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
    },
    IN_PROGRESS: {
      label: 'In Progress',
      dotColor: 'bg-amber-500 animate-pulse',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
    },
    RESOLVED: {
      label: 'Resolved',
      dotColor: 'bg-emerald-500',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
    },
    VERIFYING: {
      label: 'Verifying Fix',
      dotColor: 'bg-indigo-500',
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
    },
    CLOSED: {
      label: 'Closed',
      dotColor: 'bg-slate-400',
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-200',
    },
    REOPENED: {
      label: 'Reopened',
      dotColor: 'bg-rose-500 animate-pulse',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
    },
  };

  const item = config[status] || config.SUBMITTED;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border font-sans',
        item.bg,
        item.text,
        item.border,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', item.dotColor)} />
      <span>{item.label}</span>
    </span>
  );
}

export interface SeverityBadgeProps {
  severity: SeverityLevel;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config: Record<
    SeverityLevel,
    { label: string; dotColor: string; bg: string; text: string; border: string; pulse?: boolean }
  > = {
    LOW: {
      label: 'Low',
      dotColor: 'bg-blue-500',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
    },
    MEDIUM: {
      label: 'Medium',
      dotColor: 'bg-amber-500',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
    },
    HIGH: {
      label: 'High',
      dotColor: 'bg-orange-500',
      bg: 'bg-orange-50',
      text: 'text-orange-800',
      border: 'border-orange-200',
    },
    CRITICAL: {
      label: 'Critical',
      dotColor: 'bg-rose-500',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      pulse: true,
    },
  };

  const item = config[severity] || config.LOW;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border font-sans',
        item.bg,
        item.text,
        item.border,
        className
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full shrink-0',
          item.dotColor,
          item.pulse && 'animate-ping inline-flex'
        )}
      />
      <span>{item.label}</span>
    </span>
  );
}

export interface AgentBadgeProps {
  agentId: AgentId;
  name?: string;
  className?: string;
}

export function AgentBadge({ agentId, name, className }: AgentBadgeProps) {
  const cleanName = name || agentId.replace('AGENT_', '').replace('_', ' ');

  return (
    <Badge variant="purple" size="sm" className={cn('font-sans font-medium', className)}>
      <Cpu className="w-3 h-3 text-indigo-600" />
      <span>{cleanName}</span>
    </Badge>
  );
}
