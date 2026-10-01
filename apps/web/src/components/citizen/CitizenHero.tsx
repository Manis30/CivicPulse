import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { PlusCircle, ArrowRight, Compass } from 'lucide-react';
import { authService } from '@/services/authService';

interface CitizenHeroProps {
  onExploreNearby?: () => void;
}

export function CitizenHero({ onExploreNearby }: CitizenHeroProps) {
  const shouldReduceMotion = useReducedMotion();
  const currentUser = authService.getCurrentUser();
  const userName = currentUser?.name || 'Chief Architect Miller';

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div
      className="relative bg-white border border-[#E3EAE6] rounded-2xl shadow-xs overflow-hidden select-none min-h-[140px] sm:min-h-[150px] md:h-[155px] flex flex-col md:flex-row items-stretch"
    >
      {/* Subtle background urban grid motif */}
      <div className="absolute inset-0 bg-[radial-gradient(#159A68_0.6px,transparent_0.6px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

      {/* Left Content Column: ~64% */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex-1 flex flex-col justify-center px-5 sm:px-7 py-3 sm:py-3.5 z-10 min-w-0"
      >
        {/* Eyebrow Pill: CIVICPULSE ACTIVE */}
        <div className="flex items-center gap-2 mb-1">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.2 rounded-full bg-[#E7F7F0] border border-[#159A68]/20 text-[#159A68] text-[10px] font-bold tracking-wider uppercase font-heading">
            <span className="w-1.5 h-1.5 rounded-full bg-[#159A68]" />
            <span>CIVICPULSE ACTIVE</span>
          </div>
        </div>

        {/* Heading: Global 24px Typography Standard */}
        <h1 className="text-[20px] sm:text-[24px] font-bold font-heading text-[#102A43] tracking-tight leading-[1.2] truncate">
          {getGreeting()},{' '}
          <span className="text-[#159A68]">{userName}</span>
        </h1>

        {/* Subtitle: Global 14px Typography Standard */}
        <p className="text-[13px] sm:text-[14px] text-[#526777] font-normal leading-[1.35] mt-0.5 max-w-lg truncate">
          Your civic reports are being understood, routed and resolved.
        </p>

        {/* Action CTAs: Compact 34px height */}
        <div className="flex flex-wrap items-center gap-2.5 mt-2.5">
          <Link to="/citizen/report">
            <button className="h-[34px] px-3.5 rounded-xl bg-[#159A68] hover:bg-[#128358] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all duration-150 active:scale-98 flex items-center gap-1.5 cursor-pointer group">
              <PlusCircle className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
              <span>Report a Civic Problem</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </Link>

          <button
            onClick={() => {
              if (onExploreNearby) {
                onExploreNearby();
              } else {
                document.getElementById('nearby-issues')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="h-[34px] px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F4F7F5] border border-[#E3EAE6] text-[#102A43] text-xs font-bold hover:text-[#159A68] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-[#159A68]" />
            <span>Explore Nearby</span>
            <ArrowRight className="w-3 h-3 opacity-60" />
          </button>
        </div>
      </motion.div>

      {/* Right Visual Column: ~36% Sophisticated Living City Visual */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
        className="relative md:w-[35%] lg:w-[36%] h-28 md:h-auto overflow-hidden shrink-0 border-t md:border-t-0 md:border-l border-[#E3EAE6]/60 bg-[#F4F8F6]"
      >
        <img
          src="/assets/images/citizen_hero_city.jpg"
          alt="Living City Vector Overview"
          className="w-full h-full object-cover object-center opacity-90"
        />

        {/* Soft edge gradient toward text side */}
        <div className="absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-white via-white/40 to-transparent pointer-events-none hidden md:block" />

        {/* 3 Calm, static incident pin indicators */}
        <div className="absolute top-[32%] left-[45%] -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF6A63] ring-2 ring-white shadow-xs block" />
        </div>
        <div className="absolute top-[52%] right-[32%] -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F2B84B] ring-2 ring-white shadow-xs block" />
        </div>
        <div className="absolute bottom-[30%] left-[35%] -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <span className="w-2.5 h-2.5 rounded-full bg-[#159A68] ring-2 ring-white shadow-xs block" />
        </div>

        {/* Small Living City Label */}
        <div className="absolute bottom-2 right-2.5 z-10 pointer-events-none">
          <span className="text-[9.5px] font-mono font-bold text-[#102A43]/70 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-white/80 shadow-2xs">
            Hosur Digital Twin
          </span>
        </div>
      </motion.div>
    </div>
  );
}

export default CitizenHero;
