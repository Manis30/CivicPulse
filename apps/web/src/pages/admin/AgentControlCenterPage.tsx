import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  adminService,
  AgentTelemetry,
  AgentMetrics,
  AgentActivityItem,
  AgentNetworkData,
  AgentExecutionRecord,
} from '@/services/adminService';
import { authService } from '@/services/authService';
import { AgentNetworkView } from '@/components/admin/agent-control/AgentNetworkView';
import { AgentDetailDrawer } from '@/components/admin/agent-control/AgentDetailDrawer';
import {
  AdminLoadingState,
  AdminErrorState,
  AdminDrawer,
  ExecutionResultRenderer,
} from '@/components/admin/primitives';
import {
  LuBot,
  LuActivity,
  LuLayers,
  LuTrendingUp,
  LuTriangleAlert,
  LuClock,
  LuRotateCcw,
  LuShieldCheck,
  LuBell,
} from 'react-icons/lu';
import { cn } from '@/lib/utils';

export function AgentControlCenterPage() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  // Primary State
  const [agents, setAgents] = useState<AgentTelemetry[]>([]);
  const [metrics, setMetrics] = useState<AgentMetrics | null>(null);
  const [activity, setActivity] = useState<AgentActivityItem[]>([]);
  const [networkData, setNetworkData] = useState<AgentNetworkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interaction State
  const [selectedAgent, setSelectedAgent] = useState<AgentTelemetry | null>(null);
  const [isFeedPaused, setIsFeedPaused] = useState(false);
  const [viewAllModalOpen, setViewAllModalOpen] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState<AgentExecutionRecord | null>(null);

  const adminName = currentUser?.name || 'David Kim';
  const userInitials = (() => {
    const parts = adminName.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0]?.slice(0, 2).toUpperCase() || 'DK';
  })();

  // Load all real data from backend
  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [agentList, metricsRes, activityRes, networkRes] = await Promise.all([
        adminService.getAgentTelemetry(),
        adminService.getAgentMetrics().catch(() => null),
        adminService.getAgentActivity(30).catch(() => []),
        adminService.getAgentNetwork().catch(() => null),
      ]);

      setAgents(Array.isArray(agentList) ? agentList : []);
      if (metricsRes) setMetrics(metricsRes);
      setActivity(Array.isArray(activityRes) ? activityRes : []);
      if (networkRes) setNetworkData(networkRes);
    } catch (err: any) {
      console.error('Failed to load agent control center telemetry:', err);
      setError(err.message || 'Unable to connect to agent execution telemetry services.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    if (isFeedPaused) return;

    const interval = setInterval(() => {
      loadData();
    }, 15000);

    return () => clearInterval(interval);
  }, [loadData, isFeedPaused]);

  // Derived KPI metrics with fallback to real aggregation
  const totalAgents = metrics?.totalAgents ?? agents.length ?? 10;
  const activeAgents =
    metrics?.activeAgents ?? agents.filter((a) => a.status === 'ACTIVE' || a.status === 'RUNNING').length;
  const totalRuns =
    metrics?.totalRuns ?? agents.reduce((acc, a) => acc + (a.totalExecutions || 0), 0);

  const successRate =
    metrics?.successRate ??
    (totalRuns > 0
      ? Math.round(
          (agents.reduce((acc, a) => acc + (a.totalExecutions * (a.successRate / 100)), 0) /
            totalRuns) *
            10
        ) / 10
      : 100);

  const failedRuns =
    metrics?.failedRuns ?? agents.reduce((acc, a) => acc + (a.failureCount || 0), 0);

  const avgLatencyMs =
    metrics?.averageLatencyMs ??
    (agents.length > 0
      ? Math.round(
          agents.reduce((acc, a) => acc + (a.averageLatencyMs || 0), 0) / agents.length
        )
      : 0);

  const clusterHealthPercent = metrics?.clusterHealth?.percentage ?? 100;
  const clusterHealthStatus = metrics?.clusterHealth?.status ?? 'healthy';

  const latestChain = networkData?.latestChain || [];
  const activeChainAgentIds = Array.from(
    new Set([
      ...latestChain.map((step) => step.agentId),
      ...agents.filter((a) => a.status === 'RUNNING').map((a) => a.agentId),
      ...activity.filter((a) => a.status === 'RUNNING').map((a) => a.agentId),
    ])
  );

  return (
    <div className="w-full space-y-6 pb-16 font-sans text-[#F8FAFC]">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title & Status */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#F8FAFC] tracking-tight">
              AI Agent Control Center
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-mono font-bold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8] font-normal leading-relaxed">
            10 specialist agents autonomously monitoring, analyzing, and coordinating civic incident operations.
          </p>
        </div>

        {/* Right Header Status Widgets */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Cluster Health Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#091528] border border-[rgba(148,163,184,0.16)] text-xs font-mono shadow-xs">
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                clusterHealthStatus === 'healthy' ? 'bg-emerald-400' : 'bg-amber-400'
              )}
            />
            <span className="text-[#94A3B8] font-bold">CLUSTER HEALTH:</span>
            <span className="font-bold text-[#F8FAFC]">{clusterHealthPercent}%</span>
          </div>

          {/* Refresh Action */}
          <button
            type="button"
            onClick={() => loadData()}
            className="p-2 rounded-xl bg-[#091528] hover:bg-[#0E1F3B] border border-[rgba(148,163,184,0.16)] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
            title="Refresh real-time telemetry"
          >
            <LuRotateCcw className="w-4 h-4" />
          </button>

          {/* Authenticated Admin Profile Pill */}
          <button
            type="button"
            onClick={() => navigate('/admin/profile')}
            className="flex items-center gap-2.5 p-1 pl-2.5 pr-3 rounded-xl bg-[#091528] hover:bg-[#0E1F3B] border border-[rgba(148,163,184,0.16)] text-xs transition-colors group cursor-pointer"
            title="View Platform Administrator Profile"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {userInitials}
            </div>
            <div className="text-left hidden sm:block">
              <span className="font-bold text-[#F8FAFC] block leading-tight group-hover:text-indigo-300 transition-colors">
                {adminName}
              </span>
              <span className="text-[10px] text-[#64748B] font-mono block leading-tight">
                Platform Admin
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 2. TOP KPI STRIP (REAL DATABASE VALUES) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Agents */}
        <div className="p-3.5 rounded-2xl bg-[#081222]/90 border border-[rgba(148,163,184,0.14)] shadow-md flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 shrink-0">
            <LuBot className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-lg sm:text-xl font-bold font-heading text-[#F8FAFC] block leading-tight">
              {totalAgents}
            </span>
            <span className="text-[11px] font-sans text-[#94A3B8] truncate block">
              Agents
            </span>
          </div>
        </div>

        {/* Active Agents */}
        <div className="p-3.5 rounded-2xl bg-[#081222]/90 border border-[rgba(148,163,184,0.14)] shadow-md flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shrink-0">
            <LuShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-lg sm:text-xl font-bold font-heading text-emerald-400 block leading-tight">
              {activeAgents}
            </span>
            <span className="text-[11px] font-sans text-[#94A3B8] truncate block">
              Active
            </span>
          </div>
        </div>

        {/* Total Runs */}
        <div className="p-3.5 rounded-2xl bg-[#081222]/90 border border-[rgba(148,163,184,0.14)] shadow-md flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/25 shrink-0">
            <LuLayers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-lg sm:text-xl font-bold font-heading text-[#F8FAFC] block leading-tight">
              {totalRuns}
            </span>
            <span className="text-[11px] font-sans text-[#94A3B8] truncate block">
              Total Runs
            </span>
          </div>
        </div>

        {/* Success Rate */}
        <div className="p-3.5 rounded-2xl bg-[#081222]/90 border border-[rgba(148,163,184,0.14)] shadow-md flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shrink-0">
            <LuTrendingUp className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-lg sm:text-xl font-bold font-heading text-emerald-400 block leading-tight">
              {successRate}%
            </span>
            <span className="text-[11px] font-sans text-[#94A3B8] truncate block">
              Success Rate
            </span>
          </div>
        </div>

        {/* Failed Runs */}
        <div className="p-3.5 rounded-2xl bg-[#081222]/90 border border-[rgba(148,163,184,0.14)] shadow-md flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/25 shrink-0">
            <LuTriangleAlert className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-lg sm:text-xl font-bold font-heading text-rose-400 block leading-tight">
              {failedRuns}
            </span>
            <span className="text-[11px] font-sans text-[#94A3B8] truncate block">
              Failed Runs
            </span>
          </div>
        </div>

        {/* Average Latency */}
        <div className="p-3.5 rounded-2xl bg-[#081222]/90 border border-[rgba(148,163,184,0.14)] shadow-md flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 shrink-0">
            <LuClock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-lg sm:text-xl font-bold font-heading text-[#38BDF8] block leading-tight">
              {avgLatencyMs > 999 ? `${(avgLatencyMs / 1000).toFixed(2)}s` : `${avgLatencyMs}ms`}
            </span>
            <span className="text-[11px] font-sans text-[#94A3B8] truncate block">
              Avg Latency
            </span>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE: 2-COLUMN CINEMATIC LAYOUT */}
      {loading && agents.length === 0 ? (
        <AdminLoadingState
          message="Connecting to autonomous AI agent network..."
          submessage="Streaming live execution traces and calculating node latency distributions..."
        />
      ) : error && agents.length === 0 ? (
        <AdminErrorState
          title="Telemetry Connection Failed"
          reason={error}
          onRetry={loadData}
        />
      ) : (
        // 3. FULL-WIDTH AI ORCHESTRATION HERO
        <div className="w-full">
          <AgentNetworkView
            agents={agents}
            selectedAgentId={selectedAgent?.agentId}
            onSelectAgent={(ag) => setSelectedAgent(ag)}
            activeChainAgentIds={activeChainAgentIds}
            recentActivity={activity}
            onSelectExecution={(id) => {
              adminService
                .getAgentExecutionById(id)
                .then((rec) => setSelectedExecution(rec))
                .catch(() => {});
            }}
          />
        </div>
      )}

      {/* 4. AGENT DETAIL DRAWER (SLIDE-IN FROM RIGHT ON CLICK) */}
      <AgentDetailDrawer
        agent={selectedAgent}
        isOpen={Boolean(selectedAgent)}
        onClose={() => setSelectedAgent(null)}
        onSelectExecution={(ex) => setSelectedExecution(ex)}
      />

      {/* 5. VIEW ALL EXECUTIONS MODAL / DRAWER */}
      {viewAllModalOpen && (
        <AdminDrawer
          isOpen={viewAllModalOpen}
          onClose={() => setViewAllModalOpen(false)}
          title="All Autonomous Agent Executions"
          subtitle="Real-time execution ledger recorded across the 10 specialist agents"
          badge="LEDGER"
        >
          <div className="space-y-3 p-1">
            {activity.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  adminService
                    .getAgentExecutionById(item.executionId || item.id)
                    .then((rec) => setSelectedExecution(rec))
                    .catch(() => {});
                }}
                className="p-3 rounded-xl bg-[#0C172C] hover:bg-[#10203D] border border-[rgba(148,163,184,0.12)] hover:border-indigo-500/50 transition-colors cursor-pointer text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-[#F8FAFC]">
                    {item.agentName}
                  </span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase',
                      item.status === 'FAILED'
                        ? 'bg-rose-500/15 text-rose-400'
                        : 'bg-emerald-500/15 text-emerald-400'
                    )}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="text-[11px] text-[#94A3B8]">{item.event}</p>
                <div className="flex items-center justify-between text-[10.5px] font-mono text-[#64748B] pt-1">
                  <span>Duration: {item.durationMs}ms</span>
                  <span>{item.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </AdminDrawer>
      )}

      {/* 6. TECHNICAL EXECUTION DETAIL MODAL */}
      {selectedExecution && (
        <AdminDrawer
          isOpen={Boolean(selectedExecution)}
          onClose={() => setSelectedExecution(null)}
          title={`Execution ${selectedExecution.executionId || selectedExecution._id.slice(-8)}`}
          subtitle={`Agent: ${selectedExecution.agentId} • Duration: ${selectedExecution.durationMs}ms`}
          badge={selectedExecution.status}
        >
          <div className="space-y-4 text-xs font-sans p-1">
            <div className="p-3.5 rounded-xl bg-[#0C172C] border border-[rgba(148,163,184,0.1)] space-y-2">
              <span className="text-[10px] font-mono uppercase text-[#64748B] block font-bold">
                Execution Metadata
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-[#64748B] block text-[10px]">STATUS</span>
                  <span className="font-bold text-[#F8FAFC]">{selectedExecution.status}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px]">DURATION</span>
                  <span className="font-bold text-[#38BDF8]">{selectedExecution.durationMs}ms</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px]">MODEL</span>
                  <span className="text-[#818CF8]">{selectedExecution.modelUsed || 'GEMINI_AI'}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px]">STARTED</span>
                  <span className="text-[#94A3B8]">
                    {new Date(selectedExecution.startedAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>

            {selectedExecution.reasoning && (
              <div className="p-3.5 rounded-xl bg-[#0C172C] border border-[rgba(148,163,184,0.1)] space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-[#64748B] block font-bold">
                  Autonomous Decision Reasoning
                </span>
                <p className="text-xs text-[#F8FAFC] leading-relaxed">
                  {selectedExecution.reasoning}
                </p>
              </div>
            )}

            {selectedExecution.toolsCalled && selectedExecution.toolsCalled.length > 0 && (
              <div className="p-3.5 rounded-xl bg-[#0C172C] border border-[rgba(148,163,184,0.1)] space-y-2">
                <span className="text-[10px] font-mono uppercase text-[#64748B] block font-bold">
                  Tools Executed ({selectedExecution.toolsCalled.length})
                </span>
                <div className="space-y-1.5">
                  {selectedExecution.toolsCalled.map((t, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-[#081222] font-mono text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-[#818CF8]">
                        <span>{t.toolName}()</span>
                        <span>{t.durationMs}ms</span>
                      </div>
                      {t.output && (
                        <p className="text-[#94A3B8] text-[10px] truncate">
                          {typeof t.output === 'object' ? JSON.stringify(t.output) : String(t.output)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedExecution.error && (
              <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-rose-400 block font-bold">
                  Failure Reason
                </span>
                <ExecutionResultRenderer
                  data={selectedExecution.error}
                  isError
                  defaultExpanded
                />
              </div>
            )}
          </div>
        </AdminDrawer>
      )}
    </div>
  );
}

export default AgentControlCenterPage;
