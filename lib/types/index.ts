// ============================================================
// ePTW Platform — Core TypeScript Type Definitions
// ============================================================

// ----------------------------------------------------------
// Enumerations
// ----------------------------------------------------------

export type PermitStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'CANCELLED'
  | 'CLOSED'
  | 'EXPIRED'
  | 'REJECTED'
  | 'PENDING_REVALIDATION'
  | 'TRANSFERRED'
  | 'ARCHIVED';

export type PermitType =
  | 'HOT_WORK'
  | 'COLD_WORK'
  | 'CONFINED_SPACE'
  | 'ELECTRICAL'
  | 'EXCAVATION'
  | 'WORK_AT_HEIGHT'
  | 'LINE_BREAKING'
  | 'LIFTING'
  | 'RADIOGRAPHY'
  | 'PRESSURE_TESTING'
  | 'OVERRIDE_BYPASS'
  | 'COMBINED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type UserRole =
  | 'PERMIT_REQUESTER'
  | 'AREA_AUTHORITY'
  | 'ISSUING_AUTHORITY'
  | 'HSE_OFFICER'
  | 'GAS_TESTER'
  | 'ISOLATION_AUTHORITY'
  | 'SITE_SUPERVISOR'
  | 'CONTRACTOR_REP'
  | 'PLANT_OPS_MANAGER'
  | 'SYSTEM_ADMIN';

export type GasType = 'O2' | 'LEL' | 'H2S' | 'CO' | 'VOC';

export type GasStatus = 'SAFE' | 'WARNING' | 'DANGER' | 'UNKNOWN';

export type IsolationStatus = 'PENDING' | 'ISOLATED' | 'VERIFIED' | 'RELEASED' | 'CANCELLED';

export type SIMOPSCompatibility = 'COMPATIBLE' | 'CONDITIONAL' | 'PROHIBITED';

export type ApprovalDecision = 'APPROVED' | 'REJECTED' | 'REFERRED_BACK';

export type HandoverStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export type AlertSeverity = 'INFO' | 'WARNING' | 'DANGER' | 'CRITICAL';

export type AuditAction =
  | 'PERMIT_CREATED'
  | 'PERMIT_SUBMITTED'
  | 'PERMIT_APPROVED'
  | 'PERMIT_REJECTED'
  | 'PERMIT_ACTIVATED'
  | 'PERMIT_SUSPENDED'
  | 'PERMIT_CLOSED'
  | 'PERMIT_CANCELLED'
  | 'GAS_TEST_RECORDED'
  | 'GAS_TEST_FAILED'
  | 'ISOLATION_APPLIED'
  | 'ISOLATION_RELEASED'
  | 'APPROVAL_SUBMITTED'
  | 'SIMOPS_CONFLICT_RAISED'
  | 'SHIFT_HANDOVER_COMPLETED'
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'SYSTEM_ALERT';

// ----------------------------------------------------------
// Core Entities
// ----------------------------------------------------------

export interface User {
  id: string;
  employeeId: string;
  name: string;
  role: UserRole;
  department: string;
  company: string;
  email: string;
  phone: string;
  certifications: string[];
  isContractor: boolean;
  avatarInitials: string;
}

export interface Permit {
  id: string;
  permitNumber: string;
  type: PermitType;
  status: PermitStatus;
  riskLevel: RiskLevel;
  title: string;
  description: string;
  location: string;
  unit: string;
  area: string;
  equipment: string;
  requestedBy: User;
  areaAuthority?: User;
  issuingAuthority?: User;
  hseOfficer?: User;
  contractors: ContractorEntry[];
  validFrom: string;          // ISO datetime
  validTo: string;            // ISO datetime
  createdAt: string;
  updatedAt: string;
  approvals: Approval[];
  gasTestRequired: boolean;
  isolationRequired: boolean;
  confinedSpaceEntry: boolean;
  hotWorkDetails?: HotWorkDetails;
  jsaCompleted: boolean;
  toolboxTalkCompleted: boolean;
  workerCount: number;
  attachments: Attachment[];
  notes: string;
  parentPermitId?: string;     // for combined permits
  simopsZone: string;
  qrCode: string;
  offlineSync: boolean;
}

export interface HotWorkDetails {
  ignitionSources: string[];
  firewatchRequired: boolean;
  fireExtinguisherLocation: string;
  hotWorkRadius: number;       // metres
}

export interface ContractorEntry {
  id: string;
  name: string;
  company: string;
  role: string;
  induction: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'JSA' | 'MSDS' | 'DRAWING' | 'PHOTO' | 'CERTIFICATE' | 'OTHER';
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

// ----------------------------------------------------------
// Approval
// ----------------------------------------------------------

export interface Approval {
  id: string;
  permitId: string;
  permitNumber: string;
  permitType: PermitType;
  permitTitle: string;
  location: string;
  requiredRole: UserRole;
  assignedTo?: User;
  decision?: ApprovalDecision;
  comments: string;
  conditions: string[];
  decidedAt?: string;
  createdAt: string;
  dueBy: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  isOverdue: boolean;
}

// ----------------------------------------------------------
// Gas Testing
// ----------------------------------------------------------

export interface GasReading {
  id: string;
  permitId: string;
  permitNumber: string;
  location: string;
  gasType: GasType;
  value: number;
  unit: string;
  status: GasStatus;
  testedBy: User;
  testedAt: string;
  instrument: string;
  instrumentCalibrationDate: string;
  nextTestDue: string;
  notes: string;
}

export interface GasThreshold {
  gasType: GasType;
  unit: string;
  safeMin?: number;
  safeMax?: number;
  warningMin?: number;
  warningMax?: number;
  dangerMin?: number;
  dangerMax?: number;
  displayLabel: string;
}

export interface GasTestRecord {
  id: string;
  permitId: string;
  permitNumber: string;
  testedBy: User;
  testedAt: string;
  location: string;
  readings: GasReading[];
  overallStatus: GasStatus;
  passedAt?: string;
  failedAt?: string;
  reEntryRequired: boolean;
  notes: string;
}

// ----------------------------------------------------------
// Isolation / LOTO
// ----------------------------------------------------------

export interface IsolationPoint {
  id: string;
  tag: string;
  description: string;
  location: string;
  isolationType: 'ELECTRICAL' | 'MECHANICAL' | 'PROCESS' | 'INSTRUMENT' | 'PNEUMATIC';
  normalPosition: string;
  isolatedPosition: string;
  status: IsolationStatus;
  isolatedBy?: User;
  isolatedAt?: string;
  verifiedBy?: User;
  verifiedAt?: string;
  releasedBy?: User;
  releasedAt?: string;
  lockTag: string;
  hasLock: boolean;
  hasTag: boolean;
}

export interface IsolationCertificate {
  id: string;
  certificateNumber: string;
  permitId: string;
  permitNumber: string;
  title: string;
  status: IsolationStatus;
  issuedBy: User;
  verifiedBy?: User;
  releasedBy?: User;
  issuedAt: string;
  verifiedAt?: string;
  releasedAt?: string;
  isolationPoints: IsolationPoint[];
  energySources: EnergySource[];
  overallStatus: IsolationStatus;
  notes: string;
}

export interface EnergySource {
  id: string;
  type: 'ELECTRICAL_HV' | 'ELECTRICAL_LV' | 'PNEUMATIC' | 'HYDRAULIC' | 'THERMAL' | 'CHEMICAL' | 'MECHANICAL' | 'GRAVITY';
  description: string;
  voltage?: number;
  pressure?: number;
  isolated: boolean;
}

// ----------------------------------------------------------
// SIMOPS
// ----------------------------------------------------------

export interface SIMOPSConflict {
  id: string;
  permitAId: string;
  permitANumber: string;
  permitAType: PermitType;
  permitBId: string;
  permitBNumber: string;
  permitBType: PermitType;
  compatibility: SIMOPSCompatibility;
  zone: string;
  raisedAt: string;
  raisedBy: User;
  resolvedAt?: string;
  resolvedBy?: User;
  resolution: string;
  conditions: string[];
  isActive: boolean;
}

export type SIMOPSMatrix = Record<PermitType, Record<PermitType, SIMOPSCompatibility>>;

// ----------------------------------------------------------
// Shift Handover
// ----------------------------------------------------------

export interface ShiftHandover {
  id: string;
  handoverNumber: string;
  status: HandoverStatus;
  shift: 'DAY' | 'NIGHT' | 'SWING';
  outgoingSupervisor: User;
  incomingSupervisor?: User;
  startedAt: string;
  completedAt?: string;
  activePermits: string[];          // permit IDs
  suspendedPermits: string[];
  pendingApprovals: string[];
  gasAlerts: string[];
  criticalItems: HandoverItem[];
  notes: string;
  signedOff: boolean;
}

export interface HandoverItem {
  id: string;
  category: 'PERMIT' | 'SAFETY' | 'EQUIPMENT' | 'MAINTENANCE' | 'INCIDENT';
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  actionRequired: boolean;
  assignedTo?: string;
}

// ----------------------------------------------------------
// HSE
// ----------------------------------------------------------

export interface HSEIncident {
  id: string;
  type: 'NEAR_MISS' | 'FIRST_AID' | 'RECORDABLE' | 'LTI' | 'FATALITY' | 'PROPERTY_DAMAGE' | 'ENVIRONMENTAL';
  description: string;
  location: string;
  reportedBy: User;
  reportedAt: string;
  permitId?: string;
  injuredPerson?: string;
  rootCause: string;
  corrective: string;
  closed: boolean;
}

// ----------------------------------------------------------
// Audit
// ----------------------------------------------------------

export interface AuditEntry {
  id: string;
  action: AuditAction;
  entity: 'PERMIT' | 'APPROVAL' | 'GAS_TEST' | 'ISOLATION' | 'HANDOVER' | 'USER' | 'SYSTEM';
  entityId: string;
  entityRef: string;         // human-readable ref e.g. PTW-2024-001
  performedBy: User;
  performedAt: string;
  ipAddress: string;
  deviceInfo: string;
  changes?: AuditChange[];
  metadata: Record<string, unknown>;
  correlationId: string;
}

export interface AuditChange {
  field: string;
  oldValue?: unknown;
  newValue?: unknown;
  // Shorthand aliases accepted from API callers
  from?: unknown;
  to?: unknown;
}

// ----------------------------------------------------------
// Dashboard
// ----------------------------------------------------------

export interface DashboardMetrics {
  activePermits: number;
  pendingApprovals: number;
  gasAlerts: number;
  expiringToday: number;
  expiringTomorrow: number;
  suspendedPermits: number;
  openIsolations: number;
  simoConflicts: number;
  overdueApprovals: number;
  totalWorkersOnSite: number;
  permitsByType: Record<PermitType, number>;
  permitsByStatus: Record<PermitStatus, number>;
  permitsByRisk: Record<RiskLevel, number>;
  safetyScore: number;         // 0-100
  daysWithoutIncident: number;
  mttrMinutes: number;         // mean time to resolution
}

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  permitId?: string;
  permitNumber?: string;
  createdAt: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  autoExpires: boolean;
  expiresAt?: string;
}

// ----------------------------------------------------------
// Pagination / Filters
// ----------------------------------------------------------

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PermitFilters {
  status?: PermitStatus[];
  type?: PermitType[];
  riskLevel?: RiskLevel[];
  area?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  requestedById?: string;
  assignedToId?: string;
  expiringSoon?: boolean;
}

export interface ApprovalFilters {
  decision?: ApprovalDecision[];
  priority?: string[];
  overdueOnly?: boolean;
  assignedToId?: string;
}

// ----------------------------------------------------------
// Service interfaces (API-ready contracts)
// ----------------------------------------------------------

export interface IPermitService {
  getPermits(filters?: PermitFilters, page?: number, pageSize?: number): Promise<PaginatedResult<Permit>>;
  getPermitById(id: string): Promise<Permit | null>;
  createPermit(data: Partial<Permit>): Promise<Permit>;
  updatePermit(id: string, data: Partial<Permit>): Promise<Permit>;
  submitPermit(id: string): Promise<Permit>;
  cancelPermit(id: string, reason: string): Promise<Permit>;
  activatePermit(id: string): Promise<Permit>;
  suspendPermit(id: string, reason: string): Promise<Permit>;
  closePermit(id: string): Promise<Permit>;
}

export interface IApprovalService {
  getApprovals(filters?: ApprovalFilters): Promise<PaginatedResult<Approval>>;
  getApprovalById(id: string): Promise<Approval | null>;
  submitDecision(id: string, decision: ApprovalDecision, comments: string, conditions?: string[]): Promise<Approval>;
}

export interface IGasService {
  getGasHistory(permitId: string): Promise<GasTestRecord[]>;
  getLatestReadings(permitId: string): Promise<GasReading[]>;
  submitGasTest(permitId: string, readings: Partial<GasReading>[]): Promise<GasTestRecord>;
  getActiveAlerts(): Promise<Alert[]>;
}

export interface IIsolationService {
  getIsolationCertificate(permitId: string): Promise<IsolationCertificate | null>;
  getAllCertificates(): Promise<IsolationCertificate[]>;
  applyIsolation(certId: string, pointId: string, userId: string): Promise<IsolationPoint>;
  verifyIsolation(certId: string, pointId: string, userId: string): Promise<IsolationPoint>;
  releaseIsolation(certId: string, userId: string): Promise<IsolationCertificate>;
}

export interface IAuditService {
  getAuditLog(entityId?: string, page?: number): Promise<PaginatedResult<AuditEntry>>;
  logAction(entry: Omit<AuditEntry, 'id' | 'performedAt' | 'correlationId'>): Promise<AuditEntry>;
}
