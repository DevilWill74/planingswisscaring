import { supabase } from '../config/supabase';
import { ADMIN_USER } from '../config/supabaseConfig';

export async function initializeDatabase() {
  try {
    // Création des tables si elles n'existent pas
    await supabase.rpc('init_database', {});

    // Vérification de l'existence de l'utilisateur admin
    const { data: adminUser } = await supabase
      .from('users')
      .select('*')
      .eq('username', ADMIN_USER.username)
      .single();

    if (!adminUser) {
      // Création de l'utilisateur admin s'il n'existe pas
      const { error: adminError } = await supabase
        .from('users')
        .insert([{
          id: ADMIN_USER.id,
          username: ADMIN_USER.username,
          password: ADMIN_USER.password,
          role: ADMIN_USER.role,
          created_at: new Date().toISOString()
        }]);

      if (adminError) {
        throw new Error(`Erreur lors de la création de l'admin: ${adminError.message}`);
      }
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  }
}