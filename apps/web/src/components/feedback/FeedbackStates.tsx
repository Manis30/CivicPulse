import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, AlertTriangle, Inbox, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'blue' | 'green' | 'indigo' | 'white' | 'cyan' | 'purple';
}

export function Spinner({ size = 'md', variant = 'blue', className, ...props }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  const colors = {
    blue: 'text-blue-600',
    green: 'text-emerald-600',
    indigo: 'text-indigo-600',
    white: 'text-white',
    cyan: 'text-blue-500',
    purple: 'text-indigo-500',
  };

  return (
    <div className={cn('inline-flex items-center justify-center', className)} {...props}>
      <Loader2 className={cn('animate-spin', sizes[size], colors[variant])} />
    </div>
  );
}

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse bg-slate-200/80 rounded-xl', className)}
      {...props}
    />
  );
}

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 - 100
  variant?: 'blue' | 'green' | 'indigo' | 'warning' | 'danger' | 'cyan' | 'purple' | 'success';
}

export function Progress({ value, variant = 'blue', className, ...props }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  const variants = {
    blue: 'bg-blue-600',
    green: 'bg-emerald-600',
    indigo: 'bg-indigo-600',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    cyan: 'bg-blue-600',
    purple: 'bg-indigo-600',
    success: 'bg-emerald-600',
  };

  return (
    <div
      className={cn('w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60', className)}
      {...props}
    >
      <div
        className={cn('h-full transition-all duration-300 rounded-full', variants[variant])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 bg-white border border-slate-200 rounded-2xl shadow-civic-card font-sans',
        className
      )}
    >
      <div className="p-3.5 bg-slate-50 text-slate-400 rounded-2xl mb-3 border border-slate-100">
        {icon || <Inbox className="w-8 h-8 text-slate-400" />}
      </div>
      <h4 className="text-base font-bold font-heading text-slate-800">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4 leading-relaxed font-sans">{description}</p>
      {action}
    </div>
  );
}

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 bg-white border border-red-200/80 rounded-2xl shadow-civic-card font-sans',
        className
      )}
    >
      <div className="p-3.5 bg-red-50 text-red-600 rounded-2xl mb-3 border border-red-100">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>
      <h4 className="text-base font-bold font-heading text-slate-900">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4 leading-relaxed font-sans">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Try Again
        </Button>
      )}
    </div>
  );
}

export interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingState({ label = 'Connecting to city telemetry...', className }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-12 space-y-3 font-sans', className)}>
      <Spinner size="lg" variant="blue" />
      <p className="text-xs font-medium text-slate-500 tracking-normal animate-pulse">{label}</p>
    </div>
  );
}

