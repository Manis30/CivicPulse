import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuRefreshCw,
  LuActivity,
  LuLayers,
  LuSlidersHorizontal,
  LuX,
} from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { AdminIncidentLifecycleRail } from './AdminIncidentLifecycleRail';
import { AdminTimelineFilters } from './AdminTimelineFilters';
import { AdminTimelineEventCard } from './AdminTimelineEventCard';
import { AdminEventInspector } from './AdminEventInspector';
import {
  AdminTimelineEvent,
  EventFilterType,
} from './adminTimelineTypes';
import {
  mergeIncidentTimeline,
  computeFilterCounts,
  filterEvents,
  formatRelativeTime,
} from './adminTimelineUtils';

interface AdminIncidentTimelineWorkspaceProps {
  timeline: any[];
  agentExecutions?: any[];
  auditLogs?: any[];
  incident: any;
  evidence?: any[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function AdminIncidentTimelineWorkspace({
  timeline = [],
  agentExecutions = [],
  auditLogs = [],
  incident = {},
  evidence = [],
  onRefresh,
  isRefreshing = false,
}: AdminIncidentTimelineWorkspaceProps) {
  const [activeFilter, setActiveFilter] = useState<EventFilterType>('ALL');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isMobileInspectorOpen, setIsMobileInspectorOpen] = useState(false);

  // 1. Merge and deduplicate raw records into unified AdminTimelineEvent array
  const allMergedEvents = useMemo(() => {
    return mergeIncidentTimeline(
      timeline,
      agentExecutions,
      auditLogs,
      incident,
      evidence
    );
  }, [timeline, agentExecutions, auditLogs, incident, evidence]);

  // 2. Compute dynamic filter counts
  const filterCounts = useMemo(() => {
    return computeFilterCounts(allMergedEvents);
  }, [allMergedEvents]);

  // 3. Apply active category filter
  const filteredEvents = useMemo(() => {
    return filterEvents(allMergedEvents, activeFilter);
  }, [allMergedEvents, activeFilter]);

  // 4. Default select the latest or first event
  useEffect(() => {
    if (allMergedEvents.length > 0) {
      if (!selectedEventId || !allMergedEvents.some((e) => e.id === selectedEventId)) {
        // Default to the most recent event (last in chronological order)
        setSelectedEventId(allMergedEvents[allMergedEvents.length - 1].id);
      }
    } else {
      setSelectedEventId(null);
    }
  }, [allMergedEvents, selectedEventId]);

  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null;
    return allMergedEvents.find((e) => e.id === selectedEventId) || null;
  }, [allMergedEvents, selectedEventId]);

  const handleSelectEvent = (event: AdminTimelineEvent) => {
    setSelectedEventId(event.id);
    setIsMobileInspectorOpen(true);
  };

  // Determine latest updated time
  const latestTimestamp = allMergedEvents.length > 0
    ? allMergedEvents[allMergedEvents.length - 1].timestamp
    : incident?.updatedAt || incident?.createdAt;

  const updatedTimeLabel = formatRelativeTime(latestTimestamp);

  const hasReopenedEvent = allMergedEvents.some((e) => e.type === 'INCIDENT_REOPENED');

  return (
    <div className="space-y-5">
      {/* 1. TIMELINE HEADER */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0D1A2B] border border-[rgba(148,163,184,0.12)] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#5B5BF7]/15 text-[#5B5BF7]">
              <LuActivity className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold font-heading text-[#F8FAFC] tracking-wide uppercase">
              INCIDENT JOURNEY
            </h2>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Every decision, action, and verification recorded from report to resolution.
          </p>
        </div>

        {/* Right Status Meta & Refresh */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#101F33] border border-[rgba(148,163,184,0.1)] text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="text-[#F8FAFC] font-semibold">LIVE / SYNCED</span>
          </div>

          <div className="text-xs font-mono text-[#94A3B8] px-3 py-1.5 rounded-lg bg-[#101F33] border border-[rgba(148,163,184,0.1)]">
            <span className="text-[#38BDF8] font-bold">{allMergedEvents.length}</span> EVENTS
          </div>

          <div className="text-[11px] font-mono text-[#64748B] hidden sm:block">
            Updated {updatedTimeLabel}
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-[#101F33] hover:bg-[#13243A] text-[#94A3B8] hover:text-[#F8FAFC] border border-[rgba(148,163,184,0.12)] transition-all cursor-pointer disabled:opacity-50"
              title="Refresh timeline from database"
            >
              <LuRefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin text-[#5B5BF7]')} />
            </button>
          )}
        </div>
      </div>

      {/* 2. INCIDENT LIFECYCLE RAIL */}
      <AdminIncidentLifecycleRail
        status={incident?.status || 'SUBMITTED'}
        reopenCount={incident?.reopenCount || 0}
        hasReopenedEvent={hasReopenedEvent}
      />

      {/* 3. EVENT FILTER BAR */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <AdminTimelineFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={filterCounts}
        />
        <div className="text-xs text-[#64748B] font-mono hidden md:block">
          Showing {filteredEvents.length} of {allMergedEvents.length} chronological events
        </div>
      </div>

      {/* 4. MAIN CONTENT SPLIT (Desktop: 65% / 35%, Mobile/Tablet: 100% with Drawer) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: EVENT TIMELINE (~65% on Desktop: lg:col-span-7 or 8) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-[#0D1A2B] border border-[rgba(148,163,184,0.12)] text-[#64748B]">
              <LuActivity className="w-8 h-8 mx-auto mb-2 text-[#475569]" />
              <p className="text-sm font-medium text-[#94A3B8]">
                No incident events recorded yet.
              </p>
              <p className="text-xs mt-1 text-[#64748B]">
                Events will appear chronologically as autonomous agents and municipal teams interact with this record.
              </p>
            </div>
          ) : (
            <div className="space-y-3 relative pl-1">
              {filteredEvents.map((evt, idx) => (
                <AdminTimelineEventCard
                  key={evt.id}
                  event={evt}
                  isSelected={selectedEventId === evt.id}
                  onSelect={handleSelectEvent}
                  isFirst={idx === 0}
                  isLast={idx === filteredEvents.length - 1}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: EVENT INSPECTOR (Desktop: ~35% on Desktop: lg:col-span-5 or 4) */}
        <div className="hidden lg:block lg:col-span-5 xl:col-span-4 sticky top-6">
          <AdminEventInspector
            selectedEvent={selectedEvent}
            incident={incident}
          />
        </div>
      </div>

      {/* TABLET / MOBILE INSPECTOR DRAWER (Shows when clicked on smaller screens) */}
      <AnimatePresence>
        {isMobileInspectorOpen && selectedEvent && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="w-full sm:max-w-xl max-h-[85vh] overflow-hidden rounded-t-2xl sm:rounded-2xl bg-[#0D1A2B] border border-[rgba(148,163,184,0.2)] shadow-2xl"
            >
              <AdminEventInspector
                selectedEvent={selectedEvent}
                incident={incident}
                onClose={() => setIsMobileInspectorOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
