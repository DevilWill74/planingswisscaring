export interface Nurse {
  id: string;
  name: string;
  userId?: string;
}

export type ShiftStatus = 'travail' | 'repos' | 'vacances' | 'formation' | 'indisponible' | 'none';

export interface Note {
  text: string;
  author: string;
  authorId: string;
  timestamp: number;
}

export interface DaySchedule {
  status: ShiftStatus;
  notes: Note[];
}

export interface ScheduleEntry {
  id: string;
  user_id: string;
  year: number;
  month: number;
  day: number;
  status: ShiftStatus;
  notes: Note[];
  created_at?: string;
  updated_at?: string;
}

export type MonthlySchedule = {
  [key: string]: DaySchedule[];
};