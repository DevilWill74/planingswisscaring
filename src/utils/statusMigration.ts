import { ShiftStatus } from '../types/schedule';

const statusMigrationMap: Record<string, ShiftStatus> = {
  'present': 'travail',
  'repos': 'repos',
  'conge': 'vacances',
  'formation': 'formation',
  'maladie': 'indisponible',
  'none': 'none'
};

export function migrateStatus(oldStatus: string): ShiftStatus {
  return statusMigrationMap[oldStatus] || 'none';
}