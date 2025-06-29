import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CalendarEvent } from '@/types/calendar';
import { MOCK_SERVICES } from '@/data/mockData';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Edit, 
  Trash2, 
  Tag,
  FileText,
  Link2,
  User
} from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';

interface EventDetailsProps {
  event: CalendarEvent;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: (id: string) => Promise<void>;
}

export function EventDetails({ 
  event, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete 
}: EventDetailsProps) {
  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que deseas eliminar este evento?')) {
      await onDelete(event.id);
    }
  };

  // Formatear fechas
  const formatEventDate = (dateStr: string, allDay: boolean) => {
    const date = new Date(dateStr);
    
    let dayStr = format(date, 'EEEE dd MMMM yyyy', { locale: es });
    if (isToday(date)) dayStr = 'Hoy';
    else if (isTomorrow(date)) dayStr = 'Mañana';
    else if (isYesterday(date)) dayStr = 'Ayer';
    
    if (allDay) {
      return dayStr;
    } else {
      return `${dayStr}, ${format(date, 'HH:mm')}`;
    }
  };

  // Obtener color según tipo de evento
  const getEventTypeColor = (type: CalendarEvent['type']) => {
    const colors = {
      service: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      maintenance: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      meeting: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    };
    return colors[type];
  };

  // Obtener color según estado
  const getEventStatusColor = (status: CalendarEvent['status']) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      in_progress: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300',
      completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return colors[status];
  };

  // Obtener etiqueta de tipo de evento
  const getEventTypeLabel = (type: CalendarEvent['type']) => {
    const labels = {
      service: 'Servicio',
      maintenance: 'Mantenimiento',
      meeting: 'Reunión',
      other: 'Otro'
    };
    return labels[type];
  };

  // Obtener etiqueta de estado
  const getEventStatusLabel = (status: CalendarEvent['status']) => {
    const labels = {
      scheduled: 'Programado',
      in_progress: 'En Progreso',
      completed: 'Completado',
      cancelled: 'Cancelado'
    };
    return labels[status];
  };

  // Buscar servicio relacionado
  const relatedService = event.relatedServiceId 
    ? MOCK_SERVICES.find(s => s.id === event.relatedServiceId)
    : null;

  // Obtener nombres de operadores asignados
  const getAssignedOperatorNames = () => {
    const operatorMap: Record<string, string> = {
      '2': 'Juan Operador',
      '3': 'Pedro Conductor',
      '4': 'Carlos Chofer'
    };
    
    if (!event.assignedTo || event.assignedTo.length === 0) {
      return 'Sin asignar';
    }
    
    return event.assignedTo.map(id => operatorMap[id] || `Operador ${id}`).join(', ');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {event.title}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 mt-2">
            <Badge className={getEventTypeColor(event.type)}>
              {getEventTypeLabel(event.type)}
            </Badge>
            <Badge className={getEventStatusColor(event.status)}>
              {getEventStatusLabel(event.status)}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Fechas */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Fecha y Hora</p>
                  <p className="text-sm text-muted-foreground">
                    {event.allDay 
                      ? `${formatEventDate(event.start, true)} (Todo el día)` 
                      : `${formatEventDate(event.start, false)} - ${formatEventDate(event.end, false)}`}
                  </p>
                </div>
              </div>

              {event.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Ubicación</p>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Asignado a</p>
                  <p className="text-sm text-muted-foreground">
                    {getAssignedOperatorNames()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Descripción */}
          {event.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Descripción
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {event.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Servicio Relacionado */}
          {relatedService && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  Servicio Relacionado
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{relatedService.service_number}</p>
                    <Badge variant="outline">
                      {relatedService.status === 'pending' ? 'Pendiente' :
                       relatedService.status === 'assigned' ? 'Asignado' :
                       relatedService.status === 'in_progress' ? 'En Progreso' :
                       relatedService.status === 'completed' ? 'Completado' : 'Cancelado'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{relatedService.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(relatedService.service_date), 'dd/MM/yyyy')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {relatedService.requested_time}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadatos */}
          <div className="text-xs text-muted-foreground">
            <p>Creado: {format(new Date(event.createdAt), 'dd/MM/yyyy HH:mm')}</p>
            <p>Última actualización: {format(new Date(event.updatedAt), 'dd/MM/yyyy HH:mm')}</p>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cerrar
            </Button>
            <Button
              onClick={onEdit}
              className="gap-2"
            >
              <Edit className="w-4 h-4" />
              Editar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}