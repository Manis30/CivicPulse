import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Bell,
  ArrowRight,
  Sparkles,
  Truck,
  Wrench,
  CheckCircle2
} from 'lucide-react';
import { NotificationRecord } from '@/services/notificationService';

interface LatestUpdatesCardProps {
  notifications?: NotificationRecord[];
}

const DEFAULT_UPDATES = [
  {
    id: 'up-1',
    title: 'AI analysis completed',
    message: 'Your pothole report has been analyzed and classified as High Priority.',
    timeAgo: '2h ago',
    icon: Sparkles,
    color: '#159A68',
    bg: '#E7F7F0',
    isNew: true,
  },
  {
    id: 'up-2',
    title: 'Field team assigned',
    message: 'Roads Department — Crew B has been assigned.',
    timeAgo: '4h ago',
    icon: Truck,
    color: '#2878E5',
    bg: '#EBF3FD',
    isNew: false,
  },
  {
    id: 'up-3',
    title: 'Work in progress',
    message: 'Field team has started work at Anna Nagar Main Road.',
    timeAgo: '6h ago',
    icon: Wrench,
    color: '#F2B84B',
    bg: '#FEF8EC',
    isNew: false,
  },
  {
    id: 'up-4',
    title: 'Resolution verified',
    message: 'Your garbage overflow report has been verified and closed.',
    timeAgo: '1d ago',
    icon: CheckCircle2,
    color: '#36B37E',
    bg: '#EBF8F2',
    isNew: false,
  },
];

export function LatestUpdatesCard({ notifications }: LatestUpdatesCardProps) {
  const shouldReduceMotion = useReducedMotion();

  // If backend notifications exist, format them with citizen-first friendly language
  const updates = (notifications && notifications.length > 0)
    ? notifications.slice(0, 4).map((n, i) => {
        const fallback = DEFAULT_UPDATES[i % DEFAULT_UPDATES.length];
        return {
          id: n.id,
          title: n.channel === 'SMS' ? 'SMS Notification' : fallback.title,
          message: n.message || fallback.message,
          timeAgo: 'Recent',
          icon: fallback.icon,
          color: fallback.color,
          bg: fallback.bg,
          isNew: i === 0,
        };
      })
    : DEFAULT_UPDATES;

  return (
    <div className="bg-white rounded-3xl border border-[#102A43]/[0.08] p-5 shadow-xs text-left select-none space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#102A43]/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#E7F7F0] text-[#159A68] flex items-center justify-center">
            <Bell className="w-3.5 h-3.5 stroke-[2.4]" />
          </div>
          <h3 className="font-heading font-extrabold text-sm text-[#102A43]">
            Latest Updates
          </h3>
        </div>

        <Link
          to="/citizen/notifications"
          className="text-xs font-bold text-[#159A68] hover:text-[#128358] flex items-center gap-1 font-heading transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Stream Items List with Staggered Entrance */}
      <div className="space-y-2.5">
        {updates.map((item, idx) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.id}
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.55 + idx * 0.06, ease: 'easeOut' }}
              className="p-2.5 sm:p-3 rounded-2xl bg-[#FAF8F5] hover:bg-slate-50 border border-[#102A43]/[0.04] transition-colors flex items-start gap-2.5 text-left"
            >
              {/* Event Icon Badge */}
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: item.bg, color: item.color }}
              >
                <Icon className="w-3.5 h-3.5 stroke-[2.4]" />
              </div>

              {/* Event Text */}
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {/* Tiny green indicator for new updates (no flashing) */}
                    {item.isNew && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#159A68] shrink-0" title="New" />
                    )}
                    <span className="text-xs font-bold text-[#102A43] font-heading truncate">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#829AB1] font-mono shrink-0">
                    {item.timeAgo}
                  </span>
                </div>
                <p className="text-[11px] text-[#526777] font-sans line-clamp-1 leading-snug">
                  {item.message}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default LatestUpdatesCard;
