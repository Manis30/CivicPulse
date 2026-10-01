import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  MapPin,
  ArrowRight,
  Crosshair,
  AlertTriangle,
  Droplets,
  AlertCircle,
  Trash2,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { useIncidents } from '@/contexts/IncidentContext';
import { getIncidentTitle } from '@/services/incidentService';

interface NearbyIssue {
  id: string;
  name: string;
  category: string;
  severity: 'HIGH' | 'MEDIUM' | 'WATER' | 'RESOLVED';
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  xPercent: number;
  yPercent: number;
  distance: string;
}

function issueHasDetailRoute(id?: string) {
  if (!id) return false;
  return id.startsWith('INC-') || id.startsWith('inc-') || id.length > 10;
}

export function NearbyIssuesCard() {
  const navigate = useNavigate();
  const { incidents } = useIncidents();
  const [selectedIssue, setSelectedIssue] = useState<NearbyIssue | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Dynamically derive real nearby issues from context
  const dynamicNearbyIssues = useMemo<NearbyIssue[]>(() => {
    if (!incidents || incidents.length === 0) {
      return [
        {
          id: 'pothole',
          name: 'Pothole & Road Damage',
          category: 'Roads & Infrastructure',
          severity: 'MEDIUM',
          color: '#F2B84B',
          icon: AlertCircle,
          xPercent: 35,
          yPercent: 32,
          distance: '320m away',
        },
        {
          id: 'streetlight',
          name: 'Streetlight Cable Snapped',
          category: 'Electrical Operations',
          severity: 'HIGH',
          color: '#EF6A63',
          icon: Zap,
          xPercent: 78,
          yPercent: 44,
          distance: '650m away',
        },
        {
          id: 'drainage',
          name: 'Drainage Grate Missing',
          category: 'Stormwater Authority',
          severity: 'HIGH',
          color: '#2878E5',
          icon: Droplets,
          xPercent: 62,
          yPercent: 72,
          distance: '850m away',
        },
      ];
    }

    const positions = [
      { xPercent: 35, yPercent: 32, distance: '280m away' },
      { xPercent: 76, yPercent: 42, distance: '640m away' },
      { xPercent: 58, yPercent: 70, distance: '890m away' },
    ];

    // Pick 3 diverse non-resolved incidents
    const activeIncidents = incidents.filter(
      (inc) => !['RESOLVED', 'CLOSED'].includes(inc.status)
    );
    const chosen = (activeIncidents.length >= 3 ? activeIncidents : incidents).slice(0, 3);

    return chosen.map((inc, i) => {
      const pos = positions[i % positions.length];
      const isResolved = inc.status === 'RESOLVED' || inc.status === 'CLOSED';

      let color = '#2878E5';
      let icon = AlertCircle;
      let severity: 'HIGH' | 'MEDIUM' | 'WATER' | 'RESOLVED' = 'MEDIUM';

      if (isResolved) {
        color = '#36B37E';
        icon = CheckCircle2;
        severity = 'RESOLVED';
      } else if (inc.severity === 'CRITICAL' || inc.severity === 'HIGH') {
        color = '#EF6A63';
        severity = 'HIGH';
      } else if (inc.category === 'WATER_LEAK' || inc.category === 'DRAINAGE') {
        color = '#2878E5';
        icon = Droplets;
        severity = 'WATER';
      } else if (inc.category === 'STREETLIGHT') {
        color = '#F2B84B';
        icon = Zap;
      } else if (inc.category === 'GARBAGE' || inc.category === 'ILLEGAL_DUMPING') {
        color = '#F2B84B';
        icon = Trash2;
      }

      return {
        id: inc.id,
        name: getIncidentTitle(inc),
        category: inc.category,
        severity,
        color,
        icon,
        xPercent: pos.xPercent,
        yPercent: pos.yPercent,
        distance: pos.distance,
      };
    });
  }, [incidents]);

  return (
    <div id="nearby-issues" className="bg-white rounded-3xl border border-[#102A43]/[0.08] p-5 shadow-xs text-left select-none space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#102A43]/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#E7F7F0] text-[#159A68] flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 stroke-[2.4]" />
          </div>
          <h3 className="font-heading font-extrabold text-sm text-[#102A43]">
            Issues Near You
          </h3>
        </div>

        <Link
          to="/citizen/nearby"
          className="text-xs font-bold text-[#159A68] hover:text-[#128358] flex items-center gap-1 font-heading transition-colors"
        >
          <span>View Map</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Map Viewport Preview: Compact height (h-48) */}
      <div className="relative h-48 sm:h-52 w-full rounded-2xl bg-[#EBF2EA] border border-[#102A43]/10 overflow-hidden shadow-inner">
        {/* Stylized Vector Street Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 400 240">
          <defs>
            <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C4E0F9" />
              <stop offset="100%" stopColor="#9BCBF5" />
            </linearGradient>
          </defs>

          {/* Water channel / lake curve */}
          <path
            d="M-20,180 C80,160 120,80 200,90 C280,100 320,180 420,160 L420,240 L-20,240 Z"
            fill="url(#riverGrad)"
          />

          {/* Road Network Lines */}
          <line x1="0" y1="60" x2="400" y2="60" stroke="#FFFFFF" strokeWidth="8" />
          <line x1="0" y1="60" x2="400" y2="60" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="6 4" />

          <line x1="0" y1="140" x2="400" y2="140" stroke="#FFFFFF" strokeWidth="12" />
          <line x1="0" y1="140" x2="400" y2="140" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="8 6" />

          <line x1="120" y1="0" x2="120" y2="240" stroke="#FFFFFF" strokeWidth="10" />
          <line x1="120" y1="0" x2="120" y2="240" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="6 4" />

          <line x1="280" y1="0" x2="280" y2="240" stroke="#FFFFFF" strokeWidth="10" />
          <line x1="280" y1="0" x2="280" y2="240" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="6 4" />

          {/* Green municipal parks */}
          <rect x="140" y="80" width="120" height="40" rx="8" fill="#D3EAD7" opacity="0.8" />
          <rect x="20" y="80" width="80" height="40" rx="8" fill="#D3EAD7" opacity="0.8" />
          <rect x="300" y="20" width="80" height="30" rx="6" fill="#D3EAD7" opacity="0.8" />
        </svg>

        {/* Issue Pins Placed Over Map with Staggered Entrance */}
        {dynamicNearbyIssues.map((issue, idx) => {
          const Icon = issue.icon;
          return (
            <motion.div
              key={issue.id}
              initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.45 + idx * 0.1, ease: 'easeOut' }}
              onClick={() => setSelectedIssue(issue)}
              style={{ left: `${issue.xPercent}%`, top: `${issue.yPercent}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
            >
              <div className="relative flex flex-col items-center">
                {/* Core Pin without emojis */}
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold group-hover:scale-115 transition-transform"
                  style={{ backgroundColor: issue.color }}
                >
                  <Icon className="w-3 h-3 stroke-[2.5]" />
                </div>

                {/* Marker Anchor Tip */}
                <div
                  className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent -mt-0.5"
                  style={{ borderTop: `4.5px solid ${issue.color}` }}
                />
              </div>
            </motion.div>
          );
        })}

        {/* Selected Issue Mini Card Overlay */}
        {selectedIssue && (
          <div className="absolute top-2.5 left-2.5 right-2.5 bg-white/95 backdrop-blur-md border border-[#102A43]/10 p-2.5 rounded-xl shadow-md z-20 flex items-center justify-between text-xs animate-in fade-in duration-150">
            <div
              className="cursor-pointer group flex-1 mr-2"
              onClick={() => navigate(issueHasDetailRoute(selectedIssue.id) ? `/citizen/incidents/${selectedIssue.id}` : '/citizen/nearby')}
            >
              <span className="font-bold text-[#102A43] group-hover:text-[#159A68] font-heading block text-xs truncate">
                {selectedIssue.name}
              </span>
              <span className="text-[10px] text-[#526777]">
                {selectedIssue.category} · {selectedIssue.distance}
              </span>
            </div>
            <button
              onClick={() => setSelectedIssue(null)}
              className="text-[11px] font-bold text-[#159A68] hover:underline shrink-0"
            >
              Close
            </button>
          </div>
        )}

        {/* Bottom Status Bar Overlay */}
        <div className="absolute bottom-2.5 inset-x-2.5 z-10">
          <div className="bg-white/95 backdrop-blur-md border border-[#102A43]/10 rounded-xl p-2 px-3 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#102A43]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#159A68] animate-pulse" />
              <span className="text-[11px]">{dynamicNearbyIssues.length} active issues within 1 km</span>
            </div>

            <button
              onClick={() => navigate('/citizen/nearby')}
              className="w-6 h-6 rounded-full bg-[#FAF8F5] hover:bg-white text-[#159A68] flex items-center justify-center border border-[#102A43]/10 shadow-xs transition-transform active:scale-95 cursor-pointer"
              title="Locate me on map"
            >
              <Crosshair className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NearbyIssuesCard;
