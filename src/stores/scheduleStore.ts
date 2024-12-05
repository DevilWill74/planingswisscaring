import { create } from 'zustand';
import { supabase } from '../config/supabase';
import { MonthlySchedule, Nurse, DaySchedule } from '../types/schedule';

interface ScheduleState {
  nurses: Nurse[];
  schedule: MonthlySchedule;
  loading: boolean;
  error: string | null;
  loadData: () => Promise<void>;
  addNurse: (nurse: Nurse) => Promise<void>;
  deleteNurse: (nurseId: string) => Promise<void>;
  updateSchedule: (nurseId: string, year: number, month: number, newSchedule: DaySchedule[]) => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  nurses: [],
  schedule: {},
  loading: false,
  error: null,

  loadData: async () => {
    try {
      set({ loading: true, error: null });

      const [nursesResponse, scheduleResponse] = await Promise.all([
        supabase.from('users').select('*').eq('role', 'nurse'),
        supabase.from('schedules').select('*')
      ]);

      if (nursesResponse.error) throw nursesResponse.error;
      if (scheduleResponse.error) throw scheduleResponse.error;

      const scheduleData: MonthlySchedule = {};
      scheduleResponse.data?.forEach(item => {
        scheduleData[item.key] = item.schedule;
      });

      set({ 
        nurses: nursesResponse.data?.map(user => ({ id: user.id, name: user.username })) || [],
        schedule: scheduleData,
        error: null 
      });
    } catch (error: any) {
      console.error('Erreur lors du chargement des données:', error);
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  addNurse: async (nurse: Nurse) => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase
        .from('users')
        .insert([{
          id: nurse.id,
          username: nurse.name,
          password: 'changeme',
          role: 'nurse'
        }]);

      if (error) throw error;

      await get().loadData();
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout de l\'infirmier:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteNurse: async (nurseId: string) => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', nurseId);

      if (error) throw error;

      await get().loadData();
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateSchedule: async (nurseId: string, year: number, month: number, newSchedule: DaySchedule[]) => {
    try {
      set({ loading: true, error: null });

      const key = `${year}-${month}-${nurseId}`;
      const { error } = await supabase
        .from('schedules')
        .upsert({
          key,
          user_id: nurseId,
          schedule: newSchedule,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      await get().loadData();
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  }
}));