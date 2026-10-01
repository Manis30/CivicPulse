import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

interface BuildingData {
  id: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  type: 'commercial' | 'residential' | 'hospital' | 'school' | 'government' | 'transit' | 'plaza';
  name?: string;
}

export function CityBuildings() {
  // Deterministic procedural generation of synthetic clean urban architecture
  const { buildings, landmarks } = useMemo(() => {
    const list: BuildingData[] = [];
    const lms: BuildingData[] = [];

    const zones = [
      { minX: -45, maxX: -10, minZ: -45, maxZ: -10, type: 'residential' },
      { minX: 10, maxX: 45, minZ: -45, maxZ: -10, type: 'commercial' },
      { minX: -45, maxX: -10, minZ: 10, maxZ: 45, type: 'residential' },
      { minX: 10, maxX: 45, minZ: 10, maxZ: 45, type: 'commercial' },
    ];

    let counter = 0;
    zones.forEach((zone) => {
      for (let x = zone.minX + 4; x <= zone.maxX - 4; x += 9) {
        for (let z = zone.minZ + 4; z <= zone.maxZ - 4; z += 9) {
          // Avoid collision with landmarks
          if (
            (x > 12 && x < 26 && z > -26 && z < -12) || // Hospital area
            (x > -32 && x < -18 && z > 18 && z < 32) || // School area
            (x > 15 && x < 30 && z > 15 && z < 30) ||   // Government area
            (x > -10 && x < 10 && z > -10 && z < 10)    // Central Plaza area
          ) {
            continue;
          }

          const pseudoRandom = Math.sin(counter * 99 + x * 13 + z * 7);
          const height = Math.floor(5 + Math.abs(pseudoRandom) * 16);
          const width = 5.5;
          const depth = 5.5;

          list.push({
            id: `bld-${counter++}`,
            x,
            z,
            width,
            depth,
            height,
            type: zone.type as BuildingData['type'],
          });
        }
      }
    });

    // 5 Recognizable Civic Landmarks (Section 29)
    // 1. Municipal Hospital
    const hospital: BuildingData = {
      id: 'landmark-hospital',
      x: 20,
      z: -20,
      width: 12,
      depth: 10,
      height: 14,
      type: 'hospital',
      name: 'Municipal Hospital',
    };
    lms.push(hospital);

    // 2. Central Public School
    const school: BuildingData = {
      id: 'landmark-school',
      x: -24,
      z: 24,
      width: 13,
      depth: 9,
      height: 7,
      type: 'school',
      name: 'Public High School',
    };
    lms.push(school);

    // 3. Government City Hall / Municipal Building
    const gov: BuildingData = {
      id: 'landmark-gov',
      x: 22,
      z: 22,
      width: 14,
      depth: 12,
      height: 18,
      type: 'government',
      name: 'City Operations Hall',
    };
    lms.push(gov);

    // 4. Central Transit Hub
    const transit: BuildingData = {
      id: 'landmark-transit',
      x: -22,
      z: -22,
      width: 14,
      depth: 10,
      height: 8,
      type: 'transit',
      name: 'Metro Transit Hub',
    };
    lms.push(transit);

    // 5. Central Civic Plaza
    const plaza: BuildingData = {
      id: 'landmark-plaza',
      x: 0,
      z: 0,
      width: 10,
      depth: 10,
      height: 1,
      type: 'plaza',
      name: 'Central Civic Plaza',
    };
    lms.push(plaza);

    return { buildings: list, landmarks: lms };
  }, []);

  return (
    <group>
      {/* Standard Procedural Buildings */}
      {buildings.map((b) => {
        const isCommercial = b.type === 'commercial';
        const buildingColor = isCommercial ? '#F8FAFC' : '#F1F5F9';
        const roofColor = isCommercial ? '#CBD5E1' : '#94A3B8';

        return (
          <group key={b.id} position={[b.x, b.height / 2, b.z]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[b.width, b.height, b.depth]} />
              <meshStandardMaterial color={buildingColor} roughness={0.7} metalness={0.1} />
            </mesh>
            {/* Subtle Roof Inset */}
            <mesh position={[0, b.height / 2 + 0.1, 0]}>
              <boxGeometry args={[b.width - 0.6, 0.2, b.depth - 0.6]} />
              <meshStandardMaterial color={roofColor} roughness={0.8} />
            </mesh>
          </group>
        );
      })}

      {/* Special Civic Landmarks (Section 29) */}
      {landmarks.map((lm) => {
        if (lm.type === 'plaza') {
          return (
            <group key={lm.id} position={[lm.x, 0.02, lm.z]}>
              <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[7, 32]} />
                <meshStandardMaterial color="#E0E7FF" roughness={0.9} />
              </mesh>
              <Html position={[0, 1.5, 0]} center distanceFactor={22}>
                <div className="bg-white/95 border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded-lg text-[10px] font-bold font-heading shadow-sm whitespace-nowrap pointer-events-none">
                  🏛️ {lm.name}
                </div>
              </Html>
            </group>
          );
        }

        let mainColor = '#FFFFFF';
        let accentColor = '#2563EB';

        if (lm.type === 'hospital') {
          mainColor = '#FFFFFF';
          accentColor = '#EF4444';
        } else if (lm.type === 'school') {
          mainColor = '#FEF3C7';
          accentColor = '#F59E0B';
        } else if (lm.type === 'government') {
          mainColor = '#F8FAFC';
          accentColor = '#2563EB';
        } else if (lm.type === 'transit') {
          mainColor = '#E2E8F0';
          accentColor = '#10B981';
        }

        return (
          <group key={lm.id} position={[lm.x, lm.height / 2, lm.z]}>
            {/* Landmark Main Mass */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[lm.width, lm.height, lm.depth]} />
              <meshStandardMaterial color={mainColor} roughness={0.6} metalness={0.15} />
            </mesh>

            {/* Landmark Accent Trim */}
            <mesh position={[0, lm.height / 2 + 0.2, 0]}>
              <boxGeometry args={[lm.width - 0.8, 0.3, lm.depth - 0.8]} />
              <meshStandardMaterial color={accentColor} roughness={0.5} />
            </mesh>

            {/* Landmark Label */}
            <Html position={[0, lm.height / 2 + 3, 0]} center distanceFactor={25}>
              <div className="bg-white/95 border border-slate-200 px-2.5 py-1 rounded-lg text-[10px] font-bold font-heading text-slate-800 shadow-sm whitespace-nowrap pointer-events-none flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                <span>{lm.name}</span>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

export function CityZone({
  name,
  position,
  size,
  color,
}: {
  name: string;
  position: [number, number, number];
  size: [number, number];
  color: string;
}) {
  return (
    <group position={position}>
      {/* Perimeter boundary line */}
      <lineSegments position={[0, 0.03, 0]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(size[0], size[1])] as any} />
        <lineBasicMaterial color={color} transparent opacity={0.35} linewidth={1.5} />
      </lineSegments>
    </group>
  );
}
