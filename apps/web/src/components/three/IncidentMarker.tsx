import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { SeverityLevel, IncidentCategory } from '@civicpulse/shared';

export interface IncidentMarkerProps {
  id: string;
  category: IncidentCategory;
  severity: SeverityLevel;
  position: [number, number, number];
  onClick?: () => void;
}

export function IncidentMarker({
  id,
  category,
  severity,
  position,
  onClick,
}: IncidentMarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Exact Brand Colors from Section 4 & 20
  const colors: Record<SeverityLevel, string> = {
    LOW: '#2563EB',      // Civic Blue (Reported)
    MEDIUM: '#F59E0B',   // Warning Amber (Under Verification)
    HIGH: '#6366F1',     // AI Indigo (In Progress)
    CRITICAL: '#EF4444', // Critical Red
  };

  const markerColor = colors[severity] || '#2563EB';
  const isCritical = severity === 'CRITICAL';

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      // Gentle float animation
      meshRef.current.position.y = position[1] + 1.2 + Math.sin(t * 2) * 0.15;
    }
    // Only pulse ground ring if CRITICAL
    if (ringRef.current && isCritical) {
      const scale = 1 + (Math.sin(t * 2.5) + 1) * 0.4;
      ringRef.current.scale.set(scale, scale, 1);
    }
  });

  return (
    <group position={[position[0], 0, position[2]]}>
      {/* Ground ring - only soft pulse for critical */}
      {isCritical && (
        <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <ringGeometry args={[0.9, 1.2, 32]} />
          <meshBasicMaterial color={markerColor} transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Clean Vertical Anchor Pin Stem */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 1.4, 12]} />
        <meshStandardMaterial color="#64748B" roughness={0.5} />
      </mesh>

      {/* Elevated Marker Head (Clean Geo Sphere Pin) */}
      <mesh
        ref={meshRef}
        position={[0, 1.4, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshStandardMaterial
          color={markerColor}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>

      {/* Clean White Information Tooltip */}
      {hovered && (
        <Html position={[0, 2.6, 0]} center distanceFactor={15}>
          <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-civic-hover whitespace-nowrap pointer-events-none font-sans">
            <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: markerColor }} />
              {id} — {category}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Severity: {severity}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

