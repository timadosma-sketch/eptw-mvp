import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAllGasTests, submitGasTest, getActiveAlerts } from '@/lib/dal/gas.dal';
import { logAction } from '@/lib/dal/audit.dal';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const alerts = searchParams.get('alerts') === 'true';

    if (alerts) {
      const data = await getActiveAlerts();
      return NextResponse.json({ data });
    }

    const data = await getAllGasTests();
    return NextResponse.json({ data, total: data.length });
  } catch (err) {
    console.error('[GET /api/gas-tests]', err);
    return NextResponse.json({ error: 'Failed to fetch gas tests' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();

    const record = await submitGasTest(
      body.permitId,
      body.permitNumber ?? '',
      body.testerId,
      body.location,
      body.readings,
      body.notes ?? '',
    );

    // Determine audit action based on gas test result
    const isFailed = record.overallStatus === 'DANGER';
    const auditAction = isFailed ? 'GAS_TEST_FAILED' : 'GAS_TEST_RECORDED';

    const sessionUser = session?.user as Record<string, unknown> | undefined;
    const performerId = (sessionUser?.id as string | undefined) ?? body.testerId ?? 'system';

    logAction({
      action:      auditAction as any,
      entity:      'GAS_TEST',
      entityId:    record.id,
      entityRef:   body.permitNumber ?? body.permitId,
      performedBy: { id: performerId } as any,
      ipAddress:   req.headers.get('x-forwarded-for') ?? '',
      deviceInfo:  req.headers.get('user-agent') ?? '',
      changes:     [],
      metadata:    {
        permitId:      body.permitId,
        location:      body.location,
        overallStatus: record.overallStatus,
        readingCount:  record.readings?.length ?? 0,
      },
    }).catch(err => console.error('[audit gas-test]', err));

    return NextResponse.json(record, { status: 201 });
  } catch (err) {
    console.error('[POST /api/gas-tests]', err);
    return NextResponse.json({ error: 'Failed to submit gas test' }, { status: 500 });
  }
}
