import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AgentTelemetry,
  AgentDetail,
  AgentExecutionRecord,
  adminService,
} from '@/services/adminService';
import { getAgentVisual } from './agentVisuals';
import {
  LuX,
  LuCpu,
  LuClock,
  LuCircleCheck,
  LuTriangleAlert,
  LuActivity,
  LuWrench,
  LuLayers,
  LuExternalLink,
  LuBot,
  LuShield,
  LuChevronDown,
  LuChevronRight,
  LuInfo,
} from 'react-icons/lu';
import { cn } from '@/lib/utils';

interface AgentDetailDrawerProps {
  agent: AgentTelemetry | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectExecution?: (execution: AgentExecutionRecord) => void;
}

export const AgentDetailDrawer: React.FC<AgentDetailDrawerProps> = ({
  agent,
  isOpen,
  onClose,
  onSelectExecution,
}) => {
  const [detail, setDetail] = useState<AgentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedExecId, setExpandedExecId] = useState<string | null>(null);

  useEffect(() => {
    if (!agent) {
      setDetail(null);
      return;
    }
    let isMounted = true;
    setLoading(true);

    adminService
      .getAgentById(agent.agentId)
      .then((data) => {
        if (isMounted && data) {
          setDetail(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load agent detail:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [agent]);

  if (!agent) return null;

  const visual = getAgentVisual(agent.agentId);
  const Icon = visual.icon;

  const effectiveStatus = detail?.status || agent.status || 'ACTIVE';
  const isFailed = (effectiveStatus as string) === 'FAILED';
  const isDegraded = effectiveStatus === 'DEGRADED';
  const isRunning = effectiveStatus === 'RUNNING';

  const statusColor = isFailed
    ? 'text-rose-400 bg-rose-500/15 border-rose-500/30'
    : isDegraded
    ? 'text-amber-400 bg-amber-500/15 border-amber-500/30'
    : isRunning
    ? 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30'
    : 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';

  const executions = detail?.recentExecutions || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Subtle Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
          />

          {/* Slide-in Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 z-50 h-full w-full sm:w-[440px] bg-[#071120] border-l border-[rgba(148,163,184,0.18)] shadow-2xl flex flex-col font-sans text-[#F8FAFC] overflow-hidden"
          >
            {/* Top Drawer Header */}
            <div className="p-5 border-b border-[rgba(148,163,184,0.12)] bg-[#091528] flex items-start justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={cn(
                    'w-11 h-11 rounded-xl flex items-center justify-center border shadow-md shrink-0',
                    visual.badgeBg,
                    visual.accentBorder
                  )}
                  style={{ color: visual.color } as React.CSSProperties}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading font-extrabold text-base text-[#F8FAFC] truncate">
                      {agent.name}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-xs text-[#818CF8] bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {agent.agentId}
                    </span>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border tracking-wider uppercase flex items-center gap-1',
                        statusColor
                      )}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {effectiveStatus}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#13243A] transition-colors shrink-0"
                aria-label="Close drawer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-[#1e2e4a] scrollbar-track-transparent">
              {/* 1. OVERVIEW & ROLE */}
              <div className="space-y-3">
                <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-[#64748B] block">
                  Overview & Capability
                </span>
                <p className="text-xs text-[#94A3B8] leading-relaxed bg-[#0C172C] p-3.5 rounded-xl border border-[rgba(148,163,184,0.1)]">
                  {agent.roleDescription}
                </p>

                {/* 4-Stat Metric Strip */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-[#0C172C] border border-[rgba(148,163,184,0.1)]">
                    <span className="text-[10px] font-mono uppercase text-[#64748B] block">
                      Total Runs
                    </span>
                    <span className="text-lg font-bold font-heading text-[#F8FAFC]">
                      {agent.totalExecutions}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0C172C] border border-[rgba(148,163,184,0.1)]">
                    <span className="text-[10px] font-mono uppercase text-[#64748B] block">
                      Success Rate
                    </span>
                    <span
                      className={cn(
                        'text-lg font-bold font-heading',
                        agent.successRate >= 90 ? 'text-emerald-400' : 'text-amber-400'
                      )}
                    >
                      {agent.successRate}%
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0C172C] border border-[rgba(148,163,184,0.1)]">
                    <span className="text-[10px] font-mono uppercase text-[#64748B] block">
                      Failed Runs
                    </span>
                    <span
                      className={cn(
                        'text-lg font-bold font-heading',
                        agent.failureCount > 0 ? 'text-rose-400' : 'text-[#94A3B8]'
                      )}
                    >
                      {agent.failureCount}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0C172C] border border-[rgba(148,163,184,0.1)]">
                    <span className="text-[10px] font-mono uppercase text-[#64748B] block">
                      Avg Latency
                    </span>
                    <span className="text-lg font-bold font-heading text-[#38BDF8]">
                      {agent.averageLatencyMs}ms
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. CURRENT STATE & RUNTIME */}
              <div className="space-y-3">
                <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-[#64748B] block">
                  Current State & Runtime
                </span>

                <div className="p-3.5 rounded-xl bg-[#0C172C] border border-[rgba(148,163,184,0.1)] space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8]">Execution Engine</span>
                    <span className="font-mono text-[#818CF8] bg-indigo-500/10 px-2 py-0.5 rounded text-[11px]">
                      {agent.executionMode || 'GEMINI_AI'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8]">Worker Infrastructure</span>
                    <span className="font-mono text-[#F8FAFC] text-[11px]">
                      BullMQ + Redis Worker
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8]">Last Active</span>
                    <span className="font-mono text-[11px] text-[#22D3EE]">
                      {agent.lastActive ? new Date(agent.lastActive).toLocaleTimeString() : 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. REGISTERED TOOLS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-[#64748B]">
                    Registered Tool Registry
                  </span>
                  <span className="text-[10.5px] font-mono text-indigo-400">
                    {agent.tools.length} Tools Authorized
                  </span>
                </div>

                <div className="space-y-2">
                  {agent.tools.map((toolName) => (
                    <div
                      key={toolName}
                      className="p-2.5 rounded-xl bg-[#0C172C] border border-[rgba(148,163,184,0.1)] flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <LuWrench className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="font-mono text-xs text-[#F8FAFC] font-semibold">
                          {toolName}()
                        </span>
                      </div>

                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        AUTHORIZED
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. PERFORMANCE LATENCY DISTRIBUTION */}
              <div className="space-y-3">
                <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-[#64748B] block">
                  Execution Latency Distribution
                </span>

                <div className="p-3.5 rounded-xl bg-[#0C172C] border border-[rgba(148,163,184,0.1)] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#94A3B8]">Average Response</span>
                    <span className="font-mono font-bold text-[#38BDF8]">
                      {agent.averageLatencyMs}ms
                    </span>
                  </div>

                  {/* Simple SVG Latency Bar Indicator */}
                  <div className="w-full bg-[#101F33] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(10, (agent.averageLatencyMs / 1500) * 100))}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10.5px] font-mono text-[#64748B]">
                    <span>0ms</span>
                    <span>750ms</span>
                    <span>1500ms+</span>
                  </div>
                </div>
              </div>

              {/* 5. RECENT EXECUTIONS & DECISION AUDITING */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-[#64748B]">
                    Recent Executions ({executions.length})
                  </span>
                  <span className="text-[10px] text-[#94A3B8]">Real database traces</span>
                </div>

                {executions.length === 0 ? (
                  <div className="p-5 text-center bg-[#0C172C] rounded-xl border border-[rgba(148,163,184,0.1)]">
                    <p className="text-xs text-[#94A3B8]">No execution traces recorded yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {executions.map((ex) => {
                      const isExFailed = ex.status === 'FAILED';
                      const isExpanded = expandedExecId === ex._id;

                      return (
                        <div
                          key={ex._id}
                          className={cn(
                            'p-3 rounded-xl bg-[#0C172C] border transition-colors cursor-pointer space-y-2 text-xs',
                            isExFailed
                              ? 'border-rose-500/30 hover:border-rose-500/60'
                              : 'border-[rgba(148,163,184,0.1)] hover:border-indigo-500/50'
                          )}
                          onClick={() => setExpandedExecId(isExpanded ? null : ex._id)}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-[11px] text-[#818CF8]">
                              {ex.executionId || ex._id.slice(-8)}
                            </span>

                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-[#94A3B8]">
                                {ex.durationMs}ms
                              </span>
                              <span
                                className={cn(
                                  'px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold',
                                  isExFailed
                                    ? 'bg-rose-500/15 text-rose-400'
                                    : 'bg-emerald-500/15 text-emerald-400'
                                )}
                              >
                                {ex.status}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-[#64748B] font-mono">
                            <span>{new Date(ex.startedAt).toLocaleTimeString()}</span>
                            {ex.incidentId && (
                              <span className="truncate max-w-[150px]">
                                Inc: {String(ex.incidentId).slice(-6)}
                              </span>
                            )}
                          </div>

                          {/* Expanded Decision & Reasoning Details */}
                          {isExpanded && (
                            <div className="pt-2 border-t border-[rgba(148,163,184,0.1)] space-y-2 animate-in fade-in duration-150">
                              {ex.reasoning && (
                                <div className="space-y-1">
                                  <span className="text-[10px] font-mono uppercase text-[#64748B] block">
                                    Autonomous Decision Reasoning
                                  </span>
                                  <p className="text-[11px] text-[#F8FAFC] leading-relaxed bg-[#081120] p-2.5 rounded-lg border border-[rgba(148,163,184,0.08)]">
                                    {ex.reasoning}
                                  </p>
                                </div>
                              )}

                              {ex.error && (
                                <div className="space-y-1">
                                  <span className="text-[10px] font-mono uppercase text-rose-400 block">
                                    Failure Reason
                                  </span>
                                  <p className="text-[11px] text-rose-300 font-mono bg-rose-950/20 p-2 rounded border border-rose-500/20">
                                    {typeof ex.error === 'string'
                                      ? ex.error
                                      : JSON.stringify(ex.error)}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
