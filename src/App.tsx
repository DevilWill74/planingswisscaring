import React, { useEffect } from 'react';
import { NurseScheduler } from './components/NurseScheduler';
import { Login } from './components/Login';
import { useAuthStore } from './stores/authStore';
import { useRealtimeSync } from './hooks/useRealtimeSync';
import { initializeSupabase } from './config/supabaseInit';

function App() {
  const { user, initialize } = useAuthStore();
  
  // Initialisation de la base de données et synchronisation en temps réel
  useEffect(() => {
    const init = async () => {
      try {
        await initializeSupabase();
        await initialize();
      } catch (error) {
        console.error('Erreur d\'initialisation:', error);
      }
    };
    init();
  }, [initialize]);

  // Activer la synchronisation en temps réel
  useRealtimeSync();

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NurseScheduler 
        isAdmin={user.role === 'admin'}
        currentUser={user}
      />
    </div>
  );
}

export default App;