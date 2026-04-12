import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mapUser } from '@/lib/dal/mappers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');

    const rows = await db.user.findMany({
      where: role ? { role: role as any } : undefined,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ data: rows.map(mapUser) });
  } catch (err) {
    console.error('[GET /api/users]', err);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.email || !body.role) {
      return NextResponse.json({ error: 'name, email, and role are required' }, { status: 400 });
    }

    // Check for existing email
    const existing = await db.user.findUnique({ where: { email: body.email } });
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
    }

    const count = await db.user.count();
    const employeeId = `EMP-${String(count + 1000).padStart(4, '0')}`;
    const avatarInitials = body.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    const row = await db.user.create({
      data: {
        employeeId,
        name:           body.name,
        email:          body.email,
        role:           body.role,
        department:     body.department  ?? 'Operations',
        company:        body.company     ?? 'Al-Noor Refinery',
        phone:          body.phone       ?? '',
        isContractor:   body.isContractor ?? false,
        avatarInitials,
        certifications: body.certifications ?? [],
      },
    });

    return NextResponse.json(mapUser(row), { status: 201 });
  } catch (err) {
    console.error('[POST /api/users]', err);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
