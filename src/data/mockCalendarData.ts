import { CalendarEvent, CalendarSettings } from '@/types/calendar';
import { addDays, addHours, startOfDay, format } from 'date-fns';

// Función para generar fechas relativas a hoy
const today = new Date();
const getDate = (daysOffset: number, hoursOffset = 0) => {
  const date = addDays(today, daysOffset);
  return addHours(date, hoursOffset).toISOString();
};

// Eventos de calendario de ejemplo
export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Servicio de Remolque - Carlos Rodriguez',
    start: getDate(0, 10), // Hoy a las 10:00
    end: getDate(0, 12),   // Hoy a las 12:00
    allDay: false,
    description: 'Remolque de vehículo por falla mecánica',
    location: 'Av. Las Condes 3000, Santiago',
    type: 'service',
    status: 'scheduled',
    assignedTo: ['2'], // ID del operador Juan
    relatedServiceId: '2',
    relatedClientId: '2',
    createdBy: '1', // Admin
    createdAt: getDate(-1), // Ayer
    updatedAt: getDate(-1)
  },
  {
    id: '2',
    title: 'Mantenimiento Grúa 01',
    start: getDate(1, 9),  // Mañana a las 9:00
    end: getDate(1, 13),   // Mañana a las 13:00
    allDay: false,
    description: 'Mantenimiento preventivo programado',
    location: 'Taller Central',
    type: 'maintenance',
    status: 'scheduled',
    assignedTo: ['3'], // ID del operador Pedro
    createdBy: '1', // Admin
    createdAt: getDate(-3), // Hace 3 días
    updatedAt: getDate(-3)
  },
  {
    id: '3',
    title: 'Reunión de Operadores',
    start: getDate(2, 15), // Pasado mañana a las 15:00
    end: getDate(2, 16),   // Pasado mañana a las 16:00
    allDay: false,
    description: 'Reunión mensual de coordinación',
    location: 'Sala de Reuniones',
    type: 'meeting',
    status: 'scheduled',
    assignedTo: ['2', '3'], // Juan y Pedro
    createdBy: '1', // Admin
    createdAt: getDate(-5), // Hace 5 días
    updatedAt: getDate(-5)
  },
  {
    id: '4',
    title: 'Servicio de Asistencia - María González',
    start: getDate(-1, 14), // Ayer a las 14:00
    end: getDate(-1, 15),   // Ayer a las 15:00
    allDay: false,
    description: 'Asistencia por batería descargada',
    location: 'Av. Providencia 1234, Santiago',
    type: 'service',
    status: 'completed',
    assignedTo: ['2'], // Juan
    relatedServiceId: '1',
    relatedClientId: '1',
    createdBy: '1', // Admin
    createdAt: getDate(-2), // Hace 2 días
    updatedAt: getDate(-1)  // Ayer
  },
  {
    id: '5',
    title: 'Capacitación Nuevos Equipos',
    start: getDate(5, 10), // En 5 días a las 10:00
    end: getDate(5, 17),   // En 5 días a las 17:00
    allDay: false,
    description: 'Capacitación sobre uso de nuevos equipos de remolque',
    location: 'Centro de Capacitación',
    type: 'other',
    status: 'scheduled',
    assignedTo: ['2', '3'], // Juan y Pedro
    createdBy: '1', // Admin
    createdAt: getDate(-10), // Hace 10 días
    updatedAt: getDate(-10)
  },
  {
    id: '6',
    title: 'Día Feriado - No Operativo',
    start: getDate(10),    // En 10 días
    end: getDate(10),      // En 10 días
    allDay: true,
    description: 'Feriado nacional',
    type: 'other',
    status: 'scheduled',
    createdBy: '1', // Admin
    createdAt: getDate(-30), // Hace 30 días
    updatedAt: getDate(-30)
  }
];

// Configuración del calendario
export const MOCK_CALENDAR_SETTINGS: CalendarSettings = {
  defaultView: 'dayGridMonth',
  weekStartsOn: 1, // Lunes
  workingHours: {
    start: "08:00:00",
    end: "18:00:00"
  },
  showWeekends: true,
  eventColors: {
    service: '#3b82f6', // blue-500
    maintenance: '#f59e0b', // amber-500
    meeting: '#8b5cf6', // violet-500
    other: '#6b7280'  // gray-500
  },
  statusColors: {
    scheduled: '#3b82f6', // blue-500
    in_progress: '#8b5cf6', // violet-500
    completed: '#10b981', // emerald-500
    cancelled: '#ef4444'  // red-500
  },
  enableNotifications: true,
  reminderTime: 30 // 30 minutos antes
};