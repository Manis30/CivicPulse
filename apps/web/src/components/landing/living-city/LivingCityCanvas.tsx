import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { CityInfrastructure } from './CityInfrastructure';
import { CityArchitecture, BuildingInfo } from './CityArchitecture';
import { CityIncidents, CityIncidentItem } from './CityIncidents';

// Smooth Camera Controller implementing the 6 Levels and Parallax
interface CameraControllerProps {
  level: number;
  focusedTarget: [number, number, number] | null;
  mousePos: { x: number; y: number };
}

function CameraRig({ level, focusedTarget, mousePos }: CameraControllerProps) {
  const { camera } = useThree();

  // Defined camera positions and targets for all 6 Visual Levels
  const levelConfigs: Record<number, { pos: [number, number, number]; target: [number, number, number] }> = {
    1: { pos: [52, 46, 52], target: [0, 0, 0] },          // LEVEL 1: Entire City
    2: { pos: [38, 32, 40], target: [0, 0, 0] },          // LEVEL 2: City Zones
    3: { pos: [24, 18, 25], target: [4, 0, -4] },         // LEVEL 3: Neighborhood
    4: { pos: [14, 9, 16], target: [-2, 0, 8] },          // LEVEL 4: Streets
    5: { pos: [18, 8, -12], target: [24, 2, -22] },       // LEVEL 5: Buildings & Civic Infrastructure
    6: { pos: [6, 4, 18], target: [-2.2, 0.5, 14] },      // LEVEL 6: Individual Incident Focus
  };

  useFrame(() => {
    const config = levelConfigs[level] || levelConfigs[1];

    // If focused on an incident or building specifically:
    let desiredTarget = new THREE.Vector3(...config.target);
    let desiredPos = new THREE.Vector3(...config.pos);

    if (focusedTarget) {
      desiredTarget = new THREE.Vector3(...focusedTarget);
      desiredPos = new THREE.Vector3(
        focusedTarget[0] + 12,
        focusedTarget[1] + 9,
        focusedTarget[2] + 14
      );
    }

    // Subtle mouse parallax effect (Section 07)
    desiredPos.x += mousePos.x * 2.5;
    desiredPos.y += -mousePos.y * 1.5;

    // Smooth lerp camera position and target
    camera.position.lerp(desiredPos, 0.045);
    camera.lookAt(desiredTarget);
  });

  return null;
}

export interface LivingCityCanvasProps {
  level: number;
  onLevelChange?: (lvl: number) => void;
  hoveredBuilding: BuildingInfo | null;
  onHoverBuilding: (info: BuildingInfo | null) => void;
  onClickBuilding: (info: BuildingInfo) => void;
  selectedIncident: CityIncidentItem | null;
  hoveredIncident: CityIncidentItem | null;
  onHoverIncident: (item: CityIncidentItem | null) => void;
  onClickIncident: (item: CityIncidentItem) => void;
}

export function LivingCityCanvas({
  level,
  onLevelChange,
  hoveredBuilding,
  onHoverBuilding,
  onClickBuilding,
  selectedIncident,
  hoveredIncident,
  onHoverIncident,
  onClickIncident,
}: LivingCityCanvasProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

  // Handle subtle mouse parallax on container
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setMousePos({ x, y });
  };

  // Determine focused target if an incident or building is selected
  const focusedTarget: [number, number, number] | null = selectedIncident
    ? selectedIncident.position
    : hoveredBuilding
    ? hoveredBuilding.position
    : null;

  return (
    <div
      className="relative w-full h-full min-h-[580px] lg:min-h-[720px] select-none"
      onMouseMove={handleMouseMove}
    >
      <Canvas
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <PerspectiveCamera makeDefault position={[52, 46, 52]} fov={38} />

        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableRotate={true}
          enableZoom={true}
          maxPolarAngle={Math.PI / 2.15}
          minDistance={10}
          maxDistance={120}
          enableDamping={true}
          dampingFactor={0.06}
          onEnd={() => {
            // Optional callback when user zooms deeply
            if (controlsRef.current && onLevelChange) {
              const dist = controlsRef.current.getDistance();
              if (dist < 20 && level < 5) onLevelChange(5);
              else if (dist > 70 && level > 2) onLevelChange(1);
            }
          }}
        />

        <CameraRig
          level={level}
          focusedTarget={focusedTarget}
          mousePos={mousePos}
        />

        {/* Atmosphere & Lighting: Living City Soft Urban 3D */}
        <color attach="background" args={['#F7F8F4']} />
        <fog attach="fog" args={['#F7F8F4', 55, 155]} />

        {/* Warm Ambient Sunlight */}
        <ambientLight intensity={0.9} color="#FFFFFF" />

        {/* Primary Sun Directional Light with Warm Soft Shadows */}
        <directionalLight
          position={[48, 65, 38]}
          intensity={1.35}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
          color="#FFFDF5"
        />

        {/* Soft Mist Sky Bounce Fill */}
        <directionalLight position={[-35, 38, -35]} intensity={0.4} color="#EEF4F7" />

        {/* Secondary Warm Rim */}
        <directionalLight position={[0, -10, 0]} intensity={0.15} color="#E2F4E8" />

        <Suspense fallback={null}>
          <CityInfrastructure />
          <CityArchitecture
            hoveredBuilding={hoveredBuilding}
            onHoverBuilding={onHoverBuilding}
            onClickBuilding={onClickBuilding}
          />
          <CityIncidents
            selectedIncident={selectedIncident}
            hoveredIncident={hoveredIncident}
            onHoverIncident={onHoverIncident}
            onClickIncident={onClickIncident}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
