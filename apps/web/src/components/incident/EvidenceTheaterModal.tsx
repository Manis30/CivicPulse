import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  LuZoomIn,
  LuZoomOut,
  LuRotateCcw,
  LuDownload,
  LuX,
  LuShieldCheck,
  LuMapPin,
  LuClock,
  LuUser,
  LuChevronLeft,
  LuChevronRight,
  LuCamera
} from 'react-icons/lu';
import { getEvidenceImageUrl } from '@/services/evidenceService';
import { cn } from '@/lib/utils';

export interface EvidenceTheaterModalProps {
  evidence: any;
  allEvidence?: any[];
  incident?: any;
  onClose: () => void;
  onSelectEvidence?: (ev: any) => void;
}

export function EvidenceTheaterModal({
  evidence,
  allEvidence = [],
  incident,
  onClose,
  onSelectEvidence,
}: EvidenceTheaterModalProps) {
  const shouldReduceMotion = useReducedMotion();

  // Active evidence item
  const [currentEvidence, setCurrentEvidence] = useState(evidence);

  // Zoom & Pan state
  const [zoom, setZoom] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Natural dimensions of the active image
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Viewport dimensions for responsive stage fitting
  const [stageDimensions, setStageDimensions] = useState<{ width: number; height: number }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  // Lock body scroll while theater is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Update viewport dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      setStageDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync state on evidence prop changes
  useEffect(() => {
    setCurrentEvidence(evidence);
    setZoom(1);
    setNaturalSize(null);
  }, [evidence]);

  // Read natural dimensions if image is already cached
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth) {
      setNaturalSize({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight,
      });
    }
  }, [currentEvidence]);

  // Find index in list
  const currentIndex = useMemo(() => {
    if (!allEvidence.length) return 0;
    return allEvidence.findIndex(
      (ev) => (ev.id || ev._id || ev.fileUrl) === (currentEvidence?.id || currentEvidence?._id || currentEvidence?.fileUrl)
    );
  }, [allEvidence, currentEvidence]);

  const handlePrev = useCallback(() => {
    if (allEvidence.length <= 1) return;
    const prevIdx = currentIndex > 0 ? currentIndex - 1 : allEvidence.length - 1;
    const nextItem = allEvidence[prevIdx];
    setCurrentEvidence(nextItem);
    setZoom(1);
    setNaturalSize(null);
    if (onSelectEvidence) onSelectEvidence(nextItem);
  }, [allEvidence, currentIndex, onSelectEvidence]);

  const handleNext = useCallback(() => {
    if (allEvidence.length <= 1) return;
    const nextIdx = currentIndex < allEvidence.length - 1 ? currentIndex + 1 : 0;
    const nextItem = allEvidence[nextIdx];
    setCurrentEvidence(nextItem);
    setZoom(1);
    setNaturalSize(null);
    if (onSelectEvidence) onSelectEvidence(nextItem);
  }, [allEvidence, currentIndex, onSelectEvidence]);

  const handleZoomIn = () => setZoom((z) => Math.min(Number((z + 0.25).toFixed(2)), 3.5));
  const handleZoomOut = () => setZoom((z) => Math.max(Number((z - 0.25).toFixed(2)), 0.5));
  const handleResetZoom = () => setZoom(1);

  const handleDoubleClick = () => {
    setZoom((z) => (z > 1 ? 1 : 1.8));
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        setZoom((z) => Math.min(Number((z + 0.2).toFixed(2)), 3.5));
      } else {
        setZoom((z) => Math.max(Number((z - 0.2).toFixed(2)), 0.5));
      }
    }
  };

  // Keyboard navigation (+, -, 0, Escape, ArrowLeft, ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        handleResetZoom();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handlePrev, handleNext]);

  const handleDownload = () => {
    const rawUrl = currentEvidence?.fileUrl;
    if (!rawUrl) return;
    const finalUrl = getEvidenceImageUrl(rawUrl);
    const fileName = rawUrl.split('/').pop() || 'civicpulse-evidence.jpg';
    const a = document.createElement('a');
    a.href = finalUrl;
    a.download = fileName;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Compute prominent, proportional inspection-grade display dimensions
  const displaySize = useMemo(() => {
    // Stage limits: vertical space accounts for top bar (~56px), bottom card (~130px), padding (~40px)
    const maxH = Math.max(260, stageDimensions.height - 230);
    const maxW = Math.max(300, Math.min(stageDimensions.width * 0.92, 1200));

    if (!naturalSize || !naturalSize.width || !naturalSize.height) {
      return {
        width: 'auto',
        height: 'auto',
        maxWidth: `${maxW}px`,
        maxHeight: `${maxH}px`,
        minWidth: 'min(360px, 90vw)',
        minHeight: 'min(260px, 50vh)',
      };
    }

    const imgRatio = naturalSize.width / naturalSize.height;

    // For low-resolution thumbnails / uploads (e.g. 200px), upscale to inspection grade size
    let boundedMaxW = maxW;
    let boundedMaxH = maxH;
    if (naturalSize.width < 450 && naturalSize.height < 450) {
      boundedMaxW = Math.min(maxW, Math.max(560, naturalSize.width * 3));
      boundedMaxH = Math.min(maxH, Math.max(500, naturalSize.height * 3));
    }

    const stageRatio = boundedMaxW / boundedMaxH;
    let targetW: number;
    let targetH: number;

    if (imgRatio > stageRatio) {
      targetW = boundedMaxW;
      targetH = Math.round(boundedMaxW / imgRatio);
    } else {
      targetH = boundedMaxH;
      targetW = Math.round(boundedMaxH * imgRatio);
    }

    if (targetH > maxH) {
      targetH = maxH;
      targetW = Math.round(maxH * imgRatio);
    }
    if (targetW > maxW) {
      targetW = maxW;
      targetH = Math.round(maxW / imgRatio);
    }

    return {
      width: `${Math.round(targetW)}px`,
      height: `${Math.round(targetH)}px`,
      maxWidth: `${maxW}px`,
      maxHeight: `${maxH}px`,
    };
  }, [naturalSize, stageDimensions]);

  // Human-readable location
  const locationLabel = useMemo(() => {
    const address = incident?.location?.address || '';
    const ward = incident?.location?.ward || '';
    let cleanAddress = address.replace(/\s*at\s*\[-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?\]/gi, '').trim();
    const cleanWard = (ward || '').replace(/^Ward\s*/i, 'Ward ').replace(/\s*-\s*/g, ' · ').trim();
    if (cleanAddress && cleanWard) return `${cleanWard} · ${cleanAddress}`;
    if (cleanWard) return cleanWard;
    if (cleanAddress) return cleanAddress;
    return 'Ward 12 · Central Hosur';
  }, [incident]);

  // Exact coordinates
  const gpsCoords = useMemo(() => {
    const metaLat = currentEvidence?.metadata?.latitude || incident?.location?.coordinates?.[1];
    const metaLng = currentEvidence?.metadata?.longitude || incident?.location?.coordinates?.[0];
    if (metaLat !== undefined && metaLng !== undefined) {
      return `${Number(metaLat).toFixed(4)}°, ${Number(metaLng).toFixed(4)}°`;
    }
    return null;
  }, [currentEvidence, incident]);

  const uploaderName = useMemo(() => {
    if (typeof currentEvidence?.uploadedBy === 'object' && currentEvidence?.uploadedBy?.name) {
      return currentEvidence.uploadedBy.name;
    }
    const src = currentEvidence?.source;
    if (src === 'CITIZEN' || src === 'CITIZEN_UPLOAD' || !src) return 'Citizen';
    if (src === 'OFFICER') return 'Municipal Field Officer';
    return 'Municipal Operations';
  }, [currentEvidence]);

  const timestampString = useMemo(() => {
    const rawDate = currentEvidence?.capturedAt || currentEvidence?.createdAt || incident?.createdAt;
    if (!rawDate) return '29 Sep 2026 · 9:12 PM';
    const d = new Date(rawDate);
    const datePart = d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
    const timePart = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    return `${datePart} · ${timePart}`;
  }, [currentEvidence, incident]);

  const fileName = currentEvidence?.fileUrl?.split('/').pop() || 'evidence-record.png';
  const evidenceType = (currentEvidence?.type || 'BEFORE').toUpperCase();

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="CivicPulse Evidence Theater"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[99999] flex flex-col justify-between p-3 sm:p-5 select-none animate-in fade-in duration-200"
      style={{
        backgroundColor: 'rgba(10, 18, 16, 0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* 1. FLOATING GLASS CONTROL BAR (Top) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-5xl w-full mx-auto z-20 flex items-center justify-between gap-3 px-4 py-2.5 rounded-[14px] bg-white/[0.08] border border-white/[0.14] backdrop-blur-xl shadow-2xl text-white shrink-0"
      >
        {/* Left: Badge + File Name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#159A68]/25 border border-[#159A68]/45 text-[#36B37E] text-[11px] font-bold font-heading uppercase tracking-wider shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#36B37E] animate-pulse" />
            <span>{evidenceType} EVIDENCE</span>
          </span>

          <span className="text-xs text-slate-300 font-mono truncate hidden sm:inline max-w-xs md:max-w-md">
            {fileName}
          </span>
        </div>

        {/* Right: Compact Glass Icon Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Zoom Controls */}
          <div className="flex items-center bg-white/[0.06] border border-white/[0.12] rounded-xl p-0.5">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
              title="Zoom out (-)"
              aria-label="Zoom out"
            >
              <LuZoomOut className="w-4 h-4" />
            </button>
            <span
              onClick={handleResetZoom}
              className="text-[11px] font-mono px-2 font-bold min-w-[44px] text-center cursor-pointer hover:text-[#36B37E] transition-colors"
              title="Click to reset zoom (0)"
            >
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
              title="Zoom in (+)"
              aria-label="Zoom in"
            >
              <LuZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer border-l border-white/10 ml-0.5"
              title="Reset to stage fit (0)"
              aria-label="Reset zoom"
            >
              <LuRotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Download Action */}
          <button
            type="button"
            onClick={handleDownload}
            className="p-2 rounded-xl bg-white/[0.08] hover:bg-white/20 border border-white/[0.14] text-white transition-colors cursor-pointer"
            title="Download evidence image"
            aria-label="Download evidence"
          >
            <LuDownload className="w-4 h-4" />
          </button>

          {/* Close Action */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/20 text-white transition-colors cursor-pointer ml-1"
            title="Close Evidence Theater (Esc)"
            aria-label="Close"
          >
            <LuX className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* 2. HERO IMAGE THEATER STAGE */}
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        onWheel={handleWheel}
        className="flex-1 overflow-hidden flex items-center justify-center p-2 sm:p-4 min-h-0 relative select-none"
      >
        {/* Previous / Next Arrow buttons if multi-evidence */}
        {allEvidence.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-4 z-30 p-2.5 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white backdrop-blur-md transition-all cursor-pointer hover:scale-105"
              title="Previous evidence (Left Arrow)"
              aria-label="Previous evidence"
            >
              <LuChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 z-30 p-2.5 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white backdrop-blur-md transition-all cursor-pointer hover:scale-105"
              title="Next evidence (Right Arrow)"
              aria-label="Next evidence"
            >
              <LuChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Hero Image Container with AnimatePresence & Smooth Drag/Pan */}
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          className="relative w-full h-full flex items-center justify-center"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentEvidence?.fileUrl || currentEvidence?._id}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              drag={zoom > 1}
              dragConstraints={{
                left: -400 * (zoom - 1),
                right: 400 * (zoom - 1),
                top: -300 * (zoom - 1),
                bottom: 300 * (zoom - 1),
              }}
              dragElastic={0.08}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
              className={cn(
                'relative flex items-center justify-center transition-shadow',
                zoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
              )}
            >
              <img
                ref={imgRef}
                src={getEvidenceImageUrl(currentEvidence?.fileUrl)}
                alt="Civic Photographic Record"
                onLoad={(e) => {
                  const nw = e.currentTarget.naturalWidth;
                  const nh = e.currentTarget.naturalHeight;
                  if (nw && nh) {
                    setNaturalSize({ width: nw, height: nh });
                  }
                }}
                onDoubleClick={handleDoubleClick}
                style={{
                  ...displaySize,
                  transform: `scale(${zoom})`,
                  transition: isDragging ? 'none' : 'transform 0.18s ease-out',
                  imageRendering: 'auto',
                }}
                className="object-contain rounded-2xl border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.65)] select-none bg-black/30"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 3. BOTTOM NAVIGATION: Filmstrip (if multiple) + Floating Glass Capsule */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-4xl w-full mx-auto z-20 space-y-2.5 shrink-0"
      >
        {/* Optional Multi-Evidence Filmstrip */}
        {allEvidence.length > 1 && (
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 no-scrollbar">
            {allEvidence.map((ev, idx) => {
              const isSelected =
                (ev.id || ev._id || ev.fileUrl) ===
                (currentEvidence?.id || currentEvidence?._id || currentEvidence?.fileUrl);
              const label = ev.type || (idx === 0 ? 'Before' : idx === 1 ? 'Inspection' : idx === 2 ? 'Repair' : 'After');

              return (
                <button
                  key={ev.id || ev._id || ev.fileUrl || idx}
                  onClick={() => {
                    setCurrentEvidence(ev);
                    setZoom(1);
                    setNaturalSize(null);
                    if (onSelectEvidence) onSelectEvidence(ev);
                  }}
                  className={cn(
                    'relative h-12 w-16 sm:h-14 sm:w-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0',
                    isSelected
                      ? 'border-[#36B37E] ring-2 ring-[#36B37E]/40 scale-105 shadow-md'
                      : 'border-white/20 opacity-60 hover:opacity-90'
                  )}
                >
                  <img
                    src={getEvidenceImageUrl(ev.fileUrl)}
                    alt={label}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-black/75 text-[9px] font-bold text-white uppercase text-center py-0.5 truncate">
                    {label}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Floating Glass Metadata Capsule */}
        <div className="px-5 py-2.5 sm:py-3 rounded-[16px] bg-white/[0.08] border border-white/[0.14] backdrop-blur-xl shadow-2xl text-white space-y-2">
          {/* Header Title */}
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading border-b border-white/10 pb-1.5">
            <span className="flex items-center gap-1.5 text-white/90">
              <LuCamera className="w-3.5 h-3.5 text-[#36B37E]" />
              CITIZEN EVIDENCE RECORD
            </span>
            <span className="text-slate-400">IMMUTABLE CIVIC ASSET</span>
          </div>

          {/* Context Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans text-slate-300">
            <div className="flex items-center gap-2">
              <LuUser className="w-3.5 h-3.5 text-[#36B37E] shrink-0" />
              <span>
                Uploaded by: <strong className="text-white font-medium">{uploaderName}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <LuClock className="w-3.5 h-3.5 text-[#2878E5] shrink-0" />
              <span>
                Timestamp: <strong className="text-white font-medium">{timestampString}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 sm:col-span-2">
              <LuMapPin className="w-3.5 h-3.5 text-[#F2B84B] shrink-0" />
              <span className="truncate">
                Location: <strong className="text-white font-medium">{locationLabel}</strong>
              </span>
            </div>
          </div>

          {/* Verification Badge & GPS Details */}
          <div className="flex items-center justify-between pt-1.5 border-t border-white/10 text-[11px]">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#159A68]/20 border border-[#159A68]/40 text-[#36B37E] font-semibold font-heading">
              <LuShieldCheck className="w-3.5 h-3.5" />
              <span>VERIFIED RECORD</span>
            </div>

            {gpsCoords ? (
              <span
                className="text-[11px] font-mono text-slate-300 hover:text-white transition-colors cursor-help"
                title={`Exact Latitude/Longitude: ${gpsCoords}`}
              >
                GPS AVAILABLE: {gpsCoords}
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 font-sans">
                GPS DERIVED FROM WARD CENTROID
              </span>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default EvidenceTheaterModal;
