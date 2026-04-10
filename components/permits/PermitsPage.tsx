'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, RefreshCw } from 'lucide-react';
import { PageShell } from '@/components/shared/PageShell';
import { DataTable, Column } from '@/components/shared/DataTable';
import { PermitStatusBadge, RiskBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/shared/Button';
import { PermitDetailDrawer } from './PermitDetailDrawer';
import { useAppStore } from '@/lib/store/useAppStore';
import { useT } from '@/lib/i18n/useT';
import { MOCK_PERMITS } from '@/lib/mock/permits';
import { PERMIT_TYPE_CONFIG, PERMIT_STATUS_CONFIG } from '@/lib/constants';
import { formatDateTime, getTimeRemaining, truncate } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';
import type { Permit, PermitStatus, PermitType } from '@/lib/types';

const STATUS_FILTERS: PermitStatus[] = [
  'ACTIVE', 'APPROVED', 'UNDER_REVIEW', 'SUBMITTED', 'SUSPENDED', 'DRAFT', 'CLOSED',
];

export function PermitsPage() {
  const openWizard       = useAppStore(s => s.openWizard);
  const openPermitDetail = useAppStore(s => s.openPermitDetail);
  const { t } = useT();

  const [search,   setSearch]   = useState('');
  const [statusF,  setStatusF]  = useState<PermitStatus | ''>('');
  const [typeF,    setTypeF]    = useState<PermitType | ''>('');
  const [permits,  setPermits]  = useState<Permit[]>(MOCK_PERMITS);

  useEffect(() => {
    const load = () => {
      fetch('/api/permits?pageSize=100')
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d?.data?.length) setPermits(d.data); })
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    return permits.filter(p => {
      if (statusF && p.status !== statusF) return false;
      if (typeF   && p.type   !== typeF)   return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          p.permitNumber.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, statusF, typeF, permits]);

  const columns: Column<Permit>[] = [
    {
      key: 'number',
      header: t.permits.permitNo,
      width: '140px',
      render: p => (
        <span className="font-mono text-xs font-bold text-brand">{p.permitNumber}</span>
      ),
    },
    {
      key: 'type',
      header: t.common.type,
      width: '80px',
      render: p => {
        const cfg = PERMIT_TYPE_CONFIG[p.type];
        return <span className="text-xs text-gray-300">{cfg.shortLabel}</span>;
      },
    },
    {
      key: 'title',
      header: t.permits.workDesc,
      render: p => (
        <div>
          <div className="text-xs text-gray-200 font-medium">{truncate(p.title, 60)}</div>
          <div className="text-2xs text-gray-500 mt-0.5">{p.location}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: t.common.status,
      width: '130px',
      render: p => <PermitStatusBadge status={p.status} size="sm" />,
    },
    {
      key: 'risk',
      header: 'Risk',
      width: '80px',
      render: p => <RiskBadge level={p.riskLevel} size="sm" />,
    },
    {
      key: 'authority',
      header: t.permits.issuingAuth,
      width: '140px',
      render: p => (
        <span className="text-xs text-gray-400">
          {p.issuingAuthority?.name ?? '—'}
        </span>
      ),
    },
    {
      key: 'validity',
      header: t.permits.validity,
      width: '140px',
      render: p => (
        <div>
          <div className="text-xs font-mono text-gray-400">{formatDateTime(p.validFrom).split(' ').slice(0, 2).join(' ')}</div>
          {p.status === 'ACTIVE' && (
            <div className="text-2xs text-yellow-400 mt-0.5">{getTimeRemaining(p.validTo)}</div>
          )}
        </div>
      ),
    },
    {
      key: 'flags',
      header: t.permits.flags,
      width: '80px',
      render: p => (
        <div className="flex items-center gap-1">
          {p.gasTestRequired     && <span title={t.permits.gasRequired}  className="text-2xs px-1 py-0.5 rounded bg-blue-900/60 text-blue-400 font-mono border border-blue-800">GAS</span>}
          {p.isolationRequired   && <span title={t.permits.isoRequired}  className="text-2xs px-1 py-0.5 rounded bg-orange-900/60 text-orange-400 font-mono border border-orange-800">ISO</span>}
          {p.confinedSpaceEntry  && <span title={t.permits.cseRequired}  className="text-2xs px-1 py-0.5 rounded bg-purple-900/60 text-purple-400 font-mono border border-purple-800">CSE</span>}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageShell
        title={t.permits.title}
        subtitle={`${filtered.length} ${filtered.length !== 1 ? t.permits.subtitlePlural : t.permits.subtitle} — ${t.permits.allTime}`}
        actions={
          <Button variant="primary" size="sm" icon={Plus} onClick={openWizard}>
            {t.common.newPermit}
          </Button>
        }
      >
        {/* Filters */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t.permits.searchPlaceholder}
              className="pl-9 pr-4 py-2 text-xs bg-surface-panel border border-surface-border rounded text-gray-300 placeholder-gray-600 focus:outline-none focus:border-brand/60 w-72"
            />
          </div>

          <select
            value={statusF}
            onChange={e => setStatusF(e.target.value as PermitStatus | '')}
            className="text-xs bg-surface-panel border border-surface-border rounded px-3 py-2 text-gray-300 focus:outline-none focus:border-brand/60"
          >
            <option value="">{t.status.allStatuses}</option>
            {STATUS_FILTERS.map(s => (
              <option key={s} value={s}>{t.status[s]}</option>
            ))}
          </select>

          <select
            value={typeF}
            onChange={e => setTypeF(e.target.value as PermitType | '')}
            className="text-xs bg-surface-panel border border-surface-border rounded px-3 py-2 text-gray-300 focus:outline-none focus:border-brand/60"
          >
            <option value="">{t.status.allTypes}</option>
            {(Object.entries(PERMIT_TYPE_CONFIG) as [PermitType, typeof PERMIT_TYPE_CONFIG[PermitType]][]).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          {(search || statusF || typeF) && (
            <Button
              variant="ghost"
              size="sm"
              icon={RefreshCw}
              onClick={() => { setSearch(''); setStatusF(''); setTypeF(''); }}
            >
              {t.common.clear}
            </Button>
          )}

          <div className="ml-auto flex items-center gap-2 flex-wrap">
            {(['ACTIVE','SUBMITTED','SUSPENDED','CLOSED'] as PermitStatus[]).map(s => {
              const cfg = PERMIT_STATUS_CONFIG[s];
              const count = permits.filter(p => p.status === s).length;
              return (
                <button
                  key={s}
                  onClick={() => setStatusF(statusF === s ? '' : s)}
                  className={cn(
                    'flex items-center gap-1.5 text-2xs px-2 py-1 rounded border transition-all',
                    statusF === s
                      ? `${cfg.color} ${cfg.textColor} ${cfg.borderColor}`
                      : 'border-surface-border text-gray-600 hover:text-gray-400'
                  )}
                >
                  <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dotColor)} />
                  {t.status[s]} ({count})
                </button>
              );
            })}
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          keyExtractor={p => p.id}
          onRowClick={p => openPermitDetail(p.id)}
          emptyMessage={t.permits.noMatch}
          stickyHeader
        />
      </PageShell>

      <PermitDetailDrawer />
    </>
  );
}
