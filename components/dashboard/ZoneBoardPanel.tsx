'use client';

/**
 * ZoneBoardPanel — live plant-zone status grid for the Dashboard.
 *
 * Shows every known SIMOPS zone as a tile with:
 *   - Active permit count
 *   - SIMOPS conflict indicator (PROHIBITED = red, CONDITIONAL = amber)
 *   - Gas alert indicator
 *   - Status colour: green (clear) / amber (active work) / red (conflict or alert)
 */

import { cn } from '@/lib/utils/cn';
import { GitMerge, Wind, FileText } from 'lucide-react';
import type { Permit, SIMOPSConflict, Alert } from '@/lib/types';

// Ordered list of known facility zones — extend as needed
const FACILITY_ZONES = [
  { id: 'ZONE-A3',     label: 'CDU Area A3',     area: 'Process' },
  { id: 'ZONE-B2',     label: 'HCU Bay B2',      area: 'Process' },
  { id: 'ZONE-C1',     label: 'Crude Unit C1',   area: 'Process' },
  { id: 'ZONE-TF1',    label: 'Tank Farm TF1',   area: 'Storage' },
  { id: 'ZONE-TF2',    label: 'Tank Farm TF2',   area: 'Storage' },
  { id: 'ZONE-UTIL-1', label: 'Utilities U1',    area: 'Utilities' },
  { id: 'ZONE-BOILER', label: 'Boiler House',    area: 'Utilities' },
  { id: 'ZONE-FLARE',  label: 'Flare Stack',     area: 'Flare' },
  { id: 'ZONE-ADMIN',  label: 'Admin / Control', area: 'Admin' },
  { id: 'ZONE-OFFSITE', label: 'Offsite / Gate', area: 'Offsite' },
];

interface ZoneInfo {
  id: string;
  label: string;
  area: string;
  activePermits: Permit[];
  conflicts: SIMOPSConflict[];
  gasAlerts: Alert[];
}

type ZoneStatus = 'clear' | 'active' | 'conditional' | 'prohibited';

function zoneStatus(z: ZoneInfo): ZoneStatus {
  if (z.conflicts.some(c => c.compatibility === 'PROHIBITED')) return 'prohibited';
  if (z.gasAlerts.length > 0) return 'prohibited';
  if (z.conflicts.some(c => c.compatibility === 'CONDITIONAL')) return 'conditional';
  if (z.activePermits.length > 0) return 'active';
  return 'clear';
}

const STATUS_STYLES: Record<ZoneStatus, { tile: string; label: string; dot: string }> = {
  clear:      { tile: 'border-surface-border bg-surface-card',                  label: 'text-gray-600',    dot: 'bg-emerald-500' },
  active:     { tile: 'border-brand/40 bg-brand/5',                              label: 'text-brand',       dot: 'bg-brand' },
  conditional:{ tile: 'border-yellow-700/60 bg-yellow-950/20',                  label: 'text-yellow-400',  dot: 'bg-yellow-400' },
  prohibited: { tile: 'border-red-700/60 bg-red-950/20 animate-pulse-border',   label: 'text-red-400',     dot: 'bg-red-500' },
};

const STATUS_LABELS: Record<ZoneStatus, string> = {
  clear:       'Clear',
  active:      'Active Work',
  conditional: 'Conditional',
  prohibited:  'RESTRICTED',
};

interface Props {
  permits: Permit[];
  conflicts: SIMOPSConflict[];
  alerts: Alert[];
}

export function ZoneBoardPanel({ permits, conflicts, alerts }: Props) {
  // Build per-zone data
  const zones: ZoneInfo[] = FACILITY_ZONES.map(z => ({
    ...z,
    activePermits: permits.filter(p =>
      p.simopsZone === z.id && ['ACTIVE', 'APPROVED', 'UNDER_REVIEW'].includes(p.status)
    ),
    conflicts: conflicts.filter(c => c.zone === z.id && c.isActive),
    gasAlerts: alerts.filter(a => !a.acknowledged),
  }));

  const activeZoneCount     = zones.filter(z => zoneStatus(z) !== 'clear').length;
  const prohibitedZoneCount = zones.filter(z => zoneStatus(z) === 'prohibited').length;

  return (
    <div>
      {/* Summary strip */}
      <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
        <span><span className="font-bold text-white">{activeZoneCount}</span> zones with active work</span>
        {prohibitedZoneCount > 0 && (
          <span className="text-red-400 font-semibold">⚠ {prohibitedZoneCount} zone{prohibitedZoneCount > 1 ? 's' : ''} restricted</span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {zones.map(zone => {
          const st  = zoneStatus(zone);
          const sty = STATUS_STYLES[st];
          return (
            <div
              key={zone.id}
              className={cn(
                'relative rounded-md border p-3 transition-all cursor-default',
                sty.tile
              )}
              title={`${zone.label} — ${STATUS_LABELS[st]}`}
            >
              {/* Status dot */}
              <span className={cn('absolute top-2.5 right-2.5 w-2 h-2 rounded-full', sty.dot)} />

              {/* Zone label */}
              <div className="text-2xs text-gray-600 font-mono mb-0.5">{zone.id}</div>
              <div className="text-xs font-semibold text-gray-200 leading-snug mb-1.5 pr-3">{zone.label}</div>

              {/* Icons row */}
              <div className="flex items-center gap-2">
                {zone.activePermits.length > 0 && (
                  <span className="flex items-center gap-0.5 text-2xs text-brand font-mono">
                    <FileText className="w-3 h-3" />
                    {zone.activePermits.length}
                  </span>
                )}
                {zone.conflicts.length > 0 && (
                  <span className={cn(
                    'flex items-center gap-0.5 text-2xs font-mono',
                    zone.conflicts.some(c => c.compatibility === 'PROHIBITED') ? 'text-red-400' : 'text-yellow-400'
                  )}>
                    <GitMerge className="w-3 h-3" />
                    {zone.conflicts.length}
                  </span>
                )}
                {zone.gasAlerts.length > 0 && (
                  <span className="flex items-center gap-0.5 text-2xs text-red-400 font-mono">
                    <Wind className="w-3 h-3" />
                    {zone.gasAlerts.length}
                  </span>
                )}
              </div>

              {/* Status label */}
              <div className={cn('text-2xs font-bold uppercase tracking-wider mt-1', sty.label)}>
                {STATUS_LABELS[st]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-2xs text-gray-600">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Clear</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-brand inline-block" /> Active Work</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> Conditional</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Restricted</span>
      </div>
    </div>
  );
}
