import React, { useState } from 'react';
import { type ShiftStatus, type DaySchedule, type Note } from '../types/schedule';
import { MessageCircle, Trash2 } from 'lucide-react';
import { STATUS_CONFIG } from '../constants/statusConfig';

interface DayCellProps {
  schedule: DaySchedule;
  onUpdateSchedule: (status: ShiftStatus, notes: Note[]) => void;
  isEditable: boolean;
  currentUser: { id: string; username: string };
  isWeekend: boolean;
}

export function DayCell({ schedule, onUpdateSchedule, isEditable, currentUser, isWeekend }: DayCellProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNote, setNewNote] = useState('');

  const currentSchedule: DaySchedule = {
    status: schedule?.status || 'none',
    notes: schedule?.notes || []
  };

  const handleStatusClick = (newStatus: ShiftStatus) => {
    if (!isEditable) return;
    onUpdateSchedule(newStatus, currentSchedule.notes);
    setIsModalOpen(false);
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      const newNoteObj: Note = {
        text: newNote.trim(),
        author: currentUser.username,
        authorId: currentUser.id,
        timestamp: Date.now()
      };
      const updatedNotes = [...currentSchedule.notes, newNoteObj];
      onUpdateSchedule(currentSchedule.status, updatedNotes);
      setNewNote('');
    }
  };

  const handleDeleteNote = (timestamp: number) => {
    const updatedNotes = currentSchedule.notes.filter(note => note.timestamp !== timestamp);
    onUpdateSchedule(currentSchedule.status, updatedNotes);
  };

  const statusConfig = STATUS_CONFIG[currentSchedule.status] || STATUS_CONFIG.none;
  const statusLabel = 
    currentSchedule.status === 'travail' ? 'T' : 
    currentSchedule.status === 'vacances' ? 'V' : 
    currentSchedule.status === 'indisponible' ? 'I' :
    currentSchedule.status[0].toUpperCase();

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className={`w-8 h-8 flex items-center justify-center ${
          isEditable ? 'cursor-pointer hover:opacity-80' : 'cursor-pointer'
        } rounded ${statusConfig.color} ${
          isWeekend ? 'bg-gray-400' : ''
        } relative group transition-all duration-200`}
      >
        <div className="flex flex-col items-center">
          {statusLabel}
          {currentSchedule.notes.length > 0 && (
            <MessageCircle size={12} className="absolute -top-1 -right-1" />
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {isEditable ? 'Modifier le statut' : 'Détails'}
            </h3>
            
            {isEditable && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {Object.entries(STATUS_CONFIG).map(([statusKey, config]) => (
                  <button
                    key={statusKey}
                    onClick={() => handleStatusClick(statusKey as ShiftStatus)}
                    className={`p-2 rounded ${config.color} hover:opacity-80 transition-opacity`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              {currentSchedule.notes.map((note) => (
                <div key={note.timestamp} className="mb-2 p-2 bg-gray-50 rounded flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-600">{note.author}:</div>
                    <div>{note.text}</div>
                  </div>
                  {(note.authorId === currentUser.id) && (
                    <button
                      onClick={() => handleDeleteNote(note.timestamp)}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="Supprimer la note"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                  placeholder="Ajouter une note..."
                  rows={2}
                />
                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 self-end"
                >
                  Ajouter
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}