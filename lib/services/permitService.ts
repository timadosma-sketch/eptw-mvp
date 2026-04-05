import type {
  Permit, PaginatedResult, PermitFilters, IPermitService,
} from '@/lib/types';
import { MOCK_PERMITS } from '@/lib/mock/permits';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';

// Simulated network delay for realistic async behaviour
const delay = (ms = 120) => new Promise(res => setTimeout(res, ms));

// In-memory mutable store (replaced by real API calls in production)
let store: Permit[] = [...MOCK_PERMITS];

function applyFilters(permits: Permit[], filters: PermitFilters): Permit[] {
  let result = [...permits];
  if (filters.status?.length)     result = result.filter(p => filters.status!.includes(p.status));
  if (filters.type?.length)       result = result.filter(p => filters.type!.includes(p.type));
  if (filters.riskLevel?.length)  result = result.filter(p => filters.riskLevel!.includes(p.riskLevel));
  if (filters.area)               result = result.filter(p => p.area.toLowerCase().includes(filters.area!.toLowerCase()));
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(p =>
      p.permitNumber.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.equipment.toLowerCase().includes(q)
    );
  }
  if (filters.expiringSoon) {
    const cutoff = Date.now() + 24 * 60 * 60 * 1000;
    result = result.filter(p => new Date(p.validTo).getTime() < cutoff && p.status === 'ACTIVE');
  }
  return result;
}

export const permitService: IPermitService = {
  async getPermits(filters = {}, page = 1, pageSize = DEFAULT_PAGE_SIZE): Promise<PaginatedResult<Permit>> {
    await delay();
    const filtered = applyFilters(store, filters);
    const sorted = [...filtered].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    const start = (page - 1) * pageSize;
    return {
      data: sorted.slice(start, start + pageSize),
      total: sorted.length,
      page,
      pageSize,
      totalPages: Math.ceil(sorted.length / pageSize),
    };
  },

  async getPermitById(id: string): Promise<Permit | null> {
    await delay(60);
    return store.find(p => p.id === id) ?? null;
  },

  async createPermit(data: Partial<Permit>): Promise<Permit> {
    await delay(200);
    const now = new Date().toISOString();
    const newPermit: Permit = {
      id: `pmt-${Date.now()}`,
      permitNumber: `PTW-2024-${String(store.length + 850).padStart(4, '0')}`,
      type: 'COLD_WORK',
      status: 'DRAFT',
      riskLevel: 'LOW',
      title: '',
      description: '',
      location: '',
      unit: '',
      area: '',
      equipment: '',
      requestedBy: data.requestedBy!,
      contractors: [],
      validFrom: now,
      validTo: now,
      createdAt: now,
      updatedAt: now,
      approvals: [],
      gasTestRequired: false,
      isolationRequired: false,
      confinedSpaceEntry: false,
      jsaCompleted: false,
      toolboxTalkCompleted: false,
      workerCount: 0,
      attachments: [],
      notes: '',
      simopsZone: '',
      qrCode: '',
      offlineSync: false,
      ...data,
    };
    store = [newPermit, ...store];
    return newPermit;
  },

  async updatePermit(id: string, data: Partial<Permit>): Promise<Permit> {
    await delay(150);
    const idx = store.findIndex(p => p.id === id);
    if (idx === -1) throw new Error(`Permit ${id} not found`);
    const updated = { ...store[idx], ...data, updatedAt: new Date().toISOString() };
    store = store.map(p => (p.id === id ? updated : p));
    return updated;
  },

  async submitPermit(id: string): Promise<Permit> {
    return permitService.updatePermit(id, { status: 'SUBMITTED' });
  },

  async cancelPermit(id: string, reason: string): Promise<Permit> {
    return permitService.updatePermit(id, { status: 'CANCELLED', notes: reason });
  },

  async activatePermit(id: string): Promise<Permit> {
    return permitService.updatePermit(id, { status: 'ACTIVE' });
  },

  async suspendPermit(id: string, reason: string): Promise<Permit> {
    return permitService.updatePermit(id, {
      status: 'SUSPENDED',
      notes: reason,
    });
  },

  async closePermit(id: string): Promise<Permit> {
    return permitService.updatePermit(id, { status: 'CLOSED' });
  },
};
