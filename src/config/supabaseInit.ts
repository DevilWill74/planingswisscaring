import { supabase } from './supabase';

export async function initializeSupabase() {
  try {
    console.log('Initialisation de la base de données...');

    // Vérifier si l'admin existe
    const { data: adminExists, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('username', 'admin')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    // Créer l'admin si nécessaire
    if (!adminExists) {
      const { error: createError } = await supabase
        .from('users')
        .insert([{
          id: 'admin',
          username: 'admin',
          password: 'admin123',
          role: 'admin'
        }]);

      if (createError) {
        throw createError;
      }

      console.log('Utilisateur admin créé avec succès');
    }

    return true;
  } catch (error) {
    console.error('Erreur d\'initialisation:', error);
    throw error;
  }
}