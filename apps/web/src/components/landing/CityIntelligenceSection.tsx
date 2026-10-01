import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Droplets,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Activity,
  Flame,
  Compass
} from 'lucide-react';

const THREE_CORE_METRICS = [
  {
    number: '1.4s',
    label: 'Autonomous Triage Latency',
    subtext: 'Zero manual administrative intake delays',
    color: '#159A68',
    bg: '#E7F7F0',
  },
  {
    number: '99.2%',
    label: 'Verified Closure Rate',
    subtext: 'Every resolution backed by photometric evidence',
    color: '#2878E5',
    bg: '#EBF3FD',
  },
  {
    number: '-68%',
    label: 'Resolution SLA Time',
    subtext: 'Down from 72h conventional civic baseline to 4.2h',
    color: '#102A43',
    bg: '#FAF8F5',
  },
];

const HOTSPOT_INCIDENTS = [
  {
    id: 'h-1',
    title: 'Water Main Seepage #41',
    dist: '12m from junction',
    time: '2 days ago',
    status: 'Verified Closed',
  },
  {
    id: 'h-2',
    title: 'Hydrant Valve Pressure Drop',
    dist: '45m from junction',
    time: 'Yesterday',
    status: 'Field Dispatched',
  },
  {
    id: 'h-3',
    title: 'Pavement Sub-Base Pooling',
    dist: '68m from junction',
    time: '4 hours ago',
    status: 'Investigating',
  },
  {
    id: 'h-4',
    title: 'Service Line Vibration Surge',
    dist: '110m from junction',
    time: '1 hour ago',
    status: 'Cluster Correlated',
  },
];

export function CityIntelligenceSection() {
  const [selectedIncident, setSelectedIncident] = useState<string>('h-1');

  return (
    <section id="city-intelligence" className="py-24 sm:py-32 bg-[#F7F8F4] relative overflow-hidden border-t border-[#102A43]/[0.06]">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-[#159A68]/[0.035] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4 mb-16 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E7F7F0] border border-[#159A68]/20 text-[#159A68] text-xs font-bold tracking-wider uppercase font-heading">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>PREDICTIVE CITY INTELLIGENCE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#102A43] font-heading tracking-tight leading-[1.12]">
            Every report leaves a <br />
            <span className="text-[#159A68]">measurable impact.</span>
          </h2>

          <p className="text-base sm:text-lg text-[#526777] font-sans leading-relaxed max-w-2xl font-normal">
            Autonomous resolution produces aggregated spatial telemetry, converting reactive citizen tickets into predictive infrastructure asset intelligence.
          </p>
        </div>

        {/* 3 Concise Key Metrics (Replacing former 6 KPI cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {THREE_CORE_METRICS.map((metric, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-[#102A43]/[0.08] p-8 shadow-sm text-left flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span
                  className="text-4xl sm:text-5xl font-extrabold font-heading tracking-tight"
                  style={{ color: metric.color }}
                >
                  {metric.number}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#102A43] font-heading">
                  {metric.label}
                </h3>
              </div>
              <p className="text-xs text-[#526777] font-sans pt-4 mt-4 border-t border-[#102A43]/[0.06]">
                {metric.subtext}
              </p>
            </div>
          ))}
        </div>

        {/* Signature City Intelligence Visualization: HOTSPOT DETECTED */}
        <div className="bg-[#102A43] text-white rounded-3xl border border-[#102A43] p-8 sm:p-12 shadow-xl shadow-[#102A43]/10 relative overflow-hidden text-left">
          {/* Subtle Ambient Heat Radiance */}
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 bg-[#EF6A63]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            {/* Left 6 Cols: Hotspot Overview & AI Root Cause Diagnosis */}
            <div className="lg:col-span-6 space-y-6">
              {/* Alert Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EF6A63]/20 border border-[#EF6A63]/30 text-[#EF6A63] text-xs font-bold tracking-wider uppercase font-heading">
                <Flame className="w-4 h-4 animate-pulse" />
                <span>HOTSPOT DETECTED</span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
                  Water Infrastructure · Zone 04
                </h3>
                <span className="text-sm font-semibold text-[#F2B84B] mt-1 block">
                  Repeated incidents detected across 180m radius.
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#CBD5E1] font-sans leading-relaxed">
                Rather than treating each water leak as an isolated maintenance ticket, CivicPulse's Intelligence Agent correlated 4 incidents within 48 hours to discover structural water-hammer vibration from an adjacent industrial pumping station.
              </p>

              {/* Systemic Action Recommendation */}
              <div className="bg-white/[0.06] border border-white/[0.1] rounded-2xl p-4 sm:p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#36B37E] font-bold">
                    RECOMMENDED CAPITAL INTERVENTION
                  </span>
                  <span className="text-[10px] font-mono text-[#94A3B8]">Confidence: 97.6%</span>
                </div>
                <p className="text-xs text-white font-semibold leading-relaxed">
                  "Replace 60m trunk line junction with flexible expansion joints in Q4 capital budget instead of continuing piecemeal emergency clamps."
                </p>
              </div>

              <div className="flex items-center gap-6 pt-2 text-xs font-mono text-[#94A3B8]">
                <span>Incident Cluster: <strong>4 Verified</strong></span>
                <span>•</span>
                <span>Predicted Savings: <strong>$42,000 / yr</strong></span>
              </div>
            </div>

            {/* Right 6 Cols: Interactive Heat Cluster Graphic Simulation */}
            <div className="lg:col-span-6 bg-white/[0.04] border border-white/[0.08] rounded-3xl p-6 sm:p-8 relative">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-[#3E8BFF]" />
                  <span className="text-xs font-bold font-heading text-white">
                    Spatial Incident Concentration Matrix
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#36B37E] px-2.5 py-0.5 rounded-full bg-[#159A68]/20 border border-[#159A68]/30">
                  LIVE SPATIAL CLUSTERING
                </span>
              </div>

              {/* Heat Density Visualization Graphic */}
              <div className="relative h-60 w-full rounded-2xl bg-[#0B1A28] border border-white/10 overflow-hidden flex items-center justify-center p-4">
                {/* SVG Concentric Heat Waves */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 200">
                  {/* Outer Heat Ring */}
                  <circle cx="150" cy="100" r="75" fill="#EF6A63" fillOpacity="0.08" stroke="#EF6A63" strokeOpacity="0.2" strokeDasharray="3 3" />
                  {/* Mid Heat Ring */}
                  <circle cx="150" cy="100" r="50" fill="#F2B84B" fillOpacity="0.12" stroke="#F2B84B" strokeOpacity="0.35" />
                  {/* Core Hotspot Ring */}
                  <circle cx="150" cy="100" r="24" fill="#EF6A63" fillOpacity="0.28" stroke="#EF6A63" strokeWidth="2">
                    <animate attributeName="r" values="22;27;22" dur="2.4s" repeatCount="indefinite" />
                  </circle>

                  {/* Incident Marker Points */}
                  <circle cx="145" cy="95" r="4" fill="#FFFFFF" />
                  <circle cx="160" cy="110" r="3.5" fill="#F2B84B" />
                  <circle cx="130" cy="85" r="3.5" fill="#36B37E" />
                  <circle cx="175" cy="80" r="3" fill="#3E8BFF" />
                </svg>

                {/* Hotspot Center Overlay Label */}
                <div className="relative z-10 text-center pointer-events-none">
                  <div className="w-8 h-8 rounded-full bg-[#EF6A63] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#EF6A63]/50 animate-bounce">
                    <Droplets className="w-4 h-4 fill-white" />
                  </div>
                  <span className="text-[10px] font-bold font-mono tracking-wider text-white mt-1 block">
                    PRESSURE SPIKE LOCUS
                  </span>
                </div>
              </div>

              {/* Cluster Incidents Mini-List */}
              <div className="mt-4 space-y-2">
                {HOTSPOT_INCIDENTS.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc.id)}
                    className={`cursor-pointer p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs ${
                      selectedIncident === inc.id
                        ? 'bg-white/10 border-white/20'
                        : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#EF6A63]" />
                      <span className="font-semibold text-white">{inc.title}</span>
                      <span className="text-[10px] text-[#94A3B8]">({inc.dist})</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#36B37E]">{inc.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CityIntelligenceSection;
