import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, PlusCircle, Menu, X, ArrowRight, Shield, Sparkles, LogOut, User } from 'lucide-react';
import { authService } from '@/services/authService';
import { getPortalForRole } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@civicpulse/shared';

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(authService.getCurrentUser());
    };
    window.addEventListener('civicpulse_auth_changed', handleAuthChange);
    return () => window.removeEventListener('civicpulse_auth_changed', handleAuthChange);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    navigate('/');
  };

  const portalPath = currentUser ? getPortalForRole(currentUser.role as UserRole) : '/';
  const roleLabel = currentUser?.role === 'PLATFORM_ADMIN'
    ? 'Admin Console'
    : currentUser?.role === 'DEPARTMENT_MANAGER'
    ? 'Operations Room'
    : currentUser?.role === 'FIELD_OFFICER'
    ? 'Field Tasks'
    : 'Citizen Portal';

  return (
    <header className="sticky top-0 z-50 bg-[#F7F8F4]/80 backdrop-blur-md border-b border-[#102A43]/[0.06] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: CivicPulse Logo & Tagline */}
        <Link to="/" className="flex items-center gap-3.5 group">
          <div className="w-10 h-10 rounded-2xl bg-[#159A68] flex items-center justify-center text-white shadow-sm shadow-[#159A68]/20 transition-transform duration-300 group-hover:scale-105">
            <div className="relative flex items-center justify-center">
              <Activity className="w-5 h-5 text-white stroke-[2.2]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#36B37E] border-2 border-white" />
            </div>
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

        {/* Center: Navigation Links */}
        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#526777] font-heading">
          <a
            href="#hero"
            className="hover:text-[#159A68] transition-colors duration-200"
          >
            City 3D
          </a>
          <a
            href="#why-civicpulse"
            className="hover:text-[#159A68] transition-colors duration-200"
          >
            Why CivicPulse
          </a>
          <a
            href="#workflow"
            className="hover:text-[#159A68] transition-colors duration-200"
          >
            Workflow
          </a>
          <a
            href="#ai-orchestration"
            className="hover:text-[#159A68] transition-colors duration-200"
          >
            AI Agents
          </a>
          <a
            href="#watch-incident"
            className="hover:text-[#159A68] transition-colors duration-200"
          >
            Demo
          </a>
          <a
            href="#verification"
            className="hover:text-[#159A68] transition-colors duration-200"
          >
            Verification
          </a>
          <a
            href="#city-intelligence"
            className="hover:text-[#159A68] transition-colors duration-200"
          >
            Intelligence
          </a>
        </nav>

        {/* Right: Login / Workspace Portal CTA */}
        <div className="hidden md:flex items-center gap-3">
          {currentUser ? (
            <>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs font-semibold text-[#526777] hover:text-rose-600 px-3 py-2 rounded-xl border border-[#102A43]/10 hover:border-rose-300 bg-white/70 transition-all shadow-sm flex items-center gap-1.5"
                title="Sign out of session"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span>Sign Out</span>
              </button>
              <Link
                to={portalPath}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#159A68] hover:bg-[#128358] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#159A68]/20 hover:shadow-lg hover:shadow-[#159A68]/30 transition-all duration-200 group"
              >
                <span>{roleLabel}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="text-xs font-semibold text-[#526777] hover:text-[#102A43] px-3.5 py-2 rounded-xl border border-[#102A43]/10 hover:border-[#102A43]/20 bg-white/70 transition-all shadow-sm"
              >
                Login
              </Link>
              <Link
                to="/citizen/report"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#159A68] hover:bg-[#128358] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#159A68]/20 hover:shadow-lg hover:shadow-[#159A68]/30 transition-all duration-200 group"
              >
                <span>Report a Problem</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#102A43] hover:bg-white rounded-xl transition-colors border border-[#102A43]/10"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#102A43]/10 bg-white/95 backdrop-blur-xl px-5 py-6 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-[#526777]">
            <a
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#159A68] transition-colors"
            >
              City 3D
            </a>
            <a
              href="#why-civicpulse"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#159A68] transition-colors"
            >
              Why CivicPulse
            </a>
            <a
              href="#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#159A68] transition-colors"
            >
              Workflow
            </a>
            <a
              href="#ai-orchestration"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#159A68] transition-colors"
            >
              AI Agents
            </a>
            <a
              href="#watch-incident"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#159A68] transition-colors"
            >
              Product Demonstration
            </a>
            <a
              href="#verification"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#159A68] transition-colors"
            >
              Resolution Verification
            </a>
            <a
              href="#city-intelligence"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#159A68] transition-colors"
            >
              City Intelligence
            </a>
          </nav>

          <div className="pt-4 border-t border-[#102A43]/10 flex flex-col gap-2.5">
            {currentUser ? (
              <>
                <Link
                  to={portalPath}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-[#159A68] text-white text-sm font-semibold shadow-sm"
                >
                  <span>Go to {roleLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-full border border-rose-200 bg-rose-50 text-rose-600 text-sm font-medium hover:bg-rose-100"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/citizen/report"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-[#159A68] text-white text-sm font-semibold shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Report a Problem →</span>
                </Link>
                <Link
                  to="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center py-2.5 rounded-full border border-[#102A43]/15 bg-[#F7F8F4] text-[#102A43] text-sm font-medium hover:bg-white"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
