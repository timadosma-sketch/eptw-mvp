import { db } from '@/lib/db';
import { mapSIMOPS } from '@/lib/dal/mappers';
import type { SIMOPSConflict } from '@/lib/types';

const SIMOPS_INCLUDE = {
  raisedBy: true,
  resolvedBy: true,
} as const;

export async function getAllConflicts(): Promise<SIMOPSConflict[]> {
  const rows = await db.sIMOPSConflict.findMany({
    include: SIMOPS_INCLUDE,
    orderBy: { raisedAt: 'desc' },
  });
  return rows.map(mapSIMOPS);
}

export async function getActiveConflicts(): Promise<SIMOPSConflict[]> {
  const rows = await db.sIMOPSConflict.findMany({
    where: { isActive: true },
    include: SIMOPS_INCLUDE,
    orderBy: { raisedAt: 'desc' },
  });
  return rows.map(mapSIMOPS);
}

export async function countActiveConflicts(): Promise<number> {
  return db.sIMOPSConflict.count({ where: { isActive: true } });
}
