import { useMemo } from 'react';
import { ShiftStatus } from '../types/schedule';

const STATUS_CONFIG = {
  travail: { label: 'Travail', color: 'bg-green-500 text-white' },
  repos: { label: 'Repos', color: 'bg-blue-500 text-white' },
  vacances: { label: 'Vacances', color: 'bg-yellow-500 text-white' },
  formation: { label: 'Formation', color: 'bg-purple-500 text-white' },
  indisponible: { label: 'Indisponible', color: 'bg-red-500 text-white' },
  none: { label: 'Non défini', color: 'bg-gray-200 text-gray-700' }
} as const;

export function useStatusConfig() {
  const statusConfig = useMemo(() => STATUS_CONFIG, []);

  const getStatusColor = (status: ShiftStatus): string => {
    return statusConfig[status]?.color || statusConfig.none.color;
  };

  const getStatusLabel = (status: ShiftStatus): string => {
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
  };

  return {
    statusConfig,
    getStatusColor,
    getStatusLabel
  };
}