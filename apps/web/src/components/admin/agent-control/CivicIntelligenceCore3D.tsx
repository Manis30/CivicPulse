import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { cn } from '@/lib/utils';

interface CivicIntelligenceCore3DProps {
  className?: string;
  isProcessing?: boolean;
}

export const CivicIntelligenceCore3D: React.FC<CivicIntelligenceCore3DProps> = ({
  className,
  isProcessing = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Detect WebGL capability safely
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    const width = container.clientWidth || 220;
    const height = container.clientHeight || 220;

    // 2. Fixed Isometric Camera (Camera NEVER rotates - only the city group rotates)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 3.4, 4.2);
    camera.lookAt(0, 0.15, 0);

    // 3. Renderer with transparency and crisp pixel ratio
    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL init failed, using SVG fallback:', e);
      setHasWebGL(false);
      return;
    }

    // 4. Lighting System
    const ambientLight = new THREE.AmbientLight(0x0c223a, 3.0);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 3.2);
    keyLight.position.set(3, 5, 2.5);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x818cf8, 3.8, 12);
    rimLight.position.set(0, 2.2, 0);
    scene.add(rimLight);

    const cyanAccent = new THREE.PointLight(0x22d3ee, 2.2, 8);
    cyanAccent.position.set(-2, 1.8, -2);
    scene.add(cyanAccent);

    // 5. City Digital Twin Group (Procedural mini-city that rotates smoothly)
    const cityGroup = new THREE.Group();
    scene.add(cityGroup);

    // --- Base Plinth (Dark Metallic Platform Disc) ---
    const baseGeo = new THREE.CylinderGeometry(1.95, 2.05, 0.08, 40);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x06111e,
      roughness: 0.35,
      metalness: 0.85,
      transparent: true,
      opacity: 0.92,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.04;
    cityGroup.add(baseMesh);

    // Outer Glowing Cyan Border Ring on Base
    const ringGeo = new THREE.RingGeometry(2.0, 2.06, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.55,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.005;
    cityGroup.add(ringMesh);

    // Inner Concentric Ring Road
    const innerRingGeo = new THREE.RingGeometry(0.98, 1.02, 36);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0x1e3a5f,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    const innerRingMesh = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRingMesh.rotation.x = -Math.PI / 2;
    innerRingMesh.position.y = 0.006;
    cityGroup.add(innerRingMesh);

    // --- Road Network Grid Lines ---
    const roadPoints: THREE.Vector3[] = [
      // North-South Main Boulevard
      new THREE.Vector3(0, 0.008, -1.85),
      new THREE.Vector3(0, 0.008, 1.85),
      // East-West Main Avenue
      new THREE.Vector3(-1.85, 0.008, 0),
      new THREE.Vector3(1.85, 0.008, 0),
      // Diagonal Cross-Streets
      new THREE.Vector3(-1.2, 0.008, -1.2),
      new THREE.Vector3(1.2, 0.008, 1.2),
      new THREE.Vector3(-1.2, 0.008, 1.2),
      new THREE.Vector3(1.2, 0.008, -1.2),
    ];
    const roadGeo = new THREE.BufferGeometry().setFromPoints(roadPoints);
    const roadMat = new THREE.LineBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.35,
    });
    const roads = new THREE.LineSegments(roadGeo, roadMat);
    cityGroup.add(roads);

    // --- Procedural Buildings with Glowing Edges ---
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x09223d,
      roughness: 0.22,
      metalness: 0.75,
      transparent: true,
      opacity: 0.88,
      emissive: 0x081e36,
      emissiveIntensity: 0.45,
    });

    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.55,
    });

    // 18 Architectural Building Blocks of varying heights
    const buildingDefs = [
      // Central Civic Spire (Apex civic intelligence tower)
      { x: 0.0, z: -0.15, w: 0.35, h: 1.45, d: 0.35 },
      // Inner Civic Ring
      { x: -0.55, z: -0.55, w: 0.35, h: 0.95, d: 0.35 },
      { x: 0.55, z: -0.55, w: 0.38, h: 1.2, d: 0.35 },
      { x: -0.55, z: 0.55, w: 0.35, h: 1.05, d: 0.35 },
      { x: 0.55, z: 0.55, w: 0.38, h: 0.85, d: 0.38 },
      // Mid Quadrant Blocks
      { x: -1.15, z: -0.2, w: 0.32, h: 0.9, d: 0.42 },
      { x: 1.15, z: -0.2, w: 0.35, h: 1.25, d: 0.35 },
      { x: -0.2, z: -1.15, w: 0.42, h: 0.75, d: 0.3 },
      { x: -0.2, z: 1.15, w: 0.38, h: 1.1, d: 0.35 },
      // Outer Perimeter Blocks
      { x: -0.95, z: -0.95, w: 0.32, h: 0.65, d: 0.32 },
      { x: 0.95, z: -0.95, w: 0.3, h: 0.85, d: 0.3 },
      { x: -1.05, z: 0.85, w: 0.32, h: 0.6, d: 0.32 },
      { x: 0.95, z: 0.95, w: 0.32, h: 0.95, d: 0.3 },
      { x: 0.0, z: -1.45, w: 0.28, h: 0.55, d: 0.28 },
      { x: 0.0, z: 1.45, w: 0.28, h: 0.7, d: 0.28 },
      { x: -1.45, z: 0.25, w: 0.26, h: 0.5, d: 0.28 },
      { x: 1.45, z: 0.25, w: 0.26, h: 0.75, d: 0.28 },
    ];

    const buildingGeometries: THREE.BoxGeometry[] = [];
    const edgeGeometries: THREE.EdgesGeometry[] = [];

    buildingDefs.forEach((b) => {
      const geo = new THREE.BoxGeometry(b.w, b.h, b.d);
      buildingGeometries.push(geo);
      const mesh = new THREE.Mesh(geo, buildingMat);
      mesh.position.set(b.x, b.h / 2, b.z);
      cityGroup.add(mesh);

      const edgesGeo = new THREE.EdgesGeometry(geo);
      edgeGeometries.push(edgesGeo);
      const edges = new THREE.LineSegments(edgesGeo, edgeMat);
      edges.position.copy(mesh.position);
      cityGroup.add(edges);
    });

    // --- Civic Green Parks (2 Small Flat Emerald Squares) ---
    const parkGeo = new THREE.PlaneGeometry(0.38, 0.38);
    const parkMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const park1 = new THREE.Mesh(parkGeo, parkMat);
    park1.rotation.x = -Math.PI / 2;
    park1.position.set(-0.6, 0.009, 0.0);
    cityGroup.add(park1);

    const park2 = new THREE.Mesh(parkGeo, parkMat);
    park2.rotation.x = -Math.PI / 2;
    park2.position.set(0.6, 0.009, 0.0);
    cityGroup.add(park2);

    // --- Floating Civic Intelligence Nodes (5 Services with Neural Connections) ---
    const nodeGeo = new THREE.OctahedronGeometry(0.075);
    const nodeDefs = [
      { x: -0.55, y: 1.05, z: -0.55, color: 0x10b981 }, // Green: Parks & Environment
      { x: 0.55, y: 1.35, z: -0.55, color: 0x38bdf8 },  // Cyan: Smart Mobility / Transit
      { x: 0.0, y: 1.58, z: -0.15, color: 0x22d3ee },   // Light Cyan: Core Spire Apex
      { x: -0.55, y: 1.15, z: 0.55, color: 0x818cf8 },  // Indigo: Civic Governance
      { x: 0.55, y: 0.95, z: 0.55, color: 0xf59e0b },  // Amber: Public Works
      { x: 1.15, y: 1.38, z: -0.2, color: 0xc084fc },   // Violet: Emergency Response
    ];

    const neuralPoints: THREE.Vector3[] = [];

    nodeDefs.forEach((nd) => {
      const mat = new THREE.MeshBasicMaterial({ color: nd.color });
      const nodeMesh = new THREE.Mesh(nodeGeo, mat);
      nodeMesh.position.set(nd.x, nd.y, nd.z);
      cityGroup.add(nodeMesh);

      // Neural connection line down to building top
      neuralPoints.push(
        new THREE.Vector3(nd.x, nd.y, nd.z),
        new THREE.Vector3(nd.x, nd.y - 0.25, nd.z)
      );
    });

    const neuralGeo = new THREE.BufferGeometry().setFromPoints(neuralPoints);
    const neuralMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.5,
    });
    const neuralLines = new THREE.LineSegments(neuralGeo, neuralMat);
    cityGroup.add(neuralLines);

    // --- Central Civic Pulse Wave ---
    const pulseRingGeo = new THREE.RingGeometry(0.08, 0.16, 36);
    const pulseRingMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
    });
    const pulseRing = new THREE.Mesh(pulseRingGeo, pulseRingMat);
    pulseRing.rotation.x = -Math.PI / 2;
    pulseRing.position.y = 0.02;
    cityGroup.add(pulseRing);

    // --- Subtle Orbiting Data Particles ---
    const particleCount = 18;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 1.35 + (i % 3) * 0.3;
      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = 0.35 + (i % 4) * 0.28;
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x818cf8,
      size: 0.055,
      transparent: true,
      opacity: 0.8,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    cityGroup.add(particles);

    // 6. Smooth Animation Loop
    let animationFrameId: number;
    let pulseScale = 0.4;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth slow rotation of the 3D city (Camera remains fixed)
      const rotSpeed = isProcessing ? 0.0055 : 0.0026;
      cityGroup.rotation.y += rotSpeed;

      // Pulse wave expansion across city roads and nodes
      pulseScale += isProcessing ? 0.022 : 0.011;
      if (pulseScale > 2.1) {
        pulseScale = 0.25;
      }
      pulseRing.scale.set(pulseScale, pulseScale, 1);
      pulseRingMat.opacity = Math.max(0, 0.8 * (1 - (pulseScale - 0.25) / 1.85));

      // Orbiting particles float in counter-rotation
      particles.rotation.y -= 0.0018;

      if (renderer) {
        renderer.render(scene, camera);
      }
    };

    animate();

    // 7. Full Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (renderer && renderer.domElement) {
        container.removeChild(renderer.domElement);
        renderer.dispose();
      }
      scene.clear();
      baseGeo.dispose();
      baseMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      innerRingGeo.dispose();
      innerRingMat.dispose();
      roadGeo.dispose();
      roadMat.dispose();
      buildingMat.dispose();
      edgeMat.dispose();
      buildingGeometries.forEach((g) => g.dispose());
      edgeGeometries.forEach((g) => g.dispose());
      parkGeo.dispose();
      parkMat.dispose();
      nodeGeo.dispose();
      neuralGeo.dispose();
      neuralMat.dispose();
      pulseRingGeo.dispose();
      pulseRingMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [isProcessing]);

  if (!hasWebGL) {
    // Procedural High-Quality SVG Fallback
    return (
      <div className={cn('relative w-full h-full flex items-center justify-center', className)}>
        <svg viewBox="0 0 200 200" className="w-full h-full opacity-65">
          <circle cx="100" cy="100" r="75" fill="none" stroke="#38BDF8" strokeWidth="1.2" strokeDasharray="4 4" />
          <polygon points="100,45 145,75 145,130 100,160 55,130 55,75" fill="#09223D" stroke="#818CF8" strokeWidth="1.5" />
          <rect x="85" y="70" width="30" height="40" fill="#0E2F54" stroke="#38BDF8" strokeWidth="1" />
          <circle cx="100" cy="65" r="4" fill="#22D3EE" />
          <circle cx="100" cy="100" r="16" fill="none" stroke="#22D3EE" strokeWidth="1.5" className="animate-ping" />
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full h-full pointer-events-none overflow-hidden flex items-center justify-center', className)}
    />
  );
};
