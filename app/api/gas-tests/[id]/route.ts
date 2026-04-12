import { NextRequest, NextResponse } from 'next/server';
import { getGasTestsByPermit, getLatestReadingsByPermit } from '@/lib/dal/gas.dal';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { searchParams } = new URL(req.url);
    const latest = searchParams.get('latest') === 'true';

    if (latest) {
      const data = await getLatestReadingsByPermit(params.id);
      return NextResponse.json({ data });
    }

    const data = await getGasTestsByPermit(params.id);
    return NextResponse.json({ data });
  } catch (err) {
    console.error('[GET /api/gas-tests/:id]', err);
    return NextResponse.json({ error: 'Failed to fetch gas tests' }, { status: 500 });
  }
}
