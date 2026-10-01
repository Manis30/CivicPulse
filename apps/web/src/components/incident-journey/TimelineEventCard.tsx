import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown, ChevronUp, Sparkles, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TimelineEventItem, EventActorCategory } from './types';
import {
  formatAbsoluteDate,
  formatRelativeTime,
  sanitizeEventDescription,
  getEventVisualMeta,
  getActorCategory,
} from './utils';

interface TimelineEventCardProps {
  event: TimelineEventItem;
  index: number;
  isSelected: boolean;
  onSelect: (event: TimelineEventItem) => void;
  teamName?: string;
  departmentName?: string;
  isLatest?: boolean;
}

export function TimelineEventCard({
  event,
  index,
  isSelected,
  onSelect,
  teamName,
  departmentName,
  isLatest = false,
}: TimelineEventCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isExpanded, setIsExpanded] = useState(false);

  const meta = getEventVisualMeta(event);
  const actorCategory = getActorCategory(event);
  const isAiEvent = actorCategory === 'AI';

  const cleanDescription = sanitizeEventDescription(event.description, teamName, departmentName);
  const relativeTime = formatRelativeTime(event.timestamp);
  const absoluteTime = formatAbsoluteDate(event.timestamp);

  const Icon = meta.icon;

  const handleCardClick = () => {
    onSelect(event);
    setIsExpanded((prev) => !prev);
  };

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
      className="relative pl-9 sm:pl-10 pb-6 group select-none"
    >
      {/* 1. Left Vertical Timeline Spine Segment */}
      <div className="absolute left-3.5 sm:left-4 top-4 bottom-0 w-[2px] bg-[#E3EAE6] -translate-x-1/2 group-last:hidden" />

      {/* 2. Interactive Node on the Spine */}
      <div
        className={cn(
          'absolute left-3.5 sm:left-4 top-3 -translate-x-1/2 rounded-full flex items-center justify-center transition-all z-10 cursor-pointer',
          isSelected
            ? 'w-7 h-7 ring-4 ring-[#159A68]/20 bg-[#159A68] text-white shadow-xs'
            : isAiEvent
            ? 'w-6 h-6 bg-[#E7F7F0] text-[#159A68] border-2 border-[#159A68] ring-3 ring-[#159A68]/15'
            : 'w-6 h-6 bg-white text-[#102A43] border-2 border-[#829AB1]/60 group-hover:border-[#159A68] group-hover:text-[#159A68]'
        )}
        onClick={handleCardClick}
        title={absoluteTime}
      >
        {isSelected ? (
          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
        ) : isAiEvent ? (
          <Sparkles className="w-3 h-3 text-[#159A68]" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-current" />
        )}

        {/* Pulsing halo on latest active event */}
        {isLatest && !shouldReduceMotion && !isSelected && (
          <span className="absolute -inset-1 rounded-full border border-[#159A68] animate-ping opacity-60 pointer-events-none" />
        )}
      </div>

      {/* 3. Event Card */}
      <motion.div
        whileHover={shouldReduceMotion ? {} : { y: -2 }}
        onClick={handleCardClick}
        className={cn(
          'rounded-2xl border p-4 sm:p-4.5 transition-all cursor-pointer text-left',
          isSelected
            ? 'bg-white border-[#159A68] ring-3 ring-[#159A68]/15 shadow-sm'
            : 'bg-white hover:bg-[#FAF8F5]/60 border-[#E3EAE6] hover:border-[#159A68]/60 shadow-2xs hover:shadow-xs'
        )}
      >
        {/* Top Meta Row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Semantic Event Icon Container */}
            <div
              className={cn(
                'p-1.5 rounded-lg shrink-0 flex items-center justify-center transition-colors',
                isAiEvent ? 'bg-[#E7F7F0] text-[#159A68]' : meta.bgLight
              )}
              style={{ color: meta.color }}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>

            {/* Event Title */}
            <h4
              className={cn(
                'text-xs sm:text-sm font-bold font-heading truncate',
                isSelected ? 'text-[#0B3D2E]' : 'text-[#102A43]'
              )}
            >
              {meta.title}
            </h4>
          </div>

          {/* Right badges & time */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Actor Origin Badge */}
            <span
              className={cn(
                'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full font-heading border',
                actorCategory === 'AI' && 'bg-[#E7F7F0] text-[#0B3D2E] border-[#159A68]/25',
                actorCategory === 'SYSTEM' && 'bg-[#FAF8F5] text-[#526777] border-[#E3EAE6]',
                actorCategory === 'FIELD' && 'bg-[#FEF8EC] text-[#8C5E09] border-[#F2B84B]/40',
                actorCategory === 'CITIZEN' && 'bg-[#EBF3FD] text-[#1652A5] border-[#2878E5]/25',
                actorCategory === 'MANAGER' && 'bg-[#EAEFF4] text-[#102A43] border-[#102A43]/20'
              )}
            >
              {meta.badgeLabel}
            </span>

            {/* Timestamp */}
            <div
              className="flex items-center gap-1 text-[11px] text-[#829AB1] font-mono group-hover:text-[#526777]"
              title={absoluteTime}
            >
              <Clock className="w-3 h-3 text-[#829AB1]" />
              <span>{relativeTime}</span>
            </div>

            {/* Expand / Collapse Indicator */}
            <div className="text-[#829AB1] pl-0.5">
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </div>
          </div>
        </div>

        {/* Short Summary Description */}
        <p className="mt-2 text-xs text-[#526777] leading-relaxed line-clamp-2">
          {cleanDescription}
        </p>

        {/* Expandable Details Surface */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden mt-3 pt-3 border-t border-[#E3EAE6]/70 space-y-2.5 text-xs text-[#526777]"
              onClick={(e) => e.stopPropagation()} // keep interactive
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#FAF8F5] p-3 rounded-xl border border-[#E3EAE6]/80 text-[11px]">
                <div>
                  <span className="text-[#829AB1] block font-heading uppercase text-[10px]">
                    Exact Audit Timestamp
                  </span>
                  <span className="font-mono font-medium text-[#102A43]">{absoluteTime}</span>
                </div>
                <div>
                  <span className="text-[#829AB1] block font-heading uppercase text-[10px]">
                    Status Confirmation
                  </span>
                  <span className="font-semibold text-[#159A68] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {meta.status}
                  </span>
                </div>
              </div>

              {/* Action Link to Inspect on Right Column */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => onSelect(event)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#159A68] hover:text-[#0B3D2E] transition-colors cursor-pointer group/btn"
                >
                  <span>View Full Decision Trace in Inspector</span>
                  <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
