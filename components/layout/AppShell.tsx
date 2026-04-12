'use client';

import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { AlertSyncer } from './AlertSyncer';
import { ToastContainer } from '@/components/shared/Toast';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-base text-white font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>

      {/* Sync live DB alerts into Zustand every 30s */}
      <AlertSyncer />

      {/* Global toast */}
      <ToastContainer />
    </div>
  );
}
