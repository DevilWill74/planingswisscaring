import { supabase } from '../config/supabase';
import { User } from '../types/auth';
import { DatabaseError } from '../utils/errorHandling';

export async function getUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('username');
    
    if (error) throw new DatabaseError(error.message, error);
    return data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export async function saveUser(user: User): Promise<void> {
  try {
    const { error } = await supabase
      .from('users')
      .upsert([{
        id: user.id,
        username: user.username,
        password: user.password,
        role: user.role,
        created_at: new Date().toISOString()
      }], {
        onConflict: 'id'
      });
    
    if (error) throw new DatabaseError(error.message, error);
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
}

export async function validateUser(username: string, password: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username.toLowerCase())
      .eq('password', password)
      .single();
    
    if (error && error.code !== 'PGRST116') { // Ignore "no rows returned" error
      throw new DatabaseError(error.message, error);
    }
    return data;
  } catch (error) {
    console.error('Error validating user:', error);
    throw error;
  }
}