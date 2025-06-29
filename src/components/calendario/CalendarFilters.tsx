import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  Tag,
  Clock,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CalendarFiltersProps {
  typeFilter: string;
  onTypeChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  assigneeFilter: string;
  onAssigneeChange: (value: string) => void;
  dateRangeFilter: {start?: Date, end?: Date};
  onDateRangeChange: (range: {start?: Date, end?: Date}) => void;
}

export function CalendarFilters({
  typeFilter,
  onTypeChange,
  statusFilter,
  onStatusChange,
  assigneeFilter,
  onAssigneeChange,
  dateRangeFilter,
  onDateRangeChange
}: CalendarFiltersProps) {
  const clearFilters = () => {
    onTypeChange('all');
    onStatusChange('all');
    onAssigneeChange('all');
    onDateRangeChange({});
  };

  const hasActiveFilters = 
    typeFilter !== 'all' || 
    statusFilter !== 'all' || 
    assigneeFilter !== 'all' || 
    dateRangeFilter.start || 
    dateRangeFilter.end;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 gap-1"
            >
              <X className="w-4 h-4" />
              Limpiar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">Tipo de Evento</Label>
            <Select value={typeFilter} onValueChange={onTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="service">Servicio</SelectItem>
                <SelectItem value="maintenance">Mantenimiento</SelectItem>
                <SelectItem value="meeting">Reunión</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Estado</Label>
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="scheduled">Programado</SelectItem>
                <SelectItem value="in_progress">En Progreso</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Asignado a</Label>
            <Select value={assigneeFilter} onValueChange={onAssigneeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los operadores</SelectItem>
                <SelectItem value="2">Juan Operador</SelectItem>
                <SelectItem value="3">Pedro Conductor</SelectItem>
                <SelectItem value="4">Carlos Chofer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Rango de Fechas</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRangeFilter.start && dateRangeFilter.end ? (
                    <>
                      {format(dateRangeFilter.start, 'dd/MM/yy')} - {format(dateRangeFilter.end, 'dd/MM/yy')}
                    </>
                  ) : dateRangeFilter.start ? (
                    <>Desde {format(dateRangeFilter.start, 'dd/MM/yy')}</>
                  ) : dateRangeFilter.end ? (
                    <>Hasta {format(dateRangeFilter.end, 'dd/MM/yy')}</>
                  ) : (
                    <span>Seleccionar fechas</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3 border-b">
                  <div className="space-y-2">
                    <Label className="text-sm">Fecha Inicial</Label>
                    <Calendar
                      mode="single"
                      selected={dateRangeFilter.start}
                      onSelect={(date) => onDateRangeChange({
                        ...dateRangeFilter,
                        start: date || undefined
                      })}
                      initialFocus
                    />
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label className="text-sm">Fecha Final</Label>
                    <Calendar
                      mode="single"
                      selected={dateRangeFilter.end}
                      onSelect={(date) => onDateRangeChange({
                        ...dateRangeFilter,
                        end: date || undefined
                      })}
                      initialFocus
                    />
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onDateRangeChange({})}
                    >
                      Limpiar
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}