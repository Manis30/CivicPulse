import { useState, useEffect } from 'react';
import {
  Layers,
  AlertTriangle,
  Clock,
  Compass,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Bot,
  Filter,
  Maximize2,
  Minimize2,
  MapPin,
  Calendar,
  CloudSun,
  Navigation,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Crosshair,
  Plus,
  Minus,
  Box,
  Trash2,
  Droplets,
  Lightbulb,
  Construction,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, MetricCard, Panel } from '@/components/ui/Card';
import { StatusBadge, SeverityBadge, Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/data-display/DataDisplay';
import { CityScene } from '@/components/three/CityScene';
import { incidentService } from '@/services/incidentService';
import { useIncidents } from '@/contexts/IncidentContext';
import { Incident } from '@civicpulse/shared';
import { Dialog } from '@/components/ui/Overlays';
import { cn } from '@/lib/utils';

export function CommandCenterPage() {
  const { incidents, dataSource, loading, refreshIncidents } = useIncidents();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [activeZoneFilter, setActiveZoneFilter] = useState<'ALL' | 'CRITICAL' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'WASTE' | 'INFRASTRUCTURE' | 'ENVIRONMENT' | 'SAFETY'>('ALL');
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Filtered incidents based on active zone filter and category filter
  const filteredIncidents = incidents.filter((inc) => {
    if (activeZoneFilter === 'CRITICAL' && inc.severity !== 'CRITICAL') return false;
    if (activeZoneFilter === 'IN_PROGRESS' && inc.status !== 'IN_PROGRESS') return false;
    if (activeZoneFilter === 'RESOLVED' && inc.status !== 'RESOLVED' && inc.status !== 'CLOSED') return false;

    if (categoryFilter === 'WASTE' && inc.category !== 'GARBAGE') return false;
    if (categoryFilter === 'INFRASTRUCTURE' && inc.category !== 'POTHOLE' && inc.category !== 'STREETLIGHT') return false;
    if (categoryFilter === 'ENVIRONMENT' && inc.category !== 'WATER_LEAK') return false;
    if (categoryFilter === 'SAFETY' && inc.category !== 'ROAD_DAMAGE' && inc.category !== 'OTHER') return false;

    return true;
  });

  // Calculate live counts from data
  const criticalCount = incidents.filter((i) => i.severity === 'CRITICAL').length;
  const inProgressCount = incidents.filter((i) => i.status === 'IN_PROGRESS').length;
  const resolvedCount = incidents.filter((i) => i.status === 'RESOLVED' || i.status === 'CLOSED').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      {/* 1. Command Center Hero Area (Section 15) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-bold font-heading text-slate-900 tracking-tight">
              Good Morning, Alex 👋
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold font-sans tracking-wide border shadow-2xs ${
                dataSource === 'LIVE API'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              ● {dataSource}
            </span>
          </div>
          <p className="text-sm sm:text-base text-slate-500 font-sans max-w-2xl leading-relaxed">
            Real-time insights and AI-powered operations for a cleaner, safer, more livable city.
          </p>
        </div>

        {/* Live Operational Context Strip (Date, Time, Weather, Location) */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-civic-card">
          <div className="flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Today, 24 Sep</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>10:28 AM IST</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5 font-medium">
            <CloudSun className="w-3.5 h-3.5 text-amber-500" />
            <span>24°C Clear</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-slate-900 font-semibold">Central Metro</span>
          </div>
        </div>
      </div>

      {/* 2. Premium KPI Cards Strip (Section 16 & 17) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          label="Open Incidents"
          value={incidents.length > 0 ? incidents.length : 42}
          change="↑ +4 past hour"
          isPositiveTrend={false}
          sublabel="8 awaiting verification"
          icon={<Layers className="w-5 h-5" />}
          accent="cyan"
        />
        <MetricCard
          label="Critical Severity"
          value={criticalCount > 0 ? criticalCount : 3}
          change="Hospital & arterial roads"
          isPositiveTrend={false}
          sublabel="Immediate dispatch required"
          icon={<AlertTriangle className="w-5 h-5" />}
          accent="danger"
        />
        <MetricCard
          label="Active Responses"
          value={inProgressCount > 0 ? inProgressCount : 18}
          change="Teams en route"
          isPositiveTrend={true}
          sublabel="Avg dispatch: 6.2 min"
          icon={<Compass className="w-5 h-5" />}
          accent="success"
        />
        <MetricCard
          label="SLA Compliance"
          value="96.2%"
          change="↑ +1.4% target"
          isPositiveTrend={true}
          sublabel="2 breaches averted"
          icon={<ShieldCheck className="w-5 h-5" />}
          accent="purple"
        />
      </div>

      {/* 3. Main Centerpiece: Live City Digital Twin & Right Operational Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 3D Digital Twin Map (lg:col-span-8) */}
        <div className={cn('flex flex-col space-y-4 transition-all duration-300', isMapExpanded ? 'lg:col-span-12' : 'lg:col-span-8')}>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-civic-card p-6 space-y-4">
            {/* Digital Twin Section Header & Top Filter Controls (Section 18 & 22) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
              <div>
                <h2 className="text-xl font-bold font-heading text-slate-900 tracking-tight">
                  Live City Digital Twin
                </h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Real-time incident telemetry across active zones
                </p>
              </div>

              {/* Status Filter Pills (Section 18 & 22) */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                {[
                  { key: 'ALL', label: 'All Zones' },
                  { key: 'CRITICAL', label: 'Critical Only' },
                  { key: 'IN_PROGRESS', label: 'In Progress' },
                  { key: 'RESOLVED', label: 'Resolved' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveZoneFilter(tab.key as any)}
                    className={cn(
                      'px-3.5 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all duration-150',
                      activeZoneFilter === tab.key
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter Pills (Section 22) */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-400 mr-1">Filter:</span>
                {[
                  { key: 'ALL', label: 'All' },
                  { key: 'WASTE', label: 'Waste' },
                  { key: 'INFRASTRUCTURE', label: 'Infrastructure' },
                  { key: 'ENVIRONMENT', label: 'Environment' },
                  { key: 'SAFETY', label: 'Public Safety' },
                ].map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setCategoryFilter(cat.key as any)}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium font-sans border transition-all',
                      categoryFilter === cat.key
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsMapExpanded(!isMapExpanded)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-sans text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                title={isMapExpanded ? 'Collapse Map' : 'Expand Map'}
              >
                {isMapExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                <span>{isMapExpanded ? 'Normal View' : 'Expand'}</span>
              </button>
            </div>

            {/* 3D Daylight Digital Twin Canvas (Section 19) */}
            <div className="relative h-[460px] w-full rounded-2xl overflow-hidden shadow-inner">
              <CityScene
                incidents={filteredIncidents}
                onSelectIncident={(inc) => setSelectedIncident(inc)}
              />

              {/* Floating Map Legend (Section 21) */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3 shadow-civic-card space-y-1.5 text-xs font-sans">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Active Incidents
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-slate-700">Critical</span>
                  </div>
                  <span className="font-bold text-slate-900">{criticalCount || 3}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="text-slate-700">High</span>
                  </div>
                  <span className="font-bold text-slate-900">7</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-slate-700">Medium</span>
                  </div>
                  <span className="font-bold text-slate-900">12</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-slate-700">Low</span>
                  </div>
                  <span className="font-bold text-slate-900">5</span>
                </div>
                <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-slate-700">Resolved</span>
                  </div>
                  <span className="font-bold text-emerald-600">{resolvedCount || 28}</span>
                </div>
              </div>

              {/* Floating Map Controls (Section 23) */}
              <div className="absolute top-4 right-4 flex flex-col gap-1.5">
                <button
                  className="w-8 h-8 rounded-lg bg-white/95 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center shadow-sm transition-colors"
                  title="Locate Cluster"
                >
                  <Crosshair className="w-4 h-4" />
                </button>
                <button
                  className="w-8 h-8 rounded-lg bg-white/95 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center shadow-sm transition-colors"
                  title="Zoom In"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  className="w-8 h-8 rounded-lg bg-white/95 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center shadow-sm transition-colors"
                  title="Zoom Out"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  className="w-8 h-8 rounded-lg bg-white/95 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center shadow-sm transition-colors"
                  title="3D Perspective"
                >
                  <Box className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Operational Column: AI Agent Activity & Recent Incidents (lg:col-span-4) */}
        {!isMapExpanded && (
          <div className="lg:col-span-4 space-y-6">
            {/* Card 1: AI Agent Activity (Section 25) */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-civic-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-base font-bold font-heading text-slate-900">
                    AI Agent Activity
                  </h3>
                </div>
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>

              {/* Agent Rows exactly per Section 25 */}
              <div className="space-y-3.5">
                {[
                  {
                    name: 'Vision Agent',
                    task: 'Analyzing pothole image',
                    time: '2 min ago',
                    bg: 'bg-blue-50',
                    color: 'text-blue-600',
                    border: 'border-blue-100',
                  },
                  {
                    name: 'Location Agent',
                    task: 'Geocoding coordinates',
                    time: '4 min ago',
                    bg: 'bg-blue-50',
                    color: 'text-blue-600',
                    border: 'border-blue-100',
                  },
                  {
                    name: 'Duplicate Agent',
                    task: 'Checking similar incidents',
                    time: '6 min ago',
                    bg: 'bg-indigo-50',
                    color: 'text-indigo-600',
                    border: 'border-indigo-100',
                  },
                  {
                    name: 'Severity Agent',
                    task: 'Risk score calculated',
                    time: '8 min ago',
                    bg: 'bg-amber-50',
                    color: 'text-amber-600',
                    border: 'border-amber-100',
                  },
                  {
                    name: 'Routing Agent',
                    task: 'Assigning to field team',
                    time: '11 min ago',
                    bg: 'bg-emerald-50',
                    color: 'text-emerald-600',
                    border: 'border-emerald-100',
                  },
                ].map((agent, i) => (
                  <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className={cn('p-2 rounded-lg border shrink-0', agent.bg, agent.color, agent.border)}>
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 font-sans">{agent.name}</h4>
                        <span className="text-[11px] text-slate-400 font-sans">{agent.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-sans truncate">{agent.task}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: Recent Incidents (Section 26 & 27) */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-civic-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <h3 className="text-base font-bold font-heading text-slate-900">
                    Recent Incidents
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-sans">
                  Ward 14 • Central
                </span>
              </div>

              {/* Compact Incident Rows per Section 26 & 27 */}
              <div className="space-y-3">
                {[
                  {
                    title: 'Pothole reported',
                    address: 'MG Road, Central Zone',
                    severity: 'CRITICAL',
                    time: '2 min ago',
                    icon: <Construction className="w-4 h-4 text-rose-600" />,
                    bg: 'bg-rose-50',
                  },
                  {
                    title: 'Overflowing bin',
                    address: 'Lakeside Park',
                    severity: 'MEDIUM',
                    time: '14 min ago',
                    icon: <Trash2 className="w-4 h-4 text-amber-600" />,
                    bg: 'bg-amber-50',
                  },
                  {
                    title: 'Street light out',
                    address: 'Riverside Avenue',
                    severity: 'HIGH',
                    time: '28 min ago',
                    icon: <Lightbulb className="w-4 h-4 text-indigo-600" />,
                    bg: 'bg-indigo-50',
                  },
                  {
                    title: 'Water leakage',
                    address: 'Greenwood Street',
                    severity: 'MEDIUM',
                    time: '45 min ago',
                    icon: <Droplets className="w-4 h-4 text-blue-600" />,
                    bg: 'bg-blue-50',
                  },
                ].map((inc, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      const match = incidents[i] || incidents[0];
                      if (match) setSelectedIncident(match);
                    }}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn('p-2 rounded-xl shrink-0 border border-slate-100', inc.bg)}>
                        {inc.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 font-sans group-hover:text-blue-600 transition-colors truncate">
                          {inc.title}
                        </p>
                        <p className="text-[11px] text-slate-400 font-sans truncate">{inc.address}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <SeverityBadge severity={inc.severity as any} />
                      <span className="text-[10px] text-slate-400 font-sans mt-0.5">{inc.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Lower Operational Section: AI Agent Workflow (Section 28 & 29) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-civic-card p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold font-heading text-slate-900 tracking-tight">
              Autonomous AI Workflow Pipeline
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Five Phase 4B agents executing synchronized tool telemetry in sequence
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            Queue Backed Execution
          </span>
        </div>

        {/* Horizontal 5-Agent Connected Workflow per Section 29 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {[
            {
              step: '1',
              name: 'Vision Agent',
              task: 'Analyzing image',
              status: 'READY',
              color: 'border-blue-200 bg-blue-50/40 text-blue-600',
              icon: <Eye className="w-4 h-4 text-blue-600" />,
            },
            {
              step: '2',
              name: 'Location Agent',
              task: 'Geocoding coordinates',
              status: 'READY',
              color: 'border-blue-200 bg-blue-50/40 text-blue-600',
              icon: <MapPin className="w-4 h-4 text-blue-600" />,
            },
            {
              step: '3',
              name: 'Duplicate Agent',
              task: 'Checking similar',
              status: 'READY',
              color: 'border-indigo-200 bg-indigo-50/40 text-indigo-600',
              icon: <Layers className="w-4 h-4 text-indigo-600" />,
            },
            {
              step: '4',
              name: 'Severity Agent',
              task: 'Evaluating risk score',
              status: 'READY',
              color: 'border-amber-200 bg-amber-50/40 text-amber-600',
              icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
            },
            {
              step: '5',
              name: 'Routing Agent',
              task: 'Assigning field team',
              status: 'READY',
              color: 'border-emerald-200 bg-emerald-50/40 text-emerald-600',
              icon: <Navigation className="w-4 h-4 text-emerald-600" />,
            },
          ].map((agent, index) => (
            <div
              key={index}
              className={cn(
                'relative p-4 rounded-xl border transition-all duration-150',
                agent.color
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-lg bg-white shadow-2xs flex items-center justify-center border border-slate-100">
                  {agent.icon}
                </div>
                <span className="text-[10px] font-bold text-slate-400 font-sans">
                  STEP 0{agent.step}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 font-sans">{agent.name}</h4>
              <p className="text-[11px] text-slate-500 font-sans mt-0.5 leading-snug">{agent.task}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Lower Operational Section: Incident Dispatch Queue Table (Section 35) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-heading text-slate-900 tracking-tight">
              Operational Incident Dispatch Queue
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Real-time incident transitions and work order dispatch status
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refreshIncidents();
            }}
          >
            Refresh Queue
          </Button>
        </div>

        <DataTable
          columns={[
            {
              key: 'id',
              header: 'Incident ID',
              render: (row) => (
                <span className="font-bold text-blue-600 hover:underline cursor-pointer">
                  {row.id}
                </span>
              ),
            },
            {
              key: 'category',
              header: 'Issue Category',
              render: (row) => <span className="font-semibold text-slate-800">{row.category}</span>,
            },
            {
              key: 'severity',
              header: 'Priority',
              render: (row) => <SeverityBadge severity={row.severity} />,
            },
            {
              key: 'status',
              header: 'Status',
              render: (row) => <StatusBadge status={row.status} />,
            },
            {
              key: 'location',
              header: 'Ward / Location',
              render: (row) => (
                <div className="text-xs text-slate-600 truncate max-w-[200px]">
                  {row.location.ward} • {row.location.address}
                </div>
              ),
            },
            {
              key: 'sla',
              header: 'SLA Target',
              render: (row) => (
                <span
                  className={`text-xs font-semibold ${
                    row.sla.isOverdue ? 'text-rose-600' : 'text-slate-600'
                  }`}
                >
                  {row.sla.isOverdue ? '● Breached' : `${row.sla.targetHours}h target`}
                </span>
              ),
            },
          ]}
          data={filteredIncidents}
          keyExtractor={(row) => row.id}
          onRowClick={(row) => setSelectedIncident(row)}
        />
      </div>

      {/* Incident Details Dossier Modal */}
      {selectedIncident && (
        <Dialog
          isOpen={!!selectedIncident}
          onClose={() => setSelectedIncident(null)}
          title={`Incident Dossier: ${selectedIncident.id}`}
          description={`${selectedIncident.category} • ${selectedIncident.location.address}`}
          maxWidth="lg"
        >
          <div className="space-y-5 font-sans text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Current State</span>
                <div className="mt-1"><StatusBadge status={selectedIncident.status} /></div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Severity</span>
                <div className="mt-1"><SeverityBadge severity={selectedIncident.severity} /></div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Ward / Zone</span>
                <p className="text-slate-800 font-semibold mt-1">{selectedIncident.location.ward}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">SLA Target</span>
                <p className="text-slate-800 font-semibold mt-1">{selectedIncident.sla.targetHours} hours</p>
              </div>
            </div>

            {selectedIncident.severityReasoning && (
              <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-100 space-y-2">
                <span className="text-indigo-700 font-bold text-xs uppercase tracking-wide">
                  Explainable Severity Rationale (Severity Agent):
                </span>
                <p className="text-slate-700 text-xs leading-relaxed">
                  {selectedIncident.severityReasoning.explanation}
                </p>
                <div className="space-y-1 pt-1.5 text-xs text-slate-600">
                  {selectedIncident.severityReasoning.factors.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedIncident(null)}>
                Close Dossier
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

