import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getIsolationByPermit, getIsolationById, updateIsolationStatus } from '@/lib/dal/isolation.dal';
import { logAction } from '@/lib/dal/audit.dal';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { searchParams } = new URL(req.url);
    const byPermit = searchParams.get('byPermit') === 'true';

    const cert = byPermit
      ? await getIsolationByPermit(params.id)
      : await getIsolationById(params.id);

    if (!cert) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(cert);
  } catch (err) {
    console.error('[GET /api/isolation/:id]', err);
    return NextResponse.json({ error: 'Failed to fetch isolation cert' }, { status: 500 });
  }
}

const VALID_ISO_TRANSITIONS: Record<string, string[]> = {
  ISOLATED:  ['VERIFIED', 'CANCELLED'],
  VERIFIED:  ['RELEASED', 'ISOLATED'],   // un-verify → back to ISOLATED
  RELEASED:  [],                          // terminal
  CANCELLED: [],                          // terminal
  PENDING:   ['ISOLATED', 'CANCELLED'],
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ error: 'status is required' }, { status: 400 });
    }

    const cert = await getIsolationById(params.id);
    if (!cert) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const allowed = VALID_ISO_TRANSITIONS[cert.status] ?? [];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition ${cert.status} → ${status}` },
        { status: 422 },
      );
    }

    const sessionUser = session?.user as Record<string, unknown> | undefined;
    const performerId = (sessionUser?.id as string | undefined) ?? null;

    const updated = await updateIsolationStatus(
      params.id,
      status as 'ISOLATED' | 'VERIFIED' | 'RELEASED' | 'CANCELLED',
      performerId,
    );

    // Audit log — fire-and-forget
    const auditAction = status === 'VERIFIED'  ? 'ISOLATION_APPLIED'
                       : status === 'RELEASED' ? 'ISOLATION_RELEASED'
                       : 'ISOLATION_APPLIED';
    logAction({
      action:      auditAction as any,
      entity:      'ISOLATION',
      entityId:    cert.id,
      entityRef:   cert.certificateNumber,
      performedBy: { id: performerId ?? 'system' } as any,
      ipAddress:   req.headers.get('x-forwarded-for') ?? '',
      deviceInfo:  req.headers.get('user-agent') ?? '',
      changes:     [{ field: 'status', from: cert.status, to: status }],
      metadata:    {},
    }).catch(err => console.error('[audit isolation]', err));

    return NextResponse.json(updated);
  } catch (err) {
    console.error('[PATCH /api/isolation/:id]', err);
    return NextResponse.json({ error: 'Failed to update isolation status' }, { status: 500 });
  }
}
