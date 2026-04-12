'use client';

import { useState, useEffect } from 'react';
import { Lock, Unlock, CheckCircle2, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { PageShell, SectionHeader } from '@/components/shared/PageShell';
import { KPICard } from '@/components/shared/KPICard';
import { DataTable, Column } from '@/components/shared/DataTable';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { useAppStore } from '@/lib/store/useAppStore';
import { useT } from '@/lib/i18n/useT';
import { rbac } from '@/lib/rbac';
import { MOCK_ISOLATION_CERTS } from '@/lib/mock/isolation';
import { formatDateTime } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';
import type { IsolationCertificate, IsolationPoint, IsolationStatus } from '@/lib/types';

// ─── Create Isolation Certificate Modal ─────────────────────────────────────

interface IsoPoint {
  tag:              string;
  description:      string;
  location:         string;
  isolationType:    string;
  normalPosition:   string;
  isolatedPosition: string;
}

interface EnergySource {
  type:        string;
  description: string;
  voltage:     string;
  pressure:    string;
}

const BLANK_POINT: IsoPoint = {
  tag: '', description: '', location: '',
  isolationType: 'VALVE', normalPosition: 'OPEN', isolatedPosition: 'CLOSED',
};

const BLANK_ENERGY: EnergySource = {
  type: 'ELECTRICAL', description: '', voltage: '', pressure: '',
};

const ISO_TYPES   = ['VALVE', 'BLINDED', 'SPADE', 'DISCONNECT', 'LOCK_OUT', 'OTHER'];
const ENERGY_TYPES = ['ELECTRICAL', 'HYDRAULIC', 'PNEUMATIC', 'THERMAL', 'GRAVITY', 'STORED_MECHANICAL', 'CHEMICAL'];

interface CreateIsoModalProps {
  open:      boolean;
  onClose:   () => void;
  onCreated: (cert: IsolationCertificate) => void;
}

function CreateIsolationModal({ open, onClose, onCreated }: CreateIsoModalProps) {
  const currentUser = useAppStore(s => s.currentUser);
  const [title,         setTitle]         = useState('');
  const [permitId,      setPermitId]      = useState('');
  const [permitNumber,  setPermitNumber]  = useState('');
  const [notes,         setNotes]         = useState('');
  const [points,        setPoints]        = useState<IsoPoint[]>([{ ...BLANK_POINT }]);
  const [energies,      setEnergies]      = useState<EnergySource[]>([{ ...BLANK_ENERGY }]);
  const [permits,       setPermits]       = useState<{ id: string; permitNumber: string; title: string }[]>([]);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');

  const inputCls = "w-full text-xs bg-surface-panel border border-surface-border rounded px-3 py-2 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand/60";

  useEffect(() => {
    if (!open) return;
    fetch('/api/permits?status=ACTIVE,APPROVED&pageSize=50')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.data) setPermits(d.data.map((p: { id: string; permitNumber: string; title: string }) => ({ id: p.id, permitNumber: p.permitNumber, title: p.title })));
      })
      .catch(() => {});
  }, [open]);

  const handleClose = () => {
    setTitle(''); setPermitId(''); setPermitNumber(''); setNotes('');
    setPoints([{ ...BLANK_POINT }]); setEnergies([{ ...BLANK_ENERGY }]);
    setError('');
    onClose();
  };

  const updatePoint  = (i: number, f: Partial<IsoPoint>)  => setPoints(ps  => ps.map((p, j)  => j === i ? { ...p, ...f }  : p));
  const updateEnergy = (i: number, f: Partial<EnergySource>) => setEnergies(es => es.map((e, j) => j === i ? { ...e, ...f } : e));

  const handleSubmit = async () => {
    if (!permitId)       { setError('Please select a permit.'); return; }
    if (!title.trim())   { setError('Title is required.'); return; }
    const validPoints = points.filter(p => p.tag.trim() && p.description.trim());
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/isolation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          permitId,
          title: title.trim(),
          issuedById: currentUser?.id ?? 'usr-001',
          notes: notes.trim(),
          isolationPoints: validPoints,
          energySources: energies
            .filter(e => e.type && e.description.trim())
            .map(e => ({
              type:        e.type,
              description: e.description.trim(),
              voltage:     e.voltage  ? parseFloat(e.voltage)  : undefined,
              pressure:    e.pressure ? parseFloat(e.pressure) : undefined,
            })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to create certificate.'); return; }
      onCreated(data as IsolationCertificate);
      handleClose();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create Isolation Certificate"
      subtitle="Energy isolation / LOTO for permit to work"
      size="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" size="sm" icon={Lock} loading={loading} onClick={handleSubmit}>
            Issue Certificate
          </Button>
        </>
      }
    >
      <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
        {error && (
          <div className="text-xs text-red-400 bg-red-950/30 border border-red-800 rounded px-3 py-2">{error}</div>
        )}

        {/* Permit + Title */}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 sm:col-span-1">
            <label className="text-xs text-gray-500 mb-1 block">Permit *</label>
            <select
              value={permitId}
              onChange={e => {
                const p = permits.find(x => x.id === e.target.value);
                setPermitId(e.target.value);
                setPermitNumber(p?.permitNumber ?? '');
              }}
              className={inputCls}
            >
              <option value="">— Select active permit —</option>
              {permits.map(p => (
                <option key={p.id} value={p.id}>{p.permitNumber} — {p.title}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="text-xs text-gray-500 mb-1 block">Certificate Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. CDU Pump P-101 isolation" className={inputCls} />
          </div>
        </div>

        {/* Isolation Points */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Isolation Points</label>
            <button
              onClick={() => setPoints(ps => [...ps, { ...BLANK_POINT }])}
              className="text-2xs text-brand hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add Point
            </button>
          </div>
          <div className="space-y-3">
            {points.map((pt, i) => (
              <div key={i} className="p-3 rounded border border-surface-border bg-surface-panel space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-bold text-gray-500 uppercase">Point {i + 1}</span>
                  {points.length > 1 && (
                    <button onClick={() => setPoints(ps => ps.filter((_, j) => j !== i))} className="text-gray-600 hover:text-red-400">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-2xs text-gray-600 block mb-0.5">Tag / ID *</label>
                    <input value={pt.tag} onChange={e => updatePoint(i, { tag: e.target.value })} placeholder="V-101A" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-2xs text-gray-600 block mb-0.5">Type</label>
                    <select value={pt.isolationType} onChange={e => updatePoint(i, { isolationType: e.target.value })} className={inputCls}>
                      {ISO_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-2xs text-gray-600 block mb-0.5">Description *</label>
                    <input value={pt.description} onChange={e => updatePoint(i, { description: e.target.value })} placeholder="Suction valve to pump P-101" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-2xs text-gray-600 block mb-0.5">Location</label>
                    <input value={pt.location} onChange={e => updatePoint(i, { location: e.target.value })} placeholder="CDU Bay 2, NW" className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-2xs text-gray-600 block mb-0.5">Normal Pos.</label>
                      <select value={pt.normalPosition} onChange={e => updatePoint(i, { normalPosition: e.target.value })} className={inputCls}>
                        {['OPEN','CLOSED','ENERGISED','DE-ENERGISED'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-2xs text-gray-600 block mb-0.5">Isolated Pos.</label>
                      <select value={pt.isolatedPosition} onChange={e => updatePoint(i, { isolatedPosition: e.target.value })} className={inputCls}>
                        {['CLOSED','OPEN','DE-ENERGISED','ENERGISED','BLINDED'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Energy Sources */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Energy Sources</label>
            <button
              onClick={() => setEnergies(es => [...es, { ...BLANK_ENERGY }])}
              className="text-2xs text-brand hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add Energy Source
            </button>
          </div>
          <div className="space-y-2">
            {energies.map((en, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 p-2.5 rounded border border-surface-border bg-surface-panel items-end">
                <div>
                  <label className="text-2xs text-gray-600 block mb-0.5">Type</label>
                  <select value={en.type} onChange={e => updateEnergy(i, { type: e.target.value })} className={inputCls}>
                    {ENERGY_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-2xs text-gray-600 block mb-0.5">Description</label>
                  <input value={en.description} onChange={e => updateEnergy(i, { description: e.target.value })} placeholder="480V MCC Feeder" className={inputCls} />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1">
                    <label className="text-2xs text-gray-600 block mb-0.5">{en.type === 'HYDRAULIC' || en.type === 'PNEUMATIC' ? 'Pressure (bar)' : 'Voltage (V)'}</label>
                    <input
                      type="number"
                      value={en.type === 'HYDRAULIC' || en.type === 'PNEUMATIC' ? en.pressure : en.voltage}
                      onChange={e => {
                        const f = en.type === 'HYDRAULIC' || en.type === 'PNEUMATIC' ? 'pressure' : 'voltage';
                        updateEnergy(i, { [f]: e.target.value });
                      }}
                      placeholder="0"
                      className={inputCls}
                    />
                  </div>
                  {energies.length > 1 && (
                    <button onClick={() => setEnergies(es => es.filter((_, j) => j !== i))} className="text-gray-600 hover:text-red-400 mt-4">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Additional isolation notes, special precautions…"
            rows={2}
            className={cn(inputCls, 'resize-none')}
          />
        </div>
      </div>
    </Modal>
  );
}

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
  const showToast       = useAppStore(s => s.showToast);
  const dataVersion     = useAppStore(s => s.dataVersion);
  const bumpDataVersion = useAppStore(s => s.bumpDataVersion);
  const currentUser     = useAppStore(s => s.currentUser);
  const [certs, setCerts]               = useState(MOCK_ISOLATION_CERTS);
  const [acting, setActing]             = useState<string | null>(null); // certId currently updating
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const loadCerts = () => {
    fetch('/api/isolation?active=true')
      .then(r => r.ok ? r.json() : null)
      .then(json => { if (json?.data?.length) setCerts(json.data); })
      .catch(() => { /* keep mock */ });
  };

  useEffect(() => {
    loadCerts();
    const interval = setInterval(loadCerts, 30_000);
    return () => clearInterval(interval);
  }, [dataVersion]);

  const changeIsoStatus = async (certId: string, status: string, successMsg: string) => {
    setActing(certId);
    try {
      const res = await fetch(`/api/isolation/${certId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showToast(successMsg, 'success');
        loadCerts();
        bumpDataVersion();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || 'Action failed. Please try again.', 'error');
      }
    } catch {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setActing(null);
    }
  };

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

  const canCreate = rbac.canControlPermit(currentUser?.role) ||
    currentUser?.role === 'ISOLATION_AUTHORITY' ||
    currentUser?.role === 'SYSTEM_ADMIN';

  return (
    <PageShell
      title={t.isolation.title}
      subtitle={t.isolation.subtitle}
      actions={canCreate ? (
        <Button variant="primary" size="sm" icon={Plus} onClick={() => setCreateModalOpen(true)}>
          Create Certificate
        </Button>
      ) : undefined}
    >
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
                  <Button
                    variant="warning"
                    size="xs"
                    icon={CheckCircle2}
                    loading={acting === cert.id}
                    onClick={() => changeIsoStatus(cert.id, 'VERIFIED', `Isolation ${cert.certificateNumber} verified.`)}
                  >
                    {t.isolation.verifyIsolation}
                  </Button>
                )}
                {cert.status === 'VERIFIED' && (
                  <Button
                    variant="danger"
                    size="xs"
                    icon={Unlock}
                    loading={acting === cert.id}
                    onClick={() => changeIsoStatus(cert.id, 'RELEASED', `Isolation ${cert.certificateNumber} released.`)}
                  >
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

      <CreateIsolationModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={(cert) => {
          setCerts(prev => [cert as unknown as IsolationCertificate, ...prev]);
          bumpDataVersion();
          showToast(`Isolation certificate ${cert.certificateNumber} issued.`, 'success');
        }}
      />
    </PageShell>
  );
}
