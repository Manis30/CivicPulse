import { useState } from 'react';
import { CityScene } from '@/components/three/CityScene';
import { getIncidentTitle } from '@/services/incidentService';
import { useIncidents } from '@/contexts/IncidentContext';
import { Incident, SeverityLevel } from '@civicpulse/shared';
import { StatusBadge, SeverityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MapPin, Clock, Bot, Building2, CheckCircle2, AlertTriangle, X, ArrowRight, Layers, Eye } from 'lucide-react';

export function LiveMapPage() {
  const { incidents } = useIncidents();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CRITICAL' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const activeIncident = selectedIncident || (incidents.length > 0 ? incidents[0] : null);

  const filteredIncidents = incidents.filter((inc) => {
    if (statusFilter === 'CRITICAL' && inc.severity !== 'CRITICAL') return false;
    if (statusFilter === 'IN_PROGRESS' && inc.status !== 'IN_PROGRESS') return false;
    if (statusFilter === 'RESOLVED' && inc.status !== 'RESOLVED' && inc.status !== 'CLOSED') return false;
    if (categoryFilter !== 'ALL' && inc.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4 font-sans text-slate-900 h-[calc(100vh-8rem)] flex flex-col">
      {/* Top Map Controls Strip (Section 22 & 36) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-civic-card shrink-0">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          <span className="text-slate-400 mr-1 text-[11px] uppercase tracking-wider font-bold">Status:</span>
          {(['ALL', 'CRITICAL', 'IN_PROGRESS', 'RESOLVED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {st === 'ALL' ? 'All Zones' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          <span className="text-slate-400 mr-1 text-[11px] uppercase tracking-wider font-bold">Category:</span>
          {['ALL', 'POTHOLE', 'GARBAGE', 'WATER_LEAK', 'STREETLIGHT'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {cat === 'ALL' ? 'All Types' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main 3D Canvas Area with Overlay Panels */}
      <div className="relative flex-1 rounded-2xl overflow-hidden border border-slate-200 shadow-civic-card bg-slate-100">
        <CityScene
          incidents={filteredIncidents}
          selectedIncidentId={selectedIncident?.id}
          onSelectIncident={(inc) => setSelectedIncident(inc)}
          className="h-full min-h-full"
        />

        {/* Floating Incident Severity Legend (Section 21) */}
        <div className="absolute bottom-5 left-5 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 shadow-civic-card font-sans text-xs space-y-2 pointer-events-auto">
          <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider font-heading">
            Live Severity Legend
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>Critical</span>
              </span>
              <strong className="font-heading text-red-600">3</strong>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>High</span>
              </span>
              <strong className="font-heading text-indigo-600">
                {incidents.filter((i) => i.severity === 'HIGH').length}
              </strong>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Medium</span>
              </span>
              <strong className="font-heading text-amber-600">
                {incidents.filter((i) => i.severity === 'MEDIUM').length}
              </strong>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Reported</span>
              </span>
              <strong className="font-heading text-blue-600">
                {incidents.filter((i) => i.status === 'SUBMITTED' || i.status === 'ANALYZING' || i.status === 'VALIDATED').length}
              </strong>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Resolved</span>
              </span>
              <strong className="font-heading text-emerald-600">
                {incidents.filter((i) => i.status === 'RESOLVED' || i.status === 'CLOSED').length}
              </strong>
            </div>
          </div>
        </div>

        {/* Selected Incident Inspection Drawer */}
        {selectedIncident && (
          <div className="absolute top-5 right-5 w-84 sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-civic-modal p-5 font-sans space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <span className="font-bold text-xs text-blue-600 font-heading">{selectedIncident.id}</span>
                <h4 className="text-sm font-bold text-slate-900 font-heading mt-0.5">
                  {getIncidentTitle(selectedIncident)}
                </h4>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <SeverityBadge severity={selectedIncident.severity} />
              <StatusBadge status={selectedIncident.status} />
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{selectedIncident.location.address} ({selectedIncident.location.ward})</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Target SLA: {selectedIncident.sla.targetHours} hours</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Category: {selectedIncident.category}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-indigo-700">
                <Bot className="w-3.5 h-3.5" />
                <span>Autonomous Agent Pipeline</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Vision & Location verified. Severity scored at {selectedIncident.severity}. Work order dispatched.
              </p>
            </div>

            <div className="pt-2 flex gap-2">
              <Button
                variant="primary"
                size="sm"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                onClick={() => (window.location.href = '/manager/incidents')}
              >
                Manage Incident in Queue
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
