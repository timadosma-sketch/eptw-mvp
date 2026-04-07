'use client';

import { useState } from 'react';
import { Check, ChevronRight, ChevronLeft, Flame, Wrench, Layers, Zap, ArrowUp, Lock } from 'lucide-react';
import { Modal } from '@/components/shared/Modal';
import { Button } from '@/components/shared/Button';
import { useAppStore } from '@/lib/store/useAppStore';
import { useT } from '@/lib/i18n/useT';
import { CREATE_PERMIT_STEPS, PERMIT_TYPE_CONFIG } from '@/lib/constants';
import { permitService } from '@/lib/services/permitService';
import { cn } from '@/lib/utils/cn';
import type { PermitType } from '@/lib/types';

const TYPE_ICONS: Partial<Record<PermitType, React.ElementType>> = {
  HOT_WORK:       Flame,
  COLD_WORK:      Wrench,
  CONFINED_SPACE: Layers,
  ELECTRICAL:     Zap,
  WORK_AT_HEIGHT: ArrowUp,
  LINE_BREAKING:  Lock,
};

function StepTypeSelect({
  selected,
  onChange,
}: {
  selected: PermitType | null;
  onChange: (t: PermitType) => void;
}) {
  const { t } = useT();
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">{t.wizard.typeNote}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {(Object.entries(PERMIT_TYPE_CONFIG) as [PermitType, typeof PERMIT_TYPE_CONFIG[PermitType]][]).map(([type, cfg]) => {
          const Icon = TYPE_ICONS[type];
          const isSelected = selected === type;
          return (
            <button
              key={type}
              onClick={() => onChange(type)}
              className={cn(
                'flex flex-col items-start gap-2 p-3 rounded border text-left transition-all',
                isSelected
                  ? 'border-brand bg-brand/10 text-brand'
                  : 'border-surface-border bg-surface-panel text-gray-400 hover:bg-surface-hover hover:text-gray-200'
              )}
            >
              {Icon && <Icon className="w-5 h-5" />}
              <div>
                <div className="text-xs font-semibold">{cfg.label}</div>
                <div className="text-2xs mt-0.5 opacity-70 space-x-2">
                  {cfg.requiresGasTest   && <span>Gas</span>}
                  {cfg.requiresIsolation && <span>ISO</span>}
                  {cfg.isHotWork         && <span>Hot</span>}
                </div>
              </div>
              {isSelected && (
                <Check className="w-3.5 h-3.5 absolute top-2 right-2" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface WorkDetails {
  title: string;
  description: string;
  location: string;
  unit: string;
  area: string;
  equipment: string;
  validFrom: string;
  validTo: string;
  workerCount: number;
}

function StepWorkDetails({
  data,
  onChange,
}: {
  data: Partial<WorkDetails>;
  onChange: (d: Partial<WorkDetails>) => void;
}) {
  const { t } = useT();
  const set = (k: keyof WorkDetails, v: string | number) => onChange({ ...data, [k]: v });
  const inputCls = "w-full text-xs bg-surface-panel border border-surface-border rounded px-3 py-2 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand/60";

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-gray-500 mb-1 block">{t.wizard.workTitle} *</label>
        <input value={data.title ?? ''} onChange={e => set('title', e.target.value)} placeholder={t.wizard.workTitlePlaceholder} className={inputCls} />
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">{t.wizard.descriptionLabel} *</label>
        <textarea value={data.description ?? ''} onChange={e => set('description', e.target.value)} placeholder={t.wizard.descriptionPlaceholder} rows={3} className={cn(inputCls, 'resize-none')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">{t.wizard.locationLabel} *</label>
          <input value={data.location ?? ''} onChange={e => set('location', e.target.value)} placeholder={t.wizard.locationPlaceholder} className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">{t.wizard.equipmentLabel} *</label>
          <input value={data.equipment ?? ''} onChange={e => set('equipment', e.target.value)} placeholder={t.wizard.equipmentPlaceholder} className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">{t.wizard.unitLabel}</label>
          <input value={data.unit ?? ''} onChange={e => set('unit', e.target.value)} placeholder="e.g. CDU" className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">{t.wizard.areaLabel}</label>
          <input value={data.area ?? ''} onChange={e => set('area', e.target.value)} placeholder="e.g. Process Area A" className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">{t.wizard.validFrom} *</label>
          <input type="datetime-local" value={data.validFrom ?? ''} onChange={e => set('validFrom', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">{t.wizard.validTo} *</label>
          <input type="datetime-local" value={data.validTo ?? ''} onChange={e => set('validTo', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">{t.wizard.workerCount} *</label>
          <input type="number" min={1} value={data.workerCount ?? ''} onChange={e => set('workerCount', parseInt(e.target.value))} placeholder="0" className={inputCls} />
        </div>
      </div>
    </div>
  );
}

function StepRiskAssessment({ riskLevel, onChange }: { riskLevel: string; onChange: (v: string) => void }) {
  const { t } = useT();
  const levels = [
    { value: 'LOW',      label: t.risk.LOW,      desc: 'Routine work, minimal hazard exposure',           color: 'border-green-700 text-green-400' },
    { value: 'MEDIUM',   label: t.risk.MEDIUM,   desc: 'Some hazards, standard controls adequate',        color: 'border-yellow-700 text-yellow-400' },
    { value: 'HIGH',     label: t.risk.HIGH,     desc: 'Significant hazards, enhanced controls required', color: 'border-orange-700 text-orange-400' },
    { value: 'CRITICAL', label: t.risk.CRITICAL, desc: 'Life-threatening hazards, maximum controls',      color: 'border-red-700 text-red-400' },
  ];
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">{t.wizard.riskNote}</p>
      <div className="grid grid-cols-2 gap-3">
        {levels.map(l => (
          <button
            key={l.value}
            onClick={() => onChange(l.value)}
            className={cn(
              'flex flex-col gap-1 p-3 rounded border text-left transition-all',
              riskLevel === l.value
                ? `${l.color} bg-surface-hover`
                : 'border-surface-border bg-surface-panel text-gray-400 hover:bg-surface-hover'
            )}
          >
            <span className="text-sm font-bold">{l.label}</span>
            <span className="text-2xs opacity-70">{l.desc}</span>
          </button>
        ))}
      </div>
      <div className="mt-4 p-3 rounded border border-surface-border bg-surface-panel">
        <div className="text-xs text-gray-500 mb-1">{t.wizard.jsaStatus}</div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
            <input type="checkbox" className="accent-brand" />
            {t.wizard.jsaCompleted}
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
            <input type="checkbox" className="accent-brand" />
            {t.wizard.toolboxPlanned}
          </label>
        </div>
      </div>
    </div>
  );
}

function StepReview({ type, workDetails, riskLevel }: { type: PermitType | null; workDetails: Partial<WorkDetails>; riskLevel: string }) {
  const { t } = useT();
  if (!type) return <p className="text-xs text-gray-500">Please complete previous steps.</p>;
  const cfg = PERMIT_TYPE_CONFIG[type];
  return (
    <div className="space-y-4">
      <div className="p-4 rounded border border-brand/30 bg-brand/5">
        <div className="text-xs text-brand font-bold uppercase tracking-wider mb-3">{t.wizard.summaryTitle}</div>
        <div className="space-y-2">
          <ReviewRow label={t.common.type}        value={cfg.label} />
          <ReviewRow label="Risk Level"            value={riskLevel} />
          <ReviewRow label={t.wizard.workTitle}    value={workDetails.title ?? '—'} />
          <ReviewRow label={t.wizard.locationLabel} value={workDetails.location ?? '—'} />
          <ReviewRow label={t.wizard.equipmentLabel} value={workDetails.equipment ?? '—'} />
          <ReviewRow label={t.wizard.validFrom}    value={workDetails.validFrom ?? '—'} />
          <ReviewRow label={t.wizard.validTo}      value={workDetails.validTo ?? '—'} />
          <ReviewRow label={t.wizard.workerCount}  value={String(workDetails.workerCount ?? 0)} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {cfg.requiresGasTest   && <span className="text-2xs px-2 py-1 rounded bg-blue-900/40 border border-blue-800 text-blue-400">{t.wizard.gasRequired}</span>}
        {cfg.requiresIsolation && <span className="text-2xs px-2 py-1 rounded bg-orange-900/40 border border-orange-800 text-orange-400">{t.wizard.isoRequired}</span>}
        {cfg.isHotWork         && <span className="text-2xs px-2 py-1 rounded bg-red-900/40 border border-red-800 text-red-400">{t.wizard.hotWork}</span>}
      </div>
      <p className="text-xs text-gray-500">{t.wizard.confirmNote}</p>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="text-gray-500 w-24 flex-shrink-0">{label}</span>
      <span className="text-gray-200">{value}</span>
    </div>
  );
}

export function CreatePermitWizard() {
  const wizardOpen   = useAppStore(s => s.wizardOpen);
  const wizardStep   = useAppStore(s => s.wizardStep);
  const closeWizard  = useAppStore(s => s.closeWizard);
  const setStep      = useAppStore(s => s.setWizardStep);
  const showToast    = useAppStore(s => s.showToast);
  const currentUser  = useAppStore(s => s.currentUser);
  const { t } = useT();

  const [permitType,   setPermitType]   = useState<PermitType | null>(null);
  const [workDetails,  setWorkDetails]  = useState<Partial<WorkDetails>>({});
  const [riskLevel,    setRiskLevel]    = useState('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = CREATE_PERMIT_STEPS;
  const current = steps[wizardStep];

  const stepLabels: Record<string, string> = {
    type:        t.wizard.steps.type,
    details:     t.wizard.steps.details,
    risk:        t.wizard.steps.risk,
    isolation:   t.wizard.steps.isolation,
    gas:         t.wizard.steps.gas,
    contractors: t.wizard.steps.contractors,
    review:      t.wizard.steps.review,
  };

  const canAdvance = (): boolean => {
    if (wizardStep === 0) return permitType !== null;
    if (wizardStep === 1) return !!(workDetails.title && workDetails.location && workDetails.validFrom && workDetails.validTo);
    return true;
  };

  const handleSubmit = async () => {
    if (!permitType) return;
    setIsSubmitting(true);
    try {
      const permit = await permitService.createPermit({
        type:        permitType,
        riskLevel:   riskLevel as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
        title:       workDetails.title       ?? '',
        description: workDetails.description ?? '',
        location:    workDetails.location    ?? '',
        unit:        workDetails.unit        ?? '',
        area:        workDetails.area        ?? '',
        equipment:   workDetails.equipment   ?? '',
        requestedBy: currentUser,
        validFrom:   workDetails.validFrom   ?? new Date().toISOString(),
        validTo:     workDetails.validTo     ?? new Date().toISOString(),
        workerCount: workDetails.workerCount ?? 1,
      });
      closeWizard();
      showToast(`Permit ${permit.permitNumber} submitted for approval.`, 'success');
    } catch {
      showToast('Failed to submit permit. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepContent = () => {
    switch (wizardStep) {
      case 0: return <StepTypeSelect selected={permitType} onChange={setPermitType} />;
      case 1: return <StepWorkDetails data={workDetails} onChange={setWorkDetails} />;
      case 2: return <StepRiskAssessment riskLevel={riskLevel} onChange={setRiskLevel} />;
      case 3: return <div className="text-xs text-gray-500 py-4">{t.wizard.isoPlaceholder}</div>;
      case 4: return <div className="text-xs text-gray-500 py-4">{t.wizard.gasPlaceholder}</div>;
      case 5: return <div className="text-xs text-gray-500 py-4">{t.wizard.crewPlaceholder}</div>;
      case 6: return <StepReview type={permitType} workDetails={workDetails} riskLevel={riskLevel} />;
      default: return null;
    }
  };

  return (
    <Modal
      open={wizardOpen}
      onClose={closeWizard}
      title={t.wizard.title}
      subtitle={`${t.wizard.stepOf.replace('of', `${wizardStep + 1} ${t.wizard.stepOf} ${steps.length} —`)} ${stepLabels[current?.id] ?? current?.label}`}
      size="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={closeWizard}>{t.common.cancel}</Button>
          {wizardStep > 0 && (
            <Button variant="secondary" size="sm" icon={ChevronLeft} onClick={() => setStep(wizardStep - 1)}>
              {t.common.back}
            </Button>
          )}
          {wizardStep < steps.length - 1 ? (
            <Button
              variant="primary"
              size="sm"
              iconRight={ChevronRight}
              disabled={!canAdvance()}
              onClick={() => setStep(wizardStep + 1)}
            >
              {t.common.continue}
            </Button>
          ) : (
            <Button variant="primary" size="sm" loading={isSubmitting} onClick={handleSubmit}>
              {t.wizard.submitPermit}
            </Button>
          )}
        </>
      }
    >
      {/* Step progress */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => idx < wizardStep && setStep(idx)}
              className={cn(
                'flex items-center justify-center w-6 h-6 rounded-full text-2xs font-bold border transition-all',
                idx === wizardStep
                  ? 'border-brand bg-brand text-black'
                  : idx < wizardStep
                    ? 'border-emerald-700 bg-emerald-900 text-emerald-400 cursor-pointer'
                    : 'border-surface-border bg-surface-panel text-gray-600 cursor-default'
              )}
            >
              {idx < wizardStep ? <Check className="w-3 h-3" /> : idx + 1}
            </button>
            <span className={cn(
              'text-2xs hidden sm:inline',
              idx === wizardStep ? 'text-brand' : 'text-gray-600'
            )}>
              {stepLabels[step.id] ?? step.label}
            </span>
            {idx < steps.length - 1 && (
              <div className={cn('w-6 h-px mx-1', idx < wizardStep ? 'bg-emerald-700' : 'bg-surface-border')} />
            )}
          </div>
        ))}
      </div>

      {stepContent()}
    </Modal>
  );
}
