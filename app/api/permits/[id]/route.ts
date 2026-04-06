import { NextRequest, NextResponse } from 'next/server';
import { getPermitById, updatePermit } from '@/lib/dal/permits.dal';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const permit = await getPermitById(params.id);
    if (!permit) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(permit);
  } catch (err) {
    console.error('[GET /api/permits/:id]', err);
    return NextResponse.json({ error: 'Failed to fetch permit' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const permit = await updatePermit(params.id, body);
    return NextResponse.json(permit);
  } catch (err) {
    console.error('[PATCH /api/permits/:id]', err);
    return NextResponse.json({ error: 'Failed to update permit' }, { status: 500 });
  }
}
