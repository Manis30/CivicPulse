import React from 'react';
import {
  TrendingUp,
  Clock,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Activity,
  Layers,
  Compass
} from 'lucide-react';

interface MetricItem {
  number: string;
  label: string;
  change: string;
  subtext: string;
  color: string;
}

const MAIN_METRICS: MetricItem[] = [
  {
    number: '2,487',
    label: 'Issues Reported',
    change: '+18% this month',
    subtext: 'Citizen signals ingested across 18 zones',
    color: '#102A43',
  },
  {
    number: '1,842',
    label: 'Issues Resolved',
    change: '99.2% verified',
    subtext: 'Physically inspected & audited closures',
    color: '#159A68',
  },
  {
    number: '4.2h',
    label: 'Average Resolution Time',
    change: '-68% vs baseline',
    subtext: 'Down from 72h conventional civic SLA',
    color: '#2878E5',
  },
  {
    number: '96.8%',
    label: 'SLA Compliance',
    change: 'Autonomous triage',
    subtext: 'Zero manual triaging bottleneck delay',
    color: '#36B37E',
  },
  {
    number: '18',
    label: 'Active Civic Zones',
    change: 'Complete grid',
    subtext: 'Wards 1–18 unified in digital twin',
    color: '#102A43',
  },
  {
    number: '14,290',
    label: 'Autonomous AI Decisions',
    change: 'Zero false dispatches',
    subtext: 'Deterministic agent consensus logs',
    color: '#159A68',
  },
];

const ZONE_HEALTH = [
  { name: 'Zone 01 · Gandhi Nagar Core', health: 98, active: 3, resolved: 412 },
  { name: 'Zone 02 · Tech Boulevard Corridor', health: 94, active: 5, resolved: 388 },
  { name: 'Zone 03 · Subramaniya Residential', health: 92, active: 6, resolved: 320 },
  { name: 'Zone 04 · Municipal Hospital District', health: 97, active: 2, resolved: 405 },
  { name: 'Zone 05 · Civic Logistics & Water Works', health: 89, active: 8, resolved: 317 },
];

export function CityImpactSection() {
  return (
    <section id="city-impact" className="py-20 lg:py-28 bg-[#F7F8F4] relative overflow-hidden border-t border-[#102A43]/[0.06]">
      {/* Background Soft Radiance */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-[#159A68]/[0.035] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header (Section 18) */}
        <div className="max-w-3xl space-y-4 mb-16 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E7F7F0] border border-[#159A68]/20 text-[#159A68] text-xs font-bold tracking-wider uppercase font-heading">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>MUNICIPAL INTELLIGENCE & IMPACT</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#102A43] font-heading tracking-tight leading-[1.12]">
            Every report leaves a <br className="hidden sm:inline" />
            <span className="text-[#159A68]">measurable impact.</span>
          </h2>

          <p className="text-base sm:text-lg text-[#526777] leading-relaxed font-sans max-w-2xl">
            Real-time civic intelligence replaces slow bureaucracy. Watch your neighborhood’s physical infrastructure improve with transparent operational data.
          </p>
        </div>

        {/* 6 Key Metrics Grid (Editorial Large Typography) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {MAIN_METRICS.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-[#102A43]/[0.08] p-7 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between text-left"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#829AB1] font-heading">
                    {item.label}
                  </span>
                  <span className="text-[11px] font-semibold text-[#159A68] bg-[#E7F7F0] px-2.5 py-0.5 rounded-full">
                    {item.change}
                  </span>
                </div>

                <div
                  className="font-heading font-extrabold text-4xl sm:text-5xl tracking-tight leading-none mb-2"
                  style={{ color: item.color }}
                >
                  {item.number}
                </div>
              </div>

              <p className="text-xs text-[#526777] font-sans mt-4 pt-4 border-t border-[#102A43]/[0.06]">
                {item.subtext}
              </p>
            </div>
          ))}
        </div>

        {/* Zone Health & Digital Twin Telemetry Panel */}
        <div className="bg-white rounded-3xl border border-[#102A43]/[0.08] p-6 sm:p-10 lg:p-12 shadow-sm text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-[#102A43]/[0.06] gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#159A68] font-heading">
                ZONE PULSE TELEMETRY
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#102A43] font-heading">
                Municipal Ward Infrastructure Health Index
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#526777]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#159A68] animate-pulse" />
              <span>Live telemetry polled every 30s</span>
            </div>
          </div>

          <div className="space-y-5">
            {ZONE_HEALTH.map((zone, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-2xl bg-[#F7F8F4] border border-[#102A43]/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#2878E5]" />
                    <span className="font-heading font-extrabold text-sm text-[#102A43]">
                      {zone.name}
                    </span>
                  </div>
                  <div className="text-xs text-[#526777]">
                    {zone.active} active tickets · {zone.resolved} verified closures
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-64">
                  <div className="flex-1 bg-[#EEF4F7] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#159A68] h-full rounded-full"
                      style={{ width: `${zone.health}%` }}
                    />
                  </div>
                  <span className="font-heading font-extrabold text-sm text-[#102A43] shrink-0">
                    {zone.health}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-[#102A43]/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#526777]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#159A68]" />
              <span>All 18 ward operations centers operating under 15-minute dispatch SLAs</span>
            </div>
            <span className="font-medium text-[#102A43]">
              Next municipal telemetry refresh in 18s
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
