import React from 'react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
  showItemCount?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 6,
  onPageChange,
  className,
  showItemCount = true,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Calculate page item ranges
  const startItem = totalItems !== undefined ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem =
    totalItems !== undefined ? Math.min(currentPage * pageSize, totalItems) : 0;

  // Generate page numbers array (with ellipsis for larger lists)
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

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 text-xs select-none',
        className
      )}
    >
      {/* Item Range Counter */}
      {showItemCount && totalItems !== undefined ? (
        <span className="text-[#829AB1] font-medium text-[11.5px]">
          Showing <span className="font-semibold text-[#102A43] font-mono">{startItem}–{endItem}</span> of{' '}
          <span className="font-semibold text-[#102A43] font-mono">{totalItems}</span> items
        </span>
      ) : (
        <div className="hidden sm:block" />
      )}

      {/* Pagination Controls */}
      <div className="inline-flex items-center gap-1.5 bg-white border border-[#E3EAE6] rounded-xl p-1 shadow-2xs">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={cn(
            'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
            currentPage <= 1
              ? 'text-[#C4D1D9] cursor-not-allowed'
              : 'text-[#526777] hover:text-[#102A43] hover:bg-[#F4F7F5]'
          )}
          aria-label="Previous page"
        >
          <LuChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Prev</span>
        </button>

        {/* Numbered Pills */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) => {
            if (page === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-[#829AB1] font-mono text-xs"
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
                onClick={() => onPageChange(page)}
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

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={cn(
            'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
            currentPage >= totalPages
              ? 'text-[#C4D1D9] cursor-not-allowed'
              : 'text-[#526777] hover:text-[#102A43] hover:bg-[#F4F7F5]'
          )}
          aria-label="Next page"
        >
          <span className="hidden xs:inline">Next</span>
          <LuChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export { CitizenPagination } from '@/components/citizen/CitizenPagination';
export type { CitizenPaginationProps } from '@/components/citizen/CitizenPagination';

export default Pagination;
