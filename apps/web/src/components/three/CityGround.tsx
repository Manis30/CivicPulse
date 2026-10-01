import React from 'react';

export function CityGround() {
  return (
    <group>
      {/* Daylight Urban Slate/Concrete Base Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[140, 140]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Sustainable Urban Green Parks & Reserves */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-25, -0.04, -25]} receiveShadow>
        <planeGeometry args={[32, 32]} />
        <meshStandardMaterial color="#D1FAE5" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[26, -0.04, -26]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#DCFCE7" roughness={0.95} />
      </mesh>

      {/* Clean Municipal Waterway / River Canal */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-50, -0.03, 0]}>
        <planeGeometry args={[16, 140]} />
        <meshStandardMaterial color="#BAE6FD" roughness={0.2} metalness={0.3} />
      </mesh>
    </group>
  );
}

export function CityRoads() {
  return (
    <group position={[0, 0.01, 0]}>
      {/* Primary North-South Arterial Highway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 130]} />
        <meshStandardMaterial color="#64748B" roughness={0.8} />
      </mesh>
      {/* Clean White Dashed Centerline */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <planeGeometry args={[0.2, 128]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.85} />
      </mesh>

      {/* Primary East-West Arterial Avenue */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[130, 6]} />
        <meshStandardMaterial color="#64748B" roughness={0.8} />
      </mesh>
      {/* Clean White Dashed Centerline */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <planeGeometry args={[128, 0.2]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.85} />
      </mesh>

      {/* Secondary Urban Streets */}
      {[-32, -16, 16, 32].map((coord) => (
        <React.Fragment key={coord}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[coord, 0.005, 0]}>
            <planeGeometry args={[3, 120]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.85} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, coord]}>
            <planeGeometry args={[120, 3]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.85} />
          </mesh>
        </React.Fragment>
      ))}
    </group>
  );
}

