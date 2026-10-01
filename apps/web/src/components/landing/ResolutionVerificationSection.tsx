import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Eye,
  Camera,
  Wrench,
  Clock,
  Sparkles,
  FileCheck,
  RotateCcw
} from 'lucide-react';

interface VerificationCase {
  id: string;
  category: string;
  location: string;
  issueDetected: string;
  beforeTitle: string;
  beforeDesc: string;
  beforeMetrics: string;
  repairPerformed: string;
  actionTitle: string;
  actionDesc: string;
  actionCrew: string;
  actionDuration: string;
  evidenceUploaded: string;
  afterTitle: string;
  afterDesc: string;
  afterMetrics: string;
  confidence: string;
  verdict: 'CLOSED' | 'REOPENED';
}

const CASES: VerificationCase[] = [
  {
    id: 'case-road',
    category: 'ROAD INFRASTRUCTURE',
    location: 'South Arterial, MG Road, Ward 08',
    issueDetected: 'Deep asphalt cavity (depth 14cm)',
    beforeTitle: 'Severe Structural Pothole',
    beforeDesc: 'Subsurface collapse causing vehicle lane deviations on primary bus transit corridor.',
    beforeMetrics: 'Impact: High Risk · Bus route delay',
    repairPerformed: 'Infrared Asphalt Patch & Vibratory Compaction',
    actionTitle: 'Excavation & Hot-Mix Bitumen Seal',
    actionDesc: 'Roads maintenance crew excavated fractured perimeter, applied tack coat, and compacted hot-mix asphalt flush with grade.',
    actionCrew: 'Roads & Infrastructure Team #42',
    actionDuration: '48m execution',
    evidenceUploaded: 'Post-repair photographic evidence locked with GPS hash',
    afterTitle: 'Flush Engineered Pavement Restored',
    afterDesc: 'Continuous planar seal verified with zero edge deviation. Traffic reopened with sensor validation.',
    afterMetrics: 'Planar deviation: <2mm · Leveling: 98.4%',
    confidence: '98.8%',
    verdict: 'CLOSED',
  },
  {
    id: 'case-waste',
    category: 'SANITATION & WASTE',
    location: 'Gandhi Market Entrance, Ward 08',
    issueDetected: '4.2m³ unsegregated commercial refuse dump',
    beforeTitle: 'Overflowing Commercial Waste Dump',
    beforeDesc: 'Pedestrian walkway obstructed by overflowing illegal dumping near wholesale fruit stalls.',
    beforeMetrics: 'Hazard Index: 8.4/10 · Pest risk',
    repairPerformed: 'Hydraulic Compactor Dispatch & Disinfection',
    actionTitle: 'Sanitation Dispatch & Deep Clean',
    actionDesc: 'Rapid Response Team B deployed with hydraulic compactor truck #14 and pressurized disinfectant spray.',
    actionCrew: 'Ward 08 Sanitation Crew #03',
    actionDuration: '44m execution',
    evidenceUploaded: 'Post-clearance multi-angle photographic scan',
    afterTitle: 'Clean Restored Public Corridor',
    afterDesc: 'Walkway completely cleared, sanitized, and new segregated 240L bins installed with RFID tracking.',
    afterMetrics: 'Clearance rate: 100% · Surface sanitized',
    confidence: '99.4%',
    verdict: 'CLOSED',
  },
  {
    id: 'case-water',
    category: 'WATER UTILITIES',
    location: 'Bagalur Road Junction, Ward 12',
    issueDetected: 'Subsurface main leak pooling on carriageway',
    beforeTitle: 'High-Pressure Pipe Rupture',
    beforeDesc: 'Freshwater loss of 40 LPM threatening subgrade stability under main road junction.',
    beforeMetrics: 'Water loss: 40 LPM · Erosion threat',
    repairPerformed: 'Excavation, Sleeve Replacement & Hydrostatic Test',
    actionTitle: 'Subsurface Clamp & Backfill',
    actionDesc: 'Utility crew isolated local gate valve, installed high-pressure ductile iron repair sleeve, and restored road sub-base.',
    actionCrew: 'Water Board Rapid Unit #01',
    actionDuration: '1h 22m execution',
    evidenceUploaded: 'Pressure gauge sensor log & post-backfill photo',
    afterTitle: 'Pressure Stabilized & Sealed',
    afterDesc: 'Telemetry confirms 4.2 bar steady pressure without residual seepage. Asphalt cap sealed.',
    afterMetrics: 'Pressure: 4.2 bar nominal · Zero leak',
    confidence: '99.1%',
    verdict: 'CLOSED',
  },
];

export function ResolutionVerificationSection() {
  const [activeCaseIdx, setActiveCaseIdx] = useState(0);
  const currentCase = CASES[activeCaseIdx];

  return (
    <section id="verification" className="py-24 sm:py-32 bg-[#FAF8F5] relative overflow-hidden border-t border-[#102A43]/[0.06]">
      {/* Background Soft Radiance */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#159A68]/[0.035] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4 mb-16 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E7F7F0] border border-[#159A68]/20 text-[#159A68] text-xs font-bold tracking-wider uppercase font-heading">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PROOF OF RESOLUTION ARCHITECTURE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#102A43] font-heading tracking-tight leading-[1.12]">
            Resolved doesn’t always <br />
            <span className="text-[#159A68]">mean solved.</span>
          </h2>

          <p className="text-base sm:text-lg text-[#526777] font-sans leading-relaxed max-w-2xl font-normal">
            In traditional systems, complaints are closed on paper without physical validation. CivicPulse enforces autonomous computer-vision comparison before any ticket is certified closed.
          </p>
        </div>

        {/* Case Selector Tabs */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          {CASES.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setActiveCaseIdx(idx)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
                activeCaseIdx === idx
                  ? 'bg-[#159A68] text-white border-[#159A68] shadow-md shadow-[#159A68]/20'
                  : 'bg-white text-[#526777] border-[#102A43]/10 hover:border-[#102A43]/20 hover:text-[#102A43]'
              }`}
            >
              {item.category}
            </button>
          ))}
        </div>

        {/* Before → Field Action → After → AI Verification Visual Journey */}
        <div className="bg-white rounded-3xl border border-[#102A43]/[0.08] p-6 sm:p-10 lg:p-12 shadow-sm text-left">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-[#102A43]/[0.06] gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#159A68] font-heading block">
                AUDITED MUNICIPAL RESOLUTION
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#102A43] font-heading mt-0.5">
                {currentCase.location}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 bg-[#E7F7F0] border border-[#159A68]/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#159A68]">
                <CheckCircle2 className="w-4 h-4" />
                <span>AI Verified · {currentCase.confidence} Confidence</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#102A43] text-white text-xs font-mono font-bold">
                DECISION: {currentCase.verdict}
              </span>
            </div>
          </div>

          {/* 3-Column Visual Journey: BEFORE → ACTION → AFTER */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Step 1: BEFORE (Issue detected) */}
            <div className="lg:col-span-4 rounded-2xl bg-[#FAF8F5] border border-[#102A43]/[0.08] p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#EF6A63] bg-[#FDEEED] px-3 py-1 rounded-full font-heading">
                    01 · BEFORE
                  </span>
                  <Camera className="w-4 h-4 text-[#829AB1]" />
                </div>
                <span className="text-[10px] font-mono text-[#EF6A63] uppercase font-bold tracking-wider block mb-1">
                  Issue detected
                </span>
                <h4 className="font-heading font-extrabold text-base text-[#102A43] mb-2">
                  {currentCase.beforeTitle}
                </h4>
                <p className="text-xs text-[#526777] font-sans leading-relaxed">
                  {currentCase.beforeDesc}
                </p>
              </div>

              <div className="pt-4 border-t border-[#102A43]/[0.06] text-[11px] font-medium text-[#EF6A63]">
                {currentCase.beforeMetrics}
              </div>
            </div>

            {/* Step 2: FIELD ACTION (Repair performed) */}
            <div className="lg:col-span-4 rounded-2xl bg-[#EEF4F7] border border-[#102A43]/[0.08] p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2878E5] bg-[#EBF3FD] px-3 py-1 rounded-full font-heading">
                    02 · FIELD ACTION
                  </span>
                  <Wrench className="w-4 h-4 text-[#829AB1]" />
                </div>
                <span className="text-[10px] font-mono text-[#2878E5] uppercase font-bold tracking-wider block mb-1">
                  Repair performed
                </span>
                <h4 className="font-heading font-extrabold text-base text-[#102A43] mb-2">
                  {currentCase.actionTitle}
                </h4>
                <p className="text-xs text-[#526777] font-sans leading-relaxed">
                  {currentCase.actionDesc}
                </p>
              </div>

              <div className="pt-4 border-t border-[#102A43]/[0.06] flex items-center justify-between text-[11px] text-[#526777]">
                <span className="font-medium text-[#102A43]">{currentCase.actionCrew}</span>
                <span className="text-[#829AB1]">{currentCase.actionDuration}</span>
              </div>
            </div>

            {/* Step 3: AFTER & AI VERIFICATION (After evidence uploaded & AI compares evidence) */}
            <div className="lg:col-span-4 rounded-2xl bg-[#E7F7F0]/70 border border-[#159A68]/30 p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#159A68] bg-[#E7F7F0] px-3 py-1 rounded-full font-heading">
                    03 · AFTER (VERIFIED)
                  </span>
                  <ShieldCheck className="w-4 h-4 text-[#159A68]" />
                </div>
                <span className="text-[10px] font-mono text-[#159A68] uppercase font-bold tracking-wider block mb-1">
                  After evidence uploaded · AI compares evidence
                </span>
                <h4 className="font-heading font-extrabold text-base text-[#102A43] mb-2">
                  {currentCase.afterTitle}
                </h4>
                <p className="text-xs text-[#526777] font-sans leading-relaxed">
                  {currentCase.afterDesc}
                </p>
              </div>

              <div className="pt-4 border-t border-[#159A68]/20 flex items-center justify-between text-[11px] font-bold text-[#159A68]">
                <span>{currentCase.afterMetrics}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#159A68] text-white text-[10px] font-mono uppercase tracking-wider">
                  ✓ {currentCase.verdict}
                </span>
              </div>
            </div>
          </div>

          {/* Verification Decision Architecture Banner */}
          <div className="mt-8 bg-[#FAF8F5] border border-[#102A43]/[0.08] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#159A68] text-white flex items-center justify-center shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#102A43] font-heading block">
                  Autonomous Verification Rule: Threshold &gt; 95%
                </span>
                <p className="text-xs text-[#526777]">
                  If after-repair evidence reveals edge gaps, sub-base settling, or incorrect materials, the ticket is immediately <strong>REOPENED</strong> with re-dispatch escalation.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span className="text-xs font-bold text-[#159A68] px-3 py-1 rounded-full bg-[#E7F7F0] border border-[#159A68]/30">
                CLOSED (Passed)
              </span>
              <span className="text-xs font-bold text-[#829AB1] px-3 py-1 rounded-full bg-white border border-[#102A43]/10">
                REOPENED (Audit Fail)
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ResolutionVerificationSection;
