import { supabase } from '@/lib/supabase';
import { CalendarEvent, CalendarSettings } from '@/types/calendar';

// Obtener todos los eventos del calendario
export const getCalendarEvents = async (): Promise<CalendarEvent[]> => {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .order('start');
  
  if (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
  
  return data as unknown as CalendarEvent[];
};

// Obtener un evento por ID
export const getCalendarEventById = async (id: string): Promise<CalendarEvent | null> => {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching calendar event:', error);
    throw error;
  }
  
  return data as unknown as CalendarEvent;
};

// Crear un nuevo evento
export const createCalendarEvent = async (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> => {
  // Obtener el ID del usuario actual
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Usuario no autenticado');
  }
  
  const { data, error } = await supabase
    .from('calendar_events')
    .insert([{
      ...event,
      created_by: user.id
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
  
  return data as unknown as CalendarEvent;
};

// Actualizar un evento existente
export const updateCalendarEvent = async (id: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> => {
  const { data, error } = await supabase
    .from('calendar_events')
    .update(event)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating calendar event:', error);
    throw error;
  }
  
  return data as unknown as CalendarEvent;
};

// Eliminar un evento
export const deleteCalendarEvent = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting calendar event:', error);
    throw error;
  }
};

// Obtener eventos por rango de fechas
export const getCalendarEventsByDateRange = async (start: string, end: string): Promise<CalendarEvent[]> => {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .gte('start', start)
    .lte('end', end)
    .order('start');
  
  if (error) {
    console.error('Error fetching calendar events by date range:', error);
    throw error;
  }
  
  return data as unknown as CalendarEvent[];
};

// Obtener eventos por tipo
export const getCalendarEventsByType = async (type: CalendarEvent['type']): Promise<CalendarEvent[]> => {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('type', type)
    .order('start');
  
  if (error) {
    console.error('Error fetching calendar events by type:', error);
    throw error;
  }
  
  return data as unknown as CalendarEvent[];
};

// Obtener eventos por estado
export const getCalendarEventsByStatus = async (status: CalendarEvent['status']): Promise<CalendarEvent[]> => {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('status', status)
    .order('start');
  
  if (error) {
    console.error('Error fetching calendar events by status:', error);
    throw error;
  }
  
  return data as unknown as CalendarEvent[];
};

// Obtener eventos asignados a un operador
export const getCalendarEventsByOperator = async (operatorId: string): Promise<CalendarEvent[]> => {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .contains('assigned_to', [operatorId])
    .order('start');
  
  if (error) {
    console.error('Error fetching calendar events by operator:', error);
    throw error;
  }
  
  return data as unknown as CalendarEvent[];
};

// Guardar configuración del calendario
export const saveCalendarSettings = async (settings: CalendarSettings): Promise<void> => {
  // En una implementación real, esto se guardaría en una tabla de configuración
  // Por ahora, lo guardamos en localStorage
  localStorage.setItem('calendarSettings', JSON.stringify(settings));
};

// Obtener configuración del calendario
export const getCalendarSettings = async (): Promise<CalendarSettings | null> => {
  // En una implementación real, esto se obtendría de una tabla de configuración
  // Por ahora, lo obtenemos de localStorage
  const settings = localStorage.getItem('calendarSettings');
  return settings ? JSON.parse(settings) : null;
};