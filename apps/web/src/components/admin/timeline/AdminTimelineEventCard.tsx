import React from 'react';
import { motion } from 'framer-motion';
import {
  LuBot,
  LuSparkles,
  LuMapPin,
  LuShieldAlert,
  LuActivity,
  LuUsers,
  LuClipboardCheck,
  LuWrench,
  LuCircleCheck,
  LuBadgeCheck,
  LuTriangleAlert,
  LuRotateCcw,
  LuFilePlus,
  LuRadio,
  LuCheck,
} from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { AdminTimelineEvent, EventCategoryType } from './adminTimelineTypes';
import { formatShortTime, formatRelativeTime } from './adminTimelineUtils';

interface AdminTimelineEventCardProps {
  event: AdminTimelineEvent;
  isSelected: boolean;
  onSelect: (event: AdminTimelineEvent) => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function AdminTimelineEventCard({
  event,
  isSelected,
  onSelect,
  isFirst = false,
  isLast = false,
}: AdminTimelineEventCardProps) {
  // Determine Category Theme Styles
  const getCategoryStyles = (category: EventCategoryType) => {
    switch (category) {
      case 'AI':
        return {
          badge: 'AI DECISION',
          badgeClass: 'bg-[#818CF8]/10 text-[#818CF8] border-[#818CF8]/25',
          dotBg: 'bg-[#818CF8]',
          dotRing: 'ring-[#818CF8]/25',
          iconColor: 'text-[#818CF8]',
          iconBg: 'bg-[#818CF8]/10',
          accentColor: '#818CF8',
        };
      case 'VERIFICATION':
        return {
          badge: 'AI VERIFICATION',
          badgeClass: 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/25',
          dotBg: 'bg-[#22C55E]',
          dotRing: 'ring-[#22C55E]/25',
          iconColor: 'text-[#22C55E]',
          iconBg: 'bg-[#22C55E]/10',
          accentColor: '#22C55E',
        };
      case 'CITIZEN':
        return {
          badge: 'CITIZEN EVENT',
          badgeClass: 'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/25',
          dotBg: 'bg-[#38BDF8]',
          dotRing: 'ring-[#38BDF8]/25',
          iconColor: 'text-[#38BDF8]',
          iconBg: 'bg-[#38BDF8]/10',
          accentColor: '#38BDF8',
        };
      case 'FIELD':
        return {
          badge: 'FIELD OPERATIONS',
          badgeClass: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/25',
          dotBg: 'bg-[#F59E0B]',
          dotRing: 'ring-[#F59E0B]/25',
          iconColor: 'text-[#F59E0B]',
          iconBg: 'bg-[#F59E0B]/10',
          accentColor: '#F59E0B',
        };
      case 'CRITICAL':
        return {
          badge: 'CRITICAL / BREACH',
          badgeClass: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/25',
          dotBg: 'bg-[#EF4444]',
          dotRing: 'ring-[#EF4444]/25',
          iconColor: 'text-[#EF4444]',
          iconBg: 'bg-[#EF4444]/10',
          accentColor: '#EF4444',
        };
      case 'SYSTEM':
      default:
        return {
          badge: 'SYSTEM EVENT',
          badgeClass: 'bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/25',
          dotBg: 'bg-[#06B6D4]',
          dotRing: 'ring-[#06B6D4]/25',
          iconColor: 'text-[#06B6D4]',
          iconBg: 'bg-[#06B6D4]/10',
          accentColor: '#06B6D4',
        };
    }
  };

  const getSemanticIcon = (type: string, category: EventCategoryType) => {
    const t = (type || '').toUpperCase();
    if (t === 'INCIDENT_CREATED') return LuFilePlus;
    if (t.includes('LOCATION')) return LuMapPin;
    if (t.includes('SEVERITY')) return LuShieldAlert;
    if (t.includes('VALIDATED')) return LuBadgeCheck;
    if (t.includes('VERIFICATION') && t.includes('FAIL')) return LuTriangleAlert;
    if (t.includes('VERIFICATION')) return LuBadgeCheck;
    if (t.includes('TEAM') || t.includes('ASSIGN')) return LuUsers;
    if (t.includes('WORK_ORDER')) return LuClipboardCheck;
    if (t.includes('WORK_STARTED')) return LuWrench;
    if (t.includes('WORK_COMPLETED')) return LuCircleCheck;
    if (t.includes('REOPEN')) return LuRotateCcw;
    if (t.includes('NOTIFICATION')) return LuRadio;
    if (category === 'AI') return LuBot;
    return LuActivity;
  };

  const styles = getCategoryStyles(event.category);
  const Icon = getSemanticIcon(event.type, event.category);
  const relativeTime = formatRelativeTime(event.timestamp);
  const shortTime = formatShortTime(event.timestamp);

  return (
    <div className="relative flex items-start gap-3 sm:gap-4 group cursor-pointer select-none" onClick={() => onSelect(event)}>
      {/* Vertical Connecting Line */}
      <div className="relative flex flex-col items-center self-stretch shrink-0 pt-3">
        {/* Top Connecting Segment */}
        {!isFirst && (
          <div className="absolute top-0 bottom-1/2 w-[2px] bg-[#16273F] -translate-y-3" />
        )}
        {/* Bottom Connecting Segment */}
        {!isLast && (
          <div className="absolute top-1/2 bottom-0 w-[2px] bg-[#16273F] translate-y-3" />
        )}

        {/* Node Dot Indicator */}
        <div
          className={cn(
            'w-4 h-4 rounded-full flex items-center justify-center relative z-10 transition-all duration-300',
            styles.dotBg,
            isSelected
              ? 'ring-4 ring-[#5B5BF7]/40 scale-125 shadow-[0_0_10px_rgba(91,91,247,0.6)]'
              : 'ring-2 ring-[#07111F] group-hover:scale-110'
          )}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#07111F]" />
        </div>
      </div>

      {/* Main Event Card Body */}
      <div
        className={cn(
          'flex-1 p-3.5 sm:p-4 rounded-xl transition-all duration-200 border relative overflow-hidden',
          isSelected
            ? 'bg-[#122238] border-[#5B5BF7] shadow-[0_0_15px_rgba(91,91,247,0.2)]'
            : 'bg-[#0D1A2B] border-[rgba(148,163,184,0.12)] hover:border-[rgba(148,163,184,0.25)] hover:bg-[#101F33]'
        )}
      >
        {/* Subtle Selected Accent Glow / Indicator */}
        {isSelected && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5B5BF7]" />
        )}

        <div className="flex items-start justify-between gap-3">
          {/* Left Title & Semantic Icon */}
          <div className="flex items-start gap-2.5 min-w-0">
            <div
              className={cn(
                'p-1.5 rounded-lg shrink-0 mt-0.5 border border-white/5',
                styles.iconBg,
                styles.iconColor
              )}
            >
              <Icon className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4
                  className={cn(
                    'text-xs sm:text-sm font-semibold truncate font-sans',
                    isSelected ? 'text-[#F8FAFC]' : 'text-[#E2E8F0]'
                  )}
                >
                  {event.title}
                </h4>
                {isSelected && (
                  <span className="text-[#5B5BF7] text-[11px] font-bold shrink-0 animate-pulse">
                    ✦
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-[11.5px] text-[#94A3B8] leading-relaxed mt-0.5 line-clamp-2">
                {event.description}
              </p>
            </div>
          </div>

          {/* Right Timestamp */}
          <div className="shrink-0 text-right">
            <span className="text-[11px] font-mono text-[#64748B] block">
              {relativeTime}
            </span>
          </div>
        </div>

        {/* Bottom Metadata Row: EVENT TYPE · ACTOR · TIMESTAMP */}
        <div className="mt-2.5 pt-2 border-t border-[rgba(148,163,184,0.08)] flex flex-wrap items-center justify-between gap-2 text-[10.5px]">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                'px-1.5 py-0.5 rounded font-mono font-semibold uppercase tracking-wider text-[9.5px] border',
                styles.badgeClass
              )}
            >
              {styles.badge}
            </span>
            <span className="text-[#64748B]">·</span>
            <span className="font-mono text-[#CBD5E1]">
              {event.actorId || event.actorName}
            </span>
          </div>

          <div className="font-mono text-[#64748B] text-[10px]">
            {shortTime}
          </div>
        </div>
      </div>
    </div>
  );
}
