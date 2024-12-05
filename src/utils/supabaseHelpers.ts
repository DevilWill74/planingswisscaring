import { supabase } from '../config/supabase';
import { SUPABASE_CONFIG } from '../config/supabaseConfig';

export class SupabaseConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupabaseConnectionError';
  }
}

export async function waitForConnection(
  retries = SUPABASE_CONFIG.maxRetries,
  delay = SUPABASE_CONFIG.retryDelay
): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      const start = Date.now();
      const { data, error } = await Promise.race([
        supabase.from('users').select('count').limit(1),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), SUPABASE_CONFIG.connectionTimeout)
        )
      ]);

      if (error) throw error;
      if (data) return true;

      const elapsed = Date.now() - start;
      if (elapsed < delay) {
        await new Promise(resolve => setTimeout(resolve, delay - elapsed));
      }
    } catch (error) {
      console.warn(`Tentative de connexion ${i + 1}/${retries} échouée:`, error);
      if (i === retries - 1) return false;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return false;
}

export async function initializeDatabase() {
  const connected = await waitForConnection();
  if (!connected) {
    throw new SupabaseConnectionError('Impossible de se connecter à la base de données');
  }

  try {
    // Vérifier si les tables existent
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .in('table_name', ['users', 'nurses', 'schedules']);

    if (tablesError) throw tablesError;

    const existingTables = new Set(tables?.map(t => t.table_name));

    // Créer les tables manquantes
    if (!existingTables.has('users')) {
      await supabase.rpc('create_users_table');
    }
    if (!existingTables.has('nurses')) {
      await supabase.rpc('create_nurses_table');
    }
    if (!existingTables.has('schedules')) {
      await supabase.rpc('create_schedules_table');
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    throw new SupabaseConnectionError('Erreur lors de l\'initialisation de la base de données');
  }
}

export async function checkDatabaseHealth(): Promise<{
  isHealthy: boolean;
  error?: string;
}> {
  try {
    const connected = await waitForConnection(1, 0); // Test rapide
    if (!connected) {
      return { 
        isHealthy: false, 
        error: 'La connexion à la base de données est impossible' 
      };
    }

    const { error: healthCheck } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (healthCheck) {
      return { 
        isHealthy: false, 
        error: 'La base de données ne répond pas correctement' 
      };
    }

    return { isHealthy: true };
  } catch (error) {
    return { 
      isHealthy: false, 
      error: 'Erreur lors de la vérification de la base de données' 
    };
  }
}