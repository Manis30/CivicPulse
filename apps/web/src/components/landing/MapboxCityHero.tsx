import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  PlusCircle,
  Compass,
  Building2,
  X,
  RotateCcw,
  Plus,
  Minus,
  FastForward,
  Cpu,
  Activity,
  CheckCircle2,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useIncidents } from '../../contexts/IncidentContext';

// Configure Mapbox token from environment variable
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';
if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

// 1. Initial Wide 3D City Overview Camera (Part 1 & Part 5)
// Saved dynamically on map ready; never hardcoded separately on return
const INITIAL_CAMERA = {
  center: [-73.9876, 40.7418] as [number, number], // Madison Square & 5th Ave Corridor
  zoom: 16.3, // Immersive drone overview showing vertical depth & street network
  pitch: 58, // Elevated cinematic drone perspective (55–65° range)
  bearing: -32, // Avenue perspective framing building heights and street depth
};

// Recognizable Civic Facility / Landmark Interface (Part 2)
export interface CivicLandmark {
  id: string;
  name: string;
  eyebrow: string;
  category: string;
  zone: string;
  ward: string;
  activeCount: number;
  resolvedToday: number;
  statusText: string;
  systemStatus: string;
  description: string;
  coordinates: [number, number];
  icon: string;
  camera: {
    center: [number, number];
    zoom: number;
    pitch: number;
    bearing: number;
  };
}

// 2 Key Meaningful Civic Locations for Stops 1 & 2
const CIVIC_FACILITIES: CivicLandmark[] = [
  // STOP 1: Civic Facility / Workplace
  {
    id: 'stop-1-facility',
    name: 'Central Operations Hall',
    eyebrow: 'CIVIC FACILITY',
    category: 'Municipal Command Hub',
    zone: 'Zone 01',
    ward: 'Ward 18',
    activeCount: 1,
    resolvedToday: 6,
    statusText: 'ACTIVE',
    systemStatus: 'ACTIVE',
    description: 'Municipal operations center coordinating autonomous sensor triage and multi-department dispatch.',
    coordinates: [-73.9857, 40.7484],
    icon: '🏛️',
    camera: {
      center: [-73.9857, 40.7484],
      zoom: 17.1, // Moderate zoom: building visible with surrounding street context
      pitch: 62, // Approaching facility: pitch 62°
      bearing: -26,
    },
  },
  // STOP 2: Infrastructure Facility
  {
    id: 'stop-2-infrastructure',
    name: 'Water Distribution Station',
    eyebrow: 'INFRASTRUCTURE',
    category: 'Water & Utilities',
    zone: 'Zone 02',
    ward: 'Ward 18',
    activeCount: 2,
    resolvedToday: 4,
    statusText: 'MONITORED',
    systemStatus: 'MONITORED',
    description: 'Sub-surface high-pressure regulation node with real-time acoustic flow and pressure sensors.',
    coordinates: [-73.9840, 40.7445],
    icon: '💧',
    camera: {
      center: [-73.9840, 40.7445],
      zoom: 17.2,
      pitch: 58, // Leaving facility / infrastructure stop: pitch 58°
      bearing: -34,
    },
  },
  // Additional Landmarks for Exploration
  {
    id: 'lm-hospital',
    name: 'Civic Hospital Complex',
    eyebrow: 'CIVIC HEALTHCARE',
    category: 'Healthcare & Trauma',
    zone: 'Zone 03',
    ward: 'Ward 18',
    activeCount: 2,
    resolvedToday: 3,
    statusText: 'OPERATIONAL',
    systemStatus: 'OPERATIONAL',
    description: 'Primary emergency trauma center with automated ambulance transit corridor clearance.',
    coordinates: [-73.9754, 40.7392],
    icon: '🏥',
    camera: {
      center: [-73.9754, 40.7392],
      zoom: 17.2,
      pitch: 60,
      bearing: -18,
    },
  },
  {
    id: 'lm-park',
    name: 'Madison Square Municipal Park',
    eyebrow: 'PUBLIC GREENSPACE',
    category: 'Urban Forestry',
    zone: 'Zone 02',
    ward: 'Ward 18',
    activeCount: 0,
    resolvedToday: 5,
    statusText: 'ACTIVE',
    systemStatus: 'ACTIVE',
    description: 'Public green canopy with native 3D trees and smart stormwater retention telemetry.',
    coordinates: [-73.9880, 40.7425],
    icon: '🌳',
    camera: {
      center: [-73.9880, 40.7425],
      zoom: 17.2,
      pitch: 58,
      bearing: -35,
    },
  },
];

// Rich Civic Incident Data Model for Digital Twin (Part 8)
export interface CityTourIncident {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  ward: string;
  zone: string;
  relatedReports: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'RESOLVED' | 'INFO';
  severityLabel: 'CRITICAL PRIORITY' | 'HIGH PRIORITY' | 'MEDIUM PRIORITY' | 'LOW PRIORITY' | 'RESOLVED' | 'INFORMATIONAL';
  department: string;
  description: string;
  coordinates: [number, number];
  color: string;
  badgeBg: string;
  symbol: string;
  aiStatus: string;
  aiSteps: string[];
  camera: {
    center: [number, number];
    zoom: number;
    pitch: number;
    bearing: number;
  };
}

// Default Seed Incidents (Grounded in real backend database coordinates)
const DEFAULT_INCIDENTS: CityTourIncident[] = [
  // High Priority Pothole on Lexington Ave Corridor (Matches backend INC-2026-1049)
  {
    id: 'inc-pothole',
    name: 'POTHOLE',
    category: 'ROAD',
    categoryLabel: 'ROAD / ARTERIAL CORRIDOR',
    ward: 'Ward 18',
    zone: 'Zone 01',
    relatedReports: 8,
    severity: 'HIGH',
    severityLabel: 'HIGH PRIORITY',
    department: 'Roads Department',
    description: 'Deep pavement cavity in central driving lane. Risk of vehicular tire puncture and traffic deceleration.',
    coordinates: [-73.9721, 40.7612],
    color: '#F59E0B', // Amber
    badgeBg: 'rgba(245, 158, 11, 0.16)',
    symbol: '⚠️',
    aiStatus: 'ACTIVE',
    aiSteps: ['DETECTED', 'ANALYZED', 'ROUTED', 'FIELD RESPONSE ACTIVE'],
    camera: {
      center: [-73.9721, 40.7612],
      zoom: 17.4, // Approaching incident: moderate zoom showing surrounding buildings
      pitch: 64, // Approaching incident: pitch 64°
      bearing: -20,
    },
  },
  // Critical Water Main Rupture (Matches backend INC-2026-1048)
  {
    id: 'inc-water-rupture',
    name: 'WATER MAIN RUPTURE',
    category: 'WATER',
    categoryLabel: 'WATER / STRUCTURAL THREAT',
    ward: 'Ward 18',
    zone: 'Zone 01',
    relatedReports: 16,
    severity: 'CRITICAL',
    severityLabel: 'CRITICAL PRIORITY',
    department: 'Water & Utilities',
    description: 'Sub-surface high-pressure water main rupture threatening medical facility supply and roadway foundation.',
    coordinates: [-73.9851, 40.7484],
    color: '#EF4444', // Red
    badgeBg: 'rgba(239, 68, 68, 0.18)',
    symbol: '⚡',
    aiStatus: 'ACTIVE',
    aiSteps: ['DETECTED', 'ANALYZED', 'ROUTED', 'FIELD RESPONSE ACTIVE'],
    camera: {
      center: [-73.9851, 40.7484],
      zoom: 17.4,
      pitch: 64,
      bearing: -18,
    },
  },
  // Overflowing Commercial Waste on Mercer St (Matches backend INC-2026-1050)
  {
    id: 'inc-garbage',
    name: 'OVERFLOWING WASTE',
    category: 'SANITATION',
    categoryLabel: 'SANITATION & RECYCLING',
    ward: 'Ward 18',
    zone: 'Zone 02',
    relatedReports: 6,
    severity: 'MEDIUM',
    severityLabel: 'MEDIUM PRIORITY',
    department: 'Sanitation Authority',
    description: 'Commercial waste containers exceeding capacity in retail pedestrian corridor.',
    coordinates: [-73.9912, 40.7308],
    color: '#F59E0B', // Amber
    badgeBg: 'rgba(245, 158, 11, 0.16)',
    symbol: '🗑️',
    aiStatus: 'ACTIVE',
    aiSteps: ['DETECTED', 'ANALYZED', 'ROUTED', 'FIELD RESPONSE ACTIVE'],
    camera: {
      center: [-73.9912, 40.7308],
      zoom: 17.3,
      pitch: 58,
      bearing: -15,
    },
  },
  // Broken High-Mast Luminaire
  {
    id: 'inc-light',
    name: 'BROKEN STREET LIGHT',
    category: 'ELECTRICAL',
    categoryLabel: 'LIGHTING & ELECTRICAL',
    ward: 'Ward 18',
    zone: 'Zone 01',
    relatedReports: 4,
    severity: 'HIGH',
    severityLabel: 'HIGH PRIORITY',
    department: 'Electrical Bureau',
    description: 'Pedestrian crosswalk luminaire offline affecting transit avenue visibility.',
    coordinates: [-73.9890, 40.7428],
    color: '#F59E0B',
    badgeBg: 'rgba(245, 158, 11, 0.16)',
    symbol: '💡',
    aiStatus: 'ACTIVE',
    aiSteps: ['DETECTED', 'ANALYZED', 'ROUTED', 'FIELD RESPONSE ACTIVE'],
    camera: {
      center: [-73.9890, 40.7428],
      zoom: 17.4,
      pitch: 60,
      bearing: -38,
    },
  },
  // Resolved Culvert Desilting
  {
    id: 'inc-drainage',
    name: 'CULVERT DESILTING',
    category: 'DRAINAGE',
    categoryLabel: 'STORMWATER DRAINAGE',
    ward: 'Ward 18',
    zone: 'Zone 02',
    relatedReports: 11,
    severity: 'RESOLVED',
    severityLabel: 'RESOLVED',
    department: 'Drainage Authority',
    description: 'Stormwater culvert cleared and audited with post-repair telemetry imagery.',
    coordinates: [-73.9858, 40.7422],
    color: '#10B981', // Green
    badgeBg: 'rgba(16, 185, 129, 0.16)',
    symbol: '✓',
    aiStatus: 'RESOLVED',
    aiSteps: ['DETECTED', 'ANALYZED', 'ROUTED', 'FIELD RESPONSE ACTIVE'],
    camera: {
      center: [-73.9858, 40.7422],
      zoom: 17.3,
      pitch: 58,
      bearing: -20,
    },
  },
];

export function MapboxCityHero() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // Exact Initial Camera Ref (Part 5: Saved dynamically on map ready; never hardcoded separately)
  const initialCameraRef = useRef<{
    center: [number, number];
    zoom: number;
    pitch: number;
    bearing: number;
  }>({
    center: INITIAL_CAMERA.center,
    zoom: INITIAL_CAMERA.zoom,
    pitch: INITIAL_CAMERA.pitch,
    bearing: INITIAL_CAMERA.bearing,
  });

  // Track active animation callbacks to prevent race conditions or camera jerks
  const activeMoveEndListenerRef = useRef<(() => void) | null>(null);

  // Markers references for cleanup
  const landmarkMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const incidentMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const markerElementsMapRef = useRef<Map<string, HTMLElement>>(new Map());

  // Cinematic Intro State Guards (Part 6: Executes exactly once per page load)
  const hasPlayedIntroRef = useRef(false);
  const tourTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const tourActiveRef = useRef(false);

  const [tourActive, setTourActive] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);

  // Floating Tour Cards State (Part 2: Small floating panels, holds ~1.5s, then fade out)
  const [facilityStory, setFacilityStory] = useState<{
    eyebrow: string;
    name: string;
    statusLabel: string;
    statusValue: string;
    relatedCount?: number;
  } | null>(null);

  const [incidentStory, setIncidentStory] = useState<CityTourIncident | null>(null);
  const [aiActiveStepIndex, setAiActiveStepIndex] = useState<number>(0);

  // Camera Tilt Mode (Toggle between 58° oblique and 42° overhead view)
  const [isHighAngle, setIsHighAngle] = useState(false);

  const { incidents: rawIncidents, activeCount, resolvedTodayCount, aiOpsCount } = useIncidents();

  // Centralized Live Stats for Status Pill (Part 10)
  const liveStats = useMemo(() => ({
    active: activeCount,
    resolvedToday: resolvedTodayCount,
    aiOps: aiOpsCount,
  }), [activeCount, resolvedTodayCount, aiOpsCount]);

  // Map centralized incident data into digital twin 3D pins
  const activeIncidents = useMemo<CityTourIncident[]>(() => {
    if (!rawIncidents || rawIncidents.length === 0) {
      return DEFAULT_INCIDENTS;
    }

    const mapped = rawIncidents.slice(0, 7).map((inc) => {
      const isCritical = inc.severity === 'CRITICAL';
      const isHigh = inc.severity === 'HIGH';
      const isResolved = inc.status === 'RESOLVED' || inc.status === 'CLOSED';

      const color = isCritical
        ? '#EF4444' // RED
        : isHigh
          ? '#F59E0B' // AMBER
          : isResolved
            ? '#10B981' // GREEN
            : '#2878E5'; // BLUE

      const badgeBg = isCritical
        ? 'rgba(239, 68, 68, 0.18)'
        : isHigh
          ? 'rgba(245, 158, 11, 0.16)'
          : isResolved
            ? 'rgba(16, 185, 129, 0.16)'
            : 'rgba(40, 120, 229, 0.16)';

      const coords = inc.location?.coordinates || [-73.9851, 40.7484];

      return {
        id: inc.id,
        name: inc.category === 'POTHOLE' ? 'POTHOLE' : inc.category?.replace('_', ' ') || 'CIVIC DEFECT',
        category: inc.category || 'MUNICIPAL',
        categoryLabel: `${inc.category || 'CIVIC'} / MUNICIPAL`,
        ward: inc.location?.ward || 'Ward 18',
        zone: inc.location?.zone || 'Zone 01',
        relatedReports: inc.linkedReportIds?.length ? inc.linkedReportIds.length + 1 : 8,
        severity: (isResolved ? 'RESOLVED' : (inc.severity || 'MEDIUM')) as CityTourIncident['severity'],
        severityLabel: (isCritical
          ? 'CRITICAL PRIORITY'
          : isHigh
            ? 'HIGH PRIORITY'
            : isResolved
              ? 'RESOLVED'
              : inc.severity === 'LOW'
                ? 'LOW PRIORITY'
                : 'MEDIUM PRIORITY') as CityTourIncident['severityLabel'],
        department: inc.departmentId ? 'Roads Department' : 'Municipal Operations',
        description:
          inc.severityReasoning?.explanation ||
          inc.investigationSummary ||
          (inc as any).description ||
          'Civic defect verified by sensor telemetry.',
        coordinates: coords as [number, number],
        color,
        badgeBg,
        symbol: isCritical ? '⚡' : isHigh ? '⚠️' : isResolved ? '✓' : '💧',
        aiStatus: 'ACTIVE',
        aiSteps: ['DETECTED', 'ANALYZED', 'ROUTED', 'FIELD RESPONSE ACTIVE'],
        camera: {
          center: coords as [number, number],
          zoom: 17.4,
          pitch: 64,
          bearing: -20,
        },
      };
    });

    return mapped.length > 0 ? mapped : DEFAULT_INCIDENTS;
  }, [rawIncidents]);

  // Interactive Exploration State
  const [hoveredBuilding, setHoveredBuilding] = useState<{
    name: string;
    sub: string;
    activeText: string;
    resolvedText: string;
    x: number;
    y: number;
  } | null>(null);

  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'building' | 'incident';
    data: any;
  } | null>(null);

  const [hasInteracted, setHasInteracted] = useState(false);

  // Clear all tour timers cleanly
  const clearTourTimers = useCallback(() => {
    tourTimersRef.current.forEach((t) => clearTimeout(t));
    tourTimersRef.current = [];
  }, []);

  // Safe timer scheduler
  const scheduleStep = useCallback((fn: () => void, delayMs: number) => {
    const timer = setTimeout(fn, delayMs);
    tourTimersRef.current.push(timer);
    return timer;
  }, []);

  // Highlight specific marker on map
  const setMarkerFocused = useCallback((incidentId: string | null) => {
    markerElementsMapRef.current.forEach((el, id) => {
      if (id === incidentId) {
        el.classList.add('civic-marker-focused');
      } else {
        el.classList.remove('civic-marker-focused');
      }
    });
  }, []);

  // Helper to re-enable user map interactions (Part 7)
  const enableMapInteractions = useCallback((map: mapboxgl.Map) => {
    map.boxZoom.enable();
    map.doubleClickZoom.enable();
    map.dragPan.enable();
    map.dragRotate.enable();
    map.keyboard.enable();
    map.scrollZoom.enable();
    map.touchZoomRotate.enable();
  }, []);

  // Helper to temporarily disable map interactions during intro (Part 4 & Part 6)
  const disableMapInteractions = useCallback((map: mapboxgl.Map) => {
    map.boxZoom.disable();
    map.doubleClickZoom.disable();
    map.dragPan.disable();
    map.dragRotate.disable();
    map.keyboard.disable();
    map.scrollZoom.disable();
    map.touchZoomRotate.disable();
  }, []);

  // Skip Tour handler: smoothly ends the sequence and hands control to user
  const handleSkipTour = useCallback(() => {
    clearTourTimers();

    if (mapRef.current && activeMoveEndListenerRef.current) {
      mapRef.current.off('moveend', activeMoveEndListenerRef.current);
      activeMoveEndListenerRef.current = null;
    }

    setMarkerFocused(null);
    setFacilityStory(null);
    setIncidentStory(null);
    setTourActive(false);
    tourActiveRef.current = false;
    setTourCompleted(true);
    hasPlayedIntroRef.current = true;

    if (mapRef.current) {
      enableMapInteractions(mapRef.current);
      mapRef.current.easeTo({
        center: initialCameraRef.current.center,
        zoom: initialCameraRef.current.zoom,
        pitch: initialCameraRef.current.pitch,
        bearing: initialCameraRef.current.bearing,
        duration: 1000,
      });
    }

    try {
      sessionStorage.setItem('civicpulse_hero_intro_played', '1');
    } catch {
      // Storage fallback
    }
  }, [clearTourTimers, setMarkerFocused, enableMapInteractions]);



  // Sync Markers to the Map (Part 8: Small core + subtle halo + gentle pulse; no giant polygons)
  const renderMapMarkers = useCallback(
    (map: mapboxgl.Map, incidents: CityTourIncident[]) => {
      // 1. Clear existing markers
      landmarkMarkersRef.current.forEach((m) => m.remove());
      landmarkMarkersRef.current = [];
      incidentMarkersRef.current.forEach((m) => m.remove());
      incidentMarkersRef.current = [];
      markerElementsMapRef.current.clear();

      // 2. Render Minimal Civic Facility / Landmark Badges
      CIVIC_FACILITIES.forEach((lm) => {
        const el = document.createElement('div');
        el.className = 'landmark-marker cursor-pointer select-none';
        el.style.transform = 'translate(-50%, -50%)';

        el.innerHTML = `
          <div class="civic-landmark-badge">
            <span style="font-size: 11px;">${lm.icon}</span>
            <span>${lm.name.toUpperCase()}</span>
          </div>
        `;

        el.addEventListener('click', (ev) => {
          ev.stopPropagation();
          if (tourActiveRef.current) handleSkipTour();
          setSelectedEntity({ type: 'building', data: lm });
          setHoveredBuilding(null);

          map.easeTo({
            center: lm.coordinates,
            zoom: 17.2,
            pitch: 60,
            bearing: -22,
            duration: 1100,
          });
        });

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat(lm.coordinates)
          .addTo(map);

        landmarkMarkersRef.current.push(marker);
      });

      // 3. Render High-End Physical 3D Pin Incident Markers
      // Part 8: Small core + subtle halo + gentle pulse. No giant polygons.
      incidents.forEach((inc) => {
        const markerWrap = document.createElement('div');
        markerWrap.className = 'civic-incident-marker cursor-pointer select-none';
        markerWrap.id = `marker-${inc.id}`;
        markerWrap.style.transform = 'translate(-50%, -100%)'; // Anchor pin tip directly to street coordinate

        markerWrap.innerHTML = `
          <div class="marker-container" style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; width: 40px; height: 48px;">
            <!-- Ground Contact Shadow -->
            <div class="civic-ground-shadow"></div>

            <!-- Focus Ring for high-priority / active focus -->
            <div class="civic-focus-ring" style="border-color: ${inc.color}99;"></div>

            <!-- Outer Concentric Pulse Halo Ring -->
            <div class="civic-marker-ring" style="position: absolute; top: 6px; width: 30px; height: 30px; border-radius: 9999px; background-color: ${inc.color}; opacity: 0.28;"></div>
            
            <!-- Core Physical 3D Pin with Ground Tip (Small core, subtle depth) -->
            <div class="marker-core-pin" style="position: relative; display: flex; flex-direction: column; align-items: center; transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); filter: drop-shadow(0 4px 6px rgba(16,42,67,0.3));">
              <div style="width: 20px; height: 20px; border-radius: 9999px; background: linear-gradient(135deg, ${inc.color} 0%, ${inc.color}dd 100%); border: 2px solid #FFFFFF; box-shadow: 0 3px 8px rgba(16, 42, 67, 0.25), inset 0 1px 2px rgba(255,255,255,0.6); display: flex; align-items: center; justify-content: center; font-size: 9.5px; color: #FFFFFF; font-weight: bold;">
                ${inc.symbol}
              </div>
              <div style="width: 0; height: 0; border-left: 3px solid transparent; border-right: 3px solid transparent; border-top: 4px solid ${inc.color}; margin-top: -1px;"></div>
            </div>

            <!-- Compact Hover Tooltip -->
            <div class="marker-tooltip" style="position: absolute; bottom: 42px; left: 50%; transform: translateX(-50%); background: rgba(16, 42, 67, 0.95); backdrop-filter: blur(8px); color: #FFFFFF; font-size: 9.5px; font-weight: 700; padding: 3px 8px; border-radius: 6px; white-space: nowrap; pointer-events: none; opacity: 0; transition: opacity 0.15s ease-out; font-family: 'Sora', sans-serif; box-shadow: 0 4px 14px rgba(0,0,0,0.22); border: 1px solid rgba(255,255,255,0.15);">
              ${inc.name} · ${inc.severityLabel}
            </div>
          </div>
        `;

        markerWrap.addEventListener('mouseenter', () => {
          const tt = markerWrap.querySelector('.marker-tooltip') as HTMLElement;
          if (tt) tt.style.opacity = '1';
        });

        markerWrap.addEventListener('mouseleave', () => {
          const tt = markerWrap.querySelector('.marker-tooltip') as HTMLElement;
          if (tt) tt.style.opacity = '0';
        });

        markerWrap.addEventListener('click', (ev) => {
          ev.stopPropagation();
          if (tourActiveRef.current) handleSkipTour();
          setSelectedEntity({ type: 'incident', data: inc });
          setHoveredBuilding(null);
          setMarkerFocused(inc.id);

          map.easeTo({
            center: inc.coordinates,
            zoom: 17.5,
            pitch: 62,
            bearing: inc.camera?.bearing || -24,
            duration: 1100,
          });
        });

        markerElementsMapRef.current.set(inc.id, markerWrap);

        const marker = new mapboxgl.Marker({ element: markerWrap })
          .setLngLat(inc.coordinates)
          .addTo(map);

        incidentMarkersRef.current.push(marker);
      });
    },
    [handleSkipTour, setMarkerFocused]
  );

  // Update markers when activeIncidents change
  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      renderMapMarkers(mapRef.current, activeIncidents);
    }
  }, [activeIncidents, renderMapMarkers]);

  // Helper function to execute smooth camera flyTo and trigger onComplete strictly upon animation finish (Part 4)
  const flyToWithControlledCompletion = useCallback(
    (
      map: mapboxgl.Map,
      options: Parameters<mapboxgl.Map['flyTo']>[0],
      onComplete: () => void
    ) => {
      if (!tourActiveRef.current) return;

      const handleMoveEnd = () => {
        map.off('moveend', handleMoveEnd);
        activeMoveEndListenerRef.current = null;
        if (!tourActiveRef.current) return;
        onComplete();
      };

      map.once('moveend', handleMoveEnd);
      activeMoveEndListenerRef.current = handleMoveEnd;

      map.flyTo({
        ...options,
        essential: true,
      });
    },
    []
  );

  /**
   * =========================================================================
   * PART 2, 3, 4 — MULTI-STOP CINEMATIC SEQUENCE CONTROLLER
   * =========================================================================
   * Prevents camera jerks by sequencing transitions ONLY on Mapbox moveend!
   * STOP 1: Central Operations Hall (2500–3200ms flight, 1500–1800ms hold)
   * STOP 2: Water Distribution Station (2500–3200ms flight, 1500–1800ms hold)
   * STOP 3: High Priority Incident (2800–3500ms flight, 2000ms hold)
   * RETURN: Smooth pull back to original camera (3000–4000ms)
   * USER CONTROL: Enables interactions, sets hasPlayedIntro = true
   */
  const startCinematicTour = useCallback(
    (map: mapboxgl.Map, incidents: CityTourIncident[]) => {
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) {
        hasPlayedIntroRef.current = true;
        setTourActive(false);
        tourActiveRef.current = false;
        setTourCompleted(true);
        enableMapInteractions(map);
        return;
      }

      hasPlayedIntroRef.current = true;
      tourActiveRef.current = true;
      setTourActive(true);
      disableMapInteractions(map);

      const inc1 = incidents[0] || DEFAULT_INCIDENTS[0];
      const inc2 = incidents[1] || DEFAULT_INCIDENTS[1];

      // STEP 1: Start with wide city view (Hold for 1000ms)
      scheduleStep(() => {
        if (!tourActiveRef.current) return;

        // STEP 2: Smoothly fly toward incident #1 (2200ms)
        flyToWithControlledCompletion(
          map,
          {
            center: inc1.coordinates,
            zoom: 17.4,
            pitch: 62,
            bearing: inc1.camera?.bearing || -20,
            duration: 2200,
            curve: 1.4,
          },
          () => {
            // STEP 3: Briefly focus on incident #1 (Hold 1400ms)
            setIncidentStory(inc1);
            setMarkerFocused(inc1.id);

            scheduleStep(() => {
              if (!tourActiveRef.current) return;
              setIncidentStory(null);
              setMarkerFocused(null);

              // STEP 4: Pull back camera (1600ms)
              flyToWithControlledCompletion(
                map,
                {
                  center: initialCameraRef.current.center,
                  zoom: 16.4,
                  pitch: 56,
                  bearing: -28,
                  duration: 1600,
                  curve: 1.3,
                },
                () => {
                  // STEP 5: Smoothly fly toward incident #2 (2200ms)
                  flyToWithControlledCompletion(
                    map,
                    {
                      center: inc2.coordinates,
                      zoom: 17.3,
                      pitch: 62,
                      bearing: inc2.camera?.bearing || -24,
                      duration: 2200,
                      curve: 1.4,
                    },
                    () => {
                      // STEP 6: Briefly focus on incident #2 (Hold 1400ms)
                      setIncidentStory(inc2);
                      setMarkerFocused(inc2.id);

                      scheduleStep(() => {
                        if (!tourActiveRef.current) return;
                        setIncidentStory(null);
                        setMarkerFocused(null);

                        // STEP 7: Return to normal hero view (2000ms)
                        flyToWithControlledCompletion(
                          map,
                          {
                            center: initialCameraRef.current.center,
                            zoom: initialCameraRef.current.zoom,
                            pitch: initialCameraRef.current.pitch,
                            bearing: initialCameraRef.current.bearing,
                            duration: 2000,
                            curve: 1.4,
                          },
                          () => {
                            setTourActive(false);
                            tourActiveRef.current = false;
                            setTourCompleted(true);
                            enableMapInteractions(map);

                            try {
                              sessionStorage.setItem('civicpulse_hero_intro_played', '1');
                            } catch {
                              // Storage fallback
                            }
                          }
                        );
                      }, 1400);
                    }
                  );
                }
              );
            }, 1400);
          }
        );
      }, 1000);
    },
    [disableMapInteractions, enableMapInteractions, flyToWithControlledCompletion, scheduleStep, setMarkerFocused]
  );

  // Initialize Mapbox GL JS v3 with Mapbox Standard & Realistic Lighting/Terrain
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let alreadyRun = false;
    try {
      alreadyRun =
        hasPlayedIntroRef.current ||
        sessionStorage.getItem('civicpulse_hero_intro_played') === '1';
    } catch {
      alreadyRun = hasPlayedIntroRef.current;
    }

    let map: mapboxgl.Map | null = null;

    try {
      // 1. Initialize Mapbox Map with Standard 3D Basemap
      map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/standard',
        center: INITIAL_CAMERA.center,
        zoom: INITIAL_CAMERA.zoom,
        pitch: INITIAL_CAMERA.pitch,
        bearing: INITIAL_CAMERA.bearing,
        antialias: true,
        attributionControl: false,
      });

      mapRef.current = map;

      // Save exact initial camera state (Part 5: Saved on map ready; never hardcoded separately)
      initialCameraRef.current = {
        center: INITIAL_CAMERA.center,
        zoom: INITIAL_CAMERA.zoom,
        pitch: INITIAL_CAMERA.pitch,
        bearing: INITIAL_CAMERA.bearing,
      };

      map.on('style.load', () => {
        if (!map) return;

        // PART 1: MAKE THE CITY REALISTIC (BUILDINGS, ENVIRONMENT & LANDMARKS)
        try {
          // Set standard default theme for full natural color palette (green parks, dark roads, blue water)
          map.setConfigProperty('basemap', 'theme', 'default');
          map.setConfigProperty('basemap', 'lightPreset', 'day');

          // Enable 3D features: objects, landmarks, trees, facades
          map.setConfigProperty('basemap', 'show3dObjects', true);
          map.setConfigProperty('basemap', 'show3dLandmarks', true);
          map.setConfigProperty('basemap', 'show3dBuildings', true);
          map.setConfigProperty('basemap', 'show3dTrees', true);
          map.setConfigProperty('basemap', 'show3dFacades', true);

          // PART 9: REDUCE POI CLUTTER — remove restaurants, banks, hotels, shops
          map.setConfigProperty('basemap', 'showPointOfInterestLabels', false);
          map.setConfigProperty('basemap', 'showTransitLabels', false);
          map.setConfigProperty('basemap', 'showPlaceLabels', true);
          map.setConfigProperty('basemap', 'showRoadLabels', true);
          map.setConfigProperty('basemap', 'showPedestrianRoads', true);

          // Building interactive colors
          map.setConfigProperty('basemap', 'colorBuildingHighlight', '#2878E5');
          map.setConfigProperty('basemap', 'colorBuildingSelect', '#159A68');
        } catch (err) {
          console.warn('[MapboxCityHero] Standard config property notice:', err);
        }

        // PART 1: SUBTLE 3D TERRAIN
        try {
          if (!map.getSource('mapbox-dem')) {
            map.addSource('mapbox-dem', {
              type: 'raster-dem',
              url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
              tileSize: 512,
              maxzoom: 14,
            });
          }
          map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.15 });
        } catch (err) {
          console.warn('[MapboxCityHero] 3D terrain notice:', err);
        }

        // PART 1: REALISTIC DAYTIME LIGHTING & FACET CONTRAST
        // Low ambient (0.28) + strong directional sun (0.95) with shadow-intensity (0.72)
        // eliminates flat beige blocks and creates visible architectural facet depth!
        try {
          map.setLights([
            {
              id: 'ambient_light',
              type: 'ambient',
              properties: {
                color: '#DCE8F5', // Cool ambient sky reflection
                intensity: 0.28,   // Low ambient intensity creates strong face-to-face contrast
              },
            },
            {
              id: 'sun_light',
              type: 'directional',
              properties: {
                color: '#FFF6E8', // Warm natural afternoon sunlight
                intensity: 0.95,  // Strong natural sun highlights
                'cast-shadows': true,
                direction: [218, 40], // SW azimuth 218°, 40° elevation creates clear building side shadows
                'shadow-intensity': 0.72, // Distinct, realistic shadows grounding buildings
              },
            },
          ]);
        } catch {
          // Handled by standard lightPreset
        }

        // PART 1: NATURAL DAYLIGHT ATMOSPHERE & HORIZON SEPARATION
        try {
          map.setFog({
            range: [1.2, 14],
            color: '#D4E6F5', // Natural daylight blue at horizon
            'high-color': '#7EB2E6', // Clean upper troposphere
            'horizon-blend': 0.03, // Crisp horizon separation
            'space-color': '#0B1628',
            'star-intensity': 0,
          });
        } catch (err) {
          console.warn('[MapboxCityHero] Fog notice:', err);
        }

        // Render Markers
        renderMapMarkers(map, activeIncidents);

        // START ONE-TIME MULTI-STOP CINEMATIC TOUR SEQUENCE (Part 2, 3, 4, 6)
        if (!alreadyRun) {
          startCinematicTour(map, activeIncidents);
        } else {
          setTourActive(false);
          tourActiveRef.current = false;
          setTourCompleted(true);
          enableMapInteractions(map);
        }
      });

      // NATIVE 3D BUILDING & LANDMARK HOVER DETECTION
      map.on('mousemove', (e) => {
        if (!map || tourActiveRef.current) return;
        const pt = e.point;

        // Check if cursor is over any landmark
        let matchedLandmark: CivicLandmark | null = null;
        for (const lm of CIVIC_FACILITIES) {
          const pixel = map.project(lm.coordinates);
          const dist = Math.hypot(pixel.x - pt.x, pixel.y - pt.y);
          if (dist < 32) {
            matchedLandmark = lm;
            break;
          }
        }

        if (matchedLandmark) {
          map.getCanvas().style.cursor = 'pointer';
          const pixel = map.project(matchedLandmark.coordinates);
          setHoveredBuilding({
            name: matchedLandmark.name.toUpperCase(),
            sub: `${matchedLandmark.category} · ${matchedLandmark.ward}`,
            activeText: `${matchedLandmark.activeCount} active incidents`,
            resolvedText: `${matchedLandmark.resolvedToday} resolved today`,
            x: pixel.x,
            y: pixel.y,
          });
          return;
        }

        // Query native Mapbox 3D building layers
        const features = map.queryRenderedFeatures(e.point);
        const buildingFeature = features.find(
          (f) =>
            f.layer &&
            (f.layer.id.includes('building') ||
              f.layer.id.includes('landmark') ||
              f.layer.type === 'fill-extrusion' ||
              f.layer.type === 'model')
        );

        if (buildingFeature) {
          map.getCanvas().style.cursor = 'pointer';
          const name =
            buildingFeature.properties?.name ||
            buildingFeature.properties?.['name:en'] ||
            buildingFeature.properties?.type ||
            'MUNICIPAL URBAN ASSET';

          setHoveredBuilding({
            name: String(name).toUpperCase(),
            sub: 'Civic District · Digital Twin Grid',
            activeText: 'Monitored asset',
            resolvedText: 'Status: Operational',
            x: pt.x,
            y: pt.y,
          });
        } else {
          map.getCanvas().style.cursor = '';
          setHoveredBuilding(null);
        }
      });

      map.on('mouseleave', () => {
        if (map) map.getCanvas().style.cursor = '';
        setHoveredBuilding(null);
      });

      // Map Click for Building inspection
      map.on('click', (e) => {
        if (!map) return;
        if (tourActiveRef.current) {
          handleSkipTour();
          return;
        }

        const features = map.queryRenderedFeatures(e.point);
        const buildingFeature = features.find(
          (f) =>
            f.layer &&
            (f.layer.id.includes('building') ||
              f.layer.id.includes('landmark') ||
              f.layer.type === 'fill-extrusion' ||
              f.layer.type === 'model')
        );

        if (buildingFeature) {
          const name =
            buildingFeature.properties?.name ||
            buildingFeature.properties?.['name:en'] ||
            buildingFeature.properties?.type ||
            'CIVIC INFRASTRUCTURE BLOCK';

          setSelectedEntity({
            type: 'building',
            data: {
              id: 'bld-selected',
              name: String(name).toUpperCase(),
              category: 'Municipal Structure',
              zone: 'Zone 01',
              ward: 'Ward 18',
              activeCount: 1,
              resolvedToday: 3,
              status: 'Operational',
              description:
                'Integrated structural asset in the municipal digital twin grid with real-time incident and sensor telemetry.',
            },
          });
          setHoveredBuilding(null);
        }
      });

      // User interaction listener
      map.on('dragstart', () => setHasInteracted(true));
      map.on('zoomstart', () => setHasInteracted(true));
      map.on('rotatestart', () => setHasInteracted(true));
    } catch (err) {
      console.error('[MapboxCityHero] Mapbox init notice:', err);
    }

    return () => {
      clearTourTimers();
      if (mapRef.current && activeMoveEndListenerRef.current) {
        mapRef.current.off('moveend', activeMoveEndListenerRef.current);
      }
      if (map) map.remove();
    };
  }, [handleSkipTour, clearTourTimers, renderMapMarkers, enableMapInteractions, startCinematicTour]);

  // Camera Controls
  const handleResetCamera = () => {
    mapRef.current?.easeTo({
      center: initialCameraRef.current.center,
      zoom: initialCameraRef.current.zoom,
      pitch: initialCameraRef.current.pitch,
      bearing: initialCameraRef.current.bearing,
      duration: 1100,
    });
    setSelectedEntity(null);
    setMarkerFocused(null);
    setIsHighAngle(false);
  };

  const handleToggleTilt = () => {
    const nextAngle = !isHighAngle;
    setIsHighAngle(nextAngle);
    mapRef.current?.easeTo({
      pitch: nextAngle ? 42 : 58,
      duration: 800,
    });
  };

  const handleZoomIn = () => {
    mapRef.current?.zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut({ duration: 300 });
  };

  const handleExploreCity = () => {
    if (tourActive) {
      handleSkipTour();
    } else {
      mapRef.current?.easeTo({
        center: INITIAL_CAMERA.center,
        zoom: INITIAL_CAMERA.zoom + 0.9,
        pitch: 62,
        bearing: INITIAL_CAMERA.bearing - 15,
        duration: 1200,
      });
    }
  };

  return (
    <section
      id="hero"
      className="relative w-full h-[90vh] min-h-[700px] max-h-[1050px] bg-[#0B1628] overflow-hidden select-none"
    >
      {/* 1. Full-Screen 3D City Viewport (100% Viewport) */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

      {/* 2. SUBTLE INTRO INDICATOR (Shown ONLY while cinematic sequence is active) */}
      {tourActive && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in fade-in duration-300">
          <div className="bg-white/92 backdrop-blur-md border border-[#102A43]/10 px-4 py-1.5 rounded-full shadow-md flex items-center gap-2 text-xs font-semibold text-[#102A43]">
            <span className="w-2 h-2 rounded-full bg-[#159A68] animate-pulse" />
            <span className="text-[10px] tracking-wider font-bold font-heading uppercase text-[#102A43]">
              LIVE CITY
            </span>
            <span className="text-[#829AB1]">·</span>
            <span className="text-[9.5px] text-[#526777] font-medium tracking-wide uppercase font-heading">
              INITIALIZING DIGITAL TWIN
            </span>
          </div>
        </div>
      )}

      {/* 3. SKIP INTRO BUTTON (Subtle, top-right during tour) */}
      {tourActive && (
        <div className="absolute top-6 right-6 z-30 flex items-center gap-2">
          <button
            onClick={handleSkipTour}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/92 hover:bg-white text-[#102A43] hover:text-[#159A68] border border-[#102A43]/12 shadow-sm text-xs font-semibold transition-all group"
            title="Skip Tour and take manual control"
          >
            <span>Skip Tour</span>
            <FastForward className="w-3 h-3 text-[#526777] group-hover:text-[#159A68] transition-colors" />
          </button>
        </div>
      )}

      {/* 4. EDITORIAL HERO OVERLAY (Small, non-intrusive; city dominates 85-90% of screen) */}
      {!tourActive && (
        <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-20 pointer-events-none max-w-sm text-left animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="pointer-events-auto bg-white/92 backdrop-blur-xl border border-[#102A43]/[0.08] p-5 sm:p-6 rounded-2xl shadow-xl shadow-[#102A43]/[0.06] space-y-3">
            {/* Synthetic Urban Digital Twin Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E7F7F0] border border-[#159A68]/20 text-[#159A68] text-[9.5px] font-bold tracking-wider uppercase font-heading">
              <span className="w-1.5 h-1.5 rounded-full bg-[#159A68] animate-pulse" />
              <span>SYNTHETIC URBAN DIGITAL TWIN</span>
            </div>

            {/* Editorial Headline */}
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#102A43] font-heading tracking-tight leading-snug">
              Your city. <br />
              <span className="text-[#159A68]">Understood. Acted on. Verified.</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-xs sm:text-sm text-[#526777] font-sans leading-relaxed">
              AI agents turn civic reports into coordinated, verified action.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-1">
              <Link to="/citizen/report">
                <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#159A68] hover:bg-[#128358] text-white text-xs font-semibold shadow-sm transition-all duration-150">
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Report a Problem</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </Link>

              <button
                onClick={handleExploreCity}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FAF8F5] hover:bg-white border border-[#102A43]/10 text-[#102A43] text-xs font-semibold shadow-xs transition-all"
              >
                <Compass className="w-3.5 h-3.5 text-[#2878E5]" />
                <span>Explore the City</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. PART 10: COMPACT LIVE CITY STATUS PILL (Top Right) */}
      {!tourActive && (
        <div className="absolute top-6 right-6 z-20 pointer-events-none flex items-center gap-2 animate-in fade-in duration-300">
          <div className="pointer-events-auto bg-white/92 backdrop-blur-xl border border-[#102A43]/[0.08] px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-2.5 text-xs font-medium text-[#102A43]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#159A68] animate-pulse" />
              <span className="font-bold font-heading text-[10.5px] tracking-wide text-[#102A43]">
                CITY LIVE
              </span>
            </div>
            <span className="text-[#CBD5E1]">|</span>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#EF4444] font-bold font-heading">{liveStats.active}</span>
              <span className="text-[#526777] text-[10.5px]">active</span>
              <span className="text-[#829AB1]">•</span>
              <span className="text-[#10B981] font-bold font-heading">{liveStats.resolvedToday}</span>
              <span className="text-[#526777] text-[10.5px]">resolved</span>
              <span className="text-[#829AB1]">•</span>
              <span className="text-[#2878E5] font-bold font-heading">{liveStats.aiOps}</span>
              <span className="text-[#526777] text-[10.5px]">AI ops</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. PART 2: COMPACT FLOATING PANEL (STOPS 1 & 2: Holds ~1.5s, then fades out smoothly) */}
      {tourActive && facilityStory && (
        <div className="absolute top-20 right-6 sm:right-8 z-30 w-64 max-w-[85vw] bg-white/94 backdrop-blur-xl border border-[#102A43]/10 rounded-2xl p-4 shadow-xl animate-in fade-in slide-in-from-right-3 duration-300 text-left transition-opacity duration-300">
          <div className="pb-1.5 border-b border-[#102A43]/[0.06]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#526777] font-heading">
              {facilityStory.eyebrow}
            </span>
          </div>
          <div className="pt-2 pb-2">
            <h3 className="font-heading font-extrabold text-sm text-[#102A43] leading-snug">
              {facilityStory.name}
            </h3>
          </div>
          <div className="pt-2 border-t border-[#102A43]/[0.06] space-y-1 text-[11px]">
            <div className="flex items-center justify-between text-[#526777]">
              <span>{facilityStory.statusLabel}</span>
              <strong className="text-[#159A68] font-heading flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#159A68] animate-pulse" />
                {facilityStory.statusValue}
              </strong>
            </div>
            {facilityStory.relatedCount !== undefined && (
              <div className="flex items-center justify-between text-[#526777]">
                <span>Related incidents</span>
                <strong className="text-[#EF4444] font-heading">{facilityStory.relatedCount}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. PART 2: STOP 3 HIGH-PRIORITY INCIDENT PANEL WITH REAL AI SEQUENCE */}
      {tourActive && incidentStory && (
        <div className="absolute top-20 right-6 sm:right-8 z-30 w-72 max-w-[85vw] bg-white/95 backdrop-blur-xl border border-[#102A43]/12 rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-right-3 duration-300 text-left transition-opacity duration-300">
          <div className="pb-1.5 border-b border-[#102A43]/[0.06]">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#EF4444] font-heading">
              {incidentStory.severity === 'CRITICAL' ? 'CRITICAL PRIORITY' : 'HIGH PRIORITY'}
            </span>
          </div>

          <div className="pt-2 pb-1.5">
            <h3 className="font-heading font-extrabold text-sm text-[#102A43] leading-snug">
              {incidentStory.name}
            </h3>
            <p className="text-[10.5px] text-[#526777] mt-0.5">
              {incidentStory.ward}
            </p>
          </div>

          <div className="py-2 border-t border-b border-[#102A43]/[0.06] space-y-1 text-[11px] text-[#526777]">
            <div className="flex items-center justify-between">
              <span>{incidentStory.relatedReports} citizen reports</span>
            </div>
            <div className="flex items-center justify-between">
              <span>AI investigation</span>
              <strong className="text-[#159A68] font-heading flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#159A68] animate-pulse" />
                ACTIVE
              </strong>
            </div>
          </div>

          {/* Real AI Response Sequence (DETECTED ✓ -> ANALYZED ✓ -> ROUTED ✓ -> FIELD RESPONSE ACTIVE) */}
          <div className="pt-2.5">
            <div className="grid grid-cols-4 gap-1">
              {incidentStory.aiSteps.map((step, idx) => {
                const isPassed = idx < aiActiveStepIndex;
                const isCurrent = idx === aiActiveStepIndex;
                return (
                  <div
                    key={step}
                    className={`py-1 px-0.5 rounded text-center transition-all duration-200 border ${isCurrent
                        ? 'bg-[#159A68] text-white border-[#159A68] shadow-xs font-bold scale-[1.03]'
                        : isPassed
                          ? 'bg-[#E7F7F0] text-[#159A68] border-[#159A68]/30 font-semibold'
                          : 'bg-[#F1F5F9] text-[#829AB1] border-transparent font-medium'
                      }`}
                  >
                    <div className="text-[7px] uppercase tracking-tight truncate">
                      {isPassed ? `✓ ${step}` : step}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 8. SINGLE BUILDING HOVER TOOLTIP */}
      {hoveredBuilding && !selectedEntity && !tourActive && (
        <div
          className="absolute z-30 pointer-events-none bg-white/95 backdrop-blur-md border border-[#102A43]/12 rounded-xl px-3 py-2 shadow-xl text-left transition-all duration-75"
          style={{
            left: `${hoveredBuilding.x + 14}px`,
            top: `${hoveredBuilding.y - 14}px`,
            transform: 'translateY(-100%)',
          }}
        >
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#2878E5]" />
            <span className="font-heading font-extrabold text-xs text-[#102A43]">
              {hoveredBuilding.name}
            </span>
          </div>
          <div className="text-[10px] text-[#526777] mt-0.5 font-medium">
            {hoveredBuilding.sub}
          </div>
          <div className="mt-1 pt-1 border-t border-[#102A43]/[0.08] flex items-center gap-2.5 text-[10px] font-semibold">
            <span className="text-[#EF6A63]">{hoveredBuilding.activeText}</span>
            <span className="text-[#10B981]">{hoveredBuilding.resolvedText}</span>
          </div>
        </div>
      )}

      {/* 9. INTERACTIVE CLICK DETAIL PANEL (Appears ONLY on user click) */}
      {selectedEntity && !tourActive && (
        <div className="absolute top-20 right-6 z-30 w-76 max-w-[85vw] bg-white/95 backdrop-blur-2xl border border-[#102A43]/15 rounded-3xl p-5 shadow-2xl animate-in fade-in slide-in-from-right-4 duration-200 text-left">
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#102A43]/[0.08]">
            <div>
              <span
                className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase mb-1 font-heading"
                style={{
                  backgroundColor:
                    selectedEntity.type === 'incident'
                      ? selectedEntity.data.badgeBg
                      : '#EBF3FD',
                  color:
                    selectedEntity.type === 'incident'
                      ? selectedEntity.data.color
                      : '#2878E5',
                }}
              >
                {selectedEntity.type === 'incident'
                  ? selectedEntity.data.severityLabel
                  : selectedEntity.data.category}
              </span>
              <h2 className="font-heading font-extrabold text-base text-[#102A43] leading-tight">
                {selectedEntity.data.name}
              </h2>
              <p className="text-xs text-[#526777] font-medium mt-0.5">
                {selectedEntity.data.zone} · {selectedEntity.data.ward}
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedEntity(null);
                setMarkerFocused(null);
              }}
              className="p-1 hover:bg-[#EEF4F7] rounded-lg text-[#526777] transition-colors"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3.5 space-y-2.5 font-sans">
            <p className="text-xs text-[#526777] leading-relaxed">
              {selectedEntity.data.description}
            </p>

            {selectedEntity.type === 'building' ? (
              <div className="space-y-1.5 pt-2 border-t border-[#102A43]/[0.06] text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#829AB1]">ACTIVE INCIDENTS:</span>
                  <span className="font-bold text-[#EF6A63]">
                    {selectedEntity.data.activeCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#829AB1]">RESOLVED TODAY:</span>
                  <span className="font-bold text-[#10B981]">
                    {selectedEntity.data.resolvedToday}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#829AB1]">CURRENT STATUS:</span>
                  <span className="font-bold text-[#159A68]">
                    {selectedEntity.data.statusText || selectedEntity.data.status}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 pt-2 border-t border-[#102A43]/[0.06] text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#829AB1]">CITIZEN SIGNALS:</span>
                  <span className="font-bold text-[#102A43]">
                    {selectedEntity.data.relatedReports} Reports
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#829AB1]">ASSIGNED DEPARTMENT:</span>
                  <span className="font-bold text-[#159A68]">
                    {selectedEntity.data.department || 'Municipal Operations'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            {selectedEntity.type === 'building' ? (
              <button
                onClick={() => setSelectedEntity(null)}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#159A68] hover:bg-[#128358] text-white text-xs font-semibold shadow-sm transition-all"
              >
                <span>Explore Surrounding Area</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <Link to="/citizen/report">
                <button className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#159A68] hover:bg-[#128358] text-white text-xs font-semibold shadow-sm transition-all">
                  <span>View Incident Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* 10. FLOATING CAMERA CONTROLS (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-1.5 bg-white/92 backdrop-blur-md p-1.5 rounded-2xl border border-[#102A43]/10 shadow-md">
        <button
          onClick={handleResetCamera}
          className="p-2 text-[#526777] hover:text-[#159A68] hover:bg-[#EEF4F7] rounded-xl transition-colors"
          title="Reset Camera View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleToggleTilt}
          className="p-2 text-[#526777] hover:text-[#159A68] hover:bg-[#EEF4F7] rounded-xl transition-colors"
          title={isHighAngle ? 'Switch to Oblique 3D Angle' : 'Switch to High Angle'}
        >
          <Compass className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleZoomIn}
          className="p-2 text-[#526777] hover:text-[#159A68] hover:bg-[#EEF4F7] rounded-xl transition-colors"
          title="Zoom In"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 text-[#526777] hover:text-[#159A68] hover:bg-[#EEF4F7] rounded-xl transition-colors"
          title="Zoom Out"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 11. BOTTOM INTERACTION HINT (Fades out when user interacts) */}
      {!hasInteracted && !tourActive && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-opacity duration-300">
          <div className="bg-white/90 backdrop-blur-md border border-[#102A43]/10 px-4 py-1.5 rounded-full shadow-sm text-center">
            <span className="text-[10px] text-[#526777] font-semibold">
              REALISTIC DIGITAL TWIN · Drag to pan · Scroll to zoom · Click buildings or incidents to inspect
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

export default MapboxCityHero;
