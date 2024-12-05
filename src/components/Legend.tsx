import React from 'react';
import { STATUS_CONFIG, getStatusLabel } from '../constants/statusConfig';
import { ShiftStatus } from '../types/schedule';

export function Legend() {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {Object.entries(STATUS_CONFIG).map(([status, config]) => (
        <div key={status} className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-sm font-medium ${config.color}`}>
            {getStatusLabel(status as ShiftStatus)}
          </span>
          <span className="text-sm text-gray-600">{config.label}</span>
        </div>
      ))}
    </div>
  );
}