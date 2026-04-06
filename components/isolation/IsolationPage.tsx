'use client';

import { useState, useEffect } from 'react';
import { Lock, Unlock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PageShell, SectionHeader } from '@/components/shared/PageShell';
import { KPICard } from '@/components/shared/KPICard';
import { DataTable, Column } from '@/components/shared/DataTable';
import { Button } from '@/components/shared/Button';
import { useAppStore } from '@/lib/store/useAppStore';
import { useT } from '@/lib/i18n/useT';
import { MOCK_ISOLATION_CERTS } from '@/lib/mock/isolation';
import { formatDateTime } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';
import type { IsolationCertificate, IsolationPoint, IsolationStatus } from '@/lib/types';

const STATUS_COLORS: Record<IsolationStatus, { color: string; text: string; border: string }> = {
  PENDING:   { color: 'bg-gray-800',        text: 'text-gray-400',    border: 'border-gray-700'    },
  ISOLATED:  { color: 'bg-yellow-900/60',   text: 'text-yellow-300',  border: 'border-yellow-700'  },
  VERIFIED:  { color: 'bg-emerald-900/60',  text: 'text-emerald-300', border: 'border-emerald-700' },
  RELEASED:  { color: 'bg-blue-900/60',     text: 'text-blue-300',    border: 'border-blue-700'    },
  CANCELLED: { color: 'bg-red-950/60',      text: 'text-red-400',     border: 'border-red-800'     },
};

function IsolationStatusBadge({ status }: { status: IsolationStatus }) {
  const { t } = useT();
  const cfg = STATUS_COLORS[status];
  return (
    <span className={cn('text-xs px-2 py-1 rounded border font-semibold', cfg.color, cfg.text, cfg.border)}>
      {t.isolationStatus[status]}
    </span>
  );
}

function IsolationPointRow({ point }: { point: IsolationPoint }) {
  const showToast = useAppStore(s => s.showToast);

  return (
    <div className={cn(
      'flex items-start gap-3 px-4 py-3 rounded border mb-2',
      point.status === 'VERIFIED' ? 'border-emerald-800/60 bg-emerald-950/20' :
      point.status === 'ISOLATED' ? 'border-yellow-800/60 bg-yellow-950/20' :
      'border-surface-border bg-surface-panel'
    )}>
      <div className={cn('mt-0.5 flex-shrink-0', point.status === 'VERIFIED' ? 'text-emerald-400' : point.status === 'ISOLATED' ? 'text-yellow-400' : 'text-gray-600')}>
        {point.status === 'VERIFIED' ? <CheckCircle2 className="w-4 h-4" /> :
         point.status === 'ISOLATED' ? <Lock className="w-4 h-4" /> :
         <AlertTriangle className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono font-bold text-brand">{point.tag}</span>
          <IsolationStatusBadge status={point.status} />
          <span className="text-2xs bg-surface-panel border border-surface-border px-1.5 py-0.5 rounded text-gray-500 font-mono">
            {point.isolationType}
          </span>
        </div>
        <div className="text-xs text-gray-300 mt-1">{point.description}</div>
        <div className="flex items-center gap-4 mt-1.5 text-2xs text-gray-600">
          <span>📍 {point.location}</span>
          <span>{point.normalPosition} → <strong className="text-gray-400">{point.isolatedPosition}</strong></span>
          {point.lockTag && <span className="font-mono">🔒 {point.lockTag}</span>}
        </div>
        {point.isolatedBy && (
          <div className="text-2xs text-gray-600 mt-1">
            Isolated by {point.isolatedBy.name} at {formatDateTime(point.isolatedAt!)}
            {point.verifiedBy && ` · Verified by ${point.verifiedBy.name}`}
          </div>
        )}
      </div>
    </div>
  );
}

export function IsolationPage() {
  const { t } = useT();
  const [certs, setCerts] = useState(MOCK_ISOLATION_CERTS);

  useEffect(() => {
    fetch('/api/isolation?active=true')
      .then(r => r.ok ? r.json() : null)
      .then(json => { if (json?.data?.length) setCerts(json.data); })
      .catch(() => { /* keep mock */ });
  }, []);

  const activeCount   = certs.filter(c => ['ISOLATED', 'VERIFIED'].includes(c.status)).length;
  const pendingCount  = certs.filter(c => c.status === 'PENDING').length;
  const verifiedCount = certs.filter(c => c.status === 'VERIFIED').length;
  const releasedCount = certs.filter(c => c.status === 'RELEASED').length;

  const activeCerts = certs.filter(c => ['ISOLATED', 'VERIFIED', 'PENDING'].includes(c.status));

  const CERT_COLUMNS: Column<IsolationCertificate>[] = [
    {
      key: 'cert',
      header: t.isolation.certificate,
      width: '150px',
      render: c => <span className="font-mono text-xs font-bold text-brand">{c.certificateNumber}</span>,
    },
    {
      key: 'permit',
      header: t.isolation.permit,
      width: '130px',
      render: c => <span className="font-mono text-xs text-gray-400">{c.permitNumber}</span>,
    },
    {
      key: 'title',
      header: 'Description',
      render: c => <span className="text-xs text-gray-300">{c.title}</span>,
    },
    {
      key: 'status',
      header: t.common.status,
      width: '110px',
      render: c => <IsolationStatusBadge status={c.status} />,
    },
    {
      key: 'points',
      header: t.isolation.points,
      width: '60px',
      align: 'center',
      render: c => <span className="text-xs text-gray-400">{c.isolationPoints.length}</span>,
    },
    {
      key: 'issuedBy',
      header: t.isolation.issuedBy,
      width: '130px',
      render: c => <span className="text-xs text-gray-400">{c.issuedBy.name}</span>,
    },
    {
      key: 'issuedAt',
      header: t.isolation.issued,
      width: '140px',
      render: c => <span className="text-xs font-mono text-gray-500">{formatDateTime(c.issuedAt)}</span>,
    },
  ];

  return (
    <PageShell title={t.isolation.title} subtitle={t.isolation.subtitle}>
      <div className="space-y-6">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard label={t.isolation.activeIsolations} value={activeCount}   icon={Lock}          variant={activeCount > 0 ? 'warning' : 'default'} />
          <KPICard label={t.isolation.verified}         value={verifiedCount} icon={CheckCircle2}  variant="success" />
          <KPICard label={t.isolation.pending}          value={pendingCount}  icon={AlertTriangle} variant={pendingCount > 0 ? 'warning' : 'default'} />
          <KPICard label={t.isolation.releasedToday}    value={releasedCount} icon={Unlock}        variant="default" />
        </div>

        <SectionHeader title={t.isolation.activeCerts} />
        {activeCerts.map(cert => (
          <div key={cert.id} className="mb-6 rounded-md border border-surface-border bg-surface-card overflow-hidden">
            <div className="flex items-center justify-between gap-4 px-4 py-3 bg-surface-panel border-b border-surface-border">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-brand">{cert.certificateNumber}</span>
                <span className="text-2xs text-gray-500 font-mono">{cert.permitNumber}</span>
                <IsolationStatusBadge status={cert.status} />
              </div>
              <div className="flex items-center gap-2">
                {cert.status === 'ISOLATED' && (
                  <Button variant="warning" size="xs" icon={CheckCircle2}>
                    {t.isolation.verifyIsolation}
                  </Button>
                )}
                {cert.status === 'VERIFIED' && (
                  <Button variant="danger" size="xs" icon={Unlock}>
                    {t.isolation.requestRelease}
                  </Button>
                )}
              </div>
            </div>

            <div className="p-4">
              <div className="text-xs text-gray-300 font-medium mb-3">{cert.title}</div>

              {cert.energySources.length > 0 && (
                <div className="mb-4">
                  <div className="text-2xs text-gray-600 uppercase tracking-wider font-bold mb-2">{t.isolation.energySources}</div>
                  <div className="flex flex-wrap gap-2">
                    {cert.energySources.map(es => (
                      <span
                        key={es.id}
                        className={cn(
                          'text-2xs px-2 py-1 rounded border font-mono',
                          es.isolated ? 'bg-emerald-900/30 border-emerald-800 text-emerald-400' : 'bg-red-900/30 border-red-800 text-red-400'
                        )}
                      >
                        {es.type.replace('_', ' ')} {es.voltage ? `${es.voltage}V` : es.pressure ? `${es.pressure}bar` : ''}
                        {es.isolated ? ' ✓' : ' ✗'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {cert.isolationPoints.length > 0 ? (
                <div>
                  <div className="text-2xs text-gray-600 uppercase tracking-wider font-bold mb-2">{t.isolation.isolationPoints} ({cert.isolationPoints.length})</div>
                  {cert.isolationPoints.map(point => (
                    <IsolationPointRow key={point.id} point={point} />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-600 italic">{t.isolation.noPoints}</p>
              )}

              {cert.notes && (
                <div className="mt-3 p-3 rounded border border-surface-border bg-surface-panel text-xs text-gray-400">{cert.notes}</div>
              )}
            </div>
          </div>
        ))}

        <div>
          <SectionHeader title={t.isolation.allCertificates} />
          <DataTable
            columns={CERT_COLUMNS}
            data={certs}
            keyExtractor={c => c.id}
            emptyMessage={t.isolation.noCerts}
          />
        </div>

      </div>
    </PageShell>
  );
}
