import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuX } from 'react-icons/lu';
import { cn } from '@/lib/utils';

export interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
  width?: string; // e.g. max-w-xl, max-w-2xl
}

export function AdminDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  children,
  width = 'max-w-2xl',
}: AdminDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#07111F]/80 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className={cn(
              'relative z-10 w-full h-full bg-[#0E1B2D] border-l border-[rgba(148,163,184,0.18)] shadow-2xl flex flex-col font-sans text-[#F8FAFC]',
              width
            )}
          >
            {/* Header */}
            <div className="px-6 py-5 bg-[#101F33] border-b border-[rgba(148,163,184,0.14)] flex items-center justify-between shrink-0">
              <div className="space-y-1 min-w-0 pr-4">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-bold font-heading text-[#F8FAFC] truncate">
                    {title}
                  </h3>
                  {badge && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#13243A] text-[#6D5DFB] border border-[#5B5BF7]/30">
                      {badge}
                    </span>
                  )}
                </div>
                {subtitle && (
                  <p className="text-xs text-[#94A3B8] font-sans truncate">{subtitle}</p>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#13243A] border border-transparent hover:border-[rgba(148,163,184,0.14)] transition-colors"
                aria-label="Close drawer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
