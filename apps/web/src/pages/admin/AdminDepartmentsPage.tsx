import React, { useState, useEffect } from 'react';
import { departmentService, DepartmentInfo } from '@/services/departmentService';
import { teamService, TeamInfo } from '@/services/teamService';
import { incidentService } from '@/services/incidentService';
import { Incident } from '@civicpulse/shared';
import {
  AdminPageHeader,
  AdminCard,
  AdminStatCard,
  AdminBadge,
  AdminLoadingState,
  AdminErrorState,
  AdminEmptyState,
} from '@/components/admin/primitives';
import {
  LuBuilding2,
  LuUsers,
  LuLayers,
  LuTriangleAlert,
  LuClock,
  LuRotateCcw,
  LuShieldCheck,
  LuMapPin,
  LuChevronRight,
  LuActivity,
} from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<DepartmentInfo[]>([]);
  const [teams, setTeams] = useState<TeamInfo[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [deptData, teamData, incData] = await Promise.all([
        departmentService.getDepartments(),
        teamService.getTeams(),
        incidentService.getIncidents({ limit: 100 }).catch(() => []),
      ]);

      const depts = Array.isArray(deptData) ? deptData : [];
      setDepartments(depts);
      setTeams(Array.isArray(teamData) ? teamData : []);
      setIncidents(Array.isArray(incData) ? incData : []);

      if (depts.length > 0 && !selectedDeptId) {
        setSelectedDeptId(depts[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load department operational data:', err);
      setError(err.message || 'Unable to connect to department operations registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedDept = departments.find((d) => d.id === selectedDeptId) || departments[0];

  // Incidents assigned to this department
  const deptIncidents = selectedDept
    ? incidents.filter((i) => {
        const dId = (i as any).departmentId?._id || (i as any).departmentId;
        if (dId === selectedDept.id || dId === selectedDept.code) return true;
        if (selectedDept.categories?.includes(i.category)) return true;
        return false;
      })
    : [];

  const openCount = deptIncidents.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;
  const criticalCount = deptIncidents.filter((i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length;
  const inProgressCount = deptIncidents.filter((i) => i.status === 'IN_PROGRESS').length;
  const overdueCount = deptIncidents.filter((i) => (i as any).slaState?.isOverdue).length;
  const slaCompliance = openCount > 0 ? Math.max(0, Math.round(((openCount - overdueCount) / openCount) * 100)) : 100;

  // Field teams belonging to this department
  const deptTeams = selectedDept
    ? teams.filter((t) => t.departmentId === selectedDept.id || t.departmentId === selectedDept.code)
    : [];

  const availableTeamsCount = deptTeams.filter((t) => t.availabilityStatus === 'AVAILABLE').length;

  return (
    <div className="w-full space-y-6 pb-16 font-sans text-[#F8FAFC]">
      <AdminPageHeader
        title="Departments & Municipal Wards"
        description="Inspect jurisdictional boundaries, active team capacity, and automated dispatch routing per department."
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

      {loading && departments.length === 0 ? (
        <AdminLoadingState
          message="Loading department operations..."
          submessage="Querying jurisdictional boundaries and team allocations from MongoDB..."
        />
      ) : error ? (
        <AdminErrorState
          title="Unable to Query Departments"
          reason={error}
          onRetry={loadData}
        />
      ) : (
        <>
          {/* Department Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {departments.map((dept) => {
              const isSelected = dept.id === selectedDept?.id;
              return (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDeptId(dept.id)}
                  className={cn(
                    'px-4 py-2.5 rounded-xl text-xs font-semibold font-sans whitespace-nowrap transition-all border flex items-center gap-2 cursor-pointer',
                    isSelected
                      ? 'bg-[#13243A] text-[#F8FAFC] border-[#5B5BF7] shadow-lg shadow-indigo-950/40'
                      : 'bg-[#0E1B2D] text-[#94A3B8] border-[rgba(148,163,184,0.14)] hover:bg-[#101F33] hover:text-[#F8FAFC]'
                  )}
                >
                  <LuBuilding2 className={cn('w-4 h-4', isSelected ? 'text-[#5B5BF7]' : 'text-[#64748B]')} />
                  <span>{dept.name}</span>
                </button>
              );
            })}
          </div>

          {selectedDept && (
            <div className="space-y-6">
              {/* Department Overview Banner */}
              <AdminCard className="p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[rgba(148,163,184,0.12)]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h2 className="font-heading font-bold text-xl text-[#F8FAFC]">
                        {selectedDept.name}
                      </h2>
                      <AdminBadge variant="primary" size="sm">
                        {selectedDept.code}
                      </AdminBadge>
                    </div>
                    <p className="text-xs text-[#94A3B8] leading-relaxed max-w-2xl">
                      {selectedDept.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <AdminBadge variant={selectedDept.isActive ? 'success' : 'outline'} dot={selectedDept.isActive}>
                      {selectedDept.isActive ? 'OPERATIONAL' : 'INACTIVE'}
                    </AdminBadge>
                  </div>
                </div>

                {/* KPI Cards for Selected Department */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-1">
                  <div className="p-4 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)] space-y-1">
                    <span className="text-[10.5px] uppercase font-mono text-[#94A3B8] block">
                      Open Incidents
                    </span>
                    <span className="text-2xl font-bold font-heading text-[#F8FAFC]">
                      {openCount}
                    </span>
                    <span className="text-[10px] text-[#64748B] block">
                      {inProgressCount} in progress
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)] space-y-1">
                    <span className="text-[10.5px] uppercase font-mono text-[#94A3B8] block">
                      Critical Incidents
                    </span>
                    <span className={cn('text-2xl font-bold font-heading', criticalCount > 0 ? 'text-[#F0526B]' : 'text-[#22C55E]')}>
                      {criticalCount}
                    </span>
                    <span className="text-[10px] text-[#64748B] block">
                      Requires urgent dispatch
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)] space-y-1">
                    <span className="text-[10.5px] uppercase font-mono text-[#94A3B8] block">
                      SLA Compliance
                    </span>
                    <span className={cn('text-2xl font-bold font-heading', slaCompliance >= 90 ? 'text-[#22C55E]' : 'text-[#F59E0B]')}>
                      {slaCompliance}%
                    </span>
                    <span className="text-[10px] text-[#64748B] block">
                      {overdueCount} breached deadlines
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)] space-y-1">
                    <span className="text-[10.5px] uppercase font-mono text-[#94A3B8] block">
                      Field Crews Available
                    </span>
                    <span className="text-2xl font-bold font-heading text-[#38BDF8]">
                      {availableTeamsCount} / {deptTeams.length}
                    </span>
                    <span className="text-[10px] text-[#64748B] block">
                      Ready for assignment
                    </span>
                  </div>
                </div>
              </AdminCard>

              {/* Jurisdiction Wards & Assigned Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Jurisdiction Wards */}
                <AdminCard className="p-5 space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-[rgba(148,163,184,0.12)]">
                    <LuMapPin className="w-4 h-4 text-[#5B5BF7]" />
                    <h3 className="font-heading font-bold text-sm text-[#F8FAFC]">
                      Jurisdiction Wards ({selectedDept.wardIds?.length || 0})
                    </h3>
                  </div>

                  {selectedDept.wardIds && selectedDept.wardIds.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedDept.wardIds.map((ward) => (
                        <span
                          key={ward}
                          className="px-3 py-1.5 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.12)] text-xs font-mono text-[#94A3B8]"
                        >
                          {ward}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <AdminEmptyState
                      title="No specific wards assigned"
                      description="Department handles city-wide municipal boundaries."
                    />
                  )}
                </AdminCard>

                {/* Categories & SLA Policies */}
                <AdminCard className="p-5 space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-[rgba(148,163,184,0.12)]">
                    <LuClock className="w-4 h-4 text-[#F59E0B]" />
                    <h3 className="font-heading font-bold text-sm text-[#F8FAFC]">
                      Governed Incident Categories & SLA Policy
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {selectedDept.categories?.map((cat) => (
                        <span
                          key={cat}
                          className="px-2.5 py-1 rounded-lg bg-[#13243A] text-xs font-mono font-semibold text-[#818CF8] border border-[rgba(148,163,184,0.14)]"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)] grid grid-cols-4 gap-2 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-[#64748B] block font-mono">LOW</span>
                        <span className="font-bold text-[#F8FAFC]">{selectedDept.slaPolicies?.LOW || 72}h</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#64748B] block font-mono">MEDIUM</span>
                        <span className="font-bold text-[#F8FAFC]">{selectedDept.slaPolicies?.MEDIUM || 48}h</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#64748B] block font-mono">HIGH</span>
                        <span className="font-bold text-[#F59E0B]">{selectedDept.slaPolicies?.HIGH || 24}h</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#64748B] block font-mono">CRITICAL</span>
                        <span className="font-bold text-[#F0526B]">{selectedDept.slaPolicies?.CRITICAL || 4}h</span>
                      </div>
                    </div>
                  </div>
                </AdminCard>
              </div>

              {/* Field Teams Roster */}
              <AdminCard className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[rgba(148,163,184,0.12)]">
                  <div className="flex items-center gap-2">
                    <LuUsers className="w-4 h-4 text-[#38BDF8]" />
                    <h3 className="font-heading font-bold text-sm text-[#F8FAFC]">
                      Configured Field Crews ({deptTeams.length})
                    </h3>
                  </div>
                  <span className="text-xs text-[#94A3B8] font-mono">
                    Real MongoDB Team Documents
                  </span>
                </div>

                {deptTeams.length === 0 ? (
                  <AdminEmptyState
                    title="No field teams configured"
                    description="This department currently has no assigned field crews in the database."
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {deptTeams.map((team) => (
                      <div
                        key={team.id}
                        className="p-4 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.12)] space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-[#F8FAFC] text-xs font-heading">
                              {team.name}
                            </h4>
                            <span className="text-[10.5px] text-[#64748B] font-mono block">
                              Shift: {team.shift}
                            </span>
                          </div>
                          <AdminBadge
                            size="sm"
                            variant={team.availabilityStatus === 'AVAILABLE' ? 'success' : 'warning'}
                            dot
                          >
                            {team.availabilityStatus}
                          </AdminBadge>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-[rgba(148,163,184,0.08)] text-[11px] text-[#94A3B8]">
                          <div className="flex justify-between">
                            <span>Current Workload:</span>
                            <span className="font-bold text-[#F8FAFC]">
                              {team.activeWorkload} / {team.capacity} tickets
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Specializations:</span>
                            <span className="font-mono text-[#818CF8]">
                              {team.specializations?.slice(0, 2).join(', ') || 'General'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </AdminCard>
            </div>
          )}
        </>
      )}
    </div>
  );
}
export default AdminDepartmentsPage;
