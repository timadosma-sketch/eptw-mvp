'use client';

import { useState, useEffect } from 'react';
import {
  MapPin, Wind, AlertTriangle, CheckCircle2, XCircle, Paperclip, Send, Download,
} from 'lucide-react';
import { Drawer } from '@/components/shared/Modal';
import { PermitStatusBadge, RiskBadge, GasStatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/shared/Button';
import { useAppStore } from '@/lib/store/useAppStore';
import { useT } from '@/lib/i18n/useT';
import { PERMIT_TYPE_CONFIG } from '@/lib/constants';
import { formatDateTime, getTimeRemaining } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';
import { downloadPermitPDF } from './PermitPDF';
import type { Permit, IsolationCertificate, GasTestRecord } from '@/lib/types';

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-surface-border/50 last:border-0">
      <span className="text-xs text-gray-500 w-36 flex-shrink-0">{label}</span>
      <span className="text-xs text-gray-200 flex-1">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="text-2xs font-bold uppercase tracking-widest text-gray-600 mb-3 pb-1 border-b border-surface-border">
        {title}
      </div>
      {children}
    </div>
  );
}

export function PermitDetailDrawer() {
  const permitDetailOpen  = useAppStore(s => s.permitDetailOpen);
  const selectedPermitId  = useAppStore(s => s.selectedPermitId);
  const closePermitDetail = useAppStore(s => s.closePermitDetail);
  const openGasTestModal  = useAppStore(s => s.openGasTestModal);
  const showToast         = useAppStore(s => s.showToast);
  const { t } = useT();

  const [permit,    setPermit]    = useState<Permit | null>(null);
  const [isolation, setIsolation] = useState<IsolationCertificate | null>(null);
  const [gasRecords, setGasRecords] = useState<GasTestRecord[]>([]);
  const [acting,    setActing]    = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!selectedPermitId || !permitDetailOpen) return;
    setPermit(null);

    fetch(`/api/permits/${selectedPermitId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setPermit(d); })
      .catch(() => {});

    fetch(`/api/isolation/${selectedPermitId}?byPermit=true`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data?.[0]) setIsolation(d.data[0]); else setIsolation(null); })
      .catch(() => {});

    fetch(`/api/gas-tests/${selectedPermitId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data) setGasRecords(d.data); else setGasRecords([]); })
      .catch(() => {});
  }, [selectedPermitId, permitDetailOpen]);

  if (!permit) return null;

  const typeCfg  = PERMIT_TYPE_CONFIG[permit.type];
  const latestGas = gasRecords[gasRecords.length - 1];

  const changeStatus = async (status: string, successMsg: string) => {
    setActing(true);
    try {
      const res = await fetch(`/api/permits/${permit.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showToast(successMsg, status === 'SUSPENDED' ? 'warning' : 'success');
        closePermitDetail();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || 'Action failed. Please try again.', 'error');
      }
    } catch {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setActing(false);
    }
  };

  const handleSuspend = () => changeStatus('SUSPENDED', 'Permit suspended. All workers notified.');
  const handleClose   = () => changeStatus('CLOSED',    'Permit closed successfully.');

  const handleExportPDF = async () => {
    if (!permit) return;
    setExporting(true);
    try { await downloadPermitPDF(permit); }
    catch { showToast('Failed to generate PDF. Please try again.', 'error'); }
    finally { setExporting(false); }
  };

  return (
    <Drawer
      open={permitDetailOpen}
      onClose={closePermitDetail}
      title={permit.permitNumber}
      subtitle={typeCfg.label}
      width="w-[680px]"
    >
      <div className="px-6 py-5 space-y-0">

        {/* Status bar */}
        <div className="flex items-center gap-3 mb-6 p-3 rounded border border-surface-border bg-surface-panel">
          <PermitStatusBadge status={permit.status} size="lg" />
          <RiskBadge level={permit.riskLevel} />
          {permit.status === 'ACTIVE' && (
            <span className="ml-auto text-xs font-mono text-yellow-400">
              {getTimeRemaining(permit.validTo)}
            </span>
          )}
        </div>

        <Section title={t.permitDetail.workDescription}>
          <div className="text-sm font-semibold text-white mb-2">{permit.title}</div>
          <div className="text-xs text-gray-400 leading-relaxed">{permit.description}</div>
        </Section>

        <Section title={t.permitDetail.permitDetails}>
          <InfoRow label={t.permitDetail.location}   value={<span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-gray-600" />{permit.location}</span>} />
          <InfoRow label={t.permitDetail.unitArea}   value={`${permit.unit} · ${permit.area}`} />
          <InfoRow label={t.permitDetail.equipment}  value={permit.equipment} />
          <InfoRow label={t.permitDetail.validFrom}  value={<span className="font-mono">{formatDateTime(permit.validFrom)}</span>} />
          <InfoRow label={t.permitDetail.validTo}    value={<span className="font-mono">{formatDateTime(permit.validTo)}</span>} />
          <InfoRow label={t.permitDetail.simopsZone} value={<span className="font-mono">{permit.simopsZone || '—'}</span>} />
          <InfoRow label={t.permitDetail.workers}    value={`${permit.workerCount} ${t.common.persons}`} />
        </Section>

        <Section title={t.permitDetail.responsibilities}>
          <InfoRow label={t.permitDetail.requestedBy}    value={<UserChip user={permit.requestedBy} />} />
          {permit.areaAuthority    && <InfoRow label={t.permitDetail.areaAuthority}    value={<UserChip user={permit.areaAuthority} />} />}
          {permit.issuingAuthority && <InfoRow label={t.permitDetail.issuingAuthority} value={<UserChip user={permit.issuingAuthority} />} />}
          {permit.hseOfficer       && <InfoRow label={t.permitDetail.hseOfficer}       value={<UserChip user={permit.hseOfficer} />} />}
        </Section>

        <Section title={t.permitDetail.requirements}>
          <div className="flex flex-wrap gap-2">
            <RequirementChip label={t.permitDetail.gasTestRequired}  met={permit.gasTestRequired}    neutral={!permit.gasTestRequired} />
            <RequirementChip label={t.permitDetail.isoRequired}      met={permit.isolationRequired}   neutral={!permit.isolationRequired} />
            <RequirementChip label={t.permitDetail.cseRequired}      met={permit.confinedSpaceEntry}  neutral={!permit.confinedSpaceEntry} />
            <RequirementChip label={t.permitDetail.jsaCompleted}     met={permit.jsaCompleted} />
            <RequirementChip label={t.permitDetail.toolboxTalk}      met={permit.toolboxTalkCompleted} />
          </div>
        </Section>

        {permit.gasTestRequired && (
          <Section title={t.permitDetail.latestGasTest}>
            {latestGas ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-2">
                  <GasStatusBadge status={latestGas.overallStatus} />
                  <span className="text-xs font-mono text-gray-500">{formatDateTime(latestGas.testedAt)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {latestGas.readings.map(r => (
                    <div key={r.id} className="flex items-center justify-between px-3 py-2 rounded bg-surface-panel border border-surface-border text-xs">
                      <span className="text-gray-400">{r.gasType}</span>
                      <span className={cn(
                        'font-mono font-bold',
                        r.status === 'SAFE'    && 'text-emerald-400',
                        r.status === 'WARNING' && 'text-yellow-400',
                        r.status === 'DANGER'  && 'text-red-400'
                      )}>
                        {r.value} {r.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-600 italic">{t.permitDetail.noGasTest}</p>
            )}
          </Section>
        )}

        {permit.isolationRequired && (
          <Section title={t.permitDetail.isolationCert}>
            {isolation ? (
              <InfoRow label={isolation.certificateNumber} value={isolation.status} />
            ) : (
              <p className="text-xs text-gray-600 italic">{t.permitDetail.noCert}</p>
            )}
          </Section>
        )}

        {permit.contractors.length > 0 && (
          <Section title={t.permitDetail.contractors}>
            <div className="space-y-1.5">
              {permit.contractors.map(c => (
                <div key={c.id} className="flex items-center justify-between px-3 py-2 rounded bg-surface-panel border border-surface-border text-xs">
                  <div>
                    <div className="text-gray-200 font-medium">{c.name}</div>
                    <div className="text-gray-500">{c.company} · {c.role}</div>
                  </div>
                  {c.induction
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    : <XCircle     className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  }
                </div>
              ))}
            </div>
          </Section>
        )}

        {permit.attachments.length > 0 && (
          <Section title={t.permitDetail.attachments}>
            <div className="space-y-1.5">
              {permit.attachments.map(a => (
                <div key={a.id} className="flex items-center gap-2 text-xs text-gray-400">
                  <Paperclip className="w-3 h-3 flex-shrink-0" />
                  <span className="text-brand hover:underline cursor-pointer">{a.name}</span>
                  <span className="text-gray-600 ml-auto">{a.type}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {permit.notes && (
          <Section title={t.permitDetail.notes}>
            <p className="text-xs text-gray-400 leading-relaxed">{permit.notes}</p>
          </Section>
        )}

        {/* Export PDF — always available */}
        <div className="flex items-center justify-end pt-2 pb-2 border-t border-surface-border">
          <Button variant="ghost" size="sm" icon={Download} loading={exporting} onClick={handleExportPDF}>
            Export PDF
          </Button>
        </div>

        {['DRAFT', 'ACTIVE', 'APPROVED'].includes(permit.status) && (
          <div className="flex items-center gap-2 pt-2 border-t border-surface-border">
            {permit.status === 'DRAFT' && (
              <Button variant="primary" size="sm" icon={Send} loading={acting} onClick={() => changeStatus('SUBMITTED', `Permit ${permit.permitNumber} submitted for approval.`)}>
                Submit for Approval
              </Button>
            )}
            {permit.gasTestRequired && permit.status !== 'DRAFT' && (
              <Button variant="secondary" size="sm" icon={Wind} onClick={() => openGasTestModal(permit.id)}>
                {t.permitDetail.gasTest}
              </Button>
            )}
            {permit.status === 'ACTIVE' && (
              <Button variant="warning" size="sm" icon={AlertTriangle} loading={acting} onClick={handleSuspend}>
                {t.permitDetail.suspend}
              </Button>
            )}
            {permit.status === 'ACTIVE' && (
              <Button variant="success" size="sm" icon={CheckCircle2} loading={acting} onClick={handleClose}>
                {t.permitDetail.closePermit}
              </Button>
            )}
          </div>
        )}

      </div>
    </Drawer>
  );
}

function UserChip({ user }: { user: { name: string; role: string; company: string } }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-5 h-5 rounded-full bg-surface-panel border border-surface-border text-2xs font-bold text-brand flex items-center justify-center">
        {user.name.slice(0, 1)}
      </span>
      <span className="text-gray-200">{user.name}</span>
      <span className="text-gray-600">·</span>
      <span className="text-gray-500 text-2xs">{user.role.replace(/_/g, ' ')}</span>
    </span>
  );
}

function RequirementChip({ label, met, neutral }: { label: string; met: boolean; neutral?: boolean }) {
  if (neutral && !met) return null;
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 text-2xs px-2 py-1 rounded border font-medium',
      met
        ? 'bg-emerald-900/40 text-emerald-400 border-emerald-800'
        : 'bg-red-900/40 text-red-400 border-red-800'
    )}>
      {met
        ? <CheckCircle2 className="w-3 h-3" />
        : <XCircle className="w-3 h-3" />
      }
      {label}
    </span>
  );
}
