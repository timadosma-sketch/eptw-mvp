'use client';

import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface KPICardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'info';
  trend?: { value: number; label: string };
  onClick?: () => void;
  className?: string;
  pulse?: boolean;
}

const VARIANT_STYLES = {
  default: {
    card:    'border-surface-border bg-surface-card',
    icon:    'bg-surface-panel text-brand',
    value:   'text-white',
    label:   'text-gray-400',
    border:  '',
  },
  danger: {
    card:    'border-red-800/60 bg-red-950/40',
    icon:    'bg-red-900/60 text-red-400',
    value:   'text-red-300',
    label:   'text-red-400/80',
    border:  'border-l-4 border-l-red-600',
  },
  warning: {
    card:    'border-yellow-800/60 bg-yellow-950/30',
    icon:    'bg-yellow-900/50 text-yellow-400',
    value:   'text-yellow-300',
    label:   'text-yellow-400/80',
    border:  'border-l-4 border-l-yellow-500',
  },
  success: {
    card:    'border-emerald-800/60 bg-emerald-950/30',
    icon:    'bg-emerald-900/50 text-emerald-400',
    value:   'text-emerald-300',
    label:   'text-emerald-400/80',
    border:  'border-l-4 border-l-emerald-500',
  },
  info: {
    card:    'border-blue-800/60 bg-blue-950/30',
    icon:    'bg-blue-900/50 text-blue-400',
    value:   'text-blue-300',
    label:   'text-blue-400/80',
    border:  'border-l-4 border-l-blue-500',
  },
};

export function KPICard({
  label, value, subValue, icon: Icon, variant = 'default',
  trend, onClick, className, pulse = false,
}: KPICardProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div
      className={cn(
        'rounded-md border p-4 flex items-start gap-4 shadow-card transition-all',
        styles.card,
        onClick && 'cursor-pointer hover:bg-surface-hover',
        className
      )}
      onClick={onClick}
    >
      {Icon && (
        <div className={cn('rounded p-2.5 flex-shrink-0', styles.icon)}>
          <Icon className={cn('w-5 h-5', pulse && 'animate-pulse-slow')} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className={cn('text-2xs font-semibold uppercase tracking-widest mb-1', styles.label)}>
          {label}
        </div>
        <div className={cn('text-3xl font-bold font-mono leading-none', styles.value)}>
          {value}
        </div>
        {subValue && (
          <div className="text-xs text-gray-500 mt-1">{subValue}</div>
        )}
        {trend && (
          <div className={cn('text-xs mt-1.5', trend.value >= 0 ? 'text-emerald-400' : 'text-red-400')}>
            {trend.value >= 0 ? '+' : ''}{trend.value} {trend.label}
          </div>
        )}
      </div>
    </div>
  );
}
