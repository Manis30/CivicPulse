import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  LuBadgeCheck,
  LuShieldCheck,
  LuCircleDot
} from 'react-icons/lu';

interface CivicIdentityCardProps {
  fullName: string;
  email: string;
  ward: string;
  initials: string;
}

export function CivicIdentityCard({
  fullName,
  email,
  ward,
  initials,
}: CivicIdentityCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}
      className="bg-white rounded-[16px] border border-[#DCE6E1] p-4 sm:p-5 shadow-xs text-left select-none space-y-3.5"
    >
      {/* Header: CIVIC IDENTITY + Brand Signature Pulse Line */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E2E9E5]">
        <span className="text-[11px] font-bold font-heading text-[#102A43] uppercase tracking-wider">
          Civic Identity
        </span>

        {/* Subtle Signature Brand Pulse Line (Draws 0 -> 1 once on page load) */}
        <div className="w-12 h-3.5 opacity-65">
          <svg viewBox="0 0 48 16" className="w-full h-full overflow-visible">
            <motion.path
              d="M 0,8 L 14,8 L 18,2 L 24,14 L 28,8 L 48,8"
              fill="none"
              stroke="#159A68"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={shouldReduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
          </svg>
        </div>
      </div>

      {/* Identity Core: Avatar (76px) with faint green radial glow + Name + Email + Verified Badge */}
      <div className="flex flex-col items-center text-center pt-1 pb-1">
        {/* Avatar Container with spring entrance & subtle radial glow */}
        <div className="relative inline-block mb-2">
          {/* Faint green radial glow behind avatar */}
          <div className="absolute inset-0 -m-2 rounded-full bg-[#159A68]/15 blur-lg pointer-events-none -z-10" />

          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.38, ease: 'easeOut' }}
            className="w-19 h-19 sm:w-20 sm:h-20 rounded-full bg-[#E7F7F0] border-2 border-[#159A68]/30 text-[#0B3D2E] flex items-center justify-center font-heading font-extrabold text-2xl shadow-xs"
          >
            {initials}
          </motion.div>

          {/* Verified Badge Check (Overlapping bottom-right) */}
          <motion.div
            initial={shouldReduceMotion ? { scale: 1 } : { scale: 0.7 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 360, damping: 20, delay: 0.2 }}
            className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#159A68] text-white flex items-center justify-center border-2 border-white shadow-xs"
            title="Verified Citizen"
          >
            <LuBadgeCheck className="w-3.5 h-3.5 stroke-[2.8]" />
          </motion.div>
        </div>

        {/* User Name & Email */}
        <h2 className="text-base sm:text-[17px] font-extrabold font-heading text-[#102A43] tracking-tight leading-snug">
          {fullName}
        </h2>
        <p className="text-xs text-[#627D98] truncate max-w-[240px] font-sans mt-0.5">
          {email}
        </p>

        {/* Verified Citizen Badge */}
        <div className="mt-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E7F7F0] text-[#159A68] text-[11px] font-bold border border-[#159A68]/20 font-heading">
            <LuShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Verified Citizen</span>
          </span>
        </div>
      </div>

      {/* Separator 1 */}
      <div className="h-[1px] bg-[#E2E9E5] w-full" />

      {/* Metadata Rows: Ward + Account Status */}
      <div className="space-y-2 text-xs font-sans">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#829AB1] font-heading block">
            Ward
          </span>
          <span className="font-semibold text-[#102A43] text-xs block mt-0.5 truncate">
            {ward}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#829AB1] font-heading block">
            Account
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-[#159A68] animate-pulse" />
            <span className="font-semibold text-[#159A68] text-xs">Active</span>
          </div>
        </div>
      </div>

      {/* Separator 2 */}
      <div className="h-[1px] bg-[#E2E9E5] w-full" />

      {/* Footer: Civic Member • Active since 2026 */}
      <div className="flex items-center justify-between text-[11px] text-[#627D98] font-sans pt-0.5">
        <span className="font-medium text-[#102A43]">Civic Member</span>
        <span className="text-[#829AB1]">Active since 2026</span>
      </div>
    </motion.div>
  );
}

export default CivicIdentityCard;
