import React from 'react';
import { cn } from '@/lib/utils';

export interface AdminCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass';
  isInteractive?: boolean;
}

export const AdminCard = React.forwardRef<HTMLDivElement, AdminCardProps>(
  ({ className, variant = 'default', isInteractive = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl border transition-all duration-200',
          variant === 'default' && 'bg-[#0E1B2D] border-[rgba(148,163,184,0.16)]',
          variant === 'elevated' && 'bg-[#13243A] border-[rgba(148,163,184,0.22)] shadow-xl shadow-[#07111F]/50',
          variant === 'glass' && 'bg-[#0E1B2D]/80 backdrop-blur-md border-[rgba(148,163,184,0.16)]',
          isInteractive && 'hover:border-[#5B5BF7]/50 hover:bg-[#101F33] cursor-pointer hover:shadow-lg hover:shadow-indigo-500/10',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AdminCard.displayName = 'AdminCard';
