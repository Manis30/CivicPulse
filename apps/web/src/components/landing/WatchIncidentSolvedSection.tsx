import React, { useState, useEffect } from 'react';
import {
  Camera,
  Eye,
  MapPin,
  CopyCheck,
  AlertOctagon,
  Route,
  Wrench,
  Truck,
  Image as ImageIcon,
  ShieldCheck,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Clock,
  ChevronRight
} from 'lucide-react';

interface DemonstrationStep {
  id: string;
  stageName: string;
  agentLabel: string;
  agentColor: string;
  icon: React.ComponentType<{ className?: string }>;
  inputData: string;
  reasoning: string;
  outputPayload: string;
  metricLabel: string;
  metricValue: string;
}

const DEMO_STEPS: DemonstrationStep[] = [
  {
    id: 'photo',
    stageName: 'PHOTO',
    agentLabel: 'CITIZEN REPORT',
    agentColor: '#159A68',
    icon: Camera,
    inputData: 'Citizen upload via mobile app · GPS locked',
    reasoning: 'EXIF timestamp audited · Tamper check passed · Device accelerometer verified stationary.',
    outputPayload: 'Photo captured at MG Road arterial corridor (Ward 08)',
    metricLabel: 'Capture Time',
    metricValue: '12 seconds',
  },
  {
    id: 'vision',
    stageName: 'VISION',
    agentLabel: 'VISION AGENT',
    agentColor: '#2878E5',
    icon: Eye,
    inputData: '24-bit JPEG image array · depth contours',
    reasoning: 'Edge segmentation identifies sharp cavity contour. Volumetric depth calculated at 14.2cm with asphalt fracture patterns.',
    outputPayload: 'Category: POTHOLE · Defect Area: 0.38 m² · Depth: 14cm',
    metricLabel: 'CV Confidence',
    metricValue: '96.4%',
  },
  {
    id: 'location',
    stageName: 'LOCATION',
    agentLabel: 'LOCATION AGENT',
    agentColor: '#2878E5',
    icon: MapPin,
    inputData: 'Raw GPS coordinates [12.7375, 77.8285] ±2.8m',
    reasoning: 'GIS 2dsphere index snaps point to municipal road centerline. Matches Ward 08 (Zone 01) South Arterial transit corridor.',
    outputPayload: 'Ward 08 · Zone 01 · Bus Transit Corridor #4',
    metricLabel: 'Spatial Error',
    metricValue: '±2.8 meters',
  },
  {
    id: 'duplicate',
    stageName: 'DUPLICATE',
    agentLabel: 'DUPLICATE AGENT',
    agentColor: '#36B37E',
    icon: CopyCheck,
    inputData: '25-meter spatial search & embedding distance',
    reasoning: 'Identified 2 prior citizen signals within 18m submitted in last 4 hours. Combined into single unified municipal ticket.',
    outputPayload: 'Merged 3 signals into root incident #INC-2026-1049',
    metricLabel: 'Deduplication',
    metricValue: '100% merged',
  },
  {
    id: 'severity',
    stageName: 'SEVERITY',
    agentLabel: 'SEVERITY AGENT',
    agentColor: '#EF6A63',
    icon: AlertOctagon,
    inputData: 'Cavity depth 14cm + bus route + peak hours',
    reasoning: 'Arterial road with heavy two-wheeler and public transit volume. Cavity depth exceeds 10cm safety threshold.',
    outputPayload: 'HIGH PRIORITY · SLA target: 24 hours',
    metricLabel: 'Risk Score',
    metricValue: '84 / 100',
  },
  {
    id: 'routing',
    stageName: 'ROUTING',
    agentLabel: 'ROUTING AGENT',
    agentColor: '#2878E5',
    icon: Route,
    inputData: 'Roads & Infrastructure jurisdiction · Crew roster',
    reasoning: 'Matched Department of Transport & Roads. Ward 08 Crew #42 selected: 0.8km away with active queue 1/5 and required asphalt roller.',
    outputPayload: 'Assigned: Roads Dept · Rapid Crew #42',
    metricLabel: 'Dispatch Lag',
    metricValue: '0.7s algorithm',
  },
  {
    id: 'work-order',
    stageName: 'WORK ORDER',
    agentLabel: 'OPERATIONS AGENT',
    agentColor: '#526777',
    icon: Wrench,
    inputData: 'Approved incident bundle & crew roster',
    reasoning: 'Generated official work order WO-2026-3041 with material manifest: 180kg hot asphalt mix, tack coat primer, vibratory plate compactor.',
    outputPayload: 'Work Order #WO-2026-3041 dispatched to crew terminal',
    metricLabel: 'Manifest Spec',
    metricValue: '180kg asphalt',
  },
  {
    id: 'field-action',
    stageName: 'FIELD ACTION',
    agentLabel: 'MUNICIPAL FIELD CREW',
    agentColor: '#F2B84B',
    icon: Truck,
    inputData: 'Turnkey mobile execution guide & safety zone',
    reasoning: 'Crew #42 deployed traffic cones, saw-cut damaged asphalt edges, applied bitumen tack coat, and compacted hot-mix asphalt flush.',
    outputPayload: 'Physical repair completed in 48 minutes',
    metricLabel: 'On-Site Time',
    metricValue: '48 minutes',
  },
  {
    id: 'after-evidence',
    stageName: 'AFTER EVIDENCE',
    agentLabel: 'FIELD OFFICER EVIDENCE',
    agentColor: '#159A68',
    icon: ImageIcon,
    inputData: 'Post-repair completion photo from crew device',
    reasoning: 'Officer captured repair image at exact GPS locus with camera orientation matching initial citizen intake photo.',
    outputPayload: 'Post-repair photographic evidence locked and hashed',
    metricLabel: 'Photo Audit',
    metricValue: 'GPS matched',
  },
  {
    id: 'verification',
    stageName: 'VERIFICATION',
    agentLabel: 'VERIFICATION AGENT',
    agentColor: '#159A68',
    icon: ShieldCheck,
    inputData: 'Before (citizen photo) vs After (crew repair photo)',
    reasoning: 'Neural dual-frame photometric comparison confirms defect cavity is 100% filled and compacted flush with surrounding pavement.',
    outputPayload: 'Resolution Verified ✓ Surface planar continuity: 98.4%',
    metricLabel: 'Confidence',
    metricValue: '98.4%',
  },
  {
    id: 'closed',
    stageName: 'CLOSED',
    agentLabel: 'NOTIFICATION AGENT',
    agentColor: '#36B37E',
    icon: CheckCircle2,
    inputData: 'Verified closure event logged to audit ledger',
    reasoning: 'Citizen notified via WhatsApp/SMS with interactive before/after transparency link. Incident recorded in ward health statistics.',
    outputPayload: 'Incident INC-2026-1049 officially closed and verified',
    metricLabel: 'Total SLA',
    metricValue: '3h 18m elapsed',
  },
];

export function WatchIncidentSolvedSection() {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Auto-progress demo every 2.8 seconds when playing
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % DEMO_STEPS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const activeStep = DEMO_STEPS[currentStepIndex];
  const StepIcon = activeStep.icon;

  const handleStepClick = (index: number) => {
    setIsPlaying(false);
    setCurrentStepIndex(index);
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsPlaying(true);
  };

  return (
    <section id="watch-incident" className="py-24 sm:py-32 bg-white relative overflow-hidden border-t border-[#102A43]/[0.06]">
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#2878E5]/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4 mb-16 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E7F7F0] border border-[#159A68]/20 text-[#159A68] text-xs font-bold tracking-wider uppercase font-heading">
            <span className="w-2 h-2 rounded-full bg-[#159A68] animate-pulse" />
            <span>PRODUCT DEMONSTRATION</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#102A43] font-heading tracking-tight leading-[1.12]">
            WATCH ONE INCIDENT <br />
            <span className="text-[#159A68]">GET SOLVED</span>
          </h2>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs sm:text-sm font-medium text-[#526777]">
            <span className="px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#102A43]/10 text-[#102A43] font-semibold">
              Defect: Pothole detected
            </span>
            <span className="px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#102A43]/10 text-[#102A43] font-semibold">
              Location: Ward 08 (Zone 01)
            </span>
            <span className="px-3 py-1 rounded-full bg-[#FDEEED] text-[#EF6A63] border border-[#EF6A63]/20 font-bold">
              Priority: High Priority
            </span>
          </div>
        </div>

        {/* Demo Interactive Controls Bar */}
        <div className="mb-10 bg-[#FAF8F5] border border-[#102A43]/[0.08] rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-xl bg-[#159A68] hover:bg-[#128358] text-white flex items-center justify-center shadow-sm transition-transform active:scale-95"
              title={isPlaying ? 'Pause Demonstration' : 'Play Demonstration'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>

            <button
              onClick={handleReset}
              className="w-10 h-10 rounded-xl bg-white hover:bg-slate-50 border border-[#102A43]/10 text-[#526777] flex items-center justify-center transition-colors"
              title="Reset to beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="text-left pl-2">
              <span className="text-[10px] font-mono text-[#829AB1] uppercase block">
                STEP {currentStepIndex + 1} OF {DEMO_STEPS.length}
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#102A43] font-heading">
                {activeStep.stageName} — {activeStep.agentLabel}
              </span>
            </div>
          </div>

          {/* Step Bubbles Quick Scrubber */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0">
            {DEMO_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(idx)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all whitespace-nowrap ${
                    isCurrent
                      ? 'bg-[#102A43] text-white shadow-sm scale-105'
                      : isPast
                        ? 'bg-[#E7F7F0] text-[#159A68] border border-[#159A68]/20'
                        : 'bg-white text-[#829AB1] border border-[#102A43]/10 hover:border-[#102A43]/20'
                  }`}
                >
                  {step.stageName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Side-by-Side: 11-Step Stepper (Left) & Active Agent Reasoning (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 6 Cols: Chronological Step Chain */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-[#102A43]/[0.08] p-6 sm:p-8 shadow-sm text-left space-y-3">
            <span className="text-[10px] font-bold font-mono text-[#829AB1] uppercase tracking-wider block mb-4">
              Autonomous Pipeline Execution
            </span>

            <div className="space-y-2">
              {DEMO_STEPS.map((step, idx) => {
                const isCurrent = idx === currentStepIndex;
                const isPast = idx < currentStepIndex;
                const Icon = step.icon;

                return (
                  <div
                    key={step.id}
                    onClick={() => handleStepClick(idx)}
                    className={`cursor-pointer p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-[#FAF8F5] border-[#159A68] shadow-sm ring-1 ring-[#159A68]/30'
                        : isPast
                          ? 'bg-white border-[#102A43]/[0.06] opacity-75 hover:opacity-100'
                          : 'bg-white border-[#102A43]/[0.06] opacity-40 hover:opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold font-mono ${
                          isCurrent
                            ? 'bg-[#159A68] text-white shadow-xs'
                            : isPast
                              ? 'bg-[#E7F7F0] text-[#159A68]'
                              : 'bg-[#FAF8F5] text-[#829AB1]'
                        }`}
                      >
                        {idx + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#102A43] font-heading">
                            {step.stageName}
                          </span>
                          <span className="text-[10px] text-[#829AB1] font-mono">
                            · {step.agentLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#526777] hidden sm:inline">
                        {step.metricValue}
                      </span>
                      {isPast && <CheckCircle2 className="w-4 h-4 text-[#159A68]" />}
                      {isCurrent && <span className="w-2 h-2 rounded-full bg-[#159A68] animate-ping" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 6 Cols: Active Agent Inspector Card */}
          <div className="lg:col-span-6 bg-[#102A43] text-white rounded-3xl border border-[#102A43] p-6 sm:p-8 shadow-xl shadow-[#102A43]/10 text-left space-y-6 sticky top-28">
            {/* Header Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: activeStep.agentColor }}
                >
                  <StepIcon className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#36B37E] font-heading block">
                    STAGE {currentStepIndex + 1} ACTIVE
                  </span>
                  <h3 className="text-xl font-extrabold text-white font-heading">
                    {activeStep.agentLabel}
                  </h3>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-[#94A3B8] block">{activeStep.metricLabel}</span>
                <span className="text-sm font-bold font-mono text-[#36B37E]">
                  {activeStep.metricValue}
                </span>
              </div>
            </div>

            {/* Input Telemetry */}
            <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl p-4 space-y-1">
              <span className="text-[10px] text-[#94A3B8] uppercase font-mono font-bold tracking-wider block">
                Ingested Signals / Input
              </span>
              <p className="text-xs sm:text-sm text-[#CBD5E1] font-mono">
                {activeStep.inputData}
              </p>
            </div>

            {/* Agent Reasoning */}
            <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl p-4 space-y-1.5">
              <span className="text-[10px] text-[#36B37E] uppercase font-mono font-bold tracking-wider block">
                Model Reasoning
              </span>
              <p className="text-xs sm:text-sm text-white font-sans leading-relaxed">
                {activeStep.reasoning}
              </p>
            </div>

            {/* Decision Outcome */}
            <div className="bg-[#159A68]/15 border border-[#159A68]/30 rounded-2xl p-4 space-y-1">
              <span className="text-[10px] text-[#36B37E] uppercase font-mono font-bold tracking-wider block">
                Verified Outcome
              </span>
              <p className="text-xs sm:text-sm font-semibold text-white font-heading">
                {activeStep.outputPayload}
              </p>
            </div>

            {/* Footer Disclaimer */}
            <div className="pt-2 flex items-center justify-between text-[11px] text-[#94A3B8] font-mono border-t border-white/10">
              <span>Authentic Pipeline Architecture</span>
              <span>100% Deterministic Verification</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WatchIncidentSolvedSection;
