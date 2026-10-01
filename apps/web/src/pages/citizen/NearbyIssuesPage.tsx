import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import { incidentService, getIncidentTitle } from '@/services/incidentService';
import { StatusBadge, SeverityBadge } from '@/components/ui/Badge';
import { Incident } from '@civicpulse/shared';
import {
  CitizenContentContainer,
  CitizenErrorState,
  CitizenPageHeader,
} from '@/components/citizen/CitizenContentContainer';
import { CitizenPagination } from '@/components/citizen/CitizenPagination';
import {
  LuMapPin,
  LuCrosshair,
  LuArrowRight,
  LuClock,
  LuFilter,
  LuRefreshCw,
  LuCompass,
  LuCheck,
  LuPlus,
  LuMinus,
  LuX,
  LuShieldAlert,
  LuLoader
} from 'react-icons/lu';
import { cn } from '@/lib/utils';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';
if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

// Municipal Coordinates for Hosur Wards
const WARD_COORDINATES: Record<string, { lat: number; lng: number; name: string }> = {
  'Ward 12 - Central Hosur': { lat: 12.7375, lng: 77.8285, name: 'Central Hosur (Bus Stand)' },
  'Ward 08 - Bagalur Road Corridor': { lat: 12.742, lng: 77.835, name: 'Bagalur Road Corridor' },
  'Ward 05 - SIPCOT Industrial Complex': { lat: 12.721, lng: 77.815, name: 'SIPCOT Industrial Complex' },
  'Ward 03 - Mookandapalli': { lat: 12.751, lng: 77.808, name: 'Mookandapalli Hub' },
  'Ward 01 - Mathigiri': { lat: 12.715, lng: 77.842, name: 'Mathigiri Market' },
};

// Subtle Ward 12 Geographic Perimeter GeoJSON
const WARD_12_BOUNDARY: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Ward 12 - Central Hosur' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [77.818, 12.728],
            [77.842, 12.728],
            [77.848, 12.746],
            [77.835, 12.752],
            [77.815, 12.742],
            [77.818, 12.728],
          ],
        ],
      },
    },
  ],
};

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
}

function getMarkerColor(incident: Incident): string {
  if (incident.status === 'RESOLVED' || incident.status === 'CLOSED') {
    return '#36B37E'; // Green
  }
  if (incident.severity === 'CRITICAL' || incident.severity === 'HIGH') {
    return '#EF6A63'; // Coral / Red
  }
  if (incident.severity === 'MEDIUM') {
    return '#F2B84B'; // Amber
  }
  return '#2878E5'; // Civic Blue
}

interface OutletContextType {
  currentWard?: string;
  onWardChange?: (ward: string) => void;
}

interface MarkerRecord {
  marker: mapboxgl.Marker;
  containerEl: HTMLElement;
  pinEl: HTMLElement;
  haloEl: HTMLElement;
  pulseEl: HTMLElement;
}

export function NearbyIssuesPage() {
  const navigate = useNavigate();
  const outletContext = useOutletContext<OutletContextType | null>();
  const topbarWard = outletContext?.currentWard || 'Ward 12 - Central Hosur';

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersMapRef = useRef<Map<string, MarkerRecord>>(new Map());
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // Active Map Coordinates
  const initialWardCoords = WARD_COORDINATES[topbarWard] || { lat: 12.7375, lng: 77.8285 };
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: initialWardCoords.lat,
    lng: initialWardCoords.lng,
  });
  const [locationName, setLocationName] = useState<string>(topbarWard);
  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const [radiusMeters, setRadiusMeters] = useState<number>(3000); // 3 km default
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Incidents Data State
  const [nearbyIncidents, setNearbyIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // =========================================================================
  // 1. SINGLE SOURCE OF TRUTH: shared selectedIncidentId & Pagination
  // =========================================================================
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  // Pagination State (6 issues per page for balanced 3x2 desktop grid)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const PAGE_SIZE = 6;

  const totalPages = Math.max(1, Math.ceil(nearbyIncidents.length / PAGE_SIZE));

  const paginatedIncidents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return nearbyIncidents.slice(start, start + PAGE_SIZE);
  }, [nearbyIncidents, currentPage, PAGE_SIZE]);

  const selectedIncident = useMemo(() => {
    if (!selectedIncidentId) return null;
    return nearbyIncidents.find((inc) => inc.id === selectedIncidentId) || null;
  }, [nearbyIncidents, selectedIncidentId]);

  // Intelligent Popup Positioning (aware of marker screen position)
  const [popupPlacement, setPopupPlacement] = useState<{
    horizontal: 'left' | 'right';
    vertical: 'top' | 'bottom';
  }>({ horizontal: 'right', vertical: 'bottom' });

  const updatePopupPosition = useCallback(() => {
    if (!selectedIncident || !mapRef.current || !mapContainerRef.current) return;
    const coords = selectedIncident.location?.coordinates;
    if (!coords || coords.length < 2) return;

    try {
      const point = mapRef.current.project([coords[0], coords[1]]);
      const containerRect = mapContainerRef.current.getBoundingClientRect();

      // If marker is on the right half, place popup on the LEFT to prevent covering
      const horizontal = point.x > containerRect.width * 0.5 ? 'left' : 'right';
      // If marker is in bottom half, place popup on the TOP
      const vertical = point.y > containerRect.height * 0.6 ? 'top' : 'bottom';

      setPopupPlacement({ horizontal, vertical });
    } catch {
      // Default to right bottom
    }
  }, [selectedIncident]);

  useEffect(() => {
    updatePopupPosition();
  }, [selectedIncident, updatePopupPosition]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.on('move', updatePopupPosition);
    return () => {
      map.off('move', updatePopupPosition);
    };
  }, [updatePopupPosition]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const start = (page - 1) * PAGE_SIZE;
    const newPageIncidents = nearbyIncidents.slice(start, start + PAGE_SIZE);
    if (selectedIncidentId && !newPageIncidents.some((i) => i.id === selectedIncidentId)) {
      setSelectedIncidentId(null);
    }
  };

  // Sync Topbar Ward changes to Map position
  useEffect(() => {
    if (topbarWard && WARD_COORDINATES[topbarWard]) {
      const target = WARD_COORDINATES[topbarWard];
      setCoords({ lat: target.lat, lng: target.lng });
      setLocationName(topbarWard);

      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [target.lng, target.lat],
          zoom: 15.2,
          pitch: is3DMode ? 55 : 0,
          essential: true,
          duration: 1000,
        });
      }
    }
  }, [topbarWard, is3DMode]);

  // Fetch Nearby Incidents from Backend API
  const fetchNearby = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await incidentService.getNearbyIncidents({
        lng: coords.lng,
        lat: coords.lat,
        radius: radiusMeters,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
      });

      setNearbyIncidents(data);
    } catch (err: any) {
      console.error('[NearbyIssuesPage] Failed to fetch nearby incidents:', err);
      setError('Unable to load nearby issues from municipal geospatial API.');
    } finally {
      setLoading(false);
    }
  }, [coords.lat, coords.lng, radiusMeters, categoryFilter]);

  useEffect(() => {
    fetchNearby();
  }, [fetchNearby]);

  // Initialize Mapbox 3D Standard Map Instance
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/standard',
        center: [coords.lng, coords.lat],
        zoom: 15.4,
        pitch: 55,
        bearing: -24,
        antialias: true,
        attributionControl: false,
      });

      mapRef.current = map;

      map.on('style.load', () => {
        try {
          map.setConfigProperty('basemap', 'theme', 'default');
          map.setConfigProperty('basemap', 'lightPreset', 'day');
          map.setConfigProperty('basemap', 'show3dBuildings', true);
          map.setConfigProperty('basemap', 'show3dLandmarks', true);
          map.setConfigProperty('basemap', 'show3dTrees', true);
          map.setConfigProperty('basemap', 'showPointOfInterestLabels', false);
        } catch {
          // Standard style config fallback
        }

        // Ward Boundary Layer
        try {
          if (!map.getSource('ward-boundary-source')) {
            map.addSource('ward-boundary-source', {
              type: 'geojson',
              data: WARD_12_BOUNDARY,
            });

            map.addLayer({
              id: 'ward-boundary-fill',
              type: 'fill',
              source: 'ward-boundary-source',
              paint: {
                'fill-color': '#159A68',
                'fill-opacity': 0.04,
              },
            });

            map.addLayer({
              id: 'ward-boundary-line',
              type: 'line',
              source: 'ward-boundary-source',
              paint: {
                'line-color': '#159A68',
                'line-width': 2,
                'line-dasharray': [3, 2],
                'line-opacity': 0.5,
              },
            });
          }
        } catch {
          // Boundary source exists
        }
      });
    } catch (err) {
      console.error('[NearbyIssuesPage] Mapbox initialization failed:', err);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Subtle "You are here" Location Indicator
  useEffect(() => {
    if (!mapRef.current) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    const el = document.createElement('div');
    el.className = 'relative flex items-center justify-center pointer-events-none select-none';
    el.innerHTML = `
      <div class="w-7 h-7 rounded-full bg-[#159A68]/20 absolute pointer-events-none"></div>
      <div class="w-4.5 h-4.5 rounded-full bg-[#159A68] border-2 border-white shadow-md relative z-10 flex items-center justify-center">
        <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
      </div>
      <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#102A43] text-white text-[9.5px] font-bold whitespace-nowrap shadow-xs">
        You are here
      </div>
    `;

    userMarkerRef.current = new mapboxgl.Marker({ element: el })
      .setLngLat([coords.lng, coords.lat])
      .addTo(mapRef.current);
  }, [coords.lat, coords.lng]);

  // =========================================================================
  // 2. UNIFIED SELECTION HANDLER (CARD <-> MAP SYNCHRONIZATION)
  // =========================================================================
  const handleSelectIncident = useCallback(
    (incident: Incident, source: 'CARD' | 'MARKER') => {
      setSelectedIncidentId(incident.id);

      // STEP 1: When triggered from card, smoothly scroll map into view
      if (source === 'CARD') {
        mapContainerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }

      const incidentLng = incident.location?.coordinates?.[0];
      const incidentLat = incident.location?.coordinates?.[1];

      // STEP 2: Cinematic camera journey with native Mapbox flyTo animation
      if (incidentLng !== undefined && incidentLat !== undefined && mapRef.current) {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
          mapRef.current.easeTo({
            center: [incidentLng, incidentLat],
            zoom: 16.5,
            duration: 350,
          });
        } else {
          mapRef.current.flyTo({
            center: [incidentLng, incidentLat],
            zoom: 16.8,
            pitch: is3DMode ? 58 : 0,
            bearing: -18,
            speed: 0.85,
            curve: 1.42,
            duration: 1800,
            essential: true,
          });
        }
      }

      // If triggered by marker, gently scroll corresponding card into view
      if (source === 'MARKER') {
        const cardEl = document.getElementById(`incident-card-${incident.id}`);
        if (cardEl) {
          cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    },
    [is3DMode]
  );

  // =========================================================================
  // 3. RENDER REAL MAP MARKERS WITH ACTIVE HALO & SELECTION STATE
  // =========================================================================
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing markers
    markersMapRef.current.forEach(({ marker }) => marker.remove());
    markersMapRef.current.clear();

    paginatedIncidents.forEach((incident, idx) => {
      const incidentLng = incident.location?.coordinates?.[0];
      const incidentLat = incident.location?.coordinates?.[1];
      if (incidentLng === undefined || incidentLat === undefined) return;

      const markerColor = getMarkerColor(incident);

      // Outer container
      const containerEl = document.createElement('div');
      containerEl.className = 'relative flex items-center justify-center cursor-pointer select-none group';
      containerEl.style.zIndex = '10';

      // Halo element (subtle static ring)
      const haloEl = document.createElement('div');
      haloEl.className =
        'absolute -inset-2 rounded-full pointer-events-none transition-all duration-300 opacity-0';
      haloEl.style.backgroundColor = `${markerColor}22`;
      haloEl.style.boxShadow = `0 0 0 4px ${markerColor}33`;

      // Pulse ring element for single pulse on selection
      const pulseEl = document.createElement('div');
      pulseEl.className = 'absolute -inset-2 rounded-full pointer-events-none transition-all duration-300 opacity-0';
      pulseEl.style.backgroundColor = markerColor;

      // Pin circle
      const pinEl = document.createElement('div');
      pinEl.className =
        'w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-extrabold relative z-10 transition-all duration-300 transform';
      pinEl.style.backgroundColor = markerColor;
      pinEl.innerHTML = incident.status === 'RESOLVED' ? '✓' : '!';

      // Subtle hover tooltip
      const tooltipEl = document.createElement('div');
      tooltipEl.className =
        'absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-[#102A43] text-white text-[10px] font-bold whitespace-nowrap shadow-xs pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-30';
      tooltipEl.textContent = incident.category;

      containerEl.appendChild(haloEl);
      containerEl.appendChild(pulseEl);
      containerEl.appendChild(pinEl);
      containerEl.appendChild(tooltipEl);

      // Stagger entrance slightly
      containerEl.style.animation = `fadeScaleIn 0.35s ease-out ${idx * 0.05}s both`;

      // Click on marker
      containerEl.addEventListener('click', (e) => {
        e.stopPropagation();
        handleSelectIncident(incident, 'MARKER');
      });

      const marker = new mapboxgl.Marker({ element: containerEl })
        .setLngLat([incidentLng, incidentLat])
        .addTo(mapRef.current!);

      markersMapRef.current.set(incident.id, {
        marker,
        containerEl,
        pinEl,
        haloEl,
        pulseEl,
      });
    });
  }, [paginatedIncidents, handleSelectIncident]);

  // =========================================================================
  // 4. REACTIVELY UPDATE ACTIVE MARKER STYLES WHEN selectedIncidentId CHANGES
  // =========================================================================
  useEffect(() => {
    markersMapRef.current.forEach(({ containerEl, pinEl, haloEl, pulseEl }, id) => {
      const isSelected = id === selectedIncidentId;
      if (isSelected) {
        containerEl.style.zIndex = '50';
        pinEl.style.transform = 'scale(1.22)';
        pinEl.style.boxShadow = '0 0 0 3px #FFFFFF, 0 0 0 6px #159A68, 0 4px 14px rgba(16,42,67,0.2)';
        haloEl.style.opacity = '0.35';
        pulseEl.style.animation = 'markerPulseOnce 400ms ease-out forwards';
      } else {
        containerEl.style.zIndex = '10';
        pinEl.style.transform = 'scale(1.0)';
        pinEl.style.boxShadow = 'none';
        haloEl.style.opacity = '0';
        pulseEl.style.animation = 'none';
        pulseEl.style.opacity = '0';
      }
    });
  }, [selectedIncidentId]);

  // Camera Controls
  const handleZoomIn = () => mapRef.current?.zoomIn({ duration: 300 });
  const handleZoomOut = () => mapRef.current?.zoomOut({ duration: 300 });
  const handleResetView = () => {
    setSelectedIncidentId(null);
    mapRef.current?.flyTo({
      center: [coords.lng, coords.lat],
      zoom: 15.4,
      pitch: is3DMode ? 55 : 0,
      bearing: -24,
      duration: 1000,
    });
  };
  const handleToggle3D = () => {
    const nextMode = !is3DMode;
    setIs3DMode(nextMode);
    mapRef.current?.easeTo({
      pitch: nextMode ? 55 : 0,
      duration: 800,
    });
  };
  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = Number(pos.coords.latitude.toFixed(6));
      const lng = Number(pos.coords.longitude.toFixed(6));
      setCoords({ lat, lng });
      setLocationName('Your Detected GPS Location');
      mapRef.current?.flyTo({ center: [lng, lat], zoom: 16, pitch: is3DMode ? 55 : 0, duration: 900 });
    });
  };

  return (
    <CitizenContentContainer className="space-y-4">
      {/* 1. Global Citizen Page Header (24px Title, 14px Subtitle, 20px Spacing) */}
      <CitizenPageHeader
        title="Nearby Issues"
        description="Inspect real-time reported civic issues, GPS clusters, and remediation status in your area."
        badge={
          <span className="text-xs font-semibold text-[#159A68] bg-[#E7F7F0] px-2.5 py-0.5 rounded-full border border-[#159A68]/20">
            {nearbyIncidents.length} nearby issues
          </span>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            {/* Radius Filter */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E3EAE6] shadow-xs text-xs font-semibold">
              {[
                { label: 'Within 1 km', value: 1000 },
                { label: 'Within 3 km', value: 3000 },
                { label: 'Within 5 km', value: 5000 },
              ].map((r) => (
                <button
                  key={r.value}
                  onClick={() => {
                    setRadiusMeters(r.value);
                    setCurrentPage(1);
                    setSelectedIncidentId(null);
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs',
                    radiusMeters === r.value
                      ? 'bg-[#159A68] text-white shadow-xs'
                      : 'text-[#6B7C8F] hover:text-[#102A43]'
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => {
                fetchNearby();
              }}
              disabled={loading}
              className="p-2 rounded-xl bg-white border border-[#E3EAE6] text-[#526777] hover:text-[#102A43] shadow-xs transition-colors cursor-pointer"
              title="Refresh Nearby Incidents"
            >
              <LuRefreshCw className={cn('w-4 h-4', loading && 'animate-spin text-[#159A68]')} />
            </button>
          </div>
        }
      />

      {/* 3D CITY HERO MAP VIEWPORT */}
      <div className="relative w-full h-[480px] sm:h-[560px] rounded-[24px] bg-[#EBF2EA] border border-[#E3EAE6] overflow-hidden shadow-[0_8px_30px_rgba(15,40,30,0.06)] select-none">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Legend Overlay */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-3 rounded-2xl border border-[#E3EAE6] shadow-lg text-xs font-semibold space-y-1.5 z-10 pointer-events-none">
          <div className="text-[10px] font-bold text-[#829AB1] uppercase tracking-wider">
            Severity & Status
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF6A63]" />
            <span className="text-[#102A43]">High / Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F2B84B]" />
            <span className="text-[#102A43]">Medium / In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#36B37E]" />
            <span className="text-[#102A43]">Resolved / Closed</span>
          </div>
        </div>

        {/* Map Floating Control Rail */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <div className="bg-white/95 backdrop-blur-md p-1 rounded-2xl border border-[#E3EAE6] shadow-lg flex flex-col gap-1">
            <button
              onClick={handleZoomIn}
              className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-[#102A43] font-bold transition-colors cursor-pointer"
              title="Zoom In"
            >
              <LuPlus className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-[#102A43] font-bold transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <LuMinus className="w-4 h-4" />
            </button>
            <button
              onClick={handleLocateMe}
              className="w-8 h-8 rounded-xl hover:bg-[#E7F7F0] text-[#159A68] flex items-center justify-center transition-colors cursor-pointer"
              title="Locate Me"
            >
              <LuCrosshair className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetView}
              className="w-8 h-8 rounded-xl hover:bg-slate-100 text-[#829AB1] hover:text-[#102A43] flex items-center justify-center transition-colors cursor-pointer"
              title="Reset View"
            >
              <LuCompass className="w-4 h-4" />
            </button>
          </div>

          {/* 2D / 3D Toggle */}
          <button
            onClick={handleToggle3D}
            className={cn(
              'px-2.5 py-1.5 rounded-xl border border-[#E3EAE6] shadow-lg text-xs font-bold transition-all cursor-pointer backdrop-blur-md',
              is3DMode ? 'bg-[#159A68] text-white' : 'bg-white/95 text-[#102A43] hover:bg-white'
            )}
            title="Toggle 2D / 3D Perspective"
          >
            {is3DMode ? '3D' : '2D'}
          </button>
        </div>

        {/* Embedded Keyframes for Single Marker Pulse and Clean Popup Entrance */}
        <style>{`
          @keyframes markerPulseOnce {
            0% { transform: scale(0.9); opacity: 0.7; }
            50% { transform: scale(1.35); opacity: 0.35; }
            100% { transform: scale(1.15); opacity: 0; }
          }
          @keyframes mapPopupReveal {
            from {
              opacity: 0;
              transform: translateY(6px) scale(0.96);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}</style>

        {/* Dynamic Issue Count Pill (Calm static indicator) */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-[#E3EAE6] shadow-sm text-xs font-bold text-[#102A43] flex items-center gap-2 z-10 pointer-events-none select-none">
          <span className="w-2 h-2 rounded-full bg-[#159A68]" />
          <span>
            {nearbyIncidents.length} {nearbyIncidents.length === 1 ? 'issue' : 'issues'} within{' '}
            {radiusMeters / 1000} km
          </span>
        </div>

        {/* =========================================================================
            5. COMPACT MAP INCIDENT PREVIEW (Selected State, Map-Aware Position)
            ========================================================================= */}
        {selectedIncident && (
          <div
            style={{
              animation: 'mapPopupReveal 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
            className={cn(
              'absolute max-w-[310px] w-full bg-white/98 backdrop-blur-xl border border-[#E3EAE6] rounded-2xl shadow-xl p-4 z-30 text-left space-y-2.5 transition-all duration-200 select-none',
              popupPlacement.horizontal === 'left' ? 'left-4 sm:left-6' : 'right-4 sm:right-6',
              popupPlacement.vertical === 'top' ? 'top-4 sm:top-6' : 'bottom-4 sm:bottom-6'
            )}
          >
            {/* Header: Category (Left) + Close Button (Right) */}
            <div className="flex items-center justify-between gap-2 border-b border-[#F0F4F2] pb-2">
              <span className="text-[10.5px] font-extrabold text-[#159A68] uppercase tracking-wider font-heading">
                {selectedIncident.category}
              </span>
              <button
                type="button"
                onClick={() => setSelectedIncidentId(null)}
                className="w-5 h-5 rounded-full hover:bg-slate-100 text-[#829AB1] hover:text-[#102A43] flex items-center justify-center cursor-pointer transition-colors"
                title="Close preview"
              >
                <LuX className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Severity · Status */}
            <div className="text-xs font-semibold text-[#526777] flex items-center gap-1.5">
              <span>
                {selectedIncident.severity === 'CRITICAL'
                  ? 'Critical'
                  : selectedIncident.severity === 'HIGH'
                  ? 'High'
                  : 'Medium'}
              </span>
              <span className="text-[#C4D1D9]">·</span>
              <span
                className={cn(
                  selectedIncident.status === 'RESOLVED' || selectedIncident.status === 'CLOSED'
                    ? 'text-[#159A68]'
                    : 'text-[#2878E5]'
                )}
              >
                {selectedIncident.status === 'RESOLVED' || selectedIncident.status === 'CLOSED'
                  ? 'Resolved'
                  : selectedIncident.status === 'ASSIGNED'
                  ? 'Assigned'
                  : 'In Progress'}
              </span>
            </div>

            {/* Title & Municipal Sector */}
            <div>
              <h4 className="font-heading font-extrabold text-sm text-[#102A43] leading-snug line-clamp-1">
                {getIncidentTitle(selectedIncident)}
              </h4>
              <p className="text-xs text-[#6B7C8F] mt-0.5 flex items-center gap-1 line-clamp-1">
                <LuMapPin className="w-3 h-3 text-[#159A68] shrink-0" />
                <span>
                  {selectedIncident.location?.address?.replace(/at\s*\[.*?\]/gi, '')?.trim() ||
                    'Municipal Sector, Hosur'}
                </span>
              </p>
            </div>

            {/* Monospace Incident ID & Formatted Date */}
            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[#F0F4F2]">
              <span className="font-mono font-bold text-[#102A43]">
                {(selectedIncident as any).incidentNumber || selectedIncident.id}
              </span>
              <span className="font-sans font-medium text-[#829AB1]">
                {selectedIncident.createdAt
                  ? new Date(selectedIncident.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Sep 29'}
              </span>
            </div>

            {/* View Incident CTA */}
            <button
              type="button"
              onClick={() => navigate(`/citizen/incidents/${selectedIncident.id}`)}
              className="w-full py-2 px-3.5 bg-[#159A68] hover:bg-[#128358] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
            >
              <span>View Incident</span>
              <LuArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ERROR STATE BANNER */}
      {error && (
        <CitizenErrorState
          title="Nearby Issues Unavailable"
          message={error}
          onRetry={() => fetchNearby()}
        />
      )}

      {/* NEARBY INCIDENTS SECTION BELOW MAP */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold font-heading text-[#102A43]">
              Nearby Incidents
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E7F7F0] text-[#159A68]">
              {nearbyIncidents.length}
            </span>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 text-xs text-[#6B7C8F]">
            <LuFilter className="w-3.5 h-3.5 text-[#159A68]" />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
                setSelectedIncidentId(null);
              }}
              className="bg-white border border-[#E3EAE6] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#102A43] focus:outline-none focus:ring-1 focus:ring-[#159A68] shadow-xs cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="POTHOLE">Potholes & Roads</option>
              <option value="DRAINAGE">Drainage & Stormwater</option>
              <option value="STREETLIGHT">Streetlights</option>
              <option value="GARBAGE">Garbage & Waste</option>
              <option value="WATER_LEAK">Water Seepage</option>
              <option value="ROAD_DAMAGE">Road Obstruction</option>
              <option value="ILLEGAL_DUMPING">Illegal Dumping</option>
              <option value="FALLEN_TREE">Fallen Trees</option>
              <option value="OTHER">Public Parks & Other</option>
            </select>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && nearbyIncidents.length === 0 && (
          <div className="p-12 text-center bg-white border border-[#E3EAE6] rounded-[18px] shadow-[0_8px_30px_rgba(15,40,30,0.06)] space-y-3">
            <LuLoader className="w-6 h-6 animate-spin text-[#159A68] mx-auto" />
            <p className="text-xs text-[#6B7C8F]">Scanning 2dsphere index for nearby civic issues...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && nearbyIncidents.length === 0 && (
          <div className="p-12 text-center bg-white border border-[#E3EAE6] rounded-[18px] shadow-[0_8px_30px_rgba(15,40,30,0.06)] space-y-3">
            <div className="w-8 h-8 rounded-full bg-[#E7F7F0] flex items-center justify-center text-[#36B37E] mx-auto">
              <LuCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h3 className="font-bold text-sm font-heading text-[#102A43]">
              No Nearby Civic Issues Found
            </h3>
            <p className="text-xs text-[#6B7C8F] max-w-sm mx-auto leading-relaxed">
              There are no reported civic problems within {radiusMeters / 1000} km of {locationName}.
              You can expand the search radius above or report an issue.
            </p>
          </div>
        )}

        {/* =========================================================================
            6. GRID OF INCIDENT CARDS (Synchronized Selection & Highlight)
            ========================================================================= */}
        {!loading && !error && paginatedIncidents.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedIncidents.map((incident) => {
                const incidentLng = incident.location?.coordinates?.[0] || 0;
                const incidentLat = incident.location?.coordinates?.[1] || 0;
                const distanceKm = calculateDistanceKm(coords.lat, coords.lng, incidentLat, incidentLng);
                const distanceText = formatDistance(distanceKm);
                const isSelected = selectedIncidentId === incident.id;

                const cleanAddress =
                  incident.location?.address
                    ?.replace(/at\s*\[.*?\]/gi, '')
                    ?.replace(/,\s*,/g, ',')
                    ?.trim() || 'Municipal Sector, Hosur';

                return (
                  <div
                    id={`incident-card-${incident.id}`}
                    key={incident.id}
                    onClick={() => handleSelectIncident(incident, 'CARD')}
                    className={cn(
                      'p-5 bg-white border rounded-[18px] transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3.5 relative overflow-hidden',
                      isSelected
                        ? 'border-[#159A68] ring-2 ring-[#159A68]/30 bg-[#F5FAF7] shadow-lg -translate-y-1'
                        : 'border-[#E3EAE6] hover:border-[#159A68]/40 hover:shadow-md'
                    )}
                  >
                    {/* Subtle Selected Green Accent Indicator Bar */}
                    {isSelected && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-[#159A68]" />
                    )}

                    <div className="space-y-2 text-left">
                      {/* Header: Category Label (Left) + Severity Badge (Right) */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-extrabold text-[#159A68] uppercase tracking-wider font-heading bg-[#E7F7F0] px-2.5 py-0.5 rounded-md">
                          {incident.category}
                        </span>
                        <SeverityBadge severity={incident.severity} />
                      </div>

                      {/* Title & Municipal Sector Address */}
                      <div>
                        <h4 className="font-heading font-extrabold text-sm sm:text-base text-[#102A43] line-clamp-1">
                          {getIncidentTitle(incident)}
                        </h4>
                        <p className="text-xs text-[#6B7C8F] line-clamp-1 mt-0.5">
                          {cleanAddress}
                        </p>
                      </div>
                    </div>

                    {/* Bottom: Status & Distance (Left) + View on Map (Right) */}
                    <div className="pt-3 border-t border-[#E8EDE9] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={incident.status} />
                        <span className="text-[#829AB1]">•</span>
                        <span className="font-semibold text-[#102A43]">
                          {distanceText}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectIncident(incident, 'CARD');
                        }}
                        className="text-[#159A68] font-bold hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <LuCompass className="w-3.5 h-3.5" />
                        <span>View on Map</span>
                        <LuArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls — Shared CitizenPagination */}
            <CitizenPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={nearbyIncidents.length}
              pageSize={PAGE_SIZE}
              onPageChange={handlePageChange}
              className="pt-2"
            />
          </div>
        )}
      </div>
    </CitizenContentContainer>
  );
}

export default NearbyIssuesPage;
