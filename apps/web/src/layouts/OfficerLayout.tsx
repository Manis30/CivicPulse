import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { HardHat, CheckSquare, ClipboardCheck, History, Menu, X, ChevronRight, Radio, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { authService } from '@/services/authService';
import { Avatar } from '@/components/ui/Overlays';
import { CommandPalette } from '@/components/common/CommandPalette';

export function OfficerLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const navItems = [
    { label: 'Field Dashboard', href: '/officer', icon: <HardHat className="w-4 h-4" /> },
    { label: 'My Tasks', href: '/officer/tasks', icon: <CheckSquare className="w-4 h-4" /> },
    { label: 'On-Site Inspection', href: '/officer/inspection', icon: <ClipboardCheck className="w-4 h-4" /> },
    { label: 'Job History', href: '/officer/history', icon: <History className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col md:flex-row font-sans antialiased">
      <CommandPalette />

      {/* Desktop Field Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-5 shrink-0 justify-between select-none">
        <div className="space-y-6">
          <Link to="/officer" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-sm">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-heading font-bold text-base tracking-tight text-slate-900">
                CivicPulse
              </span>
              <p className="text-[11px] text-slate-400 font-sans">Officer Task Console</p>
            </div>
          </Link>

          {/* Active Field Status Indicator */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
            <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold">
              <Radio className="w-3.5 h-3.5 animate-pulse text-amber-600" />
              <span>Active Field Shift</span>
            </div>
            <p className="text-xs text-amber-700">Team Alpha-01 • Ward 7</p>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium font-sans transition-colors',
                    isActive
                      ? 'bg-amber-50 text-amber-800 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <span className={isActive ? 'text-amber-600' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile & Role Switch */}
        <div className="pt-4 border-t border-slate-100 bg-slate-50/50 p-3 rounded-xl space-y-3">
          <div className="flex items-center gap-3">
            <Avatar name={currentUser?.name || 'Field Officer'} size="sm" role="OFFICER" />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate font-sans">{currentUser?.name || 'Field Officer'}</p>
              <p className="text-[11px] text-amber-600 font-sans font-medium">Field Responder</p>
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

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white">
            <HardHat className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-bold text-sm tracking-wide text-slate-900">
            CivicPulse Field
          </span>
        </div>
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-1.5 text-slate-500 hover:text-slate-900"
          aria-label="Toggle navigation"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-2 font-sans text-xs z-30 shadow-md">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMobileNavOpen(false)}
              className="flex items-center gap-2.5 py-2 text-slate-700 hover:text-amber-600 font-medium"
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                authService.logout();
                navigate('/auth/login');
                setMobileNavOpen(false);
              }}
              className="text-rose-600 hover:text-rose-700 py-1 flex items-center gap-2 font-medium w-full text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 flex justify-around p-2 shadow-lg">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center p-1.5 text-[10px] font-sans transition-colors',
                isActive ? 'text-amber-600 font-bold' : 'text-slate-400'
              )}
            >
              {item.icon}
              <span className="mt-1">{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 sm:p-8 pb-20 md:pb-8 overflow-y-auto max-w-5xl">
        <Outlet />
      </main>
    </div>
  );
}

