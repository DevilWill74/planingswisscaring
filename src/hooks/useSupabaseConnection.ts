import { useState, useEffect } from 'react';
import { checkSupabaseConnection } from '../config/supabase';

export function useSupabaseConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsChecking(true);
        const connected = await checkSupabaseConnection();
        setIsConnected(connected);
        if (!connected) {
          setError('Impossible de se connecter à la base de données');
        }
      } catch (err) {
        setError('Erreur lors de la vérification de la connexion');
        setIsConnected(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkConnection();
  }, []);

  return { isConnected, isChecking, error };
}