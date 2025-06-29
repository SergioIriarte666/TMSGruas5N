import { v4 as uuidv4 } from 'uuid';
import { CalendarEvent, CalendarSettings } from '@/types/calendar';
import { MOCK_CALENDAR_EVENTS, MOCK_CALENDAR_SETTINGS } from '@/data/mockCalendarData';

// Copia local de los datos para simular una base de datos
let calendarEvents = [...MOCK_CALENDAR_EVENTS];
let calendarSettings = { ...MOCK_CALENDAR_SETTINGS };

// Obtener todos los eventos del calendario
export const getCalendarEvents = async (): Promise<CalendarEvent[]> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...calendarEvents];
};

// Obtener un evento por ID
export const getCalendarEventById = async (id: string): Promise<CalendarEvent | null> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 200));
  const event = calendarEvents.find(e => e.id === id);
  return event || null;
};

// Crear un nuevo evento
export const createCalendarEvent = async (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newEvent: CalendarEvent = {
    id: uuidv4(),
    ...event,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  calendarEvents.push(newEvent);
  return newEvent;
};

// Actualizar un evento existente
export const updateCalendarEvent = async (id: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = calendarEvents.findIndex(e => e.id === id);
  if (index === -1) {
    throw new Error(`Evento con ID ${id} no encontrado`);
  }
  
  const updatedEvent = {
    ...calendarEvents[index],
    ...event,
    updatedAt: new Date().toISOString()
  };
  
  calendarEvents[index] = updatedEvent;
  return updatedEvent;
};

// Eliminar un evento
export const deleteCalendarEvent = async (id: string): Promise<void> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = calendarEvents.findIndex(e => e.id === id);
  if (index === -1) {
    throw new Error(`Evento con ID ${id} no encontrado`);
  }
  
  calendarEvents.splice(index, 1);
};

// Obtener eventos por rango de fechas
export const getCalendarEventsByDateRange = async (start: string, end: string): Promise<CalendarEvent[]> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  return calendarEvents.filter(event => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    
    return eventStart >= startDate && eventEnd <= endDate;
  });
};

// Obtener eventos por tipo
export const getCalendarEventsByType = async (type: CalendarEvent['type']): Promise<CalendarEvent[]> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return calendarEvents.filter(event => event.type === type);
};

// Obtener eventos por estado
export const getCalendarEventsByStatus = async (status: CalendarEvent['status']): Promise<CalendarEvent[]> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return calendarEvents.filter(event => event.status === status);
};

// Obtener eventos asignados a un operador
export const getCalendarEventsByOperator = async (operatorId: string): Promise<CalendarEvent[]> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return calendarEvents.filter(event => 
    event.assignedTo && event.assignedTo.includes(operatorId)
  );
};

// Guardar configuración del calendario
export const saveCalendarSettings = async (settings: CalendarSettings): Promise<void> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  
  calendarSettings = { ...settings };
  
  // En un caso real, esto se guardaría en una base de datos
  // Por ahora, lo guardamos en localStorage
  localStorage.setItem('calendarSettings', JSON.stringify(settings));
};

// Obtener configuración del calendario
export const getCalendarSettings = async (): Promise<CalendarSettings | null> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // En un caso real, esto se obtendría de una base de datos
  // Por ahora, lo obtenemos de localStorage o usamos la configuración por defecto
  const savedSettings = localStorage.getItem('calendarSettings');
  return savedSettings ? JSON.parse(savedSettings) : calendarSettings;
};