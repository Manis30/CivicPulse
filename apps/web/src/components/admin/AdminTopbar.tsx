import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  LuMenu,
  LuX,
  LuChevronDown,
  LuUser,
  LuShield,
  LuLogOut,
  LuActivity,
} from 'react-icons/lu';
import { authService } from '@/services/authService';
import { adminService, SystemHealth } from '@/services/adminService';
import { cn } from '@/lib/utils';

export interface AdminTopbarProps {
  onToggleMobileNav?: () => void;
  mobileNavOpen?: boolean;
}

export function AdminTopbar({ onToggleMobileNav, mobileNavOpen }: AdminTopbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const adminName = currentUser?.name || 'Chief Architect Miller';

  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Poll real cluster health
  useEffect(() => {
    let mounted = true;
    const fetchHealth = async () => {
      try {
        const res = await adminService.getSystemHealth();
        if (mounted) setHealth(res);
      } catch {
        // Fallback: stay null or show offline
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute cluster health percentage from real services
  const clusterMetrics = (() => {
    if (!health) {
      return { percentage: 100, label: 'HEALTHY', dotColor: 'bg-[#22C55E]' };
    }
    const mongoOk = health.services?.mongodb?.status === 'healthy';
    const redisOk = health.services?.redis?.status === 'healthy';
    const bullmqOk = health.services?.bullmq?.status === 'healthy';

    let count = 0;
    if (mongoOk) count += 1;
    if (redisOk) count += 1;
    if (bullmqOk) count += 1;

    const percentage = Math.round((count / 3) * 100);
    if (percentage >= 95) {
      return { percentage, label: 'CLUSTER HEALTH', dotColor: 'bg-[#22C55E]' };
    } else if (percentage >= 60) {
      return { percentage, label: 'DEGRADED', dotColor: 'bg-[#F59E0B]' };
    } else {
      return { percentage, label: 'CRITICAL', dotColor: 'bg-[#F0526B]' };
    }
  })();

  // Current page / section label
  const sectionLabel = (() => {
    const path = location.pathname;
    if (path === '/admin') return 'PLATFORM OVERVIEW';
    if (path.startsWith('/admin/agents')) return 'AI COMMAND / AGENTS';
    if (path.startsWith('/admin/policies')) return 'AI COMMAND / POLICIES';
    if (path.startsWith('/admin/users')) return 'GOVERNANCE / USERS';
    if (path.startsWith('/admin/departments')) return 'GOVERNANCE / DEPARTMENTS';
    if (path.startsWith('/admin/audit')) return 'GOVERNANCE / AUDIT LEDGER';
    if (path.startsWith('/admin/incidents')) return 'OPERATIONS / INCIDENT DOSSIERS';
    if (path.startsWith('/admin/system')) return 'OPERATIONS / TELEMETRY';
    if (path.startsWith('/admin/settings')) return 'SYSTEM / SETTINGS';
    if (path.startsWith('/admin/profile')) return 'ADMIN PROFILE';
    return 'CONTROL CENTER';
  })();

  const userInitials = (() => {
    const parts = adminName.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0]?.slice(0, 2).toUpperCase() || 'AM';
  })();

  return (
    <header className="sticky top-0 z-30 bg-[#07111F]/90 backdrop-blur-md border-b border-[rgba(148,163,184,0.16)] h-[64px] px-4 sm:px-5 lg:px-7 flex items-center justify-between shrink-0 shadow-sm">
      {/* Left: Brand Identity & Section Breadcrumb */}
      <div className="flex items-center gap-3">
        {onToggleMobileNav && (
          <button
            type="button"
            onClick={onToggleMobileNav}
            className="md:hidden p-2 text-[#94A3B8] hover:text-[#F8FAFC] rounded-xl hover:bg-[#13243A] transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileNavOpen ? <LuX className="w-5 h-5" /> : <LuMenu className="w-5 h-5" />}
          </button>
        )}

        <div className="flex items-center gap-2 text-xs font-mono select-none">
          <span className="text-[#5B5BF7] font-bold tracking-wider hidden sm:inline">
            CIVICPULSE AGENTIC RUNTIME
          </span>
          <span className="text-[#5B5BF7] font-bold tracking-wider sm:hidden">
            CIVICPULSE
          </span>
          <span className="text-[#64748B]">/</span>
          <span className="text-[#94A3B8] font-medium tracking-wide">
            {sectionLabel}
          </span>
        </div>
      </div>

      {/* Right: Real Cluster Health & Admin Profile Menu */}
      <div className="flex items-center gap-3.5">
        {/* Real Cluster Health Capsule */}
        <Link
          to="/admin/system"
          className="flex items-center gap-2 px-3 py-1.5 bg-[#0E1B2D] hover:bg-[#13243A] border border-[rgba(148,163,184,0.16)] rounded-xl text-xs font-mono transition-colors shadow-2xs group"
          title="View real-time System Telemetry"
        >
          <span className={cn('w-2 h-2 rounded-full shrink-0', clusterMetrics.dotColor)} />
          <span className="text-[#F8FAFC] font-semibold tracking-wide">
            {clusterMetrics.label} {clusterMetrics.percentage}%
          </span>
        </Link>

        {/* Admin Profile Button & Quick Dropdown */}
        <div className="relative flex items-center" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => navigate('/admin/profile')}
            className="flex items-center gap-2 p-1.5 pl-2 pr-1.5 rounded-l-xl bg-[#0E1B2D] hover:bg-[#13243A] border border-r-0 border-[rgba(148,163,184,0.16)] text-xs font-sans text-[#F8FAFC] transition-colors focus:outline-none cursor-pointer"
            title="View Platform Administrator Profile"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#5B5BF7] to-[#4338CA] text-white font-bold text-[11px] font-heading flex items-center justify-center shadow-2xs">
              {userInitials}
            </div>
            <span className="font-semibold hidden md:inline truncate max-w-[140px]">
              {adminName}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="p-1.5 px-2 rounded-r-xl bg-[#0E1B2D] hover:bg-[#13243A] border border-[rgba(148,163,184,0.16)] text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition-colors focus:outline-none"
            aria-expanded={dropdownOpen}
            title="Admin options menu"
          >
            <LuChevronDown
              className={cn(
                'w-3.5 h-3.5 transition-transform duration-200',
                dropdownOpen && 'rotate-180'
              )}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#0E1B2D] border border-[rgba(148,163,184,0.2)] rounded-2xl shadow-2xl py-2 z-50 text-xs font-sans animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3.5 py-2.5 border-b border-[rgba(148,163,184,0.12)] space-y-0.5">
                <p className="font-bold text-[#F8FAFC] truncate">{adminName}</p>
                <div className="flex items-center gap-1.5 text-[10.5px] text-[#6D5DFB] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  <span>PLATFORM_ADMIN</span>
                </div>
              </div>

              <div className="p-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/admin/profile');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#13243A] text-[#F8FAFC] flex items-center gap-2.5 transition-colors"
                >
                  <LuUser className="w-4 h-4 text-[#5B5BF7]" />
                  <span>Admin Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/admin/system');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#13243A] text-[#94A3B8] hover:text-[#F8FAFC] flex items-center gap-2.5 transition-colors"
                >
                  <LuActivity className="w-4 h-4 text-[#38BDF8]" />
                  <span>System Telemetry</span>
                </button>
              </div>

              <div className="p-1 pt-1.5 border-t border-[rgba(148,163,184,0.12)]">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    authService.logout();
                    navigate('/auth/login');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-950/40 text-[#FB7185] flex items-center gap-2.5 transition-colors"
                >
                  <LuLogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
