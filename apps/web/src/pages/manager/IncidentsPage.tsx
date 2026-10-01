import { useState } from 'react';
import { PageHeader } from '@/components/data-display/DataDisplay';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog, Tabs } from '@/components/ui/Overlays';
import { StatusBadge, SeverityBadge } from '@/components/ui/Badge';
import { getIncidentTitle } from '@/services/incidentService';
import { useIncidents } from '@/contexts/IncidentContext';
import { Incident } from '@civicpulse/shared';
import {
  Search,
  Filter,
  Eye,
  ArrowRight,
  MapPin,
  Clock,
  Bot,
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Camera,
  Layers,
  Sparkles
} from 'lucide-react';

export function IncidentsPage() {
  const { incidents, loading } = useIncidents();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [dossierTab, setDossierTab] = useState('overview');

  const filtered = incidents.filter((inc) => {
    if (categoryFilter !== 'ALL' && inc.category !== categoryFilter) return false;
    if (statusFilter !== 'ALL' && inc.status !== statusFilter) return false;
    const title = getIncidentTitle(inc);
    if (search && !title.toLowerCase().includes(search.toLowerCase()) && !inc.id.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-16">
      <PageHeader
        title="Incident Dispatch Queue"
        description="High-density municipal incident triage table with autonomous agent audit traces and manual override capabilities."
        tag="OPERATIONS COCKPIT"
        actions={
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" leftIcon={<Filter className="w-4 h-4" />}>
              Filter Clusters
            </Button>
            <Button variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
              Dispatch Selected
            </Button>
          </div>
        }
      />

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-civic-card">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search incident ID, keyword, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto text-xs font-semibold">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Categories</option>
            <option value="POTHOLE">Pothole & Roads</option>
            <option value="GARBAGE">Garbage & Waste</option>
            <option value="WATER_LEAK">Water Utilities</option>
            <option value="STREETLIGHT">Streetlights</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="REPORTED">Reported</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Enterprise Incident Table (Section 15) */}
      <Card className="p-0 overflow-hidden bg-white border border-slate-200 shadow-civic-card rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans divide-y divide-slate-100">
            <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-heading">
              <tr>
                <th className="py-3.5 px-4">Issue</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Assigned Team</th>
                <th className="py-3.5 px-4">Reported</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.map((inc) => (
                <tr
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <span className="font-heading font-bold text-blue-600 block">{inc.id}</span>
                    <span className="font-medium text-slate-800 line-clamp-1">{getIncidentTitle(inc)}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                      {inc.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <p className="line-clamp-1">{inc.location.address}</p>
                    <span className="text-[10px] text-slate-400">{inc.location.ward}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <SeverityBadge severity={inc.severity} />
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={inc.status} />
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    Roads & Infrastructure
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Team Alpha-01
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    2h ago
                  </td>
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedIncident(inc)}
                      rightIcon={<Eye className="w-3.5 h-3.5" />}
                    >
                      Dossier
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* POLISHED INCIDENT DOSSIER MODAL WITH TABS (Section 16) */}
      <Dialog
        isOpen={!!selectedIncident}
        onClose={() => setSelectedIncident(null)}
        title={selectedIncident ? `${selectedIncident.id} — Incident Dossier` : 'Incident Details'}
        description={selectedIncident ? getIncidentTitle(selectedIncident) : ''}
        size="lg"
      >
        {selectedIncident && (
          <div className="space-y-5 font-sans text-xs pt-2">
            {/* Dossier Tabs: Overview, Evidence, AI Analysis, Timeline, Assignment, Audit */}
            <Tabs
              tabs={[
                { id: 'overview', label: 'Overview' },
                { id: 'evidence', label: 'Evidence' },
                { id: 'ai-analysis', label: 'AI Analysis' },
                { id: 'timeline', label: 'Timeline' },
                { id: 'assignment', label: 'Assignment' },
                { id: 'audit', label: 'Audit Log' },
              ]}
              activeTab={dossierTab}
              onChange={setDossierTab}
            />

            {/* TAB: Overview */}
            {dossierTab === 'overview' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <SeverityBadge severity={selectedIncident.severity} />
                    <StatusBadge status={selectedIncident.status} />
                  </div>
                  <div className="text-slate-500">
                    <span>Target SLA: <strong className="text-slate-800">{selectedIncident.sla.targetHours}h</strong></span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 bg-white border border-slate-200 space-y-1.5">
                    <p className="text-slate-400 text-[11px] font-medium">Location Telemetry</p>
                    <p className="font-bold text-slate-800 text-sm">{selectedIncident.location.address}</p>
                    <p className="text-slate-500 text-xs">Ward Jurisdiction: {selectedIncident.location.ward}</p>
                  </Card>
                  <Card className="p-4 bg-white border border-slate-200 space-y-1.5">
                    <p className="text-slate-400 text-[11px] font-medium">Municipal Department</p>
                    <p className="font-bold text-blue-600 text-sm">Roads & Infrastructure</p>
                    <p className="text-slate-500 text-xs">Assigned to: Team Alpha-01</p>
                  </Card>
                </div>
              </div>
            )}

            {/* TAB: Evidence */}
            {dossierTab === 'evidence' && (
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">evidence_capture_01.jpg</p>
                      <p className="text-slate-400 text-[11px]">Submitted by citizen • 3.2 MB • Geotagged</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-bold text-xs">
                    Verified Authentic
                  </span>
                </div>
                <div className="h-48 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                  <span className="font-medium text-xs">Photographic Evidence Preview: Road defect surface crater</span>
                </div>
              </div>
            )}

            {/* TAB: AI Analysis */}
            {dossierTab === 'ai-analysis' && (
              <div className="space-y-3">
                <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold font-heading">
                    <Bot className="w-4 h-4 text-indigo-600" />
                    <span>Phase 4B Autonomous Agent Pipeline Decisions</span>
                  </div>
                  <div className="space-y-1.5 text-slate-700 text-xs pt-1">
                    <p>• <strong>Vision Agent:</strong> Confirmed pothole with estimated depth 8.4cm. Obstruction risk: HIGH.</p>
                    <p>• <strong>Location Agent:</strong> Geocoded coordinates to Ward 4 Midtown cluster boundary.</p>
                    <p>• <strong>Duplicate Agent:</strong> Scanned radius 150m; 0 existing open work orders found.</p>
                    <p>• <strong>Severity Agent:</strong> Arterial road near hospital calculated risk score 0.88 (CRITICAL).</p>
                    <p>• <strong>Routing Agent:</strong> Dispatched Team Alpha-01 (ETA: 18 minutes).</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Timeline */}
            {dossierTab === 'timeline' && (
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                {[
                  { step: 'Issue Reported', time: '10:14 AM', desc: 'Citizen submitted report with 1 image' },
                  { step: 'AI Triage Complete', time: '10:15 AM', desc: '5 agents completed execution in 1,240ms' },
                  { step: 'Department Dispatched', time: '10:18 AM', desc: 'Work order sent to Field Team Alpha-01' },
                  { step: 'Team En Route', time: '10:24 AM', desc: 'GPS telematics confirm unit is 1.2km away' },
                ].map((ev, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-800 text-xs">{ev.step}</strong>
                        <span className="text-[10px] text-slate-400">{ev.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{ev.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: Assignment */}
            {dossierTab === 'assignment' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <p className="font-bold text-slate-800">Field Response Unit Assignment</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Primary Team</span>
                    <strong className="text-slate-800">Team Alpha-01 (Roads)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Crew Lead</span>
                    <strong className="text-slate-800">Supervisor Marcus Vance</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Equipment En Route</span>
                    <strong className="text-slate-800">Asphalt Compactor, Cold Mix</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">ETA to Site</span>
                    <strong className="text-emerald-600">8 Minutes</strong>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Audit */}
            {dossierTab === 'audit' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-600 space-y-2">
                <p>[AUDIT-ENTRY-10492] SHA-256: e8b94...f01c</p>
                <p>[TRIGGER] HTTP POST /api/reports/ingest - Status: 201 Created</p>
                <p>[RUNTIME] AgentOrchestrator session initialized: RUN-94021</p>
                <p>[STATE] Ingestion status changed from PENDING to ACTIVE_DISPATCH</p>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setSelectedIncident(null)}>
                Close Dossier
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
