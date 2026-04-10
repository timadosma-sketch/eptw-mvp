'use client';

import { useState, useEffect } from 'react';
import {
  FileText, CheckSquare, Wind, Clock, Users,
  AlertTriangle, Lock, GitMerge, ShieldCheck,
  Activity, TrendingUp, Plus, Eye,
} from 'lucide-react';
import { KPICard } from '@/components/shared/KPICard';
import { AlertPanel } from '@/components/shared/AlertStrip';
import { DataTable, Column } from '@/components/shared/DataTable';
import { PermitStatusBadge, RiskBadge, GasStatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/shared/Button';
import { SectionHeader } from '@/components/shared/PageShell';
import { useAppStore } from '@/lib/store/useAppStore';
import { useT } from '@/lib/i18n/useT';
import { rbac } from '@/lib/rbac';
import { MOCK_DASHBOARD_METRICS } from '@/lib/mock/dashboard';
import { MOCK_PERMITS } from '@/lib/mock/permits';
import { MOCK_GAS_RECORDS } from '@/lib/mock/gas';
import { PERMIT_TYPE_CONFIG } from '@/lib/constants';
import { formatDateTime, getTimeRemaining, truncate } from '@/lib/utils/formatters';
import type { Permit, GasTestRecord, DashboardMetrics } from '@/lib/types';

function usePermitColumns(onView: (id: string) => void, t: ReturnType<typeof useT>['t']): Column<Permit>[] {
  return [
    {
      key: 'number',
      header: t.permits.permitNo,
      width: '130px',
      render: p => (
        <span className="font-mono text-xs text-brand">{p.permitNumber}</span>
      ),
    },
    {
      key: 'type',
      header: t.common.type,
      width: '60px',
      render: p => (
        <span className="text-xs text-gray-400">{PERMIT_TYPE_CONFIG[p.type].shortLabel}</span>
      ),
    },
    {
      key: 'title',
      header: t.permits.workDesc,
      render: p => (
        <span className="text-xs text-gray-300">{truncate(p.title, 52)}</span>
      ),
    },
    {
      key: 'status',
      header: t.common.status,
      width: '120px',
      render: p => <PermitStatusBadge status={p.status} size="sm" />,
    },
    {
      key: 'risk',
      header: 'Risk',
      width: '80px',
      render: p => <RiskBadge level={p.riskLevel} size="sm" />,
    },
    {
      key: 'expires',
      header: 'Expires',
      width: '120px',
      render: p => (
        <span className="text-xs font-mono text-gray-400">{getTimeRemaining(p.validTo)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '50px',
      align: 'right',
      render: p => (
        <button
          onClick={e => { e.stopPropagation(); onView(p.id); }}
          className="text-gray-600 hover:text-brand transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];
}

export function DashboardPage() {
  const openWizard       = useAppStore(s => s.openWizard);
  const openPermitDetail = useAppStore(s => s.openPermitDetail);
  const currentUser      = useAppStore(s => s.currentUser);
  const { t } = useT();

  // Start with mock data so the UI renders immediately, then replace with DB data
  const [m, setM] = useState<DashboardMetrics>(MOCK_DASHBOARD_METRICS);
  const [allPermits, setAllPermits] = useState<Permit[]>(MOCK_PERMITS);
  const [gasRecords, setGasRecords] = useState<GasTestRecord[]>(MOCK_GAS_RECORDS);

  useEffect(() => {
    const load = () => {
      fetch('/api/dashboard')
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d?.metrics) setM(d.metrics); })
        .catch(() => {});
      fetch('/api/permits?pageSize=50')
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d?.data) setAllPermits(d.data); })
        .catch(() => {});
      fetch('/api/gas-tests')
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d?.data) setGasRecords(d.data); })
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, []);

  const activePermits = allPermits.filter(p => ['ACTIVE', 'APPROVED', 'UNDER_REVIEW'].includes(p.status));
  const recentGas     = gasRecords.slice(0, 5);

  const GAS_COLUMNS: Column<GasTestRecord>[] = [
    {
      key: 'permit',
      header: t.gas.permit,
      width: '130px',
      render: r => <span className="font-mono text-xs text-brand">{r.permitNumber}</span>,
    },
    {
      key: 'location',
      header: t.common.location,
      render: r => <span className="text-xs text-gray-300">{truncate(r.location, 40)}</span>,
    },
    {
      key: 'status',
      header: t.gas.result,
      width: '90px',
      render: r => <GasStatusBadge status={r.overallStatus} size="sm" />,
    },
    {
      key: 'time',
      header: t.gas.tested,
      width: '130px',
      render: r => <span className="text-xs font-mono text-gray-500">{formatDateTime(r.testedAt)}</span>,
    },
  ];

  const permitColumns = usePermitColumns(openPermitDetail, t);

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border bg-surface-raised">
        <div>
          <h1 className="text-lg font-bold text-white">{t.dashboard.title}</h1>
          <p className="text-xs text-gray-500 mt-0.5">{t.dashboard.subtitle}</p>
        </div>
        {rbac.canCreatePermit(currentUser?.role) && (
          <Button variant="primary" size="sm" icon={Plus} onClick={openWizard}>
            {t.common.newPermit}
          </Button>
        )}
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

        <AlertPanel />

        {/* KPI Row 1 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KPICard label={t.dashboard.activePermits}    value={m.activePermits}    icon={FileText}    />
          <KPICard label={t.dashboard.pendingApprovals} value={m.pendingApprovals} icon={CheckSquare} variant="warning"  subValue={m.overdueApprovals > 0 ? `${m.overdueApprovals} overdue` : '0 overdue'} />
          <KPICard label={t.dashboard.gasAlerts}        value={m.gasAlerts}        icon={Wind}        variant="danger"   subValue="active exceedances" />
          <KPICard label={t.dashboard.expiringToday}    value={m.expiringToday}    icon={Clock}       variant="warning"  subValue={`${m.expiringTomorrow} tomorrow`} />
        </div>

        {/* KPI Row 2 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KPICard label={t.dashboard.suspended}         value={m.suspendedPermits}   icon={AlertTriangle} variant="warning" />
          <KPICard label={t.dashboard.openIsolations}    value={m.openIsolations}     icon={Lock}          variant="warning" />
          <KPICard label={t.dashboard.simopsConflicts}   value={m.simoConflicts}      icon={GitMerge}      variant="danger"  />
          <KPICard label={t.dashboard.workersOnSite}     value={m.totalWorkersOnSite} icon={Users}         variant="info"    subValue="all zones" />
        </div>

        {/* Safety strip */}
        <div className="grid grid-cols-3 gap-3">
          <KPICard label={t.hse.safetyScoreLabel}           value={`${m.safetyScore}/100`} icon={ShieldCheck} variant="success" />
          <KPICard label={t.dashboard.daysWithoutIncident}  value={m.daysWithoutIncident}  icon={Activity}    variant="success" />
          <KPICard label={t.dashboard.mttr}                 value={`${m.mttrMinutes}m`}    icon={TrendingUp}  variant="info"    />
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div>
            <SectionHeader title={t.dashboard.activeAndInProgress} />
            <DataTable
              columns={permitColumns}
              data={activePermits}
              keyExtractor={r => r.id}
              onRowClick={r => openPermitDetail(r.id)}
              emptyMessage="No active permits"
            />
          </div>
          <div>
            <SectionHeader title={t.dashboard.recentGasTests} />
            <DataTable
              columns={GAS_COLUMNS}
              data={recentGas}
              keyExtractor={r => r.id}
              emptyMessage="No gas tests recorded"
            />
          </div>
        </div>

        {/* Permit type breakdown */}
        <div>
          <SectionHeader title="ACTIVE PERMITS BY TYPE" />
          <div className="flex flex-wrap gap-2">
            {Object.entries(m.permitsByType)
              .filter(([, count]) => count > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => (
                <div key={type} className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-raised border border-surface-border rounded text-xs">
                  <span className="text-gray-300">{PERMIT_TYPE_CONFIG[type as Permit['type']]?.shortLabel ?? type}</span>
                  <span className="text-gray-600">·</span>
                  <span className="text-brand font-semibold">{count}</span>
                </div>
              ))}
          </div>
        </div>

      </div>
    </div>
  );
}
