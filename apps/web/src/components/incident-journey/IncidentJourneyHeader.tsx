import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IncidentJourneyHeaderProps {
  eventCount: number;
  isLive?: boolean;
  lastUpdatedText?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export function IncidentJourneyHeader({
  eventCount,
  isLive = true,
  lastUpdatedText = 'Updated just now',
  onRefresh,
  isRefreshing = false,
  className,
}: IncidentJourneyHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E3EAE6]',
        className
      )}
    >
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-[#102A43] tracking-tight">
            INCIDENT JOURNEY
          </h2>
        </div>
        <p className="text-xs text-[#6B7C8F] font-sans mt-0.5">
          Every decision, action and verification — from first report to resolution.
        </p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
        {/* Live indicator badge */}
        {isLive && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E7F7F0] border border-[#159A68]/25 text-[#0B3D2E] text-xs font-bold font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#159A68] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#159A68]" />
            </span>
            <span className="tracking-wider text-[11px]">LIVE</span>
          </div>
        )}

        {/* Animated Event Count Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E3EAE6] text-xs text-[#102A43] font-bold font-mono shadow-2xs">
          <AnimatePresence mode="wait">
            <motion.span
              key={eventCount}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
            >
              {eventCount}
            </motion.span>
          </AnimatePresence>
          <span className="text-[#829AB1] font-heading uppercase text-[11px]">
            {eventCount === 1 ? 'EVENT' : 'EVENTS'}
          </span>
        </div>

        {/* Last updated text */}
        <span className="text-[11px] text-[#829AB1] font-sans hidden md:inline-block">
          {lastUpdatedText}
        </span>

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh event stream"
            className="p-1.5 rounded-lg text-[#6B7C8F] hover:text-[#102A43] hover:bg-[#FAF8F5] border border-transparent hover:border-[#E3EAE6] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isRefreshing && 'animate-spin text-[#159A68]')} />
          </button>
        )}
      </div>
    </div>
  );
}
