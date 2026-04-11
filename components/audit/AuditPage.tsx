'use client';

import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PageShell } from '@/components/shared/PageShell';
import { DataTable, Column } from '@/components/shared/DataTable';
import { Button } from '@/components/shared/Button';
import { useT } from '@/lib/i18n/useT';
import { MOCK_AUDIT_LOG } from '@/lib/mock/audit';
import { formatDateTime } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';
import type { AuditEntry, AuditAction } from '@/lib/types';

const PAGE_SIZE = 50;

const ACTION_COLOR: Partial<Record<AuditAction, string>> = {
  PERMIT_CREATED:           'text-blue-400',
  PERMIT_SUBMITTED:         'text-blue-300',
  PERMIT_APPROVED:          'text-emerald-400',
  PERMIT_REJECTED:          'text-red-400',
  PERMIT_ACTIVATED:         'text-emerald-300',
  PERMIT_SUSPENDED:         'text-orange-400',
  PERMIT_CLOSED:            'text-gray-400',
  PERMIT_CANCELLED:         'text-red-500',
  GAS_TEST_RECORDED:        'text-cyan-400',
  GAS_TEST_FAILED:          'text-red-400',
  ISOLATION_APPLIED:        'text-yellow-400',
  ISOLATION_RELEASED:       'text-blue-400',
  APPROVAL_SUBMITTED:       'text-purple-400',
  SIMOPS_CONFLICT_RAISED:   'text-orange-300',
  SHIFT_HANDOVER_COMPLETED: 'text-teal-400',
  USER_LOGIN:               'text-gray-500',
  USER_LOGOUT:              'text-gray-600',
  SYSTEM_ALERT:             'text-red-300',
};

export function AuditPage() {
  const { t } = useT();
  const [search,     setSearch]     = useState('');
  const [log,        setLog]        = useState<AuditEntry[]>(MOCK_AUDIT_LOG);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(MOCK_AUDIT_LOG.length);
  const [loading,    setLoading]    = useState(false);

  const loadPage = (p: number) => {
    setLoading(true);
    fetch(`/api/audit?page=${p}&pageSize=${PAGE_SIZE}`)
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (json?.data) {
          setLog(json.data);
          setTotal(json.total ?? json.data.length);
          setTotalPages(json.totalPages ?? Math.ceil((json.total ?? json.data.length) / PAGE_SIZE));
        }
      })
      .catch(() => { /* keep current data */ })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPage(page);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Client-side search against current page; search resets to page 1
  const handleSearch = (val: string) => {
    setSearch(val);
    if (page !== 1) setPage(1);
  };

  const filtered = log.filter(e => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (e.entityRef ?? '').toLowerCase().includes(q) ||
      e.action.toLowerCase().includes(q) ||
      (e.performedBy?.name ?? '').toLowerCase().includes(q)
    );
  });

  const AUDIT_COLUMNS: Column<AuditEntry>[] = [
    {
      key: 'time',
      header: t.audit.timestamp,
      width: '150px',
      render: e => <span className="text-xs font-mono text-gray-400">{formatDateTime(e.performedAt)}</span>,
    },
    {
      key: 'action',
      header: t.audit.action,
      width: '200px',
      render: e => (
        <span className={cn('text-xs font-mono font-semibold', ACTION_COLOR[e.action] ?? 'text-gray-400')}>
          {e.action.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'entity',
      header: t.audit.entity,
      width: '120px',
      render: e => (
        <div>
          <div className="text-xs text-gray-300 font-mono">{e.entityRef ?? '—'}</div>
          <div className="text-2xs text-gray-600">{e.entity}</div>
        </div>
      ),
    },
    {
      key: 'by',
      header: t.audit.performedBy,
      width: '150px',
      render: e => (
        <div>
          <div className="text-xs text-gray-300">{e.performedBy?.name ?? '—'}</div>
          <div className="text-2xs text-gray-600">{(e.performedBy?.role ?? '').replace(/_/g, ' ')}</div>
        </div>
      ),
    },
    {
      key: 'changes',
      header: t.audit.changes,
      render: e => {
        if (!e.changes?.length) return <span className="text-2xs text-gray-600">—</span>;
        return (
          <div className="space-y-0.5">
            {e.changes.map((c, i) => (
              <div key={i} className="text-2xs font-mono">
                <span className="text-gray-500">{c.field}:</span>{' '}
                <span className="text-red-400 line-through">{String(c.from ?? c.oldValue ?? '—')}</span>
                {' → '}
                <span className="text-emerald-400">{String(c.to ?? c.newValue ?? '—')}</span>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      key: 'ip',
      header: t.audit.source,
      width: '120px',
      render: e => <span className="text-2xs font-mono text-gray-600">{e.ipAddress || '—'}</span>,
    },
  ];

  return (
    <PageShell
      title={t.audit.title}
      subtitle={`${total.toLocaleString()} entries — immutable tamper-evident log`}
    >
      <div className="flex items-center gap-3 pb-2 mb-1 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder={t.audit.searchPlaceholder}
            className="pl-9 pr-3 py-2 bg-surface-raised border border-surface-border rounded text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-brand/50 w-72"
          />
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-500">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="xs"
              icon={ChevronLeft}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
            >
              Prev
            </Button>
            <Button
              variant="ghost"
              size="xs"
              icon={ChevronRight}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <DataTable
        columns={AUDIT_COLUMNS}
        data={filtered}
        keyExtractor={e => e.id}
        emptyMessage="No audit entries found"
        stickyHeader
      />

      {/* Bottom pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-surface-border mt-2">
          <span className="text-xs text-gray-500">
            Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString()}
          </span>
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    'w-7 h-7 text-xs rounded border transition-all',
                    p === page
                      ? 'bg-brand/20 border-brand/60 text-brand font-bold'
                      : 'border-surface-border text-gray-500 hover:text-gray-300 hover:border-gray-500'
                  )}
                >
                  {p}
                </button>
              );
            })}
            {totalPages > 7 && (
              <span className="text-xs text-gray-600">… {totalPages}</span>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
}
