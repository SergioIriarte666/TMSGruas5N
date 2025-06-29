import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Separator } from '@/components/ui/separator';
import { CalendarSettings } from '@/types/calendar';
import { 
  Settings, 
  Calendar, 
  Clock, 
  Bell, 
  Palette,
  Loader2
} from 'lucide-react';

const settingsSchema = z.object({
  defaultView: z.enum(['dayGridMonth', 'timeGridWeek', 'timeGridDay']),
  weekStartsOn: z.number().min(0).max(6),
  workingHours: z.object({
    start: z.string(),
    end: z.string(),
  }),
  showWeekends: z.boolean(),
  eventColors: z.object({
    service: z.string(),
    maintenance: z.string(),
    meeting: z.string(),
    other: z.string(),
  }),
  statusColors: z.object({
    scheduled: z.string(),
    in_progress: z.string(),
    completed: z.string(),
    cancelled: z.string(),
  }),
  enableNotifications: z.boolean(),
  reminderTime: z.number().min(5).max(120),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface CalendarSettingsFormProps {
  settings: CalendarSettings;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CalendarSettings) => Promise<void>;
}

export function CalendarSettingsForm({ 
  settings, 
  isOpen, 
  onClose, 
  onSubmit 
}: CalendarSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings
  });

  const handleFormSubmit = async (data: SettingsFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuración del Calendario
          </DialogTitle>
          <DialogDescription>
            Personaliza la apariencia y comportamiento del calendario
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Configuración General */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Configuración General
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vista Predeterminada</Label>
                <Select
                  value={watch('defaultView')}
                  onValueChange={(value) => setValue('defaultView', value as any)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dayGridMonth">Mes</SelectItem>
                    <SelectItem value="timeGridWeek">Semana</SelectItem>
                    <SelectItem value="timeGridDay">Día</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Inicio de Semana</Label>
                <Select
                  value={watch('weekStartsOn').toString()}
                  onValueChange={(value) => setValue('weekStartsOn', parseInt(value) as any)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Domingo</SelectItem>
                    <SelectItem value="1">Lunes</SelectItem>
                    <SelectItem value="2">Martes</SelectItem>
                    <SelectItem value="3">Miércoles</SelectItem>
                    <SelectItem value="4">Jueves</SelectItem>
                    <SelectItem value="5">Viernes</SelectItem>
                    <SelectItem value="6">Sábado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mostrar Fines de Semana</Label>
                <p className="text-sm text-muted-foreground">
                  Incluir sábados y domingos en la vista del calendario
                </p>
              </div>
              <Switch
                checked={watch('showWeekends')}
                onCheckedChange={(checked) => setValue('showWeekends', checked)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <Separator />

          {/* Horario Laboral */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Horario Laboral
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workingHoursStart">Hora de Inicio</Label>
                <Input
                  id="workingHoursStart"
                  type="time"
                  {...register('workingHours.start')}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workingHoursEnd">Hora de Fin</Label>
                <Input
                  id="workingHoursEnd"
                  type="time"
                  {...register('workingHours.end')}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Notificaciones */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificaciones
            </h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Activar Notificaciones</Label>
                <p className="text-sm text-muted-foreground">
                  Recibir alertas sobre eventos próximos
                </p>
              </div>
              <Switch
                checked={watch('enableNotifications')}
                onCheckedChange={(checked) => setValue('enableNotifications', checked)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminderTime">Tiempo de Recordatorio (minutos)</Label>
              <Input
                id="reminderTime"
                type="number"
                min="5"
                max="120"
                {...register('reminderTime', { valueAsNumber: true })}
                disabled={isSubmitting || !watch('enableNotifications')}
              />
              {errors.reminderTime && (
                <p className="text-sm text-destructive">{errors.reminderTime.message}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Colores */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Colores
            </h3>
            
            <div className="space-y-3">
              <Label>Colores por Tipo de Evento</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: watch('eventColors.service') }}
                  />
                  <Label className="text-sm">Servicio</Label>
                  <Input
                    type="color"
                    {...register('eventColors.service')}
                    disabled={isSubmitting}
                    className="w-10 h-6 p-0"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: watch('eventColors.maintenance') }}
                  />
                  <Label className="text-sm">Mantenimiento</Label>
                  <Input
                    type="color"
                    {...register('eventColors.maintenance')}
                    disabled={isSubmitting}
                    className="w-10 h-6 p-0"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: watch('eventColors.meeting') }}
                  />
                  <Label className="text-sm">Reunión</Label>
                  <Input
                    type="color"
                    {...register('eventColors.meeting')}
                    disabled={isSubmitting}
                    className="w-10 h-6 p-0"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: watch('eventColors.other') }}
                  />
                  <Label className="text-sm">Otro</Label>
                  <Input
                    type="color"
                    {...register('eventColors.other')}
                    disabled={isSubmitting}
                    className="w-10 h-6 p-0"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Colores por Estado</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: watch('statusColors.scheduled') }}
                  />
                  <Label className="text-sm">Programado</Label>
                  <Input
                    type="color"
                    {...register('statusColors.scheduled')}
                    disabled={isSubmitting}
                    className="w-10 h-6 p-0"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: watch('statusColors.in_progress') }}
                  />
                  <Label className="text-sm">En Progreso</Label>
                  <Input
                    type="color"
                    {...register('statusColors.in_progress')}
                    disabled={isSubmitting}
                    className="w-10 h-6 p-0"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: watch('statusColors.completed') }}
                  />
                  <Label className="text-sm">Completado</Label>
                  <Input
                    type="color"
                    {...register('statusColors.completed')}
                    disabled={isSubmitting}
                    className="w-10 h-6 p-0"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: watch('statusColors.cancelled') }}
                  />
                  <Label className="text-sm">Cancelado</Label>
                  <Input
                    type="color"
                    {...register('statusColors.cancelled')}
                    disabled={isSubmitting}
                    className="w-10 h-6 p-0"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Configuración
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}