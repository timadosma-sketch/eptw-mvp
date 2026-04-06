// ──────────────────────────────────────────────────────────────
// Prisma → App Type Mappers
// Converts DB records (with includes) to the app's TypeScript
// types defined in lib/types/index.ts
// ──────────────────────────────────────────────────────────────

import type {
  User as PrismaUser,
  Permit as PrismaPermit,
  Approval as PrismaApproval,
  GasTestRecord as PrismaGasTestRecord,
  GasReading as PrismaGasReading,
  IsolationCertificate as PrismaIsolationCert,
  IsolationPoint as PrismaIsolationPoint,
  EnergySource as PrismaEnergySource,
  SIMOPSConflict as PrismaSIMOPSConflict,
  AuditEntry as PrismaAuditEntry,
  Alert as PrismaAlert,
  ContractorEntry as PrismaContractorEntry,
  Attachment as PrismaAttachment,
} from '@prisma/client';

import type {
  User,
  Permit,
  Approval,
  GasTestRecord,
  GasReading,
  IsolationCertificate,
  IsolationPoint,
  EnergySource,
  SIMOPSConflict,
  AuditEntry,
  Alert,
  ContractorEntry,
  Attachment,
  UserRole,
  PermitType,
  PermitStatus,
  RiskLevel,
  GasType,
  GasStatus,
  IsolationStatus,
  SIMOPSCompatibility,
  ApprovalDecision,
  AlertSeverity,
  AuditAction,
} from '@/lib/types';

// ─── User ─────────────────────────────────────────────────────

export function mapUser(u: PrismaUser): User {
  return {
    id: u.id,
    employeeId: u.employeeId,
    name: u.name,
    role: u.role as UserRole,
    department: u.department,
    company: u.company,
    email: u.email,
    phone: u.phone,
    certifications: u.certifications,
    isContractor: u.isContractor,
    avatarInitials: u.avatarInitials,
  };
}

// ─── Contractor / Attachment ───────────────────────────────────

export function mapContractor(c: PrismaContractorEntry): ContractorEntry {
  return {
    id: c.id,
    name: c.name,
    company: c.company,
    role: c.role,
    induction: c.induction,
  };
}

export function mapAttachment(a: PrismaAttachment): Attachment {
  return {
    id: a.id,
    name: a.name,
    type: a.type as Attachment['type'],
    url: a.url,
    uploadedAt: a.uploadedAt.toISOString(),
    uploadedBy: a.uploadedBy,
  };
}

// ─── Permit ────────────────────────────────────────────────────

type PermitWithRelations = PrismaPermit & {
  requestedBy: PrismaUser;
  areaAuthority: PrismaUser | null;
  issuingAuthority: PrismaUser | null;
  hseOfficer: PrismaUser | null;
  contractors: PrismaContractorEntry[];
  attachments: PrismaAttachment[];
  approvals: PrismaApproval[];
};

export function mapPermit(p: PermitWithRelations): Permit {
  return {
    id: p.id,
    permitNumber: p.permitNumber,
    type: p.type as PermitType,
    status: p.status as PermitStatus,
    riskLevel: p.riskLevel as RiskLevel,
    title: p.title,
    description: p.description,
    location: p.location,
    unit: p.unit,
    area: p.area,
    equipment: p.equipment,
    requestedBy: mapUser(p.requestedBy),
    areaAuthority: p.areaAuthority ? mapUser(p.areaAuthority) : undefined,
    issuingAuthority: p.issuingAuthority ? mapUser(p.issuingAuthority) : undefined,
    hseOfficer: p.hseOfficer ? mapUser(p.hseOfficer) : undefined,
    contractors: p.contractors.map(mapContractor),
    attachments: p.attachments.map(mapAttachment),
    validFrom: p.validFrom.toISOString(),
    validTo: p.validTo.toISOString(),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    approvals: [],   // loaded separately if needed
    gasTestRequired: p.gasTestRequired,
    isolationRequired: p.isolationRequired,
    confinedSpaceEntry: p.confinedSpaceEntry,
    hotWorkDetails: p.hotWorkDetails as unknown as Permit['hotWorkDetails'] ?? undefined,
    jsaCompleted: p.jsaCompleted,
    toolboxTalkCompleted: p.toolboxTalkCompleted,
    workerCount: p.workerCount,
    notes: p.notes,
    parentPermitId: p.parentPermitId ?? undefined,
    simopsZone: p.simopsZone,
    qrCode: p.qrCode,
    offlineSync: p.offlineSync,
  };
}

// ─── Approval ─────────────────────────────────────────────────

type ApprovalWithRelations = PrismaApproval & {
  assignedTo: PrismaUser | null;
};

export function mapApproval(a: ApprovalWithRelations): Approval {
  return {
    id: a.id,
    permitId: a.permitId,
    permitNumber: a.permitNumber,
    permitType: a.permitType as PermitType,
    permitTitle: a.permitTitle,
    location: a.location,
    requiredRole: a.requiredRole as UserRole,
    assignedTo: a.assignedTo ? mapUser(a.assignedTo) : undefined,
    decision: a.decision as ApprovalDecision | undefined,
    comments: a.comments,
    conditions: a.conditions,
    decidedAt: a.decidedAt?.toISOString(),
    createdAt: a.createdAt.toISOString(),
    dueBy: a.dueBy.toISOString(),
    priority: a.priority as 'P0' | 'P1' | 'P2' | 'P3',
    isOverdue: a.isOverdue,
  };
}

// ─── Gas ──────────────────────────────────────────────────────

type GasReadingRow = PrismaGasReading & { testedByUser?: PrismaUser | null };

export function mapGasReading(r: PrismaGasReading, tester: PrismaUser): GasReading {
  return {
    id: r.id,
    permitId: r.permitId,
    permitNumber: r.permitNumber,
    location: r.location,
    gasType: r.gasType as GasType,
    value: r.value,
    unit: r.unit,
    status: r.status as GasStatus,
    testedBy: mapUser(tester),
    testedAt: r.testedAt.toISOString(),
    instrument: r.instrument,
    instrumentCalibrationDate: r.instrumentCalibrationDate,
    nextTestDue: r.nextTestDue?.toISOString() ?? '',
    notes: r.notes,
  };
}

type GasTestWithRelations = PrismaGasTestRecord & {
  testedBy: PrismaUser;
  readings: PrismaGasReading[];
};

export function mapGasTestRecord(g: GasTestWithRelations): GasTestRecord {
  return {
    id: g.id,
    permitId: g.permitId,
    permitNumber: g.permitNumber,
    testedBy: mapUser(g.testedBy),
    testedAt: g.testedAt.toISOString(),
    location: g.location,
    readings: g.readings.map(r => mapGasReading(r, g.testedBy)),
    overallStatus: g.overallStatus as GasStatus,
    passedAt: g.passedAt?.toISOString(),
    failedAt: g.failedAt?.toISOString(),
    reEntryRequired: g.reEntryRequired,
    notes: g.notes,
  };
}

// ─── Isolation ────────────────────────────────────────────────

export function mapIsolationPoint(
  p: PrismaIsolationPoint,
  users: Map<string, PrismaUser>,
): IsolationPoint {
  return {
    id: p.id,
    tag: p.tag,
    description: p.description,
    location: p.location,
    isolationType: p.isolationType as IsolationPoint['isolationType'],
    normalPosition: p.normalPosition,
    isolatedPosition: p.isolatedPosition,
    status: p.status as IsolationStatus,
    isolatedBy: p.isolatedById ? (users.has(p.isolatedById) ? mapUser(users.get(p.isolatedById)!) : undefined) : undefined,
    isolatedAt: p.isolatedAt?.toISOString(),
    verifiedBy: p.verifiedById ? (users.has(p.verifiedById) ? mapUser(users.get(p.verifiedById)!) : undefined) : undefined,
    verifiedAt: p.verifiedAt?.toISOString(),
    releasedBy: p.releasedById ? (users.has(p.releasedById) ? mapUser(users.get(p.releasedById)!) : undefined) : undefined,
    releasedAt: p.releasedAt?.toISOString(),
    lockTag: p.lockTag,
    hasLock: p.hasLock,
    hasTag: p.hasTag,
  };
}

export function mapEnergySource(e: PrismaEnergySource): EnergySource {
  return {
    id: e.id,
    type: e.type as EnergySource['type'],
    description: e.description,
    voltage: e.voltage ?? undefined,
    pressure: e.pressure ?? undefined,
    isolated: e.isolated,
  };
}

type IsolationCertWithRelations = PrismaIsolationCert & {
  issuedBy: PrismaUser;
  verifiedBy: PrismaUser | null;
  releasedBy: PrismaUser | null;
  isolationPoints: PrismaIsolationPoint[];
  energySources: PrismaEnergySource[];
};

export function mapIsolationCert(c: IsolationCertWithRelations): IsolationCertificate {
  // Build a user map for the point lookups (reuse existing user relations)
  const userMap = new Map<string, PrismaUser>();
  [c.issuedBy, c.verifiedBy, c.releasedBy].forEach(u => {
    if (u) userMap.set(u.id, u);
  });

  return {
    id: c.id,
    certificateNumber: c.certificateNumber,
    permitId: c.permitId,
    permitNumber: c.permitNumber,
    title: c.title,
    status: c.status as IsolationStatus,
    overallStatus: c.overallStatus as IsolationStatus,
    issuedBy: mapUser(c.issuedBy),
    verifiedBy: c.verifiedBy ? mapUser(c.verifiedBy) : undefined,
    releasedBy: c.releasedBy ? mapUser(c.releasedBy) : undefined,
    issuedAt: c.issuedAt.toISOString(),
    verifiedAt: c.verifiedAt?.toISOString(),
    releasedAt: c.releasedAt?.toISOString(),
    isolationPoints: c.isolationPoints.map(p => mapIsolationPoint(p, userMap)),
    energySources: c.energySources.map(mapEnergySource),
    notes: c.notes,
  };
}

// ─── SIMOPS ───────────────────────────────────────────────────

type SIMOPSWithRelations = PrismaSIMOPSConflict & {
  raisedBy: PrismaUser;
  resolvedBy: PrismaUser | null;
};

export function mapSIMOPS(s: SIMOPSWithRelations): SIMOPSConflict {
  return {
    id: s.id,
    permitAId: s.permitAId,
    permitANumber: s.permitANumber,
    permitAType: s.permitAType as PermitType,
    permitBId: s.permitBId,
    permitBNumber: s.permitBNumber,
    permitBType: s.permitBType as PermitType,
    compatibility: s.compatibility as SIMOPSCompatibility,
    zone: s.zone,
    raisedAt: s.raisedAt.toISOString(),
    raisedBy: mapUser(s.raisedBy),
    resolvedAt: s.resolvedAt?.toISOString(),
    resolvedBy: s.resolvedBy ? mapUser(s.resolvedBy) : undefined,
    resolution: s.resolution,
    conditions: s.conditions,
    isActive: s.isActive,
  };
}

// ─── Audit ────────────────────────────────────────────────────

type AuditWithRelations = PrismaAuditEntry & {
  performedBy: PrismaUser;
};

export function mapAuditEntry(e: AuditWithRelations): AuditEntry {
  return {
    id: e.id,
    action: e.action as AuditAction,
    entity: e.entity as AuditEntry['entity'],
    entityId: e.entityId,
    entityRef: e.entityRef,
    performedBy: mapUser(e.performedBy),
    performedAt: e.performedAt.toISOString(),
    ipAddress: e.ipAddress,
    deviceInfo: e.deviceInfo,
    changes: (e.changes as unknown as AuditEntry['changes']) ?? [],
    metadata: (e.metadata as Record<string, unknown>) ?? {},
    correlationId: e.correlationId,
  };
}

// ─── Alert ────────────────────────────────────────────────────

export function mapAlert(a: PrismaAlert): Alert {
  return {
    id: a.id,
    severity: a.severity as AlertSeverity,
    title: a.title,
    message: a.message,
    permitId: a.permitId ?? undefined,
    permitNumber: a.permitNumber ?? undefined,
    createdAt: a.createdAt.toISOString(),
    acknowledged: a.acknowledged,
    acknowledgedBy: a.acknowledgedBy ?? undefined,
    acknowledgedAt: a.acknowledgedAt?.toISOString(),
    autoExpires: a.autoExpires,
    expiresAt: a.expiresAt?.toISOString(),
  };
}
