'use client';

import { useState, useEffect } from 'react';
import { BarChart2, Download, Loader2 } from 'lucide-react';
import { PageShell, SectionHeader } from '@/components/shared/PageShell';
import { KPICard } from '@/components/shared/KPICard';
import { Button } from '@/components/shared/Button';
import { useAppStore } from '@/lib/store/useAppStore';
import { useT } from '@/lib/i18n/useT';
import { MOCK_PERMITS } from '@/lib/mock/permits';
import { PERMIT_TYPE_CONFIG, PERMIT_STATUS_CONFIG } from '@/lib/constants';
import { downloadDailyReport, downloadWeeklySummary, downloadAuditTrail } from './ReportPDF';
import type { PermitType, PermitStatus, Permit, AuditEntry } from '@/lib/types';

function BarRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 w-32 flex-shrink-0 text-right">{label}</span>
      <div className="flex-1 h-5 bg-surface-panel rounded overflow-hidden border border-surface-border">
        <div className={`h-full rounded transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono text-gray-400 w-6 text-right">{value}</span>
    </div>
  );
}

export function ReportsPage() {
  const { t } = useT();
  const showToast   = useAppStore(s => s.showToast);
  const dataVersion = useAppStore(s => s.dataVersion);
  const [permits, setPermits] = useState<Permit[]>(MOCK_PERMITS);
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/permits?pageSize=200')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data?.length) setPermits(d.data); })
      .catch(() => {});
  }, [dataVersion]);

  const byType: Record<PermitType, number> = {} as Record<PermitType, number>;
  const byStatus: Record<PermitStatus, number> = {} as Record<PermitStatus, number>;

  permits.forEach(p => {
    byType[p.type]     = (byType[p.type] ?? 0) + 1;
    byStatus[p.status] = (byStatus[p.status] ?? 0) + 1;
  });

  const typeMax   = Math.max(...Object.values(byType));
  const statusMax = Math.max(...Object.values(byStatus));

  const TYPE_COLORS: Partial<Record<PermitType, string>> = {
    HOT_WORK: 'bg-red-600', COLD_WORK: 'bg-blue-600', CONFINED_SPACE: 'bg-orange-600',
    ELECTRICAL: 'bg-yellow-600', LINE_BREAKING: 'bg-purple-600', LIFTING: 'bg-teal-600',
    WORK_AT_HEIGHT: 'bg-cyan-600',
  };

  const handleExport = async (id: string) => {
    setExporting(id);
    try {
      if (id === 'daily') {
        await downloadDailyReport(permits);
        showToast('Daily Permit Report exported.', 'success');
      } else if (id === 'weekly') {
        await downloadWeeklySummary(permits);
        showToast('Weekly Safety Summary exported.', 'success');
      } else if (id === 'audit') {
        const res = await fetch('/api/audit?pageSize=500');
        const json = res.ok ? await res.json() : null;
        const entries: AuditEntry[] = json?.data ?? [];
        await downloadAuditTrail(entries);
        showToast('Audit Trail exported.', 'success');
      } else {
        showToast('This report type is coming soon.', 'info');
      }
    } catch {
      showToast('Export failed. Please try again.', 'error');
    } finally {
      setExporting(null);
    }
  };

  const REPORT_TEMPLATES = [
    { id: 'daily',     label: 'Daily Permit Report',         desc: 'All permits issued/closed today',       format: 'PDF', live: true  },
    { id: 'weekly',    label: 'Weekly Safety Summary',       desc: 'KPIs, gas tests, incidents — 7 days',   format: 'PDF', live: true  },
    { id: 'gas',       label: 'Gas Test Compliance Report',  desc: 'All test records with pass/fail trend',  format: 'XLSX', live: false },
    { id: 'isolation', label: 'Isolation Certificate Log',   desc: 'All isolation certs — current period',  format: 'PDF', live: false },
    { id: 'audit',     label: 'Audit Trail Export',          desc: 'Full tamper-evident log export',         format: 'PDF', live: true  },
    { id: 'hse',       label: 'HSE KPI Dashboard',           desc: 'Incident rates, safety scores',          format: 'PDF', live: false },
  ];

  return (
    <PageShell title={t.reports.title} subtitle={t.reports.subtitle}>
      <div className="space-y-6">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard label={t.reports.totalPermits}    value={permits.length} icon={BarChart2}  variant="default" />
          <KPICard label={t.reports.active}          value={byStatus['ACTIVE'] ?? 0}    icon={BarChart2} variant="success" />
          <KPICard label={t.reports.closedThisWeek}  value={byStatus['CLOSED'] ?? 0}    icon={BarChart2} variant="default" />
          <KPICard label={t.reports.suspended}       value={byStatus['SUSPENDED'] ?? 0} icon={BarChart2} variant={byStatus['SUSPENDED'] > 0 ? 'warning' : 'default'} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          <div>
            <SectionHeader title={t.reports.byType} />
            <div className="p-4 rounded-md border border-surface-border bg-surface-card space-y-2">
              {(Object.entries(byType) as [PermitType, number][])
                .filter(([, v]) => v > 0)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => (
                  <BarRow
                    key={type}
                    label={PERMIT_TYPE_CONFIG[type].shortLabel + ' — ' + PERMIT_TYPE_CONFIG[type].label.substring(0, 12)}
                    value={count}
                    max={typeMax}
                    color={TYPE_COLORS[type] ?? 'bg-gray-600'}
                  />
                ))}
            </div>
          </div>

          <div>
            <SectionHeader title={t.reports.byStatus} />
            <div className="p-4 rounded-md border border-surface-border bg-surface-card space-y-2">
              {(Object.entries(byStatus) as [PermitStatus, number][])
                .filter(([, v]) => v > 0)
                .sort((a, b) => b[1] - a[1])
                .map(([status, count]) => {
                  const cfg = PERMIT_STATUS_CONFIG[status];
                  return (
                    <BarRow
                      key={status}
                      label={t.status[status]}
                      value={count}
                      max={statusMax}
                      color={cfg.color}
                    />
                  );
                })}
            </div>
          </div>

        </div>

        <div>
          <SectionHeader title={t.reports.templates} subtitle={t.reports.templatesSubtitle} />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {REPORT_TEMPLATES.map(r => (
              <div key={r.id} className="flex items-start justify-between gap-3 p-4 rounded-md border border-surface-border bg-surface-card hover:bg-surface-hover transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-white">{r.label}</div>
                    {r.live && (
                      <span className="text-2xs px-1 py-0.5 rounded bg-emerald-900/50 text-emerald-400 border border-emerald-800 font-mono">LIVE</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{r.desc}</div>
                  <div className="text-2xs font-mono text-brand mt-1">{r.format}</div>
                </div>
                <Button
                  variant={r.live ? 'secondary' : 'ghost'}
                  size="xs"
                  icon={exporting === r.id ? Loader2 : Download}
                  loading={exporting === r.id}
                  onClick={() => handleExport(r.id)}
                >
                  {t.common.export}
                </Button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </PageShell>
  );
}
