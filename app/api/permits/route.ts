import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getPermits } from '@/lib/dal/permits.dal';
import type { PermitFilters } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const filters: PermitFilters = {};
    const status = searchParams.get('status');
    const type   = searchParams.get('type');
    const risk   = searchParams.get('riskLevel');
    const search = searchParams.get('search');
    const area   = searchParams.get('area');

    if (status) filters.status   = status.split(',') as any;
    if (type)   filters.type     = type.split(',') as any;
    if (risk)   filters.riskLevel = risk.split(',') as any;
    if (search) filters.search   = search;
    if (area)   filters.area     = area;

    const page     = Number(searchParams.get('page') ?? 1);
    const pageSize = Number(searchParams.get('pageSize') ?? 20);

    const result = await getPermits(filters, page, pageSize);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[GET /api/permits]', err);
    return NextResponse.json({ error: 'Failed to fetch permits' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const sessionUserId = (session?.user as Record<string, unknown> | undefined)?.id as string | undefined;

    const body = await req.json();
    const { db } = await import('@/lib/db');
    const { mapPermit } = await import('@/lib/dal/mappers');

    const PERMIT_INCLUDE = {
      requestedBy: true, areaAuthority: true, issuingAuthority: true,
      hseOfficer: true, contractors: true, attachments: true,
      approvals: { include: { assignedTo: true } },
    } as const;

    // Generate permit number
    const count = await db.permit.count();
    const permitNumber = `PTW-${new Date().getFullYear()}-${String(count + 850).padStart(4, '0')}`;

    const row = await db.permit.create({
      data: {
        permitNumber,
        type:         body.type         ?? 'COLD_WORK',
        status:       'DRAFT',
        riskLevel:    body.riskLevel    ?? 'LOW',
        title:        body.title        ?? '',
        description:  body.description  ?? '',
        location:     body.location     ?? '',
        unit:         body.unit         ?? '',
        area:         body.area         ?? '',
        equipment:    body.equipment    ?? '',
        requestedById: body.requestedById ?? sessionUserId ?? 'usr-001',
        areaAuthorityId:    body.areaAuthorityId    ?? null,
        issuingAuthorityId: body.issuingAuthorityId ?? null,
        hseOfficerId:       body.hseOfficerId       ?? null,
        validFrom:  new Date(body.validFrom  ?? Date.now()),
        validTo:    new Date(body.validTo    ?? Date.now() + 12 * 3600_000),
        gasTestRequired:     body.gasTestRequired     ?? false,
        isolationRequired:   body.isolationRequired   ?? false,
        confinedSpaceEntry:  body.confinedSpaceEntry  ?? false,
        hotWorkDetails:      body.hotWorkDetails      ?? undefined,
        jsaCompleted:        body.jsaCompleted        ?? false,
        toolboxTalkCompleted: body.toolboxTalkCompleted ?? false,
        workerCount:  body.workerCount ?? 0,
        notes:        body.notes       ?? '',
        simopsZone:   body.simopsZone  ?? '',
        qrCode:       `QR-${permitNumber}`,
      },
      include: PERMIT_INCLUDE,
    });

    return NextResponse.json(mapPermit(row), { status: 201 });
  } catch (err) {
    console.error('[POST /api/permits]', err);
    return NextResponse.json({ error: 'Failed to create permit' }, { status: 500 });
  }
}
