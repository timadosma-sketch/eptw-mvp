import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * HSE incidents are stored as AuditEntry rows where `entity = 'HSEIncident'`.
 * The `metadata` JSON field carries the structured incident data.
 * No schema migration required — piggybacks on the existing audit table.
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pageSize = Number(searchParams.get('pageSize') ?? 100);
    const status   = searchParams.get('status') ?? undefined;

    const rows = await db.auditEntry.findMany({
      where: {
        entity: 'HSEIncident',
        ...(status ? { metadata: { path: ['status'], equals: status } } : {}),
      },
      orderBy: { performedAt: 'desc' },
      take: pageSize,
      include: { performedBy: true },
    });

    const data = rows.map(r => ({
      id: r.entityId,
      ...(typeof r.metadata === 'object' && r.metadata !== null ? r.metadata as Record<string, unknown> : {}),
      reportedBy: r.performedBy?.name ?? '—',
      reportedAt: (r.metadata as Record<string, unknown>)?.reportedAt ?? r.performedAt,
    }));

    return NextResponse.json({ data, total: rows.length });
  } catch (err) {
    console.error('[GET /api/hse]', err);
    return NextResponse.json({ error: 'Failed to fetch incidents' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, description, location, reportedById, immediateActions, injuries } = body;

    if (!type || !description?.trim() || !location?.trim()) {
      return NextResponse.json(
        { error: 'type, description and location are required' },
        { status: 400 },
      );
    }

    // Generate a human-readable incident number
    const year  = new Date().getFullYear();
    const count = await db.auditEntry.count({ where: { entity: 'HSEIncident' } });
    const incidentId = `INC-${year}-${String(count + 1).padStart(4, '0')}`;

    const row = await db.auditEntry.create({
      data: {
        action:        'SYSTEM_ALERT',
        entity:        'HSEIncident',
        entityId:      incidentId,
        entityRef:     incidentId,
        performedById: reportedById ?? 'usr-001',
        ipAddress:     '',
        deviceInfo:    '',
        metadata: {
          id:               incidentId,
          type,
          description:      description.trim(),
          location:         location.trim(),
          immediateActions: (immediateActions ?? '').trim(),
          injuries:         (injuries ?? '').trim(),
          status:           'OPEN',
          reportedAt:       new Date().toISOString(),
        },
      },
      include: { performedBy: true },
    });

    const incident = {
      id: row.entityId,
      ...(typeof row.metadata === 'object' && row.metadata !== null ? row.metadata as Record<string, unknown> : {}),
      reportedBy: row.performedBy?.name ?? '—',
      reportedAt: row.performedAt,
    };

    return NextResponse.json(incident, { status: 201 });
  } catch (err) {
    console.error('[POST /api/hse]', err);
    return NextResponse.json({ error: 'Failed to create incident' }, { status: 500 });
  }
}

/**
 * PATCH /api/hse  — update status of an incident
 * Body: { id: string, status: 'OPEN' | 'UNDER_INVESTIGATION' | 'CLOSED' }
 */
export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'id and status required' }, { status: 400 });
    }

    const existing = await db.auditEntry.findFirst({ where: { entity: 'HSEIncident', entityId: id } });
    if (!existing) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    const updatedMeta = {
      ...(typeof existing.metadata === 'object' && existing.metadata !== null
        ? existing.metadata as Record<string, unknown>
        : {}),
      status,
      closedAt: status === 'CLOSED' ? new Date().toISOString() : undefined,
    };

    await db.auditEntry.update({
      where: { id: existing.id },
      data:  { metadata: updatedMeta },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[PATCH /api/hse]', err);
    return NextResponse.json({ error: 'Failed to update incident' }, { status: 500 });
  }
}
