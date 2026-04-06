import { NextRequest, NextResponse } from 'next/server';
import { getAllGasTests, submitGasTest, getActiveAlerts } from '@/lib/dal/gas.dal';

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
    const body = await req.json();

    const record = await submitGasTest(
      body.permitId,
      body.permitNumber ?? '',
      body.testerId,
      body.location,
      body.readings,
      body.notes ?? '',
    );

    return NextResponse.json(record, { status: 201 });
  } catch (err) {
    console.error('[POST /api/gas-tests]', err);
    return NextResponse.json({ error: 'Failed to submit gas test' }, { status: 500 });
  }
}
