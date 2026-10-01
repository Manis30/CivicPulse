import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  LuBell,
  LuFileText,
  LuSparkles,
  LuMapPin,
  LuUsers,
  LuCircleCheck,
  LuShieldCheck,
  LuMap,
  LuCheckCheck,
  LuRefreshCw,
  LuInbox
} from 'react-icons/lu';
import {
  notificationService,
  StructuredNotification,
  NotificationCategoryType
} from '@/services/notificationService';
import {
  CitizenContentContainer,
  CitizenPageHeader,
} from '@/components/citizen/CitizenContentContainer';
import { CitizenPagination } from '@/components/citizen/CitizenPagination';
import { cn } from '@/lib/utils';

type FilterCategory = 'ALL' | 'REPORTS' | 'RESPONSES' | 'NEARBY' | 'SYSTEM';

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    const days = Math.floor(diffSec / 86400);
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  } catch {
    return 'Recently';
  }
}

function parseNotificationCardData(notif: StructuredNotification) {
  // 1. Citizen-Facing Title
  let displayTitle = 'Incident Update';
  const t = (notif.type || '').toUpperCase();
  const text = `${notif.title || ''} ${notif.message || ''}`.toUpperCase();

  if (
    notif.priority === 'action_required' ||
    t.includes('ACTION_REQUIRED') ||
    text.includes('ACTION REQUIRED') ||
    text.includes('CRITICAL DISPATCH')
  ) {
    displayTitle = 'Action Required';
  } else if (
    t.includes('RESOLVED') ||
    t.includes('RESOLUTION') ||
    text.includes('CURRENTLY RESOLVED') ||
    text.includes('CURRENTLY CLOSED')
  ) {
    displayTitle = 'Resolution Update';
  } else if (notif.categoryType === 'NEARBY' || t.includes('NEARBY') || text.includes('NEARBY')) {
    displayTitle = 'Nearby Civic Alert';
  } else if (notif.categoryType === 'SYSTEM' || t.includes('SYSTEM') || text.includes('SYSTEM')) {
    displayTitle = 'System Notice';
  } else if (t.includes('REPORT_RECEIVED') || text.includes('INGESTED') || text.includes('REPORT RECEIVED')) {
    displayTitle = 'Report Received';
  } else if (t.includes('AI_ANALYSIS') || text.includes('AI ANALYSIS')) {
    displayTitle = 'AI Assessment';
  } else if (t.includes('LOCATION_VERIFIED')) {
    displayTitle = 'Location Verified';
  }

  // 2. Icon, Tint & Action Required State
  const isActionRequired =
    notif.priority === 'action_required' ||
    displayTitle === 'Action Required';

  let Icon = LuBell;
  let iconBg = 'bg-[#F0F4F8] border-[#E3EAE6] text-[#486581]';

  if (isActionRequired) {
    Icon = LuShieldCheck;
    iconBg = 'bg-[#FEF3C7] border-[#FCD34D]/60 text-[#D97706]';
  } else if (displayTitle === 'Resolution Update') {
    Icon = LuCircleCheck;
    iconBg = 'bg-[#E7F7F0] border-[#159A68]/20 text-[#159A68]';
  } else if (displayTitle === 'Nearby Civic Alert') {
    Icon = LuMap;
    iconBg = 'bg-[#EBF3FD] border-[#2878E5]/20 text-[#2878E5]';
  } else if (displayTitle === 'Report Received') {
    Icon = LuFileText;
    iconBg = 'bg-[#E7F7F0] border-[#159A68]/20 text-[#159A68]';
  } else if (displayTitle === 'AI Assessment') {
    Icon = LuSparkles;
    iconBg = 'bg-[#EEF2FF] border-[#6366F1]/20 text-[#6366F1]';
  } else if (displayTitle === 'Location Verified') {
    Icon = LuMapPin;
    iconBg = 'bg-[#E7F7F0] border-[#159A68]/20 text-[#159A68]';
  } else if (notif.categoryType === 'RESPONSES') {
    Icon = LuUsers;
    iconBg = 'bg-[#F0F4F8] border-[#E3EAE6] text-[#486581]';
  }

  // 3. Extract readable incident ID (e.g. INC-2026-1012)
  let incidentNumber = notif.incidentNumber;
  if (!incidentNumber || incidentNumber.startsWith('6ab')) {
    const incMatch = `${notif.title} ${notif.message}`.match(/INC-\d{4}-\d{4}/i);
    if (incMatch) {
      incidentNumber = incMatch[0].toUpperCase();
    } else {
      incidentNumber = undefined;
    }
  }

  // 4. Meaningful one-line message (clean issue name + status or alert content)
  let cleanMessage = notif.message;
  let cleanWard = notif.location || 'Ward 12 · Central Hosur';

  const bodyMatch = notif.message.match(/Your report for (.*?) in (Ward \d+[^.]*?) is currently ([A-Z_]+)/i);
  if (bodyMatch) {
    const issue = bodyMatch[1].trim();
    const rawWard = bodyMatch[2].trim();
    const status = bodyMatch[3].trim().replace(/_/g, ' ').toLowerCase();
    const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);
    cleanMessage = `${issue} · ${formattedStatus}`;
    cleanWard = rawWard;
  } else if (notif.incidentTitle && notif.incidentTitle !== notif.message) {
    cleanMessage = notif.incidentTitle;
  }

  cleanWard = cleanWard.replace(/\s*[—-]\s*/g, ' · ');

  return {
    displayTitle,
    Icon,
    iconBg,
    isActionRequired,
    incidentNumber,
    cleanMessage,
    cleanWard,
  };
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<StructuredNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('ALL');
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const PAGE_SIZE = 10;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getStructuredNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setIsMarkingAll(true);
      const allIds = notifications.map((n) => n.id);
      await notificationService.markAllAsRead(allIds);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleCategoryChange = (cat: FilterCategory) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  // Filtered Notifications based on normalized category
  const filteredNotifications = useMemo(() => {
    if (activeCategory === 'ALL') return notifications;
    return notifications.filter((n) => n.categoryType === activeCategory);
  }, [notifications, activeCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredNotifications.length / PAGE_SIZE));

  // Auto-clamp page if filter reduced total pages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredNotifications.slice(start, start + PAGE_SIZE);
  }, [filteredNotifications, currentPage, PAGE_SIZE]);

  // Counts for tabs
  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
  const reportsCount = useMemo(() => notifications.filter((n) => n.categoryType === 'REPORTS').length, [notifications]);
  const responsesCount = useMemo(() => notifications.filter((n) => n.categoryType === 'RESPONSES').length, [notifications]);
  const nearbyCount = useMemo(() => notifications.filter((n) => n.categoryType === 'NEARBY').length, [notifications]);
  const systemCount = useMemo(() => notifications.filter((n) => n.categoryType === 'SYSTEM').length, [notifications]);

  const categories: { key: FilterCategory; label: string; count: number }[] = [
    { key: 'ALL', label: 'All', count: notifications.length },
    { key: 'REPORTS', label: 'Reports', count: reportsCount },
    { key: 'RESPONSES', label: 'Responses', count: responsesCount },
    { key: 'NEARBY', label: 'Nearby', count: nearbyCount },
    { key: 'SYSTEM', label: 'System', count: systemCount },
  ];

  return (
    <CitizenContentContainer className="space-y-5 sm:space-y-6 pb-6 sm:pb-8">
      {/* 1. Global Citizen Page Header (24px/700 Title, 14px Subtitle, 20px Spacing) */}
      <CitizenPageHeader
        title="Notifications"
        description="Stay updated on your reports, city responses, and nearby civic issues."
        className="mb-0"
        action={
          <div className="flex items-center gap-2 shrink-0">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#159A68] hover:text-[#128358] bg-white hover:bg-[#E7F7F0]/50 border border-[#DCE6E1] transition-all shadow-2xs cursor-pointer"
                title="Mark all notifications as read"
              >
                <LuCheckCheck className="w-3.5 h-3.5 stroke-[2.4]" />
                <span className="hidden sm:inline">Mark all as read</span>
              </button>
            )}

            <button
              type="button"
              onClick={fetchNotifications}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#526777] hover:text-[#102A43] bg-white hover:bg-slate-50 border border-[#DCE6E1] transition-all shadow-2xs cursor-pointer"
              title="Refresh notifications"
            >
              <LuRefreshCw className={cn('w-3.5 h-3.5 stroke-[2.4]', loading && 'animate-spin text-[#159A68]')} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        }
      />

      {/* 2. Horizontal Filter Segmented Tabs */}
      <div className="w-full overflow-x-auto no-scrollbar py-0.5">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-max">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => handleCategoryChange(cat.key)}
                className={cn(
                  'inline-flex items-center gap-2 px-3 sm:px-3.5 h-[38px] sm:h-[40px] rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap',
                  isActive
                    ? 'bg-[#159A68] text-white shadow-xs font-bold'
                    : 'bg-white border border-[#E3EAE6] text-[#102A43] hover:bg-[#E7F7F0]/60 hover:border-[#159A68]/30 hover:text-[#159A68] font-semibold'
                )}
              >
                <span>{cat.label}</span>
                <span
                  className={cn(
                    'text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold',
                    isActive ? 'bg-white/25 text-white' : 'bg-[#F0F4F2] text-[#526777]'
                  )}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Compact Notification Cards List */}
      <div className="w-full space-y-2.5 sm:space-y-3">
        {loading ? (
          <div className="py-12 text-center text-[#829AB1] space-y-2 bg-white rounded-2xl border border-[#DCE6E1] shadow-2xs">
            <LuRefreshCw className="w-6 h-6 animate-spin mx-auto text-[#159A68]" />
            <p className="text-xs font-sans">Syncing civic notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          /* Compact Empty State */
          <div className="p-8 sm:p-12 text-center bg-white border border-[#E3EAE6] rounded-2xl shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E7F7F0] text-[#159A68] mx-auto flex items-center justify-center shadow-xs">
              <LuInbox className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm sm:text-base font-heading text-[#102A43]">
                No {activeCategory === 'ALL' ? '' : activeCategory.toLowerCase()} notifications
              </h3>
              <p className="text-xs text-[#627D98] max-w-sm mx-auto leading-relaxed">
                You don't have any updates in this category right now.
              </p>
            </div>
            {activeCategory !== 'ALL' && (
              <button
                type="button"
                onClick={() => handleCategoryChange('ALL')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#159A68] hover:bg-[#128358] text-white transition-all shadow-xs cursor-pointer"
              >
                <span>View All Notifications</span>
              </button>
            )}
          </div>
        ) : (
          /* Compact Scannable Notification Cards */
          <>
            <div className="w-full space-y-2.5 sm:space-y-3">
              {paginatedNotifications.map((notif) => {
                const {
                  displayTitle,
                  Icon,
                  iconBg,
                  isActionRequired,
                  incidentNumber,
                  cleanMessage,
                  cleanWard,
                } = parseNotificationCardData(notif);

                return (
                  <div
                    key={notif.id}
                    className={cn(
                      'group relative w-full rounded-[14px] sm:rounded-[16px] border px-3.5 sm:px-4 py-3 sm:py-3.5 transition-all duration-150 text-left flex items-start sm:items-center justify-between gap-3 select-none min-h-[82px] sm:min-h-[86px]',
                      notif.read
                        ? 'bg-white border-[#E1E8E4] hover:border-[#159A68]/30 shadow-2xs'
                        : isActionRequired
                        ? 'bg-[#FFFCF5] border-l-[3.5px] border-l-[#F59E0B] border-[#E1E8E4] shadow-xs hover:border-[#F59E0B]/50'
                        : 'bg-[#F9FCFA] border-l-[3.5px] border-l-[#159A68] border-[#E1E8E4] shadow-xs hover:border-[#159A68]/50'
                    )}
                  >
                    {/* LEFT + CENTER: Icon + Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* LEFT: Contextual Icon inside subtle tinted circular container */}
                      <div
                        className={cn(
                          'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105',
                          iconBg
                        )}
                      >
                        <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
                      </div>

                      {/* CENTER: Title, Short message, Incident ID + Ward */}
                      <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {!notif.read && (
                            <span
                              className={cn(
                                'w-2 h-2 rounded-full shrink-0',
                                isActionRequired ? 'bg-[#F59E0B]' : 'bg-[#159A68]'
                              )}
                              title="Unread"
                            />
                          )}
                          <h3
                            className={cn(
                              'text-[13.5px] sm:text-[14px] tracking-tight truncate',
                              notif.read ? 'font-semibold text-[#102A43]' : 'font-bold text-[#102A43]'
                            )}
                          >
                            {displayTitle}
                          </h3>
                          {isActionRequired && (
                            <span className="text-[10px] font-bold font-heading px-1.5 py-0.2 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]/60 shrink-0">
                              Action Required
                            </span>
                          )}
                        </div>

                        {/* Short meaningful message */}
                        <p className="text-[12.5px] sm:text-[13px] text-[#334E68] font-normal leading-snug line-clamp-1">
                          {cleanMessage}
                        </p>

                        {/* Incident ID + Ward metadata */}
                        <div className="flex items-center gap-1.5 text-[11px] sm:text-[11.5px] text-[#627D98] font-normal truncate">
                          {incidentNumber && (
                            <>
                              <span className="font-mono font-semibold text-[#102A43]">{incidentNumber}</span>
                              <span className="text-[#CBD5E1]">·</span>
                            </>
                          )}
                          <span className="truncate">{cleanWard}</span>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: Relative time + View action */}
                    <div className="flex flex-col items-end justify-between self-stretch shrink-0 gap-1.5 sm:gap-2 pl-1 sm:pl-2">
                      <span className="text-[11px] sm:text-[11.5px] text-[#829AB1] font-mono whitespace-nowrap">
                        {formatRelativeTime(notif.timestamp)}
                      </span>

                      <div className="flex items-center gap-2 mt-auto">
                        {!notif.read && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkAsRead(notif.id, e)}
                            className="text-[11px] font-semibold text-[#627D98] hover:text-[#159A68] transition-colors cursor-pointer"
                          >
                            Mark read
                          </button>
                        )}

                        {notif.actionUrl ? (
                          <Link
                            to={notif.actionUrl}
                            onClick={() => {
                              if (!notif.read) handleMarkAsRead(notif.id);
                            }}
                            className="inline-flex items-center gap-1 font-bold text-[#159A68] hover:text-[#128358] transition-colors cursor-pointer text-[12px] sm:text-[12.5px]"
                          >
                            <span>View →</span>
                          </Link>
                        ) : (
                          <span className="text-[12px] font-bold text-[#159A68] opacity-50">View →</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <CitizenPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredNotifications.length}
                pageSize={PAGE_SIZE}
                onPageChange={(p) => {
                  setCurrentPage(p);
                  const scrollContainer = document.querySelector('.overflow-y-auto');
                  if (scrollContainer) {
                    scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="pt-2"
              />
            )}
          </>
        )}
      </div>
    </CitizenContentContainer>
  );
}

export default NotificationsPage;
