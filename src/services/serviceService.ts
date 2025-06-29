import { supabase } from '@/lib/supabase';
import { Service } from '@/types';

// Obtener todos los servicios
export const getServices = async (): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
  
  return data as Service[];
};

// Obtener un servicio por ID
export const getServiceById = async (id: string): Promise<Service | null> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching service:', error);
    throw error;
  }
  
  return data as Service;
};

// Crear un nuevo servicio
export const createService = async (service: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service> => {
  // Generar número de servicio si no se proporciona
  if (!service.service_number) {
    const { count } = await supabase
      .from('services')
      .select('*', { count: 'exact', head: true });
    
    const nextNumber = (count || 0) + 1;
    service.service_number = `SRV-${new Date().getFullYear()}-${String(nextNumber).padStart(4, '0')}`;
  }
  
  const { data, error } = await supabase
    .from('services')
    .insert([service])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating service:', error);
    throw error;
  }
  
  return data as Service;
};

// Actualizar un servicio existente
export const updateService = async (id: string, service: Partial<Service>): Promise<Service> => {
  const { data, error } = await supabase
    .from('services')
    .update(service)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating service:', error);
    throw error;
  }
  
  return data as Service;
};

// Eliminar un servicio
export const deleteService = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
};

// Buscar servicios por término
export const searchServices = async (term: string): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .or(`service_number.ilike.%${term}%,description.ilike.%${term}%,folio.ilike.%${term}%`)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error searching services:', error);
    throw error;
  }
  
  return data as Service[];
};

// Obtener servicios por cliente
export const getServicesByClient = async (clientId: string): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching client services:', error);
    throw error;
  }
  
  return data as Service[];
};

// Obtener servicios por operador
export const getServicesByOperator = async (operatorId: string): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('operator_id', operatorId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching operator services:', error);
    throw error;
  }
  
  return data as Service[];
};

// Obtener servicios por estado
export const getServicesByStatus = async (status: Service['status']): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching services by status:', error);
    throw error;
  }
  
  return data as Service[];
};

// Actualizar el estado de un servicio
export const updateServiceStatus = async (id: string, status: Service['status']): Promise<Service> => {
  const updates: Partial<Service> = { status };
  
  // Si el estado es 'in_progress', agregar la hora de inicio
  if (status === 'in_progress') {
    updates.started_time = new Date().toTimeString().slice(0, 5);
  }
  
  // Si el estado es 'completed', agregar la hora de finalización
  if (status === 'completed') {
    updates.completed_time = new Date().toTimeString().slice(0, 5);
  }
  
  const { data, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating service status:', error);
    throw error;
  }
  
  return data as Service;
};