import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface CitizenContentContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Standard container that enforces uniform layout geometry, typography, and spacing
 * across every Citizen Portal page.
 */
export function CitizenContentContainer({ children, className }: CitizenContentContainerProps) {
  return (
    <div className={cn('w-full space-y-6 sm:space-y-8 text-left animate-in fade-in duration-150', className)}>
      {children}
    </div>
  );
}

export { CitizenPageHeader } from './CitizenPageHeader';
export type { CitizenPageHeaderProps } from './CitizenPageHeader';

interface CitizenCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function CitizenCard({ children, className, ...props }: CitizenCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-[#E3EAE6] shadow-2xs p-4 sm:p-4.5 transition-all',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CitizenEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function CitizenEmptyState({ icon, title, description, action }: CitizenEmptyStateProps) {
  return (
    <div className="p-12 sm:p-16 text-center bg-white border border-[#E3EAE6] rounded-[18px] shadow-[0_8px_30px_rgba(15,40,30,0.06)] space-y-4">
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-[#E7F7F0] text-[#159A68] mx-auto flex items-center justify-center shadow-xs">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <h3 className="font-bold text-base sm:text-lg font-heading text-[#102A43]">{title}</h3>
        <p className="text-xs sm:text-sm text-[#6B7C8F] max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

interface CitizenErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function CitizenErrorState({
  title = "We couldn't load your information.",
  message = "Unable to communicate with the municipal operations service. Please try again.",
  onRetry,
}: CitizenErrorStateProps) {
  return (
    <div className="p-8 sm:p-12 text-center bg-white border border-red-100 rounded-[18px] shadow-[0_8px_30px_rgba(15,40,30,0.06)] space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#EF6A63] mx-auto flex items-center justify-center">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="font-bold text-sm sm:text-base font-heading text-[#102A43]">{title}</h3>
      <p className="text-xs text-[#6B7C8F] max-w-sm mx-auto leading-relaxed">{message}</p>
      {onRetry && (
        <div className="pt-2">
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#159A68] hover:bg-[#128358] text-white text-xs font-bold transition-all shadow-md shadow-[#159A68]/20 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}
    </div>
  );
}
