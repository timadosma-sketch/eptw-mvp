import { create } from 'zustand';
import type { Permit, Alert, User } from '@/lib/types';
import { MOCK_USERS } from '@/lib/mock/users';
import { MOCK_ALERTS } from '@/lib/mock/dashboard';
import type { Locale } from '@/lib/i18n/useT';

// ----------------------------------------------------------
// State shape
// ----------------------------------------------------------

interface AppState {
  // Current user (mock — later replaced by auth session)
  currentUser: User;
  setCurrentUser: (user: User) => void;

  // Locale / language
  locale: Locale;
  setLocale: (locale: Locale) => void;

  // Active nav
  activePage: string;
  setActivePage: (page: string) => void;

  // Selected permit for drawer / detail
  selectedPermitId: string | null;
  setSelectedPermitId: (id: string | null) => void;

  // Create permit wizard
  wizardOpen: boolean;
  wizardStep: number;
  openWizard: () => void;
  closeWizard: () => void;
  setWizardStep: (step: number) => void;

  // Alerts / banner
  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
  dismissAlert: (id: string) => void;
  acknowledgeAlert: (id: string) => void;

  // Sidebar collapse
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Global loading
  isLoading: boolean;
  setLoading: (v: boolean) => void;

  // Toast notifications
  toast: { message: string; type: 'success' | 'error' | 'warning' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  clearToast: () => void;

  // Approval modal
  approvalModalId: string | null;
  openApprovalModal: (id: string) => void;
  closeApprovalModal: () => void;

  // Gas test modal
  gasTestModalPermitId: string | null;
  openGasTestModal: (permitId: string) => void;
  closeGasTestModal: () => void;

  // Permit detail drawer
  permitDetailOpen: boolean;
  openPermitDetail: (id: string) => void;
  closePermitDetail: () => void;

  // Version counter — increment to trigger re-fetch in permit/approval lists
  dataVersion: number;
  bumpDataVersion: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: MOCK_USERS[0],
  setCurrentUser: (user) => set({ currentUser: user }),

  locale: 'en',
  setLocale: (locale) => set({ locale }),

  activePage: 'dashboard',
  setActivePage: (page) => set({ activePage: page }),

  selectedPermitId: null,
  setSelectedPermitId: (id) => set({ selectedPermitId: id }),

  wizardOpen: false,
  wizardStep: 0,
  openWizard: () => set({ wizardOpen: true, wizardStep: 0 }),
  closeWizard: () => set(s => ({ wizardOpen: false, wizardStep: 0, dataVersion: s.dataVersion + 1 })),
  setWizardStep: (step) => set({ wizardStep: step }),

  alerts: MOCK_ALERTS,
  setAlerts: (alerts) => set({ alerts }),
  dismissAlert: (id) => set(s => ({ alerts: s.alerts.filter(a => a.id !== id) })),
  acknowledgeAlert: (id) =>
    set(s => ({
      alerts: s.alerts.map(a =>
        a.id === id ? { ...a, acknowledged: true, acknowledgedAt: new Date().toISOString() } : a
      ),
    })),

  sidebarCollapsed: false,
  toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  isLoading: false,
  setLoading: (v) => set({ isLoading: v }),

  toast: null,
  showToast: (message, type = 'info') => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 4000);
  },
  clearToast: () => set({ toast: null }),

  approvalModalId: null,
  openApprovalModal: (id) => set({ approvalModalId: id }),
  closeApprovalModal: () => set({ approvalModalId: null }),

  gasTestModalPermitId: null,
  openGasTestModal: (permitId) => set({ gasTestModalPermitId: permitId }),
  closeGasTestModal: () => set({ gasTestModalPermitId: null }),

  permitDetailOpen: false,
  openPermitDetail: (id) => set({ selectedPermitId: id, permitDetailOpen: true }),
  closePermitDetail: () => set(s => ({ permitDetailOpen: false, selectedPermitId: null, dataVersion: s.dataVersion + 1 })),

  dataVersion: 0,
  bumpDataVersion: () => set(s => ({ dataVersion: s.dataVersion + 1 })),
}));
