import React, { useState } from 'react';
import {
  Eye,
  MapPin,
  Copy,
  AlertOctagon,
  CornerDownRight,
  ShieldCheck,
  Cpu,
  ArrowDown,
  Sparkles,
  CheckCircle2,
  Terminal
} from 'lucide-react';

const AGENTS = [
  {
    id: 'vision',
    name: 'VISION AGENT',
    role: 'Understands what happened',
    icon: Eye,
    accent: '#3E8BFF',
    badge: 'Multimodal Neural Inspection',
    description: 'Inspects photos, measures damage surface, identifies infrastructure components, and rejects fraudulent or blurred submissions.',
    metrics: '0.84s inference • 98.6% class accuracy',
    sampleOutput: 'Category: POTHOLE • Severity: HIGH • Road surface erosion: 14cm depth • Sidewalk safe',
  },
  {
    id: 'location',
    name: 'LOCATION AGENT',
    role: 'Understands where it happened',
    icon: MapPin,
    accent: '#22C3B0',
    badge: 'Ward & GIS Georeferencing',
    description: 'Projects GPS telemetry onto Hosur GIS boundary datasets, resolves nearest municipal ward, and attaches arterial landmark coordinates.',
    metrics: 'Ward 12 (Central Hosur) • 2.4m geodetic tolerance',
    sampleOutput: 'Ward: Ward 12 • Zone: Zone Alpha • Landmark: Hosur Central Bus Stand (90m north)',
  },
  {
    id: 'duplicate',
    name: 'DUPLICATE AGENT',
    role: 'Detects existing incidents',
    icon: Copy,
    accent: '#5B5BF5',
    badge: 'Spatio-Temporal Clustering',
    description: 'Compares geographic radius and visual embeddings to detect if fellow citizens have already reported the same issue, merging work orders seamlessly.',
    metrics: '84% redundant dispatch reduction • 50m radius',
    sampleOutput: 'Cluster found: INC-2026-1048 • Linked report added • Prevented duplicate field truck dispatch',
  },
  {
    id: 'severity',
    name: 'SEVERITY AGENT',
    role: 'Determines urgency',
    icon: AlertOctagon,
    accent: '#F59E0B',
    badge: 'Multi-Factor Risk Scoring',
    description: 'Evaluates pedestrian density, hospital and school corridor proximity, and weather telemetry to bind legally compliant municipal SLAs.',
    metrics: 'Risk score 92/100 • Critical 4-Hour SLA bound',
    sampleOutput: 'Score: 92/100 • Factors: Heavy bus transit zone + Active water erosion hazard',
  },
  {
    id: 'routing',
    name: 'ROUTING AGENT',
    role: 'Sends the issue to the right department',
    icon: CornerDownRight,
    accent: '#0F7D5A',
    badge: 'Autonomous Dispatch Engine',
    description: 'Translates validated severity into a municipal work order, assigning the optimal field crew and alerting ward maintenance engineers.',
    metrics: 'Direct dispatch to DEPT-WATER-01 • Team: TEAM-WATER-FAST',
    sampleOutput: 'Department: Water Supply & Drainage • Officer: USR-OFF-04 • WO-2026-3041 dispatched',
  },
];

export function AIIntelligenceSection() {
  const [activeAgentIndex, setActiveAgentIndex] = useState(0);
  const activeAgent = AGENTS[activeAgentIndex];

  return (
    <section id="ai-intelligence" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <div className="bg-[#0A1236] rounded-3xl border border-[#5B5BF5]/30 p-6 sm:p-10 lg:p-16 text-white shadow-2xl relative overflow-hidden">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#5B5BF5]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#22C3B0]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="max-w-3xl space-y-3 mb-12 sm:mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B5BF5]/20 border border-[#5B5BF5]/40 text-[#3E8BFF] text-xs font-bold tracking-wider uppercase font-heading">
            <Cpu className="w-3.5 h-3.5" />
            <span>AUTONOMOUS AGENT ORCHESTRATION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-heading tracking-tight">
            AI that understands the city.
          </h2>
          <p className="text-base sm:text-lg text-slate-300 font-sans leading-relaxed">
            Not generic chat models or decorative graphics. Five specialized, deterministic agents collaborate sequentially to evaluate, verify, and resolve civic friction.
          </p>
        </div>

        {/* Agent Pipeline Architecture: Connected Cards with Animated Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
          {/* Left Column: Vertical Pipeline Step Cards */}
          <div className="lg:col-span-7 space-y-4 relative">
            {/* Visual connecting line representing data packet flow */}
            <div className="hidden sm:block absolute left-7 top-8 bottom-8 w-0.5 bg-gradient-to-b from-[#3E8BFF] via-[#5B5BF5] to-[#0F7D5A] opacity-40 pointer-events-none" />

            {AGENTS.map((agent, index) => {
              const Icon = agent.icon;
              const isActive = index === activeAgentIndex;

              return (
                <div
                  key={agent.id}
                  onClick={() => setActiveAgentIndex(index)}
                  className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-4 sm:p-5 border ${
                    isActive
                      ? 'bg-[#0E1B48] border-[#5B5BF5] shadow-lg shadow-[#5B5BF5]/20 translate-x-1 sm:translate-x-2'
                      : 'bg-[#080C20]/70 border-white/10 hover:border-white/20 hover:bg-[#080C20]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Node Dot / Icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300"
                      style={{
                        backgroundColor: isActive ? `${agent.accent}25` : 'rgba(255,255,255,0.05)',
                        color: agent.accent,
                        border: `1px solid ${isActive ? agent.accent : 'rgba(255,255,255,0.1)'}`,
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Agent Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-heading font-bold text-sm tracking-wide text-white">
                          {agent.name}
                        </span>
                        <span
                          className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${agent.accent}20`,
                            color: agent.accent,
                          }}
                        >
                          Step 0{index + 1}
                        </span>
                      </div>

                      <h4 className="font-heading font-medium text-xs text-[#3E8BFF] mb-1">
                        {agent.role}
                      </h4>

                      <p className="text-xs text-slate-300 font-sans leading-relaxed">
                        {agent.description}
                      </p>
                    </div>
                  </div>

                  {/* Processing Ping indicator when active */}
                  {isActive && (
                    <span className="absolute top-4 right-4 flex h-2 w-2">
                      <span
                        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                        style={{ backgroundColor: agent.accent }}
                      />
                      <span
                        className="relative inline-flex rounded-full h-2 w-2"
                        style={{ backgroundColor: agent.accent }}
                      />
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Live Agent Execution Telemetry Simulator */}
          <div className="lg:col-span-5 sticky top-28 space-y-4">
            <div className="bg-[#080C20] rounded-2xl border border-white/10 p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#22C3B0]" />
                  <span className="font-mono text-xs font-semibold text-slate-200">
                    AGENT AUDIT TELEMETRY
                  </span>
                </div>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  LIVE STREAM
                </span>
              </div>

              {/* Active Agent Highlight */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Selected Inspector:</span>
                  <span className="font-heading font-bold text-xs text-white">
                    {activeAgent.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Performance Benchmark:</span>
                  <span className="font-mono text-xs text-[#22C3B0]">
                    {activeAgent.metrics}
                  </span>
                </div>
              </div>

              {/* Structured JSON Log Output */}
              <div className="bg-black/40 rounded-xl p-4 border border-white/5 font-mono text-xs space-y-2 text-slate-300">
                <div className="text-[11px] text-slate-500">// Real-time incident payload analysis</div>
                <div className="text-[#3E8BFF]">
                  agent: <span className="text-white">"{activeAgent.id.toUpperCase()}_DISPATCHER"</span>
                </div>
                <div className="text-[#22C3B0]">
                  status: <span className="text-white">"VERIFIED_DETERMINISTIC"</span>
                </div>
                <div className="text-[#F59E0B]">
                  telemetry: <span className="text-slate-200">"{activeAgent.sampleOutput}"</span>
                </div>
              </div>

              {/* Agent Quality Safeguards */}
              <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Deterministic validation gates prevent hallucinated dispatches</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#3E8BFF] shrink-0" />
                  <span>Audit trail permanently preserved for municipal ward review</span>
                </div>
              </div>
            </div>

            {/* Quick Agent Navigation Pill */}
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
              <span>Inspect next agent:</span>
              <button
                onClick={() => setActiveAgentIndex((prev) => (prev + 1) % AGENTS.length)}
                className="font-medium text-[#3E8BFF] hover:text-[#22C3B0] transition-colors"
              >
                Next Step →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
