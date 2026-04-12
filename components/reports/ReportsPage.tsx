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
import { formatDateTime } from '@/lib/utils/formatters';
import type { PermitType, PermitStatus, Permit, AuditEntry, GasTestRecord } from '@/lib/types';

// ─── CSV helpers ────────────────────────────────────────────────────────────

function escapeCsv(val: unknown): string {
  const str = String(val ?? '').replace(/"/g, '""');
  return /[,"\n\r]/.test(str) ? `"${str}"` : str;
}

function buildCsv(headers: string[], rows: unknown[][]): string {
  return [
    headers.map(escapeCsv).join(','),
    ...rows.map(r => r.map(escapeCsv).join(',')),
  ].join('\n');
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function downloadPermitCsv(permits: Permit[]) {
  const headers = ['Permit No.', 'Type', 'Status', 'Risk', 'Title', 'Location', 'Unit', 'Area', 'Requested By', 'Valid From', 'Valid To', 'Workers', 'JSA', 'Toolbox', 'Gas Test', 'Isolation'];
  const rows = permits.map(p => [
    p.permitNumber, p.type, p.status, p.riskLevel, p.title,
    p.location, p.unit, p.area, p.requestedBy.name,
    formatDateTime(p.validFrom), formatDateTime(p.validTo),
    p.workerCount, p.jsaCompleted ? 'Yes' : 'No',
    p.toolboxTalkCompleted ? 'Yes' : 'No',
    p.gasTestRequired ? 'Yes' : 'No', p.isolationRequired ? 'Yes' : 'No',
  ]);
  downloadCsv(`permits-${new Date().toISOString().slice(0, 10)}.csv`, buildCsv(headers, rows));
}

async function downloadGasCsv() {
  const res  = await fetch('/api/gas-tests?pageSize=500');
  const json = res.ok ? await res.json() : null;
  const records: GasTestRecord[] = json?.data ?? [];
  const headers = ['Test ID', 'Permit No.', 'Location', 'Status', 'Tester', 'Tested At', 'O2', 'LEL', 'H2S', 'CO', 'VOC'];
  const rows = records.map(r => {
    const byType = Object.fromEntries(r.readings.map(rd => [rd.gasType, `${rd.value}${rd.unit} (${rd.status})`]));
    return [
      r.id, r.permitNumber, r.location, r.overallStatus,
      r.testedBy.name, formatDateTime(r.testedAt),
      byType['O2'] ?? '—', byType['LEL'] ?? '—', byType['H2S'] ?? '—',
      byType['CO'] ?? '—', byType['VOC'] ?? '—',
    ];
  });
  downloadCsv(`gas-tests-${new Date().toISOString().slice(0, 10)}.csv`, buildCsv(headers, rows));
}

async function downloadHseCsv() {
  const res  = await fetch('/api/hse?pageSize=500');
  const json = res.ok ? await res.json() : null;
  const incidents: Array<{
    id: string; type: string; status: string; description: string;
    location: string; immediateActions: string; injuries: string;
    reportedBy: string; reportedAt: string; closedAt?: string;
  }> = json?.data ?? [];
  const headers = ['Incident ID', 'Type', 'Status', 'Description', 'Location', 'Immediate Actions', 'Injuries', 'Reported By', 'Reported At', 'Closed At'];
  const rows = incidents.map(i => [
    i.id, i.type.replace(/_/g, ' '), i.status.replace(/_/g, ' '),
    i.description, i.location, i.immediateActions ?? '—',
    i.injuries ?? 'NIL', i.reportedBy, formatDateTime(i.reportedAt),
    i.closedAt ? formatDateTime(i.closedAt) : '—',
  ]);
  downloadCsv(`hse-incidents-${new Date().toISOString().slice(0, 10)}.csv`, buildCsv(headers, rows));
}

async function downloadIsolationCsv() {
  const res  = await fetch('/api/isolation?pageSize=200');
  const json = res.ok ? await res.json() : null;
  const certs = json?.data ?? [];
  const headers = ['Certificate No.', 'Permit No.', 'Title', 'Status', 'Issued By', 'Issued At', 'Verified By', 'Released At', 'Points', 'Energy Sources'];
  const rows = certs.map((c: { certificateNumber: string; permitNumber: string; title: string; status: string; issuedBy: { name: string }; issuedAt: string; verifiedBy?: { name: string }; releasedAt?: string; isolationPoints: unknown[]; energySources: unknown[] }) => [
    c.certificateNumber, c.permitNumber, c.title, c.status,
    c.issuedBy?.name ?? '—', formatDateTime(c.issuedAt),
    c.verifiedBy?.name ?? '—', c.releasedAt ? formatDateTime(c.releasedAt) : '—',
    c.isolationPoints?.length ?? 0, c.energySources?.length ?? 0,
  ]);
  downloadCsv(`isolation-certs-${new Date().toISOString().slice(0, 10)}.csv`, buildCsv(headers, rows));
}

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
      } else if (id === 'permits-csv') {
        await downloadPermitCsv(permits);
        showToast('Permit register exported to CSV.', 'success');
      } else if (id === 'gas') {
        await downloadGasCsv();
        showToast('Gas test compliance report exported to CSV.', 'success');
      } else if (id === 'isolation') {
        await downloadIsolationCsv();
        showToast('Isolation certificate log exported to CSV.', 'success');
      } else if (id === 'hse-csv') {
        await downloadHseCsv();
        showToast('HSE incident register exported to CSV.', 'success');
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
    { id: 'daily',       label: 'Daily Permit Report',         desc: 'All permits issued/closed today',       format: 'PDF', live: true  },
    { id: 'weekly',      label: 'Weekly Safety Summary',       desc: 'KPIs, gas tests, incidents — 7 days',   format: 'PDF', live: true  },
    { id: 'gas',         label: 'Gas Test Compliance Report',  desc: 'All test records with pass/fail data',   format: 'CSV', live: true  },
    { id: 'isolation',   label: 'Isolation Certificate Log',   desc: 'All isolation certs — current period',  format: 'CSV', live: true  },
    { id: 'permits-csv', label: 'Permit Register Export',      desc: 'Full permit register in spreadsheet',   format: 'CSV', live: true  },
    { id: 'audit',       label: 'Audit Trail Export',          desc: 'Full tamper-evident log export',         format: 'PDF', live: true  },
    { id: 'hse-csv',     label: 'HSE Incident Register',        desc: 'All reported incidents in CSV',          format: 'CSV', live: true  },
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

        {/* Active Permit Gantt Timeline */}
        {permits.filter(p => ['ACTIVE', 'APPROVED', 'SUBMITTED', 'UNDER_REVIEW'].includes(p.status)).length > 0 && (
          <div>
            <SectionHeader title="ACTIVE PERMIT TIMELINE" subtitle="Validity windows for in-progress permits" />
            <div className="p-4 rounded-md border border-surface-border bg-surface-card overflow-x-auto">
              {(() => {
                const activePermits = permits
                  .filter(p => ['ACTIVE', 'APPROVED', 'SUBMITTED', 'UNDER_REVIEW'].includes(p.status))
                  .sort((a, b) => new Date(a.validFrom).getTime() - new Date(b.validFrom).getTime())
                  .slice(0, 15);

                if (activePermits.length === 0) return null;

                const earliest = Math.min(...activePermits.map(p => new Date(p.validFrom).getTime()));
                const latest   = Math.max(...activePermits.map(p => new Date(p.validTo).getTime()));
                const span     = Math.max(latest - earliest, 1);

                const barColor = (status: PermitStatus) => {
                  if (status === 'ACTIVE')       return 'bg-emerald-600/80';
                  if (status === 'APPROVED')     return 'bg-blue-600/80';
                  if (status === 'UNDER_REVIEW') return 'bg-yellow-600/80';
                  return 'bg-gray-600/60';
                };

                // Time axis labels
                const steps = 5;
                const timeLabels = Array.from({ length: steps + 1 }, (_, i) => {
                  const ts = earliest + (span / steps) * i;
                  return new Date(ts).toLocaleDateString('en', { month: 'short', day: 'numeric' });
                });

                return (
                  <div>
                    {/* Time axis */}
                    <div className="flex items-center mb-2 ml-36">
                      {timeLabels.map((lbl, i) => (
                        <div key={i} className="flex-1 text-2xs text-gray-600 font-mono">{lbl}</div>
                      ))}
                    </div>

                    {/* Permit rows */}
                    <div className="space-y-1.5">
                      {activePermits.map(p => {
                        const start = (new Date(p.validFrom).getTime() - earliest) / span * 100;
                        const width = Math.max(
                          1,
                          (new Date(p.validTo).getTime() - new Date(p.validFrom).getTime()) / span * 100
                        );
                        return (
                          <div key={p.id} className="flex items-center gap-2">
                            <div className="w-36 flex-shrink-0 text-right">
                              <span className="text-2xs font-mono text-brand">{p.permitNumber}</span>
                            </div>
                            <div className="flex-1 h-6 bg-surface-panel rounded border border-surface-border relative overflow-hidden">
                              <div
                                className={`absolute h-full rounded ${barColor(p.status)} flex items-center px-1.5 overflow-hidden`}
                                style={{ left: `${start}%`, width: `${width}%`, minWidth: '4px' }}
                                title={`${p.permitNumber} — ${p.status} — ${p.title}`}
                              >
                                <span className="text-2xs text-white font-medium truncate">{p.title}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-4 mt-3 text-2xs text-gray-600">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-600/80 inline-block" /> Active</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-600/80 inline-block" /> Approved</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-yellow-600/80 inline-block" /> Under Review</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

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
