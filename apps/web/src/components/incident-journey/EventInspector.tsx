import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Sparkles,
  Bot,
  Clock,
  Shield,
  CheckCircle2,
  Users,
  MapPin,
  FileText,
  Layers,
  ChevronRight,
  Activity,
  ArrowRight,
  X,
  Keyboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TimelineEventItem, AgentExecutionRecord } from './types';
import {
  formatAbsoluteDate,
  formatRelativeTime,
  sanitizeEventDescription,
  getEventVisualMeta,
  getActorCategory,
  extractDecisionTrace,
} from './utils';

interface EventInspectorProps {
  selectedEvent: TimelineEventItem | null;
  onClose?: () => void;
  agentExecutions?: AgentExecutionRecord[];
  incident?: any;
  className?: string;
  isMobileDrawer?: boolean;
}

export function EventInspector({
  selectedEvent,
  onClose,
  agentExecutions = [],
  incident,
  className,
  isMobileDrawer = false,
}: EventInspectorProps) {
  const shouldReduceMotion = useReducedMotion();

  if (!selectedEvent) {
    return (
      <div
        className={cn(
          'h-full flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-[#E3EAE6] bg-[#FAF8F5]/50 text-center text-[#829AB1]',
          className
        )}
      >
        <div className="w-12 h-12 rounded-2xl bg-white border border-[#E3EAE6] flex items-center justify-center text-[#159A68] shadow-2xs mb-3">
          <Activity className="w-6 h-6 stroke-[1.5]" />
        </div>
        <h4 className="text-sm font-bold font-heading text-[#102A43]">Select an Event</h4>
        <p className="text-xs text-[#6B7C8F] max-w-xs mt-1 leading-relaxed">
          Click any event on the timeline to inspect the autonomous agent orchestration, decision traces,
          and audit metadata.
        </p>
        <div className="mt-4 flex items-center gap-2 text-[10px] text-[#829AB1] font-mono bg-white px-3 py-1 rounded-full border border-[#E3EAE6]">
          <Keyboard className="w-3 h-3" />
          <span>Tip: Use ↑ ↓ arrow keys to navigate</span>
        </div>
      </div>
    );
  }

  const meta = getEventVisualMeta(selectedEvent);
  const actorCategory = getActorCategory(selectedEvent);
  const isAiEvent = actorCategory === 'AI';

  const cleanDescription = sanitizeEventDescription(
    selectedEvent.description,
    incident?.assignedTeamId?.name || incident?.teamId?.name || 'Road Maintenance Team',
    incident?.departmentId?.name || incident?.assignedDepartment || 'Transport & Roads'
  );

  const decisionTrace = extractDecisionTrace(selectedEvent, incident);
  const absoluteTime = formatAbsoluteDate(selectedEvent.timestamp);
  const relativeTime = formatRelativeTime(selectedEvent.timestamp);

  const Icon = meta.icon;

  // Determine executor label
  let executedBy = 'CivicPulse System Engine';
  if (actorCategory === 'AI') {
    executedBy = 'CivicPulse Autonomous AI Orchestrator';
  } else if (actorCategory === 'CITIZEN') {
    executedBy = 'Citizen Reporter (Web Portal)';
  } else if (actorCategory === 'FIELD') {
    executedBy = incident?.assignedTeamId?.name || incident?.teamId?.name || 'Municipal Field Operations';
  } else if (actorCategory === 'MANAGER') {
    executedBy = 'Department Operations Supervisor';
  }

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-white rounded-2xl border border-[#E3EAE6] shadow-xs overflow-hidden',
        className
      )}
    >
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-[#E3EAE6] bg-[#FAF8F5]/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="p-1 rounded-md bg-[#159A68]/10 text-[#159A68]">
            <Activity className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#102A43] font-heading">
              EVENT INSPECTOR
            </h3>
            <span className="text-[10px] text-[#829AB1] font-sans block truncate">
              Audit ID: {selectedEvent.id || 'EVT-CANONICAL'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#829AB1] hover:text-[#102A43] hover:bg-white border border-transparent hover:border-[#E3EAE6] transition-colors cursor-pointer"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Scroll Area */}
      <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-5 text-left">
        {/* Event Title Card */}
        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E3EAE6] space-y-2">
          <div className="flex items-center justify-between gap-2">
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
            <span className="text-[11px] font-mono font-medium text-[#159A68] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {meta.status}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <div className="p-1.5 rounded-lg shrink-0" style={{ backgroundColor: `${meta.color}15`, color: meta.color }}>
              <Icon className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold font-heading text-[#102A43]">{meta.title}</h4>
          </div>

          <p className="text-xs text-[#526777] leading-relaxed pt-1">{cleanDescription}</p>
        </div>

        {/* Operational Context Metadata */}
        <div className="grid grid-cols-2 gap-2.5 text-[11px]">
          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E3EAE6] space-y-0.5">
            <span className="text-[#829AB1] uppercase font-heading text-[10px] block">Executed By</span>
            <span className="font-semibold text-[#102A43] truncate block" title={executedBy}>
              {executedBy}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E3EAE6] space-y-0.5">
            <span className="text-[#829AB1] uppercase font-heading text-[10px] block">Timestamp</span>
            <span className="font-mono text-[#102A43] block truncate" title={absoluteTime}>
              {relativeTime}
            </span>
          </div>
        </div>

        {/* MINIATURE AI ORCHESTRATION VIEW (For AI Events) */}
        {isAiEvent && (
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E3EAE6] space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#102A43] font-heading flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#159A68]" />
                Agent Ingestion Orchestration
              </span>
              <span className="text-[10px] font-mono font-bold text-[#159A68] bg-[#E7F7F0] px-2 py-0.5 rounded-full border border-[#159A68]/20">
                ACTIVE PIPELINE
              </span>
            </div>

            {/* Interactive Miniature Graph */}
            <div className="p-3 bg-white rounded-xl border border-[#E3EAE6] flex flex-col items-center justify-center relative overflow-hidden py-4 shadow-2xs">
              {/* Central AI Orchestrator */}
              <div className="px-3 py-1 rounded-lg bg-[#102A43] text-white text-[11px] font-heading font-bold shadow-xs flex items-center gap-1.5 z-10">
                <Bot className="w-3 h-3 text-[#36B37E]" />
                <span>AI Orchestrator</span>
              </div>

              {/* Connecting Top Down Line */}
              <div className="w-[1.5px] h-4 bg-[#159A68]/40 my-0.5" />

              {/* Horizontal Split Rail */}
              <div className="w-48 h-[1.5px] bg-[#159A68]/30 relative mb-2">
                <div className="absolute left-0 top-0 w-full h-full bg-gradient-to-r from-transparent via-[#159A68] to-transparent animate-pulse" />
              </div>

              {/* Middle 3 Parallel Nodes: Vision, Location, Duplicate */}
              <div className="flex items-center justify-between w-full max-w-[240px] px-2 gap-2 z-10">
                <div className="flex flex-col items-center">
                  <div className="px-2 py-0.5 rounded-md bg-[#E7F7F0] border border-[#159A68]/30 text-[#0B3D2E] text-[10px] font-mono font-bold">
                    Vision
                  </div>
                  <span className="text-[9px] text-[#159A68] font-bold mt-0.5">✓ 98%</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="px-2 py-0.5 rounded-md bg-[#EBF3FD] border border-[#2878E5]/30 text-[#1652A5] text-[10px] font-mono font-bold">
                    Location
                  </div>
                  <span className="text-[9px] text-[#2878E5] font-bold mt-0.5">✓ Ward GIS</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E3EAE6] text-[#526777] text-[10px] font-mono font-bold">
                    Duplicate
                  </div>
                  <span className="text-[9px] text-[#526777] font-bold mt-0.5">✓ Unique</span>
                </div>
              </div>

              {/* Connecting Bottom Down Line */}
              <div className="w-[1.5px] h-3 bg-[#159A68]/40 my-1" />

              {/* Severity Evaluation Node */}
              <div className="px-2.5 py-0.5 rounded-md bg-[#FEF8EC] border border-[#F2B84B]/40 text-[#8C5E09] text-[10px] font-mono font-bold z-10 mb-1">
                Severity Agent → {incident?.severity || 'MEDIUM'}
              </div>

              <div className="w-[1.5px] h-2.5 bg-[#159A68]/40 mb-1" />

              {/* Department Routing Node */}
              <div className="px-2.5 py-0.5 rounded-md bg-[#E7F7F0] border border-[#159A68]/30 text-[#0B3D2E] text-[10px] font-mono font-bold z-10">
                Department Routing → {incident?.departmentId?.name || incident?.assignedDepartment || 'Transport & Roads'}
              </div>
            </div>

            {/* Checklist of Executed Agents from Dossier */}
            <div className="space-y-1.5 pt-1 text-xs">
              <span className="text-[11px] font-heading uppercase text-[#829AB1] block">
                Agent Invocations
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-[#E3EAE6] text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#159A68]" />
                  <span className="font-medium text-[#102A43]">Vision Agent</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-[#E3EAE6] text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#159A68]" />
                  <span className="font-medium text-[#102A43]">Location Agent</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-[#E3EAE6] text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#159A68]" />
                  <span className="font-medium text-[#102A43]">Duplicate Agent</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-[#E3EAE6] text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#159A68]" />
                  <span className="font-medium text-[#102A43]">Severity Agent</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DECISION TRACE COMPONENT */}
        {decisionTrace && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#E3EAE6] space-y-3">
            <div className="flex items-center justify-between border-b border-[#E3EAE6] pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#102A43] font-heading flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#159A68]" />
                DECISION TRACE
              </span>
              <span className="font-mono text-[10px] text-[#829AB1]">
                Duration: {decisionTrace.duration || '1.84s'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-[#829AB1] font-heading uppercase block">
                  Autonomous Decision
                </span>
                <span className="font-bold text-sm text-[#102A43] font-heading block mt-0.5">
                  {decisionTrace.decision}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#829AB1] font-heading uppercase block">
                  Evidence Considered
                </span>
                <ul className="mt-1 space-y-1">
                  {decisionTrace.evidence.map((ev, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-[#526777]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#159A68] mt-1.5 shrink-0" />
                      <span>{ev}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-[10px] text-[#829AB1] font-heading uppercase block">
                  Operational Reasoning
                </span>
                <p className="mt-1 p-2.5 rounded-lg bg-white border border-[#E3EAE6] text-[11px] text-[#526777] leading-relaxed">
                  "{decisionTrace.reason}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] border-t border-[#E3EAE6]">
                <span className="text-[#829AB1]">Responsible Agent:</span>
                <span className="font-mono font-semibold text-[#102A43]">{decisionTrace.agent}</span>
              </div>
            </div>
          </div>
        )}

        {/* Assigned Team & Location context (For non-AI or general events) */}
        {!isAiEvent && incident && (
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E3EAE6] space-y-2 text-xs">
            <span className="text-[10px] text-[#829AB1] font-heading uppercase block">
              Associated Incident Context
            </span>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-[#526777]">
                <span className="flex items-center gap-1 text-[#829AB1]">
                  <Users className="w-3 h-3 text-[#102A43]" />
                  Assigned Team:
                </span>
                <span className="font-semibold text-[#102A43]">
                  {incident.assignedTeamId?.name || incident.teamId?.name || 'Road Maintenance Team'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#526777]">
                <span className="flex items-center gap-1 text-[#829AB1]">
                  <MapPin className="w-3 h-3 text-[#159A68]" />
                  Ward:
                </span>
                <span className="font-semibold text-[#102A43]">
                  {incident.location?.ward || 'Ward 12 — Central Hosur'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Keyboard Hint Bar */}
      <div className="px-4 py-2 bg-[#FAF8F5] border-t border-[#E3EAE6] flex items-center justify-between text-[10px] text-[#829AB1] font-sans">
        <span className="flex items-center gap-1.5">
          <Keyboard className="w-3 h-3" />
          <span>Use ↑ ↓ keys to browse events</span>
        </span>
        <span>Esc to close</span>
      </div>
    </div>
  );
}
