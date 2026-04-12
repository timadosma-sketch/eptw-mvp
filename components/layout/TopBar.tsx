'use client';

import { Bell, ShieldAlert, Wifi, Clock, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAppStore } from '@/lib/store/useAppStore';
import { FACILITY_NAME, ALERT_CONFIG } from '@/lib/constants';
import { formatDateTime, formatRelative } from '@/lib/utils/formatters';
import { useState, useEffect, useRef } from 'react';
import { MOCK_USERS } from '@/lib/mock/users';
import type { Locale } from '@/lib/i18n/useT';

const LOCALES: Locale[] = ['en', 'ru', 'kz'];

export function TopBar() {
  const currentUser       = useAppStore(s => s.currentUser);
  const setCurrentUser    = useAppStore(s => s.setCurrentUser);
  const alerts            = useAppStore(s => s.alerts);
  const locale            = useAppStore(s => s.locale);
  const setLocale         = useAppStore(s => s.setLocale);
  const acknowledgeAlertLocal = useAppStore(s => s.acknowledgeAlert);

  // Acknowledge both locally (instant UI) and in DB
  const acknowledgeAlert = (id: string) => {
    acknowledgeAlertLocal(id);
    fetch('/api/alerts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, acknowledgedBy: currentUser.id }),
    }).catch(() => {});
  };
  const dismissAlert      = useAppStore(s => s.dismissAlert);
  const [now, setNow]     = useState(new Date().toISOString());
  const [bellOpen, setBellOpen]   = useState(false);
  const [userOpen, setUserOpen]   = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date().toISOString()), 30_000);
    return () => clearInterval(t);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
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

        {/* Alerts bell with dropdown */}
        <div ref={bellRef} className="relative">
          <button
            onClick={() => setBellOpen(o => !o)}
            className="relative p-1.5 rounded hover:bg-surface-hover transition-colors"
            aria-label="Alerts"
          >
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

          {bellOpen && (
            <div className="absolute right-0 top-full mt-1 w-80 bg-surface-raised border border-surface-border rounded-md shadow-lg z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-border bg-surface-panel">
                <span className="text-xs font-semibold text-gray-300">
                  Notifications {unacknowledged.length > 0 ? `(${unacknowledged.length})` : ''}
                </span>
                <button onClick={() => setBellOpen(false)} className="text-gray-600 hover:text-gray-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-600">No alerts</div>
                ) : (
                  alerts.map(alert => {
                    const cfg = ALERT_CONFIG[alert.severity];
                    return (
                      <div
                        key={alert.id}
                        className={cn(
                          'flex items-start gap-3 px-4 py-3 border-b border-surface-border/50 text-xs',
                          alert.acknowledged ? 'opacity-40' : ''
                        )}
                      >
                        <div className={cn('mt-0.5 flex-shrink-0 font-bold text-2xs px-1 py-0.5 rounded border', cfg.textColor, cfg.borderColor, cfg.bgColor)}>
                          {alert.severity}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-200 truncate">{alert.title}</div>
                          <div className="text-gray-500 text-2xs mt-0.5">{formatRelative(alert.createdAt)}</div>
                        </div>
                        {!alert.acknowledged && (
                          <button
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="text-2xs text-gray-600 hover:text-brand transition-colors flex-shrink-0"
                          >
                            ACK
                          </button>
                        )}
                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className="text-gray-700 hover:text-gray-500 flex-shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
              {unacknowledged.length > 0 && (
                <div className="px-4 py-2 border-t border-surface-border bg-surface-panel">
                  <button
                    onClick={() => { alerts.forEach(a => { if (!a.acknowledged) acknowledgeAlert(a.id); }); }}
                    className="text-2xs text-brand hover:underline"
                  >
                    Acknowledge all
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User / role-switcher */}
        <div ref={userRef} className="relative pl-2 border-l border-surface-border">
          <button
            onClick={() => setUserOpen(o => !o)}
            className="flex items-center gap-2 hover:bg-surface-hover rounded px-1.5 py-1 transition-colors"
          >
            <div className="w-7 h-7 rounded bg-brand/20 border border-brand/30 flex items-center justify-center flex-shrink-0">
              <span className="text-2xs font-bold text-brand">{currentUser.avatarInitials}</span>
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-medium text-gray-300 leading-none">{currentUser.name.split(' ')[0]}</div>
              <div className="text-2xs text-gray-600 leading-none mt-0.5">{currentUser.role.replace(/_/g, ' ')}</div>
            </div>
            <ChevronDown className="hidden sm:block w-3 h-3 text-gray-600 ml-1" />
          </button>

          {userOpen && (
            <div className="absolute right-0 top-full mt-1 w-64 bg-surface-raised border border-surface-border rounded-md shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-surface-border bg-surface-panel">
                <div className="text-2xs text-gray-600 uppercase tracking-wider font-bold">Demo Role Switcher</div>
              </div>
              <div className="max-h-60 overflow-y-auto py-1">
                {MOCK_USERS.map(u => (
                  <button
                    key={u.id}
                    onClick={() => { setCurrentUser(u); setUserOpen(false); }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-hover transition-colors text-xs',
                      u.id === currentUser.id && 'bg-brand/10 text-brand'
                    )}
                  >
                    <div className="w-7 h-7 rounded-full bg-surface-panel border border-surface-border flex items-center justify-center text-2xs font-bold text-brand flex-shrink-0">
                      {u.avatarInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn('font-medium truncate', u.id === currentUser.id ? 'text-brand' : 'text-gray-200')}>{u.name}</div>
                      <div className="text-gray-500 text-2xs truncate">{u.role.replace(/_/g, ' ')}</div>
                    </div>
                    {u.id === currentUser.id && (
                      <span className="text-2xs text-brand font-bold">●</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
