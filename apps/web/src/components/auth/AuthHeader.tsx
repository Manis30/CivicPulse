import { Link, useLocation } from 'react-router-dom';
import { Activity, ArrowLeft } from 'lucide-react';

export function AuthHeader() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/auth/login';

  return (
    <header className="h-16 md:h-16 w-full bg-white/95 backdrop-blur-md border-b border-[#D9E2EC]/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 z-30 select-none">
      {/* Brand Identity */}
      <Link
        to="/"
        className="flex items-center gap-3 group transition-opacity hover:opacity-95"
        aria-label="CivicPulse Home"
      >
        <div className="w-9 h-9 rounded-xl bg-[#2878E5] flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105">
          <div className="relative flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#159A68] border-2 border-white" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="font-heading font-bold text-base tracking-tight text-[#102A43] leading-none">
            Civic<span className="text-[#2878E5]">Pulse</span>
          </span>
          <span className="text-[10px] text-[#526777] font-sans font-medium tracking-wide mt-0.5">
            Living City Platform
          </span>
        </div>
      </Link>

      {/* Focused Navigation CTAs (No full landing page links) */}
      <div className="flex items-center gap-3 sm:gap-4 text-xs font-sans">
        <Link
          to="/"
          className="hidden sm:inline-flex items-center gap-1.5 text-[#526777] hover:text-[#102A43] font-medium px-2.5 py-1.5 rounded-lg hover:bg-slate-100/70 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        {isLoginPage ? (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 hidden md:inline">Need an account?</span>
            <Link
              to="/auth/register"
              className="text-[#2878E5] font-semibold hover:text-[#1F65C7] px-2.5 py-1.5 rounded-lg hover:bg-blue-50/60 transition-colors"
            >
              Register as Citizen
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 hidden md:inline">Already registered?</span>
            <Link
              to="/auth/login"
              className="text-[#2878E5] font-semibold hover:text-[#1F65C7] px-2.5 py-1.5 rounded-lg hover:bg-blue-50/60 transition-colors"
            >
              Sign in
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
