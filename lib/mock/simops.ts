import type { SIMOPSConflict } from '@/lib/types';
import { MOCK_USERS } from './users';

const [, , yerzhan] = MOCK_USERS;

export const MOCK_SIMOPS_CONFLICTS: SIMOPSConflict[] = [
  {
    id: 'smo-001',
    permitAId: 'pmt-001',
    permitANumber: 'PTW-2024-0841',
    permitAType: 'HOT_WORK',
    permitBId: 'pmt-007',
    permitBNumber: 'PTW-2024-0838',
    permitBType: 'HOT_WORK',
    compatibility: 'CONDITIONAL',
    zone: 'ZONE-A3',
    raisedAt: '2024-11-15T09:00:00Z',
    raisedBy: yerzhan,
    resolution: 'Under review — assess minimum separation distance between ignition sources.',
    conditions: [
      'Minimum 15m separation between hot work activities',
      'Dedicated fire watch for each permit',
      'Simultaneous gas monitoring at both locations',
    ],
    isActive: true,
  },
  {
    id: 'smo-002',
    permitAId: 'pmt-005',
    permitANumber: 'PTW-2024-0844',
    permitAType: 'LINE_BREAKING',
    permitBId: 'pmt-001',
    permitBNumber: 'PTW-2024-0841',
    permitBType: 'HOT_WORK',
    compatibility: 'PROHIBITED',
    zone: 'ZONE-B2 / ZONE-A3',
    raisedAt: '2024-11-15T08:30:00Z',
    raisedBy: yerzhan,
    resolvedAt: '2024-11-15T11:45:00Z',
    resolvedBy: yerzhan,
    resolution: 'Resolved — PTW-2024-0844 suspended due to LEL exceedance. Hot work PTW-2024-0841 continues in isolated zone.',
    conditions: [],
    isActive: false,
  },
];

export const getActiveConflicts = (): SIMOPSConflict[] =>
  MOCK_SIMOPS_CONFLICTS.filter(c => c.isActive);
