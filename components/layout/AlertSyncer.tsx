'use client';

/**
 * AlertSyncer — mounts inside AppShell and:
 *   1. Keeps the Zustand alert store in sync with live DB alerts
 *      from GET /api/gas-tests?alerts=true  (all Alert table rows)
 *   2. Triggers the server-side safety check on every poll cycle:
 *      POST /api/alerts/check  — creates DB alerts for expiring permits
 *      and overdue gas tests so they surface in the TopBar bell.
 *
 * Polls every 30 s so the notification bell always shows real data
 * without a manual page refresh.
 */

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import type { Alert } from '@/lib/types';

export function AlertSyncer() {
  const setAlerts   = useAppStore(s => s.setAlerts);
  const dataVersion = useAppStore(s => s.dataVersion);

  useEffect(() => {
    const sync = async () => {
      // 1. Run server-side safety checks (fire-and-forget; errors suppressed)
      fetch('/api/alerts/check', { method: 'POST' }).catch(() => {});

      // 2. Fetch all current unacknowledged alerts and push to store
      try {
        const r = await fetch('/api/gas-tests?alerts=true');
        if (!r.ok) return;
        const d = await r.json();
        if (Array.isArray(d?.data)) setAlerts(d.data as Alert[]);
      } catch {
        /* keep current state on network error */
      }
    };

    sync();
    const id = setInterval(sync, 30_000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataVersion]);

  return null; // purely side-effect component
}
