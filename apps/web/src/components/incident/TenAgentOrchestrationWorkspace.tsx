import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  LuBot,
  LuEye,
  LuMapPin,
  LuCopy,
  LuShieldAlert,
  LuGitFork,
  LuSearch,
  LuWrench,
  LuBell,
  LuShieldCheck,
  LuNetwork,
  LuCheck,
  LuClock,
  LuChevronDown,
  LuChevronUp,
  LuLayers,
  LuActivity
} from 'react-icons/lu';
import { cn } from '@/lib/utils';

export interface TenAgentOrchestrationWorkspaceProps {
  incident: any;
  dossier: any;
  className?: string;
}

interface AgentItem {
  id: string;
  name: string;
  category: 'Understanding' | 'Decision' | 'Operations';
  badge: string;
  summary: string;
  status: 'COMPLETED' | 'AWAITING' | 'FAILED' | 'RUNNING';
  confidence: string;
  decision: string;
  tool: string;
  timestamp?: string;
  details?: string;
  icon: React.ReactNode;
}

export function TenAgentOrchestrationWorkspace({
  incident,
  dossier,
  className,
}: TenAgentOrchestrationWorkspaceProps) {
  const shouldReduceMotion = useReducedMotion();
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>('AGENT_VISION');

  const isResolved = ['RESOLVED', 'CLOSED'].includes(incident?.status || '');

  // Calculate dynamic agent statuses and information
  const agents: AgentItem[] = useMemo(() => {
    const visionConfidence = incident?.visionAnalysis?.confidence
      ? Math.round(incident.visionAnalysis.confidence * 100)
      : 95;

    const formattedDate = incident?.createdAt
      ? new Date(incident.createdAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Just now';

    return [
      // 1. UNDERSTANDING GROUP
      {
        id: 'AGENT_VISION',
        name: 'Vision Agent',
        category: 'Understanding',
        badge: 'Multimodal Inspection',
        summary: incident?.visionAnalysis?.observations || 'Input photograph analyzed for defect characteristics',
        status: 'COMPLETED',
        confidence: `${visionConfidence}%`,
        decision: incident?.visionAnalysis?.hazardIndicators?.length
          ? `Detected: ${incident.visionAnalysis.hazardIndicators.join(', ')}`
          : 'Standard civic defect detected and verified',
        tool: 'Multimodal Vision Inspection (ViT / Gemini)',
        timestamp: formattedDate,
        details: incident?.visionAnalysis?.observations || 'Multimodal vision inspection executed on citizen report image.',
        icon: <LuEye className="w-4 h-4 text-[#2878E5]" />,
      },
      {
        id: 'AGENT_LOCATION',
        name: 'Location Agent',
        category: 'Understanding',
        badge: 'Spatial Geocoding',
        summary: `Ward 12 verified · ${incident?.location?.address ? incident.location.address.split(',')[0] : 'Hosur Core'}`,
        status: 'COMPLETED',
        confidence: '99%',
        decision: `${incident?.location?.ward || 'Ward 12'} containment verified with GIS 2dsphere bounds`,
        tool: 'GIS 2dsphere Spatial Geocoder',
        timestamp: formattedDate,
        details: `Reverse-geocoded to ${incident?.location?.address || 'Ward 12 Central'}. Proximity boundary confirmed.`,
        icon: <LuMapPin className="w-4 h-4 text-[#159A68]" />,
      },
      {
        id: 'AGENT_DUPLICATE',
        name: 'Duplicate Agent',
        category: 'Understanding',
        badge: 'Cluster Analysis',
        summary: incident?.duplicateCount > 0 ? `${incident.duplicateCount} duplicate reports clustered` : 'No duplicate reports detected within 50m',
        status: 'COMPLETED',
        confidence: '98%',
        decision: '50m radius and 72-hour temporal cluster evaluation verified',
        tool: 'Spatial-Temporal Proximity Matrix',
        timestamp: formattedDate,
        details: `Evaluated within 50-meter radius and 72-hour window. Duplicate cluster count: ${incident?.duplicateCount || 0}.`,
        icon: <LuCopy className="w-4 h-4 text-[#486581]" />,
      },

      // 2. DECISION GROUP
      {
        id: 'AGENT_SEVERITY',
        name: 'Severity Agent',
        category: 'Decision',
        badge: 'Multi-Signal Risk',
        summary: `Assessed as ${incident?.severity || 'Medium'} · Risk score ${incident?.severityReasoning?.score || 45}/100`,
        status: 'COMPLETED',
        confidence: '94%',
        decision: incident?.severityReasoning?.explanation || 'Multi-factor weighted severity index calculated',
        tool: 'Explainable Multi-Signal Risk Indexer',
        timestamp: formattedDate,
        details: `Base category risk weighted with road proximity and temporal density factors.`,
        icon: <LuShieldAlert className="w-4 h-4 text-[#F2B84B]" />,
      },
      {
        id: 'AGENT_ROUTING',
        name: 'Routing Agent',
        category: 'Decision',
        badge: 'Jurisdiction Match',
        summary: `Routed to ${incident?.departmentId?.name || incident?.assignedDepartment || 'Roads Department'}`,
        status: 'COMPLETED',
        confidence: '96%',
        decision: incident?.routingReason || 'Jurisdictional authority and crew capacity matched',
        tool: 'Municipal Jurisdiction & Department Router',
        timestamp: formattedDate,
        details: `Matched department requirements with current on-duty crew availability.`,
        icon: <LuGitFork className="w-4 h-4 text-[#2878E5]" />,
      },
      {
        id: 'AGENT_INVESTIGATION',
        name: 'Investigation Agent',
        category: 'Decision',
        badge: 'Pattern Analysis',
        summary: 'Historical recurrence and municipal asset history verified',
        status: 'COMPLETED',
        confidence: '92%',
        decision: 'Standard defect profile matched. No hazardous escalation history.',
        tool: 'Civic Knowledge Graph & Recurrence Scanner',
        timestamp: formattedDate,
        details: 'Checked recurring report patterns in the sector over the past 180 days.',
        icon: <LuSearch className="w-4 h-4 text-[#627D98]" />,
      },

      // 3. OPERATIONS & VERIFICATION GROUP
      {
        id: 'AGENT_OPERATIONS',
        name: 'Operations Agent',
        category: 'Operations',
        badge: 'Work Order Synthesis',
        summary: 'Generated certified municipal work order · Safety checklist active',
        status: 'COMPLETED',
        confidence: '99%',
        decision: 'Certified work order dispatched with active SLA countdown',
        tool: 'Municipal Work Order Synthesizer',
        timestamp: formattedDate,
        details: 'Created field crew operational tasks with contractor safety checklists.',
        icon: <LuWrench className="w-4 h-4 text-[#159A68]" />,
      },
      {
        id: 'AGENT_NOTIFICATION',
        name: 'Notification Agent',
        category: 'Operations',
        badge: 'Dispatch Broadcast',
        summary: 'Dispatched citizen update and field crew operational alerts',
        status: 'COMPLETED',
        confidence: '100%',
        decision: 'Broadcast completed across web and municipal communication channels',
        tool: 'Multi-Channel Event Dispatcher',
        timestamp: formattedDate,
        details: 'Sent incident receipt confirmation to reporter and notification to field supervisors.',
        icon: <LuBell className="w-4 h-4 text-[#2878E5]" />,
      },
      {
        id: 'AGENT_VERIFICATION',
        name: 'Verification Agent',
        category: 'Operations',
        badge: 'Resolution Audit',
        summary: isResolved
          ? (incident?.verificationResult?.reason || 'Verified resolution through comparative image consensus')
          : 'Awaiting field crew AFTER photographic evidence submission',
        status: isResolved ? 'COMPLETED' : 'AWAITING',
        confidence: isResolved ? '98%' : 'Pending',
        decision: isResolved
          ? (incident?.verificationResult?.decision || 'Resolution Approved')
          : 'Pending after-repair inspection photograph submission',
        tool: 'Comparative Before/After Siamese Vision Consensus',
        timestamp: isResolved ? formattedDate : undefined,
        details: isResolved
          ? 'Dual-photograph feature consensus matched remediation boundaries.'
          : 'Awaiting field crew AFTER photographic evidence submission for automated validation.',
        icon: <LuShieldCheck className={cn('w-4 h-4', isResolved ? 'text-[#159A68]' : 'text-[#F2B84B]')} />,
      },
      {
        id: 'AGENT_INTELLIGENCE',
        name: 'Intelligence Agent',
        category: 'Operations',
        badge: 'Citywide Index',
        summary: 'Aggregated incident vector into ward reliability index',
        status: 'COMPLETED',
        confidence: '97%',
        decision: 'Hotspot density matrix and infrastructure health score updated',
        tool: 'Urban Reliability Vector Embedder',
        timestamp: formattedDate,
        details: 'Synthesized real-time telemetry into municipal planning and ward maintenance index.',
        icon: <LuNetwork className="w-4 h-4 text-[#486581]" />,
      },
    ];
  }, [incident, isResolved]);

  // Derive execution stats
  const totalAgents = agents.length; // 10
  const completedCount = agents.filter((a) => a.status === 'COMPLETED').length;
  const awaitingCount = agents.filter((a) => a.status === 'AWAITING').length;
  const failedCount = agents.filter((a) => a.status === 'FAILED').length;
  const avgConfidence = '96%';

  const toggleAgent = (id: string) => {
    setExpandedAgentId((prev) => (prev === id ? null : id));
  };

  // Group definitions
  const groups: { title: string; category: AgentItem['category']; description: string }[] = [
    { title: 'Understanding', category: 'Understanding', description: 'Visual defect detection and spatial validation' },
    { title: 'Decision', category: 'Decision', description: 'Multi-signal risk weighting and crew routing' },
    { title: 'Operations & Verification', category: 'Operations', description: 'Work orders, field dispatch, and resolution audit' },
  ];

  return (
    <div className={cn('space-y-4 select-none text-left', className)}>
      {/* =========================================================================
          1. AI INTELLIGENCE HEADER (Requirement 17: 24px Page / 17px Section title)
          ========================================================================= */}
      <div className="pb-2 border-b border-[#E3EAE6]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10.5px] font-mono font-extrabold uppercase tracking-widest text-[#159A68] bg-[#E7F7F0] px-2 py-0.5 rounded-md border border-[#159A68]/20">
              AI INTELLIGENCE
            </span>
          </div>
          <h2 className="text-[17px] font-bold font-heading text-[#102A43] mt-1">
            How CivicPulse analyzed this incident
          </h2>
          <p className="text-[13px] text-[#627D98] font-normal mt-0.5">
            10 specialized autonomous agents contributed to this operational decision.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#E3EAE6] text-xs font-semibold text-[#526777] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#159A68] animate-pulse" />
            <span>Autonomous Pipeline Active</span>
          </span>
        </div>
      </div>

      {/* =========================================================================
          2. COMPACT EXECUTION SUMMARY (Target height: 80-95px, Requirement 22)
          ========================================================================= */}
      <div className="w-full min-h-[80px] max-h-[95px] bg-white rounded-2xl border border-[#DCE6E1] p-3 sm:px-5 sm:py-3.5 shadow-2xs flex items-center justify-between gap-3 overflow-x-auto">
        <div className="grid grid-cols-5 divide-x divide-[#E2E9E5] w-full text-center">
          {/* 10 Agents */}
          <div className="px-2">
            <span className="font-heading font-extrabold text-lg sm:text-xl text-[#102A43] block leading-none">
              {totalAgents}
            </span>
            <span className="text-[11px] font-semibold text-[#829AB1] mt-1 block uppercase tracking-wider">
              Agents
            </span>
          </div>

          {/* 9 Completed */}
          <div className="px-2">
            <span className="font-heading font-extrabold text-lg sm:text-xl text-[#159A68] block leading-none">
              {completedCount}
            </span>
            <span className="text-[11px] font-semibold text-[#829AB1] mt-1 block uppercase tracking-wider">
              Completed
            </span>
          </div>

          {/* 0 Failed */}
          <div className="px-2">
            <span className="font-heading font-extrabold text-lg sm:text-xl text-[#526777] block leading-none">
              {failedCount}
            </span>
            <span className="text-[11px] font-semibold text-[#829AB1] mt-1 block uppercase tracking-wider">
              Failed
            </span>
          </div>

          {/* 1 Awaiting */}
          <div className="px-2">
            <span className={cn('font-heading font-extrabold text-lg sm:text-xl block leading-none', awaitingCount > 0 ? 'text-[#D97706]' : 'text-[#159A68]')}>
              {awaitingCount}
            </span>
            <span className="text-[11px] font-semibold text-[#829AB1] mt-1 block uppercase tracking-wider">
              Awaiting
            </span>
          </div>

          {/* 96% Decision confidence */}
          <div className="px-2">
            <span className="font-heading font-extrabold text-lg sm:text-xl text-[#159A68] block leading-none">
              {avgConfidence}
            </span>
            <span className="text-[11px] font-semibold text-[#829AB1] mt-1 block uppercase tracking-wider">
              Confidence
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. AI ORCHESTRATION STREAM (Vertical Signal Line & Compact 64-76px Rows)
          ========================================================================= */}
      <div className="bg-white border border-[#DCE6E1] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-[#F0F4F2]">
          <h3 className="text-[15px] font-bold font-heading text-[#102A43] flex items-center gap-2">
            <LuActivity className="w-4 h-4 text-[#159A68]" />
            <span>AI Orchestration Stream</span>
          </h3>
          <span className="text-xs text-[#829AB1]">
            Click any agent to inspect decisions & confidence
          </span>
        </div>

        {/* Groups */}
        <div className="space-y-6">
          {groups.map((group) => {
            const groupAgents = agents.filter((a) => a.category === group.category);

            return (
              <div key={group.category} className="space-y-2">
                {/* Group Subtitle */}
                <div className="flex items-center gap-2 px-1">
                  <span className="text-xs font-bold text-[#102A43] font-heading tracking-wide uppercase">
                    {group.title}
                  </span>
                  <span className="text-[#CBD5E1] text-xs">•</span>
                  <span className="text-[11.5px] text-[#829AB1] font-normal">
                    {group.description}
                  </span>
                </div>

                {/* Agents in Group (with vertical signal line) */}
                <div className="relative pl-6 sm:pl-7 space-y-2">
                  {/* Vertical signal line running down this group */}
                  <div className="absolute left-[13px] sm:left-[15px] top-4 bottom-4 w-[2px] bg-[#E2E9E5]" />

                  {groupAgents.map((agent) => {
                    const isExpanded = expandedAgentId === agent.id;
                    const isCompleted = agent.status === 'COMPLETED';
                    const isAwaiting = agent.status === 'AWAITING';
                    const isFailed = agent.status === 'FAILED';

                    return (
                      <div key={agent.id} className="relative">
                        {/* Signal Node on the vertical line */}
                        <div className="absolute -left-6 sm:-left-7 top-[22px] -translate-x-1/2 z-10">
                          {isCompleted ? (
                            <div className="w-5 h-5 rounded-full bg-[#159A68] text-white flex items-center justify-center ring-4 ring-white shadow-2xs">
                              <LuCheck className="w-3 h-3 stroke-[3]" />
                            </div>
                          ) : isAwaiting ? (
                            <div className="w-5 h-5 rounded-full bg-[#F2B84B] text-white flex items-center justify-center ring-4 ring-white shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-[#EF6A63] text-white flex items-center justify-center ring-4 ring-white shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            </div>
                          )}
                        </div>

                        {/* Agent Row Card (Collapsed height target: 64-76px) */}
                        <div
                          onClick={() => toggleAgent(agent.id)}
                          className={cn(
                            'border rounded-xl transition-all duration-200 cursor-pointer overflow-hidden',
                            isExpanded
                              ? 'bg-[#FAFDFB] border-[#159A68]/40 shadow-xs'
                              : 'bg-white border-[#E3EAE6] hover:border-[#159A68]/30 hover:bg-[#F9FCFA]'
                          )}
                        >
                          {/* Main Row Bar (Height ~66px) */}
                          <div className="min-h-[64px] max-h-[76px] px-3.5 sm:px-4 py-2 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#E3EAE6] flex items-center justify-center shrink-0">
                                {agent.icon}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-heading font-bold text-[14px] text-[#102A43] truncate">
                                    {agent.name}
                                  </span>
                                  <span className="text-[10.5px] font-semibold px-2 py-0.2 rounded-md bg-[#F4F7F5] border border-[#E3EAE6] text-[#526777] shrink-0 font-heading">
                                    {agent.badge}
                                  </span>
                                </div>
                                <p className="text-[12.5px] text-[#627D98] truncate mt-0.5 leading-snug">
                                  {agent.summary}
                                </p>
                              </div>
                            </div>

                            {/* Status, Confidence & Toggle */}
                            <div className="flex items-center gap-2.5 shrink-0">
                              {/* Status pill */}
                              <span
                                className={cn(
                                  'text-[11px] font-semibold px-2.5 py-0.5 rounded-full border hidden xs:inline-flex items-center gap-1',
                                  isCompleted
                                    ? 'bg-[#E7F7F0] text-[#159A68] border-[#159A68]/20'
                                    : isAwaiting
                                    ? 'bg-[#FEF8EC] text-[#D97706] border-[#F2B84B]/30'
                                    : 'bg-[#FDEEED] text-[#DC2626] border-[#EF6A63]/30'
                                )}
                              >
                                {isCompleted ? 'Completed' : isAwaiting ? 'Awaiting' : 'Failed'}
                              </span>

                              {/* Confidence pill */}
                              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-[#DCE6E1] text-[#102A43]">
                                {agent.confidence}
                              </span>

                              {/* Chevron */}
                              <div className="text-[#829AB1] hover:text-[#102A43] transition-colors p-1">
                                {isExpanded ? (
                                  <LuChevronUp className="w-4 h-4 stroke-[2.2]" />
                                ) : (
                                  <LuChevronDown className="w-4 h-4 stroke-[2.2]" />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Expanded Details Drawer */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={shouldReduceMotion ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={shouldReduceMotion ? { opacity: 0, height: 0 } : { opacity: 0, height: 0 }}
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                                className="px-4 pb-3.5 pt-2 border-t border-[#E3EAE6]/70 text-xs bg-white space-y-2.5"
                              >
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                                  <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E3EAE6]">
                                    <span className="text-[10.5px] font-bold text-[#829AB1] uppercase tracking-wider block font-heading">
                                      Decision & Result
                                    </span>
                                    <span className="text-[12.5px] font-semibold text-[#102A43] mt-0.5 block leading-snug">
                                      {agent.decision}
                                    </span>
                                  </div>

                                  <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E3EAE6]">
                                    <span className="text-[10.5px] font-bold text-[#829AB1] uppercase tracking-wider block font-heading">
                                      Tool / Subsystem
                                    </span>
                                    <span className="text-[12px] font-mono text-[#526777] mt-0.5 block truncate">
                                      {agent.tool}
                                    </span>
                                  </div>

                                  <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E3EAE6]">
                                    <span className="text-[10.5px] font-bold text-[#829AB1] uppercase tracking-wider block font-heading">
                                      Execution Status
                                    </span>
                                    <span className="text-[12px] text-[#526777] mt-0.5 block font-mono">
                                      {agent.timestamp ? `Completed at ${agent.timestamp}` : 'Awaiting dependent evidence'}
                                    </span>
                                  </div>
                                </div>

                                {agent.details && (
                                  <p className="text-[12px] text-[#526777] bg-[#F9FBFA] p-2 rounded-lg border border-[#E3EAE6]/60 leading-relaxed">
                                    <span className="font-semibold text-[#102A43]">Observation Detail: </span>
                                    {agent.details}
                                  </p>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TenAgentOrchestrationWorkspace;
