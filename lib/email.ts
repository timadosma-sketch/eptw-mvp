/**
 * Email notifications for the ePTW platform via Resend.
 * All sends are fire-and-forget — a failure never breaks the main flow.
 * Gracefully no-ops when RESEND_API_KEY is not configured.
 */

import { Resend } from 'resend';
import type { PermitStatus } from '@/lib/types';

// ─── Client ───────────────────────────────────────────────────────────────────

const apiKey = process.env.RESEND_API_KEY;
const FROM    = process.env.RESEND_FROM ?? 'ePTW <noreply@eptw.alnoor.kz>';
const resend  = apiKey ? new Resend(apiKey) : null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusLabel(status: PermitStatus): string {
  const MAP: Partial<Record<PermitStatus, string>> = {
    SUBMITTED:    'Submitted for Approval',
    APPROVED:     'Approved',
    REJECTED:     'Rejected',
    ACTIVE:       'Activated',
    SUSPENDED:    'Suspended',
    CLOSED:       'Closed',
    CANCELLED:    'Cancelled',
    UNDER_REVIEW: 'Under Review',
  };
  return MAP[status] ?? status.replace(/_/g, ' ');
}

function statusColor(status: PermitStatus): string {
  if (['APPROVED', 'ACTIVE'].includes(status))     return '#22c55e';
  if (['REJECTED', 'SUSPENDED', 'CANCELLED'].includes(status)) return '#ef4444';
  if (status === 'CLOSED') return '#6b7280';
  return '#f59e0b'; // amber for SUBMITTED / UNDER_REVIEW
}

// ─── Core template ────────────────────────────────────────────────────────────

function buildHtml({
  title,
  preheader,
  permitNumber,
  permitTitle,
  status,
  location,
  bodyHtml,
  ctaUrl,
  ctaLabel,
}: {
  title: string;
  preheader: string;
  permitNumber: string;
  permitTitle: string;
  status: PermitStatus;
  location: string;
  bodyHtml: string;
  ctaUrl?: string;
  ctaLabel?: string;
}): string {
  const color = statusColor(status);
  const label = statusLabel(status);
  const appUrl = process.env.NEXTAUTH_URL ?? 'https://eptw.alnoor.kz';
  const href   = ctaUrl ?? `${appUrl}/permits`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0f1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <!-- preheader -->
  <div style="display:none;max-height:0;overflow:hidden;color:#0f1117;">${preheader}</div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#1a1d27;border-radius:12px;border:1px solid #2a2d3e;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:#141720;padding:20px 28px;border-bottom:1px solid #2a2d3e;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;background:#f59e0b;border-radius:8px;">
                    <span style="color:#000;font-weight:900;font-size:14px;">⚙</span>
                  </div>
                  <span style="color:#fff;font-weight:700;font-size:16px;margin-left:10px;vertical-align:middle;">ePTW Platform</span>
                </td>
                <td align="right">
                  <span style="color:#4b5563;font-size:11px;">Al-Noor Refinery</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Status banner -->
        <tr>
          <td style="padding:0;">
            <div style="background:${color}18;border-bottom:3px solid ${color};padding:16px 28px;">
              <span style="color:${color};font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${label}</span>
              <div style="color:#fff;font-size:22px;font-weight:700;margin-top:4px;">${permitNumber}</div>
              <div style="color:#9ca3af;font-size:13px;margin-top:2px;">${permitTitle}</div>
            </div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:24px 28px;">
            <!-- Permit details pill -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;border-radius:8px;border:1px solid #2a2d3e;margin-bottom:20px;">
              <tr>
                <td style="padding:12px 16px;">
                  <span style="color:#6b7280;font-size:11px;">Location</span>
                  <div style="color:#e5e7eb;font-size:13px;font-weight:600;margin-top:2px;">${location}</div>
                </td>
                <td style="padding:12px 16px;border-left:1px solid #2a2d3e;">
                  <span style="color:#6b7280;font-size:11px;">Status</span>
                  <div style="color:${color};font-size:13px;font-weight:700;margin-top:2px;">${label}</div>
                </td>
              </tr>
            </table>

            ${bodyHtml}

            <!-- CTA -->
            <div style="text-align:center;margin-top:24px;">
              <a href="${href}" style="display:inline-block;background:#f59e0b;color:#000;font-weight:700;font-size:13px;padding:10px 24px;border-radius:8px;text-decoration:none;">
                ${ctaLabel ?? 'View Permit'}
              </a>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 28px;border-top:1px solid #2a2d3e;background:#141720;">
            <p style="color:#4b5563;font-size:11px;margin:0;">
              This is an automated notification from the ePTW platform. Do not reply to this email.
              <br/>IEC 62443 · ISA-95 · Zero Trust Architecture
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

interface PermitNotificationPayload {
  to:            string | string[];
  permitNumber:  string;
  permitTitle:   string;
  status:        PermitStatus;
  location:      string;
  performedBy:   string;
  notes?:        string;
}

const STATUS_SUBJECTS: Partial<Record<PermitStatus, string>> = {
  SUBMITTED:    'Permit submitted for your approval',
  APPROVED:     'Your permit has been approved',
  REJECTED:     'Your permit has been rejected',
  ACTIVE:       'Permit activated — work may commence',
  SUSPENDED:    '⚠ Permit SUSPENDED — stop all work',
  CLOSED:       'Permit closed successfully',
  CANCELLED:    'Permit cancelled',
  UNDER_REVIEW: 'Permit is under review',
};

const STATUS_BODY: Partial<Record<PermitStatus, (by: string, notes?: string) => string>> = {
  SUBMITTED: (by) => `
    <p style="color:#d1d5db;font-size:13px;line-height:1.6;margin:0 0 12px;">
      A new work permit has been submitted and is awaiting your review and approval.
      Please review the permit details and take action at your earliest convenience in line with the approval SLA.
    </p>
    <p style="color:#9ca3af;font-size:12px;margin:0;">Submitted by: <strong style="color:#e5e7eb;">${by}</strong></p>
  `,
  APPROVED: (by, notes) => `
    <p style="color:#d1d5db;font-size:13px;line-height:1.6;margin:0 0 12px;">
      Your permit has been approved. The issuing authority will activate the permit once all pre-work checks
      (gas tests, toolbox talk, isolation verification) are complete.
    </p>
    ${notes ? `<div style="background:#0f1117;border-left:3px solid #22c55e;padding:10px 14px;border-radius:4px;margin-bottom:12px;"><span style="color:#6b7280;font-size:11px;">Conditions</span><p style="color:#d1d5db;font-size:12px;margin:4px 0 0;">${notes}</p></div>` : ''}
    <p style="color:#9ca3af;font-size:12px;margin:0;">Approved by: <strong style="color:#e5e7eb;">${by}</strong></p>
  `,
  REJECTED: (by, notes) => `
    <p style="color:#d1d5db;font-size:13px;line-height:1.6;margin:0 0 12px;">
      Your permit has been rejected. Please review the comments below, address the issues raised,
      and resubmit with the necessary corrections.
    </p>
    ${notes ? `<div style="background:#0f1117;border-left:3px solid #ef4444;padding:10px 14px;border-radius:4px;margin-bottom:12px;"><span style="color:#6b7280;font-size:11px;">Rejection Reason</span><p style="color:#d1d5db;font-size:12px;margin:4px 0 0;">${notes}</p></div>` : ''}
    <p style="color:#9ca3af;font-size:12px;margin:0;">Rejected by: <strong style="color:#e5e7eb;">${by}</strong></p>
  `,
  ACTIVE: (by) => `
    <p style="color:#d1d5db;font-size:13px;line-height:1.6;margin:0 0 12px;">
      Your permit has been activated. Work may now commence in accordance with the permit conditions.
      Ensure all safety controls remain in place and that gas retests are conducted at the required intervals.
    </p>
    <p style="color:#9ca3af;font-size:12px;margin:0;">Activated by: <strong style="color:#e5e7eb;">${by}</strong></p>
  `,
  SUSPENDED: (by, notes) => `
    <div style="background:#1f0a0a;border:1px solid #7f1d1d;border-radius:8px;padding:14px 16px;margin-bottom:16px;">
      <p style="color:#ef4444;font-size:13px;font-weight:700;margin:0 0 6px;">⚠ IMMEDIATE ACTION REQUIRED</p>
      <p style="color:#fca5a5;font-size:13px;margin:0;">All work under this permit must STOP immediately. Do not resume until the permit is reinstated by an authorised issuing authority.</p>
    </div>
    ${notes ? `<div style="background:#0f1117;border-left:3px solid #f59e0b;padding:10px 14px;border-radius:4px;margin-bottom:12px;"><span style="color:#6b7280;font-size:11px;">Reason for Suspension</span><p style="color:#d1d5db;font-size:12px;margin:4px 0 0;">${notes}</p></div>` : ''}
    <p style="color:#9ca3af;font-size:12px;margin:0;">Suspended by: <strong style="color:#e5e7eb;">${by}</strong></p>
  `,
  CLOSED: (by) => `
    <p style="color:#d1d5db;font-size:13px;line-height:1.6;margin:0 0 12px;">
      This permit has been formally closed. All work under this permit is complete.
      The site area should be restored to its original condition and all safety controls removed in the correct sequence.
    </p>
    <p style="color:#9ca3af;font-size:12px;margin:0;">Closed by: <strong style="color:#e5e7eb;">${by}</strong></p>
  `,
};

/**
 * Send a permit status-change notification email.
 * Call fire-and-forget: `sendPermitStatusEmail(...).catch(() => {})`.
 */
export async function sendPermitStatusEmail(payload: PermitNotificationPayload): Promise<void> {
  if (!resend) {
    // Graceful no-op in dev / when no API key is set
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[email no-op] ${payload.status} — ${payload.permitNumber} → ${payload.to}`);
    }
    return;
  }

  const subject  = STATUS_SUBJECTS[payload.status] ?? `Permit ${payload.permitNumber} — ${statusLabel(payload.status)}`;
  const bodyFn   = STATUS_BODY[payload.status];
  const bodyHtml = bodyFn ? bodyFn(payload.performedBy, payload.notes) : `<p style="color:#d1d5db;font-size:13px;">The permit status has been updated to <strong>${statusLabel(payload.status)}</strong>.</p>`;

  const isSuspended = payload.status === 'SUSPENDED';

  const html = buildHtml({
    title:         `${payload.permitNumber} — ${statusLabel(payload.status)}`,
    preheader:     subject,
    permitNumber:  payload.permitNumber,
    permitTitle:   payload.permitTitle,
    status:        payload.status,
    location:      payload.location,
    bodyHtml,
    ctaLabel:      isSuspended ? 'View Suspended Permit' : 'View Permit',
  });

  const to = Array.isArray(payload.to) ? payload.to : [payload.to];

  await resend.emails.send({
    from:    FROM,
    to,
    subject: `[ePTW] ${payload.permitNumber} — ${subject}`,
    html,
  });
}
