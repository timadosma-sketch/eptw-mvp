import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getPermitById, updatePermitStatus } from '@/lib/dal/permits.dal';
import { sendPermitStatusEmail } from '@/lib/email';
import type { PermitStatus } from '@/lib/types';

const VALID_TRANSITIONS: Partial<Record<PermitStatus, PermitStatus[]>> = {
  DRAFT:       ['SUBMITTED', 'CANCELLED'],
  SUBMITTED:   ['UNDER_REVIEW', 'CANCELLED'],
  UNDER_REVIEW:['APPROVED', 'REJECTED', 'DRAFT'],  // DRAFT = referred back for revision
  APPROVED:    ['ACTIVE', 'CANCELLED'],
  ACTIVE:      ['SUSPENDED', 'CLOSED', 'CANCELLED'],
  SUSPENDED:   ['ACTIVE', 'CANCELLED', 'CLOSED'],
};

// Who to notify for each transition
function getRecipients(
  permit: Awaited<ReturnType<typeof getPermitById>>,
  newStatus: PermitStatus,
): string[] {
  if (!permit) return [];
  const emails: string[] = [];

  const requester       = (permit as unknown as { requestedBy?: { email?: string } }).requestedBy?.email;
  const areaAuth        = (permit as unknown as { areaAuthority?: { email?: string } }).areaAuthority?.email;
  const issuingAuth     = (permit as unknown as { issuingAuthority?: { email?: string } }).issuingAuthority?.email;

  if (newStatus === 'SUBMITTED') {
    // Notify all assigned approvers
    if (areaAuth)    emails.push(areaAuth);
    if (issuingAuth) emails.push(issuingAuth);
  } else if (['APPROVED', 'REJECTED', 'ACTIVE', 'CLOSED', 'CANCELLED'].includes(newStatus)) {
    // Notify the requester
    if (requester) emails.push(requester);
  } else if (newStatus === 'SUSPENDED') {
    // Notify everyone: requester + authorities
    if (requester)   emails.push(requester);
    if (areaAuth)    emails.push(areaAuth);
    if (issuingAuth) emails.push(issuingAuth);
  }

  // Deduplicate
  return emails.filter((e, i, arr) => e && arr.indexOf(e) === i);
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

    // Fire-and-forget email notification
    const recipients = getRecipients(permit, status as PermitStatus);
    if (recipients.length > 0) {
      const performerName = (session?.user as Record<string, unknown> | undefined)?.name as string | undefined;
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
