import { db } from '@/lib/db';
import { mapPermit } from '@/lib/dal/mappers';
import type { Permit, PermitFilters, PaginatedResult } from '@/lib/types';
import type { PermitStatus, PermitType, RiskLevel, Prisma } from '@prisma/client';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';

const PERMIT_INCLUDE = {
  requestedBy: true,
  areaAuthority: true,
  issuingAuthority: true,
  hseOfficer: true,
  contractors: true,
  attachments: true,
  approvals: { include: { assignedTo: true } },
} as const;

function buildWhere(filters: PermitFilters): Prisma.PermitWhereInput {
  const where: Prisma.PermitWhereInput = {};

  if (filters.status?.length) {
    where.status = { in: filters.status as PermitStatus[] };
  }
  if (filters.type?.length) {
    where.type = { in: filters.type as PermitType[] };
  }
  if (filters.riskLevel?.length) {
    where.riskLevel = { in: filters.riskLevel as RiskLevel[] };
  }
  if (filters.area) {
    where.area = { contains: filters.area, mode: 'insensitive' };
  }
  if (filters.search) {
    where.OR = [
      { permitNumber: { contains: filters.search, mode: 'insensitive' } },
      { title:        { contains: filters.search, mode: 'insensitive' } },
      { location:     { contains: filters.search, mode: 'insensitive' } },
      { equipment:    { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  if (filters.expiringSoon) {
    const cutoff = new Date(Date.now() + 24 * 60 * 60 * 1000);
    where.validTo = { lt: cutoff };
    where.status = 'ACTIVE';
  }
  if (filters.dateFrom) where.createdAt = { gte: new Date(filters.dateFrom) };
  if (filters.dateTo)   where.createdAt = { ...where.createdAt as object, lte: new Date(filters.dateTo) };

  return where;
}

export async function getPermits(
  filters: PermitFilters = {},
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResult<Permit>> {
  const where = buildWhere(filters);

  const [total, rows] = await Promise.all([
    db.permit.count({ where }),
    db.permit.findMany({
      where,
      include: PERMIT_INCLUDE,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    data: rows.map(mapPermit),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getPermitById(id: string): Promise<Permit | null> {
  const row = await db.permit.findUnique({
    where: { id },
    include: PERMIT_INCLUDE,
  });
  return row ? mapPermit(row) : null;
}

export async function getPermitByNumber(permitNumber: string): Promise<Permit | null> {
  const row = await db.permit.findUnique({
    where: { permitNumber },
    include: PERMIT_INCLUDE,
  });
  return row ? mapPermit(row) : null;
}

export async function createPermit(data: Prisma.PermitCreateInput): Promise<Permit> {
  const row = await db.permit.create({
    data,
    include: PERMIT_INCLUDE,
  });
  return mapPermit(row);
}

export async function updatePermit(
  id: string,
  data: Prisma.PermitUpdateInput,
): Promise<Permit> {
  const row = await db.permit.update({
    where: { id },
    data: { ...data, updatedAt: new Date() },
    include: PERMIT_INCLUDE,
  });
  return mapPermit(row);
}

export async function updatePermitStatus(
  id: string,
  status: PermitStatus,
  notes?: string,
): Promise<Permit> {
  const update: Prisma.PermitUpdateInput = { status, updatedAt: new Date() };
  if (notes !== undefined) update.notes = notes;
  return updatePermit(id, update);
}

export async function countPermitsByStatus(): Promise<Record<string, number>> {
  const rows = await db.permit.groupBy({
    by: ['status'],
    _count: { id: true },
  });
  return Object.fromEntries(rows.map(r => [r.status, r._count.id]));
}

export async function countPermitsByType(): Promise<Record<string, number>> {
  const rows = await db.permit.groupBy({
    by: ['type'],
    _count: { id: true },
  });
  return Object.fromEntries(rows.map(r => [r.type, r._count.id]));
}
