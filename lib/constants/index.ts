// ============================================================
// ePTW Platform — Application Constants
// ============================================================

import type {
  PermitStatus, PermitType, RiskLevel, UserRole,
  GasType, GasThreshold, AlertSeverity, SIMOPSCompatibility,
} from '@/lib/types';

// ----------------------------------------------------------
// Permit Status Display Config
// ----------------------------------------------------------

export interface StatusConfig {
  label: string;
  color: string;          // Tailwind bg class
  textColor: string;      // Tailwind text class
  borderColor: string;
  dotColor: string;
  description: string;
}

export const PERMIT_STATUS_CONFIG: Record<PermitStatus, StatusConfig> = {
  DRAFT:               { label: 'Draft',              color: 'bg-slate-700',   textColor: 'text-slate-300',   borderColor: 'border-slate-600', dotColor: 'bg-slate-400',  description: 'Permit under preparation' },
  SUBMITTED:           { label: 'Submitted',          color: 'bg-blue-900',    textColor: 'text-blue-300',    borderColor: 'border-blue-700',  dotColor: 'bg-blue-400',   description: 'Awaiting review' },
  UNDER_REVIEW:        { label: 'Under Review',       color: 'bg-yellow-900',  textColor: 'text-yellow-300',  borderColor: 'border-yellow-700',dotColor: 'bg-yellow-400', description: 'Being reviewed by authority' },
  APPROVED:            { label: 'Approved',           color: 'bg-green-900',   textColor: 'text-green-300',   borderColor: 'border-green-700', dotColor: 'bg-green-400',  description: 'Approved, not yet active' },
  ACTIVE:              { label: 'Active',             color: 'bg-emerald-900', textColor: 'text-emerald-300', borderColor: 'border-emerald-600',dotColor: 'bg-emerald-400',description: 'Work in progress' },
  SUSPENDED:           { label: 'Suspended',          color: 'bg-orange-900',  textColor: 'text-orange-300',  borderColor: 'border-orange-700',dotColor: 'bg-orange-400', description: 'Work stopped — conditions not met' },
  CANCELLED:           { label: 'Cancelled',          color: 'bg-red-950',     textColor: 'text-red-400',     borderColor: 'border-red-800',   dotColor: 'bg-red-500',    description: 'Permit void' },
  CLOSED:              { label: 'Closed',             color: 'bg-gray-800',    textColor: 'text-gray-400',    borderColor: 'border-gray-600',  dotColor: 'bg-gray-500',   description: 'Work completed, area cleared' },
  EXPIRED:             { label: 'Expired',            color: 'bg-gray-800',    textColor: 'text-gray-500',    borderColor: 'border-gray-700',  dotColor: 'bg-gray-600',   description: 'Validity period elapsed' },
  REJECTED:            { label: 'Rejected',           color: 'bg-red-950',     textColor: 'text-red-400',     borderColor: 'border-red-900',   dotColor: 'bg-red-600',    description: 'Refused by authority' },
  PENDING_REVALIDATION:{ label: 'Revalidation',       color: 'bg-purple-900',  textColor: 'text-purple-300',  borderColor: 'border-purple-700',dotColor: 'bg-purple-400', description: 'Requires re-gas test or re-approval' },
  TRANSFERRED:         { label: 'Transferred',        color: 'bg-violet-900',  textColor: 'text-violet-300',  borderColor: 'border-violet-700',dotColor: 'bg-violet-400', description: 'Transferred to different authority' },
  ARCHIVED:            { label: 'Archived',           color: 'bg-gray-900',    textColor: 'text-gray-600',    borderColor: 'border-gray-800',  dotColor: 'bg-gray-700',   description: 'Historical record only' },
};

// ----------------------------------------------------------
// Permit Type Display Config
// ----------------------------------------------------------

export interface PermitTypeConfig {
  label: string;
  shortLabel: string;
  icon: string;
  color: string;
  requiresGasTest: boolean;
  requiresIsolation: boolean;
  isHotWork: boolean;
  maxDurationHours: number;
}

export const PERMIT_TYPE_CONFIG: Record<PermitType, PermitTypeConfig> = {
  HOT_WORK:        { label: 'Hot Work',          shortLabel: 'HW',  icon: 'Flame',      color: 'text-red-400',    requiresGasTest: true,  requiresIsolation: false, isHotWork: true,  maxDurationHours: 12 },
  COLD_WORK:       { label: 'Cold Work',         shortLabel: 'CW',  icon: 'Wrench',     color: 'text-blue-400',   requiresGasTest: false, requiresIsolation: false, isHotWork: false, maxDurationHours: 24 },
  CONFINED_SPACE:  { label: 'Confined Space',    shortLabel: 'CSE', icon: 'Layers',     color: 'text-orange-400', requiresGasTest: true,  requiresIsolation: true,  isHotWork: false, maxDurationHours: 8  },
  ELECTRICAL:      { label: 'Electrical',        shortLabel: 'ELEC',icon: 'Zap',        color: 'text-yellow-400', requiresGasTest: false, requiresIsolation: true,  isHotWork: false, maxDurationHours: 24 },
  EXCAVATION:      { label: 'Excavation',        shortLabel: 'EXC', icon: 'Shovel',     color: 'text-amber-400',  requiresGasTest: true,  requiresIsolation: false, isHotWork: false, maxDurationHours: 24 },
  WORK_AT_HEIGHT:  { label: 'Work at Height',    shortLabel: 'WAH', icon: 'ArrowUp',    color: 'text-cyan-400',   requiresGasTest: false, requiresIsolation: false, isHotWork: false, maxDurationHours: 12 },
  LINE_BREAKING:   { label: 'Line Breaking',     shortLabel: 'LB',  icon: 'PipeLine',   color: 'text-purple-400', requiresGasTest: true,  requiresIsolation: true,  isHotWork: false, maxDurationHours: 8  },
  LIFTING:         { label: 'Lifting',           shortLabel: 'LFT', icon: 'MoveUp',     color: 'text-teal-400',   requiresGasTest: false, requiresIsolation: false, isHotWork: false, maxDurationHours: 12 },
  RADIOGRAPHY:     { label: 'Radiography',       shortLabel: 'RAD', icon: 'RadioTower', color: 'text-rose-400',   requiresGasTest: false, requiresIsolation: false, isHotWork: false, maxDurationHours: 12 },
  PRESSURE_TESTING:{ label: 'Pressure Testing',  shortLabel: 'PT',  icon: 'Gauge',      color: 'text-indigo-400', requiresGasTest: false, requiresIsolation: true,  isHotWork: false, maxDurationHours: 8  },
  OVERRIDE_BYPASS: { label: 'Override / Bypass', shortLabel: 'OVR', icon: 'ShieldOff',  color: 'text-red-500',    requiresGasTest: false, requiresIsolation: false, isHotWork: false, maxDurationHours: 4  },
  COMBINED:        { label: 'Combined',          shortLabel: 'CMB', icon: 'Combine',    color: 'text-white',      requiresGasTest: true,  requiresIsolation: true,  isHotWork: false, maxDurationHours: 8  },
};

// ----------------------------------------------------------
// Risk Level Config
// ----------------------------------------------------------

export const RISK_CONFIG: Record<RiskLevel, { label: string; color: string; textColor: string; bg: string }> = {
  LOW:      { label: 'Low',      color: 'border-green-700',  textColor: 'text-green-400',   bg: 'bg-green-900/40'  },
  MEDIUM:   { label: 'Medium',   color: 'border-yellow-700', textColor: 'text-yellow-400',  bg: 'bg-yellow-900/40' },
  HIGH:     { label: 'High',     color: 'border-orange-700', textColor: 'text-orange-400',  bg: 'bg-orange-900/40' },
  CRITICAL: { label: 'Critical', color: 'border-red-700',    textColor: 'text-red-400',     bg: 'bg-red-900/40'    },
};

// ----------------------------------------------------------
// Gas Thresholds (IEC / industry standard)
// ----------------------------------------------------------

export const GAS_THRESHOLDS: Record<GasType, GasThreshold> = {
  O2: {
    gasType: 'O2',
    unit: '%',
    safeMin: 19.5,
    safeMax: 23.5,
    warningMin: 18.0,
    warningMax: 25.0,
    displayLabel: 'Oxygen (O₂)',
  },
  LEL: {
    gasType: 'LEL',
    unit: '% LEL',
    safeMax: 5,
    warningMax: 10,
    dangerMax: 25,
    displayLabel: 'Flammable Gas (LEL)',
  },
  H2S: {
    gasType: 'H2S',
    unit: 'ppm',
    safeMax: 1,
    warningMax: 5,
    dangerMax: 10,
    displayLabel: 'Hydrogen Sulphide (H₂S)',
  },
  CO: {
    gasType: 'CO',
    unit: 'ppm',
    safeMax: 20,
    warningMax: 35,
    dangerMax: 50,
    displayLabel: 'Carbon Monoxide (CO)',
  },
  VOC: {
    gasType: 'VOC',
    unit: 'ppm',
    safeMax: 10,
    warningMax: 50,
    dangerMax: 200,
    displayLabel: 'VOC',
  },
};

// ----------------------------------------------------------
// User Role Config
// ----------------------------------------------------------

export const ROLE_CONFIG: Record<UserRole, { label: string; shortLabel: string; canApprove: boolean; canIssue: boolean }> = {
  PERMIT_REQUESTER:   { label: 'Permit Requester',   shortLabel: 'PR',   canApprove: false, canIssue: false },
  AREA_AUTHORITY:     { label: 'Area Authority',     shortLabel: 'AA',   canApprove: true,  canIssue: false },
  ISSUING_AUTHORITY:  { label: 'Issuing Authority',  shortLabel: 'IA',   canApprove: true,  canIssue: true  },
  HSE_OFFICER:        { label: 'HSE Officer',        shortLabel: 'HSE',  canApprove: true,  canIssue: false },
  GAS_TESTER:         { label: 'Gas Tester',         shortLabel: 'GT',   canApprove: false, canIssue: false },
  ISOLATION_AUTHORITY:{ label: 'Isolation Authority',shortLabel: 'ISO',  canApprove: true,  canIssue: false },
  SITE_SUPERVISOR:    { label: 'Site Supervisor',    shortLabel: 'SS',   canApprove: false, canIssue: false },
  CONTRACTOR_REP:     { label: 'Contractor Rep',     shortLabel: 'CR',   canApprove: false, canIssue: false },
  PLANT_OPS_MANAGER:  { label: 'Plant/Ops Manager',  shortLabel: 'POM',  canApprove: true,  canIssue: true  },
  SYSTEM_ADMIN:       { label: 'System Admin',       shortLabel: 'SA',   canApprove: true,  canIssue: true  },
};

// ----------------------------------------------------------
// SIMOPS Compatibility Matrix
// ----------------------------------------------------------

export const SIMOPS_MATRIX: Partial<Record<PermitType, Partial<Record<PermitType, SIMOPSCompatibility>>>> = {
  HOT_WORK: {
    HOT_WORK:        'CONDITIONAL',
    COLD_WORK:       'COMPATIBLE',
    CONFINED_SPACE:  'PROHIBITED',
    ELECTRICAL:      'CONDITIONAL',
    EXCAVATION:      'CONDITIONAL',
    WORK_AT_HEIGHT:  'COMPATIBLE',
    LINE_BREAKING:   'PROHIBITED',
    LIFTING:         'CONDITIONAL',
    RADIOGRAPHY:     'PROHIBITED',
    PRESSURE_TESTING:'PROHIBITED',
    OVERRIDE_BYPASS: 'PROHIBITED',
    COMBINED:        'PROHIBITED',
  },
  CONFINED_SPACE: {
    HOT_WORK:        'PROHIBITED',
    COLD_WORK:       'CONDITIONAL',
    CONFINED_SPACE:  'PROHIBITED',
    ELECTRICAL:      'PROHIBITED',
    EXCAVATION:      'CONDITIONAL',
    WORK_AT_HEIGHT:  'PROHIBITED',
    LINE_BREAKING:   'PROHIBITED',
    LIFTING:         'PROHIBITED',
    RADIOGRAPHY:     'PROHIBITED',
    PRESSURE_TESTING:'PROHIBITED',
    OVERRIDE_BYPASS: 'PROHIBITED',
    COMBINED:        'PROHIBITED',
  },
  RADIOGRAPHY: {
    HOT_WORK:        'PROHIBITED',
    COLD_WORK:       'PROHIBITED',
    CONFINED_SPACE:  'PROHIBITED',
    ELECTRICAL:      'PROHIBITED',
    EXCAVATION:      'PROHIBITED',
    WORK_AT_HEIGHT:  'PROHIBITED',
    LINE_BREAKING:   'PROHIBITED',
    LIFTING:         'PROHIBITED',
    RADIOGRAPHY:     'PROHIBITED',
    PRESSURE_TESTING:'PROHIBITED',
    OVERRIDE_BYPASS: 'PROHIBITED',
    COMBINED:        'PROHIBITED',
  },
};

// ----------------------------------------------------------
// Alert Severity Config
// ----------------------------------------------------------

export const ALERT_CONFIG: Record<AlertSeverity, { label: string; bgColor: string; textColor: string; borderColor: string; icon: string }> = {
  INFO:     { label: 'Info',     bgColor: 'bg-blue-900/50',   textColor: 'text-blue-300',   borderColor: 'border-blue-700',   icon: 'Info'         },
  WARNING:  { label: 'Warning',  bgColor: 'bg-yellow-900/50', textColor: 'text-yellow-300', borderColor: 'border-yellow-700', icon: 'AlertTriangle' },
  DANGER:   { label: 'Danger',   bgColor: 'bg-orange-900/50', textColor: 'text-orange-300', borderColor: 'border-orange-700', icon: 'AlertOctagon'  },
  CRITICAL: { label: 'Critical', bgColor: 'bg-red-900/60',    textColor: 'text-red-300',    borderColor: 'border-red-600',    icon: 'ShieldAlert'   },
};

// ----------------------------------------------------------
// Wizard Steps for Create Permit
// ----------------------------------------------------------

export interface WizardStep {
  id: string;
  label: string;
  description: string;
  required: boolean;
}

export const CREATE_PERMIT_STEPS: WizardStep[] = [
  { id: 'type',        label: 'Permit Type',     description: 'Select work category',        required: true  },
  { id: 'details',     label: 'Work Details',    description: 'Location, scope, duration',    required: true  },
  { id: 'risk',        label: 'Risk Assessment', description: 'JSA and hazard identification',required: true  },
  { id: 'isolation',   label: 'Isolation',       description: 'LOTO and energy isolation',    required: false },
  { id: 'gas',         label: 'Gas Testing',     description: 'Atmospheric test requirements',required: false },
  { id: 'contractors', label: 'Contractors',     description: 'Workforce and inductions',     required: true  },
  { id: 'review',      label: 'Review & Submit', description: 'Final check before submission', required: true  },
];

// ----------------------------------------------------------
// Navigation
// ----------------------------------------------------------

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  badge?: 'count' | 'alert';
  group: 'operations' | 'safety' | 'reporting' | 'admin';
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',  label: 'Dashboard',       href: '/dashboard',  icon: 'LayoutDashboard', group: 'operations' },
  { id: 'permits',    label: 'Permit Register', href: '/permits',    icon: 'FileText',         badge: 'count', group: 'operations' },
  { id: 'approvals',  label: 'Approvals',       href: '/approvals',  icon: 'CheckSquare',      badge: 'count', group: 'operations' },
  { id: 'gas',        label: 'Gas Testing',     href: '/gas',        icon: 'Wind',             badge: 'alert', group: 'safety' },
  { id: 'isolation',  label: 'Isolation / LOTO',href: '/isolation',  icon: 'Lock',             group: 'safety' },
  { id: 'simops',     label: 'SIMOPS',          href: '/simops',     icon: 'GitMerge',         badge: 'alert', group: 'safety' },
  { id: 'handover',   label: 'Shift Handover',  href: '/handover',   icon: 'RefreshCw',        group: 'operations' },
  { id: 'hse',        label: 'HSE Dashboard',   href: '/hse',        icon: 'ShieldCheck',      group: 'safety' },
  { id: 'reports',    label: 'Reports',         href: '/reports',    icon: 'BarChart2',        group: 'reporting' },
  { id: 'audit',      label: 'Audit Trail',     href: '/audit',      icon: 'ClipboardList',    group: 'reporting' },
  { id: 'admin',      label: 'Admin',           href: '/admin',      icon: 'Settings',         group: 'admin' },
];

// ----------------------------------------------------------
// Priority Config
// ----------------------------------------------------------

export const PRIORITY_CONFIG = {
  P0: { label: 'P0 Critical', color: 'bg-red-900',    textColor: 'text-red-300',    borderColor: 'border-red-700'    },
  P1: { label: 'P1 High',     color: 'bg-orange-900', textColor: 'text-orange-300', borderColor: 'border-orange-700' },
  P2: { label: 'P2 Normal',   color: 'bg-blue-900',   textColor: 'text-blue-300',   borderColor: 'border-blue-700'   },
  P3: { label: 'P3 Low',      color: 'bg-gray-800',   textColor: 'text-gray-400',   borderColor: 'border-gray-700'   },
} as const;

// ----------------------------------------------------------
// Misc
// ----------------------------------------------------------

export const SITE_NAME = 'ePTW Platform';
export const SITE_SUBTITLE = 'Enterprise Permit to Work';
export const FACILITY_NAME = 'Al-Noor Oil & Gas Refinery';
export const FACILITY_LOCATION = 'Atyrau, Kazakhstan';

export const PERMIT_NUMBER_PREFIX = 'PTW';
export const ISO_CERT_PREFIX = 'ISO';
export const HANDOVER_PREFIX = 'SHO';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PERMIT_DURATION_HOURS = 24;
export const GAS_RETEST_INTERVAL_MINUTES = 60;
export const APPROVAL_SLA_HOURS = 4;
