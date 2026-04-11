import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getPermitById, updatePermit } from '@/lib/dal/permits.dal';
import { logAction } from '@/lib/dal/audit.dal';

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
    const session  = await auth();
    const body     = await req.json();

    // Only allow PATCH on DRAFT permits (guard at API level)
    const existing = await getPermitById(params.id);
    if (existing && existing.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Only DRAFT permits can be edited directly' },
        { status: 422 },
      );
    }

    const permit = await updatePermit(params.id, body);

    // Audit log
    const sessionUser = session?.user as Record<string, unknown> | undefined;
    const performerId = (sessionUser?.id as string | undefined) ?? 'system';
    logAction({
      action:      'PERMIT_CREATED' as any,  // reuse as proxy for PERMIT_UPDATED
      entity:      'PERMIT',
      entityId:    params.id,
      entityRef:   existing?.permitNumber ?? params.id,
      performedBy: { id: performerId } as any,
      ipAddress:   req.headers.get('x-forwarded-for') ?? '',
      deviceInfo:  req.headers.get('user-agent') ?? '',
      changes:     Object.keys(body).map(field => ({
        field,
        from: (existing as Record<string, unknown> | null)?.[field],
        to:   body[field],
      })),
      metadata: { action: 'PERMIT_EDITED' },
    }).catch(() => {});

    return NextResponse.json(permit);
  } catch (err) {
    console.error('[PATCH /api/permits/:id]', err);
    return NextResponse.json({ error: 'Failed to update permit' }, { status: 500 });
  }
}
