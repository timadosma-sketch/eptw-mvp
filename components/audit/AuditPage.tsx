'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';
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

  const filtered = MOCK_AUDIT_LOG.filter(e => {
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
      width: '130px',
      render: e => (
        <div>
          <div className="text-xs font-mono text-brand">{e.entityRef}</div>
          <div className="text-2xs text-gray-600">{e.entity}</div>
        </div>
      ),
    },
    {
      key: 'user',
      header: t.audit.performedBy,
      width: '140px',
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
        if (!e.changes?.length) {
          return (
            <span className="text-2xs text-gray-600 italic">
              {Object.keys(e.metadata).length > 0
                ? Object.entries(e.metadata).map(([k, v]) => `${k}: ${String(v)}`).join(' · ')
                : '—'
              }
            </span>
          );
        }
        return (
          <div className="space-y-0.5">
            {e.changes.map((c, i) => (
              <div key={i} className="text-2xs font-mono">
                <span className="text-gray-500">{c.field}:</span>
                {' '}
                <span className="text-red-400 line-through">{String(c.oldValue ?? '∅')}</span>
                {' → '}
                <span className="text-emerald-400">{String(c.newValue)}</span>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      key: 'device',
      header: t.audit.source,
      width: '120px',
      render: e => <span className="text-2xs text-gray-600 font-mono">{e.ipAddress}</span>,
    },
  ];

  return (
    <PageShell
      title={t.audit.title}
      subtitle={`${filtered.length} ${t.audit.subtitleSuffix}`}
    >
      <div className="space-y-5">

        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.audit.searchPlaceholder}
            className="pl-9 pr-4 py-2 w-full text-xs bg-surface-panel border border-surface-border rounded text-gray-300 placeholder-gray-600 focus:outline-none focus:border-brand/60"
          />
        </div>

        <DataTable
          columns={AUDIT_COLUMNS}
          data={filtered}
          keyExtractor={e => e.id}
          emptyMessage={t.audit.noEntries}
          stickyHeader
        />

      </div>
    </PageShell>
  );
}
