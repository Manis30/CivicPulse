import React from 'react';
import { cn } from '@/lib/utils';

interface NotificationPreferenceRowProps {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

export function NotificationPreferenceRow({
  id,
  title,
  description,
  checked,
  onChange,
  icon: Icon,
}: NotificationPreferenceRowProps) {
  return (
    <div className="py-2.5 px-2 -mx-2 rounded-xl hover:bg-[#F7FAF8] transition-colors duration-150 flex items-center justify-between gap-3 text-left">
      <div className="space-y-0.5 min-w-0">
        <div className="flex items-center gap-1.5">
          {Icon && <Icon className="w-3.5 h-3.5 text-[#159A68] shrink-0" />}
          <h4 className="text-xs sm:text-[13px] font-bold font-heading text-[#102A43] truncate">
            {title}
          </h4>
        </div>
        <p className="text-[11px] sm:text-xs text-[#627D98] font-sans truncate">
          {description}
        </p>
      </div>

      {/* Accessible Toggle Switch */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          id={id}
          role="switch"
          aria-checked={checked}
          aria-label={title}
          onClick={onChange}
          className={cn(
            'relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#159A68]/25',
            checked ? 'bg-[#159A68]' : 'bg-[#CBD5E1]'
          )}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out',
              checked ? 'translate-x-4.5' : 'translate-x-0'
            )}
          />
        </button>

        <span
          className={cn(
            'text-[10px] font-bold font-mono min-w-[22px]',
            checked ? 'text-[#159A68]' : 'text-[#829AB1]'
          )}
        >
          {checked ? 'ON' : 'OFF'}
        </span>
      </div>
    </div>
  );
}

export default NotificationPreferenceRow;
