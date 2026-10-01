import React, { useMemo, useState } from 'react';
import * as THREE from 'three';

export interface BuildingInfo {
  id: string;
  name: string;
  category: 'Hospital' | 'School' | 'Water Facility' | 'Office' | 'Residential' | 'Civic Hall';
  zone: string;
  ward?: string;
  activeCount: number;
  resolvedToday: number;
  details?: string;
  position: [number, number, number];
}

interface BuildingProps {
  data: BuildingInfo;
  width: number;
  height: number;
  depth: number;
  primaryColor?: string;
  roofColor?: string;
  hasWaterTank?: boolean;
  hasSolarPanels?: boolean;
  hasBalconies?: boolean;
  isLandmark?: boolean;
  hoveredId: string | null;
  onHover: (info: BuildingInfo | null) => void;
  onClick: (info: BuildingInfo) => void;
}

function BuildingItem({
  data,
  width,
  height,
  depth,
  primaryColor = '#FFFFFF',
  roofColor = '#E2E8EE',
  hasWaterTank = false,
  hasSolarPanels = false,
  hasBalconies = false,
  isLandmark = false,
  hoveredId,
  onHover,
  onClick,
}: BuildingProps) {
  const isHovered = hoveredId === data.id;

  // Elevate slightly and brighten when hovered
  const elevation = isHovered ? 0.4 : 0;
  const currentPrimary = isHovered ? '#F0FBF7' : primaryColor;
  const currentAccent = isHovered ? '#159A68' : isLandmark ? '#2878E5' : '#526777';

  return (
    <group
      position={[data.position[0], data.position[1] + height / 2 + elevation, data.position[2]]}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(data);
      }}
      onPointerOut={() => {
        onHover(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(data);
      }}
    >
      {/* Main Building Mass */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={currentPrimary}
          roughness={0.5}
          metalness={0.08}
        />
      </mesh>

      {/* Modern Window Glass Strips (Vertical/Horizontal facade rhythm) */}
      <mesh position={[0, 0, depth / 2 + 0.02]}>
        <planeGeometry args={[width * 0.75, height * 0.75]} />
        <meshStandardMaterial
          color="#334E68"
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>
      <mesh position={[0, 0, -depth / 2 - 0.02]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[width * 0.75, height * 0.75]} />
        <meshStandardMaterial
          color="#334E68"
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>

      {/* Roof Parapet / Terraces */}
      <mesh position={[0, height / 2 + 0.15, 0]}>
        <boxGeometry args={[width - 0.4, 0.3, depth - 0.4]} />
        <meshStandardMaterial color={roofColor} roughness={0.7} />
      </mesh>

      {/* Highlight Accent Line on Roof Edge */}
      <mesh position={[0, height / 2 + 0.32, 0]}>
        <boxGeometry args={[width - 0.6, 0.05, depth - 0.6]} />
        <meshStandardMaterial color={currentAccent} roughness={0.4} />
      </mesh>

      {/* Rooftop Water Tanks (Iconic Indian City Architecture) */}
      {hasWaterTank && (
        <group position={[width * 0.25, height / 2 + 0.75, depth * 0.25]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.55, 0.55, 0.9, 16]} />
            <meshStandardMaterial color="#102A43" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 0.1, 16]} />
            <meshStandardMaterial color="#102A43" roughness={0.5} />
          </mesh>
        </group>
      )}

      {/* Solar Panel Racks on Terraces */}
      {hasSolarPanels && (
        <group position={[-width * 0.2, height / 2 + 0.5, -depth * 0.2]} rotation={[0.2, 0.3, 0]}>
          <mesh castShadow>
            <boxGeometry args={[width * 0.4, 0.06, depth * 0.35]} />
            <meshStandardMaterial color="#1E3A8A" roughness={0.1} metalness={0.8} />
          </mesh>
        </group>
      )}

      {/* Balconies on Residential Blocks */}
      {hasBalconies && (
        <group position={[0, -height * 0.1, depth / 2 + 0.3]}>
          <mesh castShadow>
            <boxGeometry args={[width * 0.8, 0.15, 0.6]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.6} />
          </mesh>
          {/* Glass / Railing */}
          <mesh position={[0, 0.25, 0.28]}>
            <boxGeometry args={[width * 0.78, 0.4, 0.05]} />
            <meshStandardMaterial color="#2878E5" roughness={0.2} transparent opacity={0.6} />
          </mesh>
        </group>
      )}

      {/* Landmark Distinctive Topping / Signage */}
      {isLandmark && data.category === 'Hospital' && (
        <group position={[0, height / 2 + 0.8, 0]}>
          {/* Helipad Ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.6, 1.8, 32]} />
            <meshBasicMaterial color="#EF6A63" />
          </mesh>
          {/* Red Cross */}
          <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.4, 0.4]} />
            <meshBasicMaterial color="#EF6A63" />
          </mesh>
          <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
            <planeGeometry args={[1.4, 0.4]} />
            <meshBasicMaterial color="#EF6A63" />
          </mesh>
        </group>
      )}

      {isLandmark && data.category === 'School' && (
        <group position={[0, height / 2 + 1.2, 0]}>
          {/* Clock Tower Peak */}
          <mesh castShadow>
            <coneGeometry args={[1.2, 2.0, 4]} />
            <meshStandardMaterial color="#D97706" roughness={0.5} />
          </mesh>
        </group>
      )}
    </group>
  );
}

interface CityArchitectureProps {
  hoveredBuilding: BuildingInfo | null;
  onHoverBuilding: (info: BuildingInfo | null) => void;
  onClickBuilding: (info: BuildingInfo) => void;
}

export function CityArchitecture({
  hoveredBuilding,
  onHoverBuilding,
  onClickBuilding,
}: CityArchitectureProps) {
  // Master Procedural Building Registry matching modern Tamil Nadu Urban Centers
  const { buildings, landmarks } = useMemo(() => {
    const list: Array<{
      info: BuildingInfo;
      w: number;
      h: number;
      d: number;
      primary: string;
      roof: string;
      waterTank: boolean;
      solar: boolean;
      balconies: boolean;
    }> = [];

    // 5 Landmark Buildings specified in prompt Section 08
    const lms: Array<{
      info: BuildingInfo;
      w: number;
      h: number;
      d: number;
      primary: string;
      roof: string;
      waterTank: boolean;
      solar: boolean;
      balconies: boolean;
    }> = [
      {
        info: {
          id: 'bld-hospital',
          name: 'CIVIC HOSPITAL',
          category: 'Hospital',
          zone: 'Zone 04',
          ward: 'Ward 18',
          activeCount: 3,
          resolvedToday: 1,
          details: 'Emergency access corridor monitored. Medical waste pickup scheduled.',
          position: [24, 0, -22],
        },
        w: 13,
        h: 11,
        d: 11,
        primary: '#FFFFFF',
        roof: '#F8FAFC',
        waterTank: true,
        solar: true,
        balconies: false,
      },
      {
        info: {
          id: 'bld-school',
          name: 'PUBLIC SCHOOL #18',
          category: 'School',
          zone: 'Zone 03',
          ward: 'Ward 12',
          activeCount: 0,
          resolvedToday: 2,
          details: 'School safety zone. Speed humps & solar pedestrian beacons active.',
          position: [-24, 0, 24],
        },
        w: 14,
        h: 7,
        d: 10,
        primary: '#FFFBEB',
        roof: '#FEF3C7',
        waterTank: true,
        solar: true,
        balconies: false,
      },
      {
        info: {
          id: 'bld-water',
          name: 'CITY WATER FACILITY',
          category: 'Water Facility',
          zone: 'Zone 05',
          ward: 'Ward 08',
          activeCount: 2,
          resolvedToday: 3,
          details: 'Pumping station #4 telemetry synchronized. Pressure sensors online.',
          position: [24, 0, 24],
        },
        w: 12,
        h: 8,
        d: 12,
        primary: '#F0F9FF',
        roof: '#BAE6FD',
        waterTank: true,
        solar: false,
        balconies: false,
      },
      {
        info: {
          id: 'bld-tech-tower',
          name: 'TECH BOULEVARD TOWERS',
          category: 'Office',
          zone: 'Zone 02',
          ward: 'Ward 04',
          activeCount: 1,
          resolvedToday: 4,
          details: 'Commercial IT corridor. Smart stormwater recharge pit verified.',
          position: [-22, 0, -22],
        },
        w: 11,
        h: 18,
        d: 11,
        primary: '#F8FAFC',
        roof: '#E2E8F0',
        waterTank: false,
        solar: true,
        balconies: false,
      },
      {
        info: {
          id: 'bld-civic-hall',
          name: 'CIVIC OPERATIONS HALL',
          category: 'Civic Hall',
          zone: 'Zone 01',
          ward: 'Central Ward',
          activeCount: 0,
          resolvedToday: 5,
          details: 'Municipal command nerve center. AI triage routing node.',
          position: [0, 0, 20],
        },
        w: 15,
        h: 12,
        d: 10,
        primary: '#FFFFFF',
        roof: '#E2E8F0',
        waterTank: true,
        solar: true,
        balconies: false,
      },
    ];

    // Procedural Neighborhood Blocks (Residential & Commercial)
    const blocks = [
      // Northwest Sector: Residential
      { cx: -32, cz: -10, type: 'res' },
      { cx: -14, cz: -32, type: 'res' },
      { cx: -34, cz: -34, type: 'res' },
      // Northeast Sector: Commercial / Mixed
      { cx: 12, cz: -34, type: 'com' },
      { cx: 34, cz: -12, type: 'com' },
      { cx: 34, cz: -34, type: 'com' },
      // Southwest Sector: Residential & Mixed
      { cx: -34, cz: 14, type: 'res' },
      { cx: -14, cz: 34, type: 'res' },
      // Southeast Sector: Mixed Services
      { cx: 14, cz: 34, type: 'com' },
      { cx: 34, cz: 34, type: 'com' },
      { cx: 34, cz: 14, type: 'com' },
    ];

    blocks.forEach((blk, idx) => {
      const isRes = blk.type === 'res';
      const height = isRes ? 6 + (idx % 3) * 3 : 9 + (idx % 4) * 4;
      list.push({
        info: {
          id: `bld-proc-${idx}`,
          name: isRes ? `RESIDENTIAL SECTOR ${idx + 1}` : `CIVIC COMMERCE #${idx + 1}`,
          category: isRes ? 'Residential' : 'Office',
          zone: isRes ? 'Zone 01' : 'Zone 02',
          ward: `Ward 0${(idx % 8) + 1}`,
          activeCount: idx % 3 === 0 ? 1 : 0,
          resolvedToday: (idx % 4) + 1,
          details: 'Municipal waste and street lighting network active.',
          position: [blk.cx, 0, blk.cz],
        },
        w: 8.5,
        h: height,
        d: 8.5,
        primary: isRes ? '#FAF7F2' : '#FFFFFF',
        roof: isRes ? '#E7DEC8' : '#CBD5E1',
        waterTank: true,
        solar: idx % 2 === 0,
        balconies: isRes,
      });
    });

    return { buildings: list, landmarks: lms };
  }, []);

  return (
    <group>
      {/* Standard Procedural Buildings */}
      {buildings.map((item) => (
        <BuildingItem
          key={item.info.id}
          data={item.info}
          width={item.w}
          height={item.h}
          depth={item.d}
          primaryColor={item.primary}
          roofColor={item.roof}
          hasWaterTank={item.waterTank}
          hasSolarPanels={item.solar}
          hasBalconies={item.balconies}
          hoveredId={hoveredBuilding?.id || null}
          onHover={onHoverBuilding}
          onClick={onClickBuilding}
        />
      ))}

      {/* Special Civic Landmarks */}
      {landmarks.map((item) => (
        <BuildingItem
          key={item.info.id}
          data={item.info}
          width={item.w}
          height={item.h}
          depth={item.d}
          primaryColor={item.primary}
          roofColor={item.roof}
          hasWaterTank={item.waterTank}
          hasSolarPanels={item.solar}
          hasBalconies={item.balconies}
          isLandmark={true}
          hoveredId={hoveredBuilding?.id || null}
          onHover={onHoverBuilding}
          onClick={onClickBuilding}
        />
      ))}
    </group>
  );
}
