import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuHouse,
  LuCirclePlus,
  LuFileText,
  LuMapPin,
  LuBell,
  LuUserRound,
  LuChevronLeft,
  LuChevronRight,
  LuCheck
} from 'react-icons/lu';
import { authService } from '@/services/authService';
import { cn } from '@/lib/utils';
import { CivicPulseLogo } from '@/components/common/CivicPulseLogo';
import { Tooltip } from '@/components/ui/Tooltip';

interface CitizenSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  unreadCount?: number;
}

export function CitizenSidebar({
  collapsed,
  onToggleCollapse,
  unreadCount = 3,
}: CitizenSidebarProps) {
  const location = useLocation();
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

  // Hover state on the brand header area for morphing into collapse/expand button
  const [isLogoHovered, setIsLogoHovered] = useState(false);

  const navItems = [
    {
      id: 'home',
      label: 'Citizen Home',
      href: '/citizen',
      icon: LuHouse,
      exact: true,
    },
    {
      id: 'report',
      label: 'Report a Problem',
      href: '/citizen/report',
      icon: LuCirclePlus,
    },
    {
      id: 'incidents',
      label: 'My Incidents',
      href: '/citizen/incidents',
      icon: LuFileText,
    },
    {
      id: 'nearby',
      label: 'Nearby Issues',
      href: '/citizen/nearby',
      icon: LuMapPin,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      href: '/citizen/notifications',
      icon: LuBell,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      id: 'profile',
      label: 'Profile',
      href: '/citizen/profile',
      icon: LuUserRound,
    },
  ];

  return (
    <aside
      className={cn(
        'relative hidden md:flex flex-col shrink-0 select-none transition-all duration-250 ease-in-out z-40',
        collapsed ? 'w-[76px] p-2' : 'w-[248px] p-2.5'
      )}
    >
      {/* Curved Emerald Container with Soft Urban 3D Gradient */}
      <div
        className={cn(
          'relative w-full h-[calc(100vh-1.25rem)] rounded-[26px] bg-gradient-to-b from-[#134E35] via-[#0D3826] to-[#072418] border border-white/10 shadow-xl shadow-[#072418]/30 flex flex-col justify-between transition-all duration-250 ease-in-out',
          collapsed ? 'px-2 py-3.5 items-center overflow-x-hidden' : 'p-3.5 overflow-hidden'
        )}
      >
        {/* Subtle Top Inner Radiance */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-[26px]" />

        {/* =========================================================================
            TOP SECTION: Brand Header with Smooth Morphing Collapse/Expand Action
            ========================================================================= */}
        <div className="relative z-10 w-full space-y-4">
          <div
            onMouseEnter={() => setIsLogoHovered(true)}
            onMouseLeave={() => setIsLogoHovered(false)}
            onClick={onToggleCollapse}
            role="button"
            tabIndex={0}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Click to expand sidebar' : 'Click to collapse sidebar'}
            className={cn(
              'group/brand relative flex items-center rounded-2xl cursor-pointer transition-colors outline-none focus:ring-2 focus:ring-[#36B37E]/40',
              collapsed
                ? 'justify-center w-full py-1'
                : 'justify-between w-full px-2 py-1.5 hover:bg-white/[0.06]'
            )}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggleCollapse();
              }
            }}
          >
            {/* Left/Main Brand Area */}
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Logo / Morph Container: 36px square */}
              <div className="relative w-9 h-9 rounded-xl bg-white/12 border border-white/18 flex items-center justify-center text-white shrink-0 overflow-hidden shadow-inner">
                <AnimatePresence mode="wait" initial={false}>
                  {isLogoHovered ? (
                    /* Hover: Smoothly transforms into Collapse [←] or Expand [→] icon */
                    <motion.div
                      key="chevron-icon"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="flex items-center justify-center text-[#36B37E]"
                    >
                      {collapsed ? (
                        <LuChevronRight className="w-5 h-5 stroke-[2.5]" />
                      ) : (
                        <LuChevronLeft className="w-5 h-5 stroke-[2.5]" />
                      )}
                    </motion.div>
                  ) : (
                    /* Normal: Shows the clean CivicPulse Brand Mark */
                    <motion.div
                      key="brand-logo"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="flex items-center justify-center"
                    >
                      <CivicPulseLogo size={28} variant="white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Brand Wordmark (Shown only when expanded) */}
              {!collapsed && (
                <div className="overflow-hidden text-left min-w-0">
                  <span className="font-heading font-extrabold text-[18px] tracking-tight text-white block leading-none truncate">
                    Civic<span className="text-[#36B37E]">Pulse</span>
                  </span>
                </div>
              )}
            </div>

            {/* Subtle hover tooltip hint when expanded */}
            {!collapsed && isLogoHovered && (
              <span className="text-[10px] font-mono text-[#A3E6C8] uppercase tracking-wider pr-1">
                Collapse
              </span>
            )}
          </div>

          {/* =========================================================================
              NAVIGATION ITEMS: Compact Vertical Spacing, React Icons, Light Active Item
              ========================================================================= */}
          <nav className={cn('flex flex-col', collapsed ? 'space-y-2 items-center w-full' : 'space-y-1 w-full')}>
            {navItems.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.href
                : location.pathname.startsWith(item.href) && item.href !== '/citizen';
              const Icon = item.icon;

              if (collapsed) {
                return (
                  <Tooltip key={item.id} content={item.label} side="right">
                    <Link
                      to={item.href}
                      className={cn(
                        'relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-180 group focus:outline-none focus:ring-2 focus:ring-white/40',
                        isActive
                          ? 'bg-white text-[#102A43] shadow-sm font-bold border border-[#159A68]/20'
                          : 'text-[#C5ECD9] hover:bg-white/[0.08] hover:text-white'
                      )}
                      aria-label={item.label}
                    >
                      <Icon
                        className={cn(
                          'w-4.5 h-4.5 shrink-0 transition-colors',
                          isActive ? 'text-[#159A68] stroke-[2.4]' : 'text-[#A3E6C8] group-hover:text-white stroke-[2]'
                        )}
                      />
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF6A63] ring-2 ring-[#0D3826]" />
                      )}
                    </Link>
                  </Tooltip>
                );
              }

              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className={cn(
                    'w-full relative flex items-center gap-3 rounded-xl font-sans transition-all duration-180 group text-xs font-semibold h-11 px-3 focus:outline-none focus:ring-2 focus:ring-white/40',
                    isActive
                      ? 'bg-white text-[#102A43] shadow-sm font-bold border border-[#159A68]/20'
                      : 'text-[#C5ECD9] hover:bg-white/[0.08] hover:text-white'
                  )}
                >
                  {/* Active Left Accent Line */}
                  {isActive && (
                    <span className="w-1 h-5 rounded-full bg-[#159A68] shrink-0 -ml-1 mr-0.5" />
                  )}

                  <Icon
                    className={cn(
                      'w-4.5 h-4.5 shrink-0 transition-colors',
                      isActive ? 'text-[#159A68] stroke-[2.4]' : 'text-[#A3E6C8] group-hover:text-white stroke-[2]'
                    )}
                  />
                  <span className="truncate flex-1 text-left">
                    {item.label}
                  </span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-bold font-mono',
                        isActive
                          ? 'bg-[#159A68] text-white'
                          : 'bg-[#36B37E] text-[#072418]'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* =========================================================================
            BOTTOM USER PROFILE: Compact Identity Rail (Emergency card removed!)
            ========================================================================= */}
        <div className={cn('relative z-10 pt-2 flex flex-col', collapsed ? 'items-center w-full' : 'w-full')}>
          {collapsed ? (
            <Tooltip content={`${userName} · Verified Citizen`} side="right">
              <button
                type="button"
                onClick={() => navigate('/citizen/profile')}
                className="w-10 h-10 rounded-full bg-[#159A68] hover:bg-[#128358] border-2 border-white/30 text-white font-bold text-xs font-heading flex items-center justify-center shadow-sm transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer"
                aria-label={`Citizen Profile: ${userName}`}
              >
                {userInitials}
              </button>
            </Tooltip>
          ) : (
            <div
              onClick={() => navigate('/citizen/profile')}
              className="w-full cursor-pointer rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition-all flex items-center justify-between p-2.5 group/profile"
              title="View Citizen Profile"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  navigate('/citizen/profile');
                }
              }}
            >
              <div className="flex items-center gap-2.5 overflow-hidden min-w-0 flex-1">
                <div className="w-9 h-9 rounded-full bg-[#159A68] border-2 border-white/30 text-white font-bold text-xs font-heading flex items-center justify-center shrink-0 shadow-2xs group-hover/profile:scale-105 transition-transform">
                  {userInitials}
                </div>

                <div className="text-left overflow-hidden min-w-0 flex-1">
                  <span className="font-heading font-bold text-[13px] text-white block truncate leading-tight">
                    {userName}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#36B37E]" />
                    <span className="text-[11px] text-[#A3E6C8] font-sans font-medium">
                      Verified Citizen
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[#A3E6C8] group-hover/profile:text-white transition-colors">
                <LuChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default CitizenSidebar;
