import React from 'react';
import {
  Camera,
  Eye,
  CheckCircle,
  AlertTriangle,
  Send,
  CheckCheck,
  ArrowRight
} from 'lucide-react';

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'REPORT',
    headline: 'Citizen submits an issue',
    description: 'Citizens snap a photo of potholes, leaks, or waste. GPS geocoding tags the exact Hosur street location.',
    icon: Camera,
    accent: '#5B5BF5',
    bg: '#ECEDFF',
  },
  {
    step: '02',
    title: 'UNDERSTAND',
    headline: 'AI analyzes image & description',
    description: 'Vision Agent evaluates structural severity, detects infrastructure type, and verifies image authenticity.',
    icon: Eye,
    accent: '#3E8BFF',
    bg: '#EFF6FF',
  },
  {
    step: '03',
    title: 'VALIDATE',
    headline: 'Location & duplicate checks',
    description: 'Autonomous spatial deduplication clusters multiple citizen reports around the same asset into a single work order.',
    icon: CheckCircle,
    accent: '#22C3B0',
    bg: '#ECFDF5',
  },
  {
    step: '04',
    title: 'PRIORITIZE',
    headline: 'Severity & urgency determined',
    description: 'Severity Agent computes risk metrics, traffic corridor impact, and binds target SLA deadlines.',
    icon: AlertTriangle,
    accent: '#F59E0B',
    bg: '#FFFBEB',
  },
  {
    step: '05',
    title: 'ROUTE',
    headline: 'The correct department receives it',
    description: 'Dispatched to specialized municipal crews (Roads, Water, Waste, Electrical) with turnkey route instructions.',
    icon: Send,
    accent: '#5B5BF5',
    bg: '#ECEDFF',
  },
  {
    step: '06',
    title: 'RESOLVE',
    headline: 'The city takes action',
    description: 'Field officers execute repairs and submit post-repair imagery for autonomous AI audit and closure.',
    icon: CheckCheck,
    accent: '#0F7D5A',
    bg: '#ECFDF5',
  },
];

export function CivicWorkflowSection() {
  return (
    <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="bg-white rounded-3xl border border-[#E1E4F5] p-6 sm:p-10 lg:p-14 shadow-sm">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECEDFF] text-[#5B5BF5] text-xs font-bold tracking-wider uppercase font-heading">
            FROM REPORT TO RESOLUTION
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0E1330] font-heading tracking-tight">
            From complaint to action.
          </h2>
          <p className="text-base sm:text-lg text-[#5E6485] font-sans leading-relaxed">
            Every report moves through an intelligent civic workflow — transforming citizen signals into physical municipal resolutions.
          </p>
        </div>

        {/* Horizontal Editorial Timeline (Desktop) & Stack (Mobile) */}
        <div className="relative">
          {/* Subtle horizontal connecting bar on large screens */}
          <div className="hidden lg:block absolute top-12 left-8 right-8 h-0.5 bg-gradient-to-r from-[#5B5BF5] via-[#3E8BFF] to-[#22C3B0] opacity-30 pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 relative z-10">
            {WORKFLOW_STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="group relative flex flex-col p-5 sm:p-6 rounded-2xl bg-[#F2F3FF]/50 border border-[#E1E4F5] hover:border-[#5B5BF5]/50 hover:bg-white hover:shadow-xl transition-all duration-300"
                >
                  {/* Step Header with Number & Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-heading font-extrabold text-sm transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: step.bg, color: step.accent }}
                    >
                      {step.step}
                    </span>
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-[#5B5BF5] transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Step Title Badge */}
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B5BF5] font-heading mb-1.5">
                    {step.title}
                  </span>

                  {/* Headline */}
                  <h3 className="font-heading font-bold text-sm text-[#0E1330] leading-snug mb-2 group-hover:text-[#5B5BF5] transition-colors">
                    {step.headline}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-[#5E6485] font-sans leading-relaxed mt-auto pt-2">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Flow Note */}
        <div className="mt-10 pt-6 border-t border-[#E1E4F5]/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5E6485]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0F7D5A]" />
            <span className="font-medium text-[#0E1330]">Fully automated Phase 4B civic pipeline</span>
            <span>—</span>
            <span>Zero manual triaging delay</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400">Average step completion:</span>
            <span className="font-mono font-semibold text-[#0E1330]">Under 1.2s per AI agent</span>
          </div>
        </div>
      </div>
    </section>
  );
}
