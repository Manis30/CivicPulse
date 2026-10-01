import React from 'react';
import { cn } from '@/lib/utils';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
  width?: string;
}

export interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    pageSize: number;
    onPageChange: (page: number) => void;
  };
  className?: string;
}

export function AdminTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  isLoading,
  emptyMessage = 'No records found',
  pagination,
  className,
}: AdminTableProps<T>) {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div
      className={cn(
        'rounded-2xl bg-[#0E1B2D] border border-[rgba(148,163,184,0.16)] overflow-hidden shadow-sm flex flex-col',
        className
      )}
    >
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs text-[#94A3B8]">
          <thead className="bg-[#101F33] text-[#F8FAFC] font-semibold uppercase text-[11px] font-mono tracking-wider border-b border-[rgba(148,163,184,0.14)] select-none">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={col.width ? { width: col.width } : undefined}
                  className={cn('px-5 py-3.5 whitespace-nowrap', col.className)}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[rgba(148,163,184,0.08)] font-sans">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-5 py-4">
                      <div className="h-4 bg-[#13243A] rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : safeData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-[#64748B] text-xs font-sans"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              safeData.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'transition-colors duration-150',
                    onRowClick
                      ? 'hover:bg-[#13243A] cursor-pointer'
                      : 'hover:bg-[#101F33]'
                  )}
                >
                  {columns.map((col, cIdx) => (
                    <td
                      key={cIdx}
                      className={cn('px-5 py-4 text-[#F8FAFC] whitespace-nowrap', col.className)}
                    >
                      {col.cell
                        ? col.cell(row)
                        : col.accessorKey
                        ? (row[col.accessorKey] as any)
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="px-5 py-3 bg-[#101F33] border-t border-[rgba(148,163,184,0.12)] flex items-center justify-between text-xs text-[#94A3B8] font-sans">
          <span>
            Showing page <span className="font-bold text-[#F8FAFC]">{pagination.currentPage}</span> of{' '}
            <span className="font-bold text-[#F8FAFC]">{pagination.totalPages}</span> ({pagination.totalRecords} total)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className="p-1.5 rounded-lg bg-[#13243A] border border-[rgba(148,163,184,0.16)] text-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#5B5BF7]/50 transition-colors"
            >
              <LuChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="p-1.5 rounded-lg bg-[#13243A] border border-[rgba(148,163,184,0.16)] text-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#5B5BF7]/50 transition-colors"
            >
              <LuChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
