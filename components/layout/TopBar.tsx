'use client';

import { Bell, ShieldAlert, Wifi, Clock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAppStore } from '@/lib/store/useAppStore';
import { FACILITY_NAME } from '@/lib/constants';
import { formatDateTime } from '@/lib/utils/formatters';
import { useState, useEffect } from 'react';
import type { Locale } from '@/lib/i18n/useT';

const LOCALES: Locale[] = ['en', 'ru', 'kz'];

export function TopBar() {
  const currentUser = useAppStore(s => s.currentUser);
  const alerts      = useAppStore(s => s.alerts);
  const locale      = useAppStore(s => s.locale);
  const setLocale   = useAppStore(s => s.setLocale);
  const [now, setNow] = useState(new Date().toISOString());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date().toISOString()), 30_000);
    return () => clearInterval(t);
  }, []);

  const unacknowledged = alerts.filter(a => !a.acknowledged);
  const criticalAlerts = unacknowledged.filter(a => a.severity === 'CRITICAL');
  const hasCritical    = criticalAlerts.length > 0;

  return (
    <header className="h-12 flex items-center justify-between px-4 bg-surface-raised border-b border-surface-border flex-shrink-0">
      {/* Left: facility info */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 font-mono">{FACILITY_NAME}</span>
        <span className="w-px h-3 bg-surface-border" />
        <span className="text-xs text-gray-600 font-mono">IEC 62443 · Zero Trust</span>
      </div>

      {/* Right: status indicators */}
      <div className="flex items-center gap-3">
        {/* Online indicator */}
        <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
          <Wifi className="w-3.5 h-3.5" />
          <span className="hidden sm:inline font-mono">Online</span>
        </div>

        {/* Clock */}
        <div className="flex items-center gap-1.5 text-gray-500 text-xs font-mono">
          <Clock className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{formatDateTime(now)}</span>
        </div>

        {/* Language selector */}
        <div className="flex items-center border border-surface-border rounded overflow-hidden">
          {LOCALES.map(lang => (
            <button
              key={lang}
              onClick={() => setLocale(lang)}
              className={cn(
                'text-2xs font-mono font-bold px-2 py-1 transition-colors',
                locale === lang
                  ? 'bg-brand/20 text-brand'
                  : 'text-gray-600 hover:text-gray-400 hover:bg-surface-hover'
              )}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Alerts bell */}
        <button className="relative p-1.5 rounded hover:bg-surface-hover transition-colors" aria-label="Alerts">
          {hasCritical ? (
            <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
          ) : (
            <Bell className="w-4 h-4 text-gray-500" />
          )}
          {unacknowledged.length > 0 && (
            <span className={cn(
              'absolute -top-0.5 -right-0.5 text-2xs font-bold rounded-full w-4 h-4 flex items-center justify-center',
              hasCritical ? 'bg-red-500 text-white' : 'bg-brand text-black'
            )}>
              {unacknowledged.length}
            </span>
          )}
        </button>

        {/* User */}
        <div className="flex items-center gap-2 pl-2 border-l border-surface-border">
          <div className="w-7 h-7 rounded bg-brand/20 border border-brand/30 flex items-center justify-center">
            <span className="text-2xs font-bold text-brand">{currentUser.avatarInitials}</span>
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-medium text-gray-300 leading-none">{currentUser.name.split(' ')[0]}</div>
            <div className="text-2xs text-gray-600 leading-none mt-0.5">{currentUser.role.replace('_', ' ')}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
