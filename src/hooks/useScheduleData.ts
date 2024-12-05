import { useState, useEffect } from 'react';
import { MonthlySchedule, Nurse, DaySchedule } from '../types/schedule';
import { supabase } from '../config/supabase';

export function useScheduleData() {
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [schedule, setSchedule] = useState<MonthlySchedule>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const [nursesResponse, scheduleResponse] = await Promise.all([
          supabase.from('nurses').select('*').order('name'),
          supabase.from('schedules').select('*')
        ]);

        if (nursesResponse.error) throw nursesResponse.error;
        if (scheduleResponse.error) throw scheduleResponse.error;

        if (mounted) {
          setNurses(nursesResponse.data || []);
          
          const scheduleData: MonthlySchedule = {};
          scheduleResponse.data?.forEach(item => {
            scheduleData[item.key] = item.schedule;
          });
          setSchedule(scheduleData);
          
          setError(null);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        if (mounted) {
          setError('Une erreur est survenue lors du chargement des données');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const updateSchedule = async (
    nurseId: string,
    year: number,
    month: number,
    newSchedule: DaySchedule[]
  ) => {
    try {
      setError(null);
      const key = `${year}-${month}-${nurseId}`;
      
      const { error } = await supabase
        .from('schedules')
        .upsert({ 
          key, 
          schedule: newSchedule,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      setSchedule(prev => ({
        ...prev,
        [key]: newSchedule
      }));
      
    } catch (err) {
      console.error('Error updating schedule:', err);
      setError('Une erreur est survenue lors de la mise à jour du planning');
      throw err;
    }
  };

  const addNurse = async (nurse: Nurse) => {
    try {
      setError(null);
      const { error } = await supabase
        .from('nurses')
        .insert([{
          ...nurse,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
      
      setNurses(prev => [...prev, nurse]);
    } catch (err) {
      console.error('Error adding nurse:', err);
      setError('Une erreur est survenue lors de l\'ajout de l\'infirmier(ère)');
      throw err;
    }
  };

  const deleteNurse = async (nurseId: string) => {
    try {
      setError(null);
      const { error } = await supabase
        .from('nurses')
        .delete()
        .eq('id', nurseId);

      if (error) throw error;
      
      setNurses(prev => prev.filter(nurse => nurse.id !== nurseId));
      setSchedule(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          if (key.includes(nurseId)) {
            delete updated[key];
          }
        });
        return updated;
      });
      
    } catch (err) {
      console.error('Error deleting nurse:', err);
      setError('Une erreur est survenue lors de la suppression de l\'infirmier(ère)');
      throw err;
    }
  };

  return {
    nurses,
    schedule,
    loading,
    error,
    updateSchedule,
    addNurse,
    deleteNurse,
  };
}