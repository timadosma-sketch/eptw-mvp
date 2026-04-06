import { NextRequest, NextResponse } from 'next/server';
import { updatePermitStatus } from '@/lib/dal/permits.dal';
import type { PermitStatus } from '@/lib/types';

const VALID_TRANSITIONS: Partial<Record<PermitStatus, PermitStatus[]>> = {
  DRAFT:       ['SUBMITTED', 'CANCELLED'],
  SUBMITTED:   ['UNDER_REVIEW', 'CANCELLED'],
  UNDER_REVIEW:['APPROVED', 'REJECTED'],
  APPROVED:    ['ACTIVE', 'CANCELLED'],
  ACTIVE:      ['SUSPENDED', 'CLOSED', 'CANCELLED'],
  SUSPENDED:   ['ACTIVE', 'CANCELLED', 'CLOSED'],
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { status, notes } = await req.json();

    if (!status) {
      return NextResponse.json({ error: 'status is required' }, { status: 400 });
    }

    const permit = await (await import('@/lib/dal/permits.dal')).getPermitById(params.id);
    if (!permit) return NextResponse.json({ error: 'Permit not found' }, { status: 404 });

    const allowed = VALID_TRANSITIONS[permit.status];
    if (allowed && !allowed.includes(status as PermitStatus)) {
      return NextResponse.json(
        { error: `Cannot transition ${permit.status} → ${status}` },
        { status: 422 },
      );
    }

    const updated = await updatePermitStatus(params.id, status as PermitStatus, notes);
    return NextResponse.json(updated);
  } catch (err) {
    console.error('[PATCH /api/permits/:id/status]', err);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
