import React, { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { LuCheck } from 'react-icons/lu';
import { cn } from '@/lib/utils';

export interface CategoryDefinition {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  department: string;
  accentBg: string;
  iconColor: string;
}

interface CategoryTileProps {
  category: CategoryDefinition;
  isSelected: boolean;
  onSelect: (id: string, originRect?: DOMRect) => void;
}

export function CategoryTile({ category, isSelected, onSelect }: CategoryTileProps) {
  const shouldReduceMotion = useReducedMotion();
  const tileRef = useRef<HTMLButtonElement | null>(null);

  const handleClick = () => {
    const rect = tileRef.current?.getBoundingClientRect();
    onSelect(category.id, rect);
  };

  return (
    <motion.button
      ref={tileRef}
      type="button"
      onClick={handleClick}
      whileHover={shouldReduceMotion ? {} : { y: -2 }}
      animate={
        isSelected && !shouldReduceMotion
          ? {
              scale: [1, 1.015, 1],
              transition: { type: 'spring', stiffness: 350, damping: 25 },
            }
          : { scale: 1 }
      }
      aria-pressed={isSelected}
      className={cn(
        'w-full text-left rounded-xl p-3 sm:p-3.5 transition-all relative cursor-pointer group flex items-start gap-3 select-none overflow-hidden',
        'border',
        isSelected
          ? 'bg-[#E7F7F0]/40 border-[#159A68] shadow-[0_4px_20px_rgba(21,154,104,0.12)] ring-1 ring-[#159A68]/30'
          : 'bg-white border-[#E3EAE6] hover:border-[#159A68]/40 hover:bg-[#FAF8F5]/80 hover:shadow-2xs'
      )}
    >
      {/* Subtle border highlight line that sweeps on hover */}
      {!shouldReduceMotion && (
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#159A68]/30 to-transparent" />
        </div>
      )}

      {/* Category Icon Container (44x44, rounded-xl, light tint) */}
      <div
        className={cn(
          'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 border',
          category.accentBg,
          isSelected
            ? 'scale-105 shadow-2xs'
            : 'group-hover:scale-105 group-hover:brightness-95'
        )}
      >
        <div style={{ color: category.iconColor }}>
          {category.icon}
        </div>
      </div>

      {/* Main Info */}
      <div className="flex-1 min-w-0 pr-6">
        <h4 className="font-heading font-bold text-xs sm:text-[13px] text-[#102A43] tracking-tight leading-snug truncate group-hover:text-[#0B3D2E] transition-colors">
          {category.label}
        </h4>
        <p className="text-[11px] text-[#6B7C8F] leading-tight mt-0.5 truncate transition-transform duration-200 group-hover:translate-x-0.5">
          {category.description}
        </p>
        <span
          className={cn(
            'inline-block mt-1.5 text-[9.5px] font-semibold px-2 py-0.5 rounded-md tracking-tight transition-colors',
            isSelected
              ? 'text-[#0B3D2E] bg-[#E7F7F0] font-bold border border-[#159A68]/20'
              : 'text-[#159A68] bg-[#E7F7F0]/70 group-hover:bg-[#E7F7F0]'
          )}
        >
          {category.department}
        </span>
      </div>

      {/* Animated Checkmark Indicator (Spring scale) */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 26 }}
          className="absolute top-3 right-3 w-4.5 h-4.5 rounded-full bg-[#159A68] text-white flex items-center justify-center shadow-xs"
        >
          <LuCheck className="w-2.5 h-2.5 stroke-[3.5]" />
        </motion.div>
      )}
    </motion.button>
  );
}

export default CategoryTile;
