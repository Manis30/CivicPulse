import React from 'react';
import {
  XCircle,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  SplitSquareVertical
} from 'lucide-react';

const TRADITIONAL_ISSUES = [
  {
    title: 'Manual triage',
    desc: 'Uncategorized complaints languish in bureaucratic inboxes for days before being manually reviewed.',
    impact: '48–72h initial delay',
  },
  {
    title: 'Manual routing',
    desc: 'Siloed departmental handoffs rely on static paper tickets and disconnected dispatch radios.',
    impact: 'Misrouted crews & wasted mileage',
  },
  {
    title: 'Duplicate complaints',
    desc: 'Dozens of citizens report the same road defect, overwhelming staff without adding useful signal.',
    impact: 'Backlog inflation & false metrics',
  },
  {
    title: 'Status-based closure',
    desc: 'Tickets are marked "closed" simply by administrative keystroke without physical evidence or validation.',
    impact: 'Recurring unresolved infrastructure',
  },
];

const CIVICPULSE_SOLUTIONS = [
  {
    title: 'AI understanding',
    desc: 'Multimodal vision models analyze defect dimensions, road categories, and hazard levels in 1.4 seconds.',
    proof: '96% computer vision precision',
  },
  {
    title: 'Autonomous routing',
    desc: 'Instant dispatch algorithm matches jurisdiction, team proximity, and required tools directly.',
    proof: 'SLA countdown locked in seconds',
  },
  {
    title: 'Duplicate intelligence',
    desc: 'Spatial 2dsphere indexing and semantic embeddings merge related reports into single root incidents.',
    proof: 'Unified incident dossiers',
  },
  {
    title: 'Field execution',
    desc: 'Equipped municipal crews receive geo-fenced mobile work orders with turn-by-turn navigation.',
    proof: 'Real-time telemetry integration',
  },
  {
    title: 'Evidence-based verification',
    desc: 'Dual-frame photometric audit mathematically verifies repairs against original citizen damage photos.',
    proof: 'Cryptographic proof before closure',
  },
];

export function WhyCivicPulseSection() {
  return (
    <section id="why-civicpulse" className="py-24 sm:py-32 bg-[#F7F8F4] relative overflow-hidden border-t border-[#102A43]/[0.06]">
      {/* Background Soft Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-[#159A68]/[0.025] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4 mb-16 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E7F7F0] border border-[#159A68]/20 text-[#159A68] text-xs font-bold tracking-wider uppercase font-heading">
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>THE CIVIC PARADIGM SHIFT</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#102A43] font-heading tracking-tight leading-[1.12]">
            Why conventional civic tools fail. <br />
            <span className="text-[#159A68]">How CivicPulse solves it.</span>
          </h2>

          <p className="text-base sm:text-lg text-[#526777] font-sans leading-relaxed max-w-2xl font-normal">
            Traditional municipal ticketing relies on manual administrative gates.
            CivicPulse automates understanding, dispatch, and verification from end to end.
          </p>
        </div>

        {/* Comparison Grid (Split Studio Pattern) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {/* Left Column: Traditional Systems */}
          <div className="bg-white rounded-3xl border border-[#102A43]/[0.08] p-8 sm:p-10 shadow-sm flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-5 border-b border-[#102A43]/[0.08]">
                <div>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#EF6A63] font-heading block">
                    CONVENTIONAL MUNICIPAL TICKETING
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#102A43] font-heading mt-1">
                    Traditional Systems
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#FDEEED] text-[#EF6A63] flex items-center justify-center">
                  <XCircle className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>

              <div className="space-y-5">
                {TRADITIONAL_ISSUES.map((issue, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#102A43]/[0.04]">
                    <div className="w-6 h-6 rounded-full bg-[#FDEEED] text-[#EF6A63] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold font-mono">✕</span>
                    </div>
                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#102A43] font-heading">{issue.title}</span>
                        <span className="text-[10px] font-semibold text-[#EF6A63] px-2 py-0.5 rounded-full bg-[#FDEEED]">
                          {issue.impact}
                        </span>
                      </div>
                      <p className="text-xs sm:text-[13px] text-[#526777] font-sans leading-relaxed">
                        {issue.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#102A43]/[0.06] text-left">
              <span className="text-xs font-mono text-[#829AB1]">
                Baseline: High operational friction · Incomplete accountability
              </span>
            </div>
          </div>

          {/* Right Column: CivicPulse Platform */}
          <div className="bg-[#102A43] text-white rounded-3xl border border-[#102A43] p-8 sm:p-10 shadow-xl shadow-[#102A43]/10 flex flex-col justify-between relative overflow-hidden">
            {/* Soft Ambient Radiance */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#159A68]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between pb-5 border-b border-white/10">
                <div>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#36B37E] font-heading block">
                    AUTONOMOUS ORCHESTRATION PIPELINE
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-heading mt-1">
                    CivicPulse
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#159A68]/20 text-[#36B37E] border border-[#159A68]/30 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>

              <div className="space-y-4">
                {CIVICPULSE_SOLUTIONS.map((sol, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] transition-colors">
                    <div className="w-6 h-6 rounded-full bg-[#159A68] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <span className="text-xs font-bold font-mono">✓</span>
                    </div>
                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white font-heading">{sol.title}</span>
                        <span className="text-[10px] font-semibold text-[#36B37E] px-2 py-0.5 rounded-full bg-[#159A68]/20 border border-[#159A68]/30">
                          {sol.proof}
                        </span>
                      </div>
                      <p className="text-xs sm:text-[13px] text-[#CBD5E1] font-sans leading-relaxed">
                        {sol.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-left">
              <span className="text-xs font-mono text-[#94A3B8]">
                Standard: Autonomous triage · 100% verified resolution
              </span>
              <span className="text-xs font-bold text-[#36B37E] flex items-center gap-1">
                <span>Intelligent</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyCivicPulseSection;
