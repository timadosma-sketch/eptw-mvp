'use client';

import { useState, useEffect } from 'react';
import { Wind, AlertTriangle, CheckCircle2, Clock, Plus } from 'lucide-react';
import { PageShell, SectionHeader } from '@/components/shared/PageShell';
import { KPICard } from '@/components/shared/KPICard';
import { DataTable, Column } from '@/components/shared/DataTable';
import { GasStatusBadge } from '@/components/shared/StatusBadge';
import { AlertStrip } from '@/components/shared/AlertStrip';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { useT } from '@/lib/i18n/useT';
import { useAppStore } from '@/lib/store/useAppStore';
import { rbac } from '@/lib/rbac';
import { MOCK_GAS_RECORDS, MOCK_GAS_ALERTS } from '@/lib/mock/gas';
import { GAS_THRESHOLDS } from '@/lib/constants';
import { formatDateTime, formatRelative } from '@/lib/utils/formatters';
import { classifyGasReading } from '@/lib/services/gasService';
import { cn } from '@/lib/utils/cn';
import type { GasTestRecord, GasType } from '@/lib/types';

interface GasGaugeProps {
  gasType: GasType;
  value: number;
}

function GasGauge({ gasType, value }: GasGaugeProps) {
  const threshold = GAS_THRESHOLDS[gasType];
  const status    = classifyGasReading(gasType, value);

  const maxDisplay = gasType === 'O2'  ? 25
    : gasType === 'LEL' ? 30
    : gasType === 'H2S' ? 15
    : gasType === 'CO'  ? 60
    : 300;

  const pct = Math.min(100, (value / maxDisplay) * 100);
  const barColor  = status === 'SAFE' ? 'bg-emerald-500' : status === 'WARNING' ? 'bg-yellow-500' : 'bg-red-500';
  const textColor = status === 'SAFE' ? 'text-emerald-400' : status === 'WARNING' ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">{threshold.displayLabel}</span>
        <span className={cn('font-mono font-bold', textColor)}>
          {value.toFixed(1)} {threshold.unit}
        </span>
      </div>
      <div className="h-2 bg-surface-panel rounded-full overflow-hidden border border-surface-border">
        <div className={cn('h-full rounded-full transition-all duration-500', barColor)} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between text-2xs text-gray-600">
        <span>0</span>
        <GasStatusBadge status={status} size="sm" />
        <span>{maxDisplay} {threshold.unit}</span>
      </div>
    </div>
  );
}

interface GasEntryModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function GasEntryModal({ open, onClose, onSuccess }: GasEntryModalProps) {
  const { t } = useT();
  const currentUser = useAppStore(s => s.currentUser);
  const [readings, setReadings] = useState<Record<GasType, string>>({
    O2: '', LEL: '', H2S: '', CO: '', VOC: '',
  });
  const [location,     setLocation]     = useState('');
  const [permitId,     setPermitId]     = useState('');
  const [permitNumber, setPermitNumber] = useState('');
  const [permits,      setPermits]      = useState<{ id: string; permitNumber: string; title: string }[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');

  const inputCls = "w-full text-xs bg-surface-panel border border-surface-border rounded px-3 py-2 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand/60";

  useEffect(() => {
    if (!open) return;
    fetch('/api/permits?status=ACTIVE,APPROVED&pageSize=50')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data) setPermits(d.data.map((p: any) => ({ id: p.id, permitNumber: p.permitNumber, title: p.title }))); })
      .catch(() => {});
  }, [open]);

  const handleSubmit = async () => {
    if (!permitId) { setError('Please select a permit.'); return; }
    if (!location.trim()) { setError('Location is required.'); return; }
    const filledReadings = (Object.entries(readings) as [GasType, string][])
      .filter(([, v]) => v !== '')
      .map(([gasType, v]) => ({
        gasType,
        value:    parseFloat(v),
        unit:     gasType === 'O2' ? '%' : gasType === 'LEL' ? '%LEL' : 'ppm',
        location: location.trim(),
        instrument: 'Multi-Gas Detector',
        instrumentCalibrationDate: new Date().toISOString(),
      }));
    if (filledReadings.length === 0) { setError('Enter at least one reading.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/gas-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permitId, permitNumber, testerId: currentUser?.id ?? 'usr-004', location: location.trim(), readings: filledReadings }),
      });
      if (!res.ok) throw new Error('Failed');
      setReadings({ O2: '', LEL: '', H2S: '', CO: '', VOC: '' });
      setLocation(''); setPermitId(''); setPermitNumber('');
      onSuccess();
      onClose();
    } catch {
      setError('Failed to submit gas test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.gas.recordGasTest}
      subtitle={t.gas.enterReadings}
      size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>{t.common.cancel}</Button>
          <Button variant="primary" size="sm" loading={loading} onClick={handleSubmit}>{t.common.recordTest}</Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <div className="text-xs text-red-400 bg-red-950/30 border border-red-800 rounded px-3 py-2">{error}</div>}
        <div>
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
        <div>
          <label className="text-xs text-gray-500 mb-1 block">{t.gas.testLocation} *</label>
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder={t.gas.testLocationPlaceholder} className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(Object.entries(GAS_THRESHOLDS) as [GasType, typeof GAS_THRESHOLDS[GasType]][]).map(([type, threshold]) => {
            const val    = parseFloat(readings[type]);
            const status = !isNaN(val) ? classifyGasReading(type, val) : 'UNKNOWN';
            return (
              <div key={type}>
                <label className="text-xs text-gray-500 mb-1 flex items-center justify-between">
                  <span>{threshold.displayLabel}</span>
                  {!isNaN(val) && <GasStatusBadge status={status} size="sm" />}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={readings[type]}
                    onChange={e => setReadings(r => ({ ...r, [type]: e.target.value }))}
                    placeholder={`0.0 ${threshold.unit}`}
                    className={cn(
                      inputCls,
                      !isNaN(val) && status === 'DANGER'  && 'border-red-700 bg-red-950/30',
                      !isNaN(val) && status === 'WARNING' && 'border-yellow-700 bg-yellow-950/20',
                    )}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-2xs text-gray-600">{threshold.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-3 rounded border border-surface-border bg-surface-panel text-xs text-gray-500">
          <div className="font-semibold text-gray-400 mb-1">{t.gas.safeLimitsRef}</div>
          <div className="grid grid-cols-2 gap-1 text-2xs font-mono">
            <span>O₂: 19.5–23.5%</span>
            <span>LEL: &lt;5%</span>
            <span>H₂S: &lt;1 ppm</span>
            <span>CO: &lt;20 ppm</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export function GasTestingPage() {
  const { t } = useT();
  const currentUser = useAppStore(s => s.currentUser);
  const dataVersion    = useAppStore(s => s.dataVersion);
  const bumpDataVersion = useAppStore(s => s.bumpDataVersion);
  const canTest         = rbac.canRecordGasTest(currentUser?.role);
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [gasRecords, setGasRecords] = useState(MOCK_GAS_RECORDS);
  const [gasAlerts, setGasAlerts] = useState(MOCK_GAS_ALERTS);

  const loadGasData = () => {
    fetch('/api/gas-tests')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data?.length) setGasRecords(d.data); })
      .catch(() => {});
    fetch('/api/gas-tests?alerts=true')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data?.length) setGasAlerts(d.data); })
      .catch(() => {});
  };

  useEffect(() => {
    const load = () => { loadGasData(); };
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [dataVersion]);

  const activeAlerts = gasAlerts.filter(a => !a.acknowledged);
  const safeCount    = gasRecords.filter(r => r.overallStatus === 'SAFE').length;
  const dangerCount  = gasRecords.filter(r => r.overallStatus === 'DANGER').length;
  const warningCount = gasRecords.filter(r => r.overallStatus === 'WARNING').length;

  const latestRecord = gasRecords
    .filter(r => r.overallStatus === 'SAFE')
    .sort((a, b) => new Date(b.testedAt).getTime() - new Date(a.testedAt).getTime())[0];

  const GAS_RECORD_COLUMNS: Column<GasTestRecord>[] = [
    {
      key: 'permit',
      header: t.gas.permit,
      width: '140px',
      render: r => <span className="font-mono text-xs font-bold text-brand">{r.permitNumber}</span>,
    },
    {
      key: 'location',
      header: t.gas.testLocation,
      render: r => <span className="text-xs text-gray-300">{r.location}</span>,
    },
    {
      key: 'status',
      header: t.gas.result,
      width: '90px',
      render: r => <GasStatusBadge status={r.overallStatus} />,
    },
    {
      key: 'tester',
      header: t.gas.tester,
      width: '130px',
      render: r => <span className="text-xs text-gray-400">{r.testedBy.name}</span>,
    },
    {
      key: 'time',
      header: t.gas.tested,
      width: '150px',
      render: r => (
        <div>
          <div className="text-xs font-mono text-gray-400">{formatDateTime(r.testedAt)}</div>
          <div className="text-2xs text-gray-600">{formatRelative(r.testedAt)}</div>
        </div>
      ),
    },
    {
      key: 'readings',
      header: t.gas.readings,
      width: '200px',
      render: r => (
        <div className="flex items-center gap-2 flex-wrap">
          {r.readings.map(reading => (
            <span key={reading.id} className={cn(
              'text-2xs font-mono px-1.5 py-0.5 rounded border',
              reading.status === 'SAFE'    && 'bg-emerald-900/40 text-emerald-400 border-emerald-800',
              reading.status === 'WARNING' && 'bg-yellow-900/40 text-yellow-400 border-yellow-800',
              reading.status === 'DANGER'  && 'bg-red-900/40 text-red-400 border-red-800',
            )}>
              {reading.gasType}: {reading.value}{reading.unit}
            </span>
          ))}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageShell
        title={t.gas.title}
        subtitle={t.gas.subtitle}
        actions={
          canTest ? (
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setEntryModalOpen(true)}>
              {t.gas.recordTest}
            </Button>
          ) : undefined
        }
      >
        <div className="space-y-6">

          {activeAlerts.length > 0 && (
            <div className="space-y-2">
              {activeAlerts.map(a => (
                <AlertStrip
                  key={a.id}
                  alert={a}
                  onAcknowledge={async (id) => {
                    try {
                      const res = await fetch(`/api/gas-tests/alerts/${id}`, { method: 'PATCH' });
                      if (res.ok) { loadGasData(); bumpDataVersion(); }
                    } catch { /* silent */ }
                  }}
                />
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard label={t.gas.testsToday}    value={gasRecords.length} icon={Wind}          variant="default" />
            <KPICard label={t.gas.allSafe}        value={safeCount}               icon={CheckCircle2}  variant="success" />
            <KPICard label={t.gas.warnings}       value={warningCount}            icon={Clock}          variant={warningCount > 0 ? 'warning' : 'default'} />
            <KPICard label={t.gas.exceedances}    value={dangerCount}             icon={AlertTriangle}  variant={dangerCount > 0 ? 'danger' : 'default'} pulse={dangerCount > 0} />
          </div>

          {/* Gas Test Result Timeline */}
          {gasRecords.length > 0 && (
            <div>
              <SectionHeader
                title="TEST RESULT TIMELINE"
                subtitle={`Last ${Math.min(gasRecords.length, 20)} tests — ${gasRecords.length > 0 ? `${Math.round((safeCount / gasRecords.length) * 100)}% pass rate` : ''}`}
              />
              <div className="p-4 rounded-md border border-surface-border bg-surface-card">
                {/* Pass-rate progress bar */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs text-gray-500 w-20 flex-shrink-0">Pass Rate</span>
                  <div className="flex-1 h-2 bg-surface-panel rounded-full overflow-hidden border border-surface-border">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        safeCount / Math.max(gasRecords.length, 1) >= 0.9 ? 'bg-emerald-500' :
                        safeCount / Math.max(gasRecords.length, 1) >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                      )}
                      style={{ width: `${Math.round((safeCount / Math.max(gasRecords.length, 1)) * 100)}%` }}
                    />
                  </div>
                  <span className={cn(
                    'text-xs font-mono font-bold w-10 text-right',
                    safeCount / Math.max(gasRecords.length, 1) >= 0.9 ? 'text-emerald-400' :
                    safeCount / Math.max(gasRecords.length, 1) >= 0.7 ? 'text-yellow-400' : 'text-red-400',
                  )}>
                    {Math.round((safeCount / Math.max(gasRecords.length, 1)) * 100)}%
                  </span>
                </div>

                {/* Dot timeline — last 20 tests chronologically (oldest left) */}
                <div className="flex items-end gap-1">
                  {[...gasRecords].slice(0, 20).reverse().map((r, i) => {
                    const dotColor = r.overallStatus === 'SAFE'    ? 'bg-emerald-500' :
                                     r.overallStatus === 'WARNING' ? 'bg-yellow-500'  : 'bg-red-500';
                    const barH     = r.overallStatus === 'SAFE'    ? 28 :
                                     r.overallStatus === 'WARNING' ? 44 : 60;
                    return (
                      <div
                        key={r.id}
                        className="flex-1 flex flex-col items-center gap-1"
                        title={`${r.permitNumber} · ${r.overallStatus} · ${new Date(r.testedAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}`}
                      >
                        <div className={cn('w-full rounded-t', dotColor)} style={{ height: `${barH}px`, minWidth: '6px' }} />
                        <span className="text-2xs text-gray-700 font-mono hidden xl:block">
                          {new Date(r.testedAt).getHours().toString().padStart(2, '0')}h
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-4 mt-3 text-2xs text-gray-600">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Safe</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-yellow-500 inline-block" /> Warning</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" /> Danger</span>
                  <span className="ml-auto text-gray-600">← older · newer →</span>
                </div>
              </div>
            </div>
          )}

          {latestRecord && (
            <div>
              <SectionHeader title={t.gas.latestReadings} subtitle={latestRecord.location} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-md border border-surface-border bg-surface-card">
                {latestRecord.readings.map(r => (
                  <GasGauge key={r.id} gasType={r.gasType} value={r.value} />
                ))}
              </div>
            </div>
          )}

          <div>
            <SectionHeader title={t.gas.testHistory} />
            <DataTable
              columns={GAS_RECORD_COLUMNS}
              data={gasRecords}
              keyExtractor={r => r.id}
              emptyMessage={t.gas.noTests}
            />
          </div>

        </div>
      </PageShell>

      <GasEntryModal open={entryModalOpen} onClose={() => setEntryModalOpen(false)} onSuccess={() => { loadGasData(); bumpDataVersion(); }} />
    </>
  );
}
