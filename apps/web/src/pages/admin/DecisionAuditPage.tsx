import React, { useState, useEffect } from 'react';
import { adminService, AuditLogRecord } from '@/services/adminService';
import {
  AdminPageHeader,
  AdminCard,
  AdminBadge,
  AdminTable,
  AdminDrawer,
  AdminLoadingState,
  AdminErrorState,
  AdminEmptyState,
  ExecutionResultRenderer,
} from '@/components/admin/primitives';
import {
  LuShieldCheck,
  LuSearch,
  LuFilter,
  LuBot,
  LuUser,
  LuCpu,
  LuRotateCcw,
  LuCalendar,
  LuClock,
  LuLayers,
  LuArrowRight,
  LuCode,
  LuInfo,
} from 'react-icons/lu';
import { cn } from '@/lib/utils';

export function DecisionAuditPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [actorTypeFilter, setActorTypeFilter] = useState('ALL');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('ALL');
  const [incidentIdFilter, setIncidentIdFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Selected Log for inspection drawer
  const [selectedLog, setSelectedLog] = useState<AuditLogRecord | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getAuditLogs({
        actorType: actorTypeFilter !== 'ALL' ? actorTypeFilter : undefined,
        resourceType: resourceTypeFilter !== 'ALL' ? resourceTypeFilter : undefined,
        incidentId: incidentIdFilter.trim() || undefined,
        search: search.trim() || undefined,
        page,
        limit: 15,
      });
      const logs = Array.isArray(res?.logs) ? res.logs : Array.isArray(res) ? (res as any) : [];
      setAuditLogs(logs);
      setTotalPages(res?.pagination?.totalPages || 1);
      setTotalRecords(res?.pagination?.total || logs.length);
    } catch (err: any) {
      console.error('Failed to load audit trail:', err);
      setError(err.message || 'Unable to connect to audit log ledger.');
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actorTypeFilter, resourceTypeFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const getActorBadgeVariant = (actorType: string) => {
    switch (actorType) {
      case 'AI_AGENT':
        return 'ai';
      case 'USER':
        return 'primary';
      case 'SYSTEM':
        return 'warning';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      header: 'Action / Event',
      cell: (log: AuditLogRecord) => (
        <div className="space-y-0.5">
          <span className="font-bold text-[#F8FAFC] text-xs font-heading block">
            {log.action}
          </span>
          <span className="text-[10px] text-[#64748B] font-mono block">
            Trace: {log.requestId ? log.requestId.slice(0, 10) + '...' : log._id.slice(-8)}
          </span>
        </div>
      ),
    },
    {
      header: 'Actor',
      cell: (log: AuditLogRecord) => (
        <div className="flex items-center gap-2">
          <AdminBadge size="sm" variant={getActorBadgeVariant(log.actorType)}>
            {log.actorType}
          </AdminBadge>
          {log.actorId && (
            <span className="text-[11px] text-[#94A3B8] font-mono truncate max-w-[120px]">
              {log.actorId}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Resource Target',
      cell: (log: AuditLogRecord) => (
        <div className="space-y-0.5">
          <span className="text-xs font-mono text-[#818CF8] block">
            {log.resourceType}
          </span>
          <span className="text-[10.5px] text-[#94A3B8] font-mono truncate max-w-[150px] block">
            {log.resourceId}
          </span>
        </div>
      ),
    },
    {
      header: 'Audit Timestamp',
      cell: (log: AuditLogRecord) => (
        <div className="text-xs space-y-0.5">
          <span className="text-[#F8FAFC] font-mono block">
            {new Date(log.timestamp).toLocaleTimeString()}
          </span>
          <span className="text-[10.5px] text-[#64748B]">
            {new Date(log.timestamp).toLocaleDateString()}
          </span>
        </div>
      ),
    },
    {
      header: 'Inspection',
      cell: () => (
        <span className="text-xs text-[#5B5BF7] font-semibold hover:underline flex items-center gap-1">
          <span>View Diff</span>
          <LuArrowRight className="w-3 h-3" />
        </span>
      ),
    },
  ];

  return (
    <div className="w-full space-y-6 pb-16 font-sans text-[#F8FAFC]">
      <AdminPageHeader
        title="AI Decisions Audit Ledger"
        description="Immutable cryptographic record of autonomous agent triage decisions, municipal state transitions, and operator interventions."
        tag="GOVERNANCE"
        actions={
          <button
            type="button"
            onClick={fetchLogs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E1B2D] hover:bg-[#13243A] border border-[rgba(148,163,184,0.16)] text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          >
            <LuRotateCcw className="w-3.5 h-3.5" />
            <span>Refresh Ledger</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <AdminCard className="p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <LuSearch className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, resource, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-[#07111F] border border-[rgba(148,163,184,0.16)] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#5B5BF7]"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Incident ID filter */}
          <input
            type="text"
            placeholder="Filter Incident ID..."
            value={incidentIdFilter}
            onChange={(e) => {
              setIncidentIdFilter(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setPage(1);
                fetchLogs();
              }
            }}
            className="h-10 px-3 w-40 bg-[#07111F] border border-[rgba(148,163,184,0.16)] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#5B5BF7]"
          />

          {/* Actor Filter */}
          <select
            value={actorTypeFilter}
            onChange={(e) => {
              setActorTypeFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 bg-[#07111F] border border-[rgba(148,163,184,0.16)] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#5B5BF7]"
          >
            <option value="ALL">All Actor Types</option>
            <option value="AI_AGENT">AI Agents</option>
            <option value="USER">Human Users</option>
            <option value="SYSTEM">System Automations</option>
          </select>

          {/* Resource Filter */}
          <select
            value={resourceTypeFilter}
            onChange={(e) => {
              setResourceTypeFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 bg-[#07111F] border border-[rgba(148,163,184,0.16)] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#5B5BF7]"
          >
            <option value="ALL">All Resources</option>
            <option value="Incident">Incident</option>
            <option value="AIPolicy">AI Policy</option>
            <option value="WorkOrder">Work Order</option>
            <option value="AgentExecution">Agent Execution</option>
            <option value="User">User</option>
          </select>
        </div>
      </AdminCard>

      {/* Audit Log Table */}
      {error ? (
        <AdminErrorState
          title="Audit Ledger Query Failed"
          reason={error}
          onRetry={fetchLogs}
        />
      ) : (
        <AdminTable
          columns={columns}
          data={auditLogs}
          keyExtractor={(l) => l._id}
          onRowClick={(l) => setSelectedLog(l)}
          isLoading={loading}
          emptyMessage="No audit ledger records match the query criteria."
          pagination={{
            currentPage: page,
            totalPages,
            totalRecords,
            pageSize: 15,
            onPageChange: (newPage) => setPage(newPage),
          }}
        />
      )}

      {/* AUDIT EVENT INSPECTION DRAWER */}
      {selectedLog && (
        <AdminDrawer
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Audit Record: ${selectedLog.action}`}
          subtitle={`Ledger ID: ${selectedLog._id}`}
          badge={selectedLog.actorType}
        >
          <div className="space-y-6 text-xs font-sans">
            {/* Meta Strip */}
            <div className="grid grid-cols-2 gap-2.5 p-4 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.12)]">
              <div>
                <span className="text-[#94A3B8] block text-[10px] uppercase font-mono">Actor</span>
                <span className="font-bold text-[#F8FAFC]">{selectedLog.actorId || selectedLog.actorType}</span>
              </div>
              <div>
                <span className="text-[#94A3B8] block text-[10px] uppercase font-mono">Timestamp</span>
                <span className="font-mono text-[#F8FAFC]">
                  {new Date(selectedLog.timestamp).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[#94A3B8] block text-[10px] uppercase font-mono">Resource</span>
                <span className="font-mono text-[#818CF8]">{selectedLog.resourceType}</span>
              </div>
              <div>
                <span className="text-[#94A3B8] block text-[10px] uppercase font-mono">Resource ID</span>
                <span className="font-mono text-[#F8FAFC] truncate block select-all">{selectedLog.resourceId}</span>
              </div>
            </div>

            {/* Trace ID */}
            {selectedLog.requestId && (
              <div className="p-3 rounded-xl bg-[#07111F] border border-[rgba(148,163,184,0.12)] flex items-center justify-between">
                <span className="text-[#94A3B8]">Request Trace ID:</span>
                <span className="font-mono text-[#38BDF8] select-all">{selectedLog.requestId}</span>
              </div>
            )}

            {/* State Before */}
            {selectedLog.before && (
              <div className="space-y-1.5">
                <span className="font-bold text-xs text-[#94A3B8] uppercase tracking-wider block">
                  State Before Transition
                </span>
                <ExecutionResultRenderer
                  data={selectedLog.before}
                  title="Previous Document State"
                  defaultExpanded
                />
              </div>
            )}

            {/* State After */}
            {selectedLog.after && (
              <div className="space-y-1.5">
                <span className="font-bold text-xs text-[#22C55E] uppercase tracking-wider block">
                  State After Transition
                </span>
                <ExecutionResultRenderer
                  data={selectedLog.after}
                  title="Updated Document State"
                  defaultExpanded
                />
              </div>
            )}

            {/* Execution Metadata */}
            {selectedLog.metadata && (
              <div className="space-y-1.5">
                <span className="font-bold text-xs text-[#818CF8] uppercase tracking-wider block">
                  Autonomous Decision & Tool Metadata
                </span>
                <ExecutionResultRenderer
                  data={selectedLog.metadata}
                  title="Execution Context"
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
export default DecisionAuditPage;
