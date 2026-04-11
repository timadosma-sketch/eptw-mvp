import { db } from '@/lib/db';
import type { DashboardMetrics, Alert, PermitType, PermitStatus, RiskLevel } from '@/lib/types';
import { mapAlert } from '@/lib/dal/mappers';

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const now = new Date();
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);
  const tomorrowEnd = new Date(todayEnd);
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

  const [
    activePermits,
    pendingApprovals,
    gasAlerts,
    expiringToday,
    expiringTomorrow,
    suspendedPermits,
    openIsolations,
    simoConflicts,
    overdueApprovals,
    workerSum,
    byTypeRows,
    byStatusRows,
    byRiskRows,
    safetyMetrics,
  ] = await Promise.all([
    db.permit.count({ where: { status: 'ACTIVE' } }),
    db.approval.count({ where: { decision: null } }),
    db.alert.count({ where: { acknowledged: false, severity: { in: ['DANGER', 'CRITICAL'] } } }),
    db.permit.count({ where: { status: 'ACTIVE', validTo: { lte: todayEnd } } }),
    db.permit.count({ where: { status: 'ACTIVE', validTo: { gt: todayEnd, lte: tomorrowEnd } } }),
    db.permit.count({ where: { status: 'SUSPENDED' } }),
    db.isolationCertificate.count({ where: { status: { in: ['ISOLATED', 'VERIFIED'] } } }),
    db.sIMOPSConflict.count({ where: { isActive: true } }),
    db.approval.count({ where: { decision: null, isOverdue: true } }),
    db.permit.aggregate({ where: { status: 'ACTIVE' }, _sum: { workerCount: true } }),
    db.permit.groupBy({ by: ['type'],   _count: { id: true } }),
    db.permit.groupBy({ by: ['status'], _count: { id: true } }),
    db.permit.groupBy({ by: ['riskLevel'], _count: { id: true } }),
    // Hardcoded safety metrics for MVP — replace with real incident tracking later
    Promise.resolve({ safetyScore: 87, daysWithoutIncident: 43, mttrMinutes: 28 }),
  ]);

  // Build complete records with 0 defaults
  const permitTypes: PermitType[] = [
    'HOT_WORK','COLD_WORK','CONFINED_SPACE','ELECTRICAL','EXCAVATION',
    'WORK_AT_HEIGHT','LINE_BREAKING','LIFTING','RADIOGRAPHY',
    'PRESSURE_TESTING','OVERRIDE_BYPASS','COMBINED',
  ];
  const permitStatuses: PermitStatus[] = [
    'DRAFT','SUBMITTED','UNDER_REVIEW','APPROVED','ACTIVE','SUSPENDED',
    'CANCELLED','CLOSED','EXPIRED','REJECTED','PENDING_REVALIDATION',
    'TRANSFERRED','ARCHIVED',
  ];
  const riskLevels: RiskLevel[] = ['LOW','MEDIUM','HIGH','CRITICAL'];

  const permitsByType = Object.fromEntries(permitTypes.map(t => [t, 0])) as Record<PermitType, number>;
  byTypeRows.forEach(r => { permitsByType[r.type as PermitType] = r._count.id; });

  const permitsByStatus = Object.fromEntries(permitStatuses.map(s => [s, 0])) as Record<PermitStatus, number>;
  byStatusRows.forEach(r => { permitsByStatus[r.status as PermitStatus] = r._count.id; });

  const permitsByRisk = Object.fromEntries(riskLevels.map(r => [r, 0])) as Record<RiskLevel, number>;
  byRiskRows.forEach(r => { permitsByRisk[r.riskLevel as RiskLevel] = r._count.id; });

  return {
    activePermits,
    pendingApprovals,
    gasAlerts,
    expiringToday,
    expiringTomorrow,
    suspendedPermits,
    openIsolations,
    simoConflicts,
    overdueApprovals,
    totalWorkersOnSite: workerSum._sum.workerCount ?? 0,
    permitsByType,
    permitsByStatus,
    permitsByRisk,
    safetyScore: safetyMetrics.safetyScore,
    daysWithoutIncident: safetyMetrics.daysWithoutIncident,
    mttrMinutes: safetyMetrics.mttrMinutes,
  };
}

export interface DayTrend {
  date: string;  // "dd MMM"
  created: number;
  closed: number;
  active: number;
}

export async function getPermitTrend(days = 7): Promise<DayTrend[]> {
  const trend: DayTrend[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const dayStart = new Date(now);
    dayStart.setDate(dayStart.getDate() - i);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const [created, closed, active] = await Promise.all([
      db.permit.count({ where: { createdAt: { gte: dayStart, lte: dayEnd } } }),
      db.permit.count({ where: { status: { in: ['CLOSED', 'EXPIRED', 'CANCELLED'] }, updatedAt: { gte: dayStart, lte: dayEnd } } }),
      db.permit.count({ where: { status: 'ACTIVE', createdAt: { lte: dayEnd } } }),
    ]);

    const label = dayStart.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    trend.push({ date: label, created, closed, active });
  }

  return trend;
}

export async function getDashboardAlerts(): Promise<Alert[]> {
  const rows = await db.alert.findMany({
    where: {
      acknowledged: false,
      OR: [{ autoExpires: false }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
    take: 20,
  });
  return rows.map(mapAlert);
}
