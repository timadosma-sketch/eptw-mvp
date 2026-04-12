'use client';

import { useState, useEffect } from 'react';
import {
  FileText, CheckSquare, Wind, Clock, Users,
  AlertTriangle, Lock, GitMerge, ShieldCheck,
  Activity, TrendingUp, Plus, Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { KPICard } from '@/components/shared/KPICard';
import { AlertPanel } from '@/components/shared/AlertStrip';
import { DataTable, Column } from '@/components/shared/DataTable';
import { PermitStatusBadge, RiskBadge, GasStatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/shared/Button';
import { SectionHeader } from '@/components/shared/PageShell';
import { ZoneBoardPanel } from './ZoneBoardPanel';
import { useAppStore } from '@/lib/store/useAppStore';
import { useT } from '@/lib/i18n/useT';
import { rbac } from '@/lib/rbac';
import { MOCK_DASHBOARD_METRICS } from '@/lib/mock/dashboard';
import { MOCK_PERMITS } from '@/lib/mock/permits';
import { MOCK_GAS_RECORDS } from '@/lib/mock/gas';
import { MOCK_SIMOPS_CONFLICTS } from '@/lib/mock/simops';
import { PERMIT_TYPE_CONFIG } from '@/lib/constants';
import { formatDateTime, getTimeRemaining, truncate } from '@/lib/utils/formatters';
import { formatRelative } from '@/lib/utils/formatters';
import type { Permit, GasTestRecord, DashboardMetrics, AuditEntry, SIMOPSConflict } from '@/lib/types';
import type { DayTrend } from '@/lib/dal/dashboard.dal';

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
  const dataVersion      = useAppStore(s => s.dataVersion);
  const { t } = useT();

  // Start with mock data so the UI renders immediately, then replace with DB data
  const [m, setM] = useState<DashboardMetrics>(MOCK_DASHBOARD_METRICS);
  const [allPermits, setAllPermits] = useState<Permit[]>(MOCK_PERMITS);
  const [gasRecords, setGasRecords] = useState<GasTestRecord[]>(MOCK_GAS_RECORDS);
  const [recentActivity, setRecentActivity] = useState<AuditEntry[]>([]);
  const [trend, setTrend] = useState<DayTrend[]>([]);
  const [conflicts, setConflicts] = useState<SIMOPSConflict[]>(MOCK_SIMOPS_CONFLICTS);
  const alerts = useAppStore(s => s.alerts); // synced from DB by AlertSyncer

  useEffect(() => {
    const load = () => {
      fetch('/api/dashboard')
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (d?.metrics) setM(d.metrics);
          if (d?.trend)   setTrend(d.trend);
        })
        .catch(() => {});
      fetch('/api/permits?pageSize=50')
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d?.data) setAllPermits(d.data); })
        .catch(() => {});
      fetch('/api/gas-tests')
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d?.data) setGasRecords(d.data); })
        .catch(() => {});
      fetch('/api/audit?pageSize=10')
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d?.data) setRecentActivity(d.data); })
        .catch(() => {});
      fetch('/api/simops?active=true')
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d?.data) setConflicts(d.data); })
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [dataVersion]);

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

        {/* 7-day permit trend */}
        {trend.length > 0 && (
          <div>
            <SectionHeader title="7-DAY PERMIT TREND" subtitle="Permits created, closed, and active each day" />
            <div className="p-4 rounded-md border border-surface-border bg-surface-card">
              <div className="flex items-end gap-1 h-20">
                {trend.map((day, i) => {
                  const maxVal = Math.max(...trend.map(d => d.active), 1);
                  const activeH = Math.round((day.active / maxVal) * 72);
                  const createdH = Math.round((day.created / Math.max(...trend.map(d => d.created), 1)) * 40);
                  const closedH  = Math.round((day.closed  / Math.max(...trend.map(d => d.closed), 1)) * 40);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5" title={`${day.date}: ${day.active} active, ${day.created} created, ${day.closed} closed`}>
                      <div className="w-full flex items-end justify-center gap-0.5">
                        <div className="w-1/3 bg-brand/60 rounded-t" style={{ height: `${createdH}px`, minHeight: day.created > 0 ? '3px' : '0' }} />
                        <div className="w-1/3 bg-emerald-500/60 rounded-t" style={{ height: `${activeH}px`, minHeight: day.active > 0 ? '3px' : '0' }} />
                        <div className="w-1/3 bg-gray-500/60 rounded-t" style={{ height: `${closedH}px`, minHeight: day.closed > 0 ? '3px' : '0' }} />
                      </div>
                      <span className="text-2xs text-gray-600 font-mono truncate w-full text-center">{day.date.split(' ')[0]}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-3 text-2xs text-gray-500">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-brand/60 inline-block" /> Created</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/60 inline-block" /> Active</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-gray-500/60 inline-block" /> Closed</span>
              </div>
            </div>
          </div>
        )}

        {/* Zone Status Board */}
        <div>
          <SectionHeader title="PLANT ZONE STATUS" subtitle="Live zone overview — active permits, SIMOPS conflicts, gas alerts" />
          <ZoneBoardPanel permits={allPermits} conflicts={conflicts} alerts={alerts} />
        </div>

        {/* Expiring soon alert strip */}
        {(() => {
          const expiring = allPermits.filter(p => {
            if (p.status !== 'ACTIVE') return false;
            const ms = new Date(p.validTo).getTime() - Date.now();
            return ms > 0 && ms < 24 * 3_600_000;
          }).sort((a, b) => new Date(a.validTo).getTime() - new Date(b.validTo).getTime());

          if (expiring.length === 0) return null;
          return (
            <div>
              <SectionHeader
                title="⏰ EXPIRING WITHIN 24 HOURS"
                subtitle={`${expiring.length} permit${expiring.length > 1 ? 's' : ''} require attention`}
              />
              <div className="space-y-1.5">
                {expiring.map(p => {
                  const ms      = new Date(p.validTo).getTime() - Date.now();
                  const hLeft   = Math.floor(ms / 3_600_000);
                  const mLeft   = Math.floor((ms % 3_600_000) / 60_000);
                  const urgent  = ms < 2 * 3_600_000;
                  return (
                    <div
                      key={p.id}
                      onClick={() => openPermitDetail(p.id)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2.5 rounded border cursor-pointer transition-colors',
                        urgent
                          ? 'border-red-700/60 bg-red-950/20 hover:border-red-600'
                          : 'border-yellow-700/50 bg-yellow-950/10 hover:border-yellow-600'
                      )}
                    >
                      <Clock className={cn('w-4 h-4 flex-shrink-0', urgent ? 'text-red-400 animate-pulse' : 'text-yellow-400')} />
                      <span className="font-mono text-xs font-bold text-brand">{p.permitNumber}</span>
                      <span className="text-xs text-gray-300 flex-1 truncate">{p.title}</span>
                      <span className="text-2xs text-gray-500">{p.location}</span>
                      <span className={cn('text-xs font-mono font-bold ml-auto', urgent ? 'text-red-400' : 'text-yellow-400')}>
                        {hLeft}h {mLeft}m
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

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

        {/* Recent activity feed */}
        {recentActivity.length > 0 && (
          <div>
            <SectionHeader title="RECENT ACTIVITY" subtitle="Last 10 system events" />
            <div className="space-y-1.5">
              {recentActivity.map(e => (
                <div key={e.id} className="flex items-center gap-3 px-3 py-2 rounded border border-surface-border/50 bg-surface-raised text-xs">
                  <span className="w-2 h-2 rounded-full bg-brand flex-shrink-0" />
                  <span className="font-mono text-gray-600 w-32 flex-shrink-0 text-2xs">{formatRelative(e.performedAt)}</span>
                  <span className="font-semibold text-gray-300">{e.action.replace(/_/g, ' ')}</span>
                  <span className="text-gray-600">·</span>
                  <span className="font-mono text-brand text-2xs">{e.entityRef ?? '—'}</span>
                  <span className="ml-auto text-gray-600 text-2xs">{e.performedBy?.name ?? '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
