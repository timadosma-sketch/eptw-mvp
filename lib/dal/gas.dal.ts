import { db } from '@/lib/db';
import { mapGasTestRecord, mapAlert } from '@/lib/dal/mappers';
import type { GasTestRecord, GasReading, Alert } from '@/lib/types';
import type { Prisma } from '@prisma/client';
import { GAS_THRESHOLDS } from '@/lib/constants';
import type { GasType, GasStatus } from '@/lib/types';

const GAS_TEST_INCLUDE = {
  testedBy: true,
  readings: true,
} as const;

export async function getAllGasTests(): Promise<GasTestRecord[]> {
  const rows = await db.gasTestRecord.findMany({
    include: GAS_TEST_INCLUDE,
    orderBy: { testedAt: 'desc' },
    take: 100,
  });
  return rows.map(mapGasTestRecord);
}

export async function getGasTestsByPermit(permitId: string): Promise<GasTestRecord[]> {
  const rows = await db.gasTestRecord.findMany({
    where: { permitId },
    include: GAS_TEST_INCLUDE,
    orderBy: { testedAt: 'desc' },
  });
  return rows.map(mapGasTestRecord);
}

export async function getLatestReadingsByPermit(permitId: string): Promise<GasReading[]> {
  const latest = await db.gasTestRecord.findFirst({
    where: { permitId },
    include: GAS_TEST_INCLUDE,
    orderBy: { testedAt: 'desc' },
  });
  if (!latest) return [];
  return mapGasTestRecord(latest).readings;
}

export function classifyGasReading(gasType: GasType, value: number): GasStatus {
  const t = GAS_THRESHOLDS[gasType];
  if (!t) return 'UNKNOWN';

  if (gasType === 'O2') {
    if (value >= t.safeMin! && value <= t.safeMax!) return 'SAFE';
    if (value >= t.warningMin! && value <= t.warningMax!) return 'WARNING';
    return 'DANGER';
  }

  if (t.safeMax !== undefined   && value <= t.safeMax)   return 'SAFE';
  if (t.warningMax !== undefined && value <= t.warningMax) return 'WARNING';
  return 'DANGER';
}

export async function submitGasTest(
  permitId: string,
  permitNumber: string,
  testerId: string,
  location: string,
  readings: Array<{
    gasType: GasType;
    value: number;
    unit: string;
    location: string;
    instrument: string;
    instrumentCalibrationDate: string;
    notes?: string;
  }>,
  notes = '',
): Promise<GasTestRecord> {
  const now = new Date();
  const nextTestDue = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour

  const classifiedReadings = readings.map(r => ({
    ...r,
    status: classifyGasReading(r.gasType, r.value) as any,
    permitId,
    permitNumber,
    testedById: testerId,
    testedAt: now,
    nextTestDue,
    notes: r.notes ?? '',
  }));

  const hasDanger  = classifiedReadings.some(r => r.status === 'DANGER');
  const hasWarning = classifiedReadings.some(r => r.status === 'WARNING');
  const overallStatus: GasStatus = hasDanger ? 'DANGER' : hasWarning ? 'WARNING' : 'SAFE';

  const row = await db.gasTestRecord.create({
    data: {
      permitId,
      permitNumber,
      testedById: testerId,
      testedAt: now,
      location,
      overallStatus: overallStatus as any,
      passedAt: overallStatus === 'SAFE'   ? now : null,
      failedAt: overallStatus === 'DANGER' ? now : null,
      reEntryRequired: overallStatus !== 'SAFE',
      notes,
      readings: { create: classifiedReadings },
    },
    include: GAS_TEST_INCLUDE,
  });

  return mapGasTestRecord(row);
}

export async function getActiveAlerts(): Promise<Alert[]> {
  const rows = await db.alert.findMany({
    where: {
      acknowledged: false,
      OR: [
        { autoExpires: false },
        { expiresAt: { gt: new Date() } },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(mapAlert);
}

export async function countGasAlerts(): Promise<number> {
  return db.alert.count({
    where: {
      acknowledged: false,
      severity: { in: ['DANGER', 'CRITICAL'] },
    },
  });
}

export async function acknowledgeAlert(alertId: string, acknowledgedById: string): Promise<void> {
  await db.alert.update({
    where: { id: alertId },
    data: {
      acknowledged: true,
      acknowledgedById,
      acknowledgedAt: new Date(),
    },
  });
}
