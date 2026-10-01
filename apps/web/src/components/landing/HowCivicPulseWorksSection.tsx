import React, { useState } from 'react';
import {
  Camera,
  Scan,
  Compass,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Clock,
  Layers,
  FileCheck
} from 'lucide-react';

interface WorkflowStage {
  num: string;
  tag: string;
  title: string;
  headline: string;
  body: string;
  metrics: { label: string; value: string };
  telemetry: string[];
  icon: any;
  color: string;
  bgColor: string;
}

const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    num: '01',
    tag: 'CITIZEN INGEST',
    title: 'REPORT',
    headline: 'Citizen captures a civic issue in seconds.',
    body: 'A resident takes a single photo of a damaged street light, flooded culvert, or illegal dumping site. Submissions take under 20 seconds with automatic GPS pin extraction.',
    metrics: { label: 'Time to Report', value: '18s average' },
    telemetry: ['GPS geofence verified', 'EXIF timestamp audited', 'Citizen receipt issued'],
    icon: Camera,
    color: '#159A68',
    bgColor: '#E7F7F0',
  },
  {
    num: '02',
    tag: 'NEURAL UNDERSTANDING',
    title: 'ANALYZE',
    headline: 'AI understands the image, defect type, and severity.',
    body: 'Vision neural models measure volumetric defect depth, detect hazardous exposure, and classify municipal asset jurisdiction with 96% computer vision confidence.',
    metrics: { label: 'AI Classification', value: '1.2s inference' },
    telemetry: ['Object edge segmentation', 'Hazard index computed', 'Asset classification #41'],
    icon: Scan,
    color: '#2878E5',
    bgColor: '#EBF3FD',
  },
  {
    num: '03',
    tag: 'SPATIAL INTELLIGENCE',
    title: 'INVESTIGATE',
    headline: 'Location, duplicate reports, and history are checked.',
    body: 'The duplicate and location engines cluster recurring signals within 25m into a unified municipal ticket, pulling historical maintenance logs to detect chronic root causes.',
    metrics: { label: 'Deduplication Rate', value: '38% cluster efficiency' },
    telemetry: ['GIS street corridor match', 'Asset maintenance history query', 'Corridor traffic weighting'],
    icon: Compass,
    color: '#F2B84B',
    bgColor: '#FEF8EC',
  },
  {
    num: '04',
    tag: 'CREW ALLOCATION',
    title: 'ACT',
    headline: 'The appropriate department and team are assigned.',
    body: 'Routing agents dispatch verified work orders directly to field officers (Roads, Water, or Electrical) with turnkey GPS route navigation and required parts inventory.',
    metrics: { label: 'Dispatch Latency', value: '4.8 min average' },
    telemetry: ['Ward crew roster synced', 'Equipment checklist generated', 'SLA countdown locked'],
    icon: Users,
    color: '#526777',
    bgColor: '#EEF4F7',
  },
  {
    num: '05',
    tag: 'PROOF OF RESOLUTION',
    title: 'VERIFY',
    headline: 'AI checks the physical resolution and closure evidence.',
    body: 'The field officer submits a post-repair verification photo. Computer vision checks surface leveling, patch sealing, and clean borders before permanently closing the ticket.',
    metrics: { label: 'Closure Accuracy', value: '99.2% verified' },
    telemetry: ['Photometric comparison', 'Audit log sealed', 'Citizen closure notification'],
    icon: ShieldCheck,
    color: '#36B37E',
    bgColor: '#EBF8F2',
  },
];

export function HowCivicPulseWorksSection() {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const current = WORKFLOW_STAGES[selectedIdx];
  const CurrentIcon = current.icon;

  return (
    <section id="workflow" className="py-20 lg:py-28 bg-[#F7F8F4] border-t border-[#102A43]/[0.06] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4 mb-16 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E7F7F0] border border-[#159A68]/20 text-[#159A68] text-xs font-bold tracking-wider uppercase font-heading">
            <Sparkles className="w-3.5 h-3.5" />
            <span>THE 5-STAGE CIVIC ENGINE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#102A43] font-heading tracking-tight leading-[1.12]">
            How CivicPulse works.
          </h2>

          <p className="text-base sm:text-lg text-[#526777] leading-relaxed font-sans max-w-2xl">
            A seamless journey from initial citizen perception to verified civic impact. Every step is transparent, audited, and deterministic.
          </p>
        </div>

        {/* Horizontal Visual Journey Stepper */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-10 overflow-x-auto pb-2">
          {WORKFLOW_STAGES.map((stage, idx) => {
            const isCurrent = idx === selectedIdx;
            const Icon = stage.icon;

            return (
              <button
                key={stage.num}
                onClick={() => setSelectedIdx(idx)}
                className={`text-left p-3 sm:p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between min-w-[140px] sm:min-w-0 ${
                  isCurrent
                    ? 'bg-white border-[#159A68] shadow-lg shadow-[#102A43]/[0.04] scale-[1.02]'
                    : 'bg-white/60 hover:bg-white border-[#102A43]/[0.06] hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-3 w-full">
                  <span
                    className={`font-mono text-xs font-bold ${
                      isCurrent ? 'text-[#159A68]' : 'text-[#829AB1]'
                    }`}
                  >
                    {stage.num}
                  </span>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: isCurrent ? stage.bgColor : '#F1F5F9',
                      color: isCurrent ? stage.color : '#829AB1',
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#829AB1] block">
                    STAGE
                  </span>
                  <span
                    className={`font-heading font-extrabold text-sm sm:text-base ${
                      isCurrent ? 'text-[#102A43]' : 'text-[#526777]'
                    }`}
                  >
                    {stage.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Interactive Showcase Panel */}
        <div className="bg-white rounded-3xl border border-[#102A43]/[0.08] p-6 sm:p-10 lg:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
          {/* Left: Narrative & Telemetry Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3">
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                style={{ backgroundColor: current.bgColor, color: current.color }}
              >
                <CurrentIcon className="w-5 h-5 stroke-[2.2]" />
              </span>
              <div>
                <span
                  className="text-xs font-bold tracking-wider uppercase font-heading block"
                  style={{ color: current.color }}
                >
                  STAGE {current.num} · {current.tag}
                </span>
                <span className="text-xl font-heading font-extrabold text-[#102A43]">
                  {current.title}
                </span>
              </div>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#102A43] font-heading leading-tight">
              {current.headline}
            </h3>

            <p className="text-sm sm:text-base text-[#526777] font-sans leading-relaxed">
              {current.body}
            </p>

            {/* Micro Telemetry Checklist */}
            <div className="space-y-2.5 pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#829AB1] block">
                STAGE AUDIT GATES:
              </span>
              {current.telemetry.map((t, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-[#102A43] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#159A68] shrink-0" />
                  <span>{t}</span>
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="pt-4 flex items-center gap-3">
              <button
                disabled={selectedIdx === 0}
                onClick={() => setSelectedIdx((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl border border-[#102A43]/10 text-xs font-semibold text-[#526777] hover:text-[#102A43] disabled:opacity-40"
              >
                Previous Stage
              </button>
              <button
                disabled={selectedIdx === WORKFLOW_STAGES.length - 1}
                onClick={() =>
                  setSelectedIdx((prev) =>
                    Math.min(WORKFLOW_STAGES.length - 1, prev + 1)
                  )
                }
                className="px-5 py-2 rounded-xl bg-[#159A68] text-white text-xs font-semibold hover:bg-[#128358] transition-all flex items-center gap-1.5 disabled:opacity-40"
              >
                <span>Next Stage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right: Technical Metric Visual Card */}
          <div className="lg:col-span-5 bg-[#F7F8F4] rounded-2xl p-6 sm:p-8 border border-[#102A43]/[0.06] space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#829AB1]">
                PERFORMANCE BENCHMARK
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#159A68]" />
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#102A43] font-heading">
                {current.metrics.value}
              </div>
              <p className="text-xs text-[#526777] font-medium">
                {current.metrics.label}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#102A43]/[0.06] space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#829AB1]">
                <span>Pipeline Stage Integrity</span>
                <span className="font-mono text-[#159A68] font-bold">100% Pass</span>
              </div>
              <div className="w-full bg-[#EEF4F7] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#159A68] h-full rounded-full transition-all duration-500"
                  style={{ width: `${((selectedIdx + 1) / 5) * 100}%` }}
                />
              </div>
            </div>

            <div className="text-[11px] text-[#526777] leading-relaxed">
              Every stage logs a permanent cryptographic signature to ensure municipal accountability and citizen auditability.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
