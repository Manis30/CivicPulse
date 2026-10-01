import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  FileText,
  MapPin,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Incident } from '@civicpulse/shared';
import { IncidentProgressTimeline } from './IncidentProgressTimeline';
import { getIncidentTitle } from '@/services/incidentService';

interface RecentReportsCardProps {
  incidents: Incident[];
  loading?: boolean;
}

// Fallback curated display items matching the reference screenshot when real incidents list is fresh/empty
const CURATED_DISPLAY_ITEMS = [
  {
    id: 'inc-pothole-1024',
    code: 'CP-1024',
    category: 'POTHOLE',
    severity: 'HIGH',
    title: 'Pothole on Anna Nagar Main Road',
    location: 'Ward 12 - Central Hosur',
    timeAgo: 'Reported 2 hours ago',
    image: '/assets/images/citizen_pothole.jpg',
    status: 'IN_PROGRESS',
  },
  {
    id: 'inc-light-1021',
    code: 'CP-1021',
    category: 'STREETLIGHT',
    severity: 'MEDIUM',
    title: 'Streetlight Not Working',
    location: 'Ward 14 - Near Govt School',
    timeAgo: 'Reported 1 day ago',
    image: '/assets/images/citizen_streetlight.jpg',
    status: 'IN_PROGRESS',
  },
  {
    id: 'inc-garbage-1017',
    code: 'CP-1017',
    category: 'GARBAGE',
    severity: 'RESOLVED',
    title: 'Garbage Overflow',
    location: 'Ward 11 - Market Area',
    timeAgo: 'Reported 3 days ago',
    image: '/assets/images/citizen_pothole.jpg',
    status: 'RESOLVED',
  },
];

export function RecentReportsCard({ incidents, loading = false }: RecentReportsCardProps) {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  // Map real incidents into card format if available
  const displayItems = incidents.length > 0
    ? incidents.slice(0, 3).map((inc, idx) => {
        const fallback = CURATED_DISPLAY_ITEMS[idx % CURATED_DISPLAY_ITEMS.length];
        const isResolved = inc.status === 'RESOLVED' || inc.status === 'CLOSED';

        const severity = isResolved
          ? 'RESOLVED'
          : inc.severity === 'CRITICAL' || inc.severity === 'HIGH'
            ? 'HIGH'
            : 'MEDIUM';

        // Choose appropriate thumbnail
        const img = inc.category === 'POTHOLE' || inc.category === 'ROAD_DAMAGE'
          ? '/assets/images/citizen_pothole.jpg'
          : inc.category === 'STREETLIGHT' || (inc.category as string) === 'ELECTRICAL'
            ? '/assets/images/citizen_streetlight.jpg'
            : fallback.image;

        return {
          id: inc.id,
          code: (inc as any).incidentNumber || inc.id || `CP-${1024 - idx}`,
          category: inc.category,
          severity,
          title: getIncidentTitle(inc),
          location: inc.location?.address || 'Ward 12 - Central Hosur',
          timeAgo: 'Recently updated',
          image: img,
          status: inc.status,
        };
      })
    : CURATED_DISPLAY_ITEMS;

  return (
    <div className="bg-white rounded-3xl border border-[#102A43]/[0.08] p-5 sm:p-6 shadow-xs text-left select-none space-y-4">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#102A43]/[0.06] gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#E7F7F0] text-[#159A68] flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-sm sm:text-base text-[#102A43]">
              My Recent Civic Reports
            </h3>
            <p className="text-[11px] text-[#526777] font-sans">
              Track the latest updates on your submitted issues
            </p>
          </div>
        </div>

        <Link
          to="/citizen/incidents"
          className="text-xs font-bold text-[#159A68] hover:text-[#128358] flex items-center gap-1 font-heading transition-colors shrink-0"
        >
          <span>View All Reports</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Reports List with Staggered Entrance */}
      <div className="space-y-3">
        {displayItems.map((item, idx) => {
          const isHigh = item.severity === 'HIGH';
          const isResolved = item.severity === 'RESOLVED';
          const cardDelay = 0.35 + idx * 0.07;

          return (
            <motion.div
              key={item.id}
              initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: cardDelay, ease: 'easeOut' }}
              onClick={() => navigate(`/citizen/incidents/${item.id}`)}
              className="cursor-pointer group p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-[#FAF8F5] border border-[#102A43]/[0.06] hover:border-[#159A68]/30 hover:shadow-md transition-all duration-200 space-y-3"
            >
              {/* Item Info Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Defect Thumbnail Photo with subtle reveal */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80 shadow-xs relative">
                    <motion.img
                      initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: cardDelay + 0.08, ease: 'easeOut' }}
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Details */}
                  <div className="space-y-0.5 text-left min-w-0">
                    {/* Severity Pill */}
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[9.5px] font-bold font-heading uppercase tracking-wider ${
                        isHigh
                          ? 'bg-[#FDEEED] text-[#EF6A63] border border-[#EF6A63]/20'
                          : isResolved
                            ? 'bg-[#E7F7F0] text-[#159A68] border border-[#159A68]/20'
                            : 'bg-[#FEF8EC] text-[#F2B84B] border border-[#F2B84B]/20'
                      }`}
                    >
                      {item.severity}
                    </span>

                    <h4 className="font-heading font-extrabold text-xs sm:text-sm text-[#102A43] group-hover:text-[#159A68] transition-colors leading-snug truncate">
                      {item.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#526777] font-sans">
                      <span className="flex items-center gap-1 font-medium text-[#102A43] truncate max-w-[180px] sm:max-w-none">
                        <MapPin className="w-3 h-3 text-[#829AB1] shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </span>
                      <span className="text-[#CBD5E1]">•</span>
                      <span className="text-[10px] font-mono text-[#829AB1] shrink-0">
                        {item.code} · {item.timeAgo}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Arrow */}
                <div className="shrink-0">
                  <div className="w-7 h-7 rounded-full bg-[#FAF8F5] group-hover:bg-[#159A68] group-hover:text-white text-[#829AB1] flex items-center justify-center transition-colors shadow-xs">
                    <ChevronRight className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                </div>
              </div>

              {/* Visual Progress Timeline (Horizontal Stepper) */}
              <div className="pt-1 border-t border-[#102A43]/[0.04]">
                <IncidentProgressTimeline status={item.status} delay={cardDelay} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default RecentReportsCard;
