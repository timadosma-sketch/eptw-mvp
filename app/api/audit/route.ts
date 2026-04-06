import { NextRequest, NextResponse } from 'next/server';
import { getAuditLog } from '@/lib/dal/audit.dal';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const entityId = searchParams.get('entityId') ?? undefined;
    const page     = Number(searchParams.get('page') ?? 1);
    const pageSize = Number(searchParams.get('pageSize') ?? 20);

    const result = await getAuditLog(entityId, page, pageSize);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[GET /api/audit]', err);
    return NextResponse.json({ error: 'Failed to fetch audit log' }, { status: 500 });
  }
}
