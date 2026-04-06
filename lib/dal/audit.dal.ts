import { db } from '@/lib/db';
import { mapAuditEntry } from '@/lib/dal/mappers';
import type { AuditEntry, PaginatedResult } from '@/lib/types';
import type { AuditAction, Prisma } from '@prisma/client';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';

const AUDIT_INCLUDE = { performedBy: true } as const;

export async function getAuditLog(
  entityId?: string,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResult<AuditEntry>> {
  const where: Prisma.AuditEntryWhereInput = entityId
    ? { entityId }
    : {};

  const [total, rows] = await Promise.all([
    db.auditEntry.count({ where }),
    db.auditEntry.findMany({
      where,
      include: AUDIT_INCLUDE,
      orderBy: { performedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    data: rows.map(mapAuditEntry),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function logAction(
  entry: Omit<AuditEntry, 'id' | 'performedAt' | 'correlationId'>,
): Promise<AuditEntry> {
  const row = await db.auditEntry.create({
    data: {
      action: entry.action as AuditAction,
      entity: entry.entity,
      entityId: entry.entityId,
      entityRef: entry.entityRef,
      performedById: entry.performedBy.id,
      ipAddress: entry.ipAddress,
      deviceInfo: entry.deviceInfo,
      changes: (entry.changes ?? []) as unknown as Prisma.InputJsonValue,
      metadata: (entry.metadata ?? {}) as unknown as Prisma.InputJsonValue,
    },
    include: AUDIT_INCLUDE,
  });
  return mapAuditEntry(row);
}
