'use client';

/**
 * AlertSyncer — mounts inside AppShell and keeps the Zustand alert store
 * in sync with live DB alerts from GET /api/gas-tests?alerts=true.
 *
 * Polls every 30 s so the TopBar notification bell always shows real data
 * without a manual page refresh.
 */

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import type { Alert } from '@/lib/types';

export function AlertSyncer() {
  const setAlerts   = useAppStore(s => s.setAlerts);
  const dataVersion = useAppStore(s => s.dataVersion);

  useEffect(() => {
    const sync = () => {
      fetch('/api/gas-tests?alerts=true')
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (Array.isArray(d?.data)) {
            setAlerts(d.data as Alert[]);
          }
        })
        .catch(() => { /* keep current state on network error */ });
    };

    sync();
    const id = setInterval(sync, 30_000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataVersion]);

  return null; // purely side-effect component
}
