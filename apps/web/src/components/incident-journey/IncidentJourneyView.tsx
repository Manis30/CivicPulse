import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { IncidentLifecycleRail } from './IncidentLifecycleRail';
import { IncidentJourneyHeader } from './IncidentJourneyHeader';
import { TimelineFilters } from './TimelineFilters';
import { TimelineEventCard } from './TimelineEventCard';
import { EventInspector } from './EventInspector';
import { TimelineSkeleton } from './TimelineSkeleton';
import { TimelineEventItem, EventFilterType, AgentExecutionRecord } from './types';
import { getActorCategory } from './utils';
import { Drawer } from '@/components/ui/Overlays';
import { Activity, Clock, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IncidentJourneyViewProps {
  incident: any;
  timeline?: any[];
  agentExecutions?: AgentExecutionRecord[];
  isLoading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export function IncidentJourneyView({
  incident,
  timeline = [],
  agentExecutions = [],
  isLoading = false,
  onRefresh,
  className,
}: IncidentJourneyViewProps) {
  const shouldReduceMotion = useReducedMotion();

  // Normalize incoming timeline items into typed TimelineEventItem
  const normalizedEvents: TimelineEventItem[] = useMemo(() => {
    return (timeline || []).map((evt: any, idx: number) => ({
      id: evt._id || evt.id || `evt-${idx}`,
      type: evt.type || 'OPERATIONAL_EVENT',
      actorType: evt.actorType || 'SYSTEM',
      actorId: evt.actorId,
      fromStatus: evt.fromStatus,
      toStatus: evt.toStatus,
      description: evt.description || evt.notes || 'System operational state transition recorded.',
      metadata: evt.metadata,
      timestamp: evt.timestamp || evt.createdAt || new Date(),
      status: evt.status || 'COMPLETED',
    }));
  }, [timeline]);

  // Current active filter
  const [currentFilter, setCurrentFilter] = useState<EventFilterType>('ALL');

  // Currently selected event
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Mobile drawer state
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Live status state
  const [lastUpdatedText, setLastUpdatedText] = useState('Updated just now');
  const [isLiveActive, setIsLiveActive] = useState(true);

  // Counts for each filter
  const filterCounts = useMemo(() => {
    const counts: Record<EventFilterType, number> = {
      ALL: normalizedEvents.length,
      AI: 0,
      SYSTEM: 0,
      FIELD: 0,
      CITIZEN: 0,
    };

    normalizedEvents.forEach((evt) => {
      const cat = getActorCategory(evt);
      if (cat === 'AI') counts.AI += 1;
      else if (cat === 'SYSTEM') counts.SYSTEM += 1;
      else if (cat === 'FIELD') counts.FIELD += 1;
      else if (cat === 'CITIZEN') counts.CITIZEN += 1;
      else counts.SYSTEM += 1;
    });

    return counts;
  }, [normalizedEvents]);

  // Filtered event list
  const filteredEvents = useMemo(() => {
    if (currentFilter === 'ALL') return normalizedEvents;
    return normalizedEvents.filter((evt) => {
      const cat = getActorCategory(evt);
      if (currentFilter === 'AI') return cat === 'AI';
      if (currentFilter === 'SYSTEM') return cat === 'SYSTEM';
      if (currentFilter === 'FIELD') return cat === 'FIELD';
      if (currentFilter === 'CITIZEN') return cat === 'CITIZEN';
      return true;
    });
  }, [normalizedEvents, currentFilter]);

  // Automatically select the first event if none selected
  useEffect(() => {
    if (filteredEvents.length > 0 && !selectedEventId) {
      setSelectedEventId(filteredEvents[0].id);
    }
  }, [filteredEvents, selectedEventId]);

  const selectedEvent = useMemo(() => {
    return normalizedEvents.find((evt) => evt.id === selectedEventId) || null;
  }, [normalizedEvents, selectedEventId]);

  // Handle Event Selection
  const handleSelectEvent = useCallback((event: TimelineEventItem) => {
    setSelectedEventId(event.id);
    // On mobile screens, open the drawer
    if (window.innerWidth < 1024) {
      setIsMobileDrawerOpen(true);
    }
  }, []);

  // Keyboard navigation: Arrow Up / Down, Enter, Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!filteredEvents.length) return;

      const currentIndex = filteredEvents.findIndex((evt) => evt.id === selectedEventId);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = currentIndex < filteredEvents.length - 1 ? currentIndex + 1 : 0;
        setSelectedEventId(filteredEvents[nextIndex].id);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredEvents.length - 1;
        setSelectedEventId(filteredEvents[prevIndex].id);
      } else if (e.key === 'Escape') {
        setIsMobileDrawerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredEvents, selectedEventId]);

  // Real-Time SSE Listener for incident events
  useEffect(() => {
    if (!incident) return;
    const incId = incident.incidentNumber || incident.id || incident._id;
    if (!incId) return;

    let eventSource: EventSource | null = null;
    try {
      // Connect to CivicPulse real-time SSE stream using configured base or proxied route
      const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/api$/, '');
      const sseUrl = apiBase ? `${apiBase}/api/incidents/events` : '/api/incidents/events';
      eventSource = new EventSource(sseUrl);

      eventSource.onmessage = (e) => {
        try {
          if (!e.data || e.data.startsWith(':')) return; // keepalive or ping
          const payload = JSON.parse(e.data);
          const payloadIncId =
            payload.incident?.incidentNumber ||
            payload.incident?.id ||
            payload.incident?._id;

          if (payloadIncId && (payloadIncId === incId || payloadIncId.toString() === incId.toString())) {
            setLastUpdatedText('Updated just now');
            if (onRefresh) {
              onRefresh();
            }
          }
        } catch {
          // ignore parsing error
        }
      };

      eventSource.onerror = () => {
        // SSE disconnected or 404; close cleanly and gracefully switch to static mode
        setIsLiveActive(false);
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
      };
    } catch {
      setIsLiveActive(false);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [incident, onRefresh]);

  const teamName = incident?.assignedTeamId?.name || incident?.teamId?.name || 'Road Maintenance Team';
  const departmentName = incident?.departmentId?.name || incident?.assignedDepartment || 'Transport & Roads';

  return (
    <div className={cn('space-y-6', className)}>
      {/* 1. TOP INCIDENT LIFECYCLE RAIL */}
      <IncidentLifecycleRail
        status={incident?.status || 'SUBMITTED'}
        reopenCount={incident?.reopenCount || 0}
        incident={incident}
        timeline={timeline}
      />

      {/* 2. MAIN JOURNEY WORKSPACE CARD */}
      <div className="bg-white rounded-2xl border border-[#E3EAE6] p-5 sm:p-6 shadow-xs space-y-5">
        {/* Header with live indicator & count ticker */}
        <IncidentJourneyHeader
          eventCount={normalizedEvents.length}
          isLive={isLiveActive}
          lastUpdatedText={lastUpdatedText}
          onRefresh={onRefresh}
        />

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <TimelineFilters
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter}
            counts={filterCounts}
          />
          <span className="text-xs text-[#829AB1] font-sans">
            Showing {filteredEvents.length} of {normalizedEvents.length} records
          </span>
        </div>

        {/* 3. TWO-COLUMN INTERACTIVE TIMELINE WORKSPACE */}
        {isLoading ? (
          <TimelineSkeleton />
        ) : normalizedEvents.length === 0 ? (
          /* Empty State */
          <div className="py-16 text-center space-y-3 bg-[#FAF8F5] rounded-2xl border border-dashed border-[#E3EAE6]">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#E3EAE6] flex items-center justify-center text-[#159A68] mx-auto shadow-2xs">
              <Clock className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-sm font-bold font-heading text-[#102A43]">
              No operational events yet
            </h3>
            <p className="text-xs text-[#6B7C8F] max-w-md mx-auto leading-relaxed">
              Your incident journey will appear here in real time as CivicPulse processes the report,
              dispatches municipal crews, and verifies resolution.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
            {/* LEFT: Interactive Event Timeline (~62% width, 7 or 8 cols) */}
            <div className="lg:col-span-7 xl:col-span-7 space-y-1">
              {filteredEvents.length === 0 ? (
                <div className="p-8 text-center bg-[#FAF8F5] rounded-xl border border-[#E3EAE6] text-xs text-[#829AB1]">
                  No operational events matching the "{currentFilter}" filter.
                </div>
              ) : (
                <div className="max-h-[640px] overflow-y-auto pr-2 relative no-scrollbar">
                  {filteredEvents.map((evt, idx) => (
                    <TimelineEventCard
                      key={evt.id}
                      event={evt}
                      index={idx}
                      isSelected={evt.id === selectedEventId}
                      onSelect={handleSelectEvent}
                      teamName={teamName}
                      departmentName={departmentName}
                      isLatest={idx === 0}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Desktop Event Inspector Panel (~38% width, 5 cols) */}
            <div className="hidden lg:block lg:col-span-5 xl:col-span-5 sticky top-4 h-[640px]">
              <EventInspector
                selectedEvent={selectedEvent}
                agentExecutions={agentExecutions}
                incident={incident}
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. MOBILE SLIDE-OVER DRAWER (For small screens) */}
      <Drawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        title="Event Details & Decision Trace"
        side="right"
      >
        <div className="h-full -m-6 p-4">
          <EventInspector
            selectedEvent={selectedEvent}
            onClose={() => setIsMobileDrawerOpen(false)}
            agentExecutions={agentExecutions}
            incident={incident}
            isMobileDrawer={true}
          />
        </div>
      </Drawer>
    </div>
  );
}
