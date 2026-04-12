'use client';

import { Settings, Users, Bell, Shield, Lock, Plus, Pencil, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PageShell } from '@/components/shared/PageShell';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { useT } from '@/lib/i18n/useT';
import { useAppStore } from '@/lib/store/useAppStore';
import { rbac } from '@/lib/rbac';
import { MOCK_USERS } from '@/lib/mock/users';
import { ROLE_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils/cn';
import type { UserRole } from '@/lib/types';

type AdminTab = 'users' | 'system' | 'alerts' | 'security';

type UserRecord = typeof MOCK_USERS[number];

const ALL_ROLES: UserRole[] = [
  'PERMIT_REQUESTER', 'AREA_AUTHORITY', 'ISSUING_AUTHORITY',
  'HSE_OFFICER', 'GAS_TESTER', 'ISOLATION_AUTHORITY',
  'SITE_SUPERVISOR', 'CONTRACTOR_REP', 'PLANT_OPS_MANAGER', 'SYSTEM_ADMIN',
];

interface UserForm {
  name: string;
  email: string;
  role: UserRole;
  department: string;
  company: string;
  phone: string;
  isContractor: boolean;
}

const EMPTY_FORM: UserForm = {
  name: '', email: '', role: 'PERMIT_REQUESTER',
  department: 'Operations', company: 'Al-Noor Refinery',
  phone: '', isContractor: false,
};

function UserFormFields({ form, onChange }: {
  form: UserForm;
  onChange: (f: Partial<UserForm>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-2xs text-gray-500 uppercase tracking-wider mb-1">Full Name *</label>
          <input type="text" value={form.name} onChange={e => onChange({ name: e.target.value })}
            placeholder="John Smith"
            className="w-full bg-surface-panel border border-surface-border rounded px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand" />
        </div>
        <div>
          <label className="block text-2xs text-gray-500 uppercase tracking-wider mb-1">Email *</label>
          <input type="email" value={form.email} onChange={e => onChange({ email: e.target.value })}
            placeholder="john@refinery.com"
            className="w-full bg-surface-panel border border-surface-border rounded px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand" />
        </div>
      </div>
      <div>
        <label className="block text-2xs text-gray-500 uppercase tracking-wider mb-1">Role *</label>
        <select value={form.role} onChange={e => onChange({ role: e.target.value as UserRole })}
          className="w-full bg-surface-panel border border-surface-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-brand">
          {ALL_ROLES.map(r => <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-2xs text-gray-500 uppercase tracking-wider mb-1">Department</label>
          <input type="text" value={form.department} onChange={e => onChange({ department: e.target.value })}
            className="w-full bg-surface-panel border border-surface-border rounded px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand" />
        </div>
        <div>
          <label className="block text-2xs text-gray-500 uppercase tracking-wider mb-1">Company</label>
          <input type="text" value={form.company} onChange={e => onChange({ company: e.target.value })}
            className="w-full bg-surface-panel border border-surface-border rounded px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-2xs text-gray-500 uppercase tracking-wider mb-1">Phone</label>
          <input type="tel" value={form.phone} onChange={e => onChange({ phone: e.target.value })}
            placeholder="+7 (999) 000-0000"
            className="w-full bg-surface-panel border border-surface-border rounded px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand" />
        </div>
        <div className="flex items-center gap-2 pt-5">
          <input type="checkbox" id="isContractor" checked={form.isContractor}
            onChange={e => onChange({ isContractor: e.target.checked })}
            className="w-4 h-4 accent-brand" />
          <label htmlFor="isContractor" className="text-xs text-gray-300 cursor-pointer">Contractor (external)</label>
        </div>
      </div>
    </div>
  );
}

function AddUserModal({ open, onClose, onCreated }: {
  open: boolean; onClose: () => void; onCreated: (u: any) => void;
}) {
  const [form, setForm] = useState<UserForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => { setForm(EMPTY_FORM); setError(''); onClose(); };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) { setError('Name and email are required.'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to create user.'); return; }
      onCreated(data);
      handleClose();
    } catch { setError('Network error. Please try again.'); }
    finally { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add New User" size="md">
      <div className="space-y-4">
        {error && <div className="text-xs text-red-400 bg-red-900/20 border border-red-800/50 rounded px-3 py-2">{error}</div>}
        <UserFormFields form={form} onChange={p => setForm(f => ({ ...f, ...p }))} />
        <div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="sm" icon={Plus} loading={saving} onClick={handleSubmit}>Create User</Button>
        </div>
      </div>
    </Modal>
  );
}

function EditUserModal({ user, onClose, onSaved, onDeleted }: {
  user: UserRecord | null; onClose: () => void; onSaved: (u: any) => void; onDeleted: (id: string) => void;
}) {
  const [form, setForm] = useState<UserForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, email: user.email, role: user.role, department: user.department ?? 'Operations',
        company: user.company ?? 'Al-Noor Refinery', phone: user.phone ?? '', isContractor: user.isContractor ?? false });
      setError(''); setConfirmDelete(false);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user || !form.name.trim()) { setError('Name is required.'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to update user.'); return; }
      onSaved(data);
      onClose();
    } catch { setError('Network error. Please try again.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to delete user.'); setDeleting(false); return; }
      onDeleted(user.id);
      onClose();
    } catch { setError('Network error.'); setDeleting(false); }
  };

  return (
    <Modal open={!!user} onClose={onClose} title={`Edit User — ${user?.employeeId ?? ''}`} size="md">
      <div className="space-y-4">
        {error && <div className="text-xs text-red-400 bg-red-900/20 border border-red-800/50 rounded px-3 py-2">{error}</div>}
        <UserFormFields form={form} onChange={p => setForm(f => ({ ...f, ...p }))} />
        <div className="flex items-center justify-between pt-2 border-t border-surface-border">
          <div>
            {!confirmDelete
              ? <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setConfirmDelete(true)}
                  className="text-red-500 hover:text-red-400">Remove User</Button>
              : <div className="flex items-center gap-2">
                  <span className="text-xs text-red-400">Sure?</span>
                  <Button variant="ghost" size="sm" loading={deleting} onClick={handleDelete}
                    className="text-red-400">Yes, delete</Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
                </div>
            }
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function UsersTab({ users, onAddUser, onEditUser }: {
  users: UserRecord[]; onAddUser: () => void; onEditUser: (u: UserRecord) => void;
}) {
  const { t } = useT();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">{users.length} {t.admin.usersCount}</div>
        <Button variant="primary" size="sm" icon={Plus} onClick={onAddUser}>{t.admin.addUser}</Button>
      </div>
      <div className="overflow-x-auto rounded-md border border-surface-border">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-surface-panel border-b border-surface-border">
              {['Employee ID', 'Name', 'Role', 'Department', 'Company', t.admin.contractor, ''].map((h, i) => (
                <th key={i} className="px-4 py-2.5 text-left text-2xs text-gray-600 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} className={cn('group', i % 2 === 0 ? 'bg-surface-raised' : 'bg-surface-base')}>
                <td className="px-4 py-2.5 font-mono text-gray-400">{u.employeeId}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center text-2xs font-bold text-brand">
                      {u.avatarInitials}
                    </div>
                    <div>
                      <div className="text-gray-200">{u.name}</div>
                      <div className="text-2xs text-gray-600">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <span className="text-xs bg-surface-panel border border-surface-border px-2 py-0.5 rounded text-gray-400 font-mono">
                    {ROLE_CONFIG[u.role]?.shortLabel ?? u.role}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-gray-400">{u.department}</td>
                <td className="px-4 py-2.5 text-gray-500">{u.company}</td>
                <td className="px-4 py-2.5">
                  {u.isContractor
                    ? <span className="text-yellow-400 font-semibold">{t.common.yes}</span>
                    : <span className="text-gray-600">{t.common.no}</span>}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button onClick={() => onEditUser(u)}
                    className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-brand transition-all">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-600 text-xs">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SystemTab() {
  const { t } = useT();
  const rows = [
    { label: 'Gas Retest Interval',   value: '60 minutes',    editable: true  },
    { label: 'Permit Max Duration',    value: '24 hours',      editable: true  },
    { label: 'Approval SLA',           value: '4 hours',       editable: true  },
    { label: 'Offline Sync Interval',  value: '5 minutes',     editable: false },
    { label: 'Audit Retention',        value: '7 years',       editable: false },
    { label: 'MFA Enforcement',        value: 'Enabled',       editable: true  },
    { label: 'Zero Trust Mode',        value: 'Enabled',       editable: false },
    { label: 'SPIFFE/SPIRE mTLS',     value: 'Active',        editable: false },
    { label: 'Vault Secret Rotation',  value: 'Every 30 days', editable: true  },
  ];
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
  const currentUser    = useAppStore(s => s.currentUser);
  const bumpDataVersion = useAppStore(s => s.bumpDataVersion);
  const showToast      = useAppStore(s => s.showToast);
  const [tab, setTab]  = useState<AdminTab>('users');
  const [users, setUsers] = useState<UserRecord[]>(MOCK_USERS as unknown as UserRecord[]);
  const [addOpen, setAddOpen]   = useState(false);
  const [editUser, setEditUser] = useState<UserRecord | null>(null);

  if (!rbac.canAccessAdmin(currentUser?.role)) {
    return (
      <PageShell title={t.admin.title} subtitle={t.admin.subtitle}>
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-14 h-14 rounded-xl bg-red-900/30 border border-red-800/50 flex items-center justify-center">
            <Lock className="w-7 h-7 text-red-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-200 mb-1">Access Restricted</div>
            <div className="text-xs text-gray-500 max-w-xs">
              The Admin panel is only accessible to Plant Operations Managers and System Administrators.
              Your current role ({currentUser?.role?.replace(/_/g, ' ')}) does not have this permission.
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
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

  const handleUserCreated = (newUser: UserRecord) => {
    setUsers(prev => [...prev, newUser]);
    bumpDataVersion();
    showToast(`User ${newUser.name} created (${newUser.employeeId})`, 'success');
  };

  const handleUserSaved = (updated: UserRecord) => {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    bumpDataVersion();
    showToast(`User ${updated.name} updated.`, 'success');
  };

  const handleUserDeleted = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    bumpDataVersion();
    showToast('User removed.', 'info');
  };

  const tabContent: Record<AdminTab, React.ReactNode> = {
    users:    <UsersTab users={users} onAddUser={() => setAddOpen(true)} onEditUser={setEditUser} />,
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
              <button key={tabItem.id} onClick={() => setTab(tabItem.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all -mb-px',
                  tab === tabItem.id ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-300'
                )}>
                <Icon className="w-3.5 h-3.5" />
                {tabItem.label}
              </button>
            );
          })}
        </div>
        {tabContent[tab]}
      </div>

      <AddUserModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={handleUserCreated} />
      <EditUserModal
        user={editUser}
        onClose={() => setEditUser(null)}
        onSaved={handleUserSaved}
        onDeleted={handleUserDeleted}
      />
    </PageShell>
  );
}
