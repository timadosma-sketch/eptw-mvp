// ──────────────────────────────────────────────────────────────
// Gas Service — API-backed implementation
// ──────────────────────────────────────────────────────────────
import type { GasTestRecord, GasReading, Alert, IGasService } from '@/lib/types';
import { GAS_THRESHOLDS } from '@/lib/constants';
import type { GasType, GasStatus } from '@/lib/types';

export function classifyGasReading(gasType: GasType, value: number): GasStatus {
  const t = GAS_THRESHOLDS[gasType];
  if (!t) return 'UNKNOWN';
  if (gasType === 'O2') {
    if (value >= t.safeMin! && value <= t.safeMax!) return 'SAFE';
    if (value >= t.warningMin! && value <= t.warningMax!) return 'WARNING';
    return 'DANGER';
  }
  if (t.safeMax !== undefined    && value <= t.safeMax)   return 'SAFE';
  if (t.warningMax !== undefined && value <= t.warningMax) return 'WARNING';
  return 'DANGER';
}

export const gasService: IGasService = {
  async getGasHistory(permitId: string): Promise<GasTestRecord[]> {
    const res = await fetch(`/api/gas-tests/${permitId}`);
    if (!res.ok) throw new Error(`getGasHistory failed: ${res.status}`);
    const json = await res.json();
    return json.data ?? [];
  },

  async getLatestReadings(permitId: string): Promise<GasReading[]> {
    const res = await fetch(`/api/gas-tests/${permitId}?latest=true`);
    if (!res.ok) throw new Error(`getLatestReadings failed: ${res.status}`);
    const json = await res.json();
    return json.data ?? [];
  },

  async submitGasTest(
    permitId: string,
    readings: Partial<GasReading>[],
  ): Promise<GasTestRecord> {
    const res = await fetch('/api/gas-tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        permitId,
        permitNumber: readings[0]?.permitNumber ?? '',
        testerId:     readings[0]?.testedBy?.id,
        location:     readings[0]?.location ?? '',
        readings: readings.map(r => ({
          gasType:  r.gasType,
          value:    r.value,
          unit:     r.unit,
          location: r.location,
          instrument: r.instrument,
          instrumentCalibrationDate: r.instrumentCalibrationDate,
          notes: r.notes,
        })),
      }),
    });
    if (!res.ok) throw new Error(`submitGasTest failed: ${res.status}`);
    return res.json();
  },

  async getActiveAlerts(): Promise<Alert[]> {
    const res = await fetch('/api/gas-tests?alerts=true');
    if (!res.ok) throw new Error(`getActiveAlerts failed: ${res.status}`);
    const json = await res.json();
    return json.data ?? [];
  },
};
