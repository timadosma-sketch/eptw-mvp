import type { GasTestRecord, GasReading, Alert, IGasService } from '@/lib/types';
import {
  MOCK_GAS_RECORDS,
  MOCK_GAS_ALERTS,
  getGasRecordsByPermit,
  getLatestReadingsByPermit,
} from '@/lib/mock/gas';
import { GAS_THRESHOLDS } from '@/lib/constants';
import type { GasType, GasStatus } from '@/lib/types';

const delay = (ms = 120) => new Promise(res => setTimeout(res, ms));

export function classifyGasReading(gasType: GasType, value: number): GasStatus {
  const t = GAS_THRESHOLDS[gasType];
  if (!t) return 'UNKNOWN';

  if (gasType === 'O2') {
    if (value >= t.safeMin! && value <= t.safeMax!) return 'SAFE';
    if (value >= t.warningMin! && value <= t.warningMax!) return 'WARNING';
    return 'DANGER';
  }

  // Upper-bound gases (LEL, H2S, CO, VOC)
  if (t.safeMax !== undefined && value <= t.safeMax) return 'SAFE';
  if (t.warningMax !== undefined && value <= t.warningMax) return 'WARNING';
  return 'DANGER';
}

export const gasService: IGasService = {
  async getGasHistory(permitId: string): Promise<GasTestRecord[]> {
    await delay();
    return getGasRecordsByPermit(permitId);
  },

  async getLatestReadings(permitId: string): Promise<GasReading[]> {
    await delay(60);
    return getLatestReadingsByPermit(permitId);
  },

  async submitGasTest(permitId: string, readings: Partial<GasReading>[]): Promise<GasTestRecord> {
    await delay(250);
    const now = new Date().toISOString();
    const classified = readings.map(r => ({
      ...r,
      status: classifyGasReading(r.gasType!, r.value!),
    })) as GasReading[];
    const hasDanger  = classified.some(r => r.status === 'DANGER');
    const hasWarning = classified.some(r => r.status === 'WARNING');
    const overallStatus: GasStatus = hasDanger ? 'DANGER' : hasWarning ? 'WARNING' : 'SAFE';
    const record: GasTestRecord = {
      id: `gtr-${Date.now()}`,
      permitId,
      permitNumber: '',
      testedBy: readings[0]?.testedBy!,
      testedAt: now,
      location: readings[0]?.location ?? '',
      readings: classified,
      overallStatus,
      passedAt: overallStatus === 'SAFE' ? now : undefined,
      failedAt: overallStatus === 'DANGER' ? now : undefined,
      reEntryRequired: overallStatus !== 'SAFE',
      notes: '',
    };
    MOCK_GAS_RECORDS.push(record);
    return record;
  },

  async getActiveAlerts(): Promise<Alert[]> {
    await delay(60);
    return MOCK_GAS_ALERTS.filter(a => !a.acknowledged);
  },
};
