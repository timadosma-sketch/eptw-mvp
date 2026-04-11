import { NextRequest, NextResponse } from 'next/server';
import { getAuditLog } from '@/lib/dal/audit.dal';
import type { AuditEntry } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const entityId  = searchParams.get('entityId') ?? undefined;
    const entity    = searchParams.get('entity')   ?? undefined;
    const page      = Number(searchParams.get('page') ?? 1);
    const pageSize  = Number(searchParams.get('pageSize') ?? 20);

    const result = await getAuditLog(entityId, page, pageSize, entity);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[GET /api/audit]', err);
    return NextResponse.json({ error: 'Failed to fetch audit log' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { logAction } = await import('@/lib/dal/audit.dal');
    const entry = await logAction({
      action:       body.action ?? 'SYSTEM_ALERT',
      entity:       body.entity ?? 'SYSTEM',
      entityId:     body.entityId ?? 'system',
      entityRef:    body.entityRef ?? '',
      performedBy:  { id: body.performedById ?? 'usr-001' } as AuditEntry['performedBy'],
      ipAddress:    body.ipAddress ?? '',
      deviceInfo:   body.deviceInfo ?? '',
      changes:      body.changes ?? [],
      metadata:     body.metadata ?? {},
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (err) {
    console.error('[POST /api/audit]', err);
    return NextResponse.json({ error: 'Failed to log audit entry' }, { status: 500 });
  }
}
