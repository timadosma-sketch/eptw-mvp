import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mapUser } from '@/lib/dal/mappers';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');

    const rows = await db.user.findMany({
      where: role ? { role: role as any } : undefined,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ data: rows.map(mapUser) });
  } catch (err) {
    console.error('[GET /api/users]', err);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
