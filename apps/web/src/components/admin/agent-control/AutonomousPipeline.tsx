import React from 'react';
import { getAgentVisual } from './agentVisuals';
import {
  LuNetwork,
  LuChevronRight,
  LuPause,
  LuPlay,
  LuRadio,
  LuCircleCheck,
  LuClock,
} from 'react-icons/lu';
import { cn } from '@/lib/utils';

export interface ChainStep {
  agentId: string;
  agentName: string;
  sequence: number;
  event: string;
  durationMs: number;
  status: string;
  startedAt: string;
  timestamp: string;
}

interface AutonomousPipelineProps {
  chain: ChainStep[];
  hasChain: boolean;
  filter: 'ALL' | 'SUCCESS' | 'FAILED' | 'RUNNING';
  onFilterChange: (filter: 'ALL' | 'SUCCESS' | 'FAILED' | 'RUNNING') => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onSelectAgent?: (agentId: string) => void;
}

export const AutonomousPipeline: React.FC<AutonomousPipelineProps> = ({
  chain,
  hasChain,
  filter,
  onFilterChange,
  isPaused,
  onTogglePause,
  onSelectAgent,
}) => {
  const filteredSteps = chain.filter((step) => {
    if (filter === 'ALL') return true;
    if (filter === 'SUCCESS') return step.status === 'SUCCESS' || step.status === 'COMPLETED';
    if (filter === 'FAILED') return step.status === 'FAILED';
    if (filter === 'RUNNING') return step.status === 'RUNNING' || step.status === 'STARTED';
    return true;
  });

  return (
    <div className="w-full bg-[#081222]/90 backdrop-blur-md rounded-2xl border border-[rgba(148,163,184,0.14)] p-4 sm:p-5 shadow-xl shadow-black/20 space-y-4">
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[rgba(148,163,184,0.12)]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
            <LuNetwork className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-sm text-[#F8FAFC]">
                Recent Autonomous Activity
              </h3>
              <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span className="hidden sm:inline-block text-[11px] font-mono text-indigo-400">
                Live Execution Pipeline
              </span>
            </div>
            <p className="text-xs text-[#94A3B8]">
              Real-time multi-agent execution pipeline for civic incident operations
            </p>
          </div>
        </div>

        {/* Filter and Live Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter Pills */}
          <div className="flex items-center bg-[#0B172B] p-1 rounded-xl border border-[rgba(148,163,184,0.12)] text-xs">
            {(['ALL', 'SUCCESS', 'FAILED', 'RUNNING'] as const).map((mode) => {
              const label =
                mode === 'ALL'
                  ? 'All Agents'
                  : mode === 'SUCCESS'
                  ? 'Success'
                  : mode === 'FAILED'
                  ? 'Failed'
                  : 'Running';
              const active = filter === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onFilterChange(mode)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg font-medium transition-colors',
                    active
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#13243A]'
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Pause / Resume Button */}
          <button
            type="button"
            onClick={onTogglePause}
            className={cn(
              'p-2 rounded-xl border text-xs transition-colors flex items-center gap-1.5',
              isPaused
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
                : 'bg-[#0B172B] text-[#94A3B8] border-[rgba(148,163,184,0.12)] hover:text-[#F8FAFC]'
            )}
            title={isPaused ? 'Resume live feed' : 'Pause live feed'}
          >
            {isPaused ? <LuPlay className="w-3.5 h-3.5" /> : <LuPause className="w-3.5 h-3.5" />}
          </button>

          {/* Live Feed Status Pill */}
          <div
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-semibold',
              isPaused
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
            )}
          >
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
              )}
            />
            <span>{isPaused ? 'Paused' : 'Live Feed'}</span>
          </div>
        </div>
      </div>

      {/* Horizontal Pipeline Steps */}
      {!hasChain || filteredSteps.length === 0 ? (
        <div className="py-8 text-center space-y-1 bg-[#0B172B]/40 rounded-xl border border-dashed border-[rgba(148,163,184,0.12)]">
          <LuClock className="w-6 h-6 text-[#64748B] mx-auto opacity-70" />
          <p className="text-xs font-semibold text-[#F8FAFC]">
            No recent autonomous execution chain
          </p>
          <p className="text-[11px] text-[#94A3B8]">
            Agent pipeline links will render here when an incident is autonomously processed.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#1e2e4a] scrollbar-track-transparent">
          <div className="flex items-center gap-2.5 min-w-max py-1">
            {/* Start Node Indicator */}
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>

            {filteredSteps.map((step, idx) => {
              const visual = getAgentVisual(step.agentId);
              const Icon = visual.icon;
              const isFailed = step.status === 'FAILED';
              const isLast = idx === filteredSteps.length - 1;

              return (
                <React.Fragment key={`${step.agentId}-${idx}`}>
                  {/* Step Card */}
                  <div
                    onClick={() => onSelectAgent?.(step.agentId)}
                    className={cn(
                      'group relative px-4 py-3 rounded-xl bg-[#0C172C] hover:bg-[#10203D] border transition-all cursor-pointer flex items-center gap-3 shadow-md hover:shadow-indigo-500/10 min-w-[210px]',
                      isFailed
                        ? 'border-rose-500/40 hover:border-rose-500/70'
                        : 'border-[rgba(148,163,184,0.14)] hover:border-indigo-500/50'
                    )}
                  >
                    {/* Agent Icon */}
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105',
                        visual.badgeBg,
                        visual.accentBorder
                      )}
                      style={{ color: visual.color } as React.CSSProperties}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Step Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-heading font-bold text-xs text-[#F8FAFC] truncate">
                          {step.agentName.replace(' Agent', '')}
                        </span>
                        <span className="font-mono text-[10px] text-[#64748B] tabular-nums">
                          {step.timestamp}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#94A3B8] truncate leading-tight mt-0.5">
                        {step.event}
                      </p>

                      <div className="flex items-center justify-between mt-1 text-[10.5px]">
                        <span
                          className={cn(
                            'font-mono font-semibold',
                            isFailed ? 'text-rose-400' : 'text-[#38BDF8]'
                          )}
                        >
                          {step.durationMs}ms
                        </span>
                        <span
                          className={cn(
                            'font-mono uppercase font-bold text-[9.5px]',
                            isFailed ? 'text-rose-400' : 'text-emerald-400'
                          )}
                        >
                          {step.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Flow Connector Arrow */}
                  {!isLast && (
                    <div className="flex items-center text-cyan-400/60 shrink-0 px-0.5">
                      <LuChevronRight className="w-4 h-4 stroke-[2.5] animate-pulse" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}

            {/* End Node Indicator */}
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shrink-0">
              <LuCircleCheck className="w-3.5 h-3.5 text-cyan-400" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
