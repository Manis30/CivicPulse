import { Outlet, Link, useLocation } from 'react-router-dom';
import { Activity, ArrowRight, Menu, X, PlusCircle, Search, ShieldCheck, Leaf } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { CommandPalette } from '@/components/common/CommandPalette';

export function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isLanding = location.pathname === '/' || location.pathname === '/landing';

  if (isLanding) {
    return (
      <div className="min-h-screen bg-[#F2F3FF] text-[#0E1330] flex flex-col font-sans selection:bg-[#5B5BF5] selection:text-white antialiased">
        <CommandPalette />
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white antialiased">
      <CommandPalette />

      {/* Clean Public Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo & Statement */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <div className="relative flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-blue-600" />
              </div>
            </div>
            <div>
              <span className="font-heading font-bold text-lg tracking-tight text-slate-900 block leading-tight">
                Civic<span className="text-blue-600">Pulse</span>
              </span>
              <span className="text-[11px] text-slate-500 font-sans block leading-none">
                Your City Speaks. We Listen.
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-slate-600">
            <Link to="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link to="/#how-it-works" className="hover:text-blue-600 transition-colors">
              How It Works
            </Link>
            <Link to="/manager/3d-map" className="hover:text-blue-600 transition-colors">
              Live City Map
            </Link>
            <Link to="/#impact" className="hover:text-blue-600 transition-colors">
              Community Impact
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/citizen/report">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<PlusCircle className="w-4 h-4" />}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-semibold"
              >
                Report an Issue
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button variant="secondary" size="sm" className="font-semibold text-slate-700 border-slate-200">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white p-4 space-y-3 font-sans text-sm shadow-lg">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-700 font-medium py-1.5 hover:text-blue-600"
            >
              Home
            </Link>
            <Link
              to="/citizen/report"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-blue-600 font-semibold py-1.5"
            >
              Report an Issue
            </Link>
            <Link
              to="/manager/3d-map"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-700 font-medium py-1.5 hover:text-blue-600"
            >
              Explore Live City Map
            </Link>
            <Link
              to="/manager/command-center"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-700 font-medium py-1.5 hover:text-blue-600"
            >
              Operations Command Center
            </Link>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" size="sm" className="w-full">
                  Sign In / Switch Role
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Public Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Clean Municipal SaaS Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold font-heading">
              CP
            </div>
            <div>
              <span className="font-bold text-slate-800 font-heading">CivicPulse</span>
              <span className="mx-2">•</span>
              <span>Clean Urban-Tech Operations Platform</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/landing" className="hover:text-blue-600 transition-colors">
              Platform Overview
            </Link>
            <Link to="/auth/login" className="hover:text-blue-600 transition-colors">
              Sign In
            </Link>
            <Link to="/auth/register" className="hover:text-blue-600 transition-colors">
              Citizen Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
