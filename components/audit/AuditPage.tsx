'use client';

import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PageShell } from '@/components/shared/PageShell';
import { DataTable, Column } from '@/components/shared/DataTable';
import { useT } from '@/lib/i18n/useT';
import { MOCK_AUDIT_LOG } from '@/lib/mock/audit';
import { formatDateTime } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';
import type { AuditEntry, AuditAction } from '@/lib/types';

const ACTION_COLOR: Partial<Record<AuditAction, string>> = {
  PERMIT_CREATED:        'text-blue-400',
  PERMIT_SUBMITTED:      'text-blue-300',
  PERMIT_APPROVED:       'text-emerald-400',
  PERMIT_REJECTED:       'text-red-400',
  PERMIT_ACTIVATED:      'text-emerald-300',
  PERMIT_SUSPENDED:      'text-orange-400',
  PERMIT_CLOSED:         'text-gray-400',
  PERMIT_CANCELLED:      'text-red-500',
  GAS_TEST_RECORDED:     'text-cyan-400',
  GAS_TEST_FAILED:       'text-red-400',
  ISOLATION_APPLIED:     'text-yellow-400',
  ISOLATION_RELEASED:    'text-blue-400',
  APPROVAL_SUBMITTED:    'text-purple-400',
  SIMOPS_CONFLICT_RAISED:'text-orange-300',
  SHIFT_HANDOVER_COMPLETED:'text-teal-400',
  USER_LOGIN:            'text-gray-500',
  USER_LOGOUT:           'text-gray-600',
  SYSTEM_ALERT:          'text-red-300',
};

export function AuditPage() {
  const { t } = useT();
  const [search, setSearch] = useState('');
  const [log, setLog] = useState<AuditEntry[]>(MOCK_AUDIT_LOG);

  useEffect(() => {
    fetch('/api/audit?pageSize=100')
      .then(r => r.ok ? r.json() : null)
      .then(json => { if (json?.data?.length) setLog(json.data); })
      .catch(() => { /* keep mock */ });
  }, []);

  const filtered = log.filter(e => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.entityRef.toLowerCase().includes(q) ||
      e.action.toLowerCase().includes(q) ||
      e.performedBy.name.toLowerCase().includes(q)
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
          <div className="text-xs text-gray-300 font-mono">{e.entityRef}</div>
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
          <div className="text-xs text-gray-300">{e.performedBy.name}</div>
          <div className="text-2xs text-gray-600">{e.performedBy.role.replace(/_/g, ' ')}</div>
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
                <span className="text-red-400 line-through">{String(c.oldValue ?? '—')}</span>
                {' → '}
                <span className="text-emerald-400">{String(c.newValue ?? '—')}</span>
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
      render: e => <span className="text-2xs font-mono text-gray-600">{e.ipAddress}</span>,
    },
  ];

  return (
    <PageShell
      title={t.audit.title}
      subtitle={`${filtered.length} entries — immutable tamper-evident log`}
    >
      <div className="px-1 pb-2">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.audit.searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 bg-surface-raised border border-surface-border rounded text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-brand/50"
          />
        </div>
      </div>
      <DataTable
        columns={AUDIT_COLUMNS}
        data={filtered}
        keyExtractor={e => e.id}
        emptyMessage="No audit entries found"
      />
    </PageShell>
  );
}
