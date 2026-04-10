'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard, FileText, CheckSquare, Wind, Lock,
  GitMerge, RefreshCw, ShieldCheck, BarChart2,
  ClipboardList, Settings, ChevronLeft, ChevronRight,
  AlertTriangle, Shield, LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAppStore } from '@/lib/store/useAppStore';
import { useT } from '@/lib/i18n/useT';
import { NAV_ITEMS } from '@/lib/constants';
import type { NavItem } from '@/lib/constants';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, FileText, CheckSquare, Wind, Lock,
  GitMerge, RefreshCw, ShieldCheck, BarChart2,
  ClipboardList, Settings,
};

const NAV_GROUPS = [
  { id: 'operations' as const, key: 'operations' as const },
  { id: 'safety'     as const, key: 'safety'     as const },
  { id: 'reporting'  as const, key: 'reporting'  as const },
  { id: 'admin'      as const, key: 'admin'      as const },
];

interface SidebarItemProps {
  item: NavItem;
  collapsed: boolean;
  label: string;
  pendingCount?: number;
  hasAlert?: boolean;
}

function SidebarItem({ item, collapsed, label, pendingCount, hasAlert }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(item.href);
  const Icon     = ICON_MAP[item.icon] ?? FileText;

  return (
    <Link
      href={item.href}
      title={collapsed ? label : undefined}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-150 group relative',
        isActive
          ? 'bg-brand/10 text-brand border border-brand/20'
          : 'text-gray-500 hover:text-gray-200 hover:bg-surface-hover border border-transparent'
      )}
    >
      <Icon className={cn('flex-shrink-0', collapsed ? 'w-5 h-5' : 'w-4 h-4')} />
      {!collapsed && (
        <span className="text-sm font-medium flex-1 truncate">{label}</span>
      )}
      {!collapsed && pendingCount !== undefined && pendingCount > 0 && (
        <span className="ml-auto text-2xs font-bold bg-brand text-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
          {pendingCount > 99 ? '99+' : pendingCount}
        </span>
      )}
      {!collapsed && hasAlert && (
        <span className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      )}
      {collapsed && hasAlert && (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      )}
    </Link>
  );
}

export function Sidebar() {
  const collapsed      = useAppStore(s => s.sidebarCollapsed);
  const toggleSidebar  = useAppStore(s => s.toggleSidebar);
  const alerts         = useAppStore(s => s.alerts);
  const currentUser    = useAppStore(s => s.currentUser);
  const { t }          = useT();

  const pendingApprovals = 5;
  const activePermits    = 3;
  const gasAlerts        = alerts.filter(a => !a.acknowledged && a.severity === 'CRITICAL').length;
  const simoConflicts    = 1;

  const getBadge = (item: NavItem): { count?: number; alert?: boolean } => {
    if (item.id === 'permits')   return { count: activePermits };
    if (item.id === 'approvals') return { count: pendingApprovals };
    if (item.id === 'gas')       return { alert: gasAlerts > 0 };
    if (item.id === 'simops')    return { alert: simoConflicts > 0 };
    return {};
  };

  const getNavLabel = (id: string): string => {
    const nav = t.nav as unknown as Record<string, unknown>;
    const val = nav[id];
    return typeof val === 'string' ? val : id;
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-surface-raised border-r border-surface-border transition-all duration-200 flex-shrink-0',
        collapsed ? 'w-[60px]' : 'w-[220px]'
      )}
    >
      {/* Logo / Brand */}
      <div className={cn(
        'flex items-center gap-2.5 px-3 py-4 border-b border-surface-border',
        collapsed && 'justify-center'
      )}>
        <div className="w-7 h-7 rounded bg-brand flex items-center justify-center flex-shrink-0">
          <Shield className="w-4 h-4 text-black" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-sm font-bold text-white leading-none">ePTW</div>
            <div className="text-2xs text-gray-500 leading-none mt-0.5">{t.topbar.permitPlatform}</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV_GROUPS.map(group => {
          const items = NAV_ITEMS.filter(n => n.group === group.id);
          return (
            <div key={group.id}>
              {!collapsed && (
                <div className="text-2xs font-bold uppercase tracking-widest text-gray-600 px-3 mb-1">
                  {t.nav.groups[group.key]}
                </div>
              )}
              <div className="space-y-0.5">
                {items.map(item => {
                  const badge = getBadge(item);
                  return (
                    <SidebarItem
                      key={item.id}
                      item={item}
                      collapsed={collapsed}
                      label={getNavLabel(item.id)}
                      pendingCount={badge.count}
                      hasAlert={badge.alert}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User profile + logout */}
      <div className={`px-3 py-3 border-t border-surface-border ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            title="Sign out"
            className="flex items-center justify-center w-8 h-8 rounded text-gray-600 hover:text-red-400 hover:bg-red-950/30 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center flex-shrink-0 text-2xs font-bold text-brand">
              {currentUser.avatarInitials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-200 truncate">{currentUser.name}</div>
              <div className="text-2xs text-gray-600 truncate">{currentUser.role.replace(/_/g, ' ')}</div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              title="Sign out"
              className="flex-shrink-0 text-gray-600 hover:text-red-400 transition p-1 rounded hover:bg-red-950/30"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <div className="px-2 pb-4 pt-2 border-t border-surface-border">
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-full py-2 rounded text-gray-500 hover:text-gray-300 hover:bg-surface-hover transition-all"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span className="text-xs">{t.topbar.collapse}</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
