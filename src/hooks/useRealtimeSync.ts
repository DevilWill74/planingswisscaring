import { useEffect } from 'react';
import { subscribeToChanges } from '../config/supabase';
import { useScheduleStore } from '../stores/scheduleStore';
import { useAuthStore } from '../stores/authStore';

export function useRealtimeSync() {
  const loadData = useScheduleStore(state => state.loadData);
  const refreshUsers = useAuthStore(state => state.refreshUsers);

  useEffect(() => {
    const unsubscribe = subscribeToChanges(() => {
      console.log('Changements détectés, actualisation des données...');
      loadData();
      refreshUsers();
    });

    return () => {
      unsubscribe();
    };
  }, [loadData, refreshUsers]);
}