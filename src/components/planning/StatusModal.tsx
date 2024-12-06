import React from 'react';
import { DayStatus } from '../../types';

interface StatusModalProps {
  onClose: () => void;
  onUpdateStatus: (status: DayStatus) => void;
  note: string;
  onNoteChange: (note: string) => void;
  statusColors: Record<DayStatus, string>;
  statusLabels: Record<DayStatus, string>;
}

export default function StatusModal({
  onClose,
  onUpdateStatus,
  note,
  onNoteChange,
  statusColors,
  statusLabels,
}: StatusModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-4 text-center">
          Choisir un statut
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {Object.entries(statusLabels).map(([status, label]) => (
            <button
              key={status}
              onClick={() => onUpdateStatus(status as DayStatus)}
              className={`p-3 rounded-lg text-white font-medium ${statusColors[status as DayStatus]} transition-colors duration-200`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mb-4">
          <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
            Note (optionnelle)
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={3}
            placeholder="Ajouter une note..."
          />
        </div>
        <button
          onClick={onClose}
          className="w-full py-2 text-gray-600 hover:text-gray-800"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}