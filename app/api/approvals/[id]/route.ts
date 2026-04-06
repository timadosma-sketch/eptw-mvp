import { NextRequest, NextResponse } from 'next/server';
import { getApprovalById, submitDecision } from '@/lib/dal/approvals.dal';
import type { ApprovalDecision } from '@/lib/types';

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
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
    return NextResponse.json(updated);
  } catch (err) {
    console.error('[PATCH /api/approvals/:id]', err);
    return NextResponse.json({ error: 'Failed to submit decision' }, { status: 500 });
  }
}
