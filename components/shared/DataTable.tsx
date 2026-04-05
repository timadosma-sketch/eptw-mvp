'use client';

import { cn } from '@/lib/utils/cn';
import { ChevronUp, ChevronDown, Loader2 } from 'lucide-react';

// ----------------------------------------------------------
// Column definition
// ----------------------------------------------------------

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  render: (row: T) => React.ReactNode;
}

// ----------------------------------------------------------
// DataTable
// ----------------------------------------------------------

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  className?: string;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  stickyHeader?: boolean;
}

export function DataTable<T>({
  columns, data, keyExtractor, isLoading = false,
  emptyMessage = 'No records found',
  onRowClick, className, sortKey, sortDir, onSort,
  stickyHeader = false,
}: DataTableProps<T>) {
  return (
    <div className={cn('w-full overflow-x-auto rounded-md border border-surface-border', className)}>
      <table className="w-full text-sm border-collapse">
        <thead className={cn('bg-surface-panel', stickyHeader && 'sticky top-0 z-10')}>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={cn(
                  'px-4 py-3 text-left text-2xs font-bold uppercase tracking-widest text-gray-500 border-b border-surface-border whitespace-nowrap select-none',
                  col.align === 'right'  && 'text-right',
                  col.align === 'center' && 'text-center',
                  col.sortable && 'cursor-pointer hover:text-gray-300 transition-colors'
                )}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable && sortKey === col.key && (
                    sortDir === 'asc'
                      ? <ChevronUp className="w-3 h-3" />
                      : <ChevronDown className="w-3 h-3" />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading…</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-600 text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={keyExtractor(row)}
                className={cn(
                  'border-b border-surface-border/50 transition-colors',
                  idx % 2 === 0 ? 'bg-surface-raised' : 'bg-surface-base',
                  onRowClick && 'cursor-pointer hover:bg-surface-hover'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map(col => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-3',
                      col.align === 'right'  && 'text-right',
                      col.align === 'center' && 'text-center'
                    )}
                  >
                    {col.render(row)}
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
