/**
 * POST /api/alerts/check
 *
 * Safety checks that run on a schedule (30-second poll from the client
 * AlertSyncer, or a Vercel cron).  Creates Alert records in the DB for:
 *
 *  1. Permits expiring within 2 h  → WARNING alert
 *  2. Permits expiring within 30 min → CRITICAL alert
 *  3. Gas test overdue — ACTIVE permit with gasTestRequired=true and
 *     no gas test recorded in the last 60 min → WARNING alert
 *
 * Idempotent: skips creating a duplicate alert for the same permit if an
 * unacknowledged alert with the same title already exists.
 */
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const EXPIRY_WARNING_H  = 2;    // hours before expiry → WARNING
const EXPIRY_CRITICAL_H = 0.5;  // hours before expiry → CRITICAL
const GAS_OVERDUE_MIN   = 60;   // minutes since last gas test before WARNING

export async function POST() {
  try {
    const now        = new Date();
    const in2h       = new Date(now.getTime() + EXPIRY_WARNING_H  * 3_600_000);
    const in30m      = new Date(now.getTime() + EXPIRY_CRITICAL_H * 3_600_000);
    const gasOverdue = new Date(now.getTime() - GAS_OVERDUE_MIN   * 60_000);

    const created: string[] = [];

    // ── 1. Permits expiring soon ─────────────────────────────────────────
    const expiring = await db.permit.findMany({
      where: {
        status: { in: ['ACTIVE', 'APPROVED'] },
        validTo: { gte: now, lte: in2h },
      },
      select: { id: true, permitNumber: true, validTo: true },
    });

    for (const p of expiring) {
      const isCritical    = p.validTo <= in30m;
      const alertTitle    = `Permit ${p.permitNumber} expiring ${isCritical ? 'in <30 min' : 'in <2 h'}`;
      const severity      = isCritical ? 'CRITICAL' : 'WARNING';

      // Skip if unacknowledged alert with same title already exists
      const existing = await db.alert.findFirst({
        where: { title: alertTitle, acknowledged: false },
      });
      if (existing) continue;

      await db.alert.create({
        data: {
          severity,
          title:    alertTitle,
          message:  `Permit ${p.permitNumber} will expire at ${p.validTo.toISOString()}. Extend, close or hand over before work stops.`,
          permitId: p.id,
          permitNumber: p.permitNumber,
          autoExpires: true,
          expiresAt:   new Date(p.validTo.getTime() + 60_000), // auto-expire 1 min after permit expiry
        },
      });
      created.push(alertTitle);
    }

    // ── 2. Gas test overdue ──────────────────────────────────────────────
    const gasRequiredPermits = await db.permit.findMany({
      where: {
        status:          'ACTIVE',
        gasTestRequired: true,
      },
      select: { id: true, permitNumber: true },
    });

    for (const p of gasRequiredPermits) {
      const lastTest = await db.gasTestRecord.findFirst({
        where:   { permitId: p.id },
        orderBy: { testedAt: 'desc' },
        select:  { testedAt: true },
      });

      const isOverdue = !lastTest || lastTest.testedAt < gasOverdue;
      if (!isOverdue) continue;

      const alertTitle = `Gas test overdue — ${p.permitNumber}`;
      const existing   = await db.alert.findFirst({
        where: { title: alertTitle, acknowledged: false },
      });
      if (existing) continue;

      await db.alert.create({
        data: {
          severity:     'WARNING',
          title:        alertTitle,
          message:      `Permit ${p.permitNumber} requires a gas test every ${GAS_OVERDUE_MIN} min. Last test: ${lastTest ? lastTest.testedAt.toISOString() : 'never'}. Stop work if atmosphere is unverified.`,
          permitId:     p.id,
          permitNumber: p.permitNumber,
          autoExpires:  false,
        },
      });
      created.push(alertTitle);
    }

    // ── 3. Auto-expire old alerts ────────────────────────────────────────
    const autoExpired = await db.alert.updateMany({
      where: {
        autoExpires:  true,
        expiresAt:    { lt: now },
        acknowledged: false,
      },
      data: { acknowledged: true, acknowledgedAt: now, acknowledgedBy: 'system' },
    });

    return NextResponse.json({
      ok:          true,
      alertsCreated: created.length,
      alerts:      created,
      autoExpired: autoExpired.count,
    });
  } catch (err) {
    console.error('[POST /api/alerts/check]', err);
    return NextResponse.json({ error: 'Alert check failed' }, { status: 500 });
  }
}
