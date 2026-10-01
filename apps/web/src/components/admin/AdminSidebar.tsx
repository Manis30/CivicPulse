import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuLayoutDashboard,
  LuBot,
  LuSlidersHorizontal,
  LuUsers,
  LuBuilding2,
  LuFileCheck,
  LuActivity,
  LuSettings,
  LuLayers,
  LuChevronLeft,
  LuChevronRight,
  LuLogOut,
} from 'react-icons/lu';
import { authService } from '@/services/authService';
import { cn } from '@/lib/utils';
import { CivicPulseLogo } from '@/components/common/CivicPulseLogo';
import { Tooltip } from '@/components/ui/Tooltip';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  badge?: string | number;
}

interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

export function AdminSidebar({
  collapsed,
  onToggleCollapse,
}: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const adminName = currentUser?.name || 'Chief Architect Miller';

  const userInitials = (() => {
    const parts = adminName.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0]?.slice(0, 2).toUpperCase() || 'AM';
  })();

  // Hover state on the brand header area for morphing into collapse/expand button
  const [isLogoHovered, setIsLogoHovered] = useState(false);

  // Grouped Navigation per Platform Admin specification
  const navGroups: NavGroup[] = [
    {
      id: 'ai-command',
      title: 'AI COMMAND',
      items: [
        {
          id: 'overview',
          label: 'Platform Overview',
          href: '/admin',
          icon: LuLayoutDashboard,
          exact: true,
        },
        {
          id: 'agents',
          label: 'Agent Control Center',
          href: '/admin/agents',
          icon: LuBot,
          badge: '10',
        },
        {
          id: 'policies',
          label: 'AI Policies',
          href: '/admin/policies',
          icon: LuSlidersHorizontal,
        },
      ],
    },
    {
      id: 'governance',
      title: 'GOVERNANCE',
      items: [
        {
          id: 'users',
          label: 'User Governance',
          href: '/admin/users',
          icon: LuUsers,
        },
        {
          id: 'departments',
          label: 'Departments & Wards',
          href: '/admin/departments',
          icon: LuBuilding2,
        },
        {
          id: 'audit',
          label: 'Audit Ledger',
          href: '/admin/audit',
          icon: LuFileCheck,
        },
      ],
    },
    {
      id: 'operations',
      title: 'OPERATIONS',
      items: [
        {
          id: 'incidents',
          label: 'Incident Dossiers',
          href: '/admin/incidents',
          icon: LuLayers,
        },
        {
          id: 'system',
          label: 'System Telemetry',
          href: '/admin/system',
          icon: LuActivity,
          badge: 'LIVE',
        },
      ],
    },
    {
      id: 'system',
      title: 'SYSTEM',
      items: [
        {
          id: 'settings',
          label: 'Settings',
          href: '/admin/settings',
          icon: LuSettings,
        },
      ],
    },
  ];

  return (
    <aside
      style={{ width: 'var(--admin-sidebar-width, 84px)' }}
      className={cn(
        'fixed top-0 left-0 bottom-0 h-[100dvh] z-40 hidden md:flex flex-col box-border overflow-hidden select-none transition-[width] duration-250 ease-in-out p-2',
        collapsed ? 'w-[84px]' : 'w-[256px]'
      )}
    >
      {/* Floating Midnight Indigo Container with Architectural Radiance */}
      <div
        className={cn(
          'admin-sidebar relative h-full w-full rounded-[22px] bg-[#101A2E] border border-[#24324A] shadow-2xl shadow-[#0B1220]/60 flex flex-col justify-between box-border overflow-hidden select-none transition-all duration-250 ease-in-out',
          collapsed ? 'py-3 px-1 items-center' : 'p-3.5'
        )}
      >
        {/* Subtle Top Inner Radiance (Technical Indigo) */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-indigo-500/[0.08] to-transparent pointer-events-none rounded-t-[22px]" />

        {/* =========================================================================
            TOP SECTION: Brand Header with Smooth Morphing Collapse/Expand Action
            ========================================================================= */}
        <div className="admin-sidebar-header relative z-10 w-full shrink-0 pb-1">
          <div
            onMouseEnter={() => setIsLogoHovered(true)}
            onMouseLeave={() => setIsLogoHovered(false)}
            onClick={onToggleCollapse}
            role="button"
            tabIndex={0}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Click to expand sidebar' : 'Click to collapse sidebar'}
            className={cn(
              'group/brand relative flex items-center cursor-pointer transition-colors outline-none focus:ring-1 focus:ring-indigo-500/50',
              collapsed
                ? 'justify-center w-full px-[12px] py-1'
                : 'justify-between w-full px-2 py-1.5 rounded-2xl hover:bg-[#162238]/70'
            )}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggleCollapse();
              }
            }}
          >
            {/* Left/Main Brand Area */}
            <div className={cn('flex items-center gap-2.5 min-w-0', collapsed && 'justify-center w-full')}>
              {/* Logo / Morph Container: 48px square when collapsed, 38px when expanded */}
              <div
                className={cn(
                  'rounded-[14px] bg-[#162238] border border-[#24324A] flex items-center justify-center text-white shrink-0 overflow-hidden shadow-inner group-hover/brand:border-indigo-500/40 transition-colors mx-auto',
                  collapsed ? 'w-[48px] h-[48px]' : 'w-9.5 h-9.5'
                )}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isLogoHovered ? (
                    /* Hover: Smoothly transforms into Collapse [←] or Expand [→] icon */
                    <motion.div
                      key="chevron-icon"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="flex items-center justify-center text-[#22D3EE]"
                    >
                      {collapsed ? (
                        <LuChevronRight className="w-5 h-5 stroke-[2.5]" />
                      ) : (
                        <LuChevronLeft className="w-5 h-5 stroke-[2.5]" />
                      )}
                    </motion.div>
                  ) : (
                    /* Normal: Shows the Admin CivicPulse Brand Mark */
                    <motion.div
                      key="brand-logo"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="flex items-center justify-center"
                    >
                      <CivicPulseLogo size={collapsed ? 30 : 28} variant="admin" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Brand Wordmark & Tagline (Shown only when expanded) */}
              {!collapsed && (
                <div className="overflow-hidden text-left min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-heading font-extrabold text-[17px] tracking-tight text-[#F8FAFC] block leading-none truncate">
                      Civic<span className="text-[#818CF8]">Pulse</span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md text-[9.5px] font-bold font-mono bg-[#162238] text-[#22D3EE] border border-indigo-500/40 tracking-wider shadow-2xs">
                      AI
                    </span>
                  </div>
                  <p className="text-[10.5px] text-[#94A3B8] font-sans font-medium tracking-normal mt-1 leading-none truncate">
                    Autonomous Agent Core
                  </p>
                </div>
              )}
            </div>

            {/* Subtle hover tooltip hint when expanded */}
            {!collapsed && isLogoHovered && (
              <span className="text-[9.5px] font-mono text-indigo-400 uppercase tracking-widest pr-1">
                Collapse
              </span>
            )}
          </div>
        </div>

        {/* =========================================================================
            NAVIGATION GROUPS: 10-12px padding-inline, 48px icon container, no clipping
            ========================================================================= */}
        <nav
          className={cn(
            'admin-sidebar-nav relative z-10 flex-1 min-h-0 w-full flex flex-col overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden my-1',
            collapsed
              ? 'px-1 space-y-1.5 items-center justify-around'
              : 'px-1 space-y-2.5 overflow-y-auto'
          )}
        >
            {navGroups.map((group, groupIdx) => (
              <div key={group.id} className={cn('w-full', collapsed ? 'space-y-1.5 flex flex-col items-center' : 'space-y-1')}>
                {/* Section Header (when expanded) or Thin Divider (when collapsed) */}
                {!collapsed ? (
                  <div className="pt-1.5 pb-1 px-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]/75 font-mono block">
                      {group.title}
                    </span>
                  </div>
                ) : (
                  groupIdx > 0 && <div className="w-8 h-[1px] bg-[#24324A]/70 my-1 mx-auto" />
                )}

                {/* Items inside Group */}
                <div className={cn('flex flex-col', collapsed ? 'space-y-1.5 items-center w-full' : 'space-y-0.5 w-full')}>
                  {group.items.map((item) => {
                    const isActive = item.exact
                      ? location.pathname === item.href
                      : location.pathname.startsWith(item.href) &&
                        (item.href !== '/admin' || location.pathname === '/admin');
                    const Icon = item.icon;

                    if (collapsed) {
                      return (
                        <div key={item.id} className="w-full flex justify-center py-0.5">
                          <Tooltip
                            content={
                              <div className="flex items-center gap-1.5 font-sans">
                                <span>{item.label}</span>
                                {item.badge && (
                                  <span className="text-[9.5px] font-mono font-bold text-[#22D3EE] bg-indigo-500/20 px-1 py-0.5 rounded border border-indigo-500/30">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                            }
                            side="right"
                            className="bg-[#162238] text-[#F8FAFC] border border-[#24324A] shadow-xl py-1 px-2.5 text-xs font-sans rounded-lg"
                          >
                            <Link
                              to={item.href}
                              className={cn(
                                'w-[44px] h-[44px] rounded-[12px] flex items-center justify-center transition-all duration-180 group focus:outline-none focus:ring-1 focus:ring-indigo-500/50 relative shrink-0 mx-auto',
                                isActive
                                  ? 'bg-[rgba(99,102,241,0.16)] border border-[rgba(99,102,241,0.35)] text-[#F8FAFC] shadow-xs'
                                  : 'text-[#94A3B8] border border-transparent hover:bg-[#162238] hover:border-[#24324A] hover:text-[#F8FAFC]'
                              )}
                              aria-label={item.label}
                            >
                              <Icon
                                className={cn(
                                  'w-5 h-5 shrink-0 transition-colors',
                                  isActive
                                    ? 'text-[#818CF8] stroke-[2.2]'
                                    : 'text-[#94A3B8] group-hover:text-[#F8FAFC] stroke-[1.8]'
                                )}
                              />
                              {item.badge && (
                                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#22D3EE] ring-2 ring-[#101A2E]" />
                              )}
                            </Link>
                          </Tooltip>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={item.id}
                        to={item.href}
                        className={cn(
                          'w-full relative flex items-center gap-3 rounded-[13px] font-sans transition-all duration-180 group text-xs font-medium h-11 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500/50',
                          isActive
                            ? 'bg-[rgba(99,102,241,0.16)] border border-[rgba(99,102,241,0.35)] text-[#F8FAFC] font-semibold shadow-xs'
                            : 'text-[#94A3B8] border border-transparent hover:bg-[#162238] hover:border-[#24324A] hover:text-[#F8FAFC]'
                        )}
                      >
                        {/* Active Left Accent Line */}
                        {isActive && (
                          <span className="w-1 h-4 rounded-full bg-[#6366F1] shadow-[0_0_8px_rgba(99,102,241,0.6)] shrink-0 -ml-0.5 mr-0.5" />
                        )}

                        <div className="w-6 h-6 flex items-center justify-center shrink-0">
                          <Icon
                            className={cn(
                              'w-5 h-5 shrink-0 transition-colors',
                              isActive
                                ? 'text-[#818CF8] stroke-[2.2]'
                                : 'text-[#94A3B8] group-hover:text-[#F8FAFC] stroke-[1.8]'
                            )}
                          />
                        </div>
                        <span className="truncate flex-1 text-left">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span
                            className={cn(
                              'px-1.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider',
                              isActive
                                ? 'bg-indigo-500/25 text-[#22D3EE] border border-indigo-400/40'
                                : 'bg-[#162238] text-[#94A3B8] border border-[#24324A]'
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
        </nav>

        {/* =========================================================================
            BOTTOM USER AREA: 44px Centered Card with 14px margins, No Edge Touching
            ========================================================================= */}
        <div className={cn('admin-sidebar-footer relative z-10 w-full shrink-0 pt-2 border-t border-[#24324A]/60 flex flex-col mt-auto', collapsed ? 'px-1 items-center' : 'space-y-1.5')}>
          {collapsed ? (
            <div className="w-full flex justify-center">
              <Tooltip
                content={
                  <div className="space-y-0.5 font-sans">
                    <p className="font-bold text-[#F8FAFC]">{adminName}</p>
                    <p className="text-[10.5px] text-[#94A3B8]">Platform Administrator</p>
                  </div>
                }
                side="right"
                className="bg-[#162238] text-[#F8FAFC] border border-[#24324A] shadow-xl p-2 font-sans rounded-lg"
              >
                <button
                  type="button"
                  onClick={() => navigate('/admin/profile')}
                  className="w-[44px] h-[44px] rounded-[13px] bg-gradient-to-br from-[#6366F1] to-[#4338CA] hover:from-[#4F46E5] hover:to-[#3730A3] border border-indigo-400/40 text-white font-bold text-xs font-heading flex items-center justify-center shadow-xs transition-transform hover:scale-105 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 cursor-pointer mx-auto"
                  aria-label={`Admin Profile: ${adminName}`}
                >
                  {userInitials}
                </button>
              </Tooltip>
            </div>
          ) : (
            <div className="w-full space-y-1">
              <div
                onClick={() => navigate('/admin/profile')}
                className="w-full cursor-pointer rounded-xl bg-[#162238] hover:bg-[#1a2942] border border-[#24324A] transition-all flex items-center justify-between p-2.5 group/profile shadow-xs"
                title="View Platform Admin Profile"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate('/admin/profile');
                  }
                }}
              >
                <div className="flex items-center gap-2.5 overflow-hidden min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#4338CA] border border-indigo-400/40 text-[#F8FAFC] font-bold text-xs font-heading flex items-center justify-center shrink-0 shadow-2xs group-hover/profile:scale-105 transition-transform">
                    {userInitials}
                  </div>

                  <div className="text-left overflow-hidden min-w-0 flex-1">
                    <span className="font-heading font-bold text-[13px] text-[#F8FAFC] block truncate leading-tight">
                      {adminName}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
                      <span className="text-[11px] text-[#94A3B8] font-sans font-medium truncate">
                        Platform Administrator
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[#94A3B8] group-hover/profile:text-[#F8FAFC] group-hover/profile:translate-x-0.5 transition-all">
                  <LuChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Clean Logout */}
              <button
                type="button"
                onClick={() => {
                  authService.logout();
                  navigate('/auth/login');
                }}
                className="w-full text-left text-[11px] font-sans text-[#EF4444]/80 hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors py-1.5 px-2 flex items-center justify-between group/logout cursor-pointer"
                title="Sign out of Admin Portal"
              >
                <div className="flex items-center gap-2">
                  <LuLogOut className="w-3.5 h-3.5 text-[#EF4444]/70 group-hover/logout:text-[#EF4444]" />
                  <span>Sign Out</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;
