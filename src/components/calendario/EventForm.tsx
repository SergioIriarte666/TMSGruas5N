import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarEvent } from '@/types/calendar';
import { MOCK_SERVICES } from '@/data/mockData';
import { 
  CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  Trash2, 
  Loader2,
  Tag
} from 'lucide-react';
import { format, addHours, parseISO, set } from 'date-fns';
import { es } from 'date-fns/locale';

const eventSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  start: z.string().min(1, 'La fecha de inicio es requerida'),
  startTime: z.string().optional(),
  end: z.string().min(1, 'La fecha de fin es requerida'),
  endTime: z.string().optional(),
  allDay: z.boolean().default(false),
  description: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(['service', 'maintenance', 'meeting', 'other']),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']),
  assignedTo: z.array(z.string()).optional(),
  relatedServiceId: z.string().optional(),
  relatedClientId: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  event?: CalendarEvent | null;
  selectedDate?: Date | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<CalendarEvent>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function EventForm({ 
  event, 
  selectedDate, 
  isOpen, 
  onClose, 
  onSubmit,
  onDelete
}: EventFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Preparar fechas por defecto
  const getDefaultDates = () => {
    let startDate = new Date();
    let endDate = addHours(startDate, 1);
    
    if (selectedDate) {
      startDate = selectedDate;
      endDate = addHours(selectedDate, 1);
    } else if (event) {
      startDate = new Date(event.start);
      endDate = new Date(event.end);
    }
    
    return {
      start: format(startDate, 'yyyy-MM-dd'),
      startTime: format(startDate, 'HH:mm'),
      end: format(endDate, 'yyyy-MM-dd'),
      endTime: format(endDate, 'HH:mm'),
    };
  };

  const defaultDates = getDefaultDates();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: event ? {
      title: event.title,
      start: format(new Date(event.start), 'yyyy-MM-dd'),
      startTime: event.allDay ? undefined : format(new Date(event.start), 'HH:mm'),
      end: format(new Date(event.end), 'yyyy-MM-dd'),
      endTime: event.allDay ? undefined : format(new Date(event.end), 'HH:mm'),
      allDay: event.allDay,
      description: event.description || '',
      location: event.location || '',
      type: event.type,
      status: event.status,
      assignedTo: event.assignedTo || [],
      relatedServiceId: event.relatedServiceId,
      relatedClientId: event.relatedClientId,
    } : {
      title: '',
      start: defaultDates.start,
      startTime: defaultDates.startTime,
      end: defaultDates.end,
      endTime: defaultDates.endTime,
      allDay: false,
      description: '',
      location: '',
      type: 'other',
      status: 'scheduled',
      assignedTo: [],
      relatedServiceId: '',
      relatedClientId: '',
    }
  });

  // Resetear el formulario cuando cambia el evento o la fecha seleccionada
  useEffect(() => {
    if (isOpen) {
      const defaultDates = getDefaultDates();
      
      reset(event ? {
        title: event.title,
        start: format(new Date(event.start), 'yyyy-MM-dd'),
        startTime: event.allDay ? undefined : format(new Date(event.start), 'HH:mm'),
        end: format(new Date(event.end), 'yyyy-MM-dd'),
        endTime: event.allDay ? undefined : format(new Date(event.end), 'HH:mm'),
        allDay: event.allDay,
        description: event.description || '',
        location: event.location || '',
        type: event.type,
        status: event.status,
        assignedTo: event.assignedTo || [],
        relatedServiceId: event.relatedServiceId,
        relatedClientId: event.relatedClientId,
      } : {
        title: '',
        start: defaultDates.start,
        startTime: defaultDates.startTime,
        end: defaultDates.end,
        endTime: defaultDates.endTime,
        allDay: false,
        description: '',
        location: '',
        type: 'other',
        status: 'scheduled',
        assignedTo: [],
        relatedServiceId: '',
        relatedClientId: '',
      });
    }
  }, [isOpen, event, selectedDate, reset]);

  const allDay = watch('allDay');
  const eventType = watch('type');

  const handleFormSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    try {
      // Convertir fechas a ISO string
      let startDate: Date;
      let endDate: Date;
      
      if (data.allDay) {
        // Para eventos de todo el día, usar solo la fecha
        startDate = parseISO(data.start);
        endDate = parseISO(data.end);
      } else {
        // Para eventos con hora, combinar fecha y hora
        const [startHour, startMinute] = (data.startTime || '00:00').split(':').map(Number);
        const [endHour, endMinute] = (data.endTime || '00:00').split(':').map(Number);
        
        startDate = set(parseISO(data.start), { hours: startHour, minutes: startMinute });
        endDate = set(parseISO(data.end), { hours: endHour, minutes: endMinute });
      }

      const eventData: Partial<CalendarEvent> = {
        title: data.title,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        allDay: data.allDay,
        description: data.description,
        location: data.location,
        type: data.type,
        status: data.status,
        assignedTo: data.assignedTo,
        relatedServiceId: data.relatedServiceId,
        relatedClientId: data.relatedClientId,
      };

      await onSubmit(eventData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    
    setIsDeleting(true);
    try {
      await onDelete?.(event.id);
    } catch (error) {
      console.error('Error deleting event:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Opciones para los selects
  const eventTypeOptions = [
    { value: 'service', label: 'Servicio' },
    { value: 'maintenance', label: 'Mantenimiento' },
    { value: 'meeting', label: 'Reunión' },
    { value: 'other', label: 'Otro' }
  ];

  const statusOptions = [
    { value: 'scheduled', label: 'Programado' },
    { value: 'in_progress', label: 'En Progreso' },
    { value: 'completed', label: 'Completado' },
    { value: 'cancelled', label: 'Cancelado' }
  ];

  const operatorOptions = [
    { value: '2', label: 'Juan Operador' },
    { value: '3', label: 'Pedro Conductor' },
    { value: '4', label: 'Carlos Chofer' }
  ];

  // Servicios disponibles para relacionar
  const availableServices = MOCK_SERVICES.filter(s => 
    s.status !== 'completed' && s.status !== 'cancelled'
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {event ? 'Editar Evento' : 'Nuevo Evento'}
          </DialogTitle>
          <DialogDescription>
            {event 
              ? 'Modifica los detalles del evento existente' 
              : 'Completa los detalles para crear un nuevo evento en el calendario'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Título del evento"
                {...register('title')}
                disabled={isSubmitting}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="allDay"
                checked={allDay}
                onCheckedChange={(checked) => setValue('allDay', checked)}
                disabled={isSubmitting}
              />
              <Label htmlFor="allDay">Todo el día</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha de Inicio *</Label>
                <div className="flex flex-col space-y-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        disabled={isSubmitting}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {watch('start') 
                          ? format(parseISO(watch('start')), 'PPP', { locale: es })
                          : <span>Seleccionar fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={watch('start') ? parseISO(watch('start')) : undefined}
                        onSelect={(date) => date && setValue('start', format(date, 'yyyy-MM-dd'))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {!allDay && (
                    <Input
                      type="time"
                      {...register('startTime')}
                      disabled={isSubmitting}
                    />
                  )}
                </div>
                {errors.start && (
                  <p className="text-sm text-destructive">{errors.start.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Fecha de Fin *</Label>
                <div className="flex flex-col space-y-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        disabled={isSubmitting}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {watch('end') 
                          ? format(parseISO(watch('end')), 'PPP', { locale: es })
                          : <span>Seleccionar fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={watch('end') ? parseISO(watch('end')) : undefined}
                        onSelect={(date) => date && setValue('end', format(date, 'yyyy-MM-dd'))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {!allDay && (
                    <Input
                      type="time"
                      {...register('endTime')}
                      disabled={isSubmitting}
                    />
                  )}
                </div>
                {errors.end && (
                  <p className="text-sm text-destructive">{errors.end.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Detalles del Evento */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Evento *</Label>
                <Select
                  value={watch('type')}
                  onValueChange={(value) => setValue('type', value as any)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Estado *</Label>
                <Select
                  value={watch('status')}
                  onValueChange={(value) => setValue('status', value as any)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="Ubicación del evento"
                  {...register('location')}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Descripción del evento"
                rows={3}
                {...register('description')}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Asignación y Relaciones */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Asignado a</Label>
              <Select
                value={watch('assignedTo')?.[0] || ''}
                onValueChange={(value) => setValue('assignedTo', value ? [value] : [])}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar operador" />
                </SelectTrigger>
                <SelectContent>
                  {operatorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {eventType === 'service' && (
              <div className="space-y-2">
                <Label>Servicio Relacionado</Label>
                <Select
                  value={watch('relatedServiceId') || ''}
                  onValueChange={(value) => setValue('relatedServiceId', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Ninguno</SelectItem>
                    {availableServices.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.service_number} - {service.description.substring(0, 30)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between">
            <div>
              {event && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isSubmitting || isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Eliminar
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting || isDeleting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || isDeleting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {event ? 'Actualizar' : 'Crear'} Evento
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}