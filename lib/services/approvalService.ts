// ──────────────────────────────────────────────────────────────
// Approval Service — API-backed implementation
// ──────────────────────────────────────────────────────────────
import type {
  Approval, PaginatedResult, ApprovalFilters, ApprovalDecision, IApprovalService,
} from '@/lib/types';

export const approvalService: IApprovalService = {
  async getApprovals(
    filters: ApprovalFilters = {},
  ): Promise<PaginatedResult<Approval>> {
    const p = new URLSearchParams();
    // When no decision filter: fetch pending only (the default view)
    if (!filters.decision?.length) {
      p.set('pending', 'true');
    }
    if (filters.overdueOnly)  p.set('overdueOnly', 'true');
    if (filters.assignedToId) p.set('assignedToId', filters.assignedToId);

    const res = await fetch(`/api/approvals?${p}`);
    if (!res.ok) throw new Error(`getApprovals failed: ${res.status}`);
    const json = await res.json();

    // Normalise: pending endpoint returns { data, total }, list returns paginated result
    if (Array.isArray(json.data)) {
      return {
        data: json.data,
        total: json.total ?? json.data.length,
        page: 1,
        pageSize: json.data.length,
        totalPages: 1,
      };
    }
    return json;
  },

  async getApprovalById(id: string): Promise<Approval | null> {
    const res = await fetch(`/api/approvals/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`getApprovalById failed: ${res.status}`);
    return res.json();
  },

  async submitDecision(
    id: string,
    decision: ApprovalDecision,
    comments: string,
    conditions: string[] = [],
  ): Promise<Approval> {
    const res = await fetch(`/api/approvals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, comments, conditions }),
    });
    if (!res.ok) throw new Error(`submitDecision failed: ${res.status}`);
    return res.json();
  },
};
