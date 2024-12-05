import { supabase } from '../config/supabase';
import { User, AuthResponse } from '../types/auth';

export async function login(username: string, password: string): Promise<AuthResponse> {
  try {
    const { data: user, error } = await supabase
      .rpc('check_password', {
        username: username.toLowerCase(),
        password: password
      });

    if (error) throw error;
    if (!user) {
      return { user: null, error: 'Identifiants incorrects' };
    }

    return { user };
  } catch (error: any) {
    console.error('Login error:', error);
    return { user: null, error: error.message };
  }
}

export async function createUser(username: string, password: string, role: 'admin' | 'nurse'): Promise<AuthResponse> {
  try {
    const { data: user, error } = await supabase
      .from('auth.users')
      .insert([{
        username: username.toLowerCase(),
        encrypted_password: password,
        role
      }])
      .select()
      .single();

    if (error) throw error;
    return { user };
  } catch (error: any) {
    console.error('Create user error:', error);
    return { user: null, error: error.message };
  }
}