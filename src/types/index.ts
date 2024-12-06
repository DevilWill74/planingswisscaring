export type UserRole = 'admin' | 'nurse';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  created_at: string;
}

export type DayStatus = 'work' | 'rest' | 'vacation' | 'training' | 'unavailable' | 'undefined';

export interface PlanningDay {
  id: string;
  user_id: string;
  date: string;
  status: DayStatus;
  note?: string;
  created_at: string;
}

export const STATUS_ICONS: Record<DayStatus, string> = {
  work: 'T',
  rest: 'R',
  vacation: 'V',
  training: 'F',
  unavailable: 'I',
  undefined: 'N'
};