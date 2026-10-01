import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type IncidentSeverity = 'URGENT' | 'IN_PROGRESS' | 'RESOLVED' | 'INFO';

export interface CityIncidentItem {
  id: string;
  name: string;
  type: 'POTHOLE' | 'GARBAGE' | 'STREETLIGHT' | 'WATER_LEAK' | 'FALLEN_TREE' | 'DRAINAGE';
  severity: IncidentSeverity;
  severityLabel: 'HIGH PRIORITY' | 'MEDIUM PRIORITY' | 'RESOLVED' | 'INFORMATIONAL';
  ward: string;
  zone: string;
  relatedReports: number;
  description: string;
  position: [number, number, number];
  color: string;
}

export const MASTER_CITY_INCIDENTS: CityIncidentItem[] = [
  {
    id: 'INC-2026-01',
    name: 'POTHOLE',
    type: 'POTHOLE',
    severity: 'URGENT',
    severityLabel: 'HIGH PRIORITY',
    ward: 'Ward 18',
    zone: 'Zone 04',
    relatedReports: 8,
    description: 'Road obstruction detected. High traffic bus transit corridor impact.',
    position: [-2.2, 0, 14],
    color: '#EF6A63', // Soft Coral (Urgent)
  },
  {
    id: 'INC-2026-02',
    name: 'OVERFLOWING GARBAGE',
    type: 'GARBAGE',
    severity: 'URGENT',
    severityLabel: 'HIGH PRIORITY',
    ward: 'Ward 08',
    zone: 'Zone 02',
    relatedReports: 5,
    description: 'Commercial market waste bin exceeding capacity. Sanitation crew alerted.',
    position: [18, 0, -8],
    color: '#EF6A63',
  },
  {
    id: 'INC-2026-03',
    name: 'BROKEN STREET LIGHT',
    type: 'STREETLIGHT',
    severity: 'IN_PROGRESS',
    severityLabel: 'MEDIUM PRIORITY',
    ward: 'Ward 14',
    zone: 'Zone 03',
    relatedReports: 3,
    description: 'Electrical pole fuse replaced. Photocell sensor diagnostic underway.',
    position: [-4.2, 0, -20],
    color: '#F2B84B', // Soft Amber (In Progress)
  },
  {
    id: 'INC-2026-04',
    name: 'WATER LEAK',
    type: 'WATER_LEAK',
    severity: 'IN_PROGRESS',
    severityLabel: 'MEDIUM PRIORITY',
    ward: 'Ward 05',
    zone: 'Zone 05',
    relatedReports: 4,
    description: 'Underground feeder valve pressure fluctuation. Repair crew dispatched.',
    position: [20, 0, 18],
    color: '#F2B84B',
  },
  {
    id: 'INC-2026-05',
    name: 'DRAINAGE ISSUE',
    type: 'DRAINAGE',
    severity: 'RESOLVED',
    severityLabel: 'RESOLVED',
    ward: 'Ward 07',
    zone: 'Zone 01',
    relatedReports: 12,
    description: 'Monsoon stormwater culvert cleared and audited with post-cleanup imagery.',
    position: [-16, 0, 8],
    color: '#36B37E', // Fresh Green (Resolved)
  },
  {
    id: 'INC-2026-06',
    name: 'FALLEN TREE',
    type: 'FALLEN_TREE',
    severity: 'RESOLVED',
    severityLabel: 'RESOLVED',
    ward: 'Ward 11',
    zone: 'Zone 03',
    relatedReports: 7,
    description: 'Obstructing bough safely cleared by horticulture crew. Road reopened.',
    position: [-26, 0, -14],
    color: '#36B37E',
  },
  {
    id: 'INC-2026-07',
    name: 'COMMUNITY TREE PLANTING',
    type: 'DRAINAGE',
    severity: 'INFO',
    severityLabel: 'INFORMATIONAL',
    ward: 'Ward 03',
    zone: 'Zone 01',
    relatedReports: 1,
    description: 'Ward Greening Initiative. 50 native saplings planted in central boulevard.',
    position: [0, 0, -8],
    color: '#2878E5', // Civic Blue (Informational)
  },
];

interface MarkerProps {
  data: CityIncidentItem;
  isSelected: boolean;
  isHovered: boolean;
  onHover: (item: CityIncidentItem | null) => void;
  onClick: (item: CityIncidentItem) => void;
}

function IncidentMarkerItem({
  data,
  isSelected,
  isHovered,
  onHover,
  onClick,
}: MarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (meshRef.current) {
      // Gentle vertical float animation
      meshRef.current.position.y = 1.6 + Math.sin(t * 2.2 + data.position[0]) * 0.15;
    }

    if (ringRef.current) {
      // Ground wave ring pulse
      const scale = 1 + (Math.sin(t * 2.5 + data.position[2]) + 1) * 0.35;
      ringRef.current.scale.set(scale, scale, 1);
    }

    if (outerRingRef.current && (data.severity === 'URGENT' || isSelected)) {
      const scale2 = 1.2 + (Math.cos(t * 2.0) + 1) * 0.5;
      outerRingRef.current.scale.set(scale2, scale2, 1);
    }
  });

  return (
    <group position={data.position}>
      {/* 1. Ground Pulsing Ripple Rings */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[0.7, 1.0, 32]} />
        <meshBasicMaterial color={data.color} transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>

      {(data.severity === 'URGENT' || isSelected) && (
        <mesh ref={outerRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, 0]}>
          <ringGeometry args={[1.2, 1.4, 32]} />
          <meshBasicMaterial color={data.color} transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* 2. Micro Anchor Pin Stem */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1.6, 12]} />
        <meshStandardMaterial color="#64748B" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* 3. Floating 3D Spherical Pin Head with Click & Hover Target */}
      <mesh
        ref={meshRef}
        position={[0, 1.6, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onClick(data);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(data);
        }}
        onPointerOut={() => {
          onHover(null);
        }}
      >
        <sphereGeometry args={[isHovered || isSelected ? 0.72 : 0.6, 24, 24]} />
        <meshStandardMaterial
          color={data.color}
          roughness={0.2}
          metalness={0.15}
          emissive={data.color}
          emissiveIntensity={isHovered || isSelected ? 0.4 : 0.15}
        />
      </mesh>

      {/* White Inner Dot */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
    </group>
  );
}

interface CityIncidentsProps {
  selectedIncident: CityIncidentItem | null;
  hoveredIncident: CityIncidentItem | null;
  onHoverIncident: (item: CityIncidentItem | null) => void;
  onClickIncident: (item: CityIncidentItem) => void;
}

export function CityIncidents({
  selectedIncident,
  hoveredIncident,
  onHoverIncident,
  onClickIncident,
}: CityIncidentsProps) {
  return (
    <group>
      {MASTER_CITY_INCIDENTS.map((item) => (
        <IncidentMarkerItem
          key={item.id}
          data={item}
          isSelected={selectedIncident?.id === item.id}
          isHovered={hoveredIncident?.id === item.id}
          onHover={onHoverIncident}
          onClick={onClickIncident}
        />
      ))}
    </group>
  );
}
