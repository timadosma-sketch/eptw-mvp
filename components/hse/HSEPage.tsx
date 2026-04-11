'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, TrendingUp, TrendingDown } from 'lucide-react';
import { PageShell, SectionHeader } from '@/components/shared/PageShell';
import { useAppStore } from '@/lib/store/useAppStore';
import { useT } from '@/lib/i18n/useT';
import { MOCK_DASHBOARD_METRICS } from '@/lib/mock/dashboard';

const INCIDENTS = [
  { id: 'i-001', type: 'NEAR_MISS',  date: '2024-11-10', location: 'CDU Bay 2',     description: 'Scaffold board not secured. Corrected immediately.', status: 'CLOSED' },
  { id: 'i-002', type: 'NEAR_MISS',  date: '2024-11-08', location: 'Tank Farm',     description: 'Minor H2S reading (0.8ppm) during line inspection. Area cleared.', status: 'CLOSED' },
  { id: 'i-003', type: 'FIRST_AID',  date: '2024-10-22', location: 'Boiler House',  description: 'Minor laceration during pump maintenance. First aid administered.', status: 'CLOSED' },
];

const TYPE_COLOR: Record<string, string> = {
  NEAR_MISS:    'text-yellow-400 bg-yellow-900/30 border-yellow-800',
  FIRST_AID:    'text-orange-400 bg-orange-900/30 border-orange-800',
  RECORDABLE:   'text-red-400 bg-red-900/30 border-red-800',
  LTI:          'text-red-500 bg-red-950/60 border-red-700',
};

const HSE_KPIS = [
  { label: 'Total Recordable Rate', value: '0.00', unit: 'TRIR', trend: 'down', good: true },
  { label: 'Lost Time Incidents', value: '0', unit: 'LTIs YTD', trend: 'same', good: true },
  { label: 'Near Misses YTD', value: '12', unit: 'reported', trend: 'up', good: true },
  { label: 'Unsafe Acts/Cond.', value: '4', unit: 'open', trend: 'down', good: true },
];

export function HSEPage() {
  const { t } = useT();
  const dataVersion = useAppStore(s => s.dataVersion);
  const [m, setM] = useState(MOCK_DASHBOARD_METRICS);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.metrics) setM(d.metrics); })
      .catch(() => {});
  }, [dataVersion]);

  return (
    <PageShell title={t.hse.title} subtitle={t.hse.subtitle}>
      <div className="space-y-6">

        <div className="flex items-center gap-6 px-6 py-5 rounded-md border border-emerald-800/50 bg-emerald-950/20">
          <ShieldCheck className="w-12 h-12 text-emerald-400 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-2xs text-emerald-600 uppercase tracking-wider font-bold mb-1">{t.hse.safetyScoreLabel}</div>
            <div className="text-5xl font-bold text-emerald-400 font-mono">{m.safetyScore}</div>
            <div className="text-xs text-emerald-600 mt-1">{t.hse.safetyScoreDesc}</div>
          </div>
          <div className="text-right">
            <div className="text-2xs text-gray-500 mb-1">{t.hse.daysWithoutIncident}</div>
            <div className="text-4xl font-bold text-brand font-mono">{m.daysWithoutIncident}</div>
            <div className="text-xs text-gray-600">{t.hse.consecutiveDays}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {HSE_KPIS.map((k, i) => (
            <div key={i} className="p-4 rounded-md border border-surface-border bg-surface-card">
              <div className="text-2xs text-gray-500 uppercase tracking-wider mb-1">{k.label}</div>
              <div className="text-3xl font-bold font-mono text-white">{k.value}</div>
              <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                {k.trend === 'up'   && <TrendingUp   className="w-3 h-3 text-emerald-400" />}
                {k.trend === 'down' && <TrendingDown  className="w-3 h-3 text-emerald-400" />}
                {k.unit}
              </div>
            </div>
          ))}
        </div>

        <div>
          <SectionHeader title={t.hse.incidentRegister} subtitle={t.hse.incidentSubtitle} />
          <div className="space-y-3">
            {INCIDENTS.map(inc => (
              <div key={inc.id} className="flex items-start gap-4 px-4 py-3 rounded-md border border-surface-border bg-surface-card">
                <div>
                  <span className={`text-2xs px-2 py-0.5 rounded border font-semibold ${TYPE_COLOR[inc.type] ?? 'text-gray-400'}`}>
                    {inc.type.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-200">{inc.description}</div>
                  <div className="text-2xs text-gray-500 mt-1">{inc.date} · {inc.location}</div>
                </div>
                <span className="text-2xs text-emerald-400 font-semibold mt-0.5">{inc.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionHeader title={t.hse.compliance} />
          <div className="flex items-center gap-4 p-4 rounded-md border border-surface-border bg-surface-card">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-gray-500">{t.hse.complianceLabel}</span>
                <span className="font-mono text-emerald-400 font-bold">100%</span>
              </div>
              <div className="h-2 bg-surface-panel rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-full" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </PageShell>
  );
}
