import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { PlanningDay, DayStatus, User } from '../types';

export const STATUS_COLORS: Record<DayStatus, string> = {
  work: 'bg-green-500 hover:bg-green-600',
  rest: 'bg-blue-500 hover:bg-blue-600',
  vacation: 'bg-yellow-500 hover:bg-yellow-600',
  training: 'bg-purple-500 hover:bg-purple-600',
  unavailable: 'bg-red-500 hover:bg-red-600',
  undefined: 'bg-gray-500 hover:bg-gray-600',
};

export const STATUS_LABELS: Record<DayStatus, string> = {
  work: 'Travail',
  rest: 'Repos',
  vacation: 'Vacances',
  training: 'Formation',
  unavailable: 'Indisponible',
  undefined: 'Non défini',
};

export const getDaysInMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

export const getStatus = (planning: PlanningDay[], userId: string, date: string): PlanningDay | undefined => {
  return planning.find(p => p.user_id === userId && p.date === date);
};

export const getNoteCount = (planning: PlanningDay[], userId: string, date: string): number => {
  return planning.filter(p => p.user_id === userId && p.date === date && p.note).length;
};

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
};

export const getCellClassName = (date: Date): string => {
  return isWeekend(date) ? 'bg-gray-200' : '';
};

export const exportToPDF = (currentDate: Date, nurses: User[], planning: PlanningDay[]) => {
  const doc = new jsPDF();
  doc.text(`Planning - ${currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`, 20, 20);
  doc.save('planning.pdf');
};

export const exportToExcel = (currentDate: Date, nurses: User[], planning: PlanningDay[]) => {
  const ws = XLSX.utils.aoa_to_sheet([
    ['Planning', currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })],
    ['Infirmier', ...Array.from({ length: getDaysInMonth(currentDate) }, (_, i) => i + 1)],
    ...nurses.map(nurse => [
      nurse.username,
      ...Array.from({ length: getDaysInMonth(currentDate) }, (_, i) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
        const day = getStatus(planning, nurse.id, date.toISOString().split('T')[0]);
        return day ? STATUS_LABELS[day.status] : STATUS_LABELS.undefined;
      })
    ])
  ]);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Planning');
  XLSX.writeFile(wb, 'planning.xlsx');
};