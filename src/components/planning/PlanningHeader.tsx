import React from 'react';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface PlanningHeaderProps {
  currentDate: Date;
  onMonthChange: (increment: number) => void;
  onYearChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onMonthSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  isAdmin: boolean;
  onExportPDF: () => void;
  onExportExcel: () => void;
}

export default function PlanningHeader({
  currentDate,
  onMonthChange,
  onYearChange,
  onMonthSelect,
  isAdmin,
  onExportPDF,
  onExportExcel
}: PlanningHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold">Planning</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onMonthChange(-1)}
            className="p-1 rounded hover:bg-gray-200"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <select
            value={currentDate.getMonth()}
            onChange={onMonthSelect}
            className="rounded border-gray-300"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {new Date(2000, i).toLocaleDateString('fr-FR', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={currentDate.getFullYear()}
            onChange={onYearChange}
            className="rounded border-gray-300"
          >
            {Array.from({ length: 10 }, (_, i) => {
              const year = new Date().getFullYear() + i - 5;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
          <button
            onClick={() => onMonthChange(1)}
            className="p-1 rounded hover:bg-gray-200"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      {isAdmin && (
        <div className="space-x-4">
          <button
            onClick={onExportPDF}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Download className="h-4 w-4 mr-2" />
            PDF
          </button>
          <button
            onClick={onExportExcel}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Excel
          </button>
        </div>
      )}
    </div>
  );
}