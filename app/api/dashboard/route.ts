import { NextResponse } from 'next/server';
import { getDashboardMetrics, getDashboardAlerts, getPermitTrend } from '@/lib/dal/dashboard.dal';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [metrics, alerts, trend] = await Promise.all([
      getDashboardMetrics(),
      getDashboardAlerts(),
      getPermitTrend(7),
    ]);
    return NextResponse.json({ metrics, alerts, trend });
  } catch (err) {
    console.error('[GET /api/dashboard]', err);
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 });
  }
}
