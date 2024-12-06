import { create } from 'zustand';
import { supabase } from '../config/supabase';
import { User } from '../types/auth';
import { v4 as uuidv4 } from 'uuid';

interface AuthState {
  user: User | null;
  users: User[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  initialize: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (userData: Omit<User, 'id'>) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  users: [],
  loading: false,
  error: null,
  initialized: false,

  initialize: async () => {
    try {
      set({ loading: true, error: null });
      
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .order('username');

      if (error) throw error;
      set({ users: users || [], initialized: true });
    } catch (error: any) {
      console.error('Erreur d\'initialisation:', error);
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  login: async (username: string, password: string) => {
    try {
      set({ loading: true, error: null });
      
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username.toLowerCase())
        .eq('password', password)
        .single();

      if (error || !user) {
        set({ error: 'Identifiants incorrects' });
        return false;
      }

      set({ user });
      return true;
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      set({ error: error.message });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    set({ user: null });
  },

  addUser: async (userData) => {
    try {
      set({ loading: true, error: null });

      const newUser = {
        id: uuidv4(), // Génère un UUID valide
        username: userData.username.toLowerCase(),
        password: userData.password,
        role: userData.role
      };

      const { error } = await supabase
        .from('users')
        .insert([newUser]);

      if (error) throw error;
      await get().refreshUsers();
    } catch (error: any) {
      console.error('Erreur d\'ajout d\'utilisateur:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  refreshUsers: async () => {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .order('username');

      if (error) throw error;
      set({ users: users || [] });
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des utilisateurs:', error);
    }
  }
}));