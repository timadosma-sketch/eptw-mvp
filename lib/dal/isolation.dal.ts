import { db } from '@/lib/db';
import { mapIsolationCert } from '@/lib/dal/mappers';
import type { IsolationCertificate } from '@/lib/types';

const ISO_INCLUDE = {
  issuedBy: true,
  verifiedBy: true,
  releasedBy: true,
  isolationPoints: true,
  energySources: true,
} as const;

export async function getAllIsolationCerts(): Promise<IsolationCertificate[]> {
  const rows = await db.isolationCertificate.findMany({
    include: ISO_INCLUDE,
    orderBy: { issuedAt: 'desc' },
  });
  return rows.map(mapIsolationCert);
}

export async function getActiveIsolations(): Promise<IsolationCertificate[]> {
  const rows = await db.isolationCertificate.findMany({
    where: { status: { in: ['ISOLATED', 'VERIFIED'] } },
    include: ISO_INCLUDE,
    orderBy: { issuedAt: 'desc' },
  });
  return rows.map(mapIsolationCert);
}

export async function getIsolationByPermit(
  permitId: string,
): Promise<IsolationCertificate | null> {
  const row = await db.isolationCertificate.findUnique({
    where: { permitId },
    include: ISO_INCLUDE,
  });
  return row ? mapIsolationCert(row) : null;
}

export async function getIsolationById(id: string): Promise<IsolationCertificate | null> {
  const row = await db.isolationCertificate.findUnique({
    where: { id },
    include: ISO_INCLUDE,
  });
  return row ? mapIsolationCert(row) : null;
}

export async function countActiveIsolations(): Promise<number> {
  return db.isolationCertificate.count({
    where: { status: { in: ['ISOLATED', 'VERIFIED'] } },
  });
}

export async function countVerifiedIsolations(): Promise<number> {
  return db.isolationCertificate.count({ where: { status: 'VERIFIED' } });
}

export async function countPendingIsolations(): Promise<number> {
  return db.isolationCertificate.count({ where: { status: 'PENDING' } });
}

export async function updateIsolationStatus(
  id: string,
  status: 'ISOLATED' | 'VERIFIED' | 'RELEASED' | 'CANCELLED',
  userId: string | null,
): Promise<IsolationCertificate> {
  const now = new Date().toISOString();
  const extraFields: Record<string, unknown> = {};

  if (status === 'VERIFIED') {
    extraFields.verifiedById = userId;
    extraFields.verifiedAt   = now;
  } else if (status === 'RELEASED') {
    extraFields.releasedById = userId;
    extraFields.releasedAt   = now;
  }

  const row = await db.isolationCertificate.update({
    where: { id },
    data: { status: status as any, ...extraFields },
    include: ISO_INCLUDE,
  });
  return mapIsolationCert(row);
}
