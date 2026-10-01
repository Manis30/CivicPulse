import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EventFilterType, FilterCounts } from './adminTimelineTypes';
import { LuBot, LuActivity, LuWrench, LuUser, LuLayers } from 'react-icons/lu';

interface AdminTimelineFiltersProps {
  activeFilter: EventFilterType;
  onFilterChange: (filter: EventFilterType) => void;
  counts: FilterCounts;
  className?: string;
}

export function AdminTimelineFilters({
  activeFilter,
  onFilterChange,
  counts,
  className,
}: AdminTimelineFiltersProps) {
  const filterOptions: Array<{
    id: EventFilterType;
    label: string;
    count: number;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'ALL', label: 'All', count: counts.all, icon: LuLayers },
    { id: 'AI', label: 'AI Decisions', count: counts.ai, icon: LuBot },
    { id: 'SYSTEM', label: 'System', count: counts.system, icon: LuActivity },
    { id: 'FIELD', label: 'Field Operations', count: counts.field, icon: LuWrench },
    { id: 'CITIZEN', label: 'Citizen', count: counts.citizen, icon: LuUser },
  ];

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#0B1524] border border-[rgba(148,163,184,0.12)]',
        className
      )}
    >
      {filterOptions.map((opt) => {
        const isActive = activeFilter === opt.id;
        const Icon = opt.icon;

        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onFilterChange(opt.id)}
            className={cn(
              'relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer select-none',
              isActive
                ? 'bg-[#5B5BF7] text-white shadow-xs font-semibold'
                : 'bg-transparent text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#101F33]'
            )}
          >
            <Icon
              className={cn(
                'w-3.5 h-3.5',
                isActive ? 'text-white' : 'text-[#64748B]'
              )}
            />
            <span>{opt.label}</span>
            <span
              className={cn(
                'px-1.5 py-0.2 rounded-md font-mono text-[10px] transition-colors',
                isActive
                  ? 'bg-black/25 text-white'
                  : 'bg-[#101F33] text-[#64748B] border border-[rgba(148,163,184,0.1)]'
              )}
            >
              {opt.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
