'use client';

import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAppStore } from '@/lib/store/useAppStore';

const TOAST_STYLES = {
  success: { bg: 'bg-emerald-900 border-emerald-700', text: 'text-emerald-300', Icon: CheckCircle2 },
  error:   { bg: 'bg-red-950 border-red-800',         text: 'text-red-300',     Icon: XCircle      },
  warning: { bg: 'bg-yellow-950 border-yellow-800',   text: 'text-yellow-300',  Icon: AlertTriangle },
  info:    { bg: 'bg-blue-950 border-blue-800',        text: 'text-blue-300',    Icon: Info          },
};

export function ToastContainer() {
  const toast      = useAppStore(s => s.toast);
  const clearToast = useAppStore(s => s.clearToast);

  if (!toast) return null;

  const styles = TOAST_STYLES[toast.type];
  const { Icon } = styles;

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-slide-in">
      <div
        className={cn(
          'flex items-center gap-3 rounded-md border px-4 py-3 shadow-panel max-w-sm',
          styles.bg, styles.text
        )}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm font-medium flex-1">{toast.message}</span>
        <button onClick={clearToast} className="opacity-70 hover:opacity-100 transition-opacity flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
