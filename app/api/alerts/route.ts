import { NextRequest, NextResponse } from 'next/server';
import { getDashboardAlerts } from '@/lib/dal/dashboard.dal';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/alerts
 * Returns all unacknowledged (non-expired) alerts for the TopBar bell / AlertSyncer.
 */
export async function GET(_req: NextRequest) {
  try {
    const data = await getDashboardAlerts();
    return NextResponse.json({ data, total: data.length });
  } catch (err) {
    console.error('[GET /api/alerts]', err);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}

/**
 * PATCH /api/alerts  — acknowledge a specific alert by id
 * Body: { id: string, acknowledgedBy?: string }
 */
export async function PATCH(req: NextRequest) {
  try {
    const { id, acknowledgedBy } = await req.json();
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    await db.alert.update({
      where: { id },
      data:  { acknowledged: true, acknowledgedBy: acknowledgedBy ?? null },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[PATCH /api/alerts]', err);
    return NextResponse.json({ error: 'Failed to acknowledge alert' }, { status: 500 });
  }
}
