'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, RotateCcw, AlertTriangle } from 'lucide-react';
import { PageShell } from '@/components/shared/PageShell';
import { DataTable, Column } from '@/components/shared/DataTable';
import { PriorityBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { useAppStore } from '@/lib/store/useAppStore';
import { useT } from '@/lib/i18n/useT';
import { MOCK_APPROVALS } from '@/lib/mock/approvals';
import { approvalService } from '@/lib/services/approvalService';
import { PERMIT_TYPE_CONFIG, ROLE_CONFIG } from '@/lib/constants';
import { formatDateTime, formatRelative } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';
import type { Approval, ApprovalDecision } from '@/lib/types';

interface DecisionModalProps {
  approval: Approval | null;
  onClose: () => void;
  onDecide: (id: string, decision: ApprovalDecision, comments: string, conditions: string[]) => void;
}

function DecisionModal({ approval, onClose, onDecide }: DecisionModalProps) {
  const { t } = useT();
  const [decision,   setDecision]   = useState<ApprovalDecision>('APPROVED');
  const [comments,   setComments]   = useState('');
  const [condition,  setCondition]  = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [loading,    setLoading]    = useState(false);

  if (!approval) return null;

  const addCondition = () => {
    if (condition.trim()) {
      setConditions(c => [...c, condition.trim()]);
      setCondition('');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setLoading(false);
    onDecide(approval.id, decision, comments, conditions);
    onClose();
  };

  const inputCls = "w-full text-xs bg-surface-panel border border-surface-border rounded px-3 py-2 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand/60";

  return (
    <Modal
      open={!!approval}
      onClose={onClose}
      title={`${t.approvals.review} ${approval.permitNumber}`}
      subtitle={`${PERMIT_TYPE_CONFIG[approval.permitType].label} · ${approval.location}`}
      size="md"
      danger={decision === 'REJECTED'}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>{t.common.cancel}</Button>
          <Button
            variant={decision === 'APPROVED' ? 'success' : decision === 'REJECTED' ? 'danger' : 'warning'}
            size="sm"
            loading={loading}
            onClick={handleSubmit}
          >
            {t.approvals.submitDecision}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="p-3 rounded border border-surface-border bg-surface-panel">
          <div className="text-xs text-gray-400 font-medium mb-1">{approval.permitTitle}</div>
          <div className="text-2xs text-gray-600">{approval.location}</div>
          <div className="flex items-center gap-2 mt-2">
            <PriorityBadge priority={approval.priority} />
            <span className="text-2xs text-gray-600">{t.approvals.dueBy}: {formatDateTime(approval.dueBy)}</span>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-2 block">{t.approvals.decision} *</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'APPROVED',      label: t.approvals.approve,    icon: CheckCircle2, cls: 'border-emerald-700 text-emerald-400 bg-emerald-900/30' },
              { value: 'REJECTED',      label: t.approvals.reject,     icon: XCircle,      cls: 'border-red-700 text-red-400 bg-red-900/30'             },
              { value: 'REFERRED_BACK', label: t.approvals.referBack,  icon: RotateCcw,    cls: 'border-yellow-700 text-yellow-400 bg-yellow-900/30'     },
            ].map(opt => {
              const Icon = opt.icon;
              const selected = decision === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setDecision(opt.value as ApprovalDecision)}
                  className={cn(
                    'flex items-center justify-center gap-2 p-2.5 rounded border text-xs font-semibold transition-all',
                    selected ? opt.cls : 'border-surface-border bg-surface-panel text-gray-500 hover:bg-surface-hover'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">{t.approvals.comments} {decision === 'REJECTED' && '*'}</label>
          <textarea
            value={comments}
            onChange={e => setComments(e.target.value)}
            placeholder={decision === 'APPROVED' ? t.approvals.commentsOptional : t.approvals.commentsRequired}
            rows={3}
            className={cn(inputCls, 'resize-none')}
          />
        </div>

        {decision === 'APPROVED' && (
          <div>
            <label className="text-xs text-gray-500 mb-1 block">{t.approvals.conditions}</label>
            <div className="flex gap-2">
              <input
                value={condition}
                onChange={e => setCondition(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCondition()}
                placeholder={t.approvals.conditionPlaceholder}
                className={cn(inputCls, 'flex-1')}
              />
              <Button variant="secondary" size="sm" onClick={addCondition}>{t.common.add}</Button>
            </div>
            {conditions.length > 0 && (
              <ul className="mt-2 space-y-1">
                {conditions.map((c, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-gray-300">
                    <span className="text-brand">·</span>
                    <span className="flex-1">{c}</span>
                    <button onClick={() => setConditions(cs => cs.filter((_, j) => j !== i))} className="text-gray-600 hover:text-red-400">×</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

export function ApprovalsPage() {
  const showToast = useAppStore(s => s.showToast);
  const { t } = useT();
  const [activeApproval, setActiveApproval] = useState<Approval | null>(null);
  const [pending,  setPending]  = useState<Approval[]>(MOCK_APPROVALS.filter(a => !a.decision));
  const [history,  setHistory]  = useState<Approval[]>(MOCK_APPROVALS.filter(a =>  a.decision));
  const [tab, setTab] = useState<'pending' | 'history'>('pending');

  const loadApprovals = () => {
    fetch('/api/approvals?pending=true')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data) setPending(d.data); })
      .catch(() => {});
    fetch('/api/approvals')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data) setHistory(d.data.filter((a: Approval) => a.decision)); })
      .catch(() => {});
  };

  useEffect(() => { loadApprovals(); }, []);

  const handleDecide = async (id: string, decision: ApprovalDecision, comments: string, conditions: string[]) => {
    try {
      await approvalService.submitDecision(id, decision, comments, conditions);
      const msg = decision === 'APPROVED'
        ? 'Permit approved successfully.'
        : decision === 'REJECTED'
          ? 'Permit rejected. Requester notified.'
          : 'Permit referred back for revision.';
      showToast(msg, decision === 'APPROVED' ? 'success' : decision === 'REJECTED' ? 'error' : 'warning');
      loadApprovals();
    } catch {
      showToast('Failed to submit decision. Please try again.', 'error');
    }
  };

  const pendingColumns: Column<Approval>[] = [
    {
      key: 'priority',
      header: 'P',
      width: '50px',
      render: a => <PriorityBadge priority={a.priority} />,
    },
    {
      key: 'permit',
      header: 'Permit',
      width: '140px',
      render: a => <span className="font-mono text-xs font-bold text-brand">{a.permitNumber}</span>,
    },
    {
      key: 'type',
      header: t.common.type,
      width: '80px',
      render: a => <span className="text-xs text-gray-400">{PERMIT_TYPE_CONFIG[a.permitType].shortLabel}</span>,
    },
    {
      key: 'title',
      header: t.handover.work,
      render: a => (
        <div>
          <div className="text-xs text-gray-200 font-medium">{a.permitTitle}</div>
          <div className="text-2xs text-gray-500">{a.location}</div>
        </div>
      ),
    },
    {
      key: 'role',
      header: t.approvals.requiredRole,
      width: '150px',
      render: a => <span className="text-xs text-gray-400">{ROLE_CONFIG[a.requiredRole].label}</span>,
    },
    {
      key: 'due',
      header: t.approvals.dueBy,
      width: '130px',
      render: a => (
        <div className="flex items-center gap-1.5 text-xs font-mono">
          {a.isOverdue && <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />}
          <span className={a.isOverdue ? 'text-red-400' : 'text-gray-400'}>{formatDateTime(a.dueBy)}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '100px',
      align: 'right',
      render: a => (
        <Button variant="primary" size="xs" onClick={e => { e.stopPropagation(); setActiveApproval(a); }}>
          {t.common.review}
        </Button>
      ),
    },
  ];

  const historyColumns: Column<Approval>[] = [
    {
      key: 'permit',
      header: 'Permit',
      width: '140px',
      render: a => <span className="font-mono text-xs font-bold text-brand">{a.permitNumber}</span>,
    },
    {
      key: 'title',
      header: t.handover.work,
      render: a => <div className="text-xs text-gray-300">{a.permitTitle}</div>,
    },
    {
      key: 'decision',
      header: t.approvals.decision,
      width: '120px',
      render: a => (
        <span className={cn(
          'text-xs font-semibold',
          a.decision === 'APPROVED'      && 'text-emerald-400',
          a.decision === 'REJECTED'      && 'text-red-400',
          a.decision === 'REFERRED_BACK' && 'text-yellow-400',
        )}>
          {a.decision?.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'by',
      header: t.approvals.decidedBy,
      width: '130px',
      render: a => <span className="text-xs text-gray-400">{a.assignedTo?.name ?? '—'}</span>,
    },
    {
      key: 'at',
      header: t.approvals.decided,
      width: '120px',
      render: a => <span className="text-xs font-mono text-gray-500">{a.decidedAt ? formatRelative(a.decidedAt) : '—'}</span>,
    },
  ];

  return (
    <>
      <PageShell
        title={t.approvals.title}
        subtitle={`${pending.length} ${t.approvals.pending.toLowerCase()} · ${history.length} decided`}
      >
        <div className="flex items-center gap-0 mb-5 border-b border-surface-border">
          {[
            { id: 'pending', label: `${t.approvals.pending} (${pending.length})` },
            { id: 'history', label: `${t.approvals.history} (${history.length})` },
          ].map(tabItem => (
            <button
              key={tabItem.id}
              onClick={() => setTab(tabItem.id as typeof tab)}
              className={cn(
                'px-4 py-2.5 text-xs font-semibold border-b-2 transition-all -mb-px',
                tab === tabItem.id
                  ? 'border-brand text-brand'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              )}
            >
              {tabItem.label}
            </button>
          ))}
        </div>

        {tab === 'pending' ? (
          <DataTable
            columns={pendingColumns}
            data={pending}
            keyExtractor={a => a.id}
            emptyMessage={t.common.allCaughtUp}
          />
        ) : (
          <DataTable
            columns={historyColumns}
            data={history}
            keyExtractor={a => a.id}
            emptyMessage={t.approvals.noHistory}
          />
        )}
      </PageShell>

      <DecisionModal
        approval={activeApproval}
        onClose={() => setActiveApproval(null)}
        onDecide={handleDecide}
      />
    </>
  );
}
