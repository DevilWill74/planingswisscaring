import { createClient } from '@supabase/supabase-js';
import { User } from '../types/auth';
import { Nurse, MonthlySchedule } from '../types/schedule';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Users
export async function getUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('username');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export async function saveUser(user: User): Promise<void> {
  const { error } = await supabase
    .from('users')
    .upsert([user]);
  
  if (error) throw error;
}

// Nurses
export async function getNurses(): Promise<Nurse[]> {
  try {
    const { data, error } = await supabase
      .from('nurses')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching nurses:', error);
    throw error;
  }
}

export async function saveNurse(nurse: Nurse): Promise<void> {
  const { error } = await supabase
    .from('nurses')
    .upsert([nurse]);
  
  if (error) throw error;
}

export async function deleteNurse(nurseId: string): Promise<void> {
  const { error } = await supabase
    .from('nurses')
    .delete()
    .eq('id', nurseId);
  
  if (error) throw error;
}

// Schedule
export async function getSchedule(): Promise<MonthlySchedule> {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select('*');
    
    if (error) throw error;
    
    const schedule: MonthlySchedule = {};
    data?.forEach(item => {
      schedule[item.key] = item.schedule;
    });
    
    return schedule;
  } catch (error) {
    console.error('Error fetching schedule:', error);
    throw error;
  }
}

export async function saveSchedule(key: string, schedule: any): Promise<void> {
  const { error } = await supabase
    .from('schedules')
    .upsert([{ key, schedule }]);
  
  if (error) throw error;
}