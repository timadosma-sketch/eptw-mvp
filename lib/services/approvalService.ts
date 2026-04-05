import type {
  Approval, PaginatedResult, ApprovalFilters, ApprovalDecision, IApprovalService,
} from '@/lib/types';
import { MOCK_APPROVALS } from '@/lib/mock/approvals';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';

const delay = (ms = 120) => new Promise(res => setTimeout(res, ms));
let store: Approval[] = [...MOCK_APPROVALS];

export const approvalService: IApprovalService = {
  async getApprovals(filters: ApprovalFilters = {}): Promise<PaginatedResult<Approval>> {
    await delay();
    let result = [...store];
    if (filters.decision?.length)   result = result.filter(a => a.decision && filters.decision!.includes(a.decision));
    if (filters.overdueOnly)        result = result.filter(a => a.isOverdue);
    if (filters.priority?.length)   result = result.filter(a => filters.priority!.includes(a.priority));
    if (filters.assignedToId)       result = result.filter(a => a.assignedTo?.id === filters.assignedToId);
    const sorted = result.sort((a, b) => {
      const pOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
      return pOrder[a.priority] - pOrder[b.priority];
    });
    return {
      data: sorted.slice(0, DEFAULT_PAGE_SIZE),
      total: sorted.length,
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      totalPages: Math.ceil(sorted.length / DEFAULT_PAGE_SIZE),
    };
  },

  async getApprovalById(id: string): Promise<Approval | null> {
    await delay(60);
    return store.find(a => a.id === id) ?? null;
  },

  async submitDecision(
    id: string,
    decision: ApprovalDecision,
    comments: string,
    conditions: string[] = []
  ): Promise<Approval> {
    await delay(200);
    const now = new Date().toISOString();
    const idx = store.findIndex(a => a.id === id);
    if (idx === -1) throw new Error(`Approval ${id} not found`);
    const updated: Approval = {
      ...store[idx],
      decision,
      comments,
      conditions,
      decidedAt: now,
    };
    store = store.map(a => (a.id === id ? updated : a));
    return updated;
  },
};
