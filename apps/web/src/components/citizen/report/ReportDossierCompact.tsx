import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  LuFileText,
  LuCheck,
  LuCamera,
  LuMapPin,
  LuSparkles,
  LuActivity,
} from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { CategoryDefinition } from './CategoryTile';

interface ReportDossierCompactProps {
  selectedCategory?: CategoryDefinition;
  wardName?: string;
  hasEvidence?: boolean;
  intakeReady?: boolean;
}

export function ReportDossierCompact({
  selectedCategory,
  wardName = 'Ward 12 - Central Hosur',
  hasEvidence = false,
  intakeReady = false,
}: ReportDossierCompactProps) {
  const shouldReduceMotion = useReducedMotion();
  const isCategorySelected = Boolean(selectedCategory);

  // Animated Number Ticker for Progress Percentage
  const [displayPercent, setDisplayPercent] = useState(isCategorySelected ? 20 : 0);

  useEffect(() => {
    if (isCategorySelected) {
      if (shouldReduceMotion) {
        setDisplayPercent(20);
        return;
      }
      let current = 0;
      const stepInterval = setInterval(() => {
        current += 2;
        if (current >= 20) {
          setDisplayPercent(20);
          clearInterval(stepInterval);
        } else {
          setDisplayPercent(current);
        }
      }, 30);
      return () => clearInterval(stepInterval);
    } else {
      setDisplayPercent(0);
    }
  }, [isCategorySelected, selectedCategory?.id, shouldReduceMotion]);

  return (
    <div className="rounded-2xl bg-white border border-[#E3EAE6] p-4 shadow-[0_4px_24px_rgba(15,40,30,0.04)] space-y-3.5 text-left select-none">
      {/* Dossier Header & Thin Animated Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-[#E3EAE6]/60">
          <div className="flex items-center gap-2">
            <LuFileText className="w-3.5 h-3.5 text-[#159A68]" />
            <span className="font-heading font-extrabold text-[11px] tracking-wider uppercase text-[#102A43]">
              REPORT DOSSIER
            </span>
            <span className="text-[10px] font-semibold text-[#829AB1] bg-slate-100 px-1.5 py-0.2 rounded">
              Draft
            </span>
          </div>

          {/* Animated Number Ticker */}
          <span className="text-[11px] font-heading font-extrabold text-[#159A68] font-mono">
            {displayPercent}% complete
          </span>
        </div>

        {/* Thin Sleek Progress Line */}
        <div className="h-1.5 w-full bg-[#FAF8F5] rounded-full overflow-hidden border border-[#E3EAE6]/50">
          <motion.div
            initial={false}
            animate={{ width: `${displayPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-[#159A68] rounded-full"
          />
        </div>
      </div>

      {/* Assembly Document Rows (Document-Building Metaphor) */}
      <div className="space-y-2 text-xs">
        {/* Category Row with Micro-Animation Arrival */}
        <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E3EAE6] transition-all">
          <span className="text-[10px] font-bold text-[#829AB1] uppercase tracking-wider block font-heading">
            Category
          </span>

          <AnimatePresence mode="wait">
            {selectedCategory ? (
              <motion.div
                key={selectedCategory.id}
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="mt-1 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="font-bold text-[#102A43] text-xs font-heading truncate">
                    {selectedCategory.label}
                  </p>
                  <p className="text-[10.5px] text-[#159A68] font-medium truncate">
                    {selectedCategory.department}
                  </p>
                </div>
                {/* Captured Pill with Icon */}
                <span className="inline-flex items-center gap-1 text-[10px] font-bold font-heading text-[#159A68] bg-[#E7F7F0] px-2 py-0.5 rounded-md border border-[#159A68]/20 shrink-0">
                  <LuCheck className="w-3 h-3 stroke-[3]" />
                  <span>Captured</span>
                </span>
              </motion.div>
            ) : (
              <p className="text-[11px] text-[#829AB1] italic mt-0.5">
                Waiting for category signal...
              </p>
            )}
          </AnimatePresence>
        </div>

        {/* Evidence Step Placeholder */}
        <div className="p-2 rounded-xl bg-white border border-[#E3EAE6]/70 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 text-[#829AB1]">
            <LuCamera className="w-3.5 h-3.5 shrink-0" />
            <span>Photographic Evidence</span>
          </div>
          <span className="text-[10px] text-[#829AB1] font-medium">→ Next signal</span>
        </div>

        {/* Location Step Placeholder */}
        <div className="p-2 rounded-xl bg-white border border-[#E3EAE6]/70 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 text-[#829AB1]">
            <LuMapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{wardName}</span>
          </div>
          <span className="text-[10px] text-[#829AB1] font-medium shrink-0">→ Step 3</span>
        </div>

        {/* Details Step Placeholder */}
        <div className="p-2 rounded-xl bg-white border border-[#E3EAE6]/70 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 text-[#829AB1]">
            <LuFileText className="w-3.5 h-3.5 shrink-0" />
            <span>Citizen Observations</span>
          </div>
          <span className="text-[10px] text-[#829AB1] font-medium shrink-0">→ Step 4</span>
        </div>
      </div>

      {/* Dynamic Staggered System Understanding Panel */}
      <div className="pt-2 border-t border-[#E3EAE6]/70">
        <div className="p-2.5 rounded-xl bg-[#E7F7F0]/40 border border-[#159A68]/20 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[#159A68] font-heading font-extrabold text-[10.5px] uppercase tracking-wider">
            <LuSparkles className="w-3 h-3" />
            <span>SYSTEM UNDERSTANDING</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10.5px]">
            {/* 1. Issue Type */}
            <motion.div
              initial={false}
              animate={{ opacity: isCategorySelected ? 1 : 0.6, y: isCategorySelected ? 0 : 2 }}
              transition={{ duration: 0.25, delay: 0.05 }}
            >
              <span className="text-[#829AB1] block text-[9.5px]">Issue Type</span>
              <span className="font-bold text-[#102A43] truncate block">
                {selectedCategory ? selectedCategory.label.split(' & ')[0] : 'Pending'}
              </span>
            </motion.div>

            {/* 2. Likely Department */}
            <motion.div
              initial={false}
              animate={{ opacity: isCategorySelected ? 1 : 0.6, y: isCategorySelected ? 0 : 2 }}
              transition={{ duration: 0.25, delay: 0.15 }}
            >
              <span className="text-[#829AB1] block text-[9.5px]">Likely Department</span>
              <span className="font-bold text-[#159A68] truncate block">
                {selectedCategory
                  ? selectedCategory.department.replace('Department of ', '')
                  : 'Pending'}
              </span>
            </motion.div>

            {/* 3. Initial Priority */}
            <motion.div
              initial={false}
              animate={{ opacity: isCategorySelected ? 1 : 0.6, y: isCategorySelected ? 0 : 2 }}
              transition={{ duration: 0.25, delay: 0.25 }}
            >
              <span className="text-[#829AB1] block text-[9.5px]">Initial Priority</span>
              <span className="font-semibold text-[#102A43] block">
                Standard Field Dispatch
              </span>
            </motion.div>

            {/* 4. Next Requirement */}
            <motion.div
              initial={false}
              animate={{ opacity: isCategorySelected ? 1 : 0.6, y: isCategorySelected ? 0 : 2 }}
              transition={{ duration: 0.25, delay: 0.35 }}
            >
              <span className="text-[#829AB1] block text-[9.5px]">Next Requirement</span>
              <span className="font-semibold text-[#159A68] block">
                Photo Evidence
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportDossierCompact;
