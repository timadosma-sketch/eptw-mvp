'use client';

import { cn } from '@/lib/utils/cn';
import { useT } from '@/lib/i18n/useT';
import { PERMIT_STATUS_CONFIG, RISK_CONFIG, PRIORITY_CONFIG } from '@/lib/constants';
import type { PermitStatus, RiskLevel, GasStatus } from '@/lib/types';

// ----------------------------------------------------------
// Permit Status Badge
// ----------------------------------------------------------

interface PermitStatusBadgeProps {
  status: PermitStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export function PermitStatusBadge({ status, size = 'md', showDot = true }: PermitStatusBadgeProps) {
  const { t } = useT();
  const cfg = PERMIT_STATUS_CONFIG[status];
  const sizeClass = {
    sm: 'text-2xs px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }[size];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded font-mono font-semibold uppercase tracking-wide border',
        cfg.color, cfg.textColor, cfg.borderColor, sizeClass
      )}
    >
      {showDot && (
        <span
          className={cn(
            'rounded-full flex-shrink-0',
            cfg.dotColor,
            size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-1.5 h-1.5' : 'w-2 h-2',
            status === 'ACTIVE' && 'animate-pulse'
          )}
        />
      )}
      {t.status[status]}
    </span>
  );
}

// ----------------------------------------------------------
// Risk Level Badge
// ----------------------------------------------------------

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md';
}

export function RiskBadge({ level, size = 'md' }: RiskBadgeProps) {
  const { t } = useT();
  const cfg = RISK_CONFIG[level];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border font-semibold uppercase tracking-wide',
        cfg.textColor, cfg.bg, cfg.color,
        size === 'sm' ? 'text-2xs px-1.5 py-0.5' : 'text-xs px-2 py-1'
      )}
    >
      {t.risk[level]}
    </span>
  );
}

// ----------------------------------------------------------
// Priority Badge
// ----------------------------------------------------------

type Priority = 'P0' | 'P1' | 'P2' | 'P3';

interface PriorityBadgeProps {
  priority: Priority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border font-mono font-bold text-xs px-2 py-0.5',
        cfg.color, cfg.textColor, cfg.borderColor
      )}
    >
      {priority}
    </span>
  );
}

// ----------------------------------------------------------
// Gas Status Badge
// ----------------------------------------------------------

const GAS_STATUS_COLORS: Record<GasStatus, { color: string; text: string; border: string; dot: string }> = {
  SAFE:    { color: 'bg-emerald-900/60', text: 'text-emerald-300', border: 'border-emerald-700', dot: 'bg-emerald-400' },
  WARNING: { color: 'bg-yellow-900/60',  text: 'text-yellow-300',  border: 'border-yellow-700',  dot: 'bg-yellow-400'  },
  DANGER:  { color: 'bg-red-900/60',     text: 'text-red-300',     border: 'border-red-700',     dot: 'bg-red-400'     },
  UNKNOWN: { color: 'bg-gray-800',        text: 'text-gray-400',    border: 'border-gray-700',    dot: 'bg-gray-500'    },
};

interface GasStatusBadgeProps {
  status: GasStatus;
  size?: 'sm' | 'md';
}

export function GasStatusBadge({ status, size = 'md' }: GasStatusBadgeProps) {
  const { t } = useT();
  const cfg = GAS_STATUS_COLORS[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded border font-semibold uppercase tracking-wide',
        cfg.color, cfg.text, cfg.border,
        size === 'sm' ? 'text-2xs px-1.5 py-0.5' : 'text-xs px-2 py-1'
      )}
    >
      <span className={cn('rounded-full w-1.5 h-1.5', cfg.dot, status === 'DANGER' && 'animate-pulse')} />
      {t.gasStatus[status]}
    </span>
  );
}
