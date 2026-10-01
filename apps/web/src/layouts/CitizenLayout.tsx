import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { CitizenSidebar } from '@/components/citizen/CitizenSidebar';
import { CitizenHeader } from '@/components/citizen/CitizenHeader';
import { CitizenMobileNav } from '@/components/citizen/CitizenMobileNav';
import { CommandPalette } from '@/components/common/CommandPalette';
import { useIncidents } from '@/contexts/IncidentContext';
import { notificationService } from '@/services/notificationService';

const SIDEBAR_STORAGE_KEY = 'civicpulse-sidebar-collapsed';

export function CitizenLayout() {
  const location = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to top whenever the citizen route changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  // Initialize from localStorage; default to false (expanded)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      return stored === 'true';
    } catch {
      return false;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [currentWard, setCurrentWard] = useState('Ward 12 - Central Hosur');
  const [unreadCount, setUnreadCount] = useState(2);
  const { incidents } = useIncidents();

  useEffect(() => {
    const updateCount = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        setUnreadCount(count);
      } catch {
        // Fallback
      }
    };
    updateCount();
    window.addEventListener('civicpulse_notifications_updated', updateCount);
    return () => window.removeEventListener('civicpulse_notifications_updated', updateCount);
  }, []);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch (err) {
        console.warn('Failed to persist sidebar state in localStorage:', err);
      }
      return next;
    });
  };

  return (
    <div
      className={`min-h-screen bg-[#F7F8F4] text-[#102A43] font-sans antialiased selection:bg-[#159A68] selection:text-white relative md:grid transition-all duration-250 ease-in-out ${
        isSidebarCollapsed ? 'md:grid-cols-[76px_1fr]' : 'md:grid-cols-[248px_1fr]'
      }`}
    >
      <CommandPalette />

      {/* Desktop CivicPulse Dark Green Sidebar */}
      <CitizenSidebar
        collapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        unreadCount={unreadCount}
      />

      {/* Main Content Viewport */}
      <div ref={scrollContainerRef} className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto pb-28 md:pb-8">
        {/* Top Header Bar - Exact 62px height */}
        <div className="sticky top-0 z-30 bg-[#F7F8F4]/90 backdrop-blur-md border-b border-[#E3EAE6] h-[62px] flex items-center">
          <div className="w-full px-4 sm:px-5 lg:px-[28px]">
            <CitizenHeader
              showSearch={false}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              currentWard={currentWard}
              onWardChange={setCurrentWard}
              unreadCount={unreadCount}
            />
          </div>
        </div>

        {/* Global Content Container - 16px mobile, 20px tablet, 28px desktop */}
        <main className="flex-1 w-full px-4 sm:px-5 lg:px-[28px] pt-3.5 sm:pt-4 pb-4">
          <Outlet context={{ currentWard, onWardChange: setCurrentWard }} />
        </main>
      </div>

      {/* Mobile Bottom Dock Navigation */}
      <CitizenMobileNav unreadCount={unreadCount} />
    </div>
  );
}

export default CitizenLayout;

