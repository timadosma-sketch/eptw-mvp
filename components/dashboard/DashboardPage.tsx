'use client';

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
import { MOCK_DASHBOARD_METRICS } from '@/lib/mock/dashboard';
import { MOCK_PERMITS } from '@/lib/mock/permits';
import { MOCK_GAS_RECORDS } from '@/lib/mock/gas';
import { PERMIT_TYPE_CONFIG } from '@/lib/constants';
import { formatDateTime, getTimeRemaining, truncate } from '@/lib/utils/formatters';
import type { Permit, GasTestRecord } from '@/lib/types';

const m = MOCK_DASHBOARD_METRICS;

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
  const { t } = useT();

  const activePermits = MOCK_PERMITS.filter(p => ['ACTIVE', 'APPROVED', 'UNDER_REVIEW'].includes(p.status));
  const recentGas     = MOCK_GAS_RECORDS.slice(0, 5);

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
        <Button variant="primary" size="sm" icon={Plus} onClick={openWizard}>
          {t.common.newPermit}
        </Button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

        <AlertPanel />

        {/* KPI row 1 */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-4">
          <KPICard
            label={t.dashboard.activePermits}
            value={m.activePermits}
            subValue={t.dashboard.currentlyInProgress}
            icon={FileText}
            variant="default"
            pulse
          />
          <KPICard
            label={t.dashboard.pendingApprovals}
            value={m.pendingApprovals}
            subValue={`${m.overdueApprovals} ${t.common.overdue}`}
            icon={CheckSquare}
            variant={m.overdueApprovals > 0 ? 'danger' : 'info'}
          />
          <KPICard
            label={t.dashboard.gasAlerts}
            value={m.gasAlerts}
            subValue={t.dashboard.activeExceedances}
            icon={Wind}
            variant={m.gasAlerts > 0 ? 'danger' : 'success'}
            pulse={m.gasAlerts > 0}
          />
          <KPICard
            label={t.dashboard.expiringToday}
            value={m.expiringToday}
            subValue={`${m.expiringTomorrow} ${t.dashboard.tomorrow}`}
            icon={Clock}
            variant={m.expiringToday > 0 ? 'warning' : 'default'}
          />
        </div>

        {/* KPI row 2 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            label={t.dashboard.suspended}
            value={m.suspendedPermits}
            icon={AlertTriangle}
            variant={m.suspendedPermits > 0 ? 'warning' : 'default'}
          />
          <KPICard
            label={t.dashboard.openIsolations}
            value={m.openIsolations}
            icon={Lock}
            variant="default"
          />
          <KPICard
            label={t.dashboard.simopsConflicts}
            value={m.simoConflicts}
            icon={GitMerge}
            variant={m.simoConflicts > 0 ? 'warning' : 'default'}
          />
          <KPICard
            label={t.dashboard.workersOnSite}
            value={m.totalWorkersOnSite}
            subValue={t.dashboard.allZones}
            icon={Users}
            variant="default"
          />
        </div>

        {/* Safety score strip */}
        <div className="flex items-center gap-6 px-5 py-4 rounded-md border border-surface-border bg-surface-card">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-400 flex-shrink-0" />
            <div>
              <div className="text-2xs text-gray-500 uppercase tracking-wider font-semibold">{t.dashboard.safetyScore}</div>
              <div className="text-2xl font-bold text-emerald-400 font-mono">{m.safetyScore}/100</div>
            </div>
          </div>
          <div className="flex-1 h-2 bg-surface-panel rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${m.safetyScore}%` }}
            />
          </div>
          <div className="flex items-center gap-3 text-right">
            <Activity className="w-4 h-4 text-brand flex-shrink-0" />
            <div>
              <div className="text-2xs text-gray-500 uppercase tracking-wider font-semibold">{t.dashboard.daysWithoutIncident}</div>
              <div className="text-2xl font-bold text-brand font-mono">{m.daysWithoutIncident}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-right">
            <TrendingUp className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <div>
              <div className="text-2xs text-gray-500 uppercase tracking-wider font-semibold">{t.dashboard.mttr}</div>
              <div className="text-2xl font-bold text-blue-400 font-mono">{m.mttrMinutes}m</div>
            </div>
          </div>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div>
            <SectionHeader
              title={t.dashboard.activeAndInProgress}
              actions={
                <Button variant="ghost" size="xs" onClick={() => {}}>{t.common.viewAll}</Button>
              }
            />
            <DataTable
              columns={permitColumns}
              data={activePermits}
              keyExtractor={p => p.id}
              onRowClick={p => openPermitDetail(p.id)}
              emptyMessage={t.dashboard.noActivePermits}
            />
          </div>

          <div>
            <SectionHeader
              title={t.dashboard.recentGasTests}
              actions={
                <Button variant="ghost" size="xs">{t.common.viewAll}</Button>
              }
            />
            <DataTable
              columns={GAS_COLUMNS}
              data={recentGas}
              keyExtractor={r => r.id}
              emptyMessage={t.dashboard.noGasTests}
            />
          </div>
        </div>

        {/* Permit by type */}
        <div>
          <SectionHeader title={t.dashboard.permitsByType} />
          <div className="flex flex-wrap gap-3">
            {(Object.entries(m.permitsByType) as [string, number][])
              .filter(([, count]) => count > 0)
              .map(([type, count]) => {
                const cfg = PERMIT_TYPE_CONFIG[type as keyof typeof PERMIT_TYPE_CONFIG];
                return (
                  <div
                    key={type}
                    className="flex items-center gap-2 px-3 py-2 rounded border border-surface-border bg-surface-card text-xs"
                  >
                    <span className="font-mono font-bold text-gray-400">{cfg.shortLabel}</span>
                    <span className="text-gray-600">·</span>
                    <span className="font-bold text-white">{count}</span>
                  </div>
                );
              })}
          </div>
        </div>

      </div>
    </div>
  );
}
