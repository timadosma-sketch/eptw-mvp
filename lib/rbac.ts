/**
 * Role-Based Access Control helpers for the ePTW platform.
 * All permission checks are centralised here so they're easy to audit.
 */

import type { UserRole } from '@/lib/types';

// ─── Role groups ───────────────────────────────────────────────────────────────

/** Can initiate and submit new work permits */
export const PERMIT_CREATORS: UserRole[] = [
  'PERMIT_REQUESTER',
  'SITE_SUPERVISOR',
  'CONTRACTOR_REP',
  'PLANT_OPS_MANAGER',
  'SYSTEM_ADMIN',
];

/** Can approve / reject / activate permits in the approval queue */
export const APPROVERS: UserRole[] = [
  'AREA_AUTHORITY',
  'ISSUING_AUTHORITY',
  'PLANT_OPS_MANAGER',
  'SYSTEM_ADMIN',
];

/** Can record gas tests */
export const GAS_TESTERS: UserRole[] = [
  'GAS_TESTER',
  'HSE_OFFICER',
  'SYSTEM_ADMIN',
];

/** Can suspend or close active permits */
export const PERMIT_CONTROLLERS: UserRole[] = [
  'ISSUING_AUTHORITY',
  'AREA_AUTHORITY',
  'SITE_SUPERVISOR',
  'PLANT_OPS_MANAGER',
  'HSE_OFFICER',
  'SYSTEM_ADMIN',
];

/** Can access the Admin panel */
export const ADMINS: UserRole[] = [
  'PLANT_OPS_MANAGER',
  'SYSTEM_ADMIN',
];

// ─── Helper ────────────────────────────────────────────────────────────────────

function can(role: UserRole | undefined, allowed: UserRole[]): boolean {
  if (!role) return false;
  return allowed.includes(role);
}

// ─── Named permission checks ───────────────────────────────────────────────────

export const rbac = {
  /** Can the user create new permits? */
  canCreatePermit:  (role?: UserRole) => can(role, PERMIT_CREATORS),

  /** Can the user approve/reject items in the approval queue? */
  canApprove:       (role?: UserRole) => can(role, APPROVERS),

  /** Can the user record a gas test? */
  canRecordGasTest: (role?: UserRole) => can(role, GAS_TESTERS),

  /** Can the user suspend or close an active permit? */
  canControlPermit: (role?: UserRole) => can(role, PERMIT_CONTROLLERS),

  /** Can the user view the admin panel? */
  canAccessAdmin:   (role?: UserRole) => can(role, ADMINS),
};
