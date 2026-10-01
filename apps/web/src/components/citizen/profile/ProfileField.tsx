import React from 'react';
import { cn } from '@/lib/utils';

interface ProfileFieldProps {
  label: string;
  id: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}

export function ProfileField({
  label,
  id,
  icon: Icon,
  children,
  className,
}: ProfileFieldProps) {
  return (
    <div className={cn('space-y-1 text-left', className)}>
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-[11px] font-semibold text-[#102A43] font-heading tracking-wide uppercase"
      >
        {Icon && <Icon className="w-3.5 h-3.5 text-[#627D98]" />}
        <span>{label}</span>
      </label>
      {children}
    </div>
  );
}

export default ProfileField;
