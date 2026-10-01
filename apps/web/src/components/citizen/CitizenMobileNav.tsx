import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LuHouse, LuCirclePlus, LuFileText, LuBell, LuUserRound } from 'react-icons/lu';
import { cn } from '@/lib/utils';

export function CitizenMobileNav({ unreadCount = 3 }: { unreadCount?: number }) {
  const location = useLocation();

  const navItems = [
    { label: 'Home', href: '/citizen', icon: LuHouse, exact: true },
    { label: 'Incidents', href: '/citizen/incidents', icon: LuFileText },
    { label: 'Report', href: '/citizen/report', icon: LuCirclePlus, isPrimary: true },
    { label: 'Alerts', href: '/citizen/notifications', icon: LuBell, badge: unreadCount },
    { label: 'Profile', href: '/citizen/profile', icon: LuUserRound },
  ];

  return (
    <nav className="md:hidden fixed bottom-3 inset-x-3 z-50 bg-white/95 backdrop-blur-xl border border-[#102A43]/10 rounded-3xl shadow-xl shadow-[#102A43]/10 p-2 flex items-center justify-around select-none">
      {navItems.map((item) => {
        const isActive = item.exact
          ? location.pathname === item.href
          : location.pathname.startsWith(item.href) && item.href !== '/citizen';
        const Icon = item.icon;

        if (item.isPrimary) {
          return (
            <Link
              key={item.href}
              to={item.href}
              className="relative -top-5 w-12 h-12 rounded-full bg-[#159A68] hover:bg-[#128358] text-white flex items-center justify-center shadow-lg shadow-[#159A68]/30 transition-transform active:scale-95"
              title="Report an Issue"
            >
              <LuCirclePlus className="w-6 h-6 stroke-[2.4]" />
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              'relative flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-colors',
              isActive
                ? 'text-[#159A68] font-bold'
                : 'text-[#829AB1] hover:text-[#102A43]'
            )}
          >
            <Icon className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] font-sans font-medium">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#EF6A63]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export default CitizenMobileNav;
