import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Moving Vehicles along road loops
function MovingVehicles() {
  const carsRef = useRef<THREE.Group>(null);
  const busRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (carsRef.current) {
      // Loop vehicles along North-South and East-West corridors
      carsRef.current.children.forEach((child, index) => {
        const speed = 6 + (index % 3) * 2;
        const dir = index % 2 === 0 ? 1 : -1;
        const offset = index * 18;
        const isNS = index < 4;

        if (isNS) {
          const laneX = dir > 0 ? 1.4 : -1.4;
          let newZ = ((t * speed * dir + offset + 70) % 140) - 70;
          child.position.set(laneX, 0.4, newZ);
          child.rotation.y = dir > 0 ? 0 : Math.PI;
        } else {
          const laneZ = dir > 0 ? 1.4 : -1.4;
          let newX = ((t * speed * dir + offset + 70) % 140) - 70;
          child.position.set(newX, 0.4, laneZ);
          child.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2;
        }
      });
    }

    if (busRef.current) {
      const busSpeed = 4.5;
      const busZ = ((t * busSpeed + 30) % 130) - 65;
      busRef.current.position.set(-1.6, 0.75, busZ);
    }
  });

  return (
    <>
      {/* Fleet of Clean Urban Cars */}
      <group ref={carsRef}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const isWhite = i % 2 === 0;
          const bodyColor = isWhite ? '#FFFFFF' : i % 3 === 0 ? '#2878E5' : '#159A68';
          return (
            <group key={i}>
              {/* Car Body */}
              <mesh castShadow>
                <boxGeometry args={[1.2, 0.5, 2.4]} />
                <meshStandardMaterial color={bodyColor} roughness={0.4} metalness={0.2} />
              </mesh>
              {/* Car Cabin */}
              <mesh position={[0, 0.35, -0.2]}>
                <boxGeometry args={[1.0, 0.4, 1.3]} />
                <meshStandardMaterial color="#334E68" roughness={0.2} />
              </mesh>
              {/* Headlights */}
              <mesh position={[0.4, 0.05, 1.22]}>
                <boxGeometry args={[0.2, 0.1, 0.05]} />
                <meshBasicMaterial color="#FEF3C7" />
              </mesh>
              <mesh position={[-0.4, 0.05, 1.22]}>
                <boxGeometry args={[0.2, 0.1, 0.05]} />
                <meshBasicMaterial color="#FEF3C7" />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Electric Civic Municipal Bus */}
      <group ref={busRef}>
        <mesh castShadow>
          <boxGeometry args={[1.8, 1.2, 5.2]} />
          <meshStandardMaterial color="#159A68" roughness={0.3} metalness={0.1} />
        </mesh>
        {/* Bus Glass Strip */}
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[1.85, 0.45, 4.6]} />
          <meshStandardMaterial color="#102A43" roughness={0.1} />
        </mesh>
        {/* White Roof Trim */}
        <mesh position={[0, 0.65, 0]}>
          <boxGeometry args={[1.7, 0.12, 5.0]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
        </mesh>
      </group>
    </>
  );
}

// Animated Pedestrians walking along sidewalks
function WalkingPedestrians() {
  const pedestriansRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (pedestriansRef.current) {
      pedestriansRef.current.children.forEach((p, idx) => {
        const speed = 1.2 + (idx % 3) * 0.4;
        const dir = idx % 2 === 0 ? 1 : -1;
        const offset = idx * 12;
        const z = ((t * speed * dir + offset + 50) % 100) - 50;
        p.position.z = z;
        // subtle walking bob
        p.position.y = 0.5 + Math.abs(Math.sin(t * 5 + idx)) * 0.08;
      });
    }
  });

  return (
    <group ref={pedestriansRef}>
      {[-4.2, 4.2, -4.5, 4.5, -4.0, 4.0].map((x, idx) => (
        <group key={idx} position={[x, 0.5, 0]}>
          {/* Head */}
          <mesh position={[0, 0.55, 0]}>
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshStandardMaterial color="#D9A982" roughness={0.8} />
          </mesh>
          {/* Torso */}
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.5, 8]} />
            <meshStandardMaterial color={idx % 2 === 0 ? '#159A68' : '#2878E5'} roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function CityInfrastructure() {
  return (
    <group>
      {/* 1. Sculpted Floating Architectural Podium / Base with Soft Beveled Rim */}
      <mesh position={[0, -0.7, 0]} receiveShadow>
        <cylinderGeometry args={[78, 82, 1.2, 64]} />
        <meshStandardMaterial color="#F0EDE4" roughness={0.85} metalness={0.05} />
      </mesh>
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <cylinderGeometry args={[77.2, 77.2, 0.1, 64]} />
        <meshStandardMaterial color="#E8E4D8" roughness={0.9} />
      </mesh>

      {/* 2. Soft Urban Ground Plate */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[145, 145]} />
        <meshStandardMaterial color="#FAF8F3" roughness={0.95} />
      </mesh>

      {/* 3. Sustainable Civic Green Parks (Lush Tamil Nadu Neem / Green Belts) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-26, 0.01, -26]} receiveShadow>
        <planeGeometry args={[34, 34]} />
        <meshStandardMaterial color="#E2F4E8" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[28, 0.01, -28]} receiveShadow>
        <planeGeometry args={[26, 26]} />
        <meshStandardMaterial color="#E7F7F0" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-28, 0.01, 28]} receiveShadow>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color="#E7F7F0" roughness={0.9} />
      </mesh>

      {/* 4. Central Civic Plaza Water Fountain / Pool */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[7, 48]} />
        <meshStandardMaterial color="#DCEEFA" roughness={0.15} metalness={0.2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[6.7, 7.3, 48]} />
        <meshStandardMaterial color="#D1DCE5" roughness={0.7} />
      </mesh>

      {/* 5. Primary Arterial Avenues (North-South & East-West) */}
      {/* North-South Boulevard */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <planeGeometry args={[6.8, 140]} />
        <meshStandardMaterial color="#486581" roughness={0.8} />
      </mesh>
      {/* East-West Boulevard */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <planeGeometry args={[140, 6.8]} />
        <meshStandardMaterial color="#486581" roughness={0.8} />
      </mesh>

      {/* Sidewalks (Warm Stone Curbs) */}
      {[-4.2, 4.2].map((offset) => (
        <React.Fragment key={offset}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offset, 0.03, 0]}>
            <planeGeometry args={[1.6, 140]} />
            <meshStandardMaterial color="#DCE3E8" roughness={0.85} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, offset]}>
            <planeGeometry args={[140, 1.6]} />
            <meshStandardMaterial color="#DCE3E8" roughness={0.85} />
          </mesh>
        </React.Fragment>
      ))}

      {/* Road Center White Dashes */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <planeGeometry args={[0.25, 138]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <planeGeometry args={[138, 0.25]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.85} />
      </mesh>

      {/* Secondary Streets */}
      {[-32, -16, 16, 32].map((coord) => (
        <React.Fragment key={coord}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[coord, 0.015, 0]}>
            <planeGeometry args={[3.8, 130]} />
            <meshStandardMaterial color="#627D98" roughness={0.85} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, coord]}>
            <planeGeometry args={[130, 3.8]} />
            <meshStandardMaterial color="#627D98" roughness={0.85} />
          </mesh>
        </React.Fragment>
      ))}

      {/* 6. Storm Water Drainage Grates along curbs */}
      {[-20, -10, 10, 20, 30].map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[3.6, 0.032, z]}>
          <planeGeometry args={[0.5, 1.2]} />
          <meshStandardMaterial color="#102A43" roughness={0.9} />
        </mesh>
      ))}

      {/* 7. Smart Garbage Collection Points (Segregated Blue/Green bins) */}
      <group position={[4.6, 0.4, 18]}>
        <mesh castShadow position={[-0.3, 0, 0]}>
          <boxGeometry args={[0.45, 0.8, 0.45]} />
          <meshStandardMaterial color="#159A68" roughness={0.5} />
        </mesh>
        <mesh castShadow position={[0.3, 0, 0]}>
          <boxGeometry args={[0.45, 0.8, 0.45]} />
          <meshStandardMaterial color="#2878E5" roughness={0.5} />
        </mesh>
      </group>
      <group position={[-4.6, 0.4, -22]}>
        <mesh castShadow position={[-0.3, 0, 0]}>
          <boxGeometry args={[0.45, 0.8, 0.45]} />
          <meshStandardMaterial color="#159A68" roughness={0.5} />
        </mesh>
        <mesh castShadow position={[0.3, 0, 0]}>
          <boxGeometry args={[0.45, 0.8, 0.45]} />
          <meshStandardMaterial color="#2878E5" roughness={0.5} />
        </mesh>
      </group>

      {/* 8. Street Light Poles with Warm Fixtures */}
      {[-30, -15, 15, 30].map((z) => (
        <React.Fragment key={z}>
          {/* East side light */}
          <group position={[4.2, 0, z]}>
            <mesh position={[0, 1.8, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.08, 3.6, 8]} />
              <meshStandardMaterial color="#829AB1" roughness={0.4} />
            </mesh>
            <mesh position={[-0.4, 3.5, 0]}>
              <boxGeometry args={[0.8, 0.1, 0.2]} />
              <meshStandardMaterial color="#627D98" />
            </mesh>
            <mesh position={[-0.6, 3.42, 0]}>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshBasicMaterial color="#FEF3C7" />
            </mesh>
          </group>

          {/* West side light */}
          <group position={[-4.2, 0, z]}>
            <mesh position={[0, 1.8, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.08, 3.6, 8]} />
              <meshStandardMaterial color="#829AB1" roughness={0.4} />
            </mesh>
            <mesh position={[0.4, 3.5, 0]}>
              <boxGeometry args={[0.8, 0.1, 0.2]} />
              <meshStandardMaterial color="#627D98" />
            </mesh>
            <mesh position={[0.6, 3.42, 0]}>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshBasicMaterial color="#FEF3C7" />
            </mesh>
          </group>
        </React.Fragment>
      ))}

      {/* 9. Stylized Urban Trees (Neem / Banyan foliage) */}
      {[
        [-24, -24], [-28, -20], [-22, -28], [-18, -22],
        [24, -24], [28, -28], [22, -26],
        [-24, 24], [-28, 28], [-20, 26],
        [5.2, -10], [5.2, 10], [-5.2, -12], [-5.2, 12]
      ].map(([tx, tz], i) => (
        <group key={i} position={[tx, 0, tz]}>
          {/* Tree Trunk */}
          <mesh position={[0, 0.9, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.24, 1.8, 8]} />
            <meshStandardMaterial color="#8C6D58" roughness={0.9} />
          </mesh>
          {/* Foliage Clusters */}
          <mesh position={[0, 2.3, 0]} castShadow>
            <sphereGeometry args={[1.3, 16, 16]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#2FB37E' : '#159A68'} roughness={0.8} />
          </mesh>
          <mesh position={[0.4, 2.8, -0.2]} castShadow>
            <sphereGeometry args={[0.9, 12, 12]} />
            <meshStandardMaterial color="#36B37E" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* 10. Live Traffic & Pedestrian Streams */}
      <MovingVehicles />
      <WalkingPedestrians />
    </group>
  );
}
