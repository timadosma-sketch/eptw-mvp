import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getPermitById, updatePermitStatus } from '@/lib/dal/permits.dal';
import { sendPermitStatusEmail } from '@/lib/email';
import { logAction } from '@/lib/dal/audit.dal';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import type { PermitStatus, UserRole } from '@/lib/types';
import type { PermitType } from '@prisma/client';

// ─── SIMOPS Compatibility Matrix ─────────────────────────────────────────────
// Based on IEC/ISA oil & gas simultaneous operations standard

type SIMOPSCompat = 'COMPATIBLE' | 'CONDITIONAL' | 'PROHIBITED';

const SIMOPS_MATRIX: Partial<Record<string, Partial<Record<string, SIMOPSCompat>>>> = {
  HOT_WORK:       { HOT_WORK: 'CONDITIONAL', COLD_WORK: 'COMPATIBLE', CONFINED_SPACE: 'PROHIBITED', ELECTRICAL: 'CONDITIONAL', LINE_BREAKING: 'PROHIBITED', LIFTING: 'CONDITIONAL', RADIOGRAPHY: 'PROHIBITED' },
  COLD_WORK:      { HOT_WORK: 'COMPATIBLE', COLD_WORK: 'COMPATIBLE', CONFINED_SPACE: 'CONDITIONAL', ELECTRICAL: 'COMPATIBLE', LINE_BREAKING: 'COMPATIBLE', LIFTING: 'COMPATIBLE', RADIOGRAPHY: 'PROHIBITED' },
  CONFINED_SPACE: { HOT_WORK: 'PROHIBITED', COLD_WORK: 'CONDITIONAL', CONFINED_SPACE: 'PROHIBITED', ELECTRICAL: 'PROHIBITED', LINE_BREAKING: 'PROHIBITED', LIFTING: 'PROHIBITED', RADIOGRAPHY: 'PROHIBITED' },
  ELECTRICAL:     { HOT_WORK: 'CONDITIONAL', COLD_WORK: 'COMPATIBLE', CONFINED_SPACE: 'PROHIBITED', ELECTRICAL: 'CONDITIONAL', LINE_BREAKING: 'CONDITIONAL', LIFTING: 'COMPATIBLE', RADIOGRAPHY: 'PROHIBITED' },
  LINE_BREAKING:  { HOT_WORK: 'PROHIBITED', COLD_WORK: 'COMPATIBLE', CONFINED_SPACE: 'PROHIBITED', ELECTRICAL: 'CONDITIONAL', LINE_BREAKING: 'CONDITIONAL', LIFTING: 'COMPATIBLE', RADIOGRAPHY: 'PROHIBITED' },
  LIFTING:        { HOT_WORK: 'CONDITIONAL', COLD_WORK: 'COMPATIBLE', CONFINED_SPACE: 'PROHIBITED', ELECTRICAL: 'COMPATIBLE', LINE_BREAKING: 'COMPATIBLE', LIFTING: 'CONDITIONAL', RADIOGRAPHY: 'PROHIBITED' },
  RADIOGRAPHY:    { HOT_WORK: 'PROHIBITED', COLD_WORK: 'PROHIBITED', CONFINED_SPACE: 'PROHIBITED', ELECTRICAL: 'PROHIBITED', LINE_BREAKING: 'PROHIBITED', LIFTING: 'PROHIBITED', RADIOGRAPHY: 'PROHIBITED' },
};

/**
 * When a permit is activated, scan other ACTIVE permits in the same zone
 * and auto-create SIMOPS conflict records for CONDITIONAL / PROHIBITED pairs.
 */
async function runSimopsCheck(
  activatedPermitId:     string,
  activatedPermitNumber: string,
  activatedType:         string,
  zone:                  string,
  raisedById:            string,
) {
  if (!zone) return; // no zone = no auto-check

  // Find other ACTIVE permits in the same zone
  const others = await db.permit.findMany({
    where: {
      id:         { not: activatedPermitId },
      simopsZone: zone,
      status:     'ACTIVE',
    },
    select: { id: true, permitNumber: true, type: true },
  });

  for (const other of others) {
    const compat = SIMOPS_MATRIX[activatedType]?.[other.type] ?? 'COMPATIBLE';
    if (compat === 'COMPATIBLE') continue;

    // Check if an active conflict for this pair already exists
    const existing = await db.sIMOPSConflict.findFirst({
      where: {
        isActive: true,
        OR: [
          { permitAId: activatedPermitId, permitBId: other.id },
          { permitAId: other.id, permitBId: activatedPermitId },
        ],
      },
    });
    if (existing) continue;

    // Create new SIMOPS conflict
    await db.sIMOPSConflict.create({
      data: {
        permitAId:     activatedPermitId,
        permitANumber: activatedPermitNumber,
        permitAType:   activatedType as PermitType,
        permitBId:     other.id,
        permitBNumber: other.permitNumber,
        permitBType:   other.type,
        compatibility: compat,
        zone,
        raisedById,
        conditions:    compat === 'CONDITIONAL'
          ? ['Simultaneous operations require HOD sign-off', 'Ensure communication between work teams']
          : ['STOP WORK — incompatible simultaneous operations. Separate permits and clear zone.'],
        resolution:    '',
        isActive:      true,
      },
    });

    // Create an alert for PROHIBITED conflicts
    if (compat === 'PROHIBITED') {
      await db.alert.create({
        data: {
          severity:    'CRITICAL',
          title:       `SIMOPS CONFLICT — ${activatedPermitNumber} ↔ ${other.permitNumber}`,
          message:     `PROHIBITED simultaneous operations in zone ${zone}: ${activatedType.replace('_', ' ')} and ${other.type.replace('_', ' ')}. Stop work and resolve immediately.`,
          permitId:    activatedPermitId,
          permitNumber: activatedPermitNumber,
          autoExpires: false,
        },
      });
    }
  }
}

// Map permit status → audit action
const STATUS_AUDIT_ACTION: Partial<Record<string, string>> = {
  SUBMITTED:    'PERMIT_SUBMITTED',
  APPROVED:     'PERMIT_APPROVED',
  REJECTED:     'PERMIT_REJECTED',
  ACTIVE:       'PERMIT_ACTIVATED',
  SUSPENDED:    'PERMIT_SUSPENDED',
  CLOSED:       'PERMIT_CLOSED',
  CANCELLED:    'PERMIT_CANCELLED',
};

const VALID_TRANSITIONS: Partial<Record<PermitStatus, PermitStatus[]>> = {
  DRAFT:        ['SUBMITTED', 'CANCELLED'],
  SUBMITTED:    ['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'DRAFT', 'CANCELLED'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED', 'DRAFT', 'CANCELLED'],  // DRAFT = referred back
  APPROVED:     ['ACTIVE', 'CANCELLED'],
  ACTIVE:       ['SUSPENDED', 'CLOSED', 'CANCELLED'],
  SUSPENDED:    ['ACTIVE', 'CANCELLED', 'CLOSED'],
  REJECTED:     ['DRAFT'],  // Allow requester to revise and re-submit
};

// Map risk level to approval priority and SLA hours
const RISK_PRIORITY: Record<string, { priority: string; slaHours: number }> = {
  CRITICAL: { priority: 'P0', slaHours: 2  },
  HIGH:     { priority: 'P1', slaHours: 4  },
  MEDIUM:   { priority: 'P2', slaHours: 8  },
  LOW:      { priority: 'P3', slaHours: 24 },
};

// Required approver role based on permit type
function getRequiredRole(type: string, riskLevel: string): UserRole {
  const highRisk = ['CRITICAL', 'HIGH'].includes(riskLevel);
  const sensitive = ['HOT_WORK', 'CONFINED_SPACE', 'LINE_BREAKING', 'RADIOGRAPHY', 'OVERRIDE_BYPASS'].includes(type);
  return (highRisk || sensitive) ? 'ISSUING_AUTHORITY' : 'AREA_AUTHORITY';
}

// Who to notify for each transition
function getRecipients(
  permit: Awaited<ReturnType<typeof getPermitById>>,
  newStatus: PermitStatus,
): string[] {
  if (!permit) return [];
  const emails: string[] = [];
  const p = permit as unknown as {
    requestedBy?: { email?: string };
    areaAuthority?: { email?: string };
    issuingAuthority?: { email?: string };
  };

  if (newStatus === 'SUBMITTED') {
    if (p.areaAuthority?.email)    emails.push(p.areaAuthority.email);
    if (p.issuingAuthority?.email) emails.push(p.issuingAuthority.email);
  } else if (['APPROVED', 'REJECTED', 'ACTIVE', 'CLOSED', 'CANCELLED'].includes(newStatus)) {
    if (p.requestedBy?.email) emails.push(p.requestedBy.email);
  } else if (newStatus === 'SUSPENDED') {
    if (p.requestedBy?.email)    emails.push(p.requestedBy.email);
    if (p.areaAuthority?.email)  emails.push(p.areaAuthority.email);
    if (p.issuingAuthority?.email) emails.push(p.issuingAuthority.email);
  }

  return emails.filter((e, i, arr) => Boolean(e) && arr.indexOf(e) === i);
}

// Create an Approval record and auto-assign to an eligible user
async function createApprovalForPermit(
  permit: NonNullable<Awaited<ReturnType<typeof getPermitById>>>,
) {
  const { priority, slaHours } = RISK_PRIORITY[permit.riskLevel] ?? { priority: 'P2', slaHours: 8 };
  const requiredRole = getRequiredRole(permit.type, permit.riskLevel);
  const dueBy = new Date(Date.now() + slaHours * 3_600_000);

  // Find an available approver with the required role
  const approver = await db.user.findFirst({
    where: { role: requiredRole as any },
    orderBy: { id: 'asc' },
  });

  await db.approval.create({
    data: {
      permitId:     permit.id,
      permitNumber: permit.permitNumber,
      permitType:   permit.type as any,
      permitTitle:  permit.title,
      location:     permit.location,
      requiredRole: requiredRole as any,
      assignedToId: approver?.id ?? null,
      dueBy,
      priority,
      isOverdue:    false,
    },
  });

  // If we found an approver, email them
  if (approver?.email) {
    sendPermitStatusEmail({
      to:           approver.email,
      permitNumber: permit.permitNumber,
      permitTitle:  permit.title,
      status:       'SUBMITTED',
      location:     permit.location,
      performedBy:  'System',
    }).catch(err => console.error('[email approval-assign]', err));
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    const { status, notes } = await req.json();

    if (!status) {
      return NextResponse.json({ error: 'status is required' }, { status: 400 });
    }

    const permit = await getPermitById(params.id);
    if (!permit) return NextResponse.json({ error: 'Permit not found' }, { status: 404 });

    const allowed = VALID_TRANSITIONS[permit.status as PermitStatus];
    if (allowed && !allowed.includes(status as PermitStatus)) {
      return NextResponse.json(
        { error: `Cannot transition ${permit.status} → ${status}` },
        { status: 422 },
      );
    }

    const updated = await updatePermitStatus(params.id, status as PermitStatus, notes);

    // Audit log — fire-and-forget
    const auditAction = STATUS_AUDIT_ACTION[status];
    if (auditAction) {
      const sessionUser = session?.user as Record<string, unknown> | undefined;
      const performerId = (sessionUser?.id as string | undefined) ?? 'system';
      logAction({
        action:      auditAction as any,
        entity:      'PERMIT',
        entityId:    permit.id,
        entityRef:   permit.permitNumber,
        performedBy: { id: performerId } as any,
        ipAddress:   req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? '',
        deviceInfo:  req.headers.get('user-agent') ?? '',
        changes:     [{ field: 'status', from: permit.status, to: status }],
        metadata:    { notes: notes ?? null, role: sessionUser?.role ?? null },
      }).catch(err => console.error('[audit status]', err));
    }

    // When permit is submitted, create approval record + move to UNDER_REVIEW
    if (status === 'SUBMITTED') {
      // Check if an approval already exists (idempotent)
      const existing = await db.approval.findFirst({ where: { permitId: params.id, decision: null } });
      if (!existing) {
        await createApprovalForPermit(permit);
      }
      // Automatically advance to UNDER_REVIEW so approvers see it immediately
      await updatePermitStatus(params.id, 'UNDER_REVIEW');
    }

    // When permit is ACTIVATED, run SIMOPS auto-detection
    if (status === 'ACTIVE' && permit.simopsZone) {
      const sessionUser = (await auth())?.user as Record<string, unknown> | undefined;
      const raisedById  = (sessionUser?.id as string | undefined) ?? 'usr-001';
      runSimopsCheck(
        params.id,
        permit.permitNumber,
        permit.type,
        permit.simopsZone,
        raisedById,
      ).catch(err => console.error('[simops-check]', err)); // fire-and-forget
    }

    // Fire-and-forget email notification
    const performerName = (session?.user as Record<string, unknown> | undefined)?.name as string | undefined;
    const recipients = getRecipients(permit, status as PermitStatus);
    if (recipients.length > 0) {
      sendPermitStatusEmail({
        to:           recipients,
        permitNumber: permit.permitNumber,
        permitTitle:  permit.title,
        status:       status as PermitStatus,
        location:     permit.location,
        performedBy:  performerName ?? 'System',
        notes:        notes ?? undefined,
      }).catch(err => console.error('[email]', err));
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error('[PATCH /api/permits/:id/status]', err);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
