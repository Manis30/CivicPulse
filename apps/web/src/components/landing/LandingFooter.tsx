import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Heart, ArrowUp } from 'lucide-react';

export function LandingFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-[#102A43]/[0.08] bg-[#FAF8F5] py-16 px-4 sm:px-6 lg:px-8 font-sans text-left">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-[#159A68] flex items-center justify-center text-white shadow-sm shadow-[#159A68]/20">
                <Activity className="w-5 h-5 text-white stroke-[2.2]" />
              </div>
              <div>
                <span className="font-heading font-bold text-xl tracking-tight text-[#102A43] block leading-none">
                  Civic<span className="text-[#159A68]">Pulse</span>
                </span>
                <span className="text-[11px] text-[#526777] font-sans font-medium block mt-1 tracking-wide">
                  Cleaner Cities. Happier Lives.
                </span>
              </div>
            </Link>

            <p className="text-xs text-[#526777] leading-relaxed max-w-sm">
              Autonomous Civic Incident Operations Platform. Powered by deterministic multi-agent AI orchestration and living 3D digital twins for modern municipal infrastructure.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-[#159A68] font-medium bg-[#E7F7F0] px-3.5 py-1.5 rounded-full w-fit border border-[#159A68]/20">
              <span className="w-2 h-2 rounded-full bg-[#159A68] animate-pulse" />
              <span>Municipal Telemetry Grid Online</span>
            </div>
          </div>

          {/* Navigation Column: Exploration */}
          <div className="md:col-span-2 sm:col-span-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#102A43] font-heading block">
              Exploration
            </span>
            <ul className="space-y-2.5 text-xs text-[#526777]">
              <li>
                <a href="#hero" className="hover:text-[#159A68] transition-colors">
                  Living 3D City
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[#159A68] transition-colors">
                  Action Pipeline
                </a>
              </li>
              <li>
                <a href="#ai-agents" className="hover:text-[#159A68] transition-colors">
                  AI Orchestration
                </a>
              </li>
              <li>
                <a href="#verification" className="hover:text-[#159A68] transition-colors">
                  Resolution Audit
                </a>
              </li>
            </ul>
          </div>

          {/* Navigation Column: For Citizens */}
          <div className="md:col-span-3 sm:col-span-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#102A43] font-heading block">
              Citizens
            </span>
            <ul className="space-y-2.5 text-xs text-[#526777]">
              <li>
                <Link to="/citizen/report" className="hover:text-[#159A68] transition-colors font-semibold text-[#159A68]">
                  Report a Civic Problem
                </Link>
              </li>
              <li>
                <Link to="/citizen/incidents" className="hover:text-[#159A68] transition-colors">
                  Track Incident Status
                </Link>
              </li>
              <li>
                <Link to="/citizen" className="hover:text-[#159A68] transition-colors">
                  Ward Public Portal
                </Link>
              </li>
              <li>
                <Link to="/auth/login" className="hover:text-[#159A68] transition-colors">
                  Citizen Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column: Municipal Operations */}
          <div className="md:col-span-3 sm:col-span-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#102A43] font-heading block">
              Operations
            </span>
            <ul className="space-y-2.5 text-xs text-[#526777]">
              <li>
                <Link to="/manager/command-center" className="hover:text-[#159A68] transition-colors">
                  Operations Cockpit
                </Link>
              </li>
              <li>
                <Link to="/manager/3d-map" className="hover:text-[#159A68] transition-colors">
                  Digital Twin Map
                </Link>
              </li>
              <li>
                <Link to="/officer/tasks" className="hover:text-[#159A68] transition-colors">
                  Field Dispatch Tasks
                </Link>
              </li>
              <li>
                <Link to="/admin/audit" className="hover:text-[#159A68] transition-colors">
                  AI Decision Audit Logs
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar & Copyright */}
        <div className="pt-8 border-t border-[#102A43]/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#526777]">
          <p className="font-heading font-medium text-[#102A43]">
            CivicPulse — Human on the surface. Intelligent underneath.
          </p>

          <div className="flex items-center gap-6">
            <span>© {new Date().getFullYear()} CivicPulse Systems</span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-[#159A68] hover:underline font-semibold"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
