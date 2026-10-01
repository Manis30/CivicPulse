import React, { useState, useEffect } from 'react';
import { adminService, SystemHealth, SystemQueues } from '@/services/adminService';
import {
  AdminPageHeader,
  AdminCard,
  AdminBadge,
  AdminLoadingState,
  AdminErrorState,
} from '@/components/admin/primitives';
import {
  LuServer,
  LuDatabase,
  LuCpu,
  LuRadio,
  LuActivity,
  LuRotateCcw,
  LuLayers,
  LuCircleCheck,
  LuTriangleAlert,
  LuClock,
  LuTerminal,
} from 'react-icons/lu';
import { cn } from '@/lib/utils';

export function SystemTelemetryPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [queues, setQueues] = useState<SystemQueues | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fetchTelemetry = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const [healthData, queueData] = await Promise.all([
        adminService.getSystemHealth(),
        adminService.getSystemQueues(),
      ]);
      setHealth(healthData);
      setQueues(queueData);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err: any) {
      console.error('Failed to query system telemetry:', err);
      setError(err.message || 'System telemetry service unreachable.');
      setLastChecked(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 10000); // 10s poll
    return () => clearInterval(interval);
  }, []);

  const mongoStatus = health?.services?.mongodb?.status === 'healthy';
  const redisStatus = health?.services?.redis?.status === 'healthy';
  const bullmqStatus = health?.services?.bullmq?.status === 'healthy';

  const orchQueue = queues?.queues?.orchestration || {
    waiting: 0,
    active: 0,
    completed: 0,
    failed: 0,
    delayed: 0,
    total: 0,
  };

  const dlqQueue = queues?.queues?.deadLetter || {
    waiting: 0,
    active: 0,
    completed: 0,
    failed: 0,
    delayed: 0,
    total: 0,
  };

  return (
    <div className="w-full space-y-6 pb-16 font-sans text-[#F8FAFC]">
      <AdminPageHeader
        title="System Infrastructure & Telemetry"
        description="Live diagnostics of Redis BullMQ queues, MongoDB connection pool, Node.js process RSS, and distributed workers."
        tag="OPERATIONS"
        actions={
          <div className="flex items-center gap-2.5">
            {lastChecked && (
              <span className="text-xs text-[#64748B] font-mono hidden sm:inline">
                Last checked: {lastChecked}
              </span>
            )}
            <button
              type="button"
              onClick={fetchTelemetry}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E1B2D] hover:bg-[#13243A] border border-[rgba(148,163,184,0.16)] text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition-colors cursor-pointer"
            >
              <LuRotateCcw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin')} />
              <span>{refreshing ? 'Polling...' : 'Poll Runtime'}</span>
            </button>
          </div>
        }
      />

      {error && !health && (
        <AdminErrorState
          title="Telemetry Polling Error"
          reason={error}
          onRetry={fetchTelemetry}
        />
      )}

      {loading && !health ? (
        <AdminLoadingState
          message="Querying system telemetry..."
          submessage="Inspecting database connection pools, memory RSS, and Redis BullMQ queues..."
        />
      ) : (
        <>
          {/* Subsystem Health Cards Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Redis */}
            <AdminCard className="p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span>Redis Cluster</span>
                <LuServer className={cn('w-4 h-4', redisStatus ? 'text-[#22C55E]' : 'text-[#F0526B]')} />
              </div>
              <div>
                <p className={cn('text-2xl font-bold font-heading', redisStatus ? 'text-[#22C55E]' : 'text-[#F0526B]')}>
                  {redisStatus ? 'CONNECTED' : 'DISCONNECTED'}
                </p>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  {redisStatus ? `Ping Latency: ${health?.services?.redis?.pingMs ?? 0}ms` : 'Error: ECONNREFUSED / Offline'}
                </p>
              </div>
              <div className="pt-2 border-t border-[rgba(148,163,184,0.08)] flex justify-between text-[11px] text-[#94A3B8]">
                <span>Port: 6379</span>
                <AdminBadge size="sm" variant={redisStatus ? 'success' : 'danger'} dot>
                  {redisStatus ? 'ONLINE' : 'OFFLINE'}
                </AdminBadge>
              </div>
            </AdminCard>

            {/* BullMQ */}
            <AdminCard className="p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span>BullMQ Workers</span>
                <LuCpu className={cn('w-4 h-4', bullmqStatus ? 'text-[#5B5BF7]' : 'text-[#F59E0B]')} />
              </div>
              <div>
                <p className={cn('text-2xl font-bold font-heading text-[#F8FAFC]')}>
                  {bullmqStatus ? 'INITIALIZED' : 'INACTIVE'}
                </p>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Workers: {health?.services?.bullmq?.activeWorkers ?? 0} • Concurrency: 2
                </p>
              </div>
              <div className="pt-2 border-t border-[rgba(148,163,184,0.08)] flex justify-between text-[11px] text-[#94A3B8]">
                <span>State</span>
                <AdminBadge size="sm" variant={bullmqStatus ? 'success' : 'warning'} dot>
                  {bullmqStatus ? 'READY' : 'OFFLINE'}
                </AdminBadge>
              </div>
            </AdminCard>

            {/* MongoDB */}
            <AdminCard className="p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span>MongoDB Storage</span>
                <LuDatabase className={cn('w-4 h-4', mongoStatus ? 'text-[#38BDF8]' : 'text-[#F0526B]')} />
              </div>
              <div>
                <p className={cn('text-2xl font-bold font-heading', mongoStatus ? 'text-[#F8FAFC]' : 'text-[#F0526B]')}>
                  {mongoStatus ? 'CONNECTED' : 'OFFLINE'}
                </p>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Ping Latency: {health?.services?.mongodb?.pingMs ?? 0}ms
                </p>
              </div>
              <div className="pt-2 border-t border-[rgba(148,163,184,0.08)] flex justify-between text-[11px] text-[#94A3B8]">
                <span>Pool</span>
                <AdminBadge size="sm" variant={mongoStatus ? 'success' : 'danger'} dot>
                  {mongoStatus ? 'POOLED' : 'DISCONNECTED'}
                </AdminBadge>
              </div>
            </AdminCard>

            {/* Process RSS */}
            <AdminCard className="p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span>Node.js Process RSS</span>
                <LuActivity className="w-4 h-4 text-[#A78BFA]" />
              </div>
              <div>
                <p className="text-2xl font-bold font-heading text-[#F8FAFC]">
                  {health?.services?.memory?.rssMb ?? 0} MB
                </p>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Heap Used: {health?.services?.memory?.heapUsedMb ?? 0} MB
                </p>
              </div>
              <div className="pt-2 border-t border-[rgba(148,163,184,0.08)] flex justify-between text-[11px] text-[#94A3B8]">
                <span>Uptime</span>
                <span className="font-mono text-[#F8FAFC]">
                  {Math.floor((health?.uptimeSeconds || 0) / 60)} min
                </span>
              </div>
            </AdminCard>
          </div>

          {/* BullMQ Distributed Queue Breakdown */}
          <AdminCard className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[rgba(148,163,184,0.12)]">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <LuLayers className="w-4 h-4 text-[#5B5BF7]" />
                  <h3 className="font-heading font-bold text-sm text-[#F8FAFC]">
                    BullMQ Workflow Queue Depth & Job States
                  </h3>
                </div>
                <p className="text-xs text-[#94A3B8]">
                  Queue: <code className="text-[#818CF8]">agent-orchestration-queue</code>
                </p>
              </div>

              <AdminBadge size="sm" variant={bullmqStatus ? 'success' : 'warning'}>
                {queues?.status?.toUpperCase() || 'UNHEALTHY'}
              </AdminBadge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center text-xs">
              <div className="p-3.5 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)]">
                <span className="text-[10px] text-[#94A3B8] uppercase font-mono block">Waiting</span>
                <span className="text-xl font-bold font-heading text-[#F8FAFC]">{orchQueue.waiting}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)]">
                <span className="text-[10px] text-[#38BDF8] uppercase font-mono block">Active</span>
                <span className="text-xl font-bold font-heading text-[#38BDF8]">{orchQueue.active}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)]">
                <span className="text-[10px] text-[#22C55E] uppercase font-mono block">Completed</span>
                <span className="text-xl font-bold font-heading text-[#22C55E]">{orchQueue.completed}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)]">
                <span className="text-[10px] text-[#F0526B] uppercase font-mono block">Failed</span>
                <span className={cn('text-xl font-bold font-heading', orchQueue.failed > 0 ? 'text-[#F0526B]' : 'text-[#64748B]')}>
                  {orchQueue.failed}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)]">
                <span className="text-[10px] text-[#F59E0B] uppercase font-mono block">Delayed</span>
                <span className="text-xl font-bold font-heading text-[#F8FAFC]">{orchQueue.delayed}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)]">
                <span className="text-[10px] text-[#A78BFA] uppercase font-mono block">DLQ Jobs</span>
                <span className={cn('text-xl font-bold font-heading', dlqQueue.failed > 0 ? 'text-[#F59E0B]' : 'text-[#64748B]')}>
                  {dlqQueue.failed}
                </span>
              </div>
            </div>
          </AdminCard>

          {/* Node Process & Network Telemetry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Process Execution Environment */}
            <AdminCard className="p-5 space-y-3 text-xs">
              <div className="flex items-center gap-2 pb-2.5 border-b border-[rgba(148,163,184,0.12)]">
                <LuTerminal className="w-4 h-4 text-[#38BDF8]" />
                <h4 className="font-heading font-bold text-sm text-[#F8FAFC]">
                  Process Environment Diagnostics
                </h4>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-[rgba(148,163,184,0.06)]">
                  <span className="text-[#94A3B8]">Runtime Engine</span>
                  <span className="font-mono text-[#F8FAFC]">Node.js v20+ / ESM</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[rgba(148,163,184,0.06)]">
                  <span className="text-[#94A3B8]">Process Memory RSS</span>
                  <span className="font-mono text-[#F8FAFC]">{health?.services?.memory?.rssMb ?? 0} MB</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[rgba(148,163,184,0.06)]">
                  <span className="text-[#94A3B8]">Heap Used / Total</span>
                  <span className="font-mono text-[#F8FAFC]">
                    {health?.services?.memory?.heapUsedMb ?? 0} MB / {health?.services?.memory?.heapTotalMb ?? 0} MB
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#94A3B8]">Process Architecture</span>
                  <span className="font-mono text-[#818CF8]">x64 (Windows Node Worker)</span>
                </div>
              </div>
            </AdminCard>

            {/* WebSocket & Realtime Events */}
            <AdminCard className="p-5 space-y-3 text-xs">
              <div className="flex items-center gap-2 pb-2.5 border-b border-[rgba(148,163,184,0.12)]">
                <LuRadio className="w-4 h-4 text-[#22C55E]" />
                <h4 className="font-heading font-bold text-sm text-[#F8FAFC]">
                  WebSocket Gateway & Streaming
                </h4>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-[rgba(148,163,184,0.06)]">
                  <span className="text-[#94A3B8]">Gateway Protocol</span>
                  <span className="font-mono text-[#F8FAFC]">WebSocket (ws://)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[rgba(148,163,184,0.06)]">
                  <span className="text-[#94A3B8]">Event Channel</span>
                  <span className="font-mono text-[#818CF8]">/incidents/events</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[rgba(148,163,184,0.06)]">
                  <span className="text-[#94A3B8]">Dispatch Latency</span>
                  <span className="font-mono text-[#22C55E]">&lt; 15 ms</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#94A3B8]">Connection State</span>
                  <AdminBadge size="sm" variant="success" dot>
                    ACTIVE
                  </AdminBadge>
                </div>
              </div>
            </AdminCard>
          </div>
        </>
      )}
    </div>
  );
}
export default SystemTelemetryPage;
