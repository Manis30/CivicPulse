import React from 'react';
import { Activity, ShieldCheck, Building2, CheckCircle2, TrendingUp } from 'lucide-react';

interface CityPulseStripProps {
  activeCount?: number;
  validatedCount?: number;
  departmentsCount?: number;
  resolvedTodayCount?: number;
}

export function CityPulseStrip({
  activeCount = 24,
  validatedCount = 18,
  departmentsCount = 9,
  resolvedTodayCount = 31,
}: CityPulseStripProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="bg-white rounded-3xl border border-[#E1E4F5] p-6 sm:p-8 lg:p-10 shadow-sm transition-all hover:shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#E1E4F5]/70">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5B5BF5] animate-ping" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#5B5BF5] font-heading">
              CITY PULSE
            </span>
            <span className="text-xs text-[#5E6485] font-sans">
              • Real-time Municipal Pulse of Hosur
            </span>
          </div>

          <div className="inline-flex items-center gap-2 text-xs font-medium text-[#0F7D5A] bg-[#ECFDF5] px-3 py-1 rounded-full border border-[#A7F3D0]/60">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Resolution velocity: +14% vs yesterday</span>
          </div>
        </div>

        {/* 4 Minimal Editorial Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 pt-6">
          {/* Metric 1 */}
          <div className="space-y-1.5 border-l-2 border-[#5B5BF5]/30 pl-4 sm:pl-6">
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#0E1330] tracking-tight">
                {activeCount}
              </span>
              <span className="text-xs font-semibold text-rose-500 uppercase tracking-wider">Live</span>
            </div>
            <div className="text-sm font-semibold text-[#0E1330] font-heading">Active Incidents</div>
            <div className="text-xs text-[#5E6485] font-sans">Awaiting final field inspection</div>
          </div>

          {/* Metric 2 */}
          <div className="space-y-1.5 border-l-2 border-[#3E8BFF]/30 pl-4 sm:pl-6">
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#0E1330] tracking-tight">
                {validatedCount}
              </span>
              <span className="text-xs font-semibold text-[#3E8BFF] uppercase tracking-wider">Auto</span>
            </div>
            <div className="text-sm font-semibold text-[#0E1330] font-heading">AI Validated</div>
            <div className="text-xs text-[#5E6485] font-sans">Duplicate & severity verified</div>
          </div>

          {/* Metric 3 */}
          <div className="space-y-1.5 border-l-2 border-[#5B5BF5]/30 pl-4 sm:pl-6">
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#0E1330] tracking-tight">
                0{departmentsCount}
              </span>
              <span className="text-xs font-semibold text-[#5B5BF5] uppercase tracking-wider">Synced</span>
            </div>
            <div className="text-sm font-semibold text-[#0E1330] font-heading">Departments Active</div>
            <div className="text-xs text-[#5E6485] font-sans">Roads, Water, Waste, Lights</div>
          </div>

          {/* Metric 4 */}
          <div className="space-y-1.5 border-l-2 border-[#0F7D5A]/40 pl-4 sm:pl-6">
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#0F7D5A] tracking-tight">
                {resolvedTodayCount}
              </span>
              <span className="text-xs font-semibold text-[#0F7D5A] uppercase tracking-wider">Done</span>
            </div>
            <div className="text-sm font-semibold text-[#0E1330] font-heading">Resolved Today</div>
            <div className="text-xs text-[#5E6485] font-sans">Work order closed & audited</div>
          </div>
        </div>
      </div>
    </section>
  );
}
