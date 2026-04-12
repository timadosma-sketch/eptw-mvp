'use client';

import { useState, useEffect } from 'react';
import {
  ShieldCheck, TrendingUp, TrendingDown, AlertTriangle, Plus,
  CheckCircle2, Clock, XCircle, FileWarning,
} from 'lucide-react';
import { PageShell, SectionHeader } from '@/components/shared/PageShell';
import { KPICard } from '@/components/shared/KPICard';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { useAppStore } from '@/lib/store/useAppStore';
import { useT } from '@/lib/i18n/useT';
import { rbac } from '@/lib/rbac';
import { MOCK_DASHBOARD_METRICS } from '@/lib/mock/dashboard';
import { formatRelative, formatDateTime } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';

// ─── Types ─────────────────────────────────────────────────────────────────

type IncidentType = 'NEAR_MISS' | 'FIRST_AID' | 'RECORDABLE' | 'LTI' | 'UNSAFE_ACT' | 'UNSAFE_CONDITION';
type IncidentStatus = 'OPEN' | 'UNDER_INVESTIGATION' | 'CLOSED';

interface HSEIncident {
  id:               string;
  type:             IncidentType;
  description:      string;
  location:         string;
  immediateActions: string;
  injuries:         string;
  status:           IncidentStatus;
  reportedBy:       string;
  reportedAt:       string;
  closedAt?:        string;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const INCIDENT_TYPES: { value: IncidentType; label: string; color: string }[] = [
  { value: 'NEAR_MISS',         label: 'Near Miss',          color: 'text-yellow-400 bg-yellow-900/30 border-yellow-800'  },
  { value: 'UNSAFE_ACT',        label: 'Unsafe Act',         color: 'text-orange-400 bg-orange-900/30 border-orange-800'  },
  { value: 'UNSAFE_CONDITION',  label: 'Unsafe Condition',   color: 'text-orange-400 bg-orange-900/30 border-orange-800'  },
  { value: 'FIRST_AID',         label: 'First Aid',          color: 'text-orange-400 bg-orange-900/30 border-orange-800'  },
  { value: 'RECORDABLE',        label: 'Recordable Incident',color: 'text-red-400 bg-red-900/30 border-red-800'           },
  { value: 'LTI',               label: 'Lost Time Incident', color: 'text-red-500 bg-red-950/60 border-red-700'           },
];

const TYPE_COLOR: Record<IncidentType, string> = {
  NEAR_MISS:        'text-yellow-400 bg-yellow-900/30 border-yellow-800',
  UNSAFE_ACT:       'text-orange-400 bg-orange-900/30 border-orange-800',
  UNSAFE_CONDITION: 'text-orange-400 bg-orange-900/30 border-orange-800',
  FIRST_AID:        'text-orange-400 bg-orange-900/30 border-orange-800',
  RECORDABLE:       'text-red-400 bg-red-900/30 border-red-800',
  LTI:              'text-red-500 bg-red-950/60 border-red-700',
};

const STATUS_COLOR: Record<IncidentStatus, string> = {
  OPEN:                'text-yellow-400',
  UNDER_INVESTIGATION: 'text-orange-400',
  CLOSED:              'text-emerald-400',
};

const HSE_KPIS = [
  { label: 'Total Recordable Rate', value: '0.00', unit: 'TRIR', trend: 'down'  as const },
  { label: 'Lost Time Incidents',   value: '0',    unit: 'LTIs YTD', trend: 'same' as const },
  { label: 'Near Misses YTD',       value: '12',   unit: 'reported', trend: 'up'   as const },
  { label: 'Unsafe Acts/Cond.',     value: '4',    unit: 'open',     trend: 'down' as const },
];

// ─── Incident Report Modal ──────────────────────────────────────────────────

interface IncidentModalProps {
  open:      boolean;
  onClose:   () => void;
  onSuccess: (incident: HSEIncident) => void;
}

function IncidentReportModal({ open, onClose, onSuccess }: IncidentModalProps) {
  const currentUser = useAppStore(s => s.currentUser);
  const [type,             setType]             = useState<IncidentType>('NEAR_MISS');
  const [description,      setDescription]      = useState('');
  const [location,         setLocation]         = useState('');
  const [immediateActions, setImmediateActions] = useState('');
  const [injuries,         setInjuries]         = useState('');
  const [loading,          setLoading]          = useState(false);
  const [error,            setError]            = useState('');

  const handleClose = () => {
    setType('NEAR_MISS');
    setDescription(''); setLocation('');
    setImmediateActions(''); setInjuries('');
    setError('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!description.trim()) { setError('Description is required.'); return; }
    if (!location.trim())    { setError('Location is required.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/hse', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          type, description, location, immediateActions, injuries,
          reportedById: currentUser?.id ?? 'usr-001',
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to report incident.'); return; }
      onSuccess(data as HSEIncident);
      handleClose();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full text-xs bg-surface-panel border border-surface-border rounded px-3 py-2 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand/60";

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Report HSE Incident"
      subtitle="Report near miss, unsafe conditions, or incidents"
      size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" size="sm" loading={loading} onClick={handleSubmit}>Submit Report</Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="text-xs text-red-400 bg-red-950/30 border border-red-800 rounded px-3 py-2">
            {error}
          </div>
        )}

        {/* Incident Type */}
        <div>
          <label className="text-xs text-gray-500 mb-2 block">Incident Type *</label>
          <div className="grid grid-cols-2 gap-2">
            {INCIDENT_TYPES.map(opt => (
              <button
                key={opt.value}
                onClick={() => setType(opt.value)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded border text-xs font-medium transition-all text-left',
                  type === opt.value
                    ? opt.color
                    : 'border-surface-border bg-surface-panel text-gray-500 hover:bg-surface-hover',
                )}
              >
                <FileWarning className="w-3.5 h-3.5 flex-shrink-0" />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Location *</label>
          <input
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="e.g. CDU Bay 2, North platform"
            className={inputCls}
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Description *</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe what happened, sequence of events, contributing factors…"
            rows={3}
            className={cn(inputCls, 'resize-none')}
          />
        </div>

        {/* Immediate Actions */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Immediate Actions Taken</label>
          <textarea
            value={immediateActions}
            onChange={e => setImmediateActions(e.target.value)}
            placeholder="Area secured, work stopped, first aid given, supervisor notified…"
            rows={2}
            className={cn(inputCls, 'resize-none')}
          />
        </div>

        {/* Injuries */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Injuries / Medical Treatment</label>
          <input
            value={injuries}
            onChange={e => setInjuries(e.target.value)}
            placeholder="NIL — or describe injury and treatment…"
            className={inputCls}
          />
        </div>

        {/* Severity guidance */}
        <div className="p-3 rounded border border-surface-border bg-surface-panel text-2xs text-gray-600 space-y-1">
          <div className="font-semibold text-gray-500 mb-1">Classification Guide</div>
          <div><span className="text-yellow-400">Near Miss</span> — Potential hazard, no injury/damage</div>
          <div><span className="text-orange-400">First Aid</span> — Minor injury, treated on site</div>
          <div><span className="text-red-400">Recordable</span> — Medical treatment beyond first aid</div>
          <div><span className="text-red-500">LTI</span> — Lost time, restricted work, or fatality</div>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export function HSEPage() {
  const { t } = useT();
  const showToast   = useAppStore(s => s.showToast);
  const currentUser = useAppStore(s => s.currentUser);
  const dataVersion = useAppStore(s => s.dataVersion);

  const canReport = rbac.canApprove(currentUser?.role) || currentUser?.role === 'HSE_OFFICER' || currentUser?.role === 'SITE_SUPERVISOR';

  const [m, setM]                 = useState(MOCK_DASHBOARD_METRICS);
  const [incidents, setIncidents] = useState<HSEIncident[]>([]);
  const [reportOpen, setReportOpen] = useState(false);
  const [closingId, setClosingId] = useState<string | null>(null);

  const loadData = () => {
    fetch('/api/dashboard')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.metrics) setM(d.metrics); })
      .catch(() => {});

    fetch('/api/hse')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data) setIncidents(d.data as HSEIncident[]); })
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
    const id = setInterval(loadData, 30_000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataVersion]);

  const handleIncidentCreated = (incident: HSEIncident) => {
    setIncidents(prev => [incident, ...prev]);
    showToast(`Incident ${incident.id} reported.`, 'warning');
  };

  const handleCloseIncident = async (id: string) => {
    setClosingId(id);
    try {
      const res = await fetch('/api/hse', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id, status: 'CLOSED' }),
      });
      if (res.ok) {
        setIncidents(prev => prev.map(i => i.id === id ? { ...i, status: 'CLOSED' } : i));
        showToast('Incident closed.', 'success');
      }
    } catch { /* silent */ }
    finally { setClosingId(null); }
  };

  const handleInvestigateIncident = async (id: string) => {
    setClosingId(id);
    try {
      const res = await fetch('/api/hse', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id, status: 'UNDER_INVESTIGATION' }),
      });
      if (res.ok) {
        setIncidents(prev => prev.map(i => i.id === id ? { ...i, status: 'UNDER_INVESTIGATION' } : i));
        showToast('Incident marked under investigation.', 'info');
      }
    } catch { /* silent */ }
    finally { setClosingId(null); }
  };

  // Derived KPIs from live incident data
  const openCount    = incidents.filter(i => i.status !== 'CLOSED').length;
  const ltiCount     = incidents.filter(i => i.type === 'LTI').length;
  const nearMissYTD  = incidents.filter(i => i.type === 'NEAR_MISS').length;
  const unsafeCount  = incidents.filter(i => ['UNSAFE_ACT', 'UNSAFE_CONDITION'].includes(i.type) && i.status !== 'CLOSED').length;

  return (
    <>
      <PageShell
        title={t.hse.title}
        subtitle={t.hse.subtitle}
        actions={
          canReport ? (
            <Button variant="warning" size="sm" icon={Plus} onClick={() => setReportOpen(true)}>
              Report Incident
            </Button>
          ) : undefined
        }
      >
        <div className="space-y-6">

          {/* Safety Score Hero */}
          <div className="flex items-center gap-6 px-6 py-5 rounded-md border border-emerald-800/50 bg-emerald-950/20">
            <ShieldCheck className="w-12 h-12 text-emerald-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-2xs text-emerald-600 uppercase tracking-wider font-bold mb-1">
                {t.hse.safetyScoreLabel}
              </div>
              <div className="text-5xl font-bold text-emerald-400 font-mono">{m.safetyScore}</div>
              <div className="text-xs text-emerald-600 mt-1">{t.hse.safetyScoreDesc}</div>
            </div>
            <div className="text-right">
              <div className="text-2xs text-gray-500 mb-1">{t.hse.daysWithoutIncident}</div>
              <div className="text-4xl font-bold text-brand font-mono">{m.daysWithoutIncident}</div>
              <div className="text-xs text-gray-600">{t.hse.consecutiveDays}</div>
            </div>
          </div>

          {/* Live KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard label="Open Incidents"       value={openCount}    icon={AlertTriangle}  variant={openCount > 0 ? 'warning' : 'success'} />
            <KPICard label="Near Misses YTD"      value={nearMissYTD}  icon={FileWarning}    variant="default" />
            <KPICard label="LTIs YTD"             value={ltiCount}     icon={XCircle}        variant={ltiCount > 0 ? 'danger' : 'default'} />
            <KPICard label="Open Unsafe Acts"     value={unsafeCount}  icon={AlertTriangle}  variant={unsafeCount > 0 ? 'warning' : 'default'} />
          </div>

          {/* Static industry KPIs */}
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

          {/* Live Incident Register */}
          <div>
            <SectionHeader
              title={t.hse.incidentRegister}
              subtitle={incidents.length > 0 ? `${incidents.length} total · ${openCount} open` : t.hse.incidentSubtitle}
            />

            {incidents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 rounded-md border border-surface-border bg-surface-card">
                <ShieldCheck className="w-10 h-10 text-emerald-500 opacity-60" />
                <div className="text-xs text-gray-500 text-center">
                  No incidents reported. Use the <span className="text-brand font-semibold">Report Incident</span> button to log near misses and unsafe conditions.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {incidents.map(inc => (
                  <div
                    key={inc.id}
                    className={cn(
                      'flex items-start gap-4 px-4 py-3.5 rounded-md border bg-surface-card',
                      inc.status === 'OPEN'                ? 'border-yellow-800/50' :
                      inc.status === 'UNDER_INVESTIGATION' ? 'border-orange-800/50' :
                      'border-surface-border opacity-60',
                    )}
                  >
                    {/* Type badge */}
                    <div className="mt-0.5">
                      <span className={cn('text-2xs px-2 py-0.5 rounded border font-semibold whitespace-nowrap', TYPE_COLOR[inc.type])}>
                        {INCIDENT_TYPES.find(t_ => t_.value === inc.type)?.label ?? inc.type.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-200">{inc.description}</div>
                      <div className="text-2xs text-gray-500 mt-0.5 flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-brand">{inc.id}</span>
                        <span>📍 {inc.location}</span>
                        <span>By {inc.reportedBy}</span>
                        <span>{formatRelative(inc.reportedAt)}</span>
                      </div>
                      {inc.immediateActions && (
                        <div className="text-2xs text-gray-600 mt-1">
                          <span className="text-brand">Actions:</span> {inc.immediateActions}
                        </div>
                      )}
                    </div>

                    {/* Status + Actions */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={cn('text-2xs font-bold uppercase', STATUS_COLOR[inc.status])}>
                        {inc.status.replace('_', ' ')}
                      </span>
                      {inc.status === 'OPEN' && canReport && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleInvestigateIncident(inc.id)}
                            disabled={closingId === inc.id}
                            className="text-2xs border border-orange-700 text-orange-400 rounded px-2 py-1 hover:bg-orange-900/40 transition-colors disabled:opacity-50"
                          >
                            Investigate
                          </button>
                          <button
                            onClick={() => handleCloseIncident(inc.id)}
                            disabled={closingId === inc.id}
                            className="text-2xs border border-emerald-700 text-emerald-400 rounded px-2 py-1 hover:bg-emerald-900/40 transition-colors disabled:opacity-50"
                          >
                            Close
                          </button>
                        </div>
                      )}
                      {inc.status === 'UNDER_INVESTIGATION' && canReport && (
                        <button
                          onClick={() => handleCloseIncident(inc.id)}
                          disabled={closingId === inc.id}
                          className="text-2xs border border-emerald-700 text-emerald-400 rounded px-2 py-1 hover:bg-emerald-900/40 transition-colors disabled:opacity-50"
                        >
                          Close
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gas Test Compliance */}
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

          {/* Incident trend mini-chart */}
          {incidents.length >= 3 && (
            <div>
              <SectionHeader title="INCIDENT TREND" subtitle="Last 10 incidents by type" />
              <div className="p-4 rounded-md border border-surface-border bg-surface-card">
                <div className="flex items-end gap-1 h-16">
                  {incidents.slice(0, 10).reverse().map((inc, i) => {
                    const isLTI       = inc.type === 'LTI';
                    const isRecordable = inc.type === 'RECORDABLE';
                    const isFirstAid  = inc.type === 'FIRST_AID';
                    const barColor    = isLTI ? 'bg-red-500' : isRecordable ? 'bg-red-400/70' : isFirstAid ? 'bg-orange-400/70' : 'bg-yellow-400/70';
                    const barH        = isLTI ? 56 : isRecordable ? 44 : isFirstAid ? 32 : 20;
                    return (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center gap-0.5"
                        title={`${inc.id} — ${inc.type.replace('_', ' ')} — ${inc.location}`}
                      >
                        <div className={cn('w-full rounded-t transition-all', barColor)} style={{ height: `${barH}px` }} />
                        <span className="text-2xs text-gray-700 font-mono truncate w-full text-center">
                          {new Date(inc.reportedAt).toLocaleDateString('en', { month: 'numeric', day: 'numeric' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-3 text-2xs text-gray-600">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" /> LTI</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-400/70 inline-block" /> Recordable</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-orange-400/70 inline-block" /> First Aid</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-yellow-400/70 inline-block" /> Near Miss / Unsafe</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </PageShell>

      <IncidentReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSuccess={handleIncidentCreated}
      />
    </>
  );
}
