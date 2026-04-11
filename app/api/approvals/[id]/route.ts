import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getApprovalById, submitDecision } from '@/lib/dal/approvals.dal';
import { getPermitById, updatePermitStatus } from '@/lib/dal/permits.dal';
import { sendPermitStatusEmail } from '@/lib/email';
import { logAction } from '@/lib/dal/audit.dal';
import type { ApprovalDecision, PermitStatus } from '@/lib/types';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const approval = await getApprovalById(params.id);
    if (!approval) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(approval);
  } catch (err) {
    console.error('[GET /api/approvals/:id]', err);
    return NextResponse.json({ error: 'Failed to fetch approval' }, { status: 500 });
  }
}

// Map approval decision → permit status transition
const DECISION_TO_STATUS: Record<ApprovalDecision, PermitStatus> = {
  APPROVED:      'APPROVED',
  REJECTED:      'REJECTED',
  REFERRED_BACK: 'DRAFT',    // Return to requester for revision
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    const { decision, comments, conditions } = await req.json();

    if (!decision) {
      return NextResponse.json({ error: 'decision is required' }, { status: 400 });
    }

    const updated = await submitDecision(
      params.id,
      decision as ApprovalDecision,
      comments ?? '',
      conditions ?? [],
    );

    // Cascade to permit status
    const newPermitStatus = DECISION_TO_STATUS[decision as ApprovalDecision];
    if (newPermitStatus && updated.permitId) {
      try {
        await updatePermitStatus(updated.permitId, newPermitStatus);

        // Fetch permit to get requester email for notification
        const permit = await getPermitById(updated.permitId);
        if (permit) {
          const requesterEmail = (permit as unknown as { requestedBy?: { email?: string } }).requestedBy?.email;
          if (requesterEmail) {
            const performerName = (session?.user as Record<string, unknown> | undefined)?.name as string | undefined;
            sendPermitStatusEmail({
              to:           requesterEmail,
              permitNumber: permit.permitNumber,
              permitTitle:  permit.title,
              status:       newPermitStatus,
              location:     permit.location,
              performedBy:  performerName ?? updated.assignedTo?.name ?? 'Approver',
              notes:        comments ?? undefined,
            }).catch(err => console.error('[email approval]', err));
          }
        }
      } catch (cascadeErr) {
        // Log but don't fail — decision is already recorded
        console.error('[approvals cascade]', cascadeErr);
      }
    }

    // Audit log — fire-and-forget
    const sessionUser = session?.user as Record<string, unknown> | undefined;
    const performerId = (sessionUser?.id as string | undefined) ?? 'system';
    const auditAction = decision === 'APPROVED' ? 'PERMIT_APPROVED'
      : decision === 'REJECTED' ? 'PERMIT_REJECTED'
      : 'APPROVAL_SUBMITTED';
    logAction({
      action:      auditAction as any,
      entity:      'PERMIT',
      entityId:    updated.permitId ?? params.id,
      entityRef:   updated.permitNumber,
      performedBy: { id: performerId } as any,
      ipAddress:   req.headers.get('x-forwarded-for') ?? '',
      deviceInfo:  req.headers.get('user-agent') ?? '',
      changes:     [{ field: 'approval.decision', from: null, to: decision }],
      metadata:    { approvalId: params.id, comments: comments ?? null },
    }).catch(err => console.error('[audit approval]', err));

    return NextResponse.json(updated);
  } catch (err) {
    console.error('[PATCH /api/approvals/:id]', err);
    return NextResponse.json({ error: 'Failed to submit decision' }, { status: 500 });
  }
}
