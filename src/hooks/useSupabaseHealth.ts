import { useState, useEffect } from 'react';
import { checkDatabaseHealth } from '../utils/supabaseHelpers';

export function useSupabaseHealth(checkInterval = 30000) {
  const [status, setStatus] = useState({
    isHealthy: false,
    isChecking: true,
    error: null as string | null
  });

  useEffect(() => {
    let mounted = true;
    let intervalId: number;

    const checkHealth = async () => {
      if (!mounted) return;
      
      setStatus(prev => ({ ...prev, isChecking: true }));
      
      try {
        const health = await checkDatabaseHealth();
        if (mounted) {
          setStatus({
            isHealthy: health.isHealthy,
            isChecking: false,
            error: health.error || null
          });
        }
      } catch (error) {
        if (mounted) {
          setStatus({
            isHealthy: false,
            isChecking: false,
            error: 'Erreur lors de la vérification de la connexion'
          });
        }
      }
    };

    checkHealth();
    intervalId = window.setInterval(checkHealth, checkInterval);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [checkInterval]);

  return status;
}