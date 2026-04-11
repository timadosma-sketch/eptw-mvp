'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle, FileText, Users } from 'lucide-react';
import { PageShell, SectionHeader } from '@/components/shared/PageShell';
import { KPICard } from '@/components/shared/KPICard';
import { Button } from '@/components/shared/Button';
import { useAppStore } from '@/lib/store/useAppStore';
import { useT } from '@/lib/i18n/useT';
import { MOCK_PERMITS } from '@/lib/mock/permits';
import { MOCK_GAS_ALERTS } from '@/lib/mock/gas';
import { MOCK_SIMOPS_CONFLICTS } from '@/lib/mock/simops';
import { cn } from '@/lib/utils/cn';

const SHIFT_ITEMS = [
  { id: '1', category: 'PERMIT',   description: 'PTW-2024-0841 — Hot Work E-101: Active, gas tests current, fire watch in place. Expires 19:00.',          priority: 'HIGH',   actionRequired: false },
  { id: '2', category: 'PERMIT',   description: 'PTW-2024-0842 — CSE T-301: Approved, toolbox talk NOT completed. Do not activate until TBT done.',         priority: 'CRITICAL', actionRequired: true  },
  { id: '3', category: 'SAFETY',   description: 'PTW-2024-0844 — Line Break HCU SUSPENDED due to LEL exceedance at 11:42. Area cleared. Investigate source.',priority: 'CRITICAL', actionRequired: true  },
  { id: '4', category: 'PERMIT',   description: 'PTW-2024-0839 — Lifting P-401: Active, completes by 17:00.',                                                priority: 'MEDIUM', actionRequired: false },
  { id: '5', category: 'EQUIPMENT', description: 'Gas detector GD-HCU-05 requires battery replacement — report raised, unit taken offline.',                priority: 'HIGH',   actionRequired: true  },
  { id: '6', category: 'SAFETY',   description: 'SIMOPS conflict Zone A3: Two hot work permits. Conditional — 15m separation confirmed.',                    priority: 'MEDIUM', actionRequired: false },
];

const CATEGORY_COLORS: Record<string, string> = {
  PERMIT:    'text-blue-400',
  SAFETY:    'text-red-400',
  EQUIPMENT: 'text-yellow-400',
  INCIDENT:  'text-orange-400',
  MAINTENANCE: 'text-purple-400',
};

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: 'border-l-red-500',
  HIGH:     'border-l-orange-500',
  MEDIUM:   'border-l-yellow-500',
  LOW:      'border-l-gray-600',
};

export function HandoverPage() {
  const currentUser = useAppStore(s => s.currentUser);
  const showToast   = useAppStore(s => s.showToast);
  const dataVersion = useAppStore(s => s.dataVersion);
  const { t } = useT();

  const [permits,   setPermits]   = useState(MOCK_PERMITS.filter(p => !['ARCHIVED','DRAFT'].includes(p.status)));
  const [gasAlerts, setGasAlerts] = useState(MOCK_GAS_ALERTS.filter(a => !a.acknowledged));
  const [conflicts, setConflicts] = useState(MOCK_SIMOPS_CONFLICTS.filter(c => c.isActive));
  const [notes, setNotes] = useState('HCU line break permit suspended — LEL source investigation ongoing. Do not reinstate without HSE clearance.');
  const [signingOff, setSigningOff] = useState(false);
  const [signedOff, setSignedOff] = useState(false);
  const [incomingSupervisors, setIncomingSupervisors] = useState<{ id: string; name: string; role: string }[]>([]);
  const [incomingId, setIncomingId] = useState('');

  useEffect(() => {
    fetch('/api/permits?pageSize=100')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data) setPermits(d.data.filter((p: any) => !['ARCHIVED','DRAFT'].includes(p.status))); })
      .catch(() => {});
    fetch('/api/gas-tests?alerts=true')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data) setGasAlerts(d.data.filter((a: any) => !a.acknowledged)); })
      .catch(() => {});
    fetch('/api/simops?active=true')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data) setConflicts(d.data); })
      .catch(() => {});
    // Load potential incoming supervisors (SITE_SUPERVISOR + ISSUING_AUTHORITY)
    fetch('/api/users')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d?.data) return;
        const candidates = d.data.filter((u: { id: string; name: string; role: string }) =>
          ['SITE_SUPERVISOR', 'ISSUING_AUTHORITY', 'PLANT_OPS_MANAGER'].includes(u.role) && u.id !== currentUser.id
        );
        setIncomingSupervisors(candidates);
        if (candidates.length > 0 && !incomingId) setIncomingId(candidates[0].id);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataVersion]);

  const activePermits   = permits.filter(p => p.status === 'ACTIVE').length;
  const suspendedCount  = permits.filter(p => p.status === 'SUSPENDED').length;
  const gasAlertsCount  = gasAlerts.length;
  const conflictCount   = conflicts.length;

  const handleCompleteHandover = async () => {
    if (!incomingId) {
      showToast('Please select an incoming supervisor.', 'error');
      return;
    }
    setSigningOff(true);
    try {
      const res = await fetch('/api/handover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outgoingSupervisorId: currentUser.id,
          incomingSupervisorId: incomingId,
          activePermitCount:    activePermits,
          suspendedCount,
          gasAlertCount:        gasAlertsCount,
          simopsConflictCount:  conflictCount,
          workerCount:          24,
          incidentCount:        0,
          notes,
          shift: 'DAY',
        }),
      });
      if (res.ok) {
        setSignedOff(true);
        showToast('Shift handover completed and signed off. Incoming supervisor notified.', 'success');
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || 'Failed to complete handover.', 'error');
      }
    } catch {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setSigningOff(false);
    }
  };

  return (
    <PageShell
      title={t.handover.title}
      subtitle={t.handover.subtitle}
      actions={
        <Button variant="primary" size="sm" icon={CheckCircle2} onClick={handleCompleteHandover} loading={signingOff} disabled={signedOff}>
          {signedOff ? 'Signed Off ✓' : t.handover.completeHandover}
        </Button>
      }
    >
      <div className="space-y-6">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard label={t.handover.activePermits}  value={activePermits}  icon={FileText}      variant="default" />
          <KPICard label={t.handover.suspended}       value={suspendedCount} icon={AlertTriangle} variant={suspendedCount > 0 ? 'warning' : 'default'} />
          <KPICard label={t.handover.gasAlerts}       value={gasAlertsCount} icon={RefreshCw}     variant={gasAlertsCount > 0 ? 'danger' : 'default'} />
          <KPICard label={t.handover.simopsIssues}    value={conflictCount}  icon={Users}         variant={conflictCount > 0 ? 'warning' : 'default'} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          <div>
            <SectionHeader title={t.handover.outgoingShift} subtitle={`${currentUser.name} — Day Shift`} />
            <div className="p-4 rounded-md border border-surface-border bg-surface-card space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded bg-surface-panel border border-surface-border">
                  <div className="text-gray-500 mb-1">{t.handover.shift}</div>
                  <div className="text-white font-semibold">{t.handover.day}</div>
                </div>
                <div className="p-3 rounded bg-surface-panel border border-surface-border">
                  <div className="text-gray-500 mb-1">{t.handover.shiftSupervisor}</div>
                  <div className="text-white font-semibold">{currentUser.name}</div>
                </div>
                <div className="p-3 rounded bg-surface-panel border border-surface-border">
                  <div className="text-gray-500 mb-1">{t.handover.workersOnSite}</div>
                  <div className="text-white font-semibold">24 {t.handover.persons}</div>
                </div>
                <div className="p-3 rounded bg-surface-panel border border-surface-border">
                  <div className="text-gray-500 mb-1">{t.handover.incidents}</div>
                  <div className="text-emerald-400 font-semibold">0 ({t.handover.nil})</div>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">{t.handover.outgoingNotes}</label>
                <textarea
                  rows={3}
                  placeholder={t.handover.notesPlaceholder}
                  className="w-full text-xs bg-surface-panel border border-surface-border rounded px-3 py-2 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand/60 resize-none"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">{t.handover.incomingSupervisor}</label>
                <select
                  value={incomingId}
                  onChange={e => setIncomingId(e.target.value)}
                  className="w-full text-xs bg-surface-panel border border-surface-border rounded px-3 py-2 text-gray-300 focus:outline-none focus:border-brand/60"
                >
                  {incomingSupervisors.length === 0 && (
                    <option value="">Loading supervisors…</option>
                  )}
                  {incomingSupervisors.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.role.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <SectionHeader title={t.handover.criticalItems} subtitle="Items requiring incoming shift attention" />
            <div className="space-y-2">
              {SHIFT_ITEMS.map(item => (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 rounded border-l-4 border border-surface-border bg-surface-card',
                    PRIORITY_COLORS[item.priority]
                  )}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn('text-2xs font-bold uppercase tracking-wider', CATEGORY_COLORS[item.category])}>
                        {item.category}
                      </span>
                      {item.actionRequired && (
                        <span className="text-2xs bg-red-900/50 border border-red-800 text-red-400 px-1.5 py-0.5 rounded font-semibold">
                          {t.handover.actionRequired}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-300">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div>
          <SectionHeader title={t.handover.permitStatus} />
          <div className="overflow-x-auto rounded-md border border-surface-border">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-surface-panel border-b border-surface-border">
                  <th className="px-4 py-2.5 text-left text-2xs text-gray-600 uppercase tracking-wider">{t.permits.permitNo}</th>
                  <th className="px-4 py-2.5 text-left text-2xs text-gray-600 uppercase tracking-wider">{t.handover.work}</th>
                  <th className="px-4 py-2.5 text-left text-2xs text-gray-600 uppercase tracking-wider">{t.common.status}</th>
                  <th className="px-4 py-2.5 text-left text-2xs text-gray-600 uppercase tracking-wider">{t.handover.action}</th>
                </tr>
              </thead>
              <tbody>
                {permits.map((p, i) => (
                  <tr key={p.id} className={i % 2 === 0 ? 'bg-surface-raised' : 'bg-surface-base'}>
                    <td className="px-4 py-2.5 font-mono text-brand">{p.permitNumber}</td>
                    <td className="px-4 py-2.5 text-gray-300">{p.title.substring(0, 50)}</td>
                    <td className="px-4 py-2.5">
                      <span className={cn(
                        'text-xs font-semibold',
                        p.status === 'ACTIVE'    && 'text-emerald-400',
                        p.status === 'SUSPENDED' && 'text-orange-400',
                        p.status === 'APPROVED'  && 'text-green-400',
                        p.status === 'CLOSED'    && 'text-gray-500',
                        ['SUBMITTED', 'UNDER_REVIEW'].includes(p.status) && 'text-blue-400',
                      )}>
                        {t.status[p.status as keyof typeof t.status] ?? p.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">
                      {p.status === 'ACTIVE'    && `${t.handover.monitor} ${p.validTo.slice(11, 16)}`}
                      {p.status === 'SUSPENDED' && t.handover.investigate}
                      {p.status === 'APPROVED'  && t.handover.activateWhenReady}
                      {p.status === 'CLOSED'    && t.handover.noAction}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </PageShell>
  );
}
