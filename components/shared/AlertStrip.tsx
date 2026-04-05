'use client';

import { X, Info, AlertTriangle, AlertOctagon, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ALERT_CONFIG } from '@/lib/constants';
import { useAppStore } from '@/lib/store/useAppStore';
import { formatRelative } from '@/lib/utils/formatters';
import type { Alert } from '@/lib/types';

const ICON_MAP = {
  INFO:     Info,
  WARNING:  AlertTriangle,
  DANGER:   AlertOctagon,
  CRITICAL: ShieldAlert,
};

interface AlertStripProps {
  alert: Alert;
  onDismiss?: (id: string) => void;
  onAcknowledge?: (id: string) => void;
  compact?: boolean;
}

export function AlertStrip({ alert, onDismiss, onAcknowledge, compact = false }: AlertStripProps) {
  const cfg  = ALERT_CONFIG[alert.severity];
  const Icon = ICON_MAP[alert.severity];

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded border px-4 py-3 animate-fade-in',
        cfg.bgColor, cfg.textColor, cfg.borderColor,
        alert.severity === 'CRITICAL' && 'shadow-danger',
        compact && 'py-2 px-3'
      )}
    >
      <Icon className={cn('flex-shrink-0 mt-0.5', compact ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
      <div className="flex-1 min-w-0">
        <div className={cn('font-semibold', compact ? 'text-xs' : 'text-sm')}>
          {alert.title}
        </div>
        {!compact && (
          <div className="text-xs mt-0.5 opacity-80">{alert.message}</div>
        )}
        <div className="text-2xs opacity-60 mt-1">{formatRelative(alert.createdAt)}</div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {!alert.acknowledged && onAcknowledge && (
          <button
            onClick={() => onAcknowledge(alert.id)}
            className={cn(
              'text-2xs border rounded px-2 py-0.5 font-medium hover:bg-white/10 transition-colors',
              cfg.textColor, cfg.borderColor
            )}
          >
            ACK
          </button>
        )}
        {onDismiss && (
          <button
            onClick={() => onDismiss(alert.id)}
            className="opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------
// Alert Panel — shows all active alerts from store
// ----------------------------------------------------------

export function AlertPanel() {
  const alerts        = useAppStore(s => s.alerts);
  const dismissAlert  = useAppStore(s => s.dismissAlert);
  const acknowledgeAlert = useAppStore(s => s.acknowledgeAlert);

  const active = alerts.filter(a => !a.acknowledged);
  if (active.length === 0) return null;

  return (
    <div className="space-y-2">
      {active.map(alert => (
        <AlertStrip
          key={alert.id}
          alert={alert}
          onDismiss={dismissAlert}
          onAcknowledge={acknowledgeAlert}
        />
      ))}
    </div>
  );
}
