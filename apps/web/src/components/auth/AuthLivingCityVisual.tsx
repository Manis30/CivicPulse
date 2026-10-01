import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Activity, ArrowRight, ShieldCheck, Cpu, Radio, CheckCircle2 } from 'lucide-react';
import { CityGround, CityRoads } from '@/components/three/CityGround';
import { CityBuildings } from '@/components/three/CityBuildings';
import { IncidentMarker } from '@/components/three/IncidentMarker';
import { Incident } from '@civicpulse/shared';

// Calm, slow ambient camera orbit
function AmbientCityCamera() {
  const angleRef = useRef(0.85);

  useFrame((_, delta) => {
    // Extremely slow, calm drift (roughly 1 rotation every ~120s)
    angleRef.current += delta * 0.04;
    const radius = 72;
    const x = Math.sin(angleRef.current) * radius;
    const z = Math.cos(angleRef.current) * radius;
    _.camera.position.set(x, 48, z);
    _.camera.lookAt(0, 4, 0);
  });

  return null;
}

// Sample incident nodes representing active city pulse
const CITY_INCIDENTS: Array<{ incident: Incident; pos: [number, number, number] }> = [
  {
    incident: {
      id: 'INC-2026-1048',
      category: 'WATER_LEAK',
      severity: 'LOW',
    } as Incident,
    pos: [18, 0, -18],
  },
  {
    incident: {
      id: 'INC-2026-1049',
      category: 'POTHOLE',
      severity: 'MEDIUM',
    } as Incident,
    pos: [-20, 0, -14],
  },
  {
    incident: {
      id: 'INC-2026-1050',
      category: 'GARBAGE',
      severity: 'HIGH',
    } as Incident,
    pos: [14, 0, 22],
  },
  {
    incident: {
      id: 'INC-2026-1051',
      category: 'STREETLIGHT',
      severity: 'LOW',
    } as Incident,
    pos: [-28, 0, 30],
  },
  {
    incident: {
      id: 'INC-2026-1052',
      category: 'DRAINAGE',
      severity: 'CRITICAL',
    } as Incident,
    pos: [26, 0, 8],
  },
];

export function AuthLivingCityVisual() {
  return (
    <div className="relative w-full h-full min-h-[500px] lg:min-h-full bg-[#EEF2F6] overflow-hidden select-none flex flex-col justify-between p-6 lg:p-10 border-r border-[#D9E2EC]/70">
      {/* 3D Living City Digital Twin Background Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}>
          <PerspectiveCamera makeDefault position={[50, 48, 55]} fov={36} />
          <AmbientCityCamera />

          {/* Clean Daylight Atmosphere */}
          <color attach="background" args={['#EEF2F6']} />
          <fog attach="fog" args={['#EEF2F6', 55, 155]} />

          {/* Natural Sun & Daylight Lighting */}
          <ambientLight intensity={0.9} color="#FFFFFF" />
          <directionalLight
            position={[45, 75, 40]}
            intensity={1.35}
            castShadow
            shadow-mapSize={[1024, 1024]}
            color="#FFFDF8"
          />
          <directionalLight position={[-35, 45, -35]} intensity={0.4} color="#E0F2FE" />

          <Suspense fallback={null}>
            <CityGround />
            <CityRoads />
            <CityBuildings />

            {CITY_INCIDENTS.map(({ incident, pos }) => (
              <IncidentMarker
                key={incident.id}
                id={incident.id}
                category={incident.category}
                severity={incident.severity}
                position={pos}
              />
            ))}
          </Suspense>
        </Canvas>

        {/* Soft edge gradient to blend overlay content seamlessly */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#EEF2F6]/90 via-transparent to-[#EEF2F6]/60 pointer-events-none" />
      </div>

      {/* Top Overlay: Digital Twin Operational Status */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 flex items-center justify-between"
      >
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#D9E2EC] shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#159A68] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#159A68]" />
          </span>
          <span className="text-[11px] font-semibold text-[#102A43] tracking-wide uppercase font-sans">
            Living City OS • Metro Operational Twin
          </span>
        </div>
      </motion.div>

      {/* Center/Bottom Overlay: Brand Narrative & Workflow */}
      <div className="relative z-10 space-y-6 max-w-lg mt-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
          className="space-y-3"
        >
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#2878E5]">
            <Activity className="w-4 h-4 text-[#2878E5]" />
            <span className="tracking-wider uppercase">Unified Civic Intelligence</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold font-heading text-[#102A43] tracking-tight leading-[1.15]">
            Your City. <br />
            Your Voice. <br />
            <span className="text-[#2878E5]">Connected to Action.</span>
          </h2>

          <p className="text-xs lg:text-sm text-[#526777] font-sans leading-relaxed">
            CivicPulse connects citizens, field teams, departments, and AI-powered civic operations
            in one living city platform.
          </p>
        </motion.div>

        {/* Workflow Strip: REPORT → ANALYZE → ACT → VERIFY */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
          className="bg-white/90 backdrop-blur-md border border-[#D9E2EC] rounded-xl p-3 shadow-2xs"
        >
          <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-[#102A43] font-sans">
            <span className="hover:text-[#2878E5] transition-colors">REPORT</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="hover:text-[#2878E5] transition-colors">ANALYZE</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="hover:text-[#2878E5] transition-colors">ACT</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="text-[#159A68]">VERIFY</span>
          </div>
        </motion.div>

        {/* Section 5: City Activity Micro-Layer (Truthful non-numeric telemetry labels) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
          className="grid grid-cols-2 gap-2 text-[11px] font-sans"
        >
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-[#D9E2EC]/80 px-2.5 py-1.5 rounded-lg text-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-[#159A68] shrink-0" />
            <span className="truncate font-medium">Live civic coordination</span>
          </div>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-[#D9E2EC]/80 px-2.5 py-1.5 rounded-lg text-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2878E5] shrink-0" />
            <span className="truncate font-medium">AI-assisted triage</span>
          </div>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-[#D9E2EC]/80 px-2.5 py-1.5 rounded-lg text-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F2B84B] shrink-0" />
            <span className="truncate font-medium">Field response</span>
          </div>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-[#D9E2EC]/80 px-2.5 py-1.5 rounded-lg text-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-[#36B37E] shrink-0" />
            <span className="truncate font-medium">Resolution verification</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
