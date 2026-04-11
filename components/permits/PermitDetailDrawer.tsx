'use client';

import { useState, useEffect } from 'react';
import {
  MapPin, Wind, AlertTriangle, CheckCircle2, XCircle, Paperclip, Send, Download, PlayCircle, Ban, Pencil, Save, Clock,
} from 'lucide-react';
import { Drawer } from '@/components/shared/Modal';
import { PermitStatusBadge, RiskBadge, GasStatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/shared/Button';
import { useAppStore } from '@/lib/store/useAppStore';
import { useT } from '@/lib/i18n/useT';
import { PERMIT_TYPE_CONFIG } from '@/lib/constants';
import { formatDateTime, getTimeRemaining, isExpiringSoon } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';
import { downloadPermitPDF } from './PermitPDF';
import { rbac } from '@/lib/rbac';
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
  const currentUser       = useAppStore(s => s.currentUser);
  const { t } = useT();

  const canSubmit  = rbac.canCreatePermit(currentUser?.role);
  const canControl = rbac.canControlPermit(currentUser?.role);
  const canGasTest = rbac.canRecordGasTest(currentUser?.role);
  const canApprove = rbac.canApprove(currentUser?.role);

  const [permit,    setPermit]    = useState<Permit | null>(null);
  const [isolation, setIsolation] = useState<IsolationCertificate | null>(null);
  const [gasRecords, setGasRecords] = useState<GasTestRecord[]>([]);
  const [acting,    setActing]    = useState(false);
  const [exporting, setExporting] = useState(false);
  const [approvalId, setApprovalId] = useState<string | null>(null);
  const [approvalComments, setApprovalComments] = useState('');
  const [editing,   setEditing]   = useState(false);
  const [editFields, setEditFields] = useState<Partial<{
    title: string; description: string; location: string;
    unit: string; area: string; equipment: string;
    validFrom: string; validTo: string; workerCount: number;
    simopsZone: string; notes: string;
  }>>({});

  useEffect(() => {
    if (!selectedPermitId || !permitDetailOpen) return;
    setPermit(null);
    setEditing(false);
    setEditFields({});

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

    // Fetch open approval record for UNDER_REVIEW permits
    fetch(`/api/approvals?permitId=${selectedPermitId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const open = d?.data?.find((a: { decision: unknown }) => !a.decision);
        setApprovalId(open?.id ?? null);
      })
      .catch(() => {});
    setApprovalComments('');
  }, [selectedPermitId, permitDetailOpen]);

  // Show drawer with loading skeleton when open but permit not yet loaded
  if (!permit) {
    if (!permitDetailOpen) return null;
    return (
      <Drawer open={permitDetailOpen} onClose={closePermitDetail} title="Loading…" width="w-[680px]">
        <div className="px-6 py-5 space-y-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 rounded bg-surface-panel border border-surface-border" />
          ))}
        </div>
      </Drawer>
    );
  }

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

  const handleApprovalDecision = async (decision: 'APPROVED' | 'REJECTED' | 'REFERRED_BACK') => {
    if (!approvalId) return;
    setActing(true);
    try {
      const res = await fetch(`/api/approvals/${approvalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, comments: approvalComments }),
      });
      if (res.ok) {
        const msg = decision === 'APPROVED'      ? 'Permit approved — requester notified.'
                  : decision === 'REJECTED'      ? 'Permit rejected — requester notified.'
                  : 'Permit referred back for revision.';
        showToast(msg, decision === 'APPROVED' ? 'success' : decision === 'REJECTED' ? 'error' : 'warning');
        closePermitDetail();
      } else {
        showToast('Action failed. Please try again.', 'error');
      }
    } catch {
      showToast('Network error.', 'error');
    } finally {
      setActing(false);
    }
  };
  const handleCancel  = () => {
    const reason = window.prompt('Reason for cancellation (required):');
    if (!reason?.trim()) return;
    changeStatus('CANCELLED', `Permit ${permit.permitNumber} cancelled.`);
  };

  const startEditing = () => {
    setEditFields({
      title:       permit.title,
      description: permit.description,
      location:    permit.location,
      unit:        permit.unit,
      area:        permit.area,
      equipment:   permit.equipment,
      validFrom:   permit.validFrom.slice(0, 16),  // datetime-local format
      validTo:     permit.validTo.slice(0, 16),
      workerCount: permit.workerCount,
      simopsZone:  permit.simopsZone ?? '',
      notes:       permit.notes ?? '',
    });
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    setActing(true);
    try {
      const res = await fetch(`/api/permits/${permit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editFields,
          validFrom: editFields.validFrom ? new Date(editFields.validFrom).toISOString() : undefined,
          validTo:   editFields.validTo   ? new Date(editFields.validTo).toISOString()   : undefined,
          workerCount: Number(editFields.workerCount),
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPermit(updated);
        setEditing(false);
        showToast('Permit updated successfully.', 'success');
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || 'Failed to save changes.', 'error');
      }
    } catch {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setActing(false);
    }
  };

  const handleExtend = async (hours: number) => {
    setActing(true);
    try {
      const newValidTo = new Date(new Date(permit.validTo).getTime() + hours * 3_600_000).toISOString();
      const res = await fetch(`/api/permits/${permit.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        // Status stays ACTIVE — we use the notes field to convey the extension
        body: JSON.stringify({ status: 'ACTIVE', notes: `Extended by ${hours}h — new expiry: ${newValidTo}` }),
      });
      // Also PATCH the validTo field directly
      const patchRes = await fetch(`/api/permits/${permit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ validTo: newValidTo }),
      });
      if (patchRes.ok || res.ok) {
        const updated = await patchRes.json().catch(() => null);
        if (updated) setPermit(updated);
        showToast(`Permit extended by ${hours} hour${hours > 1 ? 's' : ''}.`, 'success');
      } else {
        showToast('Failed to extend permit.', 'error');
      }
    } catch {
      showToast('Network error.', 'error');
    } finally {
      setActing(false);
    }
  };

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
        <div className="flex items-center gap-3 mb-4 p-3 rounded border border-surface-border bg-surface-panel">
          <PermitStatusBadge status={permit.status} size="lg" />
          <RiskBadge level={permit.riskLevel} />
          {permit.status === 'ACTIVE' && (
            <span className={cn(
              'ml-auto text-xs font-mono',
              isExpiringSoon(permit.validTo, 2) ? 'text-red-400 font-bold animate-pulse' : 'text-yellow-400'
            )}>
              {getTimeRemaining(permit.validTo)}
            </span>
          )}
        </div>

        {/* Expiry warning banner */}
        {permit.status === 'ACTIVE' && isExpiringSoon(permit.validTo, 2) && (
          <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded border border-orange-700/60 bg-orange-950/30">
            <Clock className="w-4 h-4 text-orange-400 flex-shrink-0 animate-pulse" />
            <div className="flex-1 text-xs text-orange-300">
              <span className="font-bold">Permit expiring soon.</span>{' '}
              Expires {getTimeRemaining(permit.validTo)}. Extend or close before work stops.
            </div>
            {canControl && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleExtend(2)}
                  disabled={acting}
                  className="text-2xs border border-orange-700 text-orange-400 rounded px-2 py-1 hover:bg-orange-900/40 transition-colors disabled:opacity-50"
                >
                  +2h
                </button>
                <button
                  onClick={() => handleExtend(4)}
                  disabled={acting}
                  className="text-2xs border border-orange-700 text-orange-400 rounded px-2 py-1 hover:bg-orange-900/40 transition-colors disabled:opacity-50"
                >
                  +4h
                </button>
                <button
                  onClick={() => handleExtend(8)}
                  disabled={acting}
                  className="text-2xs border border-orange-700 text-orange-400 rounded px-2 py-1 hover:bg-orange-900/40 transition-colors disabled:opacity-50"
                >
                  +8h
                </button>
              </div>
            )}
          </div>
        )}

        {/* Edit mode header bar */}
        {permit.status === 'DRAFT' && canSubmit && (
          <div className="flex items-center gap-2 mb-4">
            {!editing ? (
              <Button variant="ghost" size="xs" icon={Pencil} onClick={startEditing}>
                Edit Permit
              </Button>
            ) : (
              <>
                <Button variant="primary" size="xs" icon={Save} loading={acting} onClick={handleSaveEdit}>
                  Save Changes
                </Button>
                <Button variant="ghost" size="xs" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </>
            )}
          </div>
        )}

        <Section title={t.permitDetail.workDescription}>
          {editing ? (
            <div className="space-y-2">
              <input
                value={editFields.title ?? ''}
                onChange={e => setEditFields(f => ({ ...f, title: e.target.value }))}
                className="w-full text-sm font-semibold bg-surface-panel border border-brand/40 rounded px-3 py-2 text-white focus:outline-none focus:border-brand"
                placeholder="Permit title"
              />
              <textarea
                rows={3}
                value={editFields.description ?? ''}
                onChange={e => setEditFields(f => ({ ...f, description: e.target.value }))}
                className="w-full text-xs bg-surface-panel border border-surface-border rounded px-3 py-2 text-gray-200 focus:outline-none focus:border-brand/60 resize-none"
                placeholder="Work description"
              />
            </div>
          ) : (
            <>
              <div className="text-sm font-semibold text-white mb-2">{permit.title}</div>
              <div className="text-xs text-gray-400 leading-relaxed">{permit.description}</div>
            </>
          )}
        </Section>

        <Section title={t.permitDetail.permitDetails}>
          {editing ? (
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: t.permitDetail.location, field: 'location' as const, placeholder: 'Location' },
                { label: t.permitDetail.equipment, field: 'equipment' as const, placeholder: 'Equipment tag' },
                { label: 'Unit', field: 'unit' as const, placeholder: 'Unit' },
                { label: 'Area', field: 'area' as const, placeholder: 'Area' },
                { label: t.permitDetail.simopsZone, field: 'simopsZone' as const, placeholder: 'SIMOPS zone' },
              ].map(({ label, field, placeholder }) => (
                <div key={field}>
                  <label className="text-2xs text-gray-600 block mb-1">{label}</label>
                  <input
                    value={editFields[field] ?? ''}
                    onChange={e => setEditFields(f => ({ ...f, [field]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-surface-panel border border-surface-border rounded px-2 py-1.5 text-gray-200 focus:outline-none focus:border-brand/60"
                  />
                </div>
              ))}
              <div>
                <label className="text-2xs text-gray-600 block mb-1">Workers on Site</label>
                <input
                  type="number"
                  min={1}
                  value={editFields.workerCount ?? 1}
                  onChange={e => setEditFields(f => ({ ...f, workerCount: parseInt(e.target.value) || 1 }))}
                  className="w-full bg-surface-panel border border-surface-border rounded px-2 py-1.5 text-gray-200 focus:outline-none focus:border-brand/60"
                />
              </div>
              <div>
                <label className="text-2xs text-gray-600 block mb-1">{t.permitDetail.validFrom}</label>
                <input
                  type="datetime-local"
                  value={editFields.validFrom ?? ''}
                  onChange={e => setEditFields(f => ({ ...f, validFrom: e.target.value }))}
                  className="w-full bg-surface-panel border border-surface-border rounded px-2 py-1.5 text-gray-200 focus:outline-none focus:border-brand/60"
                />
              </div>
              <div className="col-span-2">
                <label className="text-2xs text-gray-600 block mb-1">{t.permitDetail.validTo}</label>
                <input
                  type="datetime-local"
                  value={editFields.validTo ?? ''}
                  onChange={e => setEditFields(f => ({ ...f, validTo: e.target.value }))}
                  className="w-full bg-surface-panel border border-surface-border rounded px-2 py-1.5 text-gray-200 focus:outline-none focus:border-brand/60"
                />
              </div>
              <div className="col-span-2">
                <label className="text-2xs text-gray-600 block mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={editFields.notes ?? ''}
                  onChange={e => setEditFields(f => ({ ...f, notes: e.target.value }))}
                  className="w-full bg-surface-panel border border-surface-border rounded px-2 py-1.5 text-gray-200 focus:outline-none focus:border-brand/60 resize-none"
                  placeholder="Additional notes..."
                />
              </div>
            </div>
          ) : (
            <>
              <InfoRow label={t.permitDetail.location}   value={<span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-gray-600" />{permit.location}</span>} />
              <InfoRow label={t.permitDetail.unitArea}   value={`${permit.unit} · ${permit.area}`} />
              <InfoRow label={t.permitDetail.equipment}  value={permit.equipment} />
              <InfoRow label={t.permitDetail.validFrom}  value={<span className="font-mono">{formatDateTime(permit.validFrom)}</span>} />
              <InfoRow label={t.permitDetail.validTo}    value={<span className="font-mono">{formatDateTime(permit.validTo)}</span>} />
              <InfoRow label={t.permitDetail.simopsZone} value={<span className="font-mono">{permit.simopsZone || '—'}</span>} />
              <InfoRow label="QR / Deep Link" value={
                <button
                  className="text-brand hover:underline font-mono text-xs"
                  onClick={() => {
                    const url = `${window.location.origin}/permits?open=${permit.id}`;
                    navigator.clipboard.writeText(url).then(() => showToast('Permit link copied to clipboard.', 'info'));
                  }}
                >
                  {permit.qrCode} ↗
                </button>
              } />
              <InfoRow label={t.permitDetail.workers}    value={`${permit.workerCount} ${t.common.persons}`} />
            </>
          )}
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
                  <span className="text-2xs text-gray-600 ml-auto">by {latestGas.testedBy?.name ?? '—'}</span>
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
                {gasRecords.length > 1 && (
                  <div className="mt-3 border-t border-surface-border/60 pt-2">
                    <div className="text-2xs text-gray-600 uppercase tracking-wider font-bold mb-2">
                      Test History ({gasRecords.length} total)
                    </div>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {gasRecords.slice(0, -1).reverse().map(rec => (
                        <div key={rec.id} className="flex items-center gap-3 px-2 py-1.5 rounded bg-surface-panel border border-surface-border/60 text-xs">
                          <GasStatusBadge status={rec.overallStatus} size="sm" />
                          <span className="font-mono text-gray-500 text-2xs">{formatDateTime(rec.testedAt)}</span>
                          <span className="text-gray-600 text-2xs ml-auto">{rec.testedBy?.name ?? '—'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

        {/* Inline approval panel — only for UNDER_REVIEW permits + approvers */}
        {permit.status === 'UNDER_REVIEW' && canApprove && approvalId && (
          <div className="mb-4 p-4 rounded border border-yellow-800/60 bg-yellow-950/20">
            <div className="text-2xs font-bold uppercase tracking-widest text-yellow-500 mb-3">
              Awaiting Your Approval
            </div>
            <div className="mb-3">
              <label className="text-xs text-gray-500 mb-1 block">Comments / Conditions</label>
              <textarea
                rows={2}
                value={approvalComments}
                onChange={e => setApprovalComments(e.target.value)}
                placeholder="Enter approval comments, conditions, or rejection reason…"
                className="w-full text-xs bg-surface-panel border border-surface-border rounded px-3 py-2 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand/60 resize-none"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="success" size="sm" icon={CheckCircle2} loading={acting}
                onClick={() => handleApprovalDecision('APPROVED')}>
                Approve
              </Button>
              <Button variant="danger" size="sm" icon={XCircle} loading={acting}
                onClick={() => handleApprovalDecision('REJECTED')}>
                Reject
              </Button>
              <Button variant="warning" size="sm" loading={acting}
                onClick={() => handleApprovalDecision('REFERRED_BACK')}>
                Refer Back
              </Button>
            </div>
          </div>
        )}

        {/* Rejected: allow requester to reset to DRAFT and revise */}
        {permit.status === 'REJECTED' && canSubmit && (
          <div className="mb-4 p-4 rounded border border-red-800/60 bg-red-950/20">
            <div className="text-2xs font-bold uppercase tracking-widest text-red-400 mb-2">
              Permit Rejected
            </div>
            <p className="text-xs text-gray-400 mb-3 leading-relaxed">
              This permit was rejected by the reviewer. Address the comments above, then reset it
              to Draft to make changes and re-submit for approval.
            </p>
            <Button
              variant="secondary"
              size="sm"
              icon={Send}
              loading={acting}
              onClick={() => changeStatus('DRAFT', `Permit ${permit.permitNumber} reset to Draft for revision.`)}
            >
              Revise &amp; Re-submit
            </Button>
          </div>
        )}

        {/* Export PDF — always available */}
        <div className="flex items-center justify-end pt-2 pb-2 border-t border-surface-border">
          <Button variant="ghost" size="sm" icon={Download} loading={exporting} onClick={handleExportPDF}>
            Export PDF
          </Button>
        </div>

        {permit.status === 'SUSPENDED' && canControl && (
          <div className="flex items-center gap-2 pt-2 border-t border-surface-border flex-wrap">
            <Button variant="primary" size="sm" icon={PlayCircle} loading={acting} onClick={() => changeStatus('ACTIVE', `Permit ${permit.permitNumber} reinstated — work may resume.`)}>
              Reinstate Permit
            </Button>
            <Button variant="success" size="sm" icon={CheckCircle2} loading={acting} onClick={handleClose}>
              {t.permitDetail.closePermit}
            </Button>
          </div>
        )}

        {['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACTIVE', 'APPROVED'].includes(permit.status) && (
          <div className="flex items-center gap-2 pt-2 border-t border-surface-border flex-wrap">
            {permit.status === 'DRAFT' && canSubmit && (
              <Button variant="primary" size="sm" icon={Send} loading={acting} onClick={() => changeStatus('SUBMITTED', `Permit ${permit.permitNumber} submitted for approval.`)}>
                Submit for Approval
              </Button>
            )}
            {permit.status === 'APPROVED' && canControl && (
              <Button variant="success" size="sm" icon={PlayCircle} loading={acting} onClick={() => changeStatus('ACTIVE', `Permit ${permit.permitNumber} activated — work may commence.`)}>
                Activate Permit
              </Button>
            )}
            {permit.gasTestRequired && !['DRAFT'].includes(permit.status) && canGasTest && (
              <Button variant="secondary" size="sm" icon={Wind} onClick={() => openGasTestModal(permit.id)}>
                {t.permitDetail.gasTest}
              </Button>
            )}
            {permit.status === 'ACTIVE' && canControl && (
              <Button variant="warning" size="sm" icon={AlertTriangle} loading={acting} onClick={handleSuspend}>
                {t.permitDetail.suspend}
              </Button>
            )}
            {permit.status === 'ACTIVE' && canControl && (
              <Button variant="success" size="sm" icon={CheckCircle2} loading={acting} onClick={handleClose}>
                {t.permitDetail.closePermit}
              </Button>
            )}
            {/* Cancel — available to requester on DRAFT/SUBMITTED; to control on any open status */}
            {(['DRAFT', 'SUBMITTED'].includes(permit.status) && canSubmit) ||
             (['UNDER_REVIEW', 'APPROVED'].includes(permit.status) && canControl) ? (
              <Button variant="danger" size="sm" icon={Ban} loading={acting} onClick={handleCancel} className="ml-auto">
                Cancel Permit
              </Button>
            ) : null}
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
