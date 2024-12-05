import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';
import { SUPABASE_CONFIG } from './supabaseConfig';

if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
  throw new Error('Les variables d\'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont requises');
}

export const supabase = createClient<Database>(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: window.localStorage
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export async function setCurrentUser(userId: string) {
  try {
    const { error } = await supabase.rpc('set_current_user', { user_id: userId });
    if (error) throw error;
  } catch (error) {
    console.error('Erreur lors de la définition de l\'utilisateur courant:', error);
    throw error;
  }
}

export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
      .single();

    if (error) {
      console.error('Erreur de connexion Supabase:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur de connexion Supabase:', error);
    return false;
  }
}

export function subscribeToChanges(callback: () => void) {
  const channels = [
    supabase.channel('users-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'users' },
        () => callback()
      ),
    supabase.channel('nurses-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'nurses' },
        () => callback()
      ),
    supabase.channel('schedules-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'schedules' },
        () => callback()
      )
  ];

  // Subscribe to all channels
  channels.forEach(channel => channel.subscribe());

  // Return cleanup function
  return () => {
    channels.forEach(channel => channel.unsubscribe());
  };
}