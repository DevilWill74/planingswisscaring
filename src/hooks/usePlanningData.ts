import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, PlanningDay } from '../types';

export function usePlanningData(currentDate: Date) {
  const [nurses, setNurses] = useState<User[]>([]);
  const [planning, setPlanning] = useState<PlanningDay[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchNurses = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'nurse')
      .order('username');
    setNurses(data || []);
  };

  const fetchPlanning = async () => {
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const { data } = await supabase
      .from('planning')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0]);
    
    setPlanning(data || []);
  };

  useEffect(() => {
    fetchNurses();
  }, []);

  useEffect(() => {
    fetchPlanning();
  }, [currentDate, isUpdating]);

  return {
    nurses,
    planning,
    isUpdating,
    setIsUpdating,
    fetchPlanning
  };
}