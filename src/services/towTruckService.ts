import { supabase } from '@/lib/supabase';
import { TowTruck } from '@/types';

// Obtener todas las grúas
export const getTowTrucks = async (): Promise<TowTruck[]> => {
  const { data, error } = await supabase
    .from('tow_trucks')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching tow trucks:', error);
    throw error;
  }
  
  return data as TowTruck[];
};

// Obtener una grúa por ID
export const getTowTruckById = async (id: string): Promise<TowTruck | null> => {
  const { data, error } = await supabase
    .from('tow_trucks')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching tow truck:', error);
    throw error;
  }
  
  return data as TowTruck;
};

// Crear una nueva grúa
export const createTowTruck = async (towTruck: Omit<TowTruck, 'id' | 'created_at' | 'updated_at'>): Promise<TowTruck> => {
  const { data, error } = await supabase
    .from('tow_trucks')
    .insert([towTruck])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating tow truck:', error);
    throw error;
  }
  
  return data as TowTruck;
};

// Actualizar una grúa existente
export const updateTowTruck = async (id: string, towTruck: Partial<TowTruck>): Promise<TowTruck> => {
  const { data, error } = await supabase
    .from('tow_trucks')
    .update(towTruck)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating tow truck:', error);
    throw error;
  }
  
  return data as TowTruck;
};

// Eliminar una grúa
export const deleteTowTruck = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('tow_trucks')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting tow truck:', error);
    throw error;
  }
};

// Obtener grúas disponibles
export const getAvailableTowTrucks = async (): Promise<TowTruck[]> => {
  const { data, error } = await supabase
    .from('tow_trucks')
    .select('*')
    .eq('status', 'available')
    .order('name');
  
  if (error) {
    console.error('Error fetching available tow trucks:', error);
    throw error;
  }
  
  return data as TowTruck[];
};

// Actualizar el estado de una grúa
export const updateTowTruckStatus = async (id: string, status: TowTruck['status']): Promise<TowTruck> => {
  const { data, error } = await supabase
    .from('tow_trucks')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating tow truck status:', error);
    throw error;
  }
  
  return data as TowTruck;
};

// Asignar operador a una grúa
export const assignOperatorToTowTruck = async (towTruckId: string, operatorId: string | null): Promise<TowTruck> => {
  const { data, error } = await supabase
    .from('tow_trucks')
    .update({ current_operator_id: operatorId })
    .eq('id', towTruckId)
    .select()
    .single();
  
  if (error) {
    console.error('Error assigning operator to tow truck:', error);
    throw error;
  }
  
  return data as TowTruck;
};