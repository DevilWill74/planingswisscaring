import { supabase } from '../config/supabase';
import { MonthlySchedule } from '../types/schedule';
import { DatabaseError } from '../utils/errorHandling';

export async function getSchedule(): Promise<MonthlySchedule> {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select('*');
    
    if (error) throw new DatabaseError(error.message, error);
    
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
  try {
    const { error } = await supabase
      .from('schedules')
      .upsert([{
        key,
        schedule,
        updated_at: new Date().toISOString()
      }], {
        onConflict: 'key'
      });
    
    if (error) throw new DatabaseError(error.message, error);
  } catch (error) {
    console.error('Error saving schedule:', error);
    throw error;
  }
}