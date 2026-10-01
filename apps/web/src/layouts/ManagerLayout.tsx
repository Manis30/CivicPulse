import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  ListOrdered,
  Sparkles,
  Bot,
  ShieldCheck,
  Building2,
  Send,
  Users,
  BarChart3,
  FileText,
  Settings,
  Bell,
  Search,
  ArrowRight,
  Menu,
  X,
  Activity,
  ChevronRight,
  Leaf,
  Layers,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { authService } from '@/services/authService';
import { Avatar } from '@/components/ui/Overlays';
import { CommandPalette } from '@/components/common/CommandPalette';

export function ManagerLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  // Exactly grouped per Section 11 specifications
  const navGroups = [
    {
      title: 'CITY OPERATIONS',
      items: [
        { label: 'Overview', href: '/manager/command-center', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Live Map', href: '/manager/3d-map', icon: <Map className="w-4 h-4" /> },
        { label: 'Incidents', href: '/manager/incidents', icon: <ListOrdered className="w-4 h-4" /> },
      ],
    },
    {
      title: 'AI INTELLIGENCE',
      items: [
        { label: 'AI Intelligence', href: '/manager/intelligence', icon: <Sparkles className="w-4 h-4" /> },
        { label: 'AI Command Center', href: '/admin/agents', icon: <Bot className="w-4 h-4" /> },
        { label: 'Decision Audit', href: '/manager/ai-decisions', icon: <ShieldCheck className="w-4 h-4" /> },
      ],
    },
    {
      title: 'DEPARTMENTS',
      items: [
        { label: 'Departments', href: '/manager/departments', icon: <Building2 className="w-4 h-4" /> },
        { label: 'Dispatch', href: '/manager/dispatch', icon: <Send className="w-4 h-4" /> },
        { label: 'Field Teams', href: '/manager/teams', icon: <Users className="w-4 h-4" /> },
      ],
    },
    {
      title: 'INSIGHTS',
      items: [
        { label: 'Analytics', href: '/manager/analytics', icon: <BarChart3 className="w-4 h-4" /> },
        { label: 'Reports', href: '/manager/reports', icon: <FileText className="w-4 h-4" /> },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { label: 'Settings', href: '/manager/settings', icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans antialiased">
      <CommandPalette />

      {/* Modern Enterprise SaaS Sidebar (256px, #FFFFFF, right border #E2E8F0) */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0 justify-between select-none">
        <div className="p-5 space-y-6">
          {/* CivicPulse Brand Motif (Section 10 & 38) */}
          <Link to="/manager/command-center" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              {/* City + Leaf + Pulse motif */}
              <div className="relative flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-blue-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-bold text-base tracking-tight text-slate-900">
                  CivicPulse
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                  OPS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans leading-tight">
                Your City Speaks. We Listen.
              </p>
            </div>
          </Link>

          {/* Grouped Navigation (Section 11 & 12) */}
          <nav className="space-y-5">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 font-sans">
                  {group.title}
                </h4>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium font-sans transition-all duration-150',
                          isActive
                            ? 'bg-blue-50 text-blue-600 font-semibold shadow-xs'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        )}
                      >
                        <span className={cn('shrink-0', isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600')}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Manager User Profile Card & Role Switcher */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar name={currentUser?.name || 'Operations Manager'} size="sm" role="MANAGER" />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate font-sans">{currentUser?.name || 'Operations Manager'}</p>
              <p className="text-[11px] text-slate-500 font-sans">Department Manager</p>
            </div>
          </div>
          <button
            onClick={() => {
              authService.logout();
              navigate('/auth/login');
            }}
            className="w-full text-left text-xs font-sans text-rose-600 hover:text-rose-700 transition-colors py-1 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Operations Work Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Clean Enterprise Topbar Header (Section 14) */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Left Context: Department & Cluster */}
            <div className="flex items-center gap-2 text-xs font-sans text-slate-500">
              <span className="font-semibold text-slate-900">Department of Transport & Roads</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-600">Metro Cluster #04</span>
            </div>
          </div>

          {/* Center/Right: Search Bar & Actions */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => {
                const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
                window.dispatchEvent(event);
              }}
              className="hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-400 hover:text-slate-700 hover:border-slate-300 font-sans transition-all w-64 md:w-80 shadow-xs"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="flex-1 text-left">Search incidents, locations, departments...</span>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-white rounded border border-slate-200 font-sans font-semibold text-slate-500 shadow-2xs">⌘K</kbd>
            </button>

            {/* Operational Engine Status */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-xs font-sans">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Orchestrator:</span>
              <span className="font-bold">LIVE QUEUE</span>
            </div>

            {/* Notifications Bell */}
            <button
              className="relative p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 p-5 space-y-4 font-sans text-xs z-30 shadow-md">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{group.title}</p>
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className="flex items-center gap-2.5 py-2 text-slate-700 hover:text-blue-600 font-medium"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            ))}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  authService.logout();
                  navigate('/auth/login');
                }}
                className="w-full text-left py-2 text-rose-600 hover:text-rose-700 font-medium flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content Workspace Container (Background #F8FAFC) */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

