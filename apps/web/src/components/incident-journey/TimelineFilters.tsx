import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EventFilterType } from './types';
import { Sparkles, Cpu, Users, User, Layers } from 'lucide-react';

interface TimelineFiltersProps {
  currentFilter: EventFilterType;
  onFilterChange: (filter: EventFilterType) => void;
  counts: Record<EventFilterType, number>;
  className?: string;
}

const FILTER_CONFIG: {
  key: EventFilterType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: 'ALL', label: 'All', icon: Layers },
  { key: 'AI', label: 'AI Decisions', icon: Sparkles },
  { key: 'SYSTEM', label: 'System', icon: Cpu },
  { key: 'FIELD', label: 'Field Ops', icon: Users },
  { key: 'CITIZEN', label: 'Citizen', icon: User },
];

export function TimelineFilters({
  currentFilter,
  onFilterChange,
  counts,
  className,
}: TimelineFiltersProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter timeline events by origin"
      className={cn(
        'flex items-center gap-1.5 p-1 rounded-xl bg-[#FAF8F5] border border-[#E3EAE6] overflow-x-auto no-scrollbar',
        className
      )}
    >
      {FILTER_CONFIG.map(({ key, label, icon: Icon }) => {
        const isSelected = currentFilter === key;
        const count = counts[key] || 0;

        return (
          <button
            key={key}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onFilterChange(key)}
            className={cn(
              'relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer shrink-0 select-none',
              isSelected
                ? 'text-[#102A43] font-bold shadow-xs'
                : 'text-[#6B7C8F] hover:text-[#102A43] hover:bg-white/60'
            )}
          >
            {/* Animated pill background */}
            {isSelected && (
              <motion.div
                layoutId="activeTimelineFilter"
                className="absolute inset-0 bg-white rounded-lg border border-[#E3EAE6] shadow-2xs"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}

            <span className="relative z-10 flex items-center gap-1.5">
              <Icon
                className={cn(
                  'w-3.5 h-3.5',
                  isSelected
                    ? key === 'AI'
                      ? 'text-[#159A68]'
                      : 'text-[#102A43]'
                    : 'text-[#829AB1]'
                )}
              />
              <span>{label}</span>
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-mono',
                  isSelected
                    ? 'bg-[#EAEFF4] text-[#102A43] font-bold'
                    : 'bg-[#FAF8F5] text-[#829AB1] border border-[#E3EAE6]'
                )}
              >
                {count}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
