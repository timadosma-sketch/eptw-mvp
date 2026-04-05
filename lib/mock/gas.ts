import type { GasTestRecord, GasReading, Alert } from '@/lib/types';
import { MOCK_USERS } from './users';

const [, , , sergei] = MOCK_USERS;

export const MOCK_GAS_RECORDS: GasTestRecord[] = [
  {
    id: 'gtr-001',
    permitId: 'pmt-001',
    permitNumber: 'PTW-2024-0841',
    testedBy: sergei,
    testedAt: '2024-11-15T06:45:00Z',
    location: 'CDU Bay 3 Level 2 — North, East, South, West quadrants',
    readings: [
      { id: 'gr-001', permitId: 'pmt-001', permitNumber: 'PTW-2024-0841', location: 'North', gasType: 'O2',  value: 20.9, unit: '%',     status: 'SAFE',    testedBy: sergei, testedAt: '2024-11-15T06:45:00Z', instrument: 'BW GasAlert Quattro #Q-0124', instrumentCalibrationDate: '2024-10-01', nextTestDue: '2024-11-15T07:45:00Z', notes: '' },
      { id: 'gr-002', permitId: 'pmt-001', permitNumber: 'PTW-2024-0841', location: 'North', gasType: 'LEL', value: 0.0,  unit: '% LEL', status: 'SAFE',    testedBy: sergei, testedAt: '2024-11-15T06:45:00Z', instrument: 'BW GasAlert Quattro #Q-0124', instrumentCalibrationDate: '2024-10-01', nextTestDue: '2024-11-15T07:45:00Z', notes: '' },
      { id: 'gr-003', permitId: 'pmt-001', permitNumber: 'PTW-2024-0841', location: 'North', gasType: 'H2S', value: 0.0,  unit: 'ppm',  status: 'SAFE',    testedBy: sergei, testedAt: '2024-11-15T06:45:00Z', instrument: 'BW GasAlert Quattro #Q-0124', instrumentCalibrationDate: '2024-10-01', nextTestDue: '2024-11-15T07:45:00Z', notes: '' },
      { id: 'gr-004', permitId: 'pmt-001', permitNumber: 'PTW-2024-0841', location: 'North', gasType: 'CO',  value: 3.0,  unit: 'ppm',  status: 'SAFE',    testedBy: sergei, testedAt: '2024-11-15T06:45:00Z', instrument: 'BW GasAlert Quattro #Q-0124', instrumentCalibrationDate: '2024-10-01', nextTestDue: '2024-11-15T07:45:00Z', notes: '' },
    ],
    overallStatus: 'SAFE',
    passedAt: '2024-11-15T06:48:00Z',
    reEntryRequired: false,
    notes: 'All readings within safe limits. Next test at 07:45.',
  },
  {
    id: 'gtr-002',
    permitId: 'pmt-005',
    permitNumber: 'PTW-2024-0844',
    testedBy: sergei,
    testedAt: '2024-11-15T11:40:00Z',
    location: 'HCU Pipe Rack PR-05 — Flange F-HCU-044',
    readings: [
      { id: 'gr-005', permitId: 'pmt-005', permitNumber: 'PTW-2024-0844', location: 'F-HCU-044', gasType: 'O2',  value: 20.7, unit: '%',     status: 'SAFE',    testedBy: sergei, testedAt: '2024-11-15T11:40:00Z', instrument: 'BW GasAlert Quattro #Q-0125', instrumentCalibrationDate: '2024-10-01', nextTestDue: '2024-11-15T12:40:00Z', notes: '' },
      { id: 'gr-006', permitId: 'pmt-005', permitNumber: 'PTW-2024-0844', location: 'F-HCU-044', gasType: 'LEL', value: 12.0, unit: '% LEL', status: 'DANGER',  testedBy: sergei, testedAt: '2024-11-15T11:40:00Z', instrument: 'BW GasAlert Quattro #Q-0125', instrumentCalibrationDate: '2024-10-01', nextTestDue: '2024-11-15T12:40:00Z', notes: 'EXCEEDED — work stopped' },
      { id: 'gr-007', permitId: 'pmt-005', permitNumber: 'PTW-2024-0844', location: 'F-HCU-044', gasType: 'H2S', value: 0.5,  unit: 'ppm',  status: 'SAFE',    testedBy: sergei, testedAt: '2024-11-15T11:40:00Z', instrument: 'BW GasAlert Quattro #Q-0125', instrumentCalibrationDate: '2024-10-01', nextTestDue: '2024-11-15T12:40:00Z', notes: '' },
    ],
    overallStatus: 'DANGER',
    failedAt: '2024-11-15T11:42:00Z',
    reEntryRequired: true,
    notes: 'LEL reading 12% at flange location. Permit suspended. Area evacuated at 11:42. Investigate hydrocarbon source.',
  },
  {
    id: 'gtr-003',
    permitId: 'pmt-002',
    permitNumber: 'PTW-2024-0842',
    testedBy: sergei,
    testedAt: '2024-11-15T07:30:00Z',
    location: 'Tank T-301 — Top Manway, Bottom Manway',
    readings: [
      { id: 'gr-008', permitId: 'pmt-002', permitNumber: 'PTW-2024-0842', location: 'Top Manway',    gasType: 'O2',  value: 20.9, unit: '%',     status: 'SAFE',    testedBy: sergei, testedAt: '2024-11-15T07:30:00Z', instrument: 'Industrial Scientific MX6 #MX-0033', instrumentCalibrationDate: '2024-10-15', nextTestDue: '2024-11-15T08:30:00Z', notes: '' },
      { id: 'gr-009', permitId: 'pmt-002', permitNumber: 'PTW-2024-0842', location: 'Top Manway',    gasType: 'LEL', value: 0.0,  unit: '% LEL', status: 'SAFE',    testedBy: sergei, testedAt: '2024-11-15T07:30:00Z', instrument: 'Industrial Scientific MX6 #MX-0033', instrumentCalibrationDate: '2024-10-15', nextTestDue: '2024-11-15T08:30:00Z', notes: '' },
      { id: 'gr-010', permitId: 'pmt-002', permitNumber: 'PTW-2024-0842', location: 'Bottom Manway', gasType: 'H2S', value: 0.2,  unit: 'ppm',  status: 'SAFE',    testedBy: sergei, testedAt: '2024-11-15T07:30:00Z', instrument: 'Industrial Scientific MX6 #MX-0033', instrumentCalibrationDate: '2024-10-15', nextTestDue: '2024-11-15T08:30:00Z', notes: '' },
      { id: 'gr-011', permitId: 'pmt-002', permitNumber: 'PTW-2024-0842', location: 'Bottom Manway', gasType: 'CO',  value: 1.0,  unit: 'ppm',  status: 'SAFE',    testedBy: sergei, testedAt: '2024-11-15T07:30:00Z', instrument: 'Industrial Scientific MX6 #MX-0033', instrumentCalibrationDate: '2024-10-15', nextTestDue: '2024-11-15T08:30:00Z', notes: '' },
    ],
    overallStatus: 'SAFE',
    passedAt: '2024-11-15T07:33:00Z',
    reEntryRequired: false,
    notes: 'Gas-free certificate issued. Continuous monitoring in place.',
  },
];

export const MOCK_GAS_ALERTS: Alert[] = [
  {
    id: 'alt-001',
    severity: 'CRITICAL',
    title: 'LEL Exceedance — PTW-2024-0844',
    message: 'Flammable gas reading 12% LEL at HCU Pipe Rack PR-05. Permit suspended. Area evacuated.',
    permitId: 'pmt-005',
    permitNumber: 'PTW-2024-0844',
    createdAt: '2024-11-15T11:42:00Z',
    acknowledged: false,
    autoExpires: false,
  },
  {
    id: 'alt-002',
    severity: 'WARNING',
    title: 'Gas Test Overdue — PTW-2024-0841',
    message: 'Hot work permit PTW-2024-0841 — gas retest due at 08:45. Current time 09:02. Work must stop until retest.',
    permitId: 'pmt-001',
    permitNumber: 'PTW-2024-0841',
    createdAt: '2024-11-15T09:02:00Z',
    acknowledged: true,
    acknowledgedBy: 'Amir Seitkali',
    acknowledgedAt: '2024-11-15T09:03:00Z',
    autoExpires: true,
    expiresAt: '2024-11-15T10:00:00Z',
  },
];

export const getGasRecordsByPermit = (permitId: string): GasTestRecord[] =>
  MOCK_GAS_RECORDS.filter(r => r.permitId === permitId);

export const getActiveGasAlerts = (): Alert[] =>
  MOCK_GAS_ALERTS.filter(a => !a.acknowledged);

export const getLatestReadingsByPermit = (permitId: string): GasReading[] => {
  const record = MOCK_GAS_RECORDS.filter(r => r.permitId === permitId)
    .sort((a, b) => new Date(b.testedAt).getTime() - new Date(a.testedAt).getTime())[0];
  return record?.readings ?? [];
};
