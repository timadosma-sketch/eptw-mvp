'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/shared/Modal';
import { Button } from '@/components/shared/Button';
import { GasStatusBadge } from '@/components/shared/StatusBadge';
import { useAppStore } from '@/lib/store/useAppStore';
import { classifyGasReading } from '@/lib/services/gasService';
import { GAS_THRESHOLDS } from '@/lib/constants';
import { cn } from '@/lib/utils/cn';
import type { GasType } from '@/lib/types';

export function GlobalGasTestModal() {
  const permitId        = useAppStore(s => s.gasTestModalPermitId);
  const closeModal      = useAppStore(s => s.closeGasTestModal);
  const showToast       = useAppStore(s => s.showToast);
  const currentUser     = useAppStore(s => s.currentUser);
  const bumpDataVersion = useAppStore(s => s.bumpDataVersion);

  const [permitNumber, setPermitNumber] = useState('');
  const [location,     setLocation]     = useState('');
  const [readings,     setReadings]     = useState<Record<GasType, string>>({
    O2: '', LEL: '', H2S: '', CO: '', VOC: '',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const inputCls = "w-full text-xs bg-surface-panel border border-surface-border rounded px-3 py-2 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand/60";

  // When modal opens with a permitId, fetch the permit number
  useEffect(() => {
    if (!permitId) return;
    setReadings({ O2: '', LEL: '', H2S: '', CO: '', VOC: '' });
    setLocation('');
    setError('');
    fetch(`/api/permits/${permitId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.permitNumber) setPermitNumber(d.permitNumber); })
      .catch(() => {});
  }, [permitId]);

  const handleSubmit = async () => {
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
        body: JSON.stringify({
          permitId,
          permitNumber,
          testerId: currentUser?.id ?? 'usr-004',
          location: location.trim(),
          readings: filledReadings,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      const record = await res.json();
      const status = record.overallStatus;
      showToast(
        `Gas test recorded for ${permitNumber} — ${status}`,
        status === 'SAFE' ? 'success' : status === 'WARNING' ? 'warning' : 'error',
      );
      bumpDataVersion();
      closeModal();
    } catch {
      setError('Failed to submit gas test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={!!permitId}
      onClose={closeModal}
      title="Record Gas Test"
      subtitle={permitNumber ? `Permit ${permitNumber}` : 'Loading permit…'}
      size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={closeModal}>Cancel</Button>
          <Button variant="primary" size="sm" loading={loading} onClick={handleSubmit}>Record Test</Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="text-xs text-red-400 bg-red-950/30 border border-red-800 rounded px-3 py-2">{error}</div>
        )}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Test Location *</label>
          <input
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="e.g. HCU Pipe Rack PR-05"
            className={inputCls}
          />
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
          <div className="font-semibold text-gray-400 mb-1">Safe Limits Reference</div>
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
