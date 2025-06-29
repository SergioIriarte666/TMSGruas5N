export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  description?: string;
  location?: string;
  type: 'service' | 'maintenance' | 'meeting' | 'other';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string[];
  relatedServiceId?: string;
  relatedClientId?: string;
  color?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarSettings {
  defaultView: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.
  workingHours: {
    start: string; // e.g. "08:00:00"
    end: string; // e.g. "18:00:00"
  };
  showWeekends: boolean;
  eventColors: {
    service: string;
    maintenance: string;
    meeting: string;
    other: string;
  };
  statusColors: {
    scheduled: string;
    in_progress: string;
    completed: string;
    cancelled: string;
  };
  enableNotifications: boolean;
  reminderTime: number; // minutes before event
}