import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Eye,
  MapPin,
  CopyCheck,
  AlertOctagon,
  Route,
  Search,
  Wrench,
  ShieldCheck,
  Bell,
  Sparkles,
  ArrowRight,
  Activity,
  Layers,
  Zap,
  CheckCircle2
} from 'lucide-react';

export interface AgentNode {
  id: string;
  name: string;
  shortName: string;
  role: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  lightBg: string;
  task: string;
  tool: string;
  result: string;
  confidence: string;
  duration: string;
  angleDeg: number;
}

export const TEN_AGENTS: AgentNode[] = [
  {
    id: 'vision',
    name: 'VISION AGENT',
    shortName: 'Vision',
    role: 'Computer Vision & Defect Triage',
    icon: Eye,
    color: '#159A68',
    lightBg: '#E7F7F0',
    task: 'Analyze uploaded citizen photo and measure defect volume',
    tool: 'analyzeImage()',
    result: 'Structural asphalt pothole detected (depth 14cm)',
    confidence: '96%',
    duration: '1.4s',
    angleDeg: 270, // 12 o'clock
  },
  {
    id: 'location',
    name: 'LOCATION AGENT',
    shortName: 'Location',
    role: 'GIS Snapping & Corridor Mapping',
    icon: MapPin,
    color: '#2878E5',
    lightBg: '#EBF3FD',
    task: 'Resolve GIS coordinates to municipal street centerline',
    tool: 'resolveStreetSegment()',
    result: 'MG Road, South Arterial, Ward 08 (Zone 01)',
    confidence: '99%',
    duration: '0.4s',
    angleDeg: 306,
  },
  {
    id: 'duplicate',
    name: 'DUPLICATE AGENT',
    shortName: 'Duplicate',
    role: 'Spatial Clustering & Signal Deduplication',
    icon: CopyCheck,
    color: '#36B37E',
    lightBg: '#EBF8F2',
    task: 'Search nearby incidents within 25m radius',
    tool: 'clusterSpatialReports()',
    result: 'Merged with 3 citizen signals into single ticket',
    confidence: '93%',
    duration: '0.8s',
    angleDeg: 342,
  },
  {
    id: 'severity',
    name: 'SEVERITY AGENT',
    shortName: 'Severity',
    role: 'Hazard Analysis & SLA Assignment',
    icon: AlertOctagon,
    color: '#EF6A63',
    lightBg: '#FDEEED',
    task: 'Compute traffic hazard & SLA threshold',
    tool: 'computeHazardScore()',
    result: 'HIGH PRIORITY (Bus transit corridor impact)',
    confidence: '94%',
    duration: '0.6s',
    angleDeg: 18,
  },
  {
    id: 'routing',
    name: 'ROUTING AGENT',
    shortName: 'Routing',
    role: 'Municipal Crew & Equipment Matching',
    icon: Route,
    color: '#2878E5',
    lightBg: '#EBF3FD',
    task: 'Select optimal department and field team',
    tool: 'matchDepartmentCrew()',
    result: 'Roads & Infrastructure Dept → Ward 08 Crew #42',
    confidence: '98%',
    duration: '0.7s',
    angleDeg: 54,
  },
  {
    id: 'investigation',
    name: 'INVESTIGATION AGENT',
    shortName: 'Investigation',
    role: 'Historical Recurrence & Root Cause',
    icon: Search,
    color: '#F2B84B',
    lightBg: '#FEF8EC',
    task: 'Cross-reference asset maintenance logs',
    tool: 'queryAssetHistory()',
    result: 'Repaired 7 months ago; subsoil water erosion flagged',
    confidence: '91%',
    duration: '1.1s',
    angleDeg: 90,
  },
  {
    id: 'operations',
    name: 'OPERATIONS AGENT',
    shortName: 'Operations',
    role: 'Work Order Binding & Resource Allocation',
    icon: Wrench,
    color: '#526777',
    lightBg: '#EEF4F7',
    task: 'Generate official municipal work order',
    tool: 'createWorkOrder()',
    result: 'Work Order WO-2026-1049 bound with asphalt mix specs',
    confidence: '100%',
    duration: '0.5s',
    angleDeg: 126,
  },
  {
    id: 'verification',
    name: 'VERIFICATION AGENT',
    shortName: 'Verification',
    role: 'Post-Repair Photometric Audit',
    icon: ShieldCheck,
    color: '#159A68',
    lightBg: '#E7F7F0',
    task: 'Validate post-repair closure photograph',
    tool: 'auditRepairEvidence()',
    result: 'Resolution confirmed ✓ Surface leveling 98.4%',
    confidence: '97%',
    duration: '1.6s',
    angleDeg: 162,
  },
  {
    id: 'notification',
    name: 'NOTIFICATION AGENT',
    shortName: 'Notification',
    role: 'Citizen & Counselor Telemetry',
    icon: Bell,
    color: '#2878E5',
    lightBg: '#EBF3FD',
    task: 'Dispatch resolution notification to citizen',
    tool: 'sendCitizenAlert()',
    result: 'SMS & WhatsApp alert dispatched with verified evidence link',
    confidence: '100%',
    duration: '0.3s',
    angleDeg: 198,
  },
  {
    id: 'intelligence',
    name: 'INTELLIGENCE AGENT',
    shortName: 'Intelligence',
    role: 'Cross-Ward Clustering & Systemic Hotspot Discovery',
    icon: Sparkles,
    color: '#36B37E',
    lightBg: '#EBF8F2',
    task: 'Detect repeating infrastructure failure patterns',
    tool: 'discoverHotspots()',
    result: 'Zone 04 water main stress pattern correlated with soil shift',
    confidence: '95%',
    duration: '1.2s',
    angleDeg: 234,
  },
];

export function AIAgentOrchestrationSection() {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('vision');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  // Auto cycle active agent every 3.5 seconds unless user manually interacts
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setSelectedAgentId((prev) => {
        const idx = TEN_AGENTS.findIndex((a) => a.id === prev);
        const nextIdx = (idx + 1) % TEN_AGENTS.length;
        return TEN_AGENTS[nextIdx].id;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [autoRotate]);

  const activeAgent = TEN_AGENTS.find((a) => a.id === selectedAgentId) || TEN_AGENTS[0];
  const ActiveIcon = activeAgent.icon;

  const handleAgentClick = (id: string) => {
    setAutoRotate(false);
    setSelectedAgentId(id);
  };

  return (
    <section id="ai-orchestration" className="py-24 sm:py-32 bg-[#F7F8F4] relative overflow-hidden border-t border-[#102A43]/[0.06]">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-[#159A68]/[0.035] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4 mb-16 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E7F7F0] border border-[#159A68]/20 text-[#159A68] text-xs font-bold tracking-wider uppercase font-heading">
            <Cpu className="w-3.5 h-3.5" />
            <span>NEURAL MULTI-AGENT MESH</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#102A43] font-heading tracking-tight leading-[1.12]">
            One orchestrator. <br />
            <span className="text-[#159A68]">Ten specialized agents.</span>
          </h2>

          <p className="text-base sm:text-lg text-[#526777] font-sans leading-relaxed max-w-2xl font-normal">
            No single black box. CivicPulse orchestrates ten dedicated autonomous agents that reason, plan, and verify municipal operations in real time.
          </p>
        </div>

        {/* Orchestration Canvas & Information Panel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left / Center 7 Cols: Radial Mesh Visualization */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#102A43]/[0.08] p-6 sm:p-10 shadow-sm relative overflow-hidden flex items-center justify-center min-h-[480px] sm:min-h-[560px]">
            {/* SVG Connection Lines & Signal Pulses */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 500">
              <defs>
                <linearGradient id="lineGradActive" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#159A68" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#2878E5" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="lineGradInactive" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#102A43" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#102A43" stopOpacity="0.04" />
                </linearGradient>
              </defs>

              {/* Concentric Reference Rings */}
              <circle cx="250" cy="250" r="85" fill="none" stroke="#102A43" strokeOpacity="0.04" strokeDasharray="3 3" />
              <circle cx="250" cy="250" r="175" fill="none" stroke="#102A43" strokeOpacity="0.05" strokeDasharray="4 4" />

              {/* Animated Lines from Center to Each Node */}
              {TEN_AGENTS.map((agent) => {
                const rad = (agent.angleDeg * Math.PI) / 180;
                const nodeX = 250 + 175 * Math.cos(rad);
                const nodeY = 250 + 175 * Math.sin(rad);
                const isActive = agent.id === activeAgent.id;

                return (
                  <g key={agent.id}>
                    <line
                      x1="250"
                      y1="250"
                      x2={nodeX}
                      y2={nodeY}
                      stroke={isActive ? 'url(#lineGradActive)' : 'url(#lineGradInactive)'}
                      strokeWidth={isActive ? '2.5' : '1'}
                      strokeDasharray={isActive ? '6 4' : undefined}
                      className={isActive ? 'animate-[dash_1.5s_linear_infinite]' : ''}
                    />
                    {isActive && (
                      <circle cx={nodeX} cy={nodeY} r="4" fill="#159A68">
                        <animate
                          attributeName="r"
                          values="4;9;4"
                          dur="1.8s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.8;0.2;0.8"
                          dur="1.8s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Central Hub: AI ORCHESTRATOR */}
            <div className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-[#102A43] text-white p-3 flex flex-col items-center justify-center text-center shadow-xl shadow-[#102A43]/20 border-2 border-[#159A68]/40 group transition-transform duration-300 hover:scale-105">
              <div className="w-9 h-9 rounded-2xl bg-[#159A68] flex items-center justify-center text-white mb-1.5 shadow-sm">
                <Cpu className="w-5 h-5 animate-pulse" />
              </div>
              <span className="text-[10px] font-bold tracking-wider font-heading uppercase text-[#36B37E]">
                CENTRAL KERNEL
              </span>
              <span className="text-xs font-extrabold font-heading leading-tight mt-0.5">
                AI Orchestrator
              </span>
            </div>

            {/* 10 Satellite Agent Nodes */}
            <div className="absolute inset-0 pointer-events-none">
              {TEN_AGENTS.map((agent) => {
                const rad = (agent.angleDeg * Math.PI) / 180;
                // Percentage based positioning for responsive sizing
                const leftPercent = 50 + 35 * Math.cos(rad);
                const topPercent = 50 + 35 * Math.sin(rad);
                const isActive = agent.id === activeAgent.id;
                const Icon = agent.icon;

                return (
                  <button
                    key={agent.id}
                    onClick={() => handleAgentClick(agent.id)}
                    style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                    className={`pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl transition-all duration-300 flex items-center gap-2 p-2 sm:p-2.5 ${
                      isActive
                        ? 'bg-white shadow-xl scale-110 border-2 z-20'
                        : 'bg-white/90 hover:bg-white shadow-sm hover:scale-105 border border-[#102A43]/10 z-10'
                    }`}
                    title={agent.name}
                  >
                    <div
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                      style={{
                        backgroundColor: isActive ? agent.color : agent.lightBg,
                        color: isActive ? '#FFFFFF' : agent.color,
                      }}
                    >
                      <Icon className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <span className="hidden sm:inline text-[11px] font-bold font-heading text-[#102A43] pr-1 whitespace-nowrap">
                      {agent.shortName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right 5 Cols: Compact Agent Information Panel */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#102A43]/[0.08] p-6 sm:p-8 shadow-sm text-left space-y-6">
            {/* Active Agent Badge & Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#102A43]/[0.06]">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: activeAgent.color }}
                >
                  <ActiveIcon className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#829AB1] font-heading block">
                    ACTIVE SPECIALIST
                  </span>
                  <h3 className="text-xl font-extrabold text-[#102A43] font-heading">
                    {activeAgent.name}
                  </h3>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-[#829AB1] block">Confidence</span>
                <span className="text-sm font-bold font-mono text-[#159A68]">
                  {activeAgent.confidence}
                </span>
              </div>
            </div>

            {/* Agent Role & Latency */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#526777] font-sans">
                {activeAgent.role}
              </span>
              <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-[#829AB1]">
                <span>Inference Latency: <strong className="text-[#102A43]">{activeAgent.duration}</strong></span>
                <span>•</span>
                <span>Telemetry: <strong className="text-[#159A68]">ONLINE</strong></span>
              </div>
            </div>

            {/* Tool Execution Signature */}
            <div className="bg-[#FAF8F5] border border-[#102A43]/[0.06] rounded-2xl p-4 space-y-1.5 font-mono text-xs">
              <span className="text-[10px] text-[#829AB1] uppercase font-bold tracking-wider block">
                Primary Tool Invocation
              </span>
              <div className="text-[#2878E5] font-semibold">
                {activeAgent.tool}
              </div>
            </div>

            {/* Concrete Decision Output */}
            <div className="bg-[#FAF8F5] border border-[#102A43]/[0.06] rounded-2xl p-4 space-y-1.5 text-xs">
              <span className="text-[10px] text-[#829AB1] uppercase font-bold tracking-wider font-mono block">
                Model Reasoning & Output
              </span>
              <p className="text-xs sm:text-sm font-semibold text-[#102A43] font-sans leading-relaxed">
                "{activeAgent.result}"
              </p>
            </div>

            {/* Agent Switcher Quick Bar */}
            <div className="pt-2">
              <span className="text-[10px] font-mono text-[#829AB1] uppercase tracking-wider block mb-2">
                All 10 Specialized Agents:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {TEN_AGENTS.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => handleAgentClick(agent.id)}
                    className={`px-2.5 py-1 rounded-full text-[10.5px] font-semibold font-heading transition-all ${
                      agent.id === activeAgent.id
                        ? 'bg-[#102A43] text-white shadow-xs'
                        : 'bg-[#FAF8F5] text-[#526777] hover:bg-[#EEF4F7] border border-[#102A43]/[0.06]'
                    }`}
                  >
                    {agent.shortName}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AIAgentOrchestrationSection;
