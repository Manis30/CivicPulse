import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  LuBrainCircuit,
  LuEye,
  LuMapPin,
  LuShieldAlert,
  LuSend,
  LuSparkles,
  LuArrowUpRight,
  LuCheck,
} from 'react-icons/lu';
import { cn } from '@/lib/utils';

export type IntakeStage =
  | 'IDLE'
  | 'SIGNAL_RECEIVED'
  | 'VISION_ACTIVE'
  | 'LOCATION_ACTIVE'
  | 'SEVERITY_ACTIVE'
  | 'ROUTING_ACTIVE'
  | 'READY';

interface CivicIntakeVisualizationProps {
  selectedCategory?: string;
  categoryLabel?: string;
  intakeStage?: IntakeStage;
  intakeRef?: React.RefObject<HTMLDivElement | null>;
}

export function CivicIntakeVisualization({
  selectedCategory,
  categoryLabel,
  intakeStage = 'IDLE',
  intakeRef,
}: CivicIntakeVisualizationProps) {
  const isSelected = Boolean(selectedCategory);
  const shouldReduceMotion = useReducedMotion();

  // Mouse Parallax State
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Derive dynamic status copy from intakeStage
  const statusCopy = useMemo(() => {
    if (!isSelected || intakeStage === 'IDLE') {
      return { text: 'Waiting for your first signal', color: 'text-[#829AB1]', orb: 'IDLE' };
    }
    if (intakeStage === 'SIGNAL_RECEIVED') {
      return { text: 'Signal received', color: 'text-[#159A68]', orb: 'ACTIVE' };
    }
    if (intakeStage === 'VISION_ACTIVE' || intakeStage === 'LOCATION_ACTIVE') {
      return { text: 'Building intake context', color: 'text-[#159A68]', orb: 'ACTIVE' };
    }
    if (intakeStage === 'SEVERITY_ACTIVE' || intakeStage === 'ROUTING_ACTIVE') {
      return { text: 'Initial routing prepared', color: 'text-[#159A68]', orb: 'ACTIVE' };
    }
    return { text: 'Ready for evidence', color: 'text-[#0B3D2E]', orb: 'READY' };
  }, [isSelected, intakeStage]);

  // Stage checks for sequential multi-agent illumination
  const isVisionComplete = ['LOCATION_ACTIVE', 'SEVERITY_ACTIVE', 'ROUTING_ACTIVE', 'READY'].includes(intakeStage);
  const isVisionActive = intakeStage === 'VISION_ACTIVE';

  const isLocationComplete = ['SEVERITY_ACTIVE', 'ROUTING_ACTIVE', 'READY'].includes(intakeStage);
  const isLocationActive = intakeStage === 'LOCATION_ACTIVE';

  const isSeverityComplete = ['ROUTING_ACTIVE', 'READY'].includes(intakeStage);
  const isSeverityActive = intakeStage === 'SEVERITY_ACTIVE';

  const isRoutingComplete = intakeStage === 'READY';
  const isRoutingActive = intakeStage === 'ROUTING_ACTIVE';

  // Agent nodes definition
  const nodes = useMemo(
    () => [
      {
        id: 'vision',
        name: 'VISION',
        role: 'Photo Analysis',
        icon: <LuEye className="w-3.5 h-3.5" />,
        cx: 44,
        isActive: isVisionActive,
        isComplete: isVisionComplete,
      },
      {
        id: 'location',
        name: 'LOCATION',
        role: 'GIS & Ward',
        icon: <LuMapPin className="w-3.5 h-3.5" />,
        cx: 128,
        isActive: isLocationActive,
        isComplete: isLocationComplete,
      },
      {
        id: 'severity',
        name: 'SEVERITY',
        role: 'Multi-factor',
        icon: <LuShieldAlert className="w-3.5 h-3.5" />,
        cx: 212,
        isActive: isSeverityActive,
        isComplete: isSeverityComplete,
      },
      {
        id: 'routing',
        name: 'ROUTING',
        role: 'Field Dispatch',
        icon: <LuSend className="w-3.5 h-3.5" />,
        cx: 296,
        isActive: isRoutingActive,
        isComplete: isRoutingComplete,
      },
    ],
    [
      isVisionActive,
      isVisionComplete,
      isLocationActive,
      isLocationComplete,
      isSeverityActive,
      isSeverityComplete,
      isRoutingActive,
      isRoutingComplete,
    ]
  );

  return (
    <div
      ref={(el) => {
        containerRef.current = el;
        if (intakeRef) (intakeRef as any).current = el;
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-2xl bg-white border border-[#E3EAE6] p-4 shadow-[0_4px_24px_rgba(15,40,30,0.04)] overflow-hidden select-none"
    >
      {/* 1. CINEMATIC BACKGROUND: Abstract Living City Silhouette & Animated Road Grid */}
      <motion.div
        animate={
          shouldReduceMotion
            ? {}
            : {
                x: mousePos.x * 6,
                y: mousePos.y * 3,
              }
        }
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        className="absolute inset-0 pointer-events-none overflow-hidden flex items-end justify-center opacity-[0.08]"
      >
        <svg
          viewBox="0 0 400 130"
          className="w-full h-32 text-[#102A43]"
          fill="currentColor"
          preserveAspectRatio="none"
        >
          {/* Skyline Building Silhouettes */}
          <rect x="8" y="75" width="24" height="55" rx="2" />
          <rect x="36" y="58" width="20" height="72" rx="2" />
          <rect x="60" y="42" width="26" height="88" rx="2" />
          <rect x="90" y="65" width="18" height="65" rx="2" />
          <rect x="112" y="50" width="30" height="80" rx="2" />
          <rect x="146" y="68" width="22" height="62" rx="2" />
          <rect x="172" y="38" width="28" height="92" rx="2" />
          <rect x="204" y="54" width="24" height="76" rx="2" />
          <rect x="232" y="66" width="20" height="64" rx="2" />
          <rect x="256" y="44" width="28" height="86" rx="2" />
          <rect x="288" y="60" width="22" height="70" rx="2" />
          <rect x="314" y="34" width="32" height="96" rx="2" />
          <rect x="350" y="56" width="24" height="74" rx="2" />
          <rect x="378" y="70" width="20" height="60" rx="2" />

          {/* Tiny glowing window silhouettes */}
          <rect x="66" y="52" width="3" height="4" fill="#36B37E" opacity="0.6" />
          <rect x="74" y="52" width="3" height="4" fill="#36B37E" opacity="0.6" />
          <rect x="180" y="48" width="3" height="4" fill="#36B37E" opacity="0.6" />
          <rect x="188" y="48" width="3" height="4" fill="#36B37E" opacity="0.6" />
          <rect x="322" y="46" width="3" height="4" fill="#36B37E" opacity="0.6" />
          <rect x="330" y="46" width="3" height="4" fill="#36B37E" opacity="0.6" />

          {/* Road Baseline */}
          <line x1="0" y1="128" x2="400" y2="128" stroke="currentColor" strokeWidth="2" />
        </svg>
      </motion.div>

      {/* 2. Top Header Row: Branded Title + Status Orb + Dynamic Copy */}
      <div className="flex items-center justify-between relative z-10 pb-2.5 border-b border-[#E3EAE6]/70">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-[#E7F7F0] text-[#159A68] flex items-center justify-center shadow-2xs">
            <LuSparkles className="w-3 h-3" />
          </div>
          <span className="font-heading font-extrabold text-[11px] tracking-wider uppercase text-[#102A43]">
            CIVICPULSE INTAKE
          </span>
        </div>

        {/* Status Orb + Status Copy */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            {statusCopy.orb === 'IDLE' && (
              <motion.span
                animate={shouldReduceMotion ? {} : { scale: [1, 1.25, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-2.5 h-2.5 rounded-full bg-[#94A3B8]"
              />
            )}
            {statusCopy.orb === 'ACTIVE' && (
              <>
                <motion.span
                  animate={shouldReduceMotion ? {} : { scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute w-3 h-3 rounded-full bg-[#159A68]/40"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-[#159A68] shadow-[0_0_8px_#159A68]" />
              </>
            )}
            {statusCopy.orb === 'READY' && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#159A68] ring-2 ring-[#E7F7F0] shadow-xs" />
            )}
          </div>

          <span className={cn('text-[11px] font-heading font-semibold transition-colors', statusCopy.color)}>
            {statusCopy.text}
          </span>
        </div>
      </div>

      {/* 3. Interactive Intelligent Workflow Visualization */}
      <motion.div
        animate={
          shouldReduceMotion
            ? {}
            : {
                x: -mousePos.x * 3,
                y: -mousePos.y * 1.5,
              }
        }
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        className="relative z-10 pt-3 pb-1"
      >
        <div className="flex flex-col items-center">
          {/* Central Orchestrator Node with Concentric Pulsing Rings */}
          <div className="relative mb-1 flex items-center justify-center">
            {/* Concentric Expanding SVG Rings on Activation */}
            {isSelected && !shouldReduceMotion && (
              <svg className="absolute w-28 h-28 pointer-events-none -z-0 overflow-visible" viewBox="0 0 112 112">
                <motion.circle
                  cx="56"
                  cy="56"
                  r="26"
                  fill="none"
                  stroke="#159A68"
                  strokeWidth="1.2"
                  strokeOpacity="0.4"
                  style={{ transformOrigin: '56px 56px' }}
                  animate={{ scale: [0.85, 1.45], opacity: [0.6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                />
                <motion.circle
                  cx="56"
                  cy="56"
                  r="22"
                  fill="none"
                  stroke="#36B37E"
                  strokeWidth="1"
                  strokeOpacity="0.5"
                  style={{ transformOrigin: '56px 56px' }}
                  animate={{ scale: [0.85, 1.35], opacity: [0.7, 0] }}
                  transition={{ duration: 2, delay: 0.6, repeat: Infinity, ease: 'easeOut' }}
                />
              </svg>
            )}

            {/* Central Node Badge */}
            <motion.div
              animate={
                isSelected && !shouldReduceMotion
                  ? { scale: [1, 1.03, 1] }
                  : { scale: [1, 1.015, 1] }
              }
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className={cn(
                'relative z-10 px-3.5 py-1.5 rounded-full border text-xs font-heading font-bold flex items-center gap-2 transition-all shadow-xs select-none',
                isSelected
                  ? 'bg-[#159A68] text-white border-[#159A68] ring-4 ring-[#E7F7F0] shadow-md shadow-[#159A68]/20'
                  : 'bg-[#FAF8F5] text-[#526777] border-[#E3EAE6]'
              )}
            >
              <LuBrainCircuit
                className={cn('w-4 h-4', isSelected ? 'text-white' : 'text-[#829AB1]')}
              />
              <span className="truncate max-w-[190px]">
                {isSelected ? categoryLabel || 'Report Signal' : 'CivicPulse Orchestrator'}
              </span>
            </motion.div>
          </div>

          {/* Animated Connecting Pathways */}
          <div className="w-full max-w-[340px] h-9 relative">
            <svg viewBox="0 0 340 36" className="w-full h-full overflow-visible">
              {nodes.map((target, idx) => (
                <g key={target.id}>
                  {/* Base Connecting Arc */}
                  <path
                    d={`M 170 0 C 170 18, ${target.cx} 10, ${target.cx} 36`}
                    fill="none"
                    stroke={target.isComplete || target.isActive ? '#159A68' : isSelected ? '#C8E8D9' : '#E3EAE6'}
                    strokeWidth={target.isComplete || target.isActive ? '2' : '1.5'}
                    strokeDasharray={isSelected ? 'none' : '3 3'}
                    className="transition-colors duration-300"
                  />

                  {/* Traveling Signal Pulse Particle Along Active Path */}
                  {(target.isActive || target.isComplete) && !shouldReduceMotion && (
                    <motion.circle
                      cx={170}
                      cy={0}
                      r="2.5"
                      fill="#159A68"
                      animate={{
                        cx: [170, (170 + target.cx) / 2, target.cx],
                        cy: [0, 18, 36],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 1.4,
                        repeat: Infinity,
                        delay: idx * 0.18,
                        ease: 'easeInOut',
                      }}
                    />
                  )}
                </g>
              ))}
            </svg>
          </div>

          {/* 4 Multi-Agent Downstream Nodes */}
          <div className="grid grid-cols-4 gap-2 w-full max-w-[340px] text-center pt-0.5">
            {nodes.map((node) => {
              return (
                <motion.div
                  key={node.id}
                  animate={{
                    scale: node.isActive ? 1.05 : 1,
                    y: isSelected ? 0 : 2,
                    opacity: isSelected ? 1 : 0.5,
                  }}
                  transition={{ duration: 0.25 }}
                  className={cn(
                    'p-1.5 sm:p-2 rounded-xl border flex flex-col items-center justify-center transition-all relative overflow-hidden',
                    node.isComplete
                      ? 'bg-white border-[#159A68]/40 shadow-xs ring-1 ring-[#159A68]/20'
                      : node.isActive
                      ? 'bg-[#E7F7F0]/60 border-[#159A68] shadow-xs'
                      : 'bg-[#FAF8F5]/60 border-[#E3EAE6]'
                  )}
                >
                  {/* Status Indicator Icon (Check if complete) */}
                  <div
                    className={cn(
                      'w-6 h-6 rounded-lg flex items-center justify-center mb-1 transition-all',
                      node.isComplete
                        ? 'bg-[#159A68] text-white shadow-2xs'
                        : node.isActive
                        ? 'bg-[#E7F7F0] text-[#159A68] animate-pulse'
                        : 'bg-slate-100 text-[#829AB1]'
                    )}
                  >
                    {node.isComplete ? <LuCheck className="w-3.5 h-3.5 stroke-[3]" /> : node.icon}
                  </div>

                  <span className="font-heading font-extrabold text-[10px] text-[#102A43] truncate w-full tracking-tight">
                    {node.name}
                  </span>
                  <span className="text-[8.5px] text-[#829AB1] truncate w-full hidden sm:block">
                    {node.role}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* 4. Bottom Microcopy Banner */}
      <div className="mt-2.5 pt-2 border-t border-[#E3EAE6]/60 flex items-center justify-between text-[9.5px] text-[#829AB1]">
        <span>Intake Workflow Preview</span>
        <span className="text-[#159A68] font-medium flex items-center gap-1">
          <span>Autonomous dispatch activates on submit</span>
          <LuArrowUpRight className="w-2.5 h-2.5" />
        </span>
      </div>
    </div>
  );
}

export default CivicIntakeVisualization;
