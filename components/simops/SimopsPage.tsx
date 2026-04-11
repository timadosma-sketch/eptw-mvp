'use client';

import { useState, useEffect } from 'react';
import { GitMerge, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { PageShell, SectionHeader } from '@/components/shared/PageShell';
import { KPICard } from '@/components/shared/KPICard';
import { Button } from '@/components/shared/Button';
import { useAppStore } from '@/lib/store/useAppStore';
import { rbac } from '@/lib/rbac';
import { useT } from '@/lib/i18n/useT';
import { MOCK_SIMOPS_CONFLICTS } from '@/lib/mock/simops';
import { PERMIT_TYPE_CONFIG } from '@/lib/constants';
import { formatDateTime, formatRelative } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';
import type { SIMOPSCompatibility, PermitType } from '@/lib/types';

const COMPAT_COLORS: Record<SIMOPSCompatibility, { color: string; text: string; border: string; bg: string }> = {
  COMPATIBLE:   { color: 'bg-emerald-900/40', text: 'text-emerald-300', border: 'border-emerald-700', bg: 'bg-emerald-950/20' },
  CONDITIONAL:  { color: 'bg-yellow-900/40',  text: 'text-yellow-300',  border: 'border-yellow-700',  bg: 'bg-yellow-950/20'  },
  PROHIBITED:   { color: 'bg-red-950/40',     text: 'text-red-300',     border: 'border-red-800',     bg: 'bg-red-950/20'     },
};

const MATRIX_TYPES: PermitType[] = ['HOT_WORK', 'COLD_WORK', 'CONFINED_SPACE', 'ELECTRICAL', 'LINE_BREAKING', 'LIFTING', 'RADIOGRAPHY'];
const QUICK_MATRIX: Partial<Record<PermitType, Partial<Record<PermitType, SIMOPSCompatibility>>>> = {
  HOT_WORK:       { HOT_WORK: 'CONDITIONAL', COLD_WORK: 'COMPATIBLE',  CONFINED_SPACE: 'PROHIBITED', ELECTRICAL: 'CONDITIONAL', LINE_BREAKING: 'PROHIBITED', LIFTING: 'CONDITIONAL', RADIOGRAPHY: 'PROHIBITED'  },
  COLD_WORK:      { HOT_WORK: 'COMPATIBLE',  COLD_WORK: 'COMPATIBLE',  CONFINED_SPACE: 'CONDITIONAL', ELECTRICAL: 'COMPATIBLE',  LINE_BREAKING: 'COMPATIBLE',  LIFTING: 'COMPATIBLE',  RADIOGRAPHY: 'PROHIBITED'  },
  CONFINED_SPACE: { HOT_WORK: 'PROHIBITED',  COLD_WORK: 'CONDITIONAL', CONFINED_SPACE: 'PROHIBITED', ELECTRICAL: 'PROHIBITED',  LINE_BREAKING: 'PROHIBITED',  LIFTING: 'PROHIBITED',  RADIOGRAPHY: 'PROHIBITED'  },
  ELECTRICAL:     { HOT_WORK: 'CONDITIONAL', COLD_WORK: 'COMPATIBLE',  CONFINED_SPACE: 'PROHIBITED', ELECTRICAL: 'CONDITIONAL', LINE_BREAKING: 'CONDITIONAL', LIFTING: 'COMPATIBLE',  RADIOGRAPHY: 'PROHIBITED'  },
  LINE_BREAKING:  { HOT_WORK: 'PROHIBITED',  COLD_WORK: 'COMPATIBLE',  CONFINED_SPACE: 'PROHIBITED', ELECTRICAL: 'CONDITIONAL', LINE_BREAKING: 'CONDITIONAL', LIFTING: 'COMPATIBLE',  RADIOGRAPHY: 'PROHIBITED'  },
  LIFTING:        { HOT_WORK: 'CONDITIONAL', COLD_WORK: 'COMPATIBLE',  CONFINED_SPACE: 'PROHIBITED', ELECTRICAL: 'COMPATIBLE',  LINE_BREAKING: 'COMPATIBLE',  LIFTING: 'CONDITIONAL', RADIOGRAPHY: 'PROHIBITED'  },
  RADIOGRAPHY:    { HOT_WORK: 'PROHIBITED',  COLD_WORK: 'PROHIBITED',  CONFINED_SPACE: 'PROHIBITED', ELECTRICAL: 'PROHIBITED',  LINE_BREAKING: 'PROHIBITED',  LIFTING: 'PROHIBITED',  RADIOGRAPHY: 'PROHIBITED'  },
};

export function SimopsPage() {
  const { t } = useT();
  const showToast       = useAppStore(s => s.showToast);
  const currentUser     = useAppStore(s => s.currentUser);
  const dataVersion     = useAppStore(s => s.dataVersion);
  const bumpDataVersion = useAppStore(s => s.bumpDataVersion);
  const canControl      = rbac.canControlPermit(currentUser?.role);
  const [conflicts, setConflicts] = useState(MOCK_SIMOPS_CONFLICTS);
  const [resolving, setResolving] = useState<string | null>(null);

  const loadConflicts = () => {
    fetch('/api/simops')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data?.length) setConflicts(d.data); })
      .catch(() => {});
  };

  useEffect(() => {
    loadConflicts();
    const interval = setInterval(loadConflicts, 30_000);
    return () => clearInterval(interval);
  }, [dataVersion]);

  const handleResolve = async (id: string) => {
    const resolution = window.prompt('Enter resolution / action taken:');
    if (!resolution?.trim()) return;
    setResolving(id);
    try {
      const res = await fetch(`/api/simops/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution }),
      });
      if (res.ok) {
        showToast('SIMOPS conflict resolved.', 'success');
        loadConflicts();
        bumpDataVersion();
      } else {
        showToast('Failed to resolve conflict.', 'error');
      }
    } catch {
      showToast('Network error.', 'error');
    } finally {
      setResolving(null);
    }
  };

  const activeConflicts   = conflicts.filter(c => c.isActive);
  const resolvedConflicts = conflicts.filter(c => !c.isActive);
  const prohibitedCount   = conflicts.filter(c => c.compatibility === 'PROHIBITED').length;
  const conditionalCount  = conflicts.filter(c => c.compatibility === 'CONDITIONAL').length;

  const getCompatLabel = (compat: SIMOPSCompatibility) => {
    if (compat === 'COMPATIBLE') return t.simops.compatible;
    if (compat === 'CONDITIONAL') return t.simops.conditional;
    return t.simops.prohibited;
  };

  return (
    <PageShell title={t.simops.title} subtitle={t.simops.subtitle}>
      <div className="space-y-6">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard label={t.simops.activeConflicts} value={activeConflicts.length}   icon={AlertTriangle} variant={activeConflicts.length > 0 ? 'warning' : 'success'} />
          <KPICard label={t.simops.prohibited}      value={prohibitedCount}           icon={XCircle}       variant={prohibitedCount > 0 ? 'danger' : 'default'} />
          <KPICard label={t.simops.conditional}     value={conditionalCount}          icon={GitMerge}      variant={conditionalCount > 0 ? 'warning' : 'default'} />
          <KPICard label={t.simops.resolvedToday}   value={resolvedConflicts.length}  icon={CheckCircle2}  variant="default" />
        </div>

        {activeConflicts.length > 0 && (
          <div>
            <SectionHeader title={t.simops.activeConflicts} />
            <div className="space-y-4">
              {activeConflicts.map(conflict => {
                const cfg = COMPAT_COLORS[conflict.compatibility];
                return (
                  <div key={conflict.id} className={cn('rounded-md border p-4', cfg.border, cfg.bg)}>
                    <div className="flex items-center gap-3 flex-wrap mb-3">
                      <span className={cn('text-xs px-2 py-1 rounded border font-semibold', cfg.color, cfg.text, cfg.border)}>
                        {getCompatLabel(conflict.compatibility)}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">{conflict.zone}</span>
                      <span className="text-2xs text-gray-600 ml-auto">{formatRelative(conflict.raisedAt)}</span>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 p-2 rounded border border-surface-border bg-surface-panel text-xs">
                        <div className="text-2xs text-gray-500 mb-1">{t.simops.permitA}</div>
                        <div className="font-mono font-bold text-brand">{conflict.permitANumber}</div>
                        <div className="text-gray-400">{PERMIT_TYPE_CONFIG[conflict.permitAType].label}</div>
                      </div>
                      <GitMerge className={cn('w-5 h-5 flex-shrink-0', cfg.text)} />
                      <div className="flex-1 p-2 rounded border border-surface-border bg-surface-panel text-xs">
                        <div className="text-2xs text-gray-500 mb-1">{t.simops.permitB}</div>
                        <div className="font-mono font-bold text-brand">{conflict.permitBNumber}</div>
                        <div className="text-gray-400">{PERMIT_TYPE_CONFIG[conflict.permitBType].label}</div>
                      </div>
                    </div>

                    {conflict.conditions.length > 0 && (
                      <div className="space-y-1 mb-2">
                        <div className="text-2xs text-gray-600 uppercase tracking-wider font-bold">{t.simops.requiredConditions}</div>
                        {conflict.conditions.map((c, i) => (
                          <div key={i} className="text-xs text-gray-300 flex items-start gap-2">
                            <span className="text-brand mt-0.5">·</span>
                            {c}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="text-xs text-gray-500">{conflict.resolution}</div>
                    <div className="flex items-center justify-between mt-2 gap-2">
                      <div className="text-2xs text-gray-600">
                        {t.simops.raisedBy} {conflict.raisedBy.name} at {formatDateTime(conflict.raisedAt)}
                      </div>
                      {canControl && (
                        <Button
                          variant="success"
                          size="xs"
                          icon={CheckCircle2}
                          loading={resolving === conflict.id}
                          onClick={() => handleResolve(conflict.id)}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeConflicts.length === 0 && (
          <p className="text-xs text-gray-600 italic">{t.simops.noConflicts}</p>
        )}

        {resolvedConflicts.length > 0 && (
          <div>
            <SectionHeader title="Resolved Conflicts" subtitle={`${resolvedConflicts.length} resolved this period`} />
            <div className="space-y-2">
              {resolvedConflicts.map(conflict => (
                <div key={conflict.id} className="flex items-center gap-4 px-4 py-3 rounded border border-surface-border bg-surface-card text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-brand">{conflict.permitANumber}</span>
                    <span className="text-gray-600">↔</span>
                    <span className="font-mono text-brand">{conflict.permitBNumber}</span>
                    <span className="text-gray-600">·</span>
                    <span className="text-gray-500">{conflict.zone}</span>
                  </div>
                  <div className="flex-1 text-gray-500 truncate">{conflict.resolution}</div>
                  <span className="text-2xs text-gray-600 flex-shrink-0">{formatRelative(conflict.raisedAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <SectionHeader title={t.simops.matrixTitle} subtitle={t.simops.matrixSubtitle} />
          <div className="overflow-x-auto rounded-md border border-surface-border">
            <table className="text-2xs border-collapse">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-gray-600 bg-surface-panel border-b border-r border-surface-border sticky left-0 z-10 w-28">
                    Type →
                  </th>
                  {MATRIX_TYPES.map(t_ => (
                    <th key={t_} className="px-2 py-2 text-center text-gray-500 bg-surface-panel border-b border-surface-border font-mono whitespace-nowrap min-w-[80px]">
                      {PERMIT_TYPE_CONFIG[t_].shortLabel}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MATRIX_TYPES.map((rowType, ri) => (
                  <tr key={rowType} className={ri % 2 === 0 ? 'bg-surface-raised' : 'bg-surface-base'}>
                    <td className="px-3 py-2 font-mono font-semibold text-gray-400 border-r border-surface-border sticky left-0 bg-surface-panel whitespace-nowrap">
                      {PERMIT_TYPE_CONFIG[rowType].shortLabel}
                    </td>
                    {MATRIX_TYPES.map(colType => {
                      const compat = QUICK_MATRIX[rowType]?.[colType];
                      if (!compat) return <td key={colType} className="px-2 py-2 text-center text-gray-700 border-r border-surface-border/30">—</td>;
                      const cfg = COMPAT_COLORS[compat];
                      return (
                        <td
                          key={colType}
                          className={cn(
                            'px-2 py-2 text-center font-semibold border-r border-surface-border/30',
                            cfg.text,
                            rowType === colType && 'opacity-40'
                          )}
                        >
                          {compat === 'COMPATIBLE' ? 'C' : compat === 'CONDITIONAL' ? 'CD' : 'P'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-4 mt-3 text-2xs text-gray-600">
            <span><span className="text-emerald-400 font-bold">C</span> = {t.simops.compatible}</span>
            <span><span className="text-yellow-400 font-bold">CD</span> = {t.simops.conditional}</span>
            <span><span className="text-red-400 font-bold">P</span> = {t.simops.prohibited}</span>
          </div>
        </div>

      </div>
    </PageShell>
  );
}
