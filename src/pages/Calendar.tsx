import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarEvent, CalendarSettings } from '@/types/calendar';
import { MOCK_CALENDAR_EVENTS, MOCK_CALENDAR_SETTINGS } from '@/data/mockCalendarData';
import { EventForm } from '@/components/calendario/EventForm';
import { EventDetails } from '@/components/calendario/EventDetails';
import { CalendarFilters } from '@/components/calendario/CalendarFilters';
import { CalendarSettingsForm } from '@/components/calendario/CalendarSettingsForm';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Settings, 
  List, 
  Grid, 
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO, isToday, isPast, isFuture } from 'date-fns';
import { es } from 'date-fns/locale';

// Importaciones de FullCalendar
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_CALENDAR_EVENTS);
  const [calendarSettings, setCalendarSettings] = useState<CalendarSettings>(MOCK_CALENDAR_SETTINGS);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeView, setActiveView] = useState<'calendar' | 'list'>('calendar');
  const [calendarView, setCalendarView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>(
    calendarSettings.defaultView
  );
  
  // Filtros
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<{start?: Date, end?: Date}>({});
  
  const calendarRef = useRef<any>(null);

  // Aplicar filtros a los eventos
  const filteredEvents = events.filter(event => {
    const matchesType = typeFilter === 'all' || event.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesAssignee = assigneeFilter === 'all' || 
      (event.assignedTo && event.assignedTo.includes(assigneeFilter));
    
    // Filtro de fecha
    let matchesDateRange = true;
    if (dateRangeFilter.start) {
      const eventStart = new Date(event.start);
      matchesDateRange = matchesDateRange && eventStart >= dateRangeFilter.start;
    }
    if (dateRangeFilter.end) {
      const eventEnd = new Date(event.end);
      matchesDateRange = matchesDateRange && eventEnd <= dateRangeFilter.end;
    }
    
    return matchesType && matchesStatus && matchesAssignee && matchesDateRange;
  });

  // Preparar eventos para FullCalendar
  const calendarEvents = filteredEvents.map(event => ({
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    allDay: event.allDay,
    backgroundColor: getEventColor(event),
    borderColor: getEventColor(event),
    textColor: '#ffffff',
    extendedProps: {
      description: event.description,
      location: event.location,
      type: event.type,
      status: event.status
    }
  }));

  // Obtener color del evento basado en tipo y estado
  function getEventColor(event: CalendarEvent): string {
    // Si está cancelado, usar el color de cancelado
    if (event.status === 'cancelled') {
      return calendarSettings.statusColors.cancelled;
    }
    
    // Si está completado, usar el color de completado
    if (event.status === 'completed') {
      return calendarSettings.statusColors.completed;
    }
    
    // Si está en progreso, usar el color de en progreso
    if (event.status === 'in_progress') {
      return calendarSettings.statusColors.in_progress;
    }
    
    // Por defecto, usar el color del tipo de evento
    return calendarSettings.eventColors[event.type];
  }

  // Crear un nuevo evento
  const handleCreateEvent = async (data: Partial<CalendarEvent>) => {
    const newEvent: CalendarEvent = {
      id: (events.length + 1).toString(),
      title: data.title || 'Nuevo Evento',
      start: data.start || new Date().toISOString(),
      end: data.end || new Date().toISOString(),
      allDay: data.allDay || false,
      description: data.description,
      location: data.location,
      type: data.type || 'other',
      status: data.status || 'scheduled',
      assignedTo: data.assignedTo,
      relatedServiceId: data.relatedServiceId,
      relatedClientId: data.relatedClientId,
      createdBy: '1', // ID del usuario actual (admin)
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setEvents([...events, newEvent]);
    toast.success('Evento creado exitosamente');
    setIsEventFormOpen(false);
    setSelectedDate(null);
  };

  // Actualizar un evento existente
  const handleUpdateEvent = async (data: Partial<CalendarEvent>) => {
    if (!selectedEvent) return;

    const updatedEvents = events.map(event => 
      event.id === selectedEvent.id
        ? { 
            ...event, 
            ...data,
            updatedAt: new Date().toISOString() 
          }
        : event
    );

    setEvents(updatedEvents);
    toast.success('Evento actualizado exitosamente');
    setIsEventFormOpen(false);
    setSelectedEvent(null);
  };

  // Eliminar un evento
  const handleDeleteEvent = async (id: string) => {
    setEvents(events.filter(event => event.id !== id));
    toast.success('Evento eliminado exitosamente');
    setIsEventDetailsOpen(false);
    setSelectedEvent(null);
  };

  // Guardar configuración del calendario
  const handleSaveSettings = async (data: CalendarSettings) => {
    setCalendarSettings(data);
    toast.success('Configuración guardada exitosamente');
    setIsSettingsOpen(false);
    
    // Actualizar la vista del calendario si es necesario
    if (data.defaultView !== calendarView) {
      setCalendarView(data.defaultView);
    }
  };

  // Manejar clic en evento
  const handleEventClick = (info: any) => {
    const eventId = info.event.id;
    const event = events.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
      setIsEventDetailsOpen(true);
    }
  };

  // Manejar clic en fecha
  const handleDateClick = (info: any) => {
    const clickedDate = info.date;
    setSelectedDate(clickedDate);
    setIsEventFormOpen(true);
  };

  // Manejar cambio de vista
  const handleViewChange = (view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay') => {
    setCalendarView(view);
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(view);
    }
  };

  // Manejar navegación del calendario
  const handlePrev = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.prev();
    }
  };

  const handleNext = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.next();
    }
  };

  const handleToday = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.today();
    }
  };

  // Obtener el título del calendario según la vista actual
  const getCalendarTitle = () => {
    if (!calendarRef.current) return '';
    
    const calendarApi = calendarRef.current.getApi();
    const view = calendarApi.view;
    const start = view.currentStart;
    
    if (view.type === 'dayGridMonth') {
      return format(start, 'MMMM yyyy', { locale: es });
    } else if (view.type === 'timeGridWeek') {
      const end = view.currentEnd;
      const endDate = new Date(end);
      endDate.setDate(endDate.getDate() - 1);
      return `${format(start, 'dd', { locale: es })} - ${format(endDate, 'dd MMMM yyyy', { locale: es })}`;
    } else {
      return format(start, 'EEEE dd MMMM yyyy', { locale: es });
    }
  };

  // Agrupar eventos por fecha para la vista de lista
  const groupedEvents = filteredEvents.reduce((acc, event) => {
    const dateKey = format(new Date(event.start), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  // Ordenar fechas para la vista de lista (más recientes primero)
  const sortedDates = Object.keys(groupedEvents).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendario</h1>
          <p className="text-muted-foreground">
            Gestión de eventos, servicios programados y agenda
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsSettingsOpen(true)}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            Configuración
          </Button>
          <Button onClick={() => {
            setSelectedEvent(null);
            setIsEventFormOpen(true);
          }} className="gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Evento
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <CalendarFilters 
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        assigneeFilter={assigneeFilter}
        onAssigneeChange={setAssigneeFilter}
        dateRangeFilter={dateRangeFilter}
        onDateRangeChange={setDateRangeFilter}
      />

      {/* Vistas del Calendario */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handlePrev}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleNext}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleToday}
                className="ml-2"
              >
                Hoy
              </Button>
              <h2 className="text-xl font-semibold ml-2">
                {calendarRef.current ? getCalendarTitle() : ''}
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              <Tabs 
                value={activeView} 
                onValueChange={(v) => setActiveView(v as 'calendar' | 'list')}
                className="w-auto"
              >
                <TabsList>
                  <TabsTrigger value="calendar" className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Calendario</span>
                  </TabsTrigger>
                  <TabsTrigger value="list" className="flex items-center gap-2">
                    <List className="w-4 h-4" />
                    <span className="hidden sm:inline">Lista</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              {activeView === 'calendar' && (
                <div className="flex border rounded-md overflow-hidden">
                  <Button 
                    variant={calendarView === 'dayGridMonth' ? 'default' : 'ghost'} 
                    size="sm" 
                    onClick={() => handleViewChange('dayGridMonth')}
                    className="rounded-none"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant={calendarView === 'timeGridWeek' ? 'default' : 'ghost'} 
                    size="sm" 
                    onClick={() => handleViewChange('timeGridWeek')}
                    className="rounded-none"
                  >
                    <CalendarIcon className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant={calendarView === 'timeGridDay' ? 'default' : 'ghost'} 
                    size="sm" 
                    onClick={() => handleViewChange('timeGridDay')}
                    className="rounded-none"
                  >
                    <Clock className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeView} className="w-full">
            <TabsContent value="calendar" className="mt-0">
              <div className="h-[700px]">
                <FullCalendar
                  ref={calendarRef}
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView={calendarView}
                  headerToolbar={false} // Usamos nuestro propio header
                  events={calendarEvents}
                  eventClick={handleEventClick}
                  dateClick={handleDateClick}
                  editable={true}
                  selectable={true}
                  selectMirror={true}
                  dayMaxEvents={true}
                  weekends={calendarSettings.showWeekends}
                  firstDay={calendarSettings.weekStartsOn}
                  slotMinTime={calendarSettings.workingHours.start}
                  slotMaxTime={calendarSettings.workingHours.end}
                  locale="es"
                  height="100%"
                  eventTimeFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    meridiem: false,
                    hour12: false
                  }}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="list" className="mt-0">
              <div className="space-y-6">
                {sortedDates.map(dateKey => {
                  const eventsForDate = groupedEvents[dateKey];
                  const date = parseISO(dateKey);
                  const isDateToday = isToday(date);
                  const isDatePast = isPast(date) && !isDateToday;
                  const isDateFuture = isFuture(date);
                  
                  return (
                    <div key={dateKey} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          {format(date, 'EEEE dd MMMM yyyy', { locale: es })}
                        </h3>
                        {isDateToday && (
                          <Badge variant="default" className="bg-blue-500">Hoy</Badge>
                        )}
                        {isDatePast && (
                          <Badge variant="outline" className="text-muted-foreground">Pasado</Badge>
                        )}
                        {isDateFuture && (
                          <Badge variant="outline" className="text-green-600">Próximo</Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        {eventsForDate.map(event => (
                          <Card 
                            key={event.id} 
                            className="hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => {
                              setSelectedEvent(event);
                              setIsEventDetailsOpen(true);
                            }}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                <div 
                                  className="w-1 self-stretch rounded-full" 
                                  style={{ backgroundColor: getEventColor(event) }}
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium">{event.title}</h4>
                                    <Badge variant="outline">
                                      {event.type === 'service' ? 'Servicio' : 
                                       event.type === 'maintenance' ? 'Mantenimiento' : 
                                       event.type === 'meeting' ? 'Reunión' : 'Otro'}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    <span>
                                      {event.allDay 
                                        ? 'Todo el día' 
                                        : `${format(new Date(event.start), 'HH:mm')} - ${format(new Date(event.end), 'HH:mm')}`}
                                    </span>
                                  </div>
                                  {event.location && (
                                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                      <MapPin className="w-3 h-3" />
                                      <span>{event.location}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
                
                {sortedDates.length === 0 && (
                  <div className="text-center py-12">
                    <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      No hay eventos para mostrar
                    </h3>
                    <p className="text-muted-foreground">
                      Ajusta los filtros o crea un nuevo evento
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Formulario de Evento */}
      <EventForm
        event={selectedEvent}
        selectedDate={selectedDate}
        isOpen={isEventFormOpen}
        onClose={() => {
          setIsEventFormOpen(false);
          setSelectedEvent(null);
          setSelectedDate(null);
        }}
        onSubmit={selectedEvent ? handleUpdateEvent : handleCreateEvent}
        onDelete={selectedEvent ? handleDeleteEvent : undefined}
      />

      {/* Detalles de Evento */}
      {selectedEvent && (
        <EventDetails
          event={selectedEvent}
          isOpen={isEventDetailsOpen}
          onClose={() => {
            setIsEventDetailsOpen(false);
            setSelectedEvent(null);
          }}
          onEdit={() => {
            setIsEventDetailsOpen(false);
            setIsEventFormOpen(true);
          }}
          onDelete={handleDeleteEvent}
        />
      )}

      {/* Configuración del Calendario */}
      <CalendarSettingsForm
        settings={calendarSettings}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSubmit={handleSaveSettings}
      />
    </div>
  );
}