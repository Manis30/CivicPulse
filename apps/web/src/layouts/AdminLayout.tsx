import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LuLayoutDashboard,
  LuBot,
  LuSlidersHorizontal,
  LuUsers,
  LuBuilding2,
  LuFileCheck,
  LuActivity,
  LuSettings,
  LuMenu,
  LuX,
  LuChevronRight,
  LuLogOut,
} from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { authService } from '@/services/authService';
import { CommandPalette } from '@/components/common/CommandPalette';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { LuLayers } from 'react-icons/lu';

const ADMIN_SIDEBAR_STORAGE_KEY = 'civicpulse-admin-sidebar-collapsed';

export function AdminLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentUser = authService.getCurrentUser();

  // Scroll to top on route change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(ADMIN_SIDEBAR_STORAGE_KEY);
      return stored === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(ADMIN_SIDEBAR_STORAGE_KEY, String(next));
      } catch (err) {
        console.warn('Failed to persist admin sidebar state in localStorage:', err);
      }
      return next;
    });
  };

  // Mobile navigation structure matching desktop
  const mobileNavGroups = [
    {
      title: 'AI COMMAND',
      items: [
        { label: 'Platform Overview', href: '/admin', exact: true, icon: LuLayoutDashboard },
        { label: 'Agent Control Center', href: '/admin/agents', icon: LuBot, badge: '10' },
        { label: 'AI Policies', href: '/admin/policies', icon: LuSlidersHorizontal },
      ],
    },
    {
      title: 'GOVERNANCE',
      items: [
        { label: 'User Governance', href: '/admin/users', icon: LuUsers },
        { label: 'Departments & Wards', href: '/admin/departments', icon: LuBuilding2 },
        { label: 'Audit Ledger', href: '/admin/audit', icon: LuFileCheck },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { label: 'Incident Dossiers', href: '/admin/incidents', icon: LuLayers },
        { label: 'System Telemetry', href: '/admin/system', icon: LuActivity, badge: 'LIVE' },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { label: 'Settings', href: '/admin/settings', icon: LuSettings },
      ],
    },
  ];

  const sidebarWidth = isSidebarCollapsed ? '84px' : '256px';

  return (
    <div
      style={{ '--admin-sidebar-width': sidebarWidth } as React.CSSProperties}
      className="min-h-screen w-full bg-[#07111F] text-[#F8FAFC] font-sans antialiased selection:bg-[#5B5BF7] selection:text-white relative box-border overflow-x-hidden"
    >
      <CommandPalette />

      {/* Fixed Midnight Indigo Admin Sidebar */}
      <AdminSidebar
        collapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* Main Control Pane & Viewport (Single primary scroll, zero nested scrollbar) */}
      <div
        ref={scrollContainerRef}
        style={{
          marginLeft: 'var(--admin-sidebar-width)',
          width: 'calc(100% - var(--admin-sidebar-width))',
        }}
        className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#07111F] box-border transition-[margin-left,width] duration-250 ease-in-out max-md:!ml-0 max-md:!w-full overflow-x-hidden"
      >
        {/* Production Admin Topbar */}
        <AdminTopbar
          mobileNavOpen={mobileNavOpen}
          onToggleMobileNav={() => setMobileNavOpen(!mobileNavOpen)}
        />

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="md:hidden bg-[#101A2E] border-b border-[#24324A] p-4 space-y-4 font-sans text-xs z-30 shadow-xl">
            {mobileNavGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]/75 font-mono px-2 block">
                  {group.title}
                </span>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = item.exact
                      ? location.pathname === item.href
                      : location.pathname.startsWith(item.href) &&
                        (item.href !== '/admin' || location.pathname === '/admin');
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setMobileNavOpen(false)}
                        className={cn(
                          'flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors',
                          isActive
                            ? 'bg-[rgba(99,102,241,0.16)] text-[#F8FAFC] border border-[rgba(99,102,241,0.35)] font-semibold'
                            : 'text-[#94A3B8] hover:bg-[#162238] hover:text-[#F8FAFC]'
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={cn('w-4 h-4', isActive ? 'text-[#818CF8]' : 'text-[#94A3B8]')} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[9.5px] font-mono font-bold text-[#22D3EE] bg-indigo-500/20 px-1.5 py-0.5 rounded border border-indigo-500/30">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="pt-2 border-t border-[#24324A]">
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  authService.logout();
                  navigate('/auth/login');
                }}
                className="w-full text-left text-xs font-sans text-rose-400 hover:text-rose-300 p-2 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <LuLogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Main Content Viewport — Standardized 28px Desktop Gutter, 20px Tablet, 16px Mobile */}
        <main className="flex-1 w-full px-4 sm:px-5 lg:px-7 py-6 min-w-0 box-border">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
