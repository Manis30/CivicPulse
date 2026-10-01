import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  adminService,
  AdminOverviewData,
} from '@/services/adminService';
import {
  AdminPageHeader,
  AdminStatCard,
  AdminCard,
  AdminBadge,
  AdminLoadingState,
  AdminErrorState,
  AdminEmptyState,
} from '@/components/admin/primitives';
import {
  LuBot,
  LuCircleCheck,
  LuTriangleAlert,
  LuActivity,
  LuShield,
  LuLayers,
  LuServer,
  LuDatabase,
  LuCpu,
  LuRadio,
  LuClock,
  LuRotateCcw,
  LuArrowUpRight,
  LuCircleAlert,
  LuCheck,
} from 'react-icons/lu';
import { cn } from '@/lib/utils';

export function AdminOverviewPage() {
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getOverview();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load overview data:', err);
      setError(err.message || 'Unable to connect to cluster overview services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(fetchOverview, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="w-full space-y-6 pb-16 font-sans text-[#F8FAFC]">
        <AdminPageHeader
          title="Platform Overview & Governance"
          description="Global system telemetry, agent cluster operations, and operational security boundaries."
          tag="AI COMMAND"
        />
        <AdminLoadingState
          message="Querying AI Platform Cluster Telemetry..."
          submessage="Aggregating MongoDB collections, Redis queues, and specialist agent state..."
        />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="w-full space-y-6 pb-16 font-sans text-[#F8FAFC]">
        <AdminPageHeader
          title="Platform Overview & Governance"
          description="Global system telemetry, agent cluster operations, and operational security boundaries."
          tag="AI COMMAND"
        />
        <AdminErrorState
          title="Unable to Query Platform Telemetry"
          reason={error}
          onRetry={fetchOverview}
        />
      </div>
    );
  }

  const {
    kpis,
    systemHealth,
    aiOperations,
    latestExecutions = [],
    attentionRequired = [],
    latestAuditEvents = [],
  } = data!;

  return (
    <div className="w-full space-y-6 pb-16 font-sans text-[#F8FAFC]">
      <AdminPageHeader
        title="Platform Overview & Governance"
        description="Autonomous agent fleet telemetry, BullMQ execution workers, live cluster health, and immutable audit logs."
        tag="AI COMMAND"
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchOverview}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E1B2D] hover:bg-[#13243A] border border-[rgba(148,163,184,0.16)] text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
            >
              <LuRotateCcw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <Link
              to="/admin/agents"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#5B5BF7] hover:bg-[#4F46E5] text-white text-xs font-bold transition-colors shadow-sm"
            >
              <LuBot className="w-3.5 h-3.5" />
              <span>Agent Control Center</span>
            </Link>
          </div>
        }
      />

      {/* TOP KPI ROW: 6 Actionable Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <AdminStatCard
          title="Registered Agents"
          value={kpis.registeredAgents}
          subtitle="Specialist fleet active"
          icon={LuBot}
          accentColor="text-[#5B5BF7]"
          href="/admin/agents"
        />
        <AdminStatCard
          title="Agent Success Rate"
          value={`${kpis.agentSuccessRate}%`}
          subtitle="Operational reliability"
          icon={LuCircleCheck}
          accentColor="text-[#22C55E]"
          statusDot={kpis.agentSuccessRate >= 95 ? 'healthy' : 'warning'}
          href="/admin/agents"
        />
        <AdminStatCard
          title="Active Executions"
          value={kpis.activeExecutions}
          subtitle="In-flight agent tasks"
          icon={LuActivity}
          accentColor="text-[#38BDF8]"
          href="/admin/agents"
        />
        <AdminStatCard
          title="Failed Executions"
          value={kpis.failedExecutions}
          subtitle="Lifetime error traces"
          icon={LuTriangleAlert}
          accentColor={kpis.failedExecutions > 0 ? 'text-[#F0526B]' : 'text-[#64748B]'}
          statusDot={kpis.failedExecutions > 0 ? 'danger' : undefined}
          href="/admin/agents"
        />
        <AdminStatCard
          title="Audit Events"
          value={kpis.auditEvents}
          subtitle="Immutable ledger log"
          icon={LuShield}
          accentColor="text-[#A78BFA]"
          href="/admin/audit"
        />
        <AdminStatCard
          title="Open Incidents"
          value={kpis.openIncidents}
          subtitle="City-wide operations"
          icon={LuLayers}
          accentColor="text-[#F59E0B]"
          href="/admin/incidents"
        />
      </div>

      {/* SECTION 2: SYSTEM HEALTH STRIP */}
      <AdminCard className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[rgba(148,163,184,0.12)]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#13243A] text-[#38BDF8]">
              <LuActivity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-[#F8FAFC]">
                Live Cluster Subsystem Health
              </h3>
              <p className="text-[11px] text-[#94A3B8]">
                Real-time connection pings and runtime status of foundational infrastructure
              </p>
            </div>
          </div>
          <Link
            to="/admin/system"
            className="text-xs text-[#5B5BF7] hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Telemetry Details</span>
            <LuArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-4 text-xs">
          {/* Redis */}
          <div className="p-3.5 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LuServer className="w-4 h-4 text-[#94A3B8]" />
              <span className="font-medium text-[#F8FAFC]">Redis</span>
            </div>
            <AdminBadge
              size="sm"
              variant={systemHealth.redis === 'HEALTHY' ? 'success' : 'danger'}
              dot
            >
              {systemHealth.redis}
            </AdminBadge>
          </div>

          {/* MongoDB */}
          <div className="p-3.5 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LuDatabase className="w-4 h-4 text-[#94A3B8]" />
              <span className="font-medium text-[#F8FAFC]">MongoDB</span>
            </div>
            <AdminBadge
              size="sm"
              variant={systemHealth.mongodb === 'HEALTHY' ? 'success' : 'danger'}
              dot
            >
              {systemHealth.mongodb}
            </AdminBadge>
          </div>

          {/* BullMQ */}
          <div className="p-3.5 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LuCpu className="w-4 h-4 text-[#94A3B8]" />
              <span className="font-medium text-[#F8FAFC]">BullMQ</span>
            </div>
            <AdminBadge
              size="sm"
              variant={systemHealth.bullmq === 'HEALTHY' ? 'success' : 'warning'}
              dot
            >
              {systemHealth.bullmq}
            </AdminBadge>
          </div>

          {/* API */}
          <div className="p-3.5 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LuActivity className="w-4 h-4 text-[#94A3B8]" />
              <span className="font-medium text-[#F8FAFC]">REST API</span>
            </div>
            <AdminBadge size="sm" variant="success" dot>
              {systemHealth.api}
            </AdminBadge>
          </div>

          {/* WebSocket */}
          <div className="p-3.5 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LuRadio className="w-4 h-4 text-[#94A3B8]" />
              <span className="font-medium text-[#F8FAFC]">WebSocket</span>
            </div>
            <AdminBadge size="sm" variant="success" dot>
              {systemHealth.websocket}
            </AdminBadge>
          </div>
        </div>
      </AdminCard>

      {/* SECTION 3: ATTENTION REQUIRED (Surfaced automatically) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LuCircleAlert className="w-4 h-4 text-[#F59E0B]" />
            <h3 className="font-heading font-bold text-sm text-[#F8FAFC]">
              Attention Required
            </h3>
          </div>
          <span className="text-xs text-[#94A3B8] font-mono">
            {attentionRequired.length} Active Notice{attentionRequired.length === 1 ? '' : 's'}
          </span>
        </div>

        {attentionRequired.length === 0 ? (
          <div className="p-5 rounded-2xl bg-[#0E1B2D] border border-[rgba(148,163,184,0.14)] flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#22C55E]/15 text-[#22C55E]">
              <LuCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#F8FAFC]">All Systems Nominal</p>
              <p className="text-[11px] text-[#94A3B8]">
                No agent execution errors, DLQ queue backlogs, or SLA violations detected across the cluster.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {attentionRequired.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                className={cn(
                  'group p-4 rounded-2xl border transition-all flex items-start justify-between gap-3',
                  item.severity === 'danger'
                    ? 'bg-[#15121B] border-[#F0526B]/40 hover:border-[#F0526B]'
                    : 'bg-[#16171F] border-[#F59E0B]/40 hover:border-[#F59E0B]'
                )}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={cn(
                      'p-2 rounded-xl shrink-0 mt-0.5',
                      item.severity === 'danger'
                        ? 'bg-[#F0526B]/20 text-[#FB7185]'
                        : 'bg-[#F59E0B]/20 text-[#FBBF24]'
                    )}
                  >
                    <LuTriangleAlert className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <span className="font-bold text-xs text-[#F8FAFC] group-hover:text-white transition-colors block">
                      {item.title}
                    </span>
                    <p className="text-[11px] text-[#94A3B8] line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <LuArrowUpRight className="w-4 h-4 text-[#64748B] group-hover:text-white transition-colors shrink-0 mt-1" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 4: AI OPERATIONS & LIVE AGENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: AI Operations Counters */}
        <div className="space-y-4 lg:col-span-1">
          <AdminCard className="p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(148,163,184,0.12)]">
              <h3 className="font-heading font-bold text-sm text-[#F8FAFC]">
                AI Operations Throughput
              </h3>
              <AdminBadge variant="ai" size="sm">
                AUTONOMOUS PIPELINE
              </AdminBadge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-[rgba(148,163,184,0.08)]">
                <span className="text-[#94A3B8]">Citizen Reports Today</span>
                <span className="font-bold text-[#F8FAFC] font-mono">{aiOperations.reportsToday}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[rgba(148,163,184,0.08)]">
                <span className="text-[#94A3B8]">AI Triaged & Validated</span>
                <span className="font-bold text-[#22C55E] font-mono">{aiOperations.aiTriaged}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[rgba(148,163,184,0.08)]">
                <span className="text-[#94A3B8]">Currently In Progress</span>
                <span className="font-bold text-[#38BDF8] font-mono">{aiOperations.currentlyProcessing}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[rgba(148,163,184,0.08)]">
                <span className="text-[#94A3B8]">Failed Executions</span>
                <span className={cn('font-bold font-mono', aiOperations.failedExecutions > 0 ? 'text-[#F0526B]' : 'text-[#64748B]')}>
                  {aiOperations.failedExecutions}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#94A3B8]">DLQ Jobs</span>
                <span className={cn('font-bold font-mono', aiOperations.dlqJobs > 0 ? 'text-[#F59E0B]' : 'text-[#64748B]')}>
                  {aiOperations.dlqJobs}
                </span>
              </div>
            </div>
          </AdminCard>

          {/* Quick Nav Card */}
          <AdminCard className="p-5 space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-[#94A3B8]">
              Governance Shortcuts
            </h4>
            <div className="space-y-1.5 text-xs">
              <Link
                to="/admin/policies"
                className="p-2.5 rounded-xl bg-[#101F33] hover:bg-[#13243A] flex items-center justify-between text-[#F8FAFC] transition-colors"
              >
                <span>AI Threshold Policies</span>
                <LuArrowUpRight className="w-3.5 h-3.5 text-[#64748B]" />
              </Link>
              <Link
                to="/admin/users"
                className="p-2.5 rounded-xl bg-[#101F33] hover:bg-[#13243A] flex items-center justify-between text-[#F8FAFC] transition-colors"
              >
                <span>RBAC & User Governance</span>
                <LuArrowUpRight className="w-3.5 h-3.5 text-[#64748B]" />
              </Link>
              <Link
                to="/admin/departments"
                className="p-2.5 rounded-xl bg-[#101F33] hover:bg-[#13243A] flex items-center justify-between text-[#F8FAFC] transition-colors"
              >
                <span>Departments & Wards</span>
                <LuArrowUpRight className="w-3.5 h-3.5 text-[#64748B]" />
              </Link>
            </div>
          </AdminCard>
        </div>

        {/* Right: Latest Real Executions & Latest Real Audit Events */}
        <div className="space-y-6 lg:col-span-2">
          {/* Latest Real Agent Executions */}
          <AdminCard className="p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(148,163,184,0.12)]">
              <div className="flex items-center gap-2">
                <LuBot className="w-4 h-4 text-[#5B5BF7]" />
                <h3 className="font-heading font-bold text-sm text-[#F8FAFC]">
                  Latest Real Agent Executions
                </h3>
              </div>
              <Link
                to="/admin/agents"
                className="text-xs text-[#5B5BF7] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>All Executions</span>
                <LuArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {latestExecutions.length === 0 ? (
              <AdminEmptyState
                title="No agent executions logged"
                description="Specialist agents run automatically when citizen reports are submitted or verified."
              />
            ) : (
              <div className="space-y-2.5">
                {latestExecutions.map((exec) => (
                  <div
                    key={exec._id}
                    className="p-3.5 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#F8FAFC] font-heading">{exec.agentId}</span>
                        <AdminBadge
                          size="sm"
                          variant={
                            exec.status === 'COMPLETED'
                              ? 'success'
                              : exec.status === 'FAILED'
                              ? 'danger'
                              : 'primary'
                          }
                        >
                          {exec.status}
                        </AdminBadge>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[#94A3B8]">
                        <span>Latency: {exec.durationMs}ms</span>
                        <span>Model: {exec.modelUsed || 'GEMINI_AI'}</span>
                        {exec.incidentId && <span>Incident: {String(exec.incidentId).slice(-6)}</span>}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-[#64748B] block font-mono">
                        {new Date(exec.startedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AdminCard>

          {/* Latest Platform Audit Events */}
          <AdminCard className="p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(148,163,184,0.12)]">
              <div className="flex items-center gap-2">
                <LuShield className="w-4 h-4 text-[#A78BFA]" />
                <h3 className="font-heading font-bold text-sm text-[#F8FAFC]">
                  Recent Platform Events
                </h3>
              </div>
              <Link
                to="/admin/audit"
                className="text-xs text-[#5B5BF7] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Audit Ledger</span>
                <LuArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {latestAuditEvents.length === 0 ? (
              <AdminEmptyState
                title="No audit events recorded"
                description="Events are recorded immutably on state transitions, triage actions, and policy updates."
              />
            ) : (
              <div className="space-y-2">
                {latestAuditEvents.map((event) => (
                  <div
                    key={event._id}
                    className="p-3 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.08)] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <AdminBadge
                          size="sm"
                          variant={
                            event.actorType === 'AI_AGENT'
                              ? 'ai'
                              : event.actorType === 'USER'
                              ? 'primary'
                              : 'default'
                          }
                        >
                          {event.actorType}
                        </AdminBadge>
                        <span className="font-bold text-[#F8FAFC] truncate">{event.action}</span>
                      </div>
                      <p className="text-[11px] text-[#64748B] font-mono truncate">
                        Resource: {event.resourceType} / {event.resourceId}
                      </p>
                    </div>

                    <span className="text-[11px] text-[#94A3B8] font-mono shrink-0">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
export default AdminOverviewPage;
