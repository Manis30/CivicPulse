import React, { useState } from 'react';
import { AgentTelemetry, AgentActivityItem } from '@/services/adminService';
import { getAgentVisual } from './agentVisuals';
import {
  LuBot,
  LuRadio,
  LuSparkles,
  LuCpu,
  LuCheck,
  LuTriangleAlert,
  LuClock,
  LuActivity,
  LuChevronRight,
  LuZap,
} from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { CivicIntelligenceCore3D } from './CivicIntelligenceCore3D';

interface AgentNetworkViewProps {
  agents: AgentTelemetry[];
  selectedAgentId?: string | null;
  onSelectAgent: (agent: AgentTelemetry) => void;
  activeChainAgentIds?: string[];
  recentActivity?: AgentActivityItem[];
  onSelectExecution?: (executionId: string) => void;
}

interface NodePosition {
  id: string;
  name: string;
  className: string;
  pathD: string;
  reversePathD: string;
  cx: number;
  cy: number;
}

// 10 Specialist Agent Spatial Nodes (Organized organically around Center Orchestrator)
const AGENT_NODES: NodePosition[] = [
  {
    id: 'AGENT_VISION',
    name: 'Vision Agent',
    className: 'top-[3%] left-1/2 -translate-x-1/2',
    pathD: 'M 800 320 L 800 135',
    reversePathD: 'M 800 135 L 800 320',
    cx: 800,
    cy: 85,
  },
  {
    id: 'AGENT_LOCATION',
    name: 'Location Agent',
    className: 'top-[12%] left-[17%] -translate-x-1/2',
    pathD: 'M 720 350 Q 500 240 380 185',
    reversePathD: 'M 380 185 Q 500 240 720 350',
    cx: 310,
    cy: 160,
  },
  {
    id: 'AGENT_DUPLICATE',
    name: 'Duplicate Detection Agent',
    className: 'top-[12%] left-[83%] -translate-x-1/2',
    pathD: 'M 880 350 Q 1100 240 1220 185',
    reversePathD: 'M 1220 185 Q 1100 240 880 350',
    cx: 1290,
    cy: 160,
  },
  {
    id: 'AGENT_INVESTIGATION',
    name: 'Investigation Agent',
    className: 'top-[44%] left-[6%]',
    pathD: 'M 690 430 L 270 430',
    reversePathD: 'M 270 430 L 690 430',
    cx: 150,
    cy: 430,
  },
  {
    id: 'AGENT_SEVERITY',
    name: 'Severity Agent',
    className: 'top-[44%] right-[6%]',
    pathD: 'M 910 430 L 1330 430',
    reversePathD: 'M 1330 430 L 910 430',
    cx: 1450,
    cy: 430,
  },
  {
    id: 'AGENT_OPERATIONS',
    name: 'Operations Agent',
    className: 'top-[68%] left-[15%] -translate-x-1/2',
    pathD: 'M 720 500 Q 500 580 360 625',
    reversePathD: 'M 360 625 Q 500 580 720 500',
    cx: 280,
    cy: 640,
  },
  {
    id: 'AGENT_ROUTING',
    name: 'Routing Agent',
    className: 'top-[68%] left-[85%] -translate-x-1/2',
    pathD: 'M 880 500 Q 1100 580 1240 625',
    reversePathD: 'M 1240 625 Q 1100 580 880 500',
    cx: 1320,
    cy: 640,
  },
  {
    id: 'AGENT_VERIFICATION',
    name: 'Verification Agent',
    className: 'top-[78%] left-[31%] -translate-x-1/2',
    pathD: 'M 735 510 Q 620 620 540 700',
    reversePathD: 'M 540 700 Q 620 620 735 510',
    cx: 500,
    cy: 740,
  },
  {
    id: 'AGENT_NOTIFICATION',
    name: 'Notification Agent',
    className: 'top-[78%] left-[69%] -translate-x-1/2',
    pathD: 'M 865 510 Q 980 620 1060 700',
    reversePathD: 'M 1060 700 Q 980 620 865 510',
    cx: 1100,
    cy: 740,
  },
  {
    id: 'AGENT_INTELLIGENCE',
    name: 'Intelligence Agent',
    className: 'top-[84%] left-1/2 -translate-x-1/2',
    pathD: 'M 800 540 L 800 765',
    reversePathD: 'M 800 765 L 800 540',
    cx: 800,
    cy: 810,
  },
];

export const AgentNetworkView: React.FC<AgentNetworkViewProps> = ({
  agents,
  selectedAgentId,
  onSelectAgent,
  activeChainAgentIds = [],
  recentActivity = [],
  onSelectExecution,
}) => {
  const [hoveredAgentId, setHoveredAgentId] = useState<string | null>(null);

  // Map agents by ID for rapid lookup
  const agentMap = new Map(agents.map((a) => [a.agentId, a]));

  const getAgent = (id: string): AgentTelemetry => {
    return (
      agentMap.get(id) || {
        agentId: id,
        name: id.replace('AGENT_', '').replace('_', ' ') + ' Agent',
        roleDescription: 'Autonomous specialist agent',
        status: 'ACTIVE',
        executionMode: 'GEMINI_AI',
        tools: [],
        totalExecutions: 0,
        successRate: 100,
        failureCount: 0,
        averageLatencyMs: 0,
        lastActive: 'Active',
      }
    );
  };

  const renderAgentCard = (id: string, customClasses = '') => {
    const agent = getAgent(id);
    const visual = getAgentVisual(agent.agentId);
    const Icon = visual.icon;
    const isSelected = selectedAgentId === agent.agentId;
    const isHovered = hoveredAgentId === agent.agentId;
    const isInChain = activeChainAgentIds.includes(agent.agentId);
    const isAnyHovered = Boolean(hoveredAgentId);

    const isFailed = (agent.status as string) === 'FAILED';
    const isDegraded = agent.status === 'DEGRADED';
    const isRunning = agent.status === 'RUNNING' || isInChain;

    const statusBadge = isFailed
      ? { label: 'FAILED', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' }
      : isDegraded
      ? { label: 'DEGRADED', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' }
      : isRunning
      ? { label: 'PROCESSING', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30 animate-pulse' }
      : { label: 'ACTIVE', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };

    return (
      <div
        key={agent.agentId}
        onClick={() => onSelectAgent(agent)}
        onMouseEnter={() => setHoveredAgentId(agent.agentId)}
        onMouseLeave={() => setHoveredAgentId(null)}
        className={cn(
          'group relative w-[235px] sm:w-[245px] p-3 sm:p-3.5 rounded-2xl bg-[#091528]/95 hover:bg-[#0E1F3B] border transition-all duration-300 cursor-pointer shadow-xl backdrop-blur-md select-none',
          isSelected
            ? 'ring-2 ring-[#5B5BF7] border-indigo-400 shadow-[0_0_25px_rgba(91,91,247,0.35)] scale-[1.03] z-30'
            : isHovered
            ? 'border-indigo-400/80 shadow-[0_0_20px_rgba(99,102,241,0.25)] scale-[1.02] z-20'
            : isInChain
            ? 'border-cyan-400/70 shadow-[0_0_18px_rgba(34,211,238,0.25)]'
            : isDegraded
            ? 'border-amber-500/40 hover:border-amber-400'
            : 'border-[rgba(148,163,184,0.16)] hover:border-indigo-400/50',
          isAnyHovered && !isHovered && !isSelected && 'opacity-65',
          customClasses
        )}
      >
        {/* Top: Icon + Title + ID + Status */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Agent Icon */}
            <div
              className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105',
                visual.badgeBg,
                visual.accentBorder
              )}
              style={{ color: visual.color } as React.CSSProperties}
            >
              <Icon className="w-4 h-4" />
            </div>

            {/* Agent Name & ID */}
            <div className="min-w-0">
              <h4 className="font-heading font-extrabold text-xs text-[#F8FAFC] tracking-tight truncate leading-tight">
                {agent.name}
              </h4>
              <span className="font-mono text-[9.5px] text-[#64748B] block truncate mt-0.5">
                {agent.agentId}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={cn(
              'px-1.5 py-0.5 rounded-full font-mono text-[9px] font-bold border shrink-0',
              statusBadge.color
            )}
          >
            {statusBadge.label}
          </span>
        </div>

        {/* Bottom Metrics Row (Real DB values) */}
        <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2 border-t border-[rgba(148,163,184,0.08)] text-center font-mono">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-[#F8FAFC] block leading-none">
              {agent.totalExecutions}
            </span>
            <span className="text-[8.5px] uppercase tracking-wider text-[#64748B] block">
              Runs
            </span>
          </div>

          <div className="space-y-0.5">
            <span
              className={cn(
                'text-[11px] font-bold block leading-none',
                agent.successRate >= 90 ? 'text-emerald-400' : 'text-amber-400'
              )}
            >
              {agent.successRate}%
            </span>
            <span className="text-[8.5px] uppercase tracking-wider text-[#64748B] block">
              Success
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-[#38BDF8] block leading-none">
              {agent.averageLatencyMs}ms
            </span>
            <span className="text-[8.5px] uppercase tracking-wider text-[#64748B] block">
              Latency
            </span>
          </div>
        </div>

        {/* Hover Click Hint */}
        {isHovered && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-40 px-2.5 py-1 rounded-lg bg-[#0F1E36] border border-indigo-400/40 text-[10px] text-[#F8FAFC] shadow-xl pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-100 flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold">Click</span>
            <span className="text-[#94A3B8]">to open full inspector</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full rounded-2xl bg-[#060D19] border border-[rgba(148,163,184,0.14)] overflow-hidden flex flex-col justify-between select-none shadow-2xl">
      {/* Background Cybernetic Grid & Radial Technical Field */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:28px_28px] opacity-35 pointer-events-none" />
      <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-cyan-500/10 via-indigo-600/15 to-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* SVG Canvas for Connection Energy Paths and Flow Particles */}
      <svg
        className="absolute inset-0 w-full h-[880px] pointer-events-none hidden md:block"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="cyanIndigoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#6366F1" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#A855F7" stopOpacity="0.7" />
          </linearGradient>

          <linearGradient id="activeBeam" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#22C55E" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#818CF8" stopOpacity="0.9" />
          </linearGradient>

          <filter id="particleGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Orbit Guide Rings around Central Orchestrator (center 800, 430) */}
        <circle cx="800" cy="430" r="140" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 6" opacity="0.4" />
        <circle cx="800" cy="430" r="240" stroke="#1E293B" strokeWidth="1" strokeDasharray="6 8" opacity="0.3" />
        <circle cx="800" cy="430" r="360" stroke="#1E293B" strokeWidth="1" strokeDasharray="8 10" opacity="0.2" />

        {/* 10 Animated Connection Paths + Dynamic Traveling Signal Particles */}
        {AGENT_NODES.map((node, idx) => {
          const isSelected = selectedAgentId === node.id;
          const isHovered = hoveredAgentId === node.id;
          const isInChain = activeChainAgentIds.includes(node.id);
          const nodeAgent = getAgent(node.id);
          const isProcessing = isInChain || nodeAgent.status === 'RUNNING';
          const isFailed = (nodeAgent.status as string) === 'FAILED';
          const isFaded = Boolean(hoveredAgentId) && !isHovered && !isSelected;

          const strokeColor = isSelected
            ? '#5B5BF7'
            : isProcessing
            ? '#22D3EE'
            : isFailed
            ? '#F43F5E'
            : isHovered
            ? '#818CF8'
            : 'url(#cyanIndigoGrad)';

          const strokeWidth = isSelected ? 2.5 : isProcessing ? 2.2 : isHovered ? 1.8 : 1.2;
          const duration = isProcessing ? 1.4 : 2.6 + (idx % 3) * 0.4;

          return (
            <g key={node.id} className="transition-opacity duration-300" opacity={isFaded ? 0.15 : 1}>
              {/* Underlying Base Path */}
              <path
                d={node.pathD}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={isProcessing ? 'none' : '4 5'}
                opacity={isProcessing ? 0.95 : 0.45}
              />

              {/* Forward Signal Particle (Center -> Agent) */}
              <circle
                r={isProcessing ? 4.5 : 3}
                fill={isProcessing ? '#22D3EE' : '#38BDF8'}
                filter="url(#particleGlow)"
              >
                <animateMotion path={node.pathD} dur={`${duration}s`} repeatCount="indefinite" />
              </circle>

              {/* Return Signal Particle (Agent -> Center) */}
              <circle
                r={isProcessing ? 3.5 : 2}
                fill={isFailed ? '#F43F5E' : isProcessing ? '#22C55E' : '#A855F7'}
                opacity="0.85"
                filter="url(#particleGlow)"
              >
                <animateMotion path={node.reversePathD} dur={`${duration + 0.8}s`} repeatCount="indefinite" />
              </circle>
            </g>
          );
        })}
      </svg>

      {/* DESKTOP 2D SPATIAL HERO NETWORK LAYOUT (md and up) */}
      <div className="relative w-full h-[780px] lg:h-[840px] hidden md:block">
        {/* CENTER: AI ORCHESTRATOR & CIVIC INTELLIGENCE CORE */}
        <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center pointer-events-auto">
          {/* LAYER 3: INDEPENDENT ROTATING ORBITAL RINGS (ROTATES INDEPENDENTLY BEHIND CONTENT) */}
          {/* Outer Ring: very slow clockwise (28s) */}
          <div className="absolute w-[280px] h-[280px] rounded-full border border-indigo-500/25 shadow-2xl shadow-indigo-500/15 animate-spin-slow pointer-events-none">
            {/* 4 Cardinal Orbit Node Markers */}
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.85)]" />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.85)]" />
            <span className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.85)]" />
            <span className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(34,197,94,0.85)]" />
          </div>

          {/* Middle Counter-Rotating Ring: slow counter-clockwise (20s) */}
          <div className="absolute w-[230px] h-[230px] rounded-full border border-dashed border-cyan-400/35 animate-reverse-spin pointer-events-none" />

          {/* Inner Technical Ring: subtle clockwise (36s) */}
          <div className="absolute w-[195px] h-[195px] rounded-full border border-dotted border-purple-400/40 animate-spin-subtle pointer-events-none" />

          {/* LAYER 2: 3D CIVIC INTELLIGENCE CORE (PROCEDURAL DIGITAL TWIN MINI-CITY) */}
          <div className="relative w-[180px] h-[180px] rounded-full border border-cyan-400/35 bg-[#050D1A]/80 shadow-[0_0_35px_rgba(34,211,238,0.22)] flex items-center justify-center overflow-hidden pointer-events-none z-10">
            <CivicIntelligenceCore3D isProcessing={activeChainAgentIds.length > 0} className="w-full h-full" />
          </div>

          {/* LAYER 1: 100% STATIC CENTRAL TYPOGRAPHY & BADGE (NEVER ROTATES - ALWAYS HORIZONTAL) */}
          <div className="absolute z-20 px-3.5 py-2.5 rounded-xl bg-[#061122]/92 backdrop-blur-md border border-indigo-500/50 shadow-2xl shadow-black/95 flex flex-col items-center justify-center text-center space-y-1 select-none pointer-events-auto">
            {/* Waveform Beacon + Title */}
            <div className="flex items-center gap-1.5">
              <LuRadio className="w-3.5 h-3.5 text-cyan-400 animate-pulse shrink-0" />
              <h3 className="font-heading font-black text-xs sm:text-[13px] text-[#F8FAFC] tracking-wider uppercase leading-none">
                AI ORCHESTRATOR
              </h3>
            </div>

            <p className="text-[8.5px] font-mono text-[#94A3B8] uppercase tracking-wider font-semibold max-w-[145px] leading-tight">
              AUTONOMOUS CIVIC OPERATIONS CORE
            </p>

            {/* Static Live Badge */}
            <div className="pt-0.5">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-mono font-bold text-emerald-400 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            </div>
          </div>
        </div>

        {/* 10 ORGANICALLY SPACED AGENT NODES (NO OVERLAP) */}
        {AGENT_NODES.map((node) => (
          <div key={node.id} className={cn('absolute z-10', node.className)}>
            {renderAgentCard(node.id)}
          </div>
        ))}
      </div>

      {/* MOBILE & TABLET FALLBACK WORKFLOW (sm and down) */}
      <div className="w-full md:hidden p-4 space-y-4 z-10">
        {/* Mobile Center Core Card with 3D Core */}
        <div className="relative p-5 rounded-2xl bg-[#091528] border border-indigo-500/40 text-center space-y-2 shadow-xl overflow-hidden flex flex-col items-center">
          <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
            <CivicIntelligenceCore3D isProcessing={activeChainAgentIds.length > 0} className="w-44 h-44" />
          </div>
          <div className="relative z-10 w-9 h-9 rounded-xl bg-indigo-500/20 text-cyan-400 border border-indigo-500/40 flex items-center justify-center mx-auto">
            <LuRadio className="w-4 h-4 animate-pulse" />
          </div>
          <div className="relative z-10">
            <h3 className="font-heading font-extrabold text-sm text-[#F8FAFC]">
              AI ORCHESTRATOR
            </h3>
            <p className="text-[11px] text-[#94A3B8]">Autonomous Civic Operations Core</p>
          </div>
          <span className="relative z-10 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            10 SPECIALIST AGENTS • LIVE
          </span>
        </div>

        {/* Mobile Agents List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {agents.map((agent) => renderAgentCard(agent.agentId))}
        </div>
      </div>

      {/* BOTTOM COMPACT LIVE EXECUTION STREAM (HERO BOTTOM STRIP) */}
      <div className="w-full bg-[#081220]/95 border-t border-[rgba(148,163,184,0.12)] p-3 sm:p-4 z-20 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-cyan-500/20 text-cyan-400">
              <LuActivity className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F8FAFC]">
              LIVE EXECUTION STREAM
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <span className="text-[11px] font-mono text-[#64748B]">
            {recentActivity.length} Recent Real-Time Traces
          </span>
        </div>

        {/* Horizontally Scrollable Stream Strip */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
          {recentActivity.length === 0 ? (
            <div className="text-xs text-[#64748B] py-2 italic font-mono">
              Listening for live agent execution events...
            </div>
          ) : (
            recentActivity.slice(0, 12).map((item) => {
              const visual = getAgentVisual(item.agentId);
              const Icon = visual.icon;

              const isSuccess = item.status === 'SUCCESS';
              const isRunning = item.status === 'RUNNING';
              const isFailed = item.status === 'FAILED';

              const statusColor = isSuccess
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : isRunning
                ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 animate-pulse'
                : 'text-rose-400 bg-rose-500/10 border-rose-500/20';

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectExecution && onSelectExecution(item.id || item.executionId || '')}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-[#0B1728] hover:bg-[#0F223D] border border-[rgba(148,163,184,0.12)] hover:border-indigo-400/40 text-xs shrink-0 cursor-pointer transition-all shadow-xs group"
                >
                  {/* Icon */}
                  <div
                    className={cn('p-1 rounded-lg shrink-0 border', visual.badgeBg, visual.accentBorder)}
                    style={{ color: visual.color } as React.CSSProperties}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#F8FAFC] text-[11px] truncate">
                        {item.agentName || item.agentId.replace('AGENT_', '')}
                      </span>
                      <span className={cn('px-1.5 py-0.2 rounded font-mono text-[9px] border', statusColor)}>
                        {item.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#94A3B8] block truncate max-w-[150px]">
                      {item.event}
                    </span>
                  </div>

                  {/* Latency */}
                  <div className="text-right shrink-0 pl-1">
                    <span className="font-mono text-[10px] text-[#38BDF8] block">
                      {item.durationMs}ms
                    </span>
                    <span className="font-mono text-[9px] text-[#64748B] block">
                      {item.timestamp && !item.timestamp.includes('Invalid')
                        ? item.timestamp
                        : item.startedAt && !isNaN(new Date(item.startedAt).getTime())
                        ? new Date(item.startedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false,
                          })
                        : 'Just now'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
