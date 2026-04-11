import { NextRequest, NextResponse } from 'next/server';
import { getApprovals, getPendingApprovals, getApprovalsByPermit } from '@/lib/dal/approvals.dal';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pending  = searchParams.get('pending')  === 'true';
    const permitId = searchParams.get('permitId');

    // Lookup by specific permit
    if (permitId) {
      const data = await getApprovalsByPermit(permitId);
      return NextResponse.json({ data, total: data.length });
    }

    if (pending) {
      const data = await getPendingApprovals();
      return NextResponse.json({ data, total: data.length });
    }

    const page     = Number(searchParams.get('page') ?? 1);
    const pageSize = Number(searchParams.get('pageSize') ?? 20);
    const result = await getApprovals({}, page, pageSize);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[GET /api/approvals]', err);
    return NextResponse.json({ error: 'Failed to fetch approvals' }, { status: 500 });
  }
}
