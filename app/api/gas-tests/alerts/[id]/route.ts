/**
 * PATCH /api/gas-tests/alerts/:id
 * Acknowledge a gas alert.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { acknowledgeAlert } from '@/lib/dal/gas.dal';
import { logAction } from '@/lib/dal/audit.dal';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session    = await auth();
    const sessionUser = session?.user as Record<string, unknown> | undefined;
    const userId     = (sessionUser?.id as string | undefined) ?? 'system';

    await acknowledgeAlert(params.id, userId);

    logAction({
      action:      'SYSTEM_ALERT' as any,
      entity:      'GAS_TEST',
      entityId:    params.id,
      entityRef:   params.id,
      performedBy: { id: userId } as any,
      ipAddress:   req.headers.get('x-forwarded-for') ?? '',
      deviceInfo:  req.headers.get('user-agent') ?? '',
      changes:     [{ field: 'acknowledged', from: false, to: true }],
      metadata:    { action: 'ALERT_ACKNOWLEDGED' },
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[PATCH /api/gas-tests/alerts/:id]', err);
    return NextResponse.json({ error: 'Failed to acknowledge alert' }, { status: 500 });
  }
}
