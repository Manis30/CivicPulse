import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { LuCheck } from 'react-icons/lu';

interface ProfileHeaderProps {
  saveStatus: 'idle' | 'saving' | 'saved';
}

export function ProfileHeader({ saveStatus }: ProfileHeaderProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="h-[52px] sm:h-[60px] pb-2 border-b border-[#E2E9E5] flex items-center justify-between gap-3 select-none"
    >
      <div>
        <h1 className="text-[22px] sm:text-[24px] font-bold font-heading text-[#102A43] tracking-tight leading-tight">
          Profile & Preferences
        </h1>
        <p className="text-[12px] sm:text-[13px] text-[#627D98] font-sans mt-0.5">
          Your civic identity and communication preferences.
        </p>
      </div>

      {/* Right side status indicator */}
      <div className="flex items-center shrink-0">
        {saveStatus === 'saved' ? (
          <motion.div
            key="saved"
            initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7F7F0] border border-[#159A68]/30 text-[#159A68] text-xs font-bold font-heading shadow-2xs"
          >
            <LuCheck className="w-3.5 h-3.5 stroke-[2.8]" />
            <span>Changes Saved</span>
          </motion.div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#DCE6E1] text-[#102A43] text-xs font-semibold font-heading shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#159A68] animate-pulse" />
            <span>Profile Active</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ProfileHeader;
