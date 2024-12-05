import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { type ShiftStatus, type DaySchedule, type Note } from '../../types/schedule';
import { StatusModal } from './StatusModal';
import { getStatusColor, getStatusLabel } from '../../constants/statusConfig';

interface DayCellProps {
  schedule: DaySchedule;
  onUpdateSchedule: (status: ShiftStatus, notes: Note[]) => void;
  isEditable: boolean;
  currentUser: { id: string; username: string; role: 'admin' | 'nurse' };
  isWeekend: boolean;
}

export function DayCell({ 
  schedule, 
  onUpdateSchedule, 
  isEditable, 
  currentUser,
  isWeekend
}: DayCellProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    setIsModalOpen(true);
  };

  const statusColor = getStatusColor(schedule.status);
  const statusLabel = getStatusLabel(schedule.status);

  return (
    <>
      <div
        onClick={handleClick}
        className={`w-8 h-8 flex items-center justify-center ${
          isEditable ? 'cursor-pointer hover:opacity-80' : 'cursor-pointer'
        } rounded ${statusColor} ${
          isWeekend ? 'bg-gray-400' : ''
        } relative group transition-all duration-200`}
        title={isEditable ? "Cliquez pour modifier" : "Cliquez pour voir les détails"}
      >
        <div className="flex flex-col items-center">
          {statusLabel}
          {schedule.notes.length > 0 && (
            <MessageCircle size={12} className="absolute -top-1 -right-1" />
          )}
        </div>
      </div>

      {isModalOpen && (
        <StatusModal
          currentSchedule={schedule}
          onUpdateSchedule={onUpdateSchedule}
          onClose={() => setIsModalOpen(false)}
          currentUser={currentUser}
          canModifyStatus={isEditable}
          canAddNotes={true}
        />
      )}
    </>
  );
}