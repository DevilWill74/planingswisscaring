import React, { useState, useEffect } from 'react';
import { LogOut, AlertCircle, Loader } from 'lucide-react';
import { type ShiftStatus, type Note } from '../types/schedule';
import { type User } from '../types/auth';
import { ScheduleTable } from './ScheduleTable';
import { Legend } from './Legend';
import { UserManagement } from './UserManagement';
import { MonthSelector } from './MonthSelector';
import { useScheduleStore } from '../stores/scheduleStore';
import { useAuthStore } from '../stores/authStore';

interface NurseSchedulerProps {
  isAdmin: boolean;
  currentUser: User;
}

export function NurseScheduler({ isAdmin, currentUser }: NurseSchedulerProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const logout = useAuthStore(state => state.logout);
  
  const {
    nurses,
    schedule,
    loading,
    error,
    loadData,
    addNurse,
    deleteNurse,
    updateSchedule
  } = useScheduleStore();

  useEffect(() => {
    loadData().catch(console.error);
  }, [loadData]);

  const handleUpdateSchedule = async (nurseId: string, day: number, status: ShiftStatus, notes: Note[]) => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      await updateSchedule(nurseId, year, month, day + 1, status, notes);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du planning:', error);
    }
  };

  const handleDeleteNurse = (nurseId: string) => {
    if (!isAdmin) return;
    setDeleteConfirmation(nurseId);
  };

  const confirmDelete = async (nurseId: string) => {
    try {
      await deleteNurse(nurseId);
      setDeleteConfirmation(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-[95%] mx-auto py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Planning des Infirmiers
          </h1>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            <LogOut size={20} />
            Déconnexion
          </button>
        </div>

        {isAdmin && (
          <UserManagement
            onAddNurse={addNurse}
          />
        )}

        <Legend />

        <MonthSelector
          currentDate={currentDate}
          onMonthChange={setCurrentDate}
        />

        <div className="border rounded-lg mt-4">
          <ScheduleTable
            nurses={nurses}
            schedule={schedule}
            onUpdateSchedule={handleUpdateSchedule}
            onDeleteNurse={handleDeleteNurse}
            currentUser={currentUser}
            isAdmin={isAdmin}
            currentDate={currentDate}
          />
        </div>

        {deleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Confirmer la suppression</h3>
              <p className="mb-4">Êtes-vous sûr de vouloir supprimer cet(te) infirmier(ère) et son planning ?</p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDeleteConfirmation(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Annuler
                </button>
                <button
                  onClick={() => confirmDelete(deleteConfirmation)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}