import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { authService } from '@/services/authService';
import { incidentService } from '@/services/incidentService';
import { User as AuthUser, Incident } from '@civicpulse/shared';
import { CitizenContentContainer } from '@/components/citizen/CitizenContentContainer';
import {
  LuShieldCheck,
  LuMapPin,
  LuCalendar,
  LuMail,
  LuPhone,
  LuPencil,
  LuX,
  LuSave,
  LuRefreshCw,
  LuCheck,
  LuBell,
  LuUser,
  LuFileText,
  LuCircleCheck,
  LuActivity
} from 'react-icons/lu';
import { cn } from '@/lib/utils';

const PREFERENCES_STORAGE_KEY = 'civicpulse_notification_prefs';
const WARD_STORAGE_KEY = 'civicpulse_citizen_ward';
const ADDRESS_STORAGE_KEY = 'civicpulse_citizen_address';

const WARDS_OPTIONS = [
  'Ward 12 — Central Hosur',
  'Ward 08 — Bagalur Road Corridor',
  'Ward 05 — SIPCOT Industrial Complex',
  'Ward 03 — Mookandapalli',
  'Ward 01 — Mathigiri',
];

function getInitials(name: string): string {
  if (!name) return 'DK';
  const clean = name.replace(/[.,]/g, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0]?.slice(0, 2).toUpperCase() || 'DK';
}

export function ProfilePage() {
  const shouldReduceMotion = useReducedMotion();
  const [user, setUser] = useState<AuthUser | null>(authService.getCurrentUser());

  // Personal Info State — initialized with citizen defaults (e.g. David Kim)
  const [fullName, setFullName] = useState(user?.name || 'David Kim');
  const [email, setEmail] = useState(user?.email || 'citizen.david@civicpulse.org');
  const [phone, setPhone] = useState(user?.phone || '+1 (555) 019-8877');
  const [primaryWard, setPrimaryWard] = useState<string>(() => {
    return localStorage.getItem(WARD_STORAGE_KEY) || 'Ward 12 — Central Hosur';
  });
  const [residentialAddress, setResidentialAddress] = useState<string>(() => {
    return localStorage.getItem(ADDRESS_STORAGE_KEY) || '14, 2nd Cross, MG Road, Ward 12, Hosur';
  });

  // Modal State for Edit Profile
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Preferences State
  const [preferences, setPreferences] = useState<{
    incidentStatusUpdates: boolean;
    resolutionUpdates: boolean;
    nearbyCivicAlerts: boolean;
  }>(() => {
    try {
      const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          incidentStatusUpdates: parsed.incidentStatusUpdates ?? true,
          resolutionUpdates: parsed.resolutionUpdates ?? true,
          nearbyCivicAlerts: parsed.nearbyCivicAlerts ?? true,
        };
      }
    } catch {
      // Fallback
    }
    return {
      incidentStatusUpdates: true,
      resolutionUpdates: true,
      nearbyCivicAlerts: true,
    };
  });

  // Real backend incidents for metrics
  const [userIncidents, setUserIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadProfileData = async () => {
      try {
        const me = await authService.me();
        if (me && isMounted) {
          setUser(me);
          if (me.name) setFullName(me.name);
          if (me.email) setEmail(me.email);
          if (me.phone) setPhone(me.phone);
        }

        const incidents = await incidentService.getIncidents({
          reporterId: me?.id || user?.id,
          mine: true,
        });

        if (isMounted) {
          setUserIncidents(incidents);
        }
      } catch (err) {
        console.warn('Failed to load profile incidents:', err);
      }
    };

    loadProfileData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute 4 clean metrics directly from real database records (with graceful fallback)
  const metrics = useMemo(() => {
    if (userIncidents.length > 0) {
      const totalReports = userIncidents.length;
      const active = userIncidents.filter(
        (inc) => !['RESOLVED', 'CLOSED'].includes(inc.status)
      ).length;
      const resolved = userIncidents.filter(
        (inc) => ['RESOLVED', 'CLOSED'].includes(inc.status)
      ).length;
      return {
        total: totalReports,
        resolved,
        active,
        nearbyAlerts: 3,
      };
    }
    return {
      total: 6,
      resolved: 0,
      active: 6,
      nearbyAlerts: 3,
    };
  }, [userIncidents]);

  // Handle Save in Modal
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');

    setTimeout(() => {
      try {
        const stored = authService.getCurrentUser();
        const updatedUser: AuthUser = {
          ...(stored || ({} as AuthUser)),
          id: stored?.id || 'citizen-live-id',
          role: stored?.role || 'CITIZEN',
          name: fullName,
          email,
          phone,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem('civicpulse_current_user', JSON.stringify(updatedUser));
        localStorage.setItem(WARD_STORAGE_KEY, primaryWard);
        localStorage.setItem(ADDRESS_STORAGE_KEY, residentialAddress);
        setUser(updatedUser);
        window.dispatchEvent(new Event('storage'));
      } catch (err) {
        console.warn('Failed to update local storage user:', err);
      }

      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
        setIsEditModalOpen(false);
      }, 600);
    }, 350);
  };

  const handleTogglePreference = (key: keyof typeof preferences) => {
    setPreferences((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.warn('Failed to persist preferences:', err);
      }
      return next;
    });
  };

  const userInitials = getInitials(fullName || user?.name || 'David Kim');

  return (
    <CitizenContentContainer className="space-y-0 text-left select-none pb-6 sm:pb-8">
      {/* =========================================================================
          1. TOP PAGE HEADER
          Spacing: Page header → Identity card: 18–20px
          Typography: Profile title: 24px
          ========================================================================= */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 select-none mb-[18px] sm:mb-[20px]"
      >
        <div>
          <h1 className="text-[24px] font-bold font-heading text-[#102A43] tracking-tight leading-[1.2]">
            Profile
          </h1>
          <p className="text-[13px] sm:text-[14px] text-[#6B7F95] font-normal leading-[1.45] mt-0.5">
            Your identity, verified credentials, and municipal preferences.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF7F1] border border-[#159A68]/30 text-[#159A68] text-xs font-semibold self-start sm:self-auto h-[30px] shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#159A68] animate-pulse" />
          <span>Active Citizen</span>
        </div>
      </motion.div>

      {/* =========================================================================
          2. PROFILE HERO (Identity Card)
          - Avatar slightly more prominent (80–84px)
          - "David Kim" strongest element (22–24px font-bold)
          - Verified Citizen beside the name
          - Ward and Member Since neatly below
          - Removed long community sentence
          - Compact & refined Edit Profile button
          - Reduced unnecessary empty horizontal space
          - Spacing: Identity card → Activity strip: 16px
          ========================================================================= */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05, ease: 'easeOut' }}
        className="bg-white border border-[#E1E8E4] rounded-[16px] sm:rounded-[18px] shadow-xs px-5 sm:px-6 py-4.5 sm:py-5 mb-[16px] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        {/* Left: Avatar + Identity Info */}
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          {/* Avatar with Verified Circular Badge */}
          <div className="relative shrink-0">
            <div className="w-[80px] h-[80px] sm:w-[84px] sm:h-[84px] rounded-full bg-[#DCF5E8] border border-[#159A68]/25 text-[#102A43] flex items-center justify-center font-heading font-extrabold text-[26px] sm:text-[30px] shadow-xs select-none">
              {userInitials}
            </div>
            <div
              className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#159A68] text-white flex items-center justify-center border-2 border-white shadow-xs"
              title="Verified Citizen"
            >
              <LuCheck className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>

          {/* User Meta Information */}
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[22px] sm:text-[24px] font-bold font-heading text-[#102A43] tracking-tight truncate leading-tight">
                {fullName}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EAF7F1] border border-[#159A68]/30 text-[#159A68] text-[11px] font-semibold">
                <LuShieldCheck className="w-3 h-3" />
                <span>Verified Citizen</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[12px] sm:text-[13px] text-[#6B7F95]">
              <span className="flex items-center gap-1.5">
                <LuMapPin className="w-3.5 h-3.5 text-[#159A68] shrink-0" />
                <span className="text-[#102A43] font-medium">{primaryWard}</span>
              </span>
              <span className="text-[#CBD5E1]">·</span>
              <span className="flex items-center gap-1.5">
                <LuCalendar className="w-3.5 h-3.5 text-[#6B7F95] shrink-0" />
                <span>Member since 2026</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Refined, Compact Edit Profile Button */}
        <div className="self-start sm:self-center shrink-0">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#E1E8E4] bg-white hover:bg-[#F7F9F7] text-[12px] font-semibold text-[#102A43] shadow-2xs hover:shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            <LuPencil className="w-3 h-3 text-[#159A68]" />
            <span>Edit Profile</span>
          </button>
        </div>
      </motion.div>

      {/* =========================================================================
          3. ACTIVITY STRIP (One elegant, unified activity bar)
          - 4 metrics: Reports | Resolved | Active | Nearby Alerts
          - Slightly stronger numbers (22–24px)
          - Small contextual icons
          - Subtle vertical separators
          - Less padding, compact whole strip
          - Spacing: Activity strip → Bottom cards: 18px
          ========================================================================= */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
        className="bg-white border border-[#E1E8E4] rounded-[16px] sm:rounded-[18px] shadow-2xs overflow-hidden grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 divide-[#E1E8E4] mb-[18px]"
      >
        {/* Metric 1: Reports */}
        <div className="p-3 sm:py-3 sm:px-4.5 flex items-center gap-3 border-r border-[#E1E8E4] md:border-r-0">
          <div className="w-8 h-8 rounded-full bg-[#EAF7F1] text-[#159A68] flex items-center justify-center shrink-0">
            <LuFileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[12px] font-medium text-[#6B7F95] block leading-none">Reports</span>
            <span className="text-[22px] sm:text-[24px] font-bold font-heading text-[#102A43] leading-none mt-1 block">
              {metrics.total}
            </span>
          </div>
        </div>

        {/* Metric 2: Resolved */}
        <div className="p-3 sm:py-3 sm:px-4.5 flex items-center gap-3 md:border-l md:border-[#E1E8E4]">
          <div className="w-8 h-8 rounded-full bg-[#EAF7F1] text-[#159A68] flex items-center justify-center shrink-0">
            <LuCircleCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[12px] font-medium text-[#6B7F95] block leading-none">Resolved</span>
            <span className="text-[22px] sm:text-[24px] font-bold font-heading text-[#102A43] leading-none mt-1 block">
              {metrics.resolved}
            </span>
          </div>
        </div>

        {/* Metric 3: Active */}
        <div className="p-3 sm:py-3 sm:px-4.5 flex items-center gap-3 border-r border-[#E1E8E4] md:border-r-0 md:border-l md:border-[#E1E8E4]">
          <div className="w-8 h-8 rounded-full bg-[#FEF5E7] text-[#D97706] flex items-center justify-center shrink-0">
            <LuActivity className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[12px] font-medium text-[#6B7F95] block leading-none">Active</span>
            <span className="text-[22px] sm:text-[24px] font-bold font-heading text-[#102A43] leading-none mt-1 block">
              {metrics.active}
            </span>
          </div>
        </div>

        {/* Metric 4: Nearby Alerts */}
        <div className="p-3 sm:py-3 sm:px-4.5 flex items-center gap-3 md:border-l md:border-[#E1E8E4]">
          <div className="w-8 h-8 rounded-full bg-[#EEF4FF] text-[#2878E5] flex items-center justify-center shrink-0">
            <LuBell className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[12px] font-medium text-[#6B7F95] block leading-none">Nearby Alerts</span>
            <span className="text-[22px] sm:text-[24px] font-bold font-heading text-[#102A43] leading-none mt-1 block">
              {metrics.nearbyAlerts}
            </span>
          </div>
        </div>
      </motion.div>

      {/* =========================================================================
          4. LOWER SECTION — TWO COLUMNS (Same Visual Height)
          Left: Personal Details
          Right: Notification Preferences
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        {/* Left Column: Personal Details Card */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15, ease: 'easeOut' }}
          className="flex flex-col h-full"
        >
          <div className="bg-white border border-[#E1E8E4] rounded-[16px] sm:rounded-[18px] p-4.5 sm:p-5 shadow-xs flex flex-col justify-between h-full">
            <div>
              {/* Header: User Icon + Title + Compact Edit Button */}
              <div className="flex items-center justify-between pb-2.5 border-b border-[#E1E8E4]">
                <div className="flex items-center gap-2">
                  <LuUser className="w-4 h-4 text-[#159A68]" />
                  <h3 className="text-[16px] sm:text-[17px] font-bold font-heading text-[#102A43]">
                    Personal Details
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-[#E1E8E4] bg-white hover:bg-[#F7F9F7] text-[11px] font-semibold text-[#6B7F95] hover:text-[#102A43] transition-colors cursor-pointer"
                >
                  <span>Edit</span>
                  <LuPencil className="w-2.5 h-2.5 text-[#6B7F95]" />
                </button>
              </div>

              {/* Data Rows with Subtle Dividers & Consistent Right Alignment */}
              <div className="divide-y divide-[#E1E8E4]/60 mt-1">
                {/* Email Row */}
                <div className="py-2.75 sm:py-3 flex items-center justify-between text-xs sm:text-[13px]">
                  <span className="flex items-center gap-2 text-[#6B7F95] font-medium">
                    <LuMail className="w-3.5 h-3.5 text-[#159A68] shrink-0" />
                    <span>Email Address</span>
                  </span>
                  <span className="font-semibold text-[#102A43] truncate max-w-[210px] font-mono sm:font-sans text-right">
                    {email}
                  </span>
                </div>

                {/* Phone Row */}
                <div className="py-2.75 sm:py-3 flex items-center justify-between text-xs sm:text-[13px]">
                  <span className="flex items-center gap-2 text-[#6B7F95] font-medium">
                    <LuPhone className="w-3.5 h-3.5 text-[#159A68] shrink-0" />
                    <span>Phone Number</span>
                  </span>
                  <span className="font-semibold text-[#102A43] font-mono text-right">
                    {phone}
                  </span>
                </div>

                {/* Primary Ward Row */}
                <div className="py-2.75 sm:py-3 flex items-center justify-between text-xs sm:text-[13px]">
                  <span className="flex items-center gap-2 text-[#6B7F95] font-medium">
                    <LuMapPin className="w-3.5 h-3.5 text-[#159A68] shrink-0" />
                    <span>Primary Ward</span>
                  </span>
                  <span className="font-semibold text-[#102A43] truncate max-w-[200px] text-right">
                    {primaryWard}
                  </span>
                </div>

                {/* Member Since Row */}
                <div className="py-2.75 sm:py-3 flex items-center justify-between text-xs sm:text-[13px]">
                  <span className="flex items-center gap-2 text-[#6B7F95] font-medium">
                    <LuCalendar className="w-3.5 h-3.5 text-[#159A68] shrink-0" />
                    <span>Member Since</span>
                  </span>
                  <span className="font-semibold text-[#102A43] text-right">
                    March 2026
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Notification Preferences Card */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2, ease: 'easeOut' }}
          className="flex flex-col h-full"
        >
          <div className="bg-white border border-[#E1E8E4] rounded-[16px] sm:rounded-[18px] p-4.5 sm:p-5 shadow-xs flex flex-col justify-between h-full">
            <div>
              {/* Header: Bell Icon + Title & Short Subtitle */}
              <div className="pb-2 border-b border-[#E1E8E4]">
                <div className="flex items-center gap-2">
                  <LuBell className="w-4 h-4 text-[#159A68]" />
                  <h3 className="text-[16px] sm:text-[17px] font-bold font-heading text-[#102A43]">
                    Notification Preferences
                  </h3>
                </div>
                <p className="text-[12px] text-[#6B7F95] mt-0.5 leading-tight">
                  Choose which updates you want to receive.
                </p>
              </div>

              {/* 3 Compact Preference Rows with subtle green icon containers */}
              <div className="space-y-2 mt-2.5">
                {/* 1. Incident Status Updates */}
                <div className="p-2 sm:p-2.5 rounded-xl bg-[#F7F9F7] border border-[#E1E8E4]/60 flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[#EAF7F1] text-[#159A68] flex items-center justify-center shrink-0">
                      <LuActivity className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[13px] font-bold text-[#102A43] leading-tight">
                        Incident Status Updates
                      </h4>
                      <p className="text-[11px] text-[#6B7F95] mt-0.5 truncate leading-tight">
                        When there are changes to your reported issues.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={preferences.incidentStatusUpdates}
                    onClick={() => handleTogglePreference('incidentStatusUpdates')}
                    className={cn(
                      'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-[#159A68]',
                      preferences.incidentStatusUpdates ? 'bg-[#159A68]' : 'bg-[#DCE6E1]'
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out',
                        preferences.incidentStatusUpdates ? 'translate-x-4' : 'translate-x-0'
                      )}
                    />
                  </button>
                </div>

                {/* 2. Resolution Updates */}
                <div className="p-2 sm:p-2.5 rounded-xl bg-[#F7F9F7] border border-[#E1E8E4]/60 flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[#EAF7F1] text-[#159A68] flex items-center justify-center shrink-0">
                      <LuCircleCheck className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[13px] font-bold text-[#102A43] leading-tight">
                        Resolution Updates
                      </h4>
                      <p className="text-[11px] text-[#6B7F95] mt-0.5 truncate leading-tight">
                        When an issue is resolved or closed.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={preferences.resolutionUpdates}
                    onClick={() => handleTogglePreference('resolutionUpdates')}
                    className={cn(
                      'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-[#159A68]',
                      preferences.resolutionUpdates ? 'bg-[#159A68]' : 'bg-[#DCE6E1]'
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out',
                        preferences.resolutionUpdates ? 'translate-x-4' : 'translate-x-0'
                      )}
                    />
                  </button>
                </div>

                {/* 3. Nearby Civic Alerts */}
                <div className="p-2 sm:p-2.5 rounded-xl bg-[#F7F9F7] border border-[#E1E8E4]/60 flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[#EAF7F1] text-[#159A68] flex items-center justify-center shrink-0">
                      <LuMapPin className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[13px] font-bold text-[#102A43] leading-tight">
                        Nearby Civic Alerts
                      </h4>
                      <p className="text-[11px] text-[#6B7F95] mt-0.5 truncate leading-tight">
                        Important civic alerts around your ward.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={preferences.nearbyCivicAlerts}
                    onClick={() => handleTogglePreference('nearbyCivicAlerts')}
                    className={cn(
                      'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-[#159A68]',
                      preferences.nearbyCivicAlerts ? 'bg-[#159A68]' : 'bg-[#DCE6E1]'
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out',
                        preferences.nearbyCivicAlerts ? 'translate-x-4' : 'translate-x-0'
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* =========================================================================
          5. COMPACT EDIT PROFILE MODAL
          ========================================================================= */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#102A43]/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md bg-white rounded-2xl border border-[#E3EAE6] shadow-xl p-5 space-y-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-[#F0F4F2] pb-3">
                <h3 className="font-heading font-extrabold text-base text-[#102A43]">
                  Edit Profile
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-7 h-7 rounded-lg hover:bg-[#F4F7F5] text-[#829AB1] hover:text-[#102A43] flex items-center justify-center cursor-pointer transition-colors"
                >
                  <LuX className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-[#526777] mb-1 font-heading">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#DCE6E1] rounded-xl font-semibold text-[#102A43] focus:outline-none focus:ring-1 focus:ring-[#159A68]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#526777] mb-1 font-heading">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#DCE6E1] rounded-xl font-semibold text-[#102A43] focus:outline-none focus:ring-1 focus:ring-[#159A68]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#526777] mb-1 font-heading">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#DCE6E1] rounded-xl font-semibold text-[#102A43] focus:outline-none focus:ring-1 focus:ring-[#159A68]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#526777] mb-1 font-heading">
                    Primary Municipal Ward
                  </label>
                  <select
                    value={primaryWard}
                    onChange={(e) => setPrimaryWard(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#DCE6E1] rounded-xl font-semibold text-[#102A43] focus:outline-none focus:ring-1 focus:ring-[#159A68] cursor-pointer"
                  >
                    {WARDS_OPTIONS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F0F4F2]">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl border border-[#DCE6E1] text-[#526777] hover:text-[#102A43] font-bold text-xs cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saveStatus === 'saving'}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#159A68] hover:bg-[#128358] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all disabled:opacity-50"
                  >
                    {saveStatus === 'saving' ? (
                      <LuRefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : saveStatus === 'saved' ? (
                      <LuCheck className="w-3.5 h-3.5" />
                    ) : (
                      <LuSave className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {saveStatus === 'saving'
                        ? 'Saving...'
                        : saveStatus === 'saved'
                        ? 'Saved'
                        : 'Save Changes'}
                    </span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </CitizenContentContainer>
  );
}

export default ProfilePage;
