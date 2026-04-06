import { db } from '@/lib/db';
import { mapApproval } from '@/lib/dal/mappers';
import type { Approval, ApprovalFilters, PaginatedResult, ApprovalDecision } from '@/lib/types';
import type { Prisma } from '@prisma/client';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';

const APPROVAL_INCLUDE = { assignedTo: true } as const;

export async function getApprovals(
  filters: ApprovalFilters = {},
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResult<Approval>> {
  const where: Prisma.ApprovalWhereInput = {};

  if (filters.assignedToId) where.assignedToId = filters.assignedToId;
  if (filters.overdueOnly)  where.isOverdue = true;

  if (filters.decision?.length) {
    // if decision filter is specified — show decided; else show pending (no decision)
    where.decision = { in: filters.decision as any[] };
  }

  const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };

  const [total, rows] = await Promise.all([
    db.approval.count({ where }),
    db.approval.findMany({
      where,
      include: APPROVAL_INCLUDE,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const sorted = rows
    .map(mapApproval)
    .sort((a, b) => (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99));

  return {
    data: sorted,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getPendingApprovals(): Promise<Approval[]> {
  const rows = await db.approval.findMany({
    where: { decision: null },
    include: APPROVAL_INCLUDE,
    orderBy: { dueBy: 'asc' },
  });
  return rows.map(mapApproval);
}

export async function getApprovalById(id: string): Promise<Approval | null> {
  const row = await db.approval.findUnique({
    where: { id },
    include: APPROVAL_INCLUDE,
  });
  return row ? mapApproval(row) : null;
}

export async function getApprovalsByPermit(permitId: string): Promise<Approval[]> {
  const rows = await db.approval.findMany({
    where: { permitId },
    include: APPROVAL_INCLUDE,
    orderBy: { createdAt: 'asc' },
  });
  return rows.map(mapApproval);
}

export async function submitDecision(
  id: string,
  decision: ApprovalDecision,
  comments: string,
  conditions: string[] = [],
): Promise<Approval> {
  const row = await db.approval.update({
    where: { id },
    data: {
      decision: decision as any,
      comments,
      conditions,
      decidedAt: new Date(),
    },
    include: APPROVAL_INCLUDE,
  });
  return mapApproval(row);
}

export async function countPendingApprovals(): Promise<number> {
  return db.approval.count({ where: { decision: null } });
}
