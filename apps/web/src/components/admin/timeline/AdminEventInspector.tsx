import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuBot,
  LuSparkles,
  LuClock,
  LuCircleCheck,
  LuShield,
  LuX,
  LuTerminal,
  LuCpu,
  LuLayers,
  LuArrowDown,
  LuActivity,
  LuCamera,
  LuMapPin,
  LuWrench,
  LuGitCommitVertical,
} from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { AdminTimelineEvent } from './adminTimelineTypes';
import { formatAbsoluteDate, formatRelativeTime } from './adminTimelineUtils';

interface AdminEventInspectorProps {
  selectedEvent: AdminTimelineEvent | null;
  onClose?: () => void;
  incident?: any;
  className?: string;
}

export function AdminEventInspector({
  selectedEvent,
  onClose,
  incident,
  className,
}: AdminEventInspectorProps) {
  if (!selectedEvent) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-[rgba(148,163,184,0.15)] bg-[#0D1A2B]/60 text-center text-[#64748B] min-h-[380px]',
          className
        )}
      >
        <div className="w-12 h-12 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.12)] flex items-center justify-center text-[#5B5BF7] mb-3 shadow-xs">
          <LuActivity className="w-6 h-6 stroke-[1.8]" />
        </div>
        <h4 className="text-sm font-bold font-heading text-[#F8FAFC]">
          Select an Event to Inspect
        </h4>
        <p className="text-xs text-[#94A3B8] max-w-xs mt-1.5 leading-relaxed">
          Click any operational milestone or agent execution in the timeline to inspect decision traces,
          tool invocations, and forensic audit metadata.
        </p>
      </div>
    );
  }

  const isAiEvent = selectedEvent.category === 'AI' || selectedEvent.category === 'VERIFICATION';
  const absoluteTime = formatAbsoluteDate(selectedEvent.timestamp);
  const relativeTime = formatRelativeTime(selectedEvent.timestamp);

  return (
    <div
      className={cn(
        'flex flex-col bg-[#0D1A2B] rounded-xl border border-[rgba(148,163,184,0.15)] overflow-hidden shadow-lg',
        className
      )}
    >
      {/* 1. Header */}
      <div className="p-4 sm:p-5 border-b border-[rgba(148,163,184,0.12)] bg-[#101F33]/80 flex items-start justify-between gap-3 shrink-0">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-[#5B5BF7]/15 text-[#5B5BF7]">
              <LuShield className="w-3.5 h-3.5" />
            </span>
            <span className="text-[10.5px] font-mono uppercase tracking-wider text-[#94A3B8] font-bold">
              EVENT INSPECTOR
            </span>
            <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-[#13243A] text-[#38BDF8] border border-[rgba(56,189,248,0.2)]">
              {selectedEvent.status}
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC] font-sans truncate">
            {selectedEvent.title}
          </h3>

          <div className="flex items-center gap-2 pt-0.5 flex-wrap">
            <span
              className={cn(
                'text-[10px] font-mono font-semibold px-2 py-0.5 rounded border uppercase',
                isAiEvent
                  ? 'bg-[#818CF8]/10 text-[#818CF8] border-[#818CF8]/25'
                  : 'bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/25'
              )}
            >
              {selectedEvent.category} EVENT
            </span>
            <span className="text-[10px] font-mono text-[#94A3B8]">
              {selectedEvent.actorId || selectedEvent.actorName}
            </span>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#13243A] border border-transparent hover:border-[rgba(148,163,184,0.15)] transition-colors cursor-pointer"
            title="Close inspector"
          >
            <LuX className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. Scrollable Body Content */}
      <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-left max-h-[calc(100vh-280px)]">
        {/* WHAT HAPPENED */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase font-bold text-[#64748B] tracking-wider block">
            WHAT HAPPENED
          </span>
          <p className="text-xs text-[#CBD5E1] leading-relaxed p-3 rounded-lg bg-[#101F33] border border-[rgba(148,163,184,0.1)]">
            {selectedEvent.description}
          </p>
        </div>

        {/* EXECUTED BY & TIMESTAMP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="p-3 rounded-lg bg-[#101F33] border border-[rgba(148,163,184,0.1)] space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-[#64748B] block">
              EXECUTED BY
            </span>
            <span className="font-semibold text-xs text-[#F8FAFC] block truncate">
              {selectedEvent.actorName}
            </span>
            <span className="text-[10.5px] font-mono text-[#94A3B8] block truncate">
              ID: {selectedEvent.actorId || 'SYSTEM_DEFAULT'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#101F33] border border-[rgba(148,163,184,0.1)] space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-[#64748B] block">
              TIMESTAMP
            </span>
            <span className="font-mono text-xs text-[#F8FAFC] block truncate">
              {absoluteTime}
            </span>
            <span className="text-[10.5px] font-mono text-[#38BDF8] block">
              {relativeTime}
            </span>
          </div>
        </div>

        {/* DECISION TRACE VISUALIZATION */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold text-[#64748B] tracking-wider flex items-center gap-1.5">
              <LuGitCommitVertical className="w-3.5 h-3.5 text-[#5B5BF7]" />
              DECISION TRACE
            </span>
            {selectedEvent.durationMs && (
              <span className="text-[10px] font-mono text-[#94A3B8]">
                {selectedEvent.durationMs}ms duration
              </span>
            )}
          </div>

          {/* Connected Node Visualization */}
          <div className="p-3.5 rounded-lg bg-[#101F33] border border-[rgba(148,163,184,0.1)] space-y-3">
            {selectedEvent.decisionTraceNodes && selectedEvent.decisionTraceNodes.length > 0 ? (
              <div className="space-y-2 relative pl-3 border-l-2 border-[#1E324E]">
                {selectedEvent.decisionTraceNodes.map((node, nIdx) => (
                  <div key={nIdx} className="relative pb-2 last:pb-0">
                    {/* Node bullet */}
                    <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-[#5B5BF7] ring-4 ring-[#101F33]" />

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#38BDF8]">
                        {node.step}
                      </span>
                      <span className="text-xs font-semibold text-[#F8FAFC]">
                        {node.label}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-relaxed font-mono">
                      {node.detail}
                    </p>
                    {node.subdetail && (
                      <p className="text-[10.5px] text-[#64748B] mt-0.5 italic">
                        "{node.subdetail}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-[#94A3B8] space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#64748B]">State Transition:</span>
                  <span className="font-mono text-[#F8FAFC]">{selectedEvent.type}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#64748B]">Resolution Action:</span>
                  <span className="font-mono text-[#38BDF8]">{selectedEvent.resultText || 'State confirmed'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* EVIDENCE CONSIDERED */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase font-bold text-[#64748B] tracking-wider block">
            EVIDENCE CONSIDERED
          </span>
          <div className="p-3 rounded-lg bg-[#101F33] border border-[rgba(148,163,184,0.1)] space-y-1.5">
            {selectedEvent.evidenceConsidered && selectedEvent.evidenceConsidered.length > 0 ? (
              selectedEvent.evidenceConsidered.map((ev, eIdx) => (
                <div key={eIdx} className="flex items-center gap-2 text-xs text-[#CBD5E1]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] shrink-0" />
                  <span className="font-mono text-[11px]">{ev}</span>
                </div>
              ))
            ) : (
              <span className="text-xs text-[#64748B] italic">
                Standard municipal dispatch telemetry verified.
              </span>
            )}
          </div>
        </div>

        {/* TOOLS USED */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase font-bold text-[#64748B] tracking-wider block">
            TOOLS USED
          </span>
          <div className="p-3 rounded-lg bg-[#101F33] border border-[rgba(148,163,184,0.1)]">
            {selectedEvent.toolsCalled && selectedEvent.toolsCalled.length > 0 ? (
              <div className="space-y-2">
                {selectedEvent.toolsCalled.map((tool, tIdx) => (
                  <div
                    key={tIdx}
                    className="p-2 rounded bg-[#0A1320] border border-[rgba(148,163,184,0.1)] flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <LuTerminal className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                      <span className="font-mono text-xs text-[#22C55E] truncate">
                        {tool.toolName}()
                      </span>
                    </div>
                    {tool.durationMs !== undefined && (
                      <span className="text-[10px] font-mono text-[#64748B] shrink-0">
                        {tool.durationMs}ms
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : selectedEvent.toolsUsedList && selectedEvent.toolsUsedList.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {selectedEvent.toolsUsedList.map((toolName, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-2 py-1 rounded bg-[#0A1320] text-[#22C55E] font-mono text-[11px] border border-[#22C55E]/20"
                  >
                    {toolName}()
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-[#64748B] italic block">
                Direct lifecycle state mutation; no external tool registry call required.
              </span>
            )}
          </div>
        </div>

        {/* EXECUTION METADATA */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase font-bold text-[#64748B] tracking-wider block">
            EXECUTION METADATA
          </span>
          <div className="p-3 rounded-lg bg-[#101F33] border border-[rgba(148,163,184,0.1)] grid grid-cols-2 gap-2.5 text-[11px]">
            <div>
              <span className="text-[#64748B] block text-[10px] font-mono uppercase">Execution ID</span>
              <span className="font-mono text-[#CBD5E1] truncate block" title={selectedEvent.executionId || selectedEvent.id}>
                {selectedEvent.executionId || selectedEvent.id}
              </span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px] font-mono uppercase">Duration</span>
              <span className="font-mono text-[#CBD5E1] block">
                {selectedEvent.durationMs ? `${selectedEvent.durationMs} ms` : 'Instantaneous'}
              </span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px] font-mono uppercase">Model / Engine</span>
              <span className="font-mono text-[#CBD5E1] block truncate">
                {selectedEvent.modelUsed || 'autonomous-rules-v2'}
              </span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px] font-mono uppercase">Execution Mode</span>
              <span className="font-mono text-[#38BDF8] block">
                {selectedEvent.executionMode || 'DETERMINISTIC'}
              </span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px] font-mono uppercase">Worker Host</span>
              <span className="font-mono text-[#CBD5E1] block">
                civicpulse-worker-01
              </span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px] font-mono uppercase">Trace Status</span>
              <span className="font-mono text-[#22C55E] block">
                VERIFIED_IMMUTABLE
              </span>
            </div>
          </div>
        </div>

        {/* RESULT */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase font-bold text-[#64748B] tracking-wider block">
            RESULT
          </span>
          <div className="p-3 rounded-lg bg-[#132A26] border border-[#22C55E]/30 text-xs text-[#22C55E] font-medium flex items-start gap-2">
            <LuCircleCheck className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {selectedEvent.resultText || selectedEvent.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
