import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  LuBell,
  LuActivity,
  LuBadgeCheck,
  LuMapPin
} from 'react-icons/lu';
import { NotificationPreferenceRow } from './NotificationPreferenceRow';

export interface NotificationPreferencesState {
  incidentStatusUpdates: boolean;
  resolutionUpdates: boolean;
  nearbyCivicAlerts: boolean;
}

interface NotificationPreferencesCardProps {
  preferences: NotificationPreferencesState;
  onToggle: (key: keyof NotificationPreferencesState) => void;
}

export function NotificationPreferencesCard({
  preferences,
  onToggle,
}: NotificationPreferencesCardProps) {
  const shouldReduceMotion = useReducedMotion();

  const activeCount = Object.values(preferences).filter(Boolean).length;

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.22, ease: 'easeOut' }}
      className="bg-white rounded-[16px] border border-[#DCE6E1] p-4 sm:p-5 shadow-xs text-left select-none space-y-2.5"
    >
      {/* Header: NOTIFICATION PREFERENCES */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E2E9E5]">
        <div>
          <h3 className="text-xs sm:text-[13px] font-extrabold font-heading text-[#102A43] uppercase tracking-wide">
            Notification Preferences
          </h3>
          <p className="text-[11px] sm:text-[11.5px] text-[#627D98] font-sans">
            Choose which CivicPulse updates you receive.
          </p>
        </div>

        {/* Small active badge */}
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF8F5] border border-[#DCE6E1] text-[10.5px] font-bold text-[#526777] font-heading shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#159A68]" />
          <span>{activeCount === 3 ? 'All Active' : `${activeCount}/3 Active`}</span>
        </span>
      </div>

      {/* 3 Compact Rows (~48-52px each) */}
      <div className="space-y-0.5 divide-y divide-[#E2E9E5]/60">
        <NotificationPreferenceRow
          id="pref-status"
          title="Incident Status Updates"
          description="Receive updates when your reports change status."
          checked={preferences.incidentStatusUpdates}
          onChange={() => onToggle('incidentStatusUpdates')}
          icon={LuActivity}
        />

        <div className="pt-0.5">
          <NotificationPreferenceRow
            id="pref-resolution"
            title="Resolution Updates"
            description="Know when a reported issue is resolved or ready for verification."
            checked={preferences.resolutionUpdates}
            onChange={() => onToggle('resolutionUpdates')}
            icon={LuBadgeCheck}
          />
        </div>

        <div className="pt-0.5">
          <NotificationPreferenceRow
            id="pref-nearby"
            title="Nearby Civic Alerts"
            description="Receive important civic issue alerts around your ward."
            checked={preferences.nearbyCivicAlerts}
            onChange={() => onToggle('nearbyCivicAlerts')}
            icon={LuMapPin}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default NotificationPreferencesCard;
