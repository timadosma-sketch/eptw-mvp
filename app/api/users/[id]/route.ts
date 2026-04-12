import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mapUser } from '@/lib/dal/mappers';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { id } = params;

    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only allow updating safe fields — never employeeId, id
    const allowedFields = ['name', 'role', 'department', 'company', 'phone', 'isContractor', 'certifications'] as const;
    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) data[field] = body[field];
    }

    // Recompute avatarInitials if name changed
    if (data.name && typeof data.name === 'string') {
      data.avatarInitials = data.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }

    const row = await db.user.update({ where: { id }, data });
    return NextResponse.json(mapUser(row));
  } catch (err) {
    console.error('[PATCH /api/users/:id]', err);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    // Soft-delete: just prevent login by clearing any session; for MVP we hard-delete
    // but guard against deleting the last admin
    const admins = await db.user.count({ where: { role: 'SYSTEM_ADMIN' } });
    const target = await db.user.findUnique({ where: { id } });
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (target.role === 'SYSTEM_ADMIN' && admins <= 1) {
      return NextResponse.json({ error: 'Cannot delete the last system admin' }, { status: 422 });
    }
    await db.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/users/:id]', err);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
