// ──────────────────────────────────────────────────────────────
// ePTW Platform — Prisma Seed Script
// Populates database with realistic Al-Noor Oil & Gas Refinery
// demo data matching the existing mock files.
// Usage: npx prisma db seed
// ──────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

// All demo users share this password
const DEMO_PASSWORD_HASH = bcrypt.hashSync('eptw2026', 10);

async function main() {
  console.log('🌱 Seeding ePTW database...');

  // ─── Wipe existing data (safe for dev) ────────────────────
  await db.alert.deleteMany();
  await db.auditEntry.deleteMany();
  await db.sIMOPSConflict.deleteMany();
  await db.energySource.deleteMany();
  await db.isolationPoint.deleteMany();
  await db.isolationCertificate.deleteMany();
  await db.gasReading.deleteMany();
  await db.gasTestRecord.deleteMany();
  await db.approval.deleteMany();
  await db.attachment.deleteMany();
  await db.contractorEntry.deleteMany();
  await db.permit.deleteMany();
  await db.user.deleteMany();

  // ─── Users ────────────────────────────────────────────────
  const amir = await db.user.create({ data: {
    id: 'usr-001', employeeId: 'EMP-4421', name: 'Amir Seitkali',
    role: 'ISSUING_AUTHORITY', department: 'Operations', company: 'Al-Noor Refinery',
    email: 'a.seitkali@alnoor.kz', phone: '+7 701 234 5678',
    certifications: ['PTW-IA','BOSIET','H2S-CA'], isContractor: false, avatarInitials: 'AS',
    password: DEMO_PASSWORD_HASH,
  }});

  const dinara = await db.user.create({ data: {
    id: 'usr-002', employeeId: 'EMP-3312', name: 'Dinara Bekova',
    role: 'AREA_AUTHORITY', department: 'Maintenance', company: 'Al-Noor Refinery',
    email: 'd.bekova@alnoor.kz', phone: '+7 702 345 6789',
    certifications: ['PTW-AA','BOSIET'], isContractor: false, avatarInitials: 'DB',
    password: DEMO_PASSWORD_HASH,
  }});

  const yerzhan = await db.user.create({ data: {
    id: 'usr-003', employeeId: 'EMP-5567', name: 'Yerzhan Akhmetov',
    role: 'HSE_OFFICER', department: 'HSSE', company: 'Al-Noor Refinery',
    email: 'y.akhmetov@alnoor.kz', phone: '+7 707 456 7890',
    certifications: ['NEBOSH-IGC','IOSH','PTW-HSE','H2S-CA'], isContractor: false, avatarInitials: 'YA',
    password: DEMO_PASSWORD_HASH,
  }});

  const sergei = await db.user.create({ data: {
    id: 'usr-004', employeeId: 'EMP-2201', name: 'Sergei Volkov',
    role: 'GAS_TESTER', department: 'HSSE', company: 'Al-Noor Refinery',
    email: 's.volkov@alnoor.kz', phone: '+7 705 567 8901',
    certifications: ['GAS-TESTER-L2','H2S-CA','BOSIET'], isContractor: false, avatarInitials: 'SV',
    password: DEMO_PASSWORD_HASH,
  }});

  const john = await db.user.create({ data: {
    id: 'usr-005', employeeId: 'CON-8891', name: 'John McAllister',
    role: 'PERMIT_REQUESTER', department: 'Turnaround', company: 'Petrofac Services Ltd',
    email: 'j.mcallister@petrofac.com', phone: '+7 712 678 9012',
    certifications: ['BOSIET','H2S-CA'], isContractor: true, avatarInitials: 'JM',
    password: DEMO_PASSWORD_HASH,
  }});

  const aliya = await db.user.create({ data: {
    id: 'usr-006', employeeId: 'EMP-6634', name: 'Aliya Nurmagambetova',
    role: 'SITE_SUPERVISOR', department: 'Operations', company: 'Al-Noor Refinery',
    email: 'a.nurmagambetova@alnoor.kz', phone: '+7 708 789 0123',
    certifications: ['PTW-SS','BOSIET','H2S-CA'], isContractor: false, avatarInitials: 'AN',
    password: DEMO_PASSWORD_HASH,
  }});

  const ruslan = await db.user.create({ data: {
    id: 'usr-007', employeeId: 'EMP-1108', name: 'Ruslan Dzhaksybekov',
    role: 'ISOLATION_AUTHORITY', department: 'Electrical', company: 'Al-Noor Refinery',
    email: 'r.dzhaksybekov@alnoor.kz', phone: '+7 701 890 1234',
    certifications: ['ISO-AUTH','HV-COMPETENT','PTW-IA'], isContractor: false, avatarInitials: 'RD',
    password: DEMO_PASSWORD_HASH,
  }});

  const natalya = await db.user.create({ data: {
    id: 'usr-008', employeeId: 'EMP-0045', name: 'Natalya Petrova',
    role: 'PLANT_OPS_MANAGER', department: 'Operations Management', company: 'Al-Noor Refinery',
    email: 'n.petrova@alnoor.kz', phone: '+7 702 901 2345',
    certifications: ['PTW-POM','NEBOSH-PSM'], isContractor: false, avatarInitials: 'NP',
    password: DEMO_PASSWORD_HASH,
  }});

  console.log('✓ Users created');

  // ─── Permits ──────────────────────────────────────────────
  const pmt001 = await db.permit.create({ data: {
    id: 'pmt-001', permitNumber: 'PTW-2024-0841', type: 'HOT_WORK', status: 'ACTIVE',
    riskLevel: 'HIGH',
    title: 'Welding on CDU Heat Exchanger E-101 Nozzle',
    description: 'Full penetration weld repair on nozzle N4 of E-101 shell side. Hydrocarbon service. Area to be gas-freed and purged prior to commencement.',
    location: 'CDU Unit — Bay 3, Level 2', unit: 'CDU', area: 'Process Area A',
    equipment: 'E-101 Shell-Side Heat Exchanger',
    requestedById: john.id, areaAuthorityId: dinara.id, issuingAuthorityId: amir.id, hseOfficerId: yerzhan.id,
    validFrom: new Date('2024-11-15T07:00:00Z'), validTo: new Date('2024-11-15T19:00:00Z'),
    gasTestRequired: true, isolationRequired: true, confinedSpaceEntry: false,
    hotWorkDetails: { ignitionSources: ['welding arc','hot metal'], firewatchRequired: true, fireExtinguisherLocation: 'North end of Bay 3, post T-N3', hotWorkRadius: 10 },
    jsaCompleted: true, toolboxTalkCompleted: true, workerCount: 4,
    notes: 'Fire watch to remain for 30 minutes post completion. All hot surfaces to cool before permit closure.',
    simopsZone: 'ZONE-A3', qrCode: 'QR-PTW-2024-0841',
    contractors: { create: [
      { name: 'John McAllister', company: 'Petrofac Services Ltd', role: 'Lead Welder', induction: true },
      { name: 'Ali Hassan',      company: 'Petrofac Services Ltd', role: 'Fire Watch',  induction: true },
    ]},
    attachments: { create: [
      { name: 'JSA-HW-0841.pdf',  type: 'JSA',     url: '#', uploadedBy: 'John McAllister', uploadedAt: new Date('2024-11-14T09:45:00Z') },
      { name: 'WPS-SMAW-001.pdf', type: 'DRAWING',  url: '#', uploadedBy: 'John McAllister', uploadedAt: new Date('2024-11-14T10:00:00Z') },
    ]},
  }});

  const pmt002 = await db.permit.create({ data: {
    id: 'pmt-002', permitNumber: 'PTW-2024-0842', type: 'CONFINED_SPACE', status: 'APPROVED',
    riskLevel: 'CRITICAL',
    title: 'Internal Inspection of Atmospheric Storage Tank T-301',
    description: 'Confined space entry for internal visual inspection and sludge sampling of crude oil storage tank T-301. Full gas-free certificate required.',
    location: 'Tank Farm — T-301', unit: 'Storage', area: 'Tank Farm',
    equipment: 'Atmospheric Storage Tank T-301',
    requestedById: john.id, areaAuthorityId: dinara.id, issuingAuthorityId: amir.id, hseOfficerId: yerzhan.id,
    validFrom: new Date('2024-11-15T08:00:00Z'), validTo: new Date('2024-11-15T16:00:00Z'),
    gasTestRequired: true, isolationRequired: true, confinedSpaceEntry: true,
    jsaCompleted: true, toolboxTalkCompleted: false, workerCount: 3,
    notes: 'Continuous atmospheric monitoring mandatory during entry. Rescue equipment at entry point.',
    simopsZone: 'ZONE-TF1', qrCode: 'QR-PTW-2024-0842',
    contractors: { create: [
      { name: 'Marcos Reyes',  company: 'Intertek Industrial', role: 'Entry Supervisor', induction: true },
      { name: 'Pavel Sokolov', company: 'Intertek Industrial', role: 'Entry Person',     induction: true },
      { name: 'Bekzod Umarov', company: 'Al-Noor Refinery',   role: 'Standby Person',   induction: true },
    ]},
  }});

  const pmt003 = await db.permit.create({ data: {
    id: 'pmt-003', permitNumber: 'PTW-2024-0843', type: 'ELECTRICAL', status: 'UNDER_REVIEW',
    riskLevel: 'HIGH',
    title: '11kV Switchboard Maintenance — Substation SB-02',
    description: 'Planned maintenance on 11kV Bus Section Coupler in Substation SB-02. Full HV isolation and earthing required.',
    location: 'Main Substation SB-02', unit: 'Utilities', area: 'Electrical Infrastructure',
    equipment: '11kV Switchboard Panel CB-11-04',
    requestedById: ruslan.id, areaAuthorityId: natalya.id, issuingAuthorityId: amir.id,
    validFrom: new Date('2024-11-16T06:00:00Z'), validTo: new Date('2024-11-16T18:00:00Z'),
    gasTestRequired: false, isolationRequired: true, confinedSpaceEntry: false,
    jsaCompleted: true, toolboxTalkCompleted: false, workerCount: 2,
    notes: 'Substation to be manned at all times during work. Adjacent bus bars remain live — arc flash boundary 1.2m.',
    simopsZone: 'ZONE-UTIL-1', qrCode: 'QR-PTW-2024-0843',
  }});

  const pmt004 = await db.permit.create({ data: {
    id: 'pmt-004', permitNumber: 'PTW-2024-0840', type: 'COLD_WORK', status: 'CLOSED',
    riskLevel: 'LOW',
    title: 'Scaffolding Erection — Column C-204 Area',
    description: 'Erect scaffolding structure around column C-204 for upcoming exchanger bundle pull.',
    location: 'CDU Unit — C-204', unit: 'CDU', area: 'Process Area A', equipment: 'Column C-204',
    requestedById: john.id, areaAuthorityId: dinara.id, issuingAuthorityId: amir.id,
    validFrom: new Date('2024-11-14T07:00:00Z'), validTo: new Date('2024-11-14T17:00:00Z'),
    gasTestRequired: false, isolationRequired: false, confinedSpaceEntry: false,
    jsaCompleted: true, toolboxTalkCompleted: true, workerCount: 5,
    notes: 'Scaffold tag to be affixed on completion. Daily inspection required.',
    simopsZone: 'ZONE-A3', qrCode: 'QR-PTW-2024-0840',
  }});

  const pmt005 = await db.permit.create({ data: {
    id: 'pmt-005', permitNumber: 'PTW-2024-0844', type: 'LINE_BREAKING', status: 'SUSPENDED',
    riskLevel: 'CRITICAL',
    title: 'Process Line Break — HCU Feed Line 8" DN200',
    description: 'Break and re-connect 8" DN200 HCU feed line at flange F-HCU-044 for replacement of spectacle blind. Process fluid: light naphtha.',
    location: 'HCU Unit — Pipe Rack PR-05', unit: 'HCU', area: 'Process Area B',
    equipment: 'HCU Feed Line FL-4402',
    requestedById: john.id, areaAuthorityId: dinara.id, issuingAuthorityId: amir.id, hseOfficerId: yerzhan.id,
    validFrom: new Date('2024-11-15T08:00:00Z'), validTo: new Date('2024-11-15T20:00:00Z'),
    gasTestRequired: true, isolationRequired: true, confinedSpaceEntry: false,
    jsaCompleted: true, toolboxTalkCompleted: true, workerCount: 3,
    notes: 'SUSPENDED — LEL reading exceeded 10% at 11:42. Area evacuated. Re-gas test required before resumption.',
    simopsZone: 'ZONE-B2', qrCode: 'QR-PTW-2024-0844',
  }});

  const pmt006 = await db.permit.create({ data: {
    id: 'pmt-006', permitNumber: 'PTW-2024-0845', type: 'WORK_AT_HEIGHT', status: 'SUBMITTED',
    riskLevel: 'MEDIUM',
    title: 'Flare Stack Inspection — Platform Level 3',
    description: 'Visual inspection and NDT of flare tip and flare stack platform at Level 3 (28m AGL).',
    location: 'Flare Stack FS-01 — Level 3', unit: 'Flare System', area: 'Utilities',
    equipment: 'Flare Stack FS-01',
    requestedById: john.id, areaAuthorityId: aliya.id,
    validFrom: new Date('2024-11-17T07:00:00Z'), validTo: new Date('2024-11-17T15:00:00Z'),
    gasTestRequired: false, isolationRequired: false, confinedSpaceEntry: false,
    jsaCompleted: true, toolboxTalkCompleted: false, workerCount: 2,
    notes: 'Wind speed limit: max 10 m/s. Weather window to be confirmed day-of.',
    simopsZone: 'ZONE-FLARE', qrCode: 'QR-PTW-2024-0845',
  }});

  const pmt007 = await db.permit.create({ data: {
    id: 'pmt-007', permitNumber: 'PTW-2024-0838', type: 'HOT_WORK', status: 'DRAFT',
    riskLevel: 'HIGH',
    title: 'Pipe Weld — Utility Steam Header Tie-in',
    description: 'Butt weld tie-in on utility steam header 4" at tee connection near compressor shelter K-100.',
    location: 'Compressor Area — K-100', unit: 'Utilities', area: 'Process Area C',
    equipment: 'Steam Header SH-400',
    requestedById: john.id,
    validFrom: new Date('2024-11-18T07:00:00Z'), validTo: new Date('2024-11-18T19:00:00Z'),
    gasTestRequired: true, isolationRequired: true, confinedSpaceEntry: false,
    hotWorkDetails: { ignitionSources: ['welding arc'], firewatchRequired: true, fireExtinguisherLocation: 'TBD', hotWorkRadius: 5 },
    jsaCompleted: false, toolboxTalkCompleted: false, workerCount: 0,
    notes: '', simopsZone: 'ZONE-C1', qrCode: 'QR-PTW-2024-0838',
  }});

  const pmt008 = await db.permit.create({ data: {
    id: 'pmt-008', permitNumber: 'PTW-2024-0839', type: 'LIFTING', status: 'ACTIVE',
    riskLevel: 'MEDIUM',
    title: 'Critical Lift — Pump P-401 Replacement',
    description: 'Critical lift for removal and installation of boiler feed water pump P-401. 4.2 tonne load. Mobile crane 60T Liebherr LTM-1060.',
    location: 'Boiler House — Bay 2', unit: 'Utilities', area: 'Boiler Area',
    equipment: 'BFW Pump P-401',
    requestedById: john.id, areaAuthorityId: natalya.id, issuingAuthorityId: amir.id,
    validFrom: new Date('2024-11-15T09:00:00Z'), validTo: new Date('2024-11-15T17:00:00Z'),
    gasTestRequired: false, isolationRequired: true, confinedSpaceEntry: false,
    jsaCompleted: true, toolboxTalkCompleted: true, workerCount: 5,
    notes: 'Exclusion zone: 10m radius from lift area. Banksman required at all times.',
    simopsZone: 'ZONE-BOILER', qrCode: 'QR-PTW-2024-0839',
  }});

  console.log('✓ Permits created');

  // ─── Approvals ────────────────────────────────────────────
  await db.approval.createMany({ data: [
    {
      id: 'apr-001', permitId: pmt002.id, permitNumber: 'PTW-2024-0842',
      permitType: 'CONFINED_SPACE', permitTitle: 'Internal Inspection of Atmospheric Storage Tank T-301',
      location: 'Tank Farm — T-301', requiredRole: 'ISSUING_AUTHORITY',
      assignedToId: amir.id, comments: '', conditions: [],
      createdAt: new Date('2024-11-14T16:30:00Z'), dueBy: new Date('2024-11-15T06:00:00Z'), priority: 'P0',
    },
    {
      id: 'apr-002', permitId: pmt003.id, permitNumber: 'PTW-2024-0843',
      permitType: 'ELECTRICAL', permitTitle: '11kV Switchboard Maintenance — Substation SB-02',
      location: 'Main Substation SB-02', requiredRole: 'AREA_AUTHORITY',
      assignedToId: natalya.id, comments: '', conditions: [],
      createdAt: new Date('2024-11-14T17:00:00Z'), dueBy: new Date('2024-11-15T08:00:00Z'), priority: 'P1',
    },
    {
      id: 'apr-003', permitId: pmt003.id, permitNumber: 'PTW-2024-0843',
      permitType: 'ELECTRICAL', permitTitle: '11kV Switchboard Maintenance — Substation SB-02',
      location: 'Main Substation SB-02', requiredRole: 'ISOLATION_AUTHORITY',
      assignedToId: ruslan.id, comments: '', conditions: [],
      createdAt: new Date('2024-11-14T17:00:00Z'), dueBy: new Date('2024-11-15T08:00:00Z'), priority: 'P1',
    },
    {
      id: 'apr-004', permitId: pmt005.id, permitNumber: 'PTW-2024-0844',
      permitType: 'LINE_BREAKING', permitTitle: 'Process Line Break — HCU Feed Line 8" DN200',
      location: 'HCU Unit — Pipe Rack PR-05', requiredRole: 'HSE_OFFICER',
      assignedToId: yerzhan.id, comments: 'Re-evaluate following gas exceedance at 11:42.',
      conditions: ['Full gas test clearance required','Independent atmospheric monitoring during work'],
      createdAt: new Date('2024-11-15T11:50:00Z'), dueBy: new Date('2024-11-15T14:00:00Z'), priority: 'P0',
    },
    {
      id: 'apr-005', permitId: pmt006.id, permitNumber: 'PTW-2024-0845',
      permitType: 'WORK_AT_HEIGHT', permitTitle: 'Flare Stack Inspection — Platform Level 3',
      location: 'Flare Stack FS-01 — Level 3', requiredRole: 'AREA_AUTHORITY',
      assignedToId: dinara.id, comments: '', conditions: [],
      createdAt: new Date('2024-11-14T16:00:00Z'), dueBy: new Date('2024-11-16T17:00:00Z'), priority: 'P2',
    },
    {
      id: 'apr-006', permitId: pmt001.id, permitNumber: 'PTW-2024-0841',
      permitType: 'HOT_WORK', permitTitle: 'Welding on CDU Heat Exchanger E-101 Nozzle',
      location: 'CDU Unit — Bay 3, Level 2', requiredRole: 'ISSUING_AUTHORITY',
      assignedToId: amir.id, decision: 'APPROVED',
      comments: 'Approved subject to continuous gas monitoring and fire watch.',
      conditions: ['Gas test valid for 1 hour','Fire watch to remain 30 min post-completion'],
      decidedAt: new Date('2024-11-15T06:55:00Z'),
      createdAt: new Date('2024-11-14T09:30:00Z'), dueBy: new Date('2024-11-15T07:00:00Z'), priority: 'P1',
    },
  ]});

  console.log('✓ Approvals created');

  // ─── Gas Tests ────────────────────────────────────────────
  const gtr001 = await db.gasTestRecord.create({ data: {
    id: 'gtr-001', permitId: pmt001.id, permitNumber: 'PTW-2024-0841',
    testedById: sergei.id, testedAt: new Date('2024-11-15T06:45:00Z'),
    location: 'CDU Bay 3 Level 2 — North, East, South, West quadrants',
    overallStatus: 'SAFE', passedAt: new Date('2024-11-15T06:48:00Z'),
    reEntryRequired: false, notes: 'All readings within safe limits. Next test at 07:45.',
    readings: { create: [
      { permitId: pmt001.id, permitNumber: 'PTW-2024-0841', location: 'North', gasType: 'O2',  value: 20.9, unit: '%',     status: 'SAFE', testedById: sergei.id, testedAt: new Date('2024-11-15T06:45:00Z'), instrument: 'BW GasAlert Quattro #Q-0124', instrumentCalibrationDate: '2024-10-01', nextTestDue: new Date('2024-11-15T07:45:00Z'), notes: '' },
      { permitId: pmt001.id, permitNumber: 'PTW-2024-0841', location: 'North', gasType: 'LEL', value: 0.0,  unit: '% LEL', status: 'SAFE', testedById: sergei.id, testedAt: new Date('2024-11-15T06:45:00Z'), instrument: 'BW GasAlert Quattro #Q-0124', instrumentCalibrationDate: '2024-10-01', nextTestDue: new Date('2024-11-15T07:45:00Z'), notes: '' },
      { permitId: pmt001.id, permitNumber: 'PTW-2024-0841', location: 'North', gasType: 'H2S', value: 0.0,  unit: 'ppm',  status: 'SAFE', testedById: sergei.id, testedAt: new Date('2024-11-15T06:45:00Z'), instrument: 'BW GasAlert Quattro #Q-0124', instrumentCalibrationDate: '2024-10-01', nextTestDue: new Date('2024-11-15T07:45:00Z'), notes: '' },
      { permitId: pmt001.id, permitNumber: 'PTW-2024-0841', location: 'North', gasType: 'CO',  value: 3.0,  unit: 'ppm',  status: 'SAFE', testedById: sergei.id, testedAt: new Date('2024-11-15T06:45:00Z'), instrument: 'BW GasAlert Quattro #Q-0124', instrumentCalibrationDate: '2024-10-01', nextTestDue: new Date('2024-11-15T07:45:00Z'), notes: '' },
    ]},
  }});

  const gtr002 = await db.gasTestRecord.create({ data: {
    id: 'gtr-002', permitId: pmt005.id, permitNumber: 'PTW-2024-0844',
    testedById: sergei.id, testedAt: new Date('2024-11-15T11:40:00Z'),
    location: 'HCU Pipe Rack PR-05 — Flange F-HCU-044',
    overallStatus: 'DANGER', failedAt: new Date('2024-11-15T11:42:00Z'),
    reEntryRequired: true, notes: 'LEL reading 12% at flange location. Permit suspended. Area evacuated at 11:42.',
    readings: { create: [
      { permitId: pmt005.id, permitNumber: 'PTW-2024-0844', location: 'F-HCU-044', gasType: 'O2',  value: 20.7, unit: '%',     status: 'SAFE',   testedById: sergei.id, testedAt: new Date('2024-11-15T11:40:00Z'), instrument: 'BW GasAlert Quattro #Q-0125', instrumentCalibrationDate: '2024-10-01', notes: '' },
      { permitId: pmt005.id, permitNumber: 'PTW-2024-0844', location: 'F-HCU-044', gasType: 'LEL', value: 12.0, unit: '% LEL', status: 'DANGER', testedById: sergei.id, testedAt: new Date('2024-11-15T11:40:00Z'), instrument: 'BW GasAlert Quattro #Q-0125', instrumentCalibrationDate: '2024-10-01', notes: 'EXCEEDED — work stopped' },
      { permitId: pmt005.id, permitNumber: 'PTW-2024-0844', location: 'F-HCU-044', gasType: 'H2S', value: 0.5,  unit: 'ppm',  status: 'SAFE',   testedById: sergei.id, testedAt: new Date('2024-11-15T11:40:00Z'), instrument: 'BW GasAlert Quattro #Q-0125', instrumentCalibrationDate: '2024-10-01', notes: '' },
    ]},
  }});

  const gtr003 = await db.gasTestRecord.create({ data: {
    id: 'gtr-003', permitId: pmt002.id, permitNumber: 'PTW-2024-0842',
    testedById: sergei.id, testedAt: new Date('2024-11-15T07:30:00Z'),
    location: 'Tank T-301 — Top Manway, Bottom Manway',
    overallStatus: 'SAFE', passedAt: new Date('2024-11-15T07:33:00Z'),
    reEntryRequired: false, notes: 'Gas-free certificate issued. Continuous monitoring in place.',
    readings: { create: [
      { permitId: pmt002.id, permitNumber: 'PTW-2024-0842', location: 'Top Manway',    gasType: 'O2',  value: 20.9, unit: '%',     status: 'SAFE', testedById: sergei.id, testedAt: new Date('2024-11-15T07:30:00Z'), instrument: 'Industrial Scientific MX6 #MX-0033', instrumentCalibrationDate: '2024-10-15', notes: '' },
      { permitId: pmt002.id, permitNumber: 'PTW-2024-0842', location: 'Top Manway',    gasType: 'LEL', value: 0.0,  unit: '% LEL', status: 'SAFE', testedById: sergei.id, testedAt: new Date('2024-11-15T07:30:00Z'), instrument: 'Industrial Scientific MX6 #MX-0033', instrumentCalibrationDate: '2024-10-15', notes: '' },
      { permitId: pmt002.id, permitNumber: 'PTW-2024-0842', location: 'Bottom Manway', gasType: 'H2S', value: 0.2,  unit: 'ppm',  status: 'SAFE', testedById: sergei.id, testedAt: new Date('2024-11-15T07:30:00Z'), instrument: 'Industrial Scientific MX6 #MX-0033', instrumentCalibrationDate: '2024-10-15', notes: '' },
      { permitId: pmt002.id, permitNumber: 'PTW-2024-0842', location: 'Bottom Manway', gasType: 'CO',  value: 1.0,  unit: 'ppm',  status: 'SAFE', testedById: sergei.id, testedAt: new Date('2024-11-15T07:30:00Z'), instrument: 'Industrial Scientific MX6 #MX-0033', instrumentCalibrationDate: '2024-10-15', notes: '' },
    ]},
  }});

  console.log('✓ Gas tests created');

  // ─── Isolation Certificates ───────────────────────────────
  await db.isolationCertificate.create({ data: {
    id: 'iso-001', certificateNumber: 'ISO-2024-0291',
    permitId: pmt001.id, permitNumber: 'PTW-2024-0841',
    title: 'E-101 Hot Work — Process + Electrical Isolation',
    status: 'VERIFIED', overallStatus: 'VERIFIED',
    issuedById: ruslan.id, verifiedById: amir.id,
    issuedAt: new Date('2024-11-15T06:00:00Z'), verifiedAt: new Date('2024-11-15T06:50:00Z'),
    notes: 'All isolation points applied, tagged and independently verified.',
    energySources: { create: [
      { type: 'ELECTRICAL_LV', description: 'E-101 Motor MCC-A-12',          voltage: 415, isolated: true },
      { type: 'PNEUMATIC',     description: 'E-101 Control valve CV-4401',   pressure: 6,  isolated: true },
      { type: 'THERMAL',       description: 'Hot process fluid residue',                    isolated: true },
      { type: 'CHEMICAL',      description: 'Hydrocarbon content — purged',                 isolated: true },
    ]},
    isolationPoints: { create: [
      { tag: 'E-101-HV-001', description: 'E-101 Feed Isolation Valve',    location: 'CDU Bay 3 — Level 1', isolationType: 'PROCESS',    normalPosition: 'OPEN',   isolatedPosition: 'CLOSED + BLINDED', status: 'VERIFIED', isolatedById: ruslan.id, isolatedAt: new Date('2024-11-15T06:05:00Z'), verifiedById: amir.id, verifiedAt: new Date('2024-11-15T06:52:00Z'), lockTag: 'LOCK-0291-001', hasLock: true, hasTag: true },
      { tag: 'E-101-HV-002', description: 'E-101 Outlet Isolation Valve',  location: 'CDU Bay 3 — Level 1', isolationType: 'PROCESS',    normalPosition: 'OPEN',   isolatedPosition: 'CLOSED + BLINDED', status: 'VERIFIED', isolatedById: ruslan.id, isolatedAt: new Date('2024-11-15T06:08:00Z'), verifiedById: amir.id, verifiedAt: new Date('2024-11-15T06:53:00Z'), lockTag: 'LOCK-0291-002', hasLock: true, hasTag: true },
      { tag: 'MCC-A-12-CB-04', description: 'E-101 Pump Motor Circuit Breaker', location: 'MCC Room A',      isolationType: 'ELECTRICAL', normalPosition: 'CLOSED', isolatedPosition: 'OPEN + RACKED OUT', status: 'VERIFIED', isolatedById: ruslan.id, isolatedAt: new Date('2024-11-15T06:15:00Z'), verifiedById: amir.id, verifiedAt: new Date('2024-11-15T06:54:00Z'), lockTag: 'LOCK-0291-003', hasLock: true, hasTag: true },
    ]},
  }});

  await db.isolationCertificate.create({ data: {
    id: 'iso-002', certificateNumber: 'ISO-2024-0292',
    permitId: pmt005.id, permitNumber: 'PTW-2024-0844',
    title: 'HCU Feed Line Break — Process Isolation',
    status: 'ISOLATED', overallStatus: 'ISOLATED',
    issuedById: ruslan.id, issuedAt: new Date('2024-11-15T07:30:00Z'),
    notes: 'SUSPENDED — LEL exceedance detected. Chemical isolation NOT achieved.',
    energySources: { create: [
      { type: 'HYDRAULIC', description: 'HCU feed line — light naphtha under pressure', pressure: 12, isolated: true  },
      { type: 'CHEMICAL',  description: 'Hydrocarbon vapours — area ventilated',                      isolated: false },
    ]},
    isolationPoints: { create: [
      { tag: 'HCU-SDV-004', description: 'HCU Feed SDV — upstream',       location: 'HCU Inlet — PR-05 Level 0', isolationType: 'PROCESS', normalPosition: 'OPEN',   isolatedPosition: 'CLOSED',                   status: 'ISOLATED', isolatedById: ruslan.id, isolatedAt: new Date('2024-11-15T07:35:00Z'), lockTag: 'LOCK-0292-001', hasLock: true, hasTag: true },
      { tag: 'HCU-BDV-011', description: 'HCU Feed Blowdown Valve — drained', location: 'HCU Inlet — PR-05 Level 0', isolationType: 'PROCESS', normalPosition: 'CLOSED', isolatedPosition: 'OPEN (drain) + LOCKED OPEN', status: 'ISOLATED', isolatedById: ruslan.id, isolatedAt: new Date('2024-11-15T07:38:00Z'), lockTag: 'LOCK-0292-002', hasLock: true, hasTag: true },
    ]},
  }});

  await db.isolationCertificate.create({ data: {
    id: 'iso-003', certificateNumber: 'ISO-2024-0290',
    permitId: pmt004.id, permitNumber: 'PTW-2024-0840',
    title: 'C-204 Scaffolding — No Isolation Required',
    status: 'RELEASED', overallStatus: 'RELEASED',
    issuedById: ruslan.id, verifiedById: amir.id, releasedById: amir.id,
    issuedAt: new Date('2024-11-14T06:45:00Z'), verifiedAt: new Date('2024-11-14T06:50:00Z'), releasedAt: new Date('2024-11-14T17:35:00Z'),
    notes: 'No energy isolation required for cold scaffolding erection. Area barriered only.',
    energySources:    { create: [] },
    isolationPoints:  { create: [] },
  }});

  console.log('✓ Isolation certificates created');

  // ─── SIMOPS Conflicts ─────────────────────────────────────
  await db.sIMOPSConflict.create({ data: {
    id: 'smo-001', permitAId: pmt001.id, permitANumber: 'PTW-2024-0841', permitAType: 'HOT_WORK',
    permitBId: pmt007.id, permitBNumber: 'PTW-2024-0838', permitBType: 'HOT_WORK',
    compatibility: 'CONDITIONAL', zone: 'ZONE-A3',
    raisedAt: new Date('2024-11-15T09:00:00Z'), raisedById: yerzhan.id,
    resolution: 'Under review — assess minimum separation distance between ignition sources.',
    conditions: ['Minimum 15m separation between hot work activities','Dedicated fire watch for each permit','Simultaneous gas monitoring at both locations'],
    isActive: true,
  }});

  await db.sIMOPSConflict.create({ data: {
    id: 'smo-002', permitAId: pmt005.id, permitANumber: 'PTW-2024-0844', permitAType: 'LINE_BREAKING',
    permitBId: pmt001.id, permitBNumber: 'PTW-2024-0841', permitBType: 'HOT_WORK',
    compatibility: 'PROHIBITED', zone: 'ZONE-B2 / ZONE-A3',
    raisedAt: new Date('2024-11-15T08:30:00Z'), raisedById: yerzhan.id,
    resolvedAt: new Date('2024-11-15T11:45:00Z'), resolvedById: yerzhan.id,
    resolution: 'Resolved — PTW-2024-0844 suspended due to LEL exceedance.',
    conditions: [],
    isActive: false,
  }});

  console.log('✓ SIMOPS conflicts created');

  // ─── Audit Log ────────────────────────────────────────────
  await db.auditEntry.createMany({ data: [
    { action: 'PERMIT_CREATED',    entity: 'PERMIT',   entityId: pmt001.id, entityRef: 'PTW-2024-0841', performedById: john.id,   performedAt: new Date('2024-11-14T09:30:00Z'), ipAddress: '172.18.10.55', deviceInfo: 'Chrome 120 / Windows 11', changes: [],                                                               metadata: { permitType: 'HOT_WORK', riskLevel: 'HIGH' } },
    { action: 'PERMIT_SUBMITTED',  entity: 'PERMIT',   entityId: pmt001.id, entityRef: 'PTW-2024-0841', performedById: john.id,   performedAt: new Date('2024-11-14T10:15:00Z'), ipAddress: '172.18.10.55', deviceInfo: 'Chrome 120 / Windows 11', changes: [{ field: 'status', oldValue: 'DRAFT', newValue: 'SUBMITTED' }], metadata: {} },
    { action: 'APPROVAL_SUBMITTED',entity: 'APPROVAL', entityId: 'apr-006', entityRef: 'PTW-2024-0841', performedById: amir.id,   performedAt: new Date('2024-11-15T06:55:00Z'), ipAddress: '172.18.10.12', deviceInfo: 'Chrome 120 / MacOS 14',   changes: [{ field: 'decision', oldValue: null, newValue: 'APPROVED' }],   metadata: { comments: 'Approved subject to gas monitoring' } },
    { action: 'GAS_TEST_RECORDED', entity: 'GAS_TEST', entityId: gtr001.id, entityRef: 'PTW-2024-0841', performedById: sergei.id, performedAt: new Date('2024-11-15T06:45:00Z'), ipAddress: '172.18.10.74', deviceInfo: 'Field Tablet / Android 14', changes: [],                                                              metadata: { overallStatus: 'SAFE', readingCount: 4 } },
    { action: 'PERMIT_ACTIVATED',  entity: 'PERMIT',   entityId: pmt001.id, entityRef: 'PTW-2024-0841', performedById: amir.id,   performedAt: new Date('2024-11-15T07:05:00Z'), ipAddress: '172.18.10.12', deviceInfo: 'Chrome 120 / MacOS 14',   changes: [{ field: 'status', oldValue: 'APPROVED', newValue: 'ACTIVE' }], metadata: {} },
    { action: 'ISOLATION_APPLIED', entity: 'ISOLATION',entityId: 'iso-001', entityRef: 'ISO-2024-0291', performedById: ruslan.id, performedAt: new Date('2024-11-15T06:05:00Z'), ipAddress: '172.18.10.33', deviceInfo: 'Field Tablet / iOS 17',    changes: [{ field: 'ip-001.status', oldValue: 'PENDING', newValue: 'ISOLATED' }], metadata: { isolationPoint: 'E-101-HV-001', lockTag: 'LOCK-0291-001' } },
    { action: 'GAS_TEST_FAILED',   entity: 'GAS_TEST', entityId: gtr002.id, entityRef: 'PTW-2024-0844', performedById: sergei.id, performedAt: new Date('2024-11-15T11:42:00Z'), ipAddress: '172.18.10.74', deviceInfo: 'Field Tablet / Android 14', changes: [],                                                              metadata: { gasType: 'LEL', value: 12, unit: '% LEL', threshold: 5 } },
    { action: 'PERMIT_SUSPENDED',  entity: 'PERMIT',   entityId: pmt005.id, entityRef: 'PTW-2024-0844', performedById: yerzhan.id,performedAt: new Date('2024-11-15T11:43:00Z'), ipAddress: '172.18.10.22', deviceInfo: 'Chrome 120 / Windows 11', changes: [{ field: 'status', oldValue: 'ACTIVE', newValue: 'SUSPENDED' }], metadata: { reason: 'LEL exceedance' } },
    { action: 'PERMIT_CREATED',    entity: 'PERMIT',   entityId: pmt002.id, entityRef: 'PTW-2024-0842', performedById: john.id,   performedAt: new Date('2024-11-13T14:00:00Z'), ipAddress: '172.18.10.55', deviceInfo: 'Chrome 120 / Windows 11', changes: [],                                                               metadata: { permitType: 'CONFINED_SPACE', riskLevel: 'CRITICAL' } },
    { action: 'USER_LOGIN',        entity: 'USER',     entityId: amir.id,   entityRef: 'EMP-4421',       performedById: amir.id,   performedAt: new Date('2024-11-15T06:30:00Z'), ipAddress: '172.18.10.12', deviceInfo: 'Chrome 120 / MacOS 14',   changes: [],                                                               metadata: { mfaUsed: true } },
  ]});

  console.log('✓ Audit entries created');

  // ─── Alerts ───────────────────────────────────────────────
  await db.alert.createMany({ data: [
    { id: 'alt-001', severity: 'CRITICAL', title: 'LEL Exceedance — PTW-2024-0844', message: 'Flammable gas reading 12% LEL at HCU Pipe Rack PR-05. Permit SUSPENDED. Area evacuated at 11:42.', permitId: pmt005.id, permitNumber: 'PTW-2024-0844', createdAt: new Date('2024-11-15T11:42:00Z'), acknowledged: false, autoExpires: false },
    { id: 'alt-003', severity: 'WARNING',  title: 'Permit Expiring — PTW-2024-0841', message: 'Hot Work permit PTW-2024-0841 expires at 19:00 today (3 hours remaining). Initiate closure or extension.', permitId: pmt001.id, permitNumber: 'PTW-2024-0841', createdAt: new Date('2024-11-15T16:00:00Z'), acknowledged: false, autoExpires: true, expiresAt: new Date('2024-11-15T19:30:00Z') },
    { id: 'alt-004', severity: 'WARNING',  title: 'Toolbox Talk Pending — PTW-2024-0842', message: 'Confined Space Entry PTW-2024-0842 approved but toolbox talk not yet completed.', permitId: pmt002.id, permitNumber: 'PTW-2024-0842', createdAt: new Date('2024-11-15T07:00:00Z'), acknowledged: false, autoExpires: false },
    { id: 'alt-005', severity: 'INFO',     title: 'SIMOPS Conflict — Zone A3', message: 'Hot Work PTW-2024-0841 and PTW-2024-0838 (draft) both targeting Zone A3. Review SIMOPS compatibility.', createdAt: new Date('2024-11-15T09:00:00Z'), acknowledged: false, autoExpires: false },
  ]});

  console.log('✓ Alerts created');
  console.log('\n🎉 Seed complete! Database populated with Al-Noor Refinery demo data.');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => db.$disconnect());
