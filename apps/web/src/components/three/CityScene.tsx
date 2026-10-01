import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { CityGround, CityRoads } from './CityGround';
import { CityBuildings, CityZone } from './CityBuildings';
import { IncidentMarker } from './IncidentMarker';
import { Incident } from '@civicpulse/shared';
import { Plus, Minus, Compass, Layers, Crosshair } from 'lucide-react';

export interface CitySceneProps {
  incidents?: Incident[];
  selectedIncidentId?: string;
  onSelectIncident?: (incident: Incident) => void;
  className?: string;
  showControls?: boolean;
}

// Camera controller that smoothly animates toward a focused incident
function CameraRig({ targetPos }: { targetPos: [number, number, number] | null }) {
  useFrame(({ camera }) => {
    if (targetPos) {
      const targetVec = new THREE.Vector3(targetPos[0] + 16, targetPos[1] + 18, targetPos[2] + 20);
      camera.position.lerp(targetVec, 0.05);
    }
  });
  return null;
}

export function CityScene({
  incidents = [],
  selectedIncidentId,
  onSelectIncident,
  className,
  showControls = true,
}: CitySceneProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [showZones, setShowZones] = useState(true);
  const [is3DMode, setIs3DMode] = useState(true);

  // Map real incident coordinates to synthetic 3D space
  const markerPositions: Array<{ incident: Incident; pos: [number, number, number] }> = [
    {
      incident: incidents[0] || ({
        id: 'INC-2026-1048',
        category: 'WATER_LEAK',
        severity: 'CRITICAL',
      } as Incident),
      pos: [18, 0, -18],
    },
    {
      incident: incidents[1] || ({
        id: 'INC-2026-1049',
        category: 'POTHOLE',
        severity: 'HIGH',
      } as Incident),
      pos: [-22, 0, -14],
    },
    {
      incident: incidents[2] || ({
        id: 'INC-2026-1050',
        category: 'GARBAGE',
        severity: 'MEDIUM',
      } as Incident),
      pos: [14, 0, 24],
    },
    {
      incident: incidents[3] || ({
        id: 'INC-2026-1051',
        category: 'STREETLIGHT',
        severity: 'LOW',
      } as Incident),
      pos: [-30, 0, 32],
    },
    {
      incident: incidents[4] || ({
        id: 'INC-2026-1052',
        category: 'DRAINAGE',
        severity: 'MEDIUM',
      } as Incident),
      pos: [28, 0, 8],
    },
  ];

  const activeMarker = markerPositions.find(
    (m) => m.incident.id === selectedIncidentId
  );

  const handleZoomIn = () => {
    if (controlsRef.current) {
      controlsRef.current.object.position.multiplyScalar(0.85);
    }
  };

  const handleZoomOut = () => {
    if (controlsRef.current) {
      controlsRef.current.object.position.multiplyScalar(1.15);
    }
  };

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.object.position.set(50, 45, 55);
    }
  };

  return (
    <div
      className={`relative w-full h-full min-h-[440px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 select-none ${
        className || ''
      }`}
    >
      {/* 3D Canvas with Daylight Environment */}
      <Canvas shadows gl={{ antialias: true, alpha: false }}>
        <PerspectiveCamera makeDefault position={[50, 45, 55]} fov={38} />
        <OrbitControls
          ref={controlsRef}
          maxPolarAngle={is3DMode ? Math.PI / 2.15 : 0.05}
          minDistance={15}
          maxDistance={130}
          enableDamping
          dampingFactor={0.05}
        />

        {activeMarker && <CameraRig targetPos={activeMarker.pos} />}

        {/* Clean Daylight Atmosphere */}
        <color attach="background" args={['#EEF2F6']} />
        <fog attach="fog" args={['#EEF2F6', 50, 160]} />

        {/* Natural Sun & Ambient Daylight Rig */}
        <ambientLight intensity={0.8} color="#FFFFFF" />
        <directionalLight
          position={[45, 70, 35]}
          intensity={1.3}
          castShadow
          shadow-mapSize={[1024, 1024]}
          color="#FFFDF7"
        />
        {/* Soft Sky Bounce Light */}
        <directionalLight position={[-30, 40, -30]} intensity={0.35} color="#E0F2FE" />

        <Suspense fallback={null}>
          <CityGround />
          <CityRoads />
          <CityBuildings />

          {/* Clean Municipal Digital Twin Zones */}
          {showZones && (
            <>
              <CityZone name="Downtown Core" position={[25, 0, 25]} size={[35, 35]} color="#2563EB" />
              <CityZone name="Medical District" position={[25, 0, -25]} size={[35, 35]} color="#EF4444" />
              <CityZone name="Industrial Harbor" position={[-25, 0, 25]} size={[35, 35]} color="#F59E0B" />
              <CityZone name="Residential North" position={[-25, 0, -25]} size={[35, 35]} color="#6366F1" />
            </>
          )}

          {/* Interactive Incident Markers */}
          {markerPositions.map(({ incident, pos }) => (
            <IncidentMarker
              key={incident.id}
              id={incident.id}
              category={incident.category}
              severity={incident.severity}
              position={pos}
              onClick={() => onSelectIncident?.(incident)}
            />
          ))}
        </Suspense>
      </Canvas>

      {/* 3D View Clean Urban HUD Status */}
      <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-2 text-xs font-sans font-semibold bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-sm text-slate-800">
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
        <span>Live City Digital Twin • Metro Cluster #04</span>
      </div>

      {/* Floating Map Controls (Section 23 & 36) */}
      {showControls && (
        <div className="absolute top-4 right-4 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-civic-card">
          <button
            onClick={handleResetCamera}
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
            title="Reset View / Locate"
          >
            <Crosshair className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-200 my-0.5" />
          <button
            onClick={() => setIs3DMode(!is3DMode)}
            className={`p-2 rounded-lg transition-colors ${
              is3DMode ? 'text-blue-600 bg-blue-50 font-bold' : 'text-slate-600 hover:bg-slate-50'
            }`}
            title="Toggle 3D / Ortho"
          >
            <Compass className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowZones(!showZones)}
            className={`p-2 rounded-lg transition-colors ${
              showZones ? 'text-blue-600 bg-blue-50 font-bold' : 'text-slate-600 hover:bg-slate-50'
            }`}
            title="Toggle Municipal Boundaries"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Interaction helper */}
      <div className="absolute bottom-4 right-4 pointer-events-none text-[11px] font-sans text-slate-500 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
        Orbit: Left Click • Pan: Right Click • Zoom: Scroll
      </div>
    </div>
  );
}
