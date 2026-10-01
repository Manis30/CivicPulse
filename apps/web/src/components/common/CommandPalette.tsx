import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  Shield,
  User,
  HardHat,
  Compass,
  Bot,
  LogOut,
  FileText,
  Settings,
  Activity,
  PlusCircle,
  MapPin,
  ClipboardCheck,
} from 'lucide-react';
import { authService } from '@/services/authService';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  // Build role-specific navigation commands — no cross-role spoofing
  const getRoleCommands = () => {
    if (!currentUser) {
      return [
        {
          group: 'Authentication',
          items: [
            {
              label: 'Sign In to Workspace',
              icon: <User className="w-4 h-4 text-blue-600" />,
              action: () => {
                navigate('/auth/login');
                setIsOpen(false);
              },
            },
            {
              label: 'Register New Citizen Account',
              icon: <PlusCircle className="w-4 h-4 text-emerald-600" />,
              action: () => {
                navigate('/auth/register');
                setIsOpen(false);
              },
            },
            {
              label: 'View Public Landing Page',
              icon: <ArrowRight className="w-4 h-4 text-slate-400" />,
              action: () => {
                navigate('/landing');
                setIsOpen(false);
              },
            },
          ],
        },
      ];
    }

    if (currentUser.role === 'PLATFORM_ADMIN') {
      return [
        {
          group: 'Platform Admin Navigation',
          items: [
            {
              label: 'AI Agent Control Center',
              icon: <Bot className="w-4 h-4 text-indigo-500" />,
              action: () => {
                navigate('/admin/agents');
                setIsOpen(false);
              },
            },
            {
              label: 'Platform Overview & Health',
              icon: <Activity className="w-4 h-4 text-indigo-400" />,
              action: () => {
                navigate('/admin');
                setIsOpen(false);
              },
            },
            {
              label: 'AI Policies & Safety Guards',
              icon: <Shield className="w-4 h-4 text-indigo-400" />,
              action: () => {
                navigate('/admin/policies');
                setIsOpen(false);
              },
            },
            {
              label: 'Audit & Decision Ledger',
              icon: <FileText className="w-4 h-4 text-indigo-400" />,
              action: () => {
                navigate('/admin/audit');
                setIsOpen(false);
              },
            },
            {
              label: 'User & Staff Governance',
              icon: <User className="w-4 h-4 text-indigo-400" />,
              action: () => {
                navigate('/admin/users');
                setIsOpen(false);
              },
            },
            {
              label: 'Platform Settings',
              icon: <Settings className="w-4 h-4 text-indigo-400" />,
              action: () => {
                navigate('/admin/settings');
                setIsOpen(false);
              },
            },
            {
              label: 'Admin Profile',
              icon: <User className="w-4 h-4 text-indigo-400" />,
              action: () => {
                navigate('/admin/profile');
                setIsOpen(false);
              },
            },
          ],
        },
        {
          group: 'Session',
          items: [
            {
              label: 'Sign Out of Admin Portal',
              icon: <LogOut className="w-4 h-4 text-rose-500" />,
              action: () => {
                authService.logout();
                navigate('/auth/login');
                setIsOpen(false);
              },
            },
          ],
        },
      ];
    }

    if (currentUser.role === 'DEPARTMENT_MANAGER') {
      return [
        {
          group: 'Operations Navigation',
          items: [
            {
              label: 'Command Center Cockpit',
              icon: <Compass className="w-4 h-4 text-blue-600" />,
              action: () => {
                navigate('/manager/command-center');
                setIsOpen(false);
              },
            },
            {
              label: 'Live City Map (3D GIS)',
              icon: <MapPin className="w-4 h-4 text-blue-600" />,
              action: () => {
                navigate('/manager/map');
                setIsOpen(false);
              },
            },
            {
              label: 'Active Incident Dossiers',
              icon: <FileText className="w-4 h-4 text-blue-600" />,
              action: () => {
                navigate('/manager/incidents');
                setIsOpen(false);
              },
            },
            {
              label: 'Field Teams & Rosters',
              icon: <HardHat className="w-4 h-4 text-blue-600" />,
              action: () => {
                navigate('/manager/teams');
                setIsOpen(false);
              },
            },
            {
              label: 'Operations Settings',
              icon: <Settings className="w-4 h-4 text-blue-600" />,
              action: () => {
                navigate('/manager/settings');
                setIsOpen(false);
              },
            },
          ],
        },
        {
          group: 'Session',
          items: [
            {
              label: 'Sign Out of Manager Portal',
              icon: <LogOut className="w-4 h-4 text-rose-500" />,
              action: () => {
                authService.logout();
                navigate('/auth/login');
                setIsOpen(false);
              },
            },
          ],
        },
      ];
    }

    if (currentUser.role === 'FIELD_OFFICER') {
      return [
        {
          group: 'Field Operations',
          items: [
            {
              label: 'Field Dashboard',
              icon: <HardHat className="w-4 h-4 text-amber-600" />,
              action: () => {
                navigate('/officer');
                setIsOpen(false);
              },
            },
            {
              label: 'My Assigned Tasks',
              icon: <ClipboardCheck className="w-4 h-4 text-amber-600" />,
              action: () => {
                navigate('/officer/tasks');
                setIsOpen(false);
              },
            },
            {
              label: 'On-Site Inspection',
              icon: <FileText className="w-4 h-4 text-amber-600" />,
              action: () => {
                navigate('/officer/inspection');
                setIsOpen(false);
              },
            },
          ],
        },
        {
          group: 'Session',
          items: [
            {
              label: 'Sign Out of Field Portal',
              icon: <LogOut className="w-4 h-4 text-rose-500" />,
              action: () => {
                authService.logout();
                navigate('/auth/login');
                setIsOpen(false);
              },
            },
          ],
        },
      ];
    }

    // Citizen
    return [
      {
        group: 'Citizen Services',
        items: [
          {
            label: 'Citizen Dashboard',
            icon: <User className="w-4 h-4 text-emerald-600" />,
            action: () => {
              navigate('/citizen');
              setIsOpen(false);
            },
          },
          {
            label: 'Report a New Incident',
            icon: <PlusCircle className="w-4 h-4 text-emerald-600" />,
            action: () => {
              navigate('/citizen/report');
              setIsOpen(false);
            },
          },
          {
            label: 'My Submitted Incidents',
            icon: <FileText className="w-4 h-4 text-emerald-600" />,
            action: () => {
              navigate('/citizen/incidents');
              setIsOpen(false);
            },
          },
          {
            label: 'Nearby Community Issues',
            icon: <MapPin className="w-4 h-4 text-emerald-600" />,
            action: () => {
              navigate('/citizen/nearby');
              setIsOpen(false);
            },
          },
          {
            label: 'Citizen Profile',
            icon: <User className="w-4 h-4 text-emerald-600" />,
            action: () => {
              navigate('/citizen/profile');
              setIsOpen(false);
            },
          },
        ],
      },
      {
        group: 'Session',
        items: [
          {
            label: 'Sign Out of Citizen Portal',
            icon: <LogOut className="w-4 h-4 text-rose-500" />,
            action: () => {
              authService.logout();
              navigate('/auth/login');
              setIsOpen(false);
            },
          },
        ],
      },
    ];
  };

  const commands = getRoleCommands();

  const filtered = commands
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={() => setIsOpen(false)} aria-hidden="true" />
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-civic-modal overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        <div className="flex items-center px-5 py-4 border-b border-slate-100 bg-white">
          <Search className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or navigate..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-sans"
          />
          <span className="text-[10px] font-sans font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            ESC
          </span>
        </div>

        <div className="max-h-80 overflow-y-auto p-3 divide-y divide-slate-100 font-sans">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 font-sans">
              No matching commands found.
            </div>
          ) : (
            filtered.map((group) => (
              <div key={group.group} className="py-2.5 first:pt-0 last:pb-0">
                <div className="px-3 py-1 text-[10px] font-sans uppercase tracking-wider text-slate-400 font-bold">
                  {group.group}
                </div>
                <div className="space-y-1 mt-1">
                  {group.items.map((item) => (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-colors font-sans text-left group"
                    >
                      <div className="flex items-center gap-2.5">
                        {item.icon}
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
