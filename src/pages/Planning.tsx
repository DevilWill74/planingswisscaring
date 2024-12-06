import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { User, PlanningDay, DayStatus, STATUS_ICONS } from '../types';
import { Download, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

const STATUS_COLORS: Record<DayStatus, string> = {
  work: 'bg-green-500 hover:bg-green-600',
  rest: 'bg-blue-500 hover:bg-blue-600',
  vacation: 'bg-yellow-500 hover:bg-yellow-600',
  training: 'bg-purple-500 hover:bg-purple-600',
  unavailable: 'bg-red-500 hover:bg-red-600',
  undefined: 'bg-gray-500 hover:bg-gray-600',
};

const STATUS_LABELS: Record<DayStatus, string> = {
  work: 'Travail',
  rest: 'Repos',
  vacation: 'Vacances',
  training: 'Formation',
  unavailable: 'Indisponible',
  undefined: 'Non défini',
};

export default function Planning() {
  const [nurses, setNurses] = useState<User[]>([]);
  const [planning, setPlanning] = useState<PlanningDay[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<{ userId: string; date: string } | null>(null);
  const [note, setNote] = useState('');
  const { user, isAdmin } = useAuthStore();

  useEffect(() => {
    fetchNurses();
    fetchPlanning();
  }, [currentDate]);

  const fetchNurses = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'nurse')
      .order('username');
    setNurses(data || []);
  };

  const fetchPlanning = async () => {
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const { data } = await supabase
      .from('planning')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0]);
    setPlanning(data || []);
  };

  const updateStatus = async (userId: string, date: string, status: DayStatus) => {
    if (!isAdmin() && userId !== user?.id) return;

    try {
      const existingDay = planning.find(
        (p) => p.user_id === userId && p.date === date
      );

      const planningData = {
        user_id: userId,
        date,
        status,
        note: note.trim() || null
      };

      if (existingDay) {
        const { error } = await supabase
          .from('planning')
          .update(planningData)
          .eq('id', existingDay.id);

        if (!error) {
          setPlanning(planning.map((p) =>
            p.id === existingDay.id ? { ...p, ...planningData } : p
          ));
        }
      } else {
        const { data, error } = await supabase
          .from('planning')
          .insert([planningData])
          .select()
          .single();

        if (!error && data) {
          setPlanning([...planning, data]);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
    }

    setSelectedDay(null);
    setNote('');
  };

  const updateNote = async () => {
    if (!selectedDay || (!isAdmin() && selectedDay.userId !== user?.id)) return;

    try {
      const existingDay = planning.find(
        (p) => p.user_id === selectedDay.userId && p.date === selectedDay.date
      );

      const planningData = {
        user_id: selectedDay.userId,
        date: selectedDay.date,
        status: existingDay?.status || 'undefined',
        note: note.trim() || null
      };

      if (existingDay) {
        const { error } = await supabase
          .from('planning')
          .update(planningData)
          .eq('id', existingDay.id);

        if (!error) {
          setPlanning(planning.map((p) =>
            p.id === existingDay.id ? { ...p, ...planningData } : p
          ));
        }
      } else {
        const { data, error } = await supabase
          .from('planning')
          .insert([planningData])
          .select()
          .single();

        if (!error && data) {
          setPlanning([...planning, data]);
        }
      }

      setSelectedDay(null);
      setNote('');
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la note:", error);
    }
  };

  const getDaysInMonth = () => {
    return new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();
  };

  const getStatus = (userId: string, date: string): PlanningDay | undefined => {
    return planning.find(
      (p) => p.user_id === userId && p.date === date
    );
  };

  const changeMonth = (increment: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value), 1));
  };

  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['Planning', currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })],
      ['Infirmier', ...Array.from({ length: getDaysInMonth() }, (_, i) => i + 1)],
      ...nurses.map(nurse => [
        nurse.username,
        ...Array.from({ length: getDaysInMonth() }, (_, i) => {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
          const day = getStatus(nurse.id, date.toISOString().split('T')[0]);
          return day ? STATUS_LABELS[day.status] : STATUS_LABELS.undefined;
        })
      ])
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Planning');
    XLSX.writeFile(wb, 'planning.xlsx');
  };

  return (
    <div className="max-w-full overflow-x-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">Planning</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => changeMonth(-1)}
              className="p-1 rounded hover:bg-gray-200"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <select
              value={currentDate.getMonth()}
              onChange={handleMonthChange}
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
              onChange={handleYearChange}
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
              onClick={() => changeMonth(1)}
              className="p-1 rounded hover:bg-gray-200"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        {isAdmin() && (
          <div className="space-x-4">
            <button
              onClick={exportToExcel}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Excel
            </button>
          </div>
        )}
      </div>

      <div className="mb-6 flex justify-center items-center space-x-4">
        {Object.entries(STATUS_LABELS).map(([status, label]) => (
          <div key={status} className="flex items-center space-x-2">
            <div className={`w-6 h-6 rounded-full ${STATUS_COLORS[status as DayStatus]} flex items-center justify-center text-white font-bold`}>
              {STATUS_ICONS[status as DayStatus]}
            </div>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Infirmier
                </th>
                {Array.from({ length: getDaysInMonth() }, (_, i) => {
                  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
                  return (
                    <th 
                      key={i} 
                      className={`px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider ${
                        isWeekend(date) ? 'bg-gray-200' : ''
                      }`}
                    >
                      {i + 1}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {nurses.map((nurse) => (
                <tr key={nurse.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {nurse.username}
                  </td>
                  {Array.from({ length: getDaysInMonth() }, (_, i) => {
                    const date = new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth(),
                      i + 1
                    );
                    const dateStr = date.toISOString().split('T')[0];
                    const day = getStatus(nurse.id, dateStr);
                    const status = day?.status || 'undefined';

                    return (
                      <td 
                        key={i} 
                        className={`px-1 py-4 relative ${isWeekend(date) ? 'bg-gray-200' : ''}`}
                      >
                        <button
                          onClick={() => {
                            setSelectedDay({ userId: nurse.id, date: dateStr });
                            setNote(day?.note || '');
                          }}
                          disabled={!isAdmin() && nurse.id !== user?.id}
                          className={`w-8 h-8 rounded-full text-white font-bold ${STATUS_COLORS[status]} disabled:opacity-50 disabled:cursor-not-allowed`}
                          title={day?.note}
                        >
                          {STATUS_ICONS[status]}
                        </button>
                        {day?.note && (
                          <div className="absolute -top-1 -right-1">
                            <MessageCircle className="h-4 w-4 text-blue-500" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Choisir un statut
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {Object.entries(STATUS_LABELS).map(([status, label]) => (
                <button
                  key={status}
                  onClick={() => updateStatus(selectedDay.userId, selectedDay.date, status as DayStatus)}
                  className={`p-3 rounded-lg text-white font-medium ${STATUS_COLORS[status as DayStatus]} transition-colors duration-200`}
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
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={3}
                placeholder="Ajouter une note..."
              />
              <button
                onClick={updateNote}
                className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
              >
                Envoyer la note
              </button>
            </div>
            <button
              onClick={() => {
                setSelectedDay(null);
                setNote('');
              }}
              className="w-full py-2 text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}