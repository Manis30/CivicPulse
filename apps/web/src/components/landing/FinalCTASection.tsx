import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Compass,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export function FinalCTASection() {
  const [resolvedState, setResolvedState] = useState<boolean>(true);

  return (
    <section className="py-20 lg:py-28 bg-[#EEF4F7] relative overflow-hidden border-t border-[#102A43]/[0.06]">
      {/* Background Soft Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#159A68]/[0.05] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative rounded-[36px] overflow-hidden bg-white border border-[#102A43]/[0.08] p-8 sm:p-14 lg:p-20 shadow-xl shadow-[#102A43]/[0.03] text-left">
          {/* Subtle Ambient City Skyline Geometric Grid */}
          <div className="absolute bottom-0 right-0 w-full lg:w-1/2 h-64 opacity-25 pointer-events-none flex items-end justify-end pr-10">
            <svg viewBox="0 0 400 200" className="w-full h-full max-w-md">
              {/* Stylized Modern 3D Isometric Skyline */}
              <polygon points="40,200 40,110 80,80 120,110 120,200" fill="#2878E5" opacity="0.3" />
              <polygon points="120,200 120,60 170,30 220,60 220,200" fill="#159A68" opacity="0.4" />
              <polygon points="220,200 220,90 270,50 320,90 320,200" fill="#36B37E" opacity="0.3" />
              <polygon points="320,200 320,130 360,100 400,130 400,200" fill="#102A43" opacity="0.2" />

              {/* Transitioning Incident Markers */}
              <circle cx="80" cy="70" r="7" fill={resolvedState ? '#36B37E' : '#EF6A63'} />
              <circle cx="170" cy="20" r="8" fill={resolvedState ? '#36B37E' : '#F2B84B'} />
              <circle cx="270" cy="40" r="7" fill="#36B37E" />
            </svg>
          </div>

          <div className="relative z-10 max-w-3xl space-y-6">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E7F7F0] border border-[#159A68]/20 text-[#159A68] text-xs font-bold tracking-wider uppercase font-heading">
              <Sparkles className="w-3.5 h-3.5" />
              <span>COMMUNITY ACTION IN MOTION</span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-[#102A43] tracking-tight leading-[1.08]">
              See a problem? <br />
              <span className="text-[#159A68]">Help your city solve it.</span>
            </h2>

            {/* Supporting Text */}
            <p className="text-base sm:text-xl text-[#526777] font-sans leading-relaxed max-w-2xl font-normal">
              One report can start a chain of action.
              CivicPulse connects citizens directly to autonomous municipal workflows — making everyday civic care seamless and verifiable.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <Link to="/citizen/report">
                <button className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#159A68] hover:bg-[#128358] text-white text-sm font-semibold shadow-lg shadow-[#159A68]/25 hover:shadow-xl hover:shadow-[#159A68]/35 transition-all duration-200 group">
                  <PlusCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>Report a Civic Problem</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>

              <a
                href="#hero"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-[#FAF8F5] hover:bg-white border border-[#102A43]/10 text-[#102A43] text-sm font-semibold shadow-sm hover:shadow transition-all duration-200"
              >
                <Compass className="w-4 h-4 text-[#2878E5]" />
                <span>Explore the City</span>
              </a>
            </div>

            {/* Transition Demonstrator Note (Section 19: Transition toward green/resolved) */}
            <div className="pt-8 border-t border-[#102A43]/[0.08] flex flex-wrap items-center justify-between gap-4 text-xs text-[#526777]">
              <div className="flex items-center gap-3">
                <span className="font-heading font-bold text-[#102A43]">
                  RESOLUTION CYCLE:
                </span>
                <span className="flex items-center gap-1.5 font-medium text-[#102A43]">
                  <span>REPORT</span>
                  <span>→</span>
                  <span>ACTION</span>
                  <span>→</span>
                  <span className="text-[#159A68] font-bold">VERIFIED RESOLUTION ✓</span>
                </span>
              </div>

              <button
                onClick={() => setResolvedState(!resolvedState)}
                className="inline-flex items-center gap-1.5 text-xs text-[#159A68] font-semibold hover:underline"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Toggle Marker State ({resolvedState ? 'Resolved' : 'Active'})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
