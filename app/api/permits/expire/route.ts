/**
 * POST /api/permits/expire
 *
 * Called by a Vercel cron job (or external scheduler) to automatically
 * close/expire ACTIVE permits whose validTo has passed.
 *
 * Authorization: checked via CRON_SECRET header to prevent unauthorized calls.
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logAction } from '@/lib/dal/audit.dal';

export async function POST(req: NextRequest) {
  // Simple secret-header guard — set CRON_SECRET in Vercel env
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const now = new Date();

    // Find ACTIVE permits whose validTo is in the past
    const expiredPermits = await db.permit.findMany({
      where: {
        status: 'ACTIVE',
        validTo: { lt: now },
      },
      select: { id: true, permitNumber: true, title: true },
    });

    if (expiredPermits.length === 0) {
      return NextResponse.json({ expired: 0, message: 'No permits to expire' });
    }

    // Batch update to EXPIRED status
    const ids = expiredPermits.map(p => p.id);
    await db.permit.updateMany({
      where: { id: { in: ids } },
      data:  { status: 'EXPIRED' as any },
    });

    // Mark overdue approvals
    await db.approval.updateMany({
      where: { decision: null, dueBy: { lt: now } },
      data:  { isOverdue: true },
    });

    // Audit log each expiry — fire-and-forget
    for (const p of expiredPermits) {
      logAction({
        action:      'PERMIT_CLOSED' as any, // use CLOSED as proxy (no PERMIT_EXPIRED enum yet)
        entity:      'PERMIT',
        entityId:    p.id,
        entityRef:   p.permitNumber,
        performedBy: { id: 'system' } as any,
        ipAddress:   '',
        deviceInfo:  'cron/expire',
        changes:     [{ field: 'status', from: 'ACTIVE', to: 'EXPIRED' }],
        metadata:    { reason: 'Auto-expired: validTo exceeded' },
      }).catch(() => {});
    }

    console.log(`[expire-job] Expired ${expiredPermits.length} permits:`, ids);

    return NextResponse.json({
      expired: expiredPermits.length,
      permits: expiredPermits.map(p => p.permitNumber),
    });
  } catch (err) {
    console.error('[POST /api/permits/expire]', err);
    return NextResponse.json({ error: 'Expire job failed' }, { status: 500 });
  }
}
