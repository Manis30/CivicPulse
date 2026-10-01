import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as Cesium from 'cesium';
import { Incident } from '@civicpulse/shared';
import {
  MapPin,
  Layers,
  Compass,
  Plus,
  Minus,
  RotateCcw,
  Sparkles,
  ExternalLink,
  X,
  AlertTriangle,
  ShieldCheck,
  Building,
  Navigation
} from 'lucide-react';
import { PREVIEW_INCIDENTS, getIncidentTitle } from '@/services/incidentService';

// Configure Cesium Ion Token from environment variable (never hardcoded)
const ionToken = import.meta.env.VITE_CESIUM_ION_TOKEN;
if (ionToken) {
  Cesium.Ion.defaultAccessToken = ionToken;
}

export interface CesiumCitySceneRef {
  flyToHosurCore: () => void;
  flyToIncident: (incident: Incident) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
}

export interface CesiumCitySceneProps {
  incidents?: Incident[];
  selectedIncidentId?: string;
  onSelectIncident?: (incident: Incident) => void;
  className?: string;
  height?: string | number;
  showControls?: boolean;
  interactive?: boolean;
  showHeroFloatingCards?: boolean;
  activeClusterFilter?: string | null;
}

// Hosur, Tamil Nadu geographic coordinates & aerial view configuration
const HOSUR_COORDINATES = {
  longitude: 77.8253,
  latitude: 12.7409,
  defaultHeight: 1550, // Angled aerial altitude
  headingDeg: 350,
  pitchDeg: -36,
};

export const CesiumCityScene = forwardRef<CesiumCitySceneRef, CesiumCitySceneProps>(
  (
    {
      incidents = PREVIEW_INCIDENTS,
      selectedIncidentId,
      onSelectIncident,
      className = '',
      height = '100%',
      showControls = true,
      interactive = true,
      showHeroFloatingCards = false,
      activeClusterFilter = null,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<Cesium.Viewer | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(() => {
      if (selectedIncidentId) {
        return incidents.find((i) => i.id === selectedIncidentId) || incidents[0] || null;
      }
      return incidents[0] || null;
    });
    const [activePerspective, setActivePerspective] = useState<'overview' | 'commercial' | 'industrial' | 'transit'>('overview');

    // Update selected incident when prop changes
    useEffect(() => {
      if (selectedIncidentId) {
        const found = incidents.find((i) => i.id === selectedIncidentId);
        if (found) setSelectedIncident(found);
      }
    }, [selectedIncidentId, incidents]);

    // Initialize Cesium Viewer
    useEffect(() => {
      if (!containerRef.current) return;

      let viewer: Cesium.Viewer | null = null;
      let eventHandler: Cesium.ScreenSpaceEventHandler | null = null;

      try {
        // High-performance clean container options
        viewer = new Cesium.Viewer(containerRef.current, {
          animation: false,
          baseLayerPicker: false,
          fullscreenButton: false,
          geocoder: false,
          homeButton: false,
          infoBox: false,
          sceneModePicker: false,
          selectionIndicator: false,
          timeline: false,
          navigationHelpButton: false,
          navigationInstructionsInitiallyVisible: false,
          scene3DOnly: true,
          requestRenderMode: true, // Only render when needed for maximum FPS
          maximumRenderTimeChange: Infinity,
        });

        viewerRef.current = viewer;

        // Styling the geographic scene to match CivicPulse midnight-navy atmosphere
        const scene = viewer.scene;
        scene.globe.baseColor = Cesium.Color.fromCssColorString('#0A1236');
        scene.globe.depthTestAgainstTerrain = false;
        scene.backgroundColor = Cesium.Color.fromCssColorString('#080C20');

        // Turn off sun/moon/stars for clean municipal operational feel
        if (scene.sun) scene.sun.show = false;
        if (scene.moon) scene.moon.show = false;
        if (scene.skyBox) scene.skyBox.show = false;
        if (scene.skyAtmosphere) scene.skyAtmosphere.show = false;

        // Subtle dark fog for depth
        scene.fog.enabled = true;
        scene.fog.density = 0.0003;
        scene.fog.minimumBrightness = 0.2;

        // Configure high-clarity Dark Matter Cartographic imagery
        try {
          const darkBasemap = new Cesium.UrlTemplateImageryProvider({
            url: 'https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
            subdomains: ['a', 'b', 'c', 'd'],
            maximumLevel: 19,
            credit: '© OpenStreetMap contributors, © CARTO',
          });
          viewer.imageryLayers.removeAll();
          viewer.imageryLayers.addImageryProvider(darkBasemap);
        } catch (e) {
          console.warn('[CesiumCityScene] Dark imagery fallback engaged', e);
        }

        // Set camera starting position: attractive angled aerial view of Hosur, Tamil Nadu
        // Not a full globe: starts directly overlooking Hosur's urban grid
        viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(
            HOSUR_COORDINATES.longitude + 0.002,
            HOSUR_COORDINATES.latitude - 0.012,
            HOSUR_COORDINATES.defaultHeight
          ),
          orientation: {
            heading: Cesium.Math.toRadians(HOSUR_COORDINATES.headingDeg),
            pitch: Cesium.Math.toRadians(HOSUR_COORDINATES.pitchDeg),
            roll: 0.0,
          },
        });

        // Load 3D OSM Buildings asynchronously with CivicPulse midnight-navy styling
        (async () => {
          try {
            const osmBuildings = await Cesium.createOsmBuildingsAsync();
            osmBuildings.style = new Cesium.Cesium3DTileStyle({
              color: {
                conditions: [
                  ['${feature["building"]} === "hospital"', "color('#22C3B0', 0.95)"],
                  ['${feature["building"]} === "commercial"', "color('#3E8BFF', 0.88)"],
                  ['${feature["building"]} === "industrial"', "color('#5B5BF5', 0.85)"],
                  ['${feature["building"]} === "transportation"', "color('#3E8BFF', 0.9)"],
                  ['true', "color('#182247', 0.85)"], // Clean midnight navy building tone
                ],
              },
              show: 'true',
            });
            if (viewer && !viewer.isDestroyed()) {
              viewer.scene.primitives.add(osmBuildings);
              viewer.scene.requestRender();
            }
          } catch (e) {
            // If OSM building tileset requires token or is offline, the dark cartographic layer remains pristine
            console.info('[CesiumCityScene] 3D OSM Buildings tileset bypassed or offline.', e);
          }
        })();

        // Click handler for picking incident markers
        eventHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        eventHandler.setInputAction((movement: { position: Cesium.Cartesian2 }) => {
          const picked = viewer?.scene.pick(movement.position);
          if (Cesium.defined(picked) && picked.id) {
            const entityId = typeof picked.id === 'string' ? picked.id : picked.id.id;
            const clicked = incidents.find((i) => i.id === entityId);
            if (clicked) {
              setSelectedIncident(clicked);
              onSelectIncident?.(clicked);
              viewer?.scene.requestRender();
            }
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        setIsLoaded(true);
        viewer.scene.requestRender();
      } catch (err: any) {
        console.error('[CesiumCityScene] Failed to initialize Cesium Viewer:', err);
        setLoadError(err.message || 'Unable to initialize 3D geographic context');
      }

      return () => {
        if (eventHandler) {
          eventHandler.destroy();
        }
        if (viewer && !viewer.isDestroyed()) {
          viewer.destroy();
        }
        viewerRef.current = null;
      };
    }, []);

    // Render incident markers in Cesium when incidents or filter changes
    useEffect(() => {
      const viewer = viewerRef.current;
      if (!viewer || viewer.isDestroyed() || !isLoaded) return;

      // Filter incidents if activeClusterFilter is present
      const displayIncidents = incidents.filter((inc) => {
        if (!activeClusterFilter) return true;
        if (activeClusterFilter === 'pothole') return inc.category === 'POTHOLE' || (inc.category as string) === 'ROAD_DAMAGE';
        if (activeClusterFilter === 'water') return inc.category === 'WATER_LEAK' || inc.category === 'DRAINAGE';
        if (activeClusterFilter === 'streetlight') return inc.category === 'STREETLIGHT';
        if (activeClusterFilter === 'garbage') return inc.category === 'GARBAGE';
        return true;
      });

      // Clear existing incident entities
      viewer.entities.removeAll();

      displayIncidents.forEach((inc) => {
        const [lon, lat] = inc.location.coordinates;
        const isSelected = selectedIncident?.id === inc.id;

        // Severity Color Coding
        // HIGH/CRITICAL -> Red (#EF4444)
        // MEDIUM -> Orange (#F59E0B)
        // LOW -> Aqua/Blue (#3E8BFF)
        let pinColor = Cesium.Color.fromCssColorString('#3E8BFF');
        if (inc.severity === 'CRITICAL' || inc.severity === 'HIGH') {
          pinColor = Cesium.Color.fromCssColorString('#EF4444');
        } else if (inc.severity === 'MEDIUM') {
          pinColor = Cesium.Color.fromCssColorString('#F59E0B');
        }

        // Add 3D Point & Beacon Marker
        viewer.entities.add({
          id: inc.id,
          name: inc.id,
          position: Cesium.Cartesian3.fromDegrees(lon, lat, 12),
          point: {
            pixelSize: isSelected ? 18 : 12,
            color: pinColor,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: isSelected ? 3 : 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          // Glowing vertical signal beam
          cylinder: {
            length: isSelected ? 90 : 50,
            topRadius: isSelected ? 2.5 : 1.2,
            bottomRadius: isSelected ? 2.5 : 1.2,
            material: pinColor.withAlpha(isSelected ? 0.75 : 0.45),
          },
        });
      });

      viewer.scene.requestRender();
    }, [incidents, isLoaded, selectedIncident, activeClusterFilter]);

    // Camera Navigation Handlers
    const flyToHosurCore = () => {
      const viewer = viewerRef.current;
      if (!viewer || viewer.isDestroyed()) return;
      setActivePerspective('overview');
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          HOSUR_COORDINATES.longitude + 0.002,
          HOSUR_COORDINATES.latitude - 0.012,
          HOSUR_COORDINATES.defaultHeight
        ),
        orientation: {
          heading: Cesium.Math.toRadians(HOSUR_COORDINATES.headingDeg),
          pitch: Cesium.Math.toRadians(HOSUR_COORDINATES.pitchDeg),
          roll: 0.0,
        },
        duration: 1.8,
      });
    };

    const flyToPerspective = (perspective: 'commercial' | 'industrial' | 'transit') => {
      const viewer = viewerRef.current;
      if (!viewer || viewer.isDestroyed()) return;
      setActivePerspective(perspective);

      if (perspective === 'commercial') {
        // MG Road Commercial Ward 5
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(77.8242, 12.7310, 850),
          orientation: {
            heading: Cesium.Math.toRadians(355),
            pitch: Cesium.Math.toRadians(-40),
            roll: 0.0,
          },
          duration: 1.6,
        });
      } else if (perspective === 'industrial') {
        // SIPCOT Industrial Phase 1
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(77.8120, 12.7470, 950),
          orientation: {
            heading: Cesium.Math.toRadians(25),
            pitch: Cesium.Math.toRadians(-35),
            roll: 0.0,
          },
          duration: 1.6,
        });
      } else if (perspective === 'transit') {
        // Rayakottai Overbridge & Railway Colony
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(77.8335, 12.7230, 800),
          orientation: {
            heading: Cesium.Math.toRadians(340),
            pitch: Cesium.Math.toRadians(-38),
            roll: 0.0,
          },
          duration: 1.6,
        });
      }
    };

    const flyToIncident = (incident: Incident) => {
      const viewer = viewerRef.current;
      if (!viewer || viewer.isDestroyed()) return;
      setSelectedIncident(incident);
      const [lon, lat] = incident.location.coordinates;
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lon, lat - 0.005, 500),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-32),
          roll: 0.0,
        },
        duration: 1.5,
      });
    };

    const zoomIn = () => {
      const viewer = viewerRef.current;
      if (!viewer || viewer.isDestroyed()) return;
      viewer.camera.zoomIn(250);
      viewer.scene.requestRender();
    };

    const zoomOut = () => {
      const viewer = viewerRef.current;
      if (!viewer || viewer.isDestroyed()) return;
      viewer.camera.zoomOut(250);
      viewer.scene.requestRender();
    };

    // Expose ref functions to parent components
    useImperativeHandle(ref, () => ({
      flyToHosurCore,
      flyToIncident,
      zoomIn,
      zoomOut,
      resetView: flyToHosurCore,
    }));

    return (
      <div className={`relative w-full overflow-hidden rounded-2xl ${className}`} style={{ height }}>
        {/* Real Cesium Canvas Container */}
        <div ref={containerRef} className="w-full h-full bg-[#080C20]" />

        {/* Fallback Display if WebGL/Cesium Encounters System Constraint */}
        {loadError && (
          <div className="absolute inset-0 bg-[#080C20] flex flex-col items-center justify-center p-6 text-center text-white">
            <AlertTriangle className="w-10 h-10 text-amber-400 mb-3" />
            <h4 className="font-heading font-semibold text-base mb-1">Geographic Engine Initializing</h4>
            <p className="text-xs text-slate-400 max-w-sm">
              Hosur 3D Geographic coordinate telemetry is syncing. Real-time municipal incident points remain active.
            </p>
          </div>
        )}

        {/* Subtle Map Atmosphere Vignette & Grid Lines */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080C20]/80 via-transparent to-[#080C20]/40" />

        {/* Live Geographic Coordinate Stamp */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0A1236]/80 backdrop-blur-md border border-[#5B5BF5]/30 text-white shadow-lg">
          <span className="w-2 h-2 rounded-full bg-[#22C3B0] animate-pulse" />
          <span className="font-mono text-[11px] tracking-wider text-slate-200">
            HOSUR, TN • 12.7409° N, 77.8253° E
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#5B5BF5]/20 text-[#3E8BFF] font-medium ml-1">
            CESIUM 3D
          </span>
        </div>

        {/* Top-Right Preset Perspective Switcher */}
        {showControls && (
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 p-1 rounded-xl bg-[#0A1236]/85 backdrop-blur-md border border-white/10 shadow-lg">
            <button
              onClick={flyToHosurCore}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activePerspective === 'overview'
                  ? 'bg-[#5B5BF5] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => flyToPerspective('commercial')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activePerspective === 'commercial'
                  ? 'bg-[#5B5BF5] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              MG Road
            </button>
            <button
              onClick={() => flyToPerspective('industrial')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activePerspective === 'industrial'
                  ? 'bg-[#5B5BF5] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              SIPCOT
            </button>
            <button
              onClick={() => flyToPerspective('transit')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activePerspective === 'transit'
                  ? 'bg-[#5B5BF5] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Rayakottai
            </button>
          </div>
        )}

        {/* Floating Zoom & Center Controls */}
        {showControls && (
          <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1.5 bg-[#0A1236]/85 backdrop-blur-md border border-white/10 rounded-xl p-1 shadow-lg">
            <button
              onClick={zoomIn}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Zoom In"
              aria-label="Zoom in"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={zoomOut}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Zoom Out"
              aria-label="Zoom out"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={flyToHosurCore}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Reset View"
              aria-label="Reset view"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Selected Incident Floating Card (Section 6 Requirement) */}
        {selectedIncident && (
          <div className="absolute bottom-4 left-4 z-20 max-w-sm w-[calc(100%-2rem)] sm:w-80 rounded-xl p-4 glass-floating-dark text-white border border-[#5B5BF5]/30 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-300">
                  {selectedIncident.id}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedIncident.severity === 'CRITICAL' || selectedIncident.severity === 'HIGH'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : selectedIncident.severity === 'MEDIUM'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}
                >
                  {selectedIncident.severity}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {selectedIncident.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Dismiss incident card"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h4 className="font-heading font-semibold text-sm text-white leading-snug mb-1">
              {getIncidentTitle(selectedIncident)}
            </h4>

            <p className="text-xs text-slate-300 font-sans flex items-center gap-1 mb-2.5">
              <MapPin className="w-3.5 h-3.5 text-[#3E8BFF] shrink-0" />
              <span className="truncate">{selectedIncident.location.address}</span>
            </p>

            <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium text-slate-200 truncate">
                  {selectedIncident.departmentId?.replace('DEPT-', '').replace('-01', '') || 'Infrastructure'}
                </span>
              </div>
              <button
                onClick={() => flyToIncident(selectedIncident)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#3E8BFF] hover:text-[#22C3B0] transition-colors"
              >
                <span>Focus Point</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Hero Section Floating Glass Overlay Cards (Section 7 Requirement) */}
        {showHeroFloatingCards && (
          <>
            {/* Top-Right Live City Metric Pill */}
            <div className="hidden sm:flex absolute top-16 right-4 z-10 glass-floating-dark rounded-xl p-3 border border-white/10 text-white shadow-xl backdrop-blur-xl">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-left">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                    LIVE CITY
                  </span>
                  <span className="font-heading font-bold text-sm text-white">Hosur</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                    ACTIVE
                  </span>
                  <span className="font-heading font-bold text-sm text-rose-400">24 Incidents</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                    AI VALIDATED
                  </span>
                  <span className="font-heading font-bold text-sm text-[#3E8BFF]">18 Live</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                    RESOLVED TODAY
                  </span>
                  <span className="font-heading font-bold text-sm text-[#22C3B0]">31 Fixed</span>
                </div>
              </div>
            </div>

            {/* Bottom-Right AI Validation Checklist Card */}
            <div className="hidden lg:flex absolute bottom-16 right-4 z-10 glass-floating-dark rounded-xl p-3.5 border border-white/10 text-white shadow-xl max-w-[210px]">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    AI PIPELINE
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <div className="text-xs space-y-1 font-medium text-slate-200">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-slate-200">Vision Analysis</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-slate-200">Location Geocode</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-slate-200">Duplicate Check</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-slate-200">Severity Prioritized</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
);

CesiumCityScene.displayName = 'CesiumCityScene';
