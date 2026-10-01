import React, { useState } from 'react';
import {
  Camera,
  Scan,
  Compass,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react';

interface WorkflowStep {
  num: string;
  stage: 'REPORT' | 'ANALYZE' | 'INVESTIGATE' | 'ACT' | 'VERIFY';
  tag: string;
  headline: string;
  detail: string;
  proofBadge: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgLight: string;
  borderLight: string;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    num: '01',
    stage: 'REPORT',
    tag: 'CITIZEN SIGNAL',
    headline: 'Citizen captures a defect in seconds',
    detail: 'A resident snaps a photo of a road cavity or flooded culvert. GPS coordinates and EXIF tamper integrity are automatically recorded.',
    proofBadge: 'EXIF geofence verified',
    icon: Camera,
    color: '#159A68',
    bgLight: '#E7F7F0',
    borderLight: 'rgba(21, 154, 104, 0.25)',
  },
  {
    num: '02',
    stage: 'ANALYZE',
    tag: 'VISION & SEVERITY',
    headline: 'AI understands defect & risk',
    detail: 'Neural vision models estimate depth and area, classifying defect urgency and computing hazard matrices in 1.4 seconds.',
    proofBadge: '96% CV confidence',
    icon: Scan,
    color: '#2878E5',
    bgLight: '#EBF3FD',
    borderLight: 'rgba(40, 120, 229, 0.25)',
  },
  {
    num: '03',
    stage: 'INVESTIGATE',
    tag: 'SPATIAL DEDUPLICATION',
    headline: 'Duplicates & asset history merged',
    detail: 'The engine clusters recurring reports within 25m into a unified municipal ticket and checks past maintenance records for root causes.',
    proofBadge: 'Zero redundant work orders',
    icon: Compass,
    color: '#F2B84B',
    bgLight: '#FEF8EC',
    borderLight: 'rgba(242, 184, 75, 0.35)',
  },
  {
    num: '04',
    stage: 'ACT',
    tag: 'DISPATCH & EXECUTION',
    headline: 'Field team dispatched with work order',
    detail: 'Routing matches department jurisdiction and equipped crew proximity, locking SLA countdown and parts manifest for rapid repair.',
    proofBadge: 'Turnkey mobile dispatch',
    icon: Users,
    color: '#526777',
    bgLight: '#EEF4F7',
    borderLight: 'rgba(82, 103, 119, 0.25)',
  },
  {
    num: '05',
    stage: 'VERIFY',
    tag: 'PHYSICAL AUDIT',
    headline: 'Photometric proof confirms closure',
    detail: 'Field crews upload post-repair imagery. The verification model conducts dual-frame photometric audits before closing or reopening the ticket.',
    proofBadge: '100% evidence-backed',
    icon: ShieldCheck,
    color: '#36B37E',
    bgLight: '#EBF8F2',
    borderLight: 'rgba(54, 179, 126, 0.3)',
  },
];

export function OneReportWorkflowSection() {
  const [activeStep, setActiveStep] = useState<number>(0);

  return (
    <section id="workflow" className="py-24 sm:py-32 bg-white relative overflow-hidden border-t border-[#102A43]/[0.06]">
      {/* Background Subtle Gradient Band */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#F7F8F4] to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4 mb-20 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E7F7F0] border border-[#159A68]/20 text-[#159A68] text-xs font-bold tracking-wider uppercase font-heading">
            <Layers className="w-3.5 h-3.5" />
            <span>END-TO-END AUTONOMOUS LIFECYCLE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#102A43] font-heading tracking-tight leading-[1.12]">
            One report can start <br />
            <span className="text-[#159A68]">a chain of action.</span>
          </h2>

          <p className="text-base sm:text-lg text-[#526777] font-sans leading-relaxed max-w-2xl font-normal">
            From the initial citizen tap to cryptographically verified physical repair. Every transition is deterministic, transparent, and auditable.
          </p>
        </div>

        {/* 5-Stage Stepper Flow (Horizontal on lg, Vertical on mobile) */}
        <div className="relative">
          {/* Subtle Horizontal Connector Bar (Desktop) */}
          <div className="hidden lg:block absolute top-14 left-8 right-8 h-0.5 bg-gradient-to-r from-[#159A68]/30 via-[#2878E5]/30 to-[#36B37E]/30 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
            {WORKFLOW_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isSelected = activeStep === idx;

              return (
                <div
                  key={step.num}
                  onClick={() => setActiveStep(idx)}
                  className={`cursor-pointer rounded-3xl p-6 sm:p-7 border transition-all duration-300 flex flex-col justify-between text-left ${
                    isSelected
                      ? 'bg-[#FAF8F5] border-[#102A43]/20 shadow-lg shadow-[#102A43]/[0.04] scale-[1.02]'
                      : 'bg-white border-[#102A43]/[0.08] hover:border-[#102A43]/15 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top: Step Number & Icon */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#829AB1]">
                        STAGE {step.num}
                      </span>
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center transition-transform duration-200"
                        style={{
                          backgroundColor: step.bgLight,
                          color: step.color,
                          border: `1px solid ${step.borderLight}`,
                        }}
                      >
                        <Icon className="w-5 h-5 stroke-[2.2]" />
                      </div>
                    </div>

                    {/* Stage Name Badge */}
                    <div className="pt-2">
                      <span
                        className="inline-block text-[11px] font-bold uppercase tracking-wider font-heading px-2.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: step.bgLight,
                          color: step.color,
                        }}
                      >
                        {step.stage}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-[#102A43] font-heading mt-2 leading-snug">
                        {step.headline}
                      </h3>
                    </div>

                    {/* Step Detail */}
                    <p className="text-xs text-[#526777] font-sans leading-relaxed">
                      {step.detail}
                    </p>
                  </div>

                  {/* Bottom: Proof Badge */}
                  <div className="pt-5 mt-5 border-t border-[#102A43]/[0.06] flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#102A43] font-heading flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#159A68]" />
                      <span>{step.proofBadge}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Stage Insight Bar */}
        <div className="mt-12 bg-[#FAF8F5] border border-[#102A43]/[0.08] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#159A68] animate-pulse shrink-0" />
            <div>
              <span className="text-xs font-bold text-[#102A43] font-heading uppercase tracking-wide">
                CURRENT STAGE: {WORKFLOW_STEPS[activeStep].stage}
              </span>
              <p className="text-xs text-[#526777] font-sans">
                {WORKFLOW_STEPS[activeStep].detail}
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2 text-xs font-mono text-[#829AB1]">
            <span>{WORKFLOW_STEPS[activeStep].proofBadge}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OneReportWorkflowSection;
