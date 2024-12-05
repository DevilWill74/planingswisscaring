import { supabase } from '../config/supabase';
import { Nurse } from '../types/schedule';
import { DatabaseError } from '../utils/errorHandling';

export async function getNurses(): Promise<Nurse[]> {
  try {
    const { data, error } = await supabase
      .from('nurses')
      .select('*')
      .order('name');
    
    if (error) throw new DatabaseError(error.message, error);
    return data || [];
  } catch (error) {
    console.error('Error fetching nurses:', error);
    throw error;
  }
}

export async function saveNurse(nurse: Nurse): Promise<void> {
  try {
    const { error } = await supabase
      .from('nurses')
      .upsert([{
        ...nurse,
        created_at: new Date().toISOString()
      }], {
        onConflict: 'id'
      });
    
    if (error) throw new DatabaseError(error.message, error);
  } catch (error) {
    console.error('Error saving nurse:', error);
    throw error;
  }
}

export async function deleteNurse(nurseId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('nurses')
      .delete()
      .eq('id', nurseId);
    
    if (error) throw new DatabaseError(error.message, error);
  } catch (error) {
    console.error('Error deleting nurse:', error);
    throw error;
  }
}