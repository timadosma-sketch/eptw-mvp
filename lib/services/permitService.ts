// ──────────────────────────────────────────────────────────────
// Permit Service — API-backed implementation
// Replaces in-memory mock store with real API calls.
// Components stay unchanged; only this layer changed.
// ──────────────────────────────────────────────────────────────
import type {
  Permit, PaginatedResult, PermitFilters, IPermitService,
} from '@/lib/types';

function buildQuery(filters: PermitFilters, page: number, pageSize: number): string {
  const p = new URLSearchParams();
  if (filters.status?.length)    p.set('status',    filters.status.join(','));
  if (filters.type?.length)      p.set('type',      filters.type.join(','));
  if (filters.riskLevel?.length) p.set('riskLevel', filters.riskLevel.join(','));
  if (filters.search)            p.set('search',    filters.search);
  if (filters.area)              p.set('area',      filters.area);
  if (filters.expiringSoon)      p.set('expiringSoon', 'true');
  p.set('page',     String(page));
  p.set('pageSize', String(pageSize));
  return p.toString();
}

export const permitService: IPermitService = {
  async getPermits(
    filters: PermitFilters = {},
    page = 1,
    pageSize = 20,
  ): Promise<PaginatedResult<Permit>> {
    const res = await fetch(`/api/permits?${buildQuery(filters, page, pageSize)}`);
    if (!res.ok) throw new Error(`getPermits failed: ${res.status}`);
    return res.json();
  },

  async getPermitById(id: string): Promise<Permit | null> {
    const res = await fetch(`/api/permits/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`getPermitById failed: ${res.status}`);
    return res.json();
  },

  async createPermit(data: Partial<Permit>): Promise<Permit> {
    const res = await fetch('/api/permits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type:          data.type,
        riskLevel:     data.riskLevel,
        title:         data.title,
        description:   data.description,
        location:      data.location,
        unit:          data.unit,
        area:          data.area,
        equipment:     data.equipment,
        requestedById: data.requestedBy?.id,
        areaAuthorityId:    data.areaAuthority?.id,
        issuingAuthorityId: data.issuingAuthority?.id,
        hseOfficerId:       data.hseOfficer?.id,
        validFrom:     data.validFrom,
        validTo:       data.validTo,
        gasTestRequired:     data.gasTestRequired,
        isolationRequired:   data.isolationRequired,
        confinedSpaceEntry:  data.confinedSpaceEntry,
        hotWorkDetails:      data.hotWorkDetails,
        jsaCompleted:        data.jsaCompleted,
        toolboxTalkCompleted: data.toolboxTalkCompleted,
        workerCount:  data.workerCount,
        notes:        data.notes,
        simopsZone:   data.simopsZone,
      }),
    });
    if (!res.ok) throw new Error(`createPermit failed: ${res.status}`);
    return res.json();
  },

  async updatePermit(id: string, data: Partial<Permit>): Promise<Permit> {
    const res = await fetch(`/api/permits/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`updatePermit failed: ${res.status}`);
    return res.json();
  },

  async submitPermit(id: string): Promise<Permit> {
    const res = await fetch(`/api/permits/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'SUBMITTED' }),
    });
    if (!res.ok) throw new Error(`submitPermit failed: ${res.status}`);
    return res.json();
  },

  async cancelPermit(id: string, reason: string): Promise<Permit> {
    const res = await fetch(`/api/permits/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CANCELLED', notes: reason }),
    });
    if (!res.ok) throw new Error(`cancelPermit failed: ${res.status}`);
    return res.json();
  },

  async activatePermit(id: string): Promise<Permit> {
    const res = await fetch(`/api/permits/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ACTIVE' }),
    });
    if (!res.ok) throw new Error(`activatePermit failed: ${res.status}`);
    return res.json();
  },

  async suspendPermit(id: string, reason: string): Promise<Permit> {
    const res = await fetch(`/api/permits/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'SUSPENDED', notes: reason }),
    });
    if (!res.ok) throw new Error(`suspendPermit failed: ${res.status}`);
    return res.json();
  },

  async closePermit(id: string): Promise<Permit> {
    const res = await fetch(`/api/permits/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CLOSED' }),
    });
    if (!res.ok) throw new Error(`closePermit failed: ${res.status}`);
    return res.json();
  },
};
