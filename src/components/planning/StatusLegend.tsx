import React from 'react';
import { DayStatus, STATUS_ICONS } from '../../types';

interface StatusLegendProps {
  statusColors: Record<DayStatus, string>;
  statusLabels: Record<DayStatus, string>;
}

export default function StatusLegend({ statusColors, statusLabels }: StatusLegendProps) {
  return (
    <div className="mb-6 flex justify-center items-center space-x-4">
      {Object.entries(statusLabels).map(([status, label]) => (
        <div key={status} className="flex items-center space-x-2">
          <div className={`w-6 h-6 rounded-full ${statusColors[status as DayStatus]} flex items-center justify-center text-white font-bold`}>
            {STATUS_ICONS[status as DayStatus]}
          </div>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}