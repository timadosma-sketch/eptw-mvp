import { NextResponse } from 'next/server';
import { getDashboardMetrics, getDashboardAlerts } from '@/lib/dal/dashboard.dal';

export async function GET() {
  try {
    const [metrics, alerts] = await Promise.all([
      getDashboardMetrics(),
      getDashboardAlerts(),
    ]);
    return NextResponse.json({ metrics, alerts });
  } catch (err) {
    console.error('[GET /api/dashboard]', err);
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 });
  }
}
