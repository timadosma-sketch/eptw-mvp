import { NextRequest, NextResponse } from 'next/server';
import { getAllConflicts, getActiveConflicts } from '@/lib/dal/simops.dal';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const active = searchParams.get('active') === 'true';

    const data = active
      ? await getActiveConflicts()
      : await getAllConflicts();

    return NextResponse.json({ data, total: data.length });
  } catch (err) {
    console.error('[GET /api/simops]', err);
    return NextResponse.json({ error: 'Failed to fetch SIMOPS conflicts' }, { status: 500 });
  }
}
