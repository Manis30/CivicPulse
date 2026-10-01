import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/data-display/DataDisplay';
import { Card, MetricCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge, SeverityBadge } from '@/components/ui/Badge';
import { getIncidentTitle } from '@/services/incidentService';
import { useIncidents } from '@/contexts/IncidentContext';
import { departmentService, DepartmentInfo } from '@/services/departmentService';
import { teamService, TeamInfo } from '@/services/teamService';
import {
  Building2,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  HardHat,
  ArrowRight,
  Loader2,
} from 'lucide-react';

export function DepartmentsPage() {
  const { incidents } = useIncidents();
  const [departments, setDepartments] = useState<DepartmentInfo[]>([]);
  const [teams, setTeams] = useState<TeamInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');

  useEffect(() => {
    Promise.all([departmentService.getDepartments(), teamService.getTeams()]).then(
      ([deptData, teamData]) => {
        setDepartments(deptData);
        setTeams(teamData);
        if (deptData.length > 0) setSelectedDeptId(deptData[0].id);
        setLoading(false);
      }
    );
  }, []);

  const selectedDept = departments.find((d) => d.id === selectedDeptId) || departments[0];

  // Derive department-specific metrics from live incidents
  const deptIncidents = selectedDept
    ? incidents.filter((i) => {
        if ((i as any).departmentId === selectedDept.id || (i as any).assignedDepartment === selectedDept.name) return true;
        if (selectedDept.categories?.includes(i.category)) return true;
        return false;
      })
    : [];

  const inProgressCount = deptIncidents.filter((i) => i.status === 'IN_PROGRESS').length;
  const criticalCount = deptIncidents.filter((i) => i.severity === 'CRITICAL').length;
  const deptTeams = selectedDept
    ? teams.filter((t) => t.departmentId === selectedDept.id || t.departmentId === selectedDept.code)
    : teams;

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-16">
      <PageHeader
        title="Municipal Department Operations"
        description="Monitor departmental workload, jurisdictional triage queues, and active field response capacity."
        tag="MUNICIPAL SERVICES"
      />

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-xs">Querying departments & teams from database...</p>
        </div>
      ) : (
        <>
          {/* Department Selection Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {departments.map((dept) => {
              const isSelected = dept.id === selectedDeptId;
              const count = incidents.filter((i) => dept.categories?.includes(i.category)).length;

              return (
                <div
                  key={dept.id}
                  onClick={() => setSelectedDeptId(dept.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-500 shadow-civic-card ring-1 ring-blue-500'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs font-mono text-blue-600 uppercase">{dept.code}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {count} Incidents
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm font-heading">{dept.name}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{dept.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedDept && (
            <>
              {/* Department Overview Banner */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-civic-card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <h2 className="text-xl font-bold font-heading text-slate-900">{selectedDept.name}</h2>
                    </div>
                    <p className="text-xs text-slate-500 font-sans">
                      Jurisdiction: {selectedDept.wardIds?.join(', ') || 'All Wards'} • Categories: {selectedDept.categories?.join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active Jurisdiction
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <MetricCard
                    label="Queue Load"
                    value={String(deptIncidents.length)}
                    icon={<Clock className="w-4 h-4 text-blue-600" />}
                    accent="blue"
                  />
                  <MetricCard
                    label="In Progress"
                    value={String(inProgressCount)}
                    icon={<CheckCircle2 className="w-4 h-4 text-amber-600" />}
                    accent="warning"
                  />
                  <MetricCard
                    label="Critical Issues"
                    value={String(criticalCount)}
                    icon={<AlertTriangle className="w-4 h-4 text-red-600" />}
                    accent="danger"
                  />
                  <MetricCard
                    label="Field Crews"
                    value={String(deptTeams.length)}
                    icon={<Users className="w-4 h-4 text-emerald-600" />}
                    accent="success"
                  />
                </div>
              </div>

              {/* Priority Queue & Team Workload Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Priority Queue */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold font-heading text-slate-900">
                      Priority Queue ({selectedDept.name})
                    </h3>
                    <span className="text-xs text-slate-400">Database Filtered</span>
                  </div>

                  <div className="space-y-3">
                    {deptIncidents.length === 0 ? (
                      <p className="py-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                        No active incidents assigned to this department.
                      </p>
                    ) : (
                      deptIncidents.slice(0, 5).map((inc) => (
                        <Card key={inc.id} className="p-4 bg-white border border-slate-200 shadow-civic-card rounded-2xl flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-heading font-bold text-xs text-blue-600">{inc.id}</span>
                              <span className="font-semibold text-slate-800 text-xs">{getIncidentTitle(inc)}</span>
                            </div>
                            <p className="text-[11px] text-slate-500">{inc.location?.address || 'Hosur Ward'}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <SeverityBadge severity={inc.severity} />
                            <StatusBadge status={inc.status} />
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </div>

                {/* Right Column: Team Workload */}
                <div className="lg:col-span-5 space-y-4">
                  <h3 className="text-base font-bold font-heading text-slate-900">
                    Active Team Workload
                  </h3>

                  <div className="space-y-3">
                    {deptTeams.length === 0 ? (
                      <p className="py-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                        No field teams configured for this department.
                      </p>
                    ) : (
                      deptTeams.map((tm) => (
                        <Card key={tm.id} className="p-4 bg-white border border-slate-200 shadow-civic-card rounded-2xl space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <HardHat className="w-4 h-4 text-blue-600" />
                              <span className="font-bold text-slate-900">{tm.name}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                              {tm.availabilityStatus}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                            <span>Workload: <strong>{tm.activeWorkload} / {tm.capacity} tasks</strong></span>
                            <span>Shift: <strong>{tm.shift}</strong></span>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
