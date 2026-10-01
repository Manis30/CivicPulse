import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge, SeverityBadge } from '@/components/ui/Badge';
import { incidentService, getIncidentTitle, getCategoryDisplayLabel } from '@/services/incidentService';
import { authService } from '@/services/authService';
import { Incident, IncidentStatus } from '@civicpulse/shared';
import {
  CitizenContentContainer,
  CitizenEmptyState,
  CitizenErrorState,
} from '@/components/citizen/CitizenContentContainer';
import { CitizenIncidentCard } from '@/components/citizen/CitizenIncidentCard';
import { cn } from '@/lib/utils';
import {
  MapPin,
  Clock,
  ArrowRight,
  PlusCircle,
  FileText,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

const ACTIVE_STATUSES: IncidentStatus[] = [
  'SUBMITTED',
  'ANALYZING',
  'VALIDATED',
  'ASSIGNED',
  'IN_PROGRESS',
  'VERIFYING',
  'REOPENED',
];

const RESOLVED_STATUSES: IncidentStatus[] = ['RESOLVED', 'CLOSED'];

const LIFECYCLE_STEPS = [
  { key: 'SUBMITTED', label: 'Submitted' },
  { key: 'ANALYZED', label: 'Analyzed' },
  { key: 'ASSIGNED', label: 'Assigned' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'RESOLVED', label: 'Verified' },
];

function getStageIndex(status: IncidentStatus): number {
  switch (status) {
    case 'SUBMITTED':
      return 0;
    case 'ANALYZING':
    case 'VALIDATED':
      return 1;
    case 'ASSIGNED':
      return 2;
    case 'IN_PROGRESS':
    case 'VERIFYING':
      return 3;
    case 'RESOLVED':
    case 'CLOSED':
      return 4;
    default:
      return 0;
  }
}

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'Recently reported';
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `Reported ${Math.floor(diffSec / 60)} minutes ago`;
  if (diffSec < 86400) return `Reported ${Math.floor(diffSec / 3600)} hours ago`;
  const days = Math.floor(diffSec / 86400);
  if (days === 1) return 'Reported yesterday';
  if (days < 7) return `Reported ${days} days ago`;
  return `Reported on ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

import { CitizenPageHeader } from '@/components/citizen/CitizenPageHeader';
import { CitizenPagination } from '@/components/citizen/CitizenPagination';

export function MyIncidentsPage() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const PAGE_SIZE = 10;

  const currentUser = authService.getCurrentUser();

  const loadCitizenIncidents = useCallback(async (force = false) => {
    try {
      setLoading(true);
      setError(null);

      const data = await incidentService.getIncidents(
        {
          reporterId: currentUser?.id,
          mine: true,
        },
        { forceRefresh: force }
      );

      setIncidents(data);
    } catch (err: any) {
      console.error('[MyIncidentsPage] Failed to fetch citizen incidents:', err);
      // Clean, user-friendly error message — no raw backend telemetry
      setError("We couldn't connect to the incident operations service.");
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    loadCitizenIncidents(true);
  }, [loadCitizenIncidents]);

  // Subscribe to real-time incident changes
  useEffect(() => {
    const unsubscribe = incidentService.subscribe(() => {
      loadCitizenIncidents(false);
    });
    return unsubscribe;
  }, [loadCitizenIncidents]);

  const handleFilterChange = (newFilter: 'ALL' | 'ACTIVE' | 'RESOLVED') => {
    setFilter(newFilter);
    setCurrentPage(1); // Requirement 29: When filter changes: page = 1
  };

  // Filter incidents
  const filtered = incidents.filter((inc) => {
    if (filter === 'ACTIVE') {
      return ACTIVE_STATUSES.includes(inc.status);
    }
    if (filter === 'RESOLVED') {
      return RESOLVED_STATUSES.includes(inc.status);
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedIncidents = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const activeCount = incidents.filter((inc) => ACTIVE_STATUSES.includes(inc.status)).length;
  const resolvedCount = incidents.filter((inc) => RESOLVED_STATUSES.includes(inc.status)).length;

  return (
    <CitizenContentContainer>
      {/* 1. Global Citizen Page Header (24px Title, 14px Subtitle, 20px Spacing) */}
      <CitizenPageHeader
        title="My Incidents"
        description="Track the real-time status and AI verification lifecycle of your reported civic issues."
        badge={
          <span className="text-xs font-semibold text-[#627D98] bg-white px-2.5 py-0.5 rounded-full border border-[#E3EAE6] shadow-2xs">
            {incidents.length} total
          </span>
        }
        action={
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#E3EAE6] shadow-xs text-xs font-semibold">
            <button
              onClick={() => handleFilterChange('ALL')}
              className={cn(
                'px-3 py-1.5 rounded-lg transition-colors cursor-pointer',
                filter === 'ALL'
                  ? 'bg-[#159A68] text-white shadow-xs'
                  : 'text-[#6B7C8F] hover:text-[#102A43]'
              )}
            >
              All ({incidents.length})
            </button>
            <button
              onClick={() => handleFilterChange('ACTIVE')}
              className={cn(
                'px-3 py-1.5 rounded-lg transition-colors cursor-pointer',
                filter === 'ACTIVE'
                  ? 'bg-[#159A68] text-white shadow-xs'
                  : 'text-[#6B7C8F] hover:text-[#102A43]'
              )}
            >
              In Progress ({activeCount})
            </button>
            <button
              onClick={() => handleFilterChange('RESOLVED')}
              className={cn(
                'px-3 py-1.5 rounded-lg transition-colors cursor-pointer',
                filter === 'RESOLVED'
                  ? 'bg-[#159A68] text-white shadow-xs'
                  : 'text-[#6B7C8F] hover:text-[#102A43]'
              )}
            >
              Resolved ({resolvedCount})
            </button>
          </div>
        }
      />

      {/* 2. Loading State */}
      {loading && incidents.length === 0 && (
        <div className="p-12 text-center bg-white border border-[#E3EAE6] rounded-[18px] shadow-[0_8px_30px_rgba(15,40,30,0.06)] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E7F7F0] text-[#159A68] mx-auto flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#159A68]" />
          </div>
          <h3 className="font-bold text-base font-heading text-[#102A43]">
            Retrieving Your Reported Incidents...
          </h3>
          <p className="text-xs text-[#6B7C8F]">
            Connecting to municipal database for live status updates.
          </p>
        </div>
      )}

      {/* 3. Error State (No raw backend errors) */}
      {!loading && error && (
        <CitizenErrorState
          title="Unable to load your reports"
          message={error}
          onRetry={() => loadCitizenIncidents(true)}
        />
      )}

      {/* 4. Genuine Empty State (0 incidents in database) */}
      {!loading && !error && incidents.length === 0 && (
        <CitizenEmptyState
          icon={<FileText className="w-7 h-7 text-[#159A68]" />}
          title="No civic reports yet"
          description="When you report a civic problem, your reports and live progress will appear here."
          action={
            <button
              onClick={() => navigate('/citizen/report')}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#159A68] hover:bg-[#128358] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report a Civic Problem</span>
            </button>
          }
        />
      )}

      {/* 5. Filtered Empty State (Citizen has reports, but none matching active filter tab) */}
      {!loading && !error && incidents.length > 0 && filtered.length === 0 && (
        <div className="p-10 text-center bg-white border border-[#E3EAE6] rounded-[18px] shadow-[0_8px_30px_rgba(15,40,30,0.06)] space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] text-[#829AB1] mx-auto flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm font-heading text-[#102A43]">No Incidents Found</h3>
          <p className="text-xs text-[#6B7C8F]">
            You have no civic incidents under the &quot;{filter === 'ACTIVE' ? 'In Progress' : 'Resolved'}&quot; filter.
          </p>
          <button
            onClick={() => setFilter('ALL')}
            className="text-xs font-bold text-[#159A68] hover:underline cursor-pointer pt-1"
          >
            View all ({incidents.length}) incidents
          </button>
        </div>
      )}

      {/* 6. Incident List — Full Available Content Width + 10 Incidents Per Page Pagination */}
      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-3.5 w-full">
          <div className="space-y-3 w-full">
            {paginatedIncidents.map((inc, index) => (
              <CitizenIncidentCard
                key={inc.id}
                incident={inc}
                index={index}
                onClick={() => navigate(`/citizen/incidents/${inc.id}`)}
              />
            ))}
          </div>

          {/* Functional 10 items/page pagination (36-40px height) */}
          <CitizenPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      )}
    </CitizenContentContainer>
  );
}

export default MyIncidentsPage;
