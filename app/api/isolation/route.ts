import { NextRequest, NextResponse } from 'next/server';
import { getAllIsolationCerts, getActiveIsolations } from '@/lib/dal/isolation.dal';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const active = searchParams.get('active') === 'true';

    const data = active
      ? await getActiveIsolations()
      : await getAllIsolationCerts();

    return NextResponse.json({ data, total: data.length });
  } catch (err) {
    console.error('[GET /api/isolation]', err);
    return NextResponse.json({ error: 'Failed to fetch isolations' }, { status: 500 });
  }
}
