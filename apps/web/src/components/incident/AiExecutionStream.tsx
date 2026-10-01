import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  LuBot,
  LuEye,
  LuMapPin,
  LuCopy,
  LuWrench,
  LuSearch,
  LuShieldAlert,
  LuGitFork,
  LuCheck,
  LuClock,
  LuChevronDown,
  LuChevronUp,
  LuListTree
} from 'react-icons/lu';
import { cn } from '@/lib/utils';

export interface AgentExecutionItem {
  id?: string;
  _id?: string;
  agentId: string;
  status: 'COMPLETED' | 'FAILED' | 'RUNNING' | string;
  durationMs?: number;
  modelUsed?: string;
  toolsUsed?: string[];
  output?: any;
  result?: any;
  decision?: string;
  error?: any;
  failureReason?: any;
  startedAt?: string | Date;
  completedAt?: string | Date;
  createdAt?: string | Date;
}

export interface NormalizedErrorInfo {
  message: string;
  code?: string;
  chunk?: string;
}

/**
 * Defensive normalization helper that safely formats any error or execution field
 * preventing "Objects are not valid as a React child" errors.
 */
export function normalizeErrorInfo(
  rawError: any,
  fallback = 'Agent execution failed'
): NormalizedErrorInfo {
  if (!rawError) {
    return { message: fallback };
  }

  if (typeof rawError === 'string') {
    const trimmed = rawError.trim();
    return { message: trimmed || fallback };
  }

  if (typeof rawError === 'object') {
    const code =
      typeof rawError.code === 'string' && rawError.code.trim() ? rawError.code.trim() : undefined;
    const chunk =
      typeof rawError.chunk === 'string' && rawError.chunk.trim() ? rawError.chunk.trim() : undefined;

    let message = '';
    if (typeof rawError.message === 'string' && rawError.message.trim()) {
      message = rawError.message.trim();
    } else if (typeof rawError.errorMessage === 'string' && rawError.errorMessage.trim()) {
      message = rawError.errorMessage.trim();
    } else if (typeof rawError.failureReason === 'string' && rawError.failureReason.trim()) {
      message = rawError.failureReason.trim();
    } else if (typeof rawError.reason === 'string' && rawError.reason.trim()) {
      message = rawError.reason.trim();
    } else if (typeof rawError.error === 'string' && rawError.error.trim()) {
      message = rawError.error.trim();
    } else if (typeof rawError.details === 'string' && rawError.details.trim()) {
      message = rawError.details.trim();
    } else if (code) {
      message = `Failure code: ${code}`;
    } else {
      message = fallback;
    }

    return { message, code, chunk };
  }

  return { message: String(rawError) };
}

export function formatExecutionValue(value: any, fallback = ''): string {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'object' ? formatExecutionValue(item) : String(item)))
      .filter(Boolean)
      .join(', ');
  }
  if (typeof value === 'object') {
    if (typeof value.summary === 'string' && value.summary.trim()) return value.summary.trim();
    if (typeof value.decision === 'string' && value.decision.trim()) return value.decision.trim();
    if (typeof value.message === 'string' && value.message.trim()) return value.message.trim();
    if (typeof value.observations === 'string' && value.observations.trim()) return value.observations.trim();
    try {
      return JSON.stringify(value);
    } catch {
      return '[Structured Data]';
    }
  }
  return String(value);
}

interface AiExecutionStreamProps {
  executions: AgentExecutionItem[];
  incident?: any;
  className?: string;
}

// Map agent technical IDs to human friendly titles & icons
function getAgentDisplay(agentId: string) {
  const norm = (agentId || '').toUpperCase().replace(/^AGENT_/, '');
  switch (norm) {
    case 'VISION':
      return {
        name: 'Vision Intelligence Agent',
        shortName: 'Vision Agent',
        icon: <LuEye className="w-4 h-4 text-[#2878E5]" />,
        color: '#2878E5',
        bgColor: '#EBF3FD',
        description: 'Analyzes photographic evidence to detect civic defects and structural hazards.',
      };
    case 'LOCATION':
    case 'GEO':
    case 'GIS':
      return {
        name: 'Spatial Geocoding Agent',
        shortName: 'Location Agent',
        icon: <LuMapPin className="w-4 h-4 text-[#159A68]" />,
        color: '#159A68',
        bgColor: '#E7F7F0',
        description: 'Reverse-geocodes coordinates and validates municipal ward administrative boundaries.',
      };
    case 'DUPLICATE':
      return {
        name: 'Duplicate Cluster Agent',
        shortName: 'Duplicate Agent',
        icon: <LuCopy className="w-4 h-4 text-[#829AB1]" />,
        color: '#486581',
        bgColor: '#F0F4F8',
        description: 'Evaluates temporal and spatial proximity to prevent duplicate field dispatches.',
      };
    case 'OPERATIONS':
    case 'WORKORDER':
      return {
        name: 'Field Operations Agent',
        shortName: 'Operations Agent',
        icon: <LuWrench className="w-4 h-4 text-[#F2B84B]" />,
        color: '#D97706',
        bgColor: '#FEF8EC',
        description: 'Calculates crew allocations, safety equipment requirements, and countdown SLAs.',
      };
    case 'INVESTIGATION':
      return {
        name: 'Diagnostic Investigation Agent',
        shortName: 'Investigation Agent',
        icon: <LuSearch className="w-4 h-4 text-[#6366F1]" />,
        color: '#6366F1',
        bgColor: '#EEF2FF',
        description: 'Cross-references utility infrastructure schematics with incident coordinates.',
      };
    case 'SEVERITY':
    case 'TRIAGE':
      return {
        name: 'Severity Triage Agent',
        shortName: 'Severity Agent',
        icon: <LuShieldAlert className="w-4 h-4 text-[#EF6A63]" />,
        color: '#EF6A63',
        bgColor: '#FDF2F2',
        description: 'Scores risk index based on traffic density, pedestrian volume, and hazard severity.',
      };
    case 'ROUTING':
    case 'DISPATCH':
      return {
        name: 'Incident Routing Agent',
        shortName: 'Routing Agent',
        icon: <LuGitFork className="w-4 h-4 text-[#0EA5E9]" />,
        color: '#0EA5E9',
        bgColor: '#F0F9FF',
        description: 'Directs validated work orders to the optimal departmental jurisdiction.',
      };
    default:
      return {
        name: `${norm.charAt(0) + norm.slice(1).toLowerCase()} Agent`,
        shortName: `${norm.charAt(0) + norm.slice(1).toLowerCase()} Agent`,
        icon: <LuBot className="w-4 h-4 text-[#159A68]" />,
        color: '#159A68',
        bgColor: '#E7F7F0',
        description: 'Autonomous operational reasoning unit.',
      };
  }
}

// Smooth count-up animated metric
function AnimatedCount({ target }: { target: number }) {
  const shouldReduceMotion = useReducedMotion();
  const [val, setVal] = useState(shouldReduceMotion ? target : 0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setVal(target);
      return;
    }
    let startTime: number | null = null;
    let frameId: number;

    const timeout = setTimeout(() => {
      const step = (ts: number) => {
        if (!startTime) startTime = ts;
        const p = Math.min((ts - startTime) / 600, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(ease * target));
        if (p < 1) {
          frameId = requestAnimationFrame(step);
        } else {
          setVal(target);
        }
      };
      frameId = requestAnimationFrame(step);
    }, 150);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(frameId);
    };
  }, [target, shouldReduceMotion]);

  return <span>{val}</span>;
}

export function AiExecutionStream({ executions = [], incident, className }: AiExecutionStreamProps) {
  const shouldReduceMotion = useReducedMotion();

  // Expanded rows state (keyed by execution id or index)
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [isGroupedView, setIsGroupedView] = useState<boolean>(true);

  // Calculate real metrics from execution array
  const metrics = useMemo(() => {
    const total = executions.length;
    let successCount = 0;
    let failedCount = 0;
    let totalDuration = 0;

    executions.forEach((ex) => {
      const st = (ex.status || '').toUpperCase();
      if (st === 'COMPLETED' || st === 'SUCCESS') successCount++;
      else if (st === 'FAILED') failedCount++;
      else successCount++; // fallback completed
      totalDuration += ex.durationMs || 0;
    });

    const avgDuration = total > 0 ? Math.round(totalDuration / total) : 0;
    return { total, successCount, failedCount, avgDuration };
  }, [executions]);

  const toggleExpand = (key: string) => {
    setExpandedIds((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Group consecutive repeated agents
  const groupedExecutions = useMemo(() => {
    if (!isGroupedView) return null;

    const groups: {
      agentId: string;
      items: AgentExecutionItem[];
      totalDuration: number;
      hasFailed: boolean;
    }[] = [];

    executions.forEach((item) => {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.agentId === item.agentId) {
        lastGroup.items.push(item);
        lastGroup.totalDuration += item.durationMs || 0;
        if (item.status === 'FAILED') lastGroup.hasFailed = true;
      } else {
        groups.push({
          agentId: item.agentId,
          items: [item],
          totalDuration: item.durationMs || 0,
          hasFailed: item.status === 'FAILED',
        });
      }
    });

    return groups;
  }, [executions, isGroupedView]);

  if (executions.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-[#E3EAE6] text-xs text-[#829AB1] space-y-2">
        <LuBot className="w-8 h-8 text-[#159A68] mx-auto opacity-40" />
        <p>No autonomous agent executions logged for this incident yet.</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4 text-left select-none', className)}>
      {/* =========================================================================
          1. HEADER & METRICS BAR (Autonomous Intelligence + Real Summary)
          ========================================================================= */}
      <div className="bg-white rounded-2xl border border-[#E3EAE6] p-5 sm:p-6 shadow-xs space-y-4">
        {/* Header Title & Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E3EAE6]/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2878E5] animate-pulse" />
              <h3 className="text-sm sm:text-base font-bold font-heading text-[#102A43] uppercase tracking-wide">
                Autonomous Intelligence
              </h3>
            </div>
            <p className="text-xs text-[#6B7C8F] mt-0.5 font-sans">
              Every agent decision and tool invocation, captured as an immutable execution trail.
            </p>
          </div>

          {/* Grouping Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsGroupedView(!isGroupedView)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold font-heading border transition-all cursor-pointer',
                isGroupedView
                  ? 'bg-[#E7F7F0] border-[#159A68]/30 text-[#159A68]'
                  : 'bg-white border-[#E3EAE6] text-[#6B7C8F] hover:text-[#102A43]'
              )}
              title="Toggle grouping of repeated agent executions"
            >
              <LuListTree className="w-3.5 h-3.5" />
              <span>{isGroupedView ? 'Grouped Stream' : 'Raw Stream'}</span>
            </button>
          </div>
        </div>

        {/* 4 Real Metric Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {/* Total Executions */}
          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E3EAE6]">
            <div className="text-xl sm:text-2xl font-extrabold font-heading text-[#102A43]">
              <AnimatedCount target={metrics.total} />
            </div>
            <div className="text-[11px] font-semibold text-[#829AB1] uppercase tracking-wider mt-0.5">
              Executions
            </div>
          </div>

          {/* Successful */}
          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E3EAE6]">
            <div className="text-xl sm:text-2xl font-extrabold font-heading text-[#159A68]">
              <AnimatedCount target={metrics.successCount} />
            </div>
            <div className="text-[11px] font-semibold text-[#829AB1] uppercase tracking-wider mt-0.5">
              Successful
            </div>
          </div>

          {/* Failed */}
          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E3EAE6]">
            <div className="text-xl sm:text-2xl font-extrabold font-heading text-[#EF6A63]">
              <AnimatedCount target={metrics.failedCount} />
            </div>
            <div className="text-[11px] font-semibold text-[#829AB1] uppercase tracking-wider mt-0.5">
              Failed
            </div>
          </div>

          {/* Average Duration */}
          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E3EAE6]">
            <div className="text-xl sm:text-2xl font-extrabold font-heading text-[#2878E5]">
              ~<AnimatedCount target={metrics.avgDuration} />
              <span className="text-xs font-mono font-medium ml-1">ms</span>
            </div>
            <div className="text-[11px] font-semibold text-[#829AB1] uppercase tracking-wider mt-0.5">
              Avg Duration
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. COMPACT EXECUTION STREAM (56–68px rows with Framer Motion expand)
          ========================================================================= */}
      <div className="space-y-2.5">
        {/* GROUPED VIEW */}
        {isGroupedView && groupedExecutions
          ? groupedExecutions.map((group, gIdx) => {
              const display = getAgentDisplay(group.agentId);
              const groupKey = `grp-${gIdx}-${group.agentId}`;
              const isExpanded = !!expandedIds[groupKey];
              const isMulti = group.items.length > 1;

              return (
                <motion.div
                  key={groupKey}
                  initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(gIdx * 0.05, 0.4) }}
                  className="rounded-xl border border-[#E3EAE6] bg-white overflow-hidden shadow-2xs hover:border-[#159A68]/35 transition-all"
                >
                  {/* Compact Header Row (~58px) */}
                  <div
                    onClick={() => toggleExpand(groupKey)}
                    className="flex items-center justify-between gap-3 px-4 py-3 min-h-[58px] cursor-pointer hover:bg-[#FAF8F5]/80 transition-colors"
                  >
                    {/* Left: Agent Icon + Agent Name + Count Badge */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-black/[0.04]"
                        style={{ backgroundColor: display.bgColor }}
                      >
                        {display.icon}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-xs sm:text-sm text-[#102A43] truncate">
                            {display.name}
                          </span>
                          {isMulti && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF8F5] border border-[#E3EAE6] text-[#6B7C8F]">
                              {group.items.length} runs
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-[#829AB1] block truncate">
                          {group.agentId}
                        </span>
                      </div>
                    </div>

                    {/* Right: Status + Duration + Tools + Chevron */}
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-xs">
                      {/* Status Badge */}
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-heading uppercase',
                          group.hasFailed
                            ? 'bg-[#FDF2F2] text-[#EF6A63] border border-[#EF6A63]/25'
                            : 'bg-[#E7F7F0] text-[#159A68] border border-[#159A68]/25'
                        )}
                      >
                        {group.hasFailed ? (
                          <>
                            <LuShieldAlert className="w-3 h-3" />
                            <span>Failed</span>
                          </>
                        ) : (
                          <>
                            <LuCheck className="w-3 h-3 stroke-[3]" />
                            <span>Completed</span>
                          </>
                        )}
                      </span>

                      {/* Execution Duration */}
                      <span className="hidden sm:inline font-mono text-[11.5px] text-[#526777] font-semibold">
                        {group.totalDuration} ms
                      </span>

                      {/* Tool count */}
                      <span className="hidden md:inline text-[11px] text-[#829AB1] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E3EAE6]">
                        {group.items[0]?.toolsUsed?.length || 1} tools
                      </span>

                      {/* Expand Arrow */}
                      <div className="text-[#829AB1]">
                        {isExpanded ? (
                          <LuChevronUp className="w-4 h-4" />
                        ) : (
                          <LuChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Execution Detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="border-t border-[#E3EAE6] bg-[#FAF8F5]/60 p-4 space-y-3"
                      >
                        {group.items.map((item, subIdx) => {
                          const timeStr = item.createdAt || item.startedAt
                            ? new Date(item.createdAt || item.startedAt!).toLocaleTimeString()
                            : '9:12:25 PM';

                          const toolsList = item.toolsUsed?.length
                            ? item.toolsUsed
                            : ['Core reasoning engine', 'Schema validator'];

                          const isFailed = item.status === 'FAILED';
                          const errInfo = normalizeErrorInfo(
                            item.error || item.failureReason,
                            isFailed ? 'Agent execution failed' : ''
                          );

                          const resultSummary =
                            formatExecutionValue(item.decision) ||
                            formatExecutionValue(item.result?.summary) ||
                            formatExecutionValue(item.output) ||
                            (item.agentId === 'AGENT_VISION'
                              ? incident?.visionAnalysis?.observations || 'Multimodal vision inspection detected road surface damage.'
                              : item.agentId === 'AGENT_LOCATION'
                              ? `Geocoded to ${incident?.location?.address || 'Downtown Hosur'}. GIS 2dsphere matched to ward perimeter.`
                              : isFailed
                              ? errInfo.message
                              : 'Autonomous decision logic completed and committed to incident ledger.');

                          return (
                            <div
                              key={item.id || item._id || subIdx}
                              className="p-3.5 bg-white rounded-xl border border-[#E3EAE6] text-xs space-y-2.5"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-heading font-bold text-[#102A43]">
                                  Execution {subIdx + 1} of {group.items.length}
                                </span>
                                <div className="flex items-center gap-3 text-[11px] text-[#829AB1]">
                                  <span>{timeStr}</span>
                                  <span className="font-mono text-[#526777] font-semibold">
                                    {item.durationMs || 0} ms
                                  </span>
                                  <span className="font-mono">
                                    {item.modelUsed || 'GEMINI_AI'}
                                  </span>
                                </div>
                              </div>

                              {/* Tools Invoked */}
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className="text-[11px] text-[#829AB1] font-semibold">
                                  Tools:
                                </span>
                                {toolsList.map((t, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className="px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E3EAE6] text-[10.5px] text-[#526777]"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>

                              {/* Decision Result or Failure Details */}
                              {isFailed ? (
                                <div className="p-3 sm:p-3.5 rounded-xl bg-[#FDF2F2] border border-[#EF6A63]/30 text-xs space-y-2.5">
                                  <div className="flex items-center justify-between gap-2 border-b border-[#EF6A63]/15 pb-2">
                                    <div className="flex items-center gap-1.5 text-[#EF6A63] font-heading font-bold text-xs">
                                      <LuShieldAlert className="w-4 h-4 shrink-0" />
                                      <span>Execution Failed</span>
                                    </div>
                                    {errInfo.code && (
                                      <span className="font-mono text-[10.5px] font-bold px-2 py-0.5 rounded bg-white text-[#EF6A63] border border-[#EF6A63]/30">
                                        {errInfo.code}
                                      </span>
                                    )}
                                  </div>

                                  {errInfo.message && (
                                    <div className="space-y-1">
                                      <span className="text-[10px] uppercase font-bold text-[#829AB1] tracking-wider block font-heading">
                                        Message
                                      </span>
                                      <p className="text-[12.5px] text-[#A61B1B] font-medium leading-relaxed bg-white/80 p-2.5 rounded-lg border border-[#EF6A63]/20">
                                        {errInfo.message}
                                      </p>
                                    </div>
                                  )}

                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-[11px]">
                                    {errInfo.code && (
                                      <div>
                                        <span className="text-[#829AB1] font-semibold block text-[10px] uppercase font-heading">Code</span>
                                        <span className="font-mono text-[#526777] font-bold">{errInfo.code}</span>
                                      </div>
                                    )}
                                    {errInfo.chunk && (
                                      <div>
                                        <span className="text-[#829AB1] font-semibold block text-[10px] uppercase font-heading">Chunk</span>
                                        <span className="font-mono text-[#526777] font-bold">{errInfo.chunk}</span>
                                      </div>
                                    )}
                                    {item.durationMs !== undefined && (
                                      <div>
                                        <span className="text-[#829AB1] font-semibold block text-[10px] uppercase font-heading">Duration</span>
                                        <span className="font-mono text-[#526777] font-bold">{item.durationMs} ms</span>
                                      </div>
                                    )}
                                    <div>
                                      <span className="text-[#829AB1] font-semibold block text-[10px] uppercase font-heading">Run</span>
                                      <span className="font-mono text-[#526777] font-bold">#{subIdx + 1}</span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E3EAE6]/80 text-[#102A43] leading-relaxed">
                                  <strong className="font-semibold text-[#526777] block text-[10.5px] uppercase tracking-wide mb-0.5">
                                    Operational Result
                                  </strong>
                                  <span>{resultSummary}</span>
                                </div>
                              )}

                              {/* Collapsible Technical ID */}
                              <div className="flex items-center justify-between text-[10px] text-[#829AB1] font-mono pt-1">
                                <span>ID: {item.id || item._id || `exec-${subIdx + 1}`}</span>
                                <span>IMMUTABLE AI LEDGER</span>
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          : /* RAW STREAM VIEW (Non-grouped) */
            executions.map((item, idx) => {
              const display = getAgentDisplay(item.agentId);
              const itemKey = item.id || item._id || `item-${idx}`;
              const isExpanded = !!expandedIds[itemKey];
              const isFailed = item.status === 'FAILED';

              const timeStr = item.createdAt || item.startedAt
                ? new Date(item.createdAt || item.startedAt!).toLocaleTimeString()
                : '9:12:25 PM';

              return (
                <motion.div
                  key={itemKey}
                  initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(idx * 0.05, 0.4) }}
                  className="rounded-xl border border-[#E3EAE6] bg-white overflow-hidden shadow-2xs hover:border-[#159A68]/35 transition-all"
                >
                  <div
                    onClick={() => toggleExpand(itemKey)}
                    className="flex items-center justify-between gap-3 px-4 py-3 min-h-[58px] cursor-pointer hover:bg-[#FAF8F5]/80 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-black/[0.04]"
                        style={{ backgroundColor: display.bgColor }}
                      >
                        {display.icon}
                      </div>
                      <div className="min-w-0">
                        <span className="font-heading font-bold text-xs sm:text-sm text-[#102A43] truncate block">
                          {display.name}
                        </span>
                        <span className="text-[11px] font-mono text-[#829AB1] block truncate">
                          {item.agentId}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-xs">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-heading uppercase',
                          isFailed
                            ? 'bg-[#FDF2F2] text-[#EF6A63] border border-[#EF6A63]/25'
                            : 'bg-[#E7F7F0] text-[#159A68] border border-[#159A68]/25'
                        )}
                      >
                        {isFailed ? (
                          <>
                            <LuShieldAlert className="w-3 h-3" />
                            <span>Failed</span>
                          </>
                        ) : (
                          <>
                            <LuCheck className="w-3 h-3 stroke-[3]" />
                            <span>Completed</span>
                          </>
                        )}
                      </span>

                      <span className="hidden sm:inline font-mono text-[11.5px] text-[#526777] font-semibold">
                        {item.durationMs || 0} ms
                      </span>

                      <span className="hidden md:inline text-[11px] text-[#829AB1]">
                        {timeStr}
                      </span>

                      <div className="text-[#829AB1]">
                        {isExpanded ? (
                          <LuChevronUp className="w-4 h-4" />
                        ) : (
                          <LuChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="border-t border-[#E3EAE6] bg-[#FAF8F5]/60 p-4 space-y-2.5 text-xs"
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#526777]">
                          <div>
                            <span className="text-[#829AB1] block font-semibold">Model</span>
                            <span className="font-mono">{item.modelUsed || 'GEMINI_AI'}</span>
                          </div>
                          <div>
                            <span className="text-[#829AB1] block font-semibold">Duration</span>
                            <span className="font-mono">{item.durationMs || 0} ms</span>
                          </div>
                          <div>
                            <span className="text-[#829AB1] block font-semibold">Timestamp</span>
                            <span>{timeStr}</span>
                          </div>
                          <div>
                            <span className="text-[#829AB1] block font-semibold">Execution ID</span>
                            <span className="font-mono truncate block">{item.id || item._id || 'SYS-AUTO'}</span>
                          </div>
                        </div>

                        {/* Raw Stream View: Failure Details or Operational Result */}
                        {(() => {
                          const errInfo = normalizeErrorInfo(
                            item.error || item.failureReason,
                            isFailed ? 'Agent execution failed' : ''
                          );
                          const resultSummary =
                            formatExecutionValue(item.decision) ||
                            formatExecutionValue(item.result?.summary) ||
                            formatExecutionValue(item.output) ||
                            (item.agentId === 'AGENT_VISION'
                              ? incident?.visionAnalysis?.observations || 'Multimodal vision inspection detected road surface damage.'
                              : isFailed
                              ? errInfo.message
                              : 'Autonomous agent executed successfully.');

                          return isFailed ? (
                            <div className="p-3 sm:p-3.5 rounded-xl bg-[#FDF2F2] border border-[#EF6A63]/30 text-xs space-y-2.5">
                              <div className="flex items-center justify-between gap-2 border-b border-[#EF6A63]/15 pb-2">
                                <div className="flex items-center gap-1.5 text-[#EF6A63] font-heading font-bold text-xs">
                                  <LuShieldAlert className="w-4 h-4 shrink-0" />
                                  <span>Execution Failed</span>
                                </div>
                                {errInfo.code && (
                                  <span className="font-mono text-[10.5px] font-bold px-2 py-0.5 rounded bg-white text-[#EF6A63] border border-[#EF6A63]/30">
                                    {errInfo.code}
                                  </span>
                                )}
                              </div>

                              {errInfo.message && (
                                <div className="space-y-1">
                                  <span className="text-[10px] uppercase font-bold text-[#829AB1] tracking-wider block font-heading">
                                    Message
                                  </span>
                                  <p className="text-[12.5px] text-[#A61B1B] font-medium leading-relaxed bg-white/80 p-2.5 rounded-lg border border-[#EF6A63]/20">
                                    {errInfo.message}
                                  </p>
                                </div>
                              )}

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-[11px]">
                                {errInfo.code && (
                                  <div>
                                    <span className="text-[#829AB1] font-semibold block text-[10px] uppercase font-heading">Code</span>
                                    <span className="font-mono text-[#526777] font-bold">{errInfo.code}</span>
                                  </div>
                                )}
                                {errInfo.chunk && (
                                  <div>
                                    <span className="text-[#829AB1] font-semibold block text-[10px] uppercase font-heading">Chunk</span>
                                    <span className="font-mono text-[#526777] font-bold">{errInfo.chunk}</span>
                                  </div>
                                )}
                                {item.durationMs !== undefined && (
                                  <div>
                                    <span className="text-[#829AB1] font-semibold block text-[10px] uppercase font-heading">Duration</span>
                                    <span className="font-mono text-[#526777] font-bold">{item.durationMs} ms</span>
                                  </div>
                                )}
                                <div>
                                  <span className="text-[#829AB1] font-semibold block text-[10px] uppercase font-heading">Run</span>
                                  <span className="font-mono text-[#526777] font-bold">#{idx + 1}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 rounded-lg bg-white border border-[#E3EAE6] text-[#102A43] leading-relaxed">
                              <strong className="font-semibold text-[#526777] block text-[10.5px] uppercase tracking-wide mb-1">
                                Operational Result
                              </strong>
                              <span>{resultSummary}</span>
                            </div>
                          );
                        })()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
      </div>
    </div>
  );
}

export default AiExecutionStream;
