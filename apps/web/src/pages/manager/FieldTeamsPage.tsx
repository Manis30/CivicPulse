import { useState } from 'react';
import { PageHeader } from '@/components/data-display/DataDisplay';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  HardHat,
  Users,
  MapPin,
  Clock,
  Radio,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Search
} from 'lucide-react';

interface FieldTeamItem {
  id: string;
  name: string;
  department: string;
  membersCount: number;
  leadName: string;
  currentTask: string;
  availability: 'Available' | 'Busy' | 'On Route' | 'Offline';
  currentLocation: string;
  avgResponseTime: string;
}

const FIELD_TEAMS: FieldTeamItem[] = [
  {
    id: 'ft-1',
    name: 'Team Alpha-01',
    department: 'Roads & Infrastructure',
    membersCount: 4,
    leadName: 'Marcus Vance',
    currentTask: 'Repairing pothole at 350 5th Ave (INC-2026-1048)',
    availability: 'Busy',
    currentLocation: 'Ward 4 - Midtown',
    avgResponseTime: '6.4 mins',
  },
  {
    id: 'ft-2',
    name: 'Team Alpha-02',
    department: 'Roads & Infrastructure',
    membersCount: 3,
    leadName: 'Elena Rostova',
    currentTask: 'En route to sidewalk obstruction at Park Blvd',
    availability: 'On Route',
    currentLocation: 'Ward 7 - North Hills',
    avgResponseTime: '7.8 mins',
  },
  {
    id: 'ft-3',
    name: 'Team Beta-01',
    department: 'Water Supply & Utilities',
    membersCount: 5,
    leadName: 'Carlos Mendoza',
    currentTask: 'Standby at Central Municipal Depot',
    availability: 'Available',
    currentLocation: 'Ward 2 - Depot Sector',
    avgResponseTime: '5.1 mins',
  },
  {
    id: 'ft-4',
    name: 'Team Gamma-01',
    department: 'Sanitation & Waste',
    membersCount: 3,
    leadName: 'Devon Hayes',
    currentTask: 'Commercial compactor clearing at Market Sq',
    availability: 'Busy',
    currentLocation: 'Ward 4 - Midtown',
    avgResponseTime: '8.2 mins',
  },
  {
    id: 'ft-5',
    name: 'Team Delta-01',
    department: 'Parks & Environment',
    membersCount: 2,
    leadName: 'Liam O’Connor',
    currentTask: 'Ready for emergency tree clearing shifts',
    availability: 'Available',
    currentLocation: 'Ward 9 - Eastside',
    avgResponseTime: '6.9 mins',
  },
  {
    id: 'ft-6',
    name: 'Team Epsilon-01',
    department: 'Energy & Electrical',
    membersCount: 3,
    leadName: 'Tanya Chen',
    currentTask: 'Scheduled vehicle maintenance & battery test',
    availability: 'Offline',
    currentLocation: 'Municipal Yard #02',
    avgResponseTime: 'N/A',
  },
];

export function FieldTeamsPage() {
  const [filter, setFilter] = useState<'ALL' | 'Available' | 'Busy' | 'On Route' | 'Offline'>('ALL');
  const [search, setSearch] = useState('');

  const filtered = FIELD_TEAMS.filter((tm) => {
    if (filter !== 'ALL' && tm.availability !== filter) return false;
    if (search && !tm.name.toLowerCase().includes(search.toLowerCase()) && !tm.department.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-16">
      <PageHeader
        title="Field Teams & Workforce Management"
        description="Monitor field crew locations, shift availability, active task assignments, and mean response times."
        tag="WORKFORCE OPERATIONS"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
              Assign New Shift
            </Button>
          </div>
        }
      />

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-civic-card">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search team or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          {(['ALL', 'Available', 'Busy', 'On Route', 'Offline'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filter === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Field Team Cards Grid (Section 19) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((tm) => {
          const isAvail = tm.availability === 'Available';
          const isBusy = tm.availability === 'Busy';
          const isOnRoute = tm.availability === 'On Route';

          const dotColor = isAvail ? 'bg-emerald-500' : isBusy ? 'bg-amber-500' : isOnRoute ? 'bg-blue-500' : 'bg-slate-400';
          const badgeBg = isAvail ? 'bg-emerald-50 text-emerald-700' : isBusy ? 'bg-amber-50 text-amber-700' : isOnRoute ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600';

          return (
            <Card
              key={tm.id}
              className="p-5 bg-white border border-slate-200 shadow-civic-card hover:shadow-civic-hover transition-all rounded-2xl space-y-4"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-base font-heading text-slate-900 flex items-center gap-2">
                    <HardHat className="w-4 h-4 text-blue-600" />
                    <span>{tm.name}</span>
                  </h4>
                  <p className="text-xs text-slate-500">{tm.department}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${badgeBg}`}>
                  <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                  <span>{tm.availability}</span>
                </span>
              </div>

              {/* Card Details */}
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Crew Composition:</span>
                  <span className="font-semibold text-slate-800">{tm.membersCount} Crew ({tm.leadName}, Lead)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Current Location:</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{tm.currentLocation}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Avg Response Time:</span>
                  <span className="font-bold text-blue-600 font-heading">{tm.avgResponseTime}</span>
                </div>
              </div>

              {/* Current Task Box */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-heading">
                  Current Assignment
                </span>
                <p className="text-xs text-slate-800 font-medium line-clamp-2">
                  {tm.currentTask}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-1">
                <Button variant="outline" size="sm" className="w-full">
                  Contact Crew Dispatch
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
