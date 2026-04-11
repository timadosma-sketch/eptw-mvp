import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { resolveConflict } from '@/lib/dal/simops.dal';
import { logAction } from '@/lib/dal/audit.dal';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    const { resolution } = await req.json();

    if (!resolution) {
      return NextResponse.json({ error: 'resolution is required' }, { status: 400 });
    }

    const sessionUser = session?.user as Record<string, unknown> | undefined;
    const performerId = (sessionUser?.id as string | undefined) ?? null;

    const updated = await resolveConflict(params.id, performerId, resolution);

    // Audit log — fire-and-forget
    logAction({
      action:      'SIMOPS_CONFLICT_RAISED' as any, // closest existing action; db has no SIMOPS_RESOLVED yet
      entity:      'SYSTEM',
      entityId:    params.id,
      entityRef:   `SIMOPS-${params.id.slice(-6).toUpperCase()}`,
      performedBy: { id: performerId ?? 'system' } as any,
      ipAddress:   req.headers.get('x-forwarded-for') ?? '',
      deviceInfo:  req.headers.get('user-agent') ?? '',
      changes:     [{ field: 'isActive', from: true, to: false }],
      metadata:    { resolution },
    }).catch(err => console.error('[audit simops resolve]', err));

    return NextResponse.json(updated);
  } catch (err) {
    console.error('[PATCH /api/simops/:id]', err);
    return NextResponse.json({ error: 'Failed to resolve conflict' }, { status: 500 });
  }
}
