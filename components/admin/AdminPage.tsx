'use client';

import { Settings, Users, Bell, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PageShell } from '@/components/shared/PageShell';
import { Button } from '@/components/shared/Button';
import { useT } from '@/lib/i18n/useT';
import { MOCK_USERS } from '@/lib/mock/users';
import { ROLE_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils/cn';

type AdminTab = 'users' | 'system' | 'alerts' | 'security';

function UsersTab({ users }: { users: typeof MOCK_USERS }) {
  const { t } = useT();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">{users.length} {t.admin.usersCount}</div>
        <Button variant="primary" size="sm">{t.admin.addUser}</Button>
      </div>
      <div className="overflow-x-auto rounded-md border border-surface-border">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-surface-panel border-b border-surface-border">
              {['Employee ID', 'Name', 'Role', 'Department', 'Company', t.admin.contractor, t.common.actions].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-2xs text-gray-600 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} className={i % 2 === 0 ? 'bg-surface-raised' : 'bg-surface-base'}>
                <td className="px-4 py-2.5 font-mono text-gray-400">{u.employeeId}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center text-2xs font-bold text-brand">
                      {u.avatarInitials}
                    </div>
                    <span className="text-gray-200">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <span className="text-xs bg-surface-panel border border-surface-border px-2 py-0.5 rounded text-gray-400 font-mono">
                    {ROLE_CONFIG[u.role].shortLabel}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-gray-400">{u.department}</td>
                <td className="px-4 py-2.5 text-gray-500">{u.company}</td>
                <td className="px-4 py-2.5">
                  {u.isContractor
                    ? <span className="text-yellow-400 font-semibold">{t.common.yes}</span>
                    : <span className="text-gray-600">{t.common.no}</span>
                  }
                </td>
                <td className="px-4 py-2.5">
                  <Button variant="ghost" size="xs">{t.common.edit}</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SystemTab() {
  const rows = [
    { label: 'Gas Retest Interval',        value: '60 minutes',     editable: true  },
    { label: 'Permit Max Duration',         value: '24 hours',       editable: true  },
    { label: 'Approval SLA',                value: '4 hours',        editable: true  },
    { label: 'Offline Sync Interval',       value: '5 minutes',      editable: false },
    { label: 'Audit Retention',             value: '7 years',        editable: false },
    { label: 'MFA Enforcement',             value: 'Enabled',        editable: true  },
    { label: 'Zero Trust Mode',             value: 'Enabled',        editable: false },
    { label: 'SPIFFE/SPIRE mTLS',          value: 'Active',         editable: false },
    { label: 'Vault Secret Rotation',       value: 'Every 30 days',  editable: true  },
  ];

  const { t } = useT();

  return (
    <div className="space-y-3">
      {rows.map(r => (
        <div key={r.label} className="flex items-center justify-between gap-4 px-4 py-3 rounded border border-surface-border bg-surface-card">
          <span className="text-xs text-gray-400">{r.label}</span>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-gray-200">{r.value}</span>
            {r.editable && <Button variant="ghost" size="xs">{t.common.edit}</Button>}
          </div>
        </div>
      ))}
    </div>
  );
}

function AlertRulesTab() {
  const { t } = useT();
  const rules = [
    { id: 'r1', name: 'Gas Exceedance',    trigger: 'Any gas reading above danger threshold', action: 'Suspend permit + Alert HSE', enabled: true  },
    { id: 'r2', name: 'Permit Expiring',   trigger: 'Permit valid until <2h remaining',        action: 'Notify issuing authority',   enabled: true  },
    { id: 'r3', name: 'Approval Overdue',  trigger: 'Approval pending > SLA hours',            action: 'Escalate to POM',            enabled: true  },
    { id: 'r4', name: 'Gas Retest Overdue',trigger: 'Gas test not recorded within interval',   action: 'Stop work notification',     enabled: true  },
    { id: 'r5', name: 'SIMOPS Conflict',   trigger: 'Prohibited permit combination detected',  action: 'Block permit + Alert SIMOPS',enabled: true  },
  ];

  return (
    <div className="space-y-3">
      {rules.map(r => (
        <div key={r.id} className="flex items-start gap-4 px-4 py-3 rounded border border-surface-border bg-surface-card">
          <div className="flex-1">
            <div className="text-xs font-semibold text-gray-200">{r.name}</div>
            <div className="text-2xs text-gray-500 mt-0.5">Trigger: {r.trigger}</div>
            <div className="text-2xs text-brand mt-0.5">Action: {r.action}</div>
          </div>
          <div className={cn(
            'text-2xs font-semibold px-2 py-0.5 rounded border mt-0.5',
            r.enabled ? 'text-emerald-400 border-emerald-800 bg-emerald-900/30' : 'text-gray-600 border-gray-700 bg-gray-900/30'
          )}>
            {r.enabled ? t.admin.enabled : t.admin.disabled}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminPage() {
  const { t } = useT();
  const [tab, setTab] = useState<AdminTab>('users');
  const [users, setUsers] = useState(MOCK_USERS);

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data?.length) setUsers(d.data); })
      .catch(() => {});
  }, []);

  const ADMIN_TABS = [
    { id: 'users'    as const, label: t.admin.usersRoles,   icon: Users    },
    { id: 'system'   as const, label: t.admin.systemConfig, icon: Settings },
    { id: 'alerts'   as const, label: t.admin.alertRules,   icon: Bell     },
    { id: 'security' as const, label: t.admin.security,     icon: Shield   },
  ];

  const tabContent: Record<AdminTab, React.ReactNode> = {
    users:    <UsersTab users={users} />,
    system:   <SystemTab />,
    alerts:   <AlertRulesTab />,
    security: (
      <div className="text-xs text-gray-500 py-4 space-y-2">
        <p>{t.admin.securityNote}</p>
        <p>{t.admin.securityNote2}</p>
        <p className="text-brand">{t.admin.securityCta}</p>
      </div>
    ),
  };

  return (
    <PageShell title={t.admin.title} subtitle={t.admin.subtitle}>
      <div className="space-y-5">

        <div className="flex items-center gap-0 border-b border-surface-border">
          {ADMIN_TABS.map(tabItem => {
            const Icon = tabItem.icon;
            return (
              <button
                key={tabItem.id}
                onClick={() => setTab(tabItem.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all -mb-px',
                  tab === tabItem.id
                    ? 'border-brand text-brand'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {tabItem.label}
              </button>
            );
          })}
        </div>

        {tabContent[tab]}

      </div>
    </PageShell>
  );
}
