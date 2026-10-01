import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

// ==========================================
// DataTable
// ==========================================
export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  isLoading,
  emptyMessage = 'No operational records located',
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn('w-full overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-civic-card', className)}>
      <table className="w-full text-left text-xs border-collapse font-sans">
        <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={cn(
                  'px-5 py-3.5',
                  col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-8 text-center text-slate-400 font-sans animate-pulse">
                Querying cluster data telemetry...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-8 text-center text-slate-400 font-sans">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'transition-colors duration-150 hover:bg-slate-50/80',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-5 py-4 text-slate-700',
                      col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                    )}
                  >
                    {col.render ? col.render(row) : (row as Record<string, unknown>)[col.key] as React.ReactNode}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ==========================================
// Timeline
// ==========================================
export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  status?: 'completed' | 'active' | 'pending' | 'failed';
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn('relative space-y-4 pl-6 border-l border-slate-200', className)}>
      {items.map((item) => {
        const isCompleted = item.status === 'completed';
        const isActive = item.status === 'active';
        const isFailed = item.status === 'failed';

        return (
          <div key={item.id} className="relative group">
            {/* Timeline node */}
            <div
              className={cn(
                'absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white transition-colors',
                isCompleted && 'bg-emerald-500 border-emerald-400',
                isActive && 'bg-blue-600 border-blue-400 animate-pulse',
                isFailed && 'bg-rose-500 border-rose-400',
                !item.status && 'bg-slate-300 border-slate-400'
              )}
            />

            <div className="flex items-baseline justify-between gap-2">
              <h5 className="text-xs font-semibold text-slate-800 font-sans">{item.title}</h5>
              <span className="text-[11px] font-sans text-slate-400 shrink-0">{item.timestamp}</span>
            </div>

            {item.description && <p className="text-xs text-slate-500 mt-0.5 font-sans">{item.description}</p>}
            {item.badge && <div className="mt-1.5">{item.badge}</div>}
          </div>
        );
      })}
    </div>
  );
}

// ==========================================
// PageHeader & SectionHeader
// ==========================================
export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
  tag?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  tag,
}: PageHeaderProps) {
  return (
    <div className="mb-6 space-y-2">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} />
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-slate-900">
              {title}
            </h1>
            {tag && (
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700 rounded-full font-sans">
                {tag}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-slate-500 mt-1 max-w-2xl font-sans">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs font-sans text-slate-400 mb-1" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={item.label}>
            {item.href && !isLast ? (
              <a href={item.href} className="hover:text-blue-600 transition-colors">
                {item.label}
              </a>
            ) : (
              <span className={isLast ? 'text-slate-700 font-semibold' : ''}>{item.label}</span>
            )}
            {!isLast && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2.5">
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans">
          {title}
        </h4>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5 font-sans">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

