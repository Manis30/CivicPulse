import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import {
  LuMapPin,
  LuBell,
  LuChevronDown,
  LuLogOut,
  LuUser,
} from 'react-icons/lu';

interface CitizenHeaderProps {
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  unreadCount?: number;
  currentWard?: string;
  onWardChange?: (ward: string) => void;
}

const WARDS_LIST = [
  'Ward 12 - Central Hosur',
  'Ward 08 - Bagalur Road Corridor',
  'Ward 05 - SIPCOT Industrial Complex',
  'Ward 03 - Mookandapalli',
  'Ward 01 - Mathigiri',
];

export function CitizenHeader({
  unreadCount = 3,
  currentWard = 'Ward 12 - Central Hosur',
  onWardChange,
}: CitizenHeaderProps) {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const userName = currentUser?.name || 'Chief Architect Miller';

  const userInitials = (() => {
    const parts = userName.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0]?.slice(0, 2).toUpperCase() || 'CA';
  })();

  const [wardDropdownOpen, setWardDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/auth/login');
  };

  const location = useLocation();

  const getContextLabel = () => {
    if (location.pathname.startsWith('/citizen/profile')) return 'Citizen Account';
    if (location.pathname.startsWith('/citizen/incidents')) return 'Citizen Incident Tracking';
    if (location.pathname.startsWith('/citizen/report')) return 'Report a Civic Problem';
    if (location.pathname.startsWith('/citizen/nearby')) return 'Nearby Civic Issues';
    if (location.pathname.startsWith('/citizen/notifications')) return 'Citizen Notifications';
    return 'Citizen Home';
  };

  return (
    <header className="w-full flex items-center justify-between gap-4 px-1 relative z-30 select-none h-[60px] sm:h-[64px]">
      {/* Left: Contextual Page Badge */}
      <div className="flex items-center gap-2.5">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7F7F0] text-[#159A68] text-[11px] font-bold font-heading border border-[#159A68]/20 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#159A68] animate-pulse" />
          <span>{getContextLabel()}</span>
        </span>
      </div>

      {/* Right: Ward Selector Pill, Notification Bell, User Avatar & Menu */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Current Ward Selector Pill */}
        <div className="relative">
          <button
            onClick={() => setWardDropdownOpen(!wardDropdownOpen)}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#DCE6E1] hover:border-[#102A43]/20 shadow-xs text-xs font-semibold text-[#102A43] transition-all cursor-pointer"
          >
            <LuMapPin className="w-3.5 h-3.5 text-[#159A68]" />
            <span className="truncate max-w-[170px]">{currentWard}</span>
            <LuChevronDown className="w-3.5 h-3.5 text-[#829AB1]" />
          </button>

          {wardDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-[#DCE6E1] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <span className="text-[10px] font-bold font-mono text-[#829AB1] uppercase tracking-wider px-3 py-1 block">
                Select Municipal Ward
              </span>
              {WARDS_LIST.map((ward) => (
                <button
                  key={ward}
                  onClick={() => {
                    onWardChange?.(ward);
                    setWardDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    currentWard === ward
                      ? 'bg-[#E7F7F0] text-[#159A68] font-bold'
                      : 'text-[#102A43] hover:bg-[#FAF8F5]'
                  }`}
                >
                  {ward}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Icon Button */}
        <Link
          to="/citizen/notifications"
          className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#DCE6E1] hover:border-[#102A43]/20 text-[#102A43] flex items-center justify-center shadow-xs transition-all hover:bg-slate-50"
          title="Citizen Notifications"
        >
          <LuBell className="w-4 h-4 text-[#526777]" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EF6A63] ring-2 ring-white" />
          )}
        </Link>

        {/* Citizen Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full bg-white border border-[#DCE6E1] hover:border-[#102A43]/20 shadow-xs transition-all text-left cursor-pointer"
          >
            <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-[#102A43] text-white font-bold text-xs font-heading flex items-center justify-center">
              {userInitials}
            </div>

            <div className="hidden lg:block">
              <span className="text-xs font-bold text-[#102A43] block leading-tight">
                {userName}
              </span>
              <span className="text-[10px] text-[#159A68] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#159A68]" />
                <span>Verified Citizen</span>
              </span>
            </div>

            <LuChevronDown className="w-3.5 h-3.5 text-[#829AB1] hidden lg:block" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[#DCE6E1] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3 border-b border-[#E2E9E5] mb-1">
                <span className="text-xs font-bold text-[#102A43] block font-heading">
                  {userName}
                </span>
                <span className="text-[11px] text-[#829AB1] font-sans truncate block">
                  {currentUser?.email || 'citizen.elena@civicpulse.org'}
                </span>
              </div>

              <Link
                to="/citizen/profile"
                onClick={() => setProfileDropdownOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#102A43] hover:bg-[#FAF8F5] transition-colors"
              >
                <LuUser className="w-3.5 h-3.5 text-[#159A68]" />
                <span>Citizen Profile</span>
              </Link>

              <div className="pt-1 mt-1 border-t border-[#E2E9E5]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#EF6A63] hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LuLogOut className="w-3.5 h-3.5" />
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

export default CitizenHeader;
