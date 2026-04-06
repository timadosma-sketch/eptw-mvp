import { NextRequest, NextResponse } from 'next/server';
import { getIsolationByPermit, getIsolationById } from '@/lib/dal/isolation.dal';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { searchParams } = new URL(req.url);
    const byPermit = searchParams.get('byPermit') === 'true';

    const cert = byPermit
      ? await getIsolationByPermit(params.id)
      : await getIsolationById(params.id);

    if (!cert) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(cert);
  } catch (err) {
    console.error('[GET /api/isolation/:id]', err);
    return NextResponse.json({ error: 'Failed to fetch isolation cert' }, { status: 500 });
  }
}
