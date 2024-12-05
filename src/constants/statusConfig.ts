import { ShiftStatus } from '../types/schedule';

export const STATUS_CONFIG = {
  travail: { label: 'Travail', color: 'bg-green-500 text-white' },
  repos: { label: 'Repos', color: 'bg-blue-500 text-white' },
  vacances: { label: 'Vacances', color: 'bg-yellow-500 text-white' },
  formation: { label: 'Formation', color: 'bg-purple-500 text-white' },
  indisponible: { label: 'Indisponible', color: 'bg-red-500 text-white' },
  none: { label: 'Non défini', color: 'bg-gray-400 text-white' }
} as const;

export function getStatusColor(status: ShiftStatus): string {
  return STATUS_CONFIG[status]?.color || STATUS_CONFIG.none.color;
}

export function getStatusLabel(status: ShiftStatus): string {
  switch (status) {
    case 'travail':
      return 'T';
    case 'vacances':
      return 'V';
    case 'indisponible':
      return 'I';
    default:
      return status[0].toUpperCase();
  }
}