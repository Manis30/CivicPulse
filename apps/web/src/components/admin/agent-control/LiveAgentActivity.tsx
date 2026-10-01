import React from 'react';
import { AgentActivityItem, AgentExecutionRecord } from '@/services/adminService';
import { getAgentVisual } from './agentVisuals';
import { LuRadio, LuClock, LuArrowRight, LuActivity } from 'react-icons/lu';
import { cn } from '@/lib/utils';

interface LiveAgentActivityProps {
  activity: AgentActivityItem[];
  loading?: boolean;
  onSelectExecution?: (executionId: string) => void;
  onViewAll?: () => void;
}

export const LiveAgentActivity: React.FC<LiveAgentActivityProps> = ({
  activity,
  loading = false,
  onSelectExecution,
  onViewAll,
}) => {
  return (
    <div className="flex flex-col h-full bg-[#081222]/90 backdrop-blur-md rounded-2xl border border-[rgba(148,163,184,0.14)] overflow-hidden shadow-xl shadow-black/20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[rgba(148,163,184,0.12)] bg-[#0B172B]/60 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
            <LuActivity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-[#F8FAFC] tracking-tight">
              Live Agent Activity
            </h3>
            <p className="text-[11px] text-[#94A3B8]">Autonomous runtime stream</p>
          </div>
        </div>

        {/* Live / Realtime Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-mono text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold tracking-wide">Realtime</span>
        </div>
      </div>

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[rgba(148,163,184,0.06)] scrollbar-thin scrollbar-thumb-[#1e2e4a] scrollbar-track-transparent">
        {loading && activity.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#94A3B8]">Streaming execution logs...</p>
          </div>
        ) : activity.length === 0 ? (
          <div className="p-8 text-center space-y-1">
            <LuClock className="w-6 h-6 text-[#64748B] mx-auto opacity-60" />
            <p className="text-xs font-medium text-[#F8FAFC]">No execution activity yet</p>
            <p className="text-[11px] text-[#94A3B8]">Logs appear as agents process civic events.</p>
          </div>
        ) : (
          activity.map((item) => {
            const visual = getAgentVisual(item.agentId);
            const Icon = visual.icon;
            const isFailed = item.status === 'FAILED';
            const isDegraded = item.status === 'DEGRADED';
            const isRunning = item.status === 'RUNNING';

            const statusBadgeClasses = isFailed
              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
              : isDegraded
              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              : isRunning
              ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30 animate-pulse'
              : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';

            return (
              <div
                key={item.id}
                onClick={() => onSelectExecution?.(item.executionId || item.id)}
                className="group px-3.5 py-3 hover:bg-[#0D1C34]/80 transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs"
              >
                {/* Left: Time & Icon & Details */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* Timestamp */}
                  <span className="font-mono text-[11px] text-[#64748B] shrink-0 tabular-nums">
                    {item.timestamp}
                  </span>

                  {/* Agent Icon */}
                  <div
                    className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105',
                      visual.badgeBg,
                      visual.accentBorder
                    )}
                    style={{ color: visual.color } as React.CSSProperties}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  {/* Agent Name & Event */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-heading font-bold text-xs text-[#F8FAFC] truncate">
                        {item.agentName}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#94A3B8] truncate leading-tight mt-0.5">
                      {item.event}
                    </p>
                  </div>
                </div>

                {/* Right: Duration & Status Badge */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-[11px] text-[#94A3B8] tabular-nums">
                    {item.durationMs}ms
                  </span>

                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border tracking-wider uppercase',
                      statusBadgeClasses
                    )}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 border-t border-[rgba(148,163,184,0.12)] bg-[#0B172B]/60 text-center shrink-0">
        <button
          type="button"
          onClick={onViewAll}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-transparent hover:bg-indigo-500/10 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <span>View All Executions</span>
          <LuArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
