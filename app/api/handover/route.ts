import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { logAction } from '@/lib/dal/audit.dal';

export async function GET(_req: NextRequest) {
  try {
    const rows = await db.shiftHandover.findMany({
      include: { outgoingSupervisor: true, incomingSupervisor: true },
      orderBy: { completedAt: 'desc' },
      take: 20,
    });
    return NextResponse.json({ data: rows, total: rows.length });
  } catch (err) {
    console.error('[GET /api/handover]', err);
    return NextResponse.json({ error: 'Failed to fetch handovers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();

    const {
      outgoingSupervisorId,
      incomingSupervisorId,
      activePermitCount   = 0,
      suspendedCount      = 0,
      gasAlertCount       = 0,
      simopsConflictCount = 0,
      workerCount         = 0,
      incidentCount       = 0,
      notes               = '',
      shift               = 'DAY',
    } = body;

    if (!outgoingSupervisorId || !incomingSupervisorId) {
      return NextResponse.json({ error: 'outgoingSupervisorId and incomingSupervisorId are required' }, { status: 400 });
    }

    const handover = await db.shiftHandover.create({
      data: {
        outgoingSupervisorId,
        incomingSupervisorId,
        shift,
        activePermitCount,
        suspendedCount,
        gasAlertCount,
        simopsConflictCount,
        workerCount,
        incidentCount,
        notes,
      },
      include: { outgoingSupervisor: true, incomingSupervisor: true },
    });

    // Audit log — fire-and-forget
    const sessionUser = session?.user as Record<string, unknown> | undefined;
    const performerId = (sessionUser?.id as string | undefined) ?? outgoingSupervisorId;

    logAction({
      action:      'SHIFT_HANDOVER_COMPLETED',
      entity:      'SYSTEM',
      entityId:    handover.id,
      entityRef:   'SHIFT-HANDOVER',
      performedBy: { id: performerId } as any,
      ipAddress:   req.headers.get('x-forwarded-for') ?? '',
      deviceInfo:  req.headers.get('user-agent') ?? '',
      changes:     [],
      metadata:    {
        outgoing: handover.outgoingSupervisor.name,
        incoming: handover.incomingSupervisor.name,
        shift,
        activePermits: activePermitCount,
        notes,
      },
    }).catch(err => console.error('[audit handover]', err));

    return NextResponse.json(handover, { status: 201 });
  } catch (err) {
    console.error('[POST /api/handover]', err);
    return NextResponse.json({ error: 'Failed to create handover' }, { status: 500 });
  }
}
