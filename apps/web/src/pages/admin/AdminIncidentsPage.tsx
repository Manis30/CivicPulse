import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { incidentService, getIncidentTitle } from '@/services/incidentService';
import { departmentService, DepartmentInfo } from '@/services/departmentService';
import { Incident, IncidentStatus, SeverityLevel } from '@civicpulse/shared';
import {
  AdminPageHeader,
  AdminCard,
  AdminBadge,
  AdminTable,
  AdminLoadingState,
  AdminErrorState,
  AdminEmptyState,
} from '@/components/admin/primitives';
import {
  LuLayers,
  LuSearch,
  LuFilter,
  LuClock,
  LuBuilding2,
  LuMapPin,
  LuShieldAlert,
  LuRotateCcw,
  LuArrowRight,
  LuTriangleAlert,
} from 'react-icons/lu';
import { cn } from '@/lib/utils';

export function AdminIncidentsPage() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [departments, setDepartments] = useState<DepartmentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [slaFilter, setSlaFilter] = useState('ALL');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [incData, deptData] = await Promise.all([
        incidentService.getIncidents(
          {
            status: statusFilter !== 'ALL' ? (statusFilter as IncidentStatus) : undefined,
            severity: severityFilter !== 'ALL' ? (severityFilter as SeverityLevel) : undefined,
            departmentId: deptFilter !== 'ALL' ? deptFilter : undefined,
            isOverdue: slaFilter === 'OVERDUE' ? true : undefined,
            limit: 100,
          },
          { forceRefresh: true }
        ),
        departmentService.getDepartments().catch(() => []),
      ]);

      setIncidents(Array.isArray(incData) ? incData : []);
      setDepartments(Array.isArray(deptData) ? deptData : []);
    } catch (err: any) {
      console.error('Failed to load global incidents:', err);
      setError(err.message || 'Unable to connect to incident registry.');
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, severityFilter, deptFilter, slaFilter]);

  // Client-side text search over ID, description, address, category
  const safeIncidents = Array.isArray(incidents) ? incidents : [];
  const filteredIncidents = safeIncidents.filter((inc) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      inc.id.toLowerCase().includes(q) ||
      inc.category.toLowerCase().includes(q) ||
      (inc.location?.address && inc.location.address.toLowerCase().includes(q)) ||
      (inc.location?.ward && inc.location.ward.toLowerCase().includes(q)) ||
      (inc.severityReasoning?.explanation && inc.severityReasoning.explanation.toLowerCase().includes(q))
    );
  });

  const getSeverityBadgeVariant = (sev: SeverityLevel) => {
    switch (sev) {
      case 'CRITICAL':
        return 'danger';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'primary';
      default:
        return 'info';
    }
  };

  const getStatusBadgeVariant = (st: IncidentStatus) => {
    switch (st) {
      case 'RESOLVED':
      case 'CLOSED':
        return 'success';
      case 'IN_PROGRESS':
      case 'ASSIGNED':
        return 'primary';
      case 'REOPENED':
        return 'danger';
      default:
        return 'warning';
    }
  };

  const columns = [
    {
      header: 'Incident ID',
      cell: (inc: Incident) => (
        <div className="space-y-0.5">
          <span className="font-bold text-[#F8FAFC] text-xs font-mono block">
            {inc.id}
          </span>
          <span className="text-[10.5px] text-[#64748B] font-mono block truncate max-w-[130px]">
            {inc.primaryReportId || 'Anonymous'}
          </span>
        </div>
      ),
    },
    {
      header: 'Category & Title',
      cell: (inc: Incident) => (
        <div className="space-y-0.5 max-w-[200px]">
          <span className="font-bold text-[#F8FAFC] text-xs truncate block font-heading">
            {getIncidentTitle(inc)}
          </span>
          <span className="text-[10px] text-[#818CF8] font-mono uppercase">
            {inc.category}
          </span>
        </div>
      ),
    },
    {
      header: 'Severity',
      cell: (inc: Incident) => (
        <AdminBadge size="sm" variant={getSeverityBadgeVariant(inc.severity)} dot={inc.severity === 'CRITICAL'}>
          {inc.severity}
        </AdminBadge>
      ),
    },
    {
      header: 'Operational Status',
      cell: (inc: Incident) => (
        <AdminBadge size="sm" variant={getStatusBadgeVariant(inc.status)}>
          {inc.status.replace('_', ' ')}
        </AdminBadge>
      ),
    },
    {
      header: 'Ward / Zone',
      cell: (inc: Incident) => (
        <div className="space-y-0.5 max-w-[150px]">
          <span className="text-xs text-[#F8FAFC] truncate block">
            {inc.location?.ward || 'Central Municipal Ward'}
          </span>
          <span className="text-[10.5px] text-[#64748B] truncate block">
            {inc.location?.address || 'Hosur'}
          </span>
        </div>
      ),
    },
    {
      header: 'Department',
      cell: (inc: Incident) => {
        const dept = departments.find((d) => d.id === inc.departmentId || d.code === inc.departmentId);
        return (
          <span className="text-xs text-[#94A3B8] font-mono">
            {dept?.name || inc.departmentId || 'Roads & Infrastructure'}
          </span>
        );
      },
    },
    {
      header: 'SLA State',
      cell: (inc: Incident) => {
        const isOverdue = inc.sla?.isOverdue;
        return (
          <div className="text-xs space-y-0.5">
            <span className={cn('font-mono font-semibold', isOverdue ? 'text-[#F0526B]' : 'text-[#22C55E]')}>
              {isOverdue ? 'BREACHED' : 'ON TRACK'}
            </span>
            {inc.sla?.deadline && (
              <span className="text-[10px] text-[#64748B] block font-mono">
                {new Date(inc.sla.deadline).toLocaleDateString()}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'AI Risk',
      cell: (inc: Incident) => {
        const score = inc.severityReasoning?.score;
        return (
          <span className={cn('font-mono font-bold text-xs', score && score >= 75 ? 'text-[#F0526B]' : 'text-[#38BDF8]')}>
            {score !== undefined ? `${score}/100` : 'N/A'}
          </span>
        );
      },
    },
    {
      header: 'Created',
      cell: (inc: Incident) => (
        <span className="text-[11px] text-[#64748B] font-mono">
          {new Date(inc.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Dossier',
      cell: () => (
        <span className="text-xs text-[#5B5BF7] font-semibold flex items-center gap-1 hover:underline">
          <span>Open</span>
          <LuArrowRight className="w-3.5 h-3.5" />
        </span>
      ),
    },
  ];

  return (
    <div className="w-full space-y-6 pb-16 font-sans text-[#F8FAFC]">
      <AdminPageHeader
        title="Incident Operations Dossiers"
        description="Global search and governance over city-wide citizen reports, multi-agent triage reasoning, and work orders."
        tag="OPERATIONS"
        actions={
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E1B2D] hover:bg-[#13243A] border border-[rgba(148,163,184,0.16)] text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          >
            <LuRotateCcw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <AdminCard className="p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <LuSearch className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search incident ID, category, ward..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-[#07111F] border border-[rgba(148,163,184,0.16)] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#5B5BF7]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="h-10 px-3 bg-[#07111F] border border-[rgba(148,163,184,0.16)] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#5B5BF7]"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 bg-[#07111F] border border-[rgba(148,163,184,0.16)] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#5B5BF7]"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="ANALYZING">Analyzing</option>
            <option value="VALIDATED">Validated</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="h-10 px-3 bg-[#07111F] border border-[rgba(148,163,184,0.16)] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#5B5BF7]"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* SLA Filter */}
          <select
            value={slaFilter}
            onChange={(e) => setSlaFilter(e.target.value)}
            className="h-10 px-3 bg-[#07111F] border border-[rgba(148,163,184,0.16)] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#5B5BF7]"
          >
            <option value="ALL">All SLA States</option>
            <option value="OVERDUE">Breached Overdue</option>
            <option value="HEALTHY">On Track</option>
          </select>
        </div>
      </AdminCard>

      {/* Incidents Table */}
      {error ? (
        <AdminErrorState
          title="Incident Query Failed"
          reason={error}
          onRetry={loadData}
        />
      ) : (
        <AdminTable
          columns={columns}
          data={filteredIncidents}
          keyExtractor={(inc) => inc.id}
          onRowClick={(inc) => navigate(`/admin/incidents/${inc.id}`)}
          isLoading={loading}
          emptyMessage="No municipal incidents match the specified filter criteria."
        />
      )}
    </div>
  );
}
export default AdminIncidentsPage;
