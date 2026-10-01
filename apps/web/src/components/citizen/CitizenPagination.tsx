import React from 'react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { cn } from '@/lib/utils';

export interface CitizenPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
  showItemCount?: boolean;
}

/**
 * Standard Citizen Pagination Component (Reusable across My Incidents, Notifications, etc.)
 * Target height: 36-40px
 * Strict CivicPulse aesthetic with accessible keyboard navigation
 */
export function CitizenPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  onPageChange,
  disabled = false,
  compact = false,
  className,
  showItemCount = true,
}: CitizenPaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = totalItems !== undefined ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem =
    totalItems !== undefined ? Math.min(currentPage * pageSize, totalItems) : 0;

  // Build page numbers array (compact numbered list with ellipsis)
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('ellipsis');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  const handlePrev = () => {
    if (!disabled && currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (!disabled && currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <nav
      aria-label="Civic pagination navigation"
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 select-none w-full',
        className
      )}
    >
      {/* Item Range Counter */}
      {showItemCount && totalItems !== undefined ? (
        <span className="text-[#829AB1] font-medium text-[12px]">
          Showing <span className="font-semibold text-[#102A43] font-mono">{startItem}–{endItem}</span> of{' '}
          <span className="font-semibold text-[#102A43] font-mono">{totalItems}</span> items
        </span>
      ) : (
        <div className="hidden sm:block" />
      )}

      {/* Pagination Controls Container (36-40px height) */}
      <div className="inline-flex items-center gap-1.5 h-[38px] bg-white border border-[#E3EAE6] rounded-xl px-1.5 shadow-2xs">
        {/* Previous Button */}
        <button
          type="button"
          onClick={handlePrev}
          disabled={disabled || currentPage <= 1}
          className={cn(
            'inline-flex items-center gap-1 h-[30px] px-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
            disabled || currentPage <= 1
              ? 'text-[#C4D1D9] cursor-not-allowed opacity-50'
              : 'text-[#526777] hover:text-[#102A43] hover:bg-[#F4F7F5]'
          )}
          aria-label="Previous page"
        >
          <LuChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden xs:inline">Prev</span>
        </button>

        {compact ? (
          /* Compact style: Page X of Y */
          <span className="px-3 text-xs font-semibold text-[#526777]">
            Page <span className="font-mono text-[#102A43] font-bold">{currentPage}</span> of{' '}
            <span className="font-mono text-[#102A43] font-bold">{totalPages}</span>
          </span>
        ) : (
          /* Numbered Pills */
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, idx) => {
              if (page === 'ellipsis') {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-1.5 text-[#829AB1] font-mono text-xs select-none"
                  >
                    …
                  </span>
                );
              }

              const isActive = page === currentPage;
              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => !disabled && onPageChange(page)}
                  disabled={disabled}
                  className={cn(
                    'w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer',
                    isActive
                      ? 'bg-[#159A68] text-white shadow-xs'
                      : 'text-[#526777] hover:bg-[#F4F7F5] hover:text-[#102A43]'
                  )}
                  aria-label={`Page ${page}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {page}
                </button>
              );
            })}
          </div>
        )}

        {/* Next Button */}
        <button
          type="button"
          onClick={handleNext}
          disabled={disabled || currentPage >= totalPages}
          className={cn(
            'inline-flex items-center gap-1 h-[30px] px-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
            disabled || currentPage >= totalPages
              ? 'text-[#C4D1D9] cursor-not-allowed opacity-50'
              : 'text-[#526777] hover:text-[#102A43] hover:bg-[#F4F7F5]'
          )}
          aria-label="Next page"
        >
          <span className="hidden xs:inline">Next</span>
          <LuChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>
    </nav>
  );
}

export default CitizenPagination;
