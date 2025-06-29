import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Search, Filter, Calendar as CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ServiceFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  priorityFilter: string;
  onPriorityChange: (value: string) => void;
  operatorFilter: string;
  onOperatorChange: (value: string) => void;
  dateFrom?: Date;
  onDateFromChange: (date: Date | undefined) => void;
  dateTo?: Date;
  onDateToChange: (date: Date | undefined) => void;
  onClearFilters: () => void;
  operators: Array<{ id: string; name: string }>;
}

export function ServiceFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  priorityFilter,
  onPriorityChange,
  operatorFilter,
  onOperatorChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onClearFilters,
  operators
}: ServiceFiltersProps) {
  
  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'assigned', label: 'Asignado' },
    { value: 'in_progress', label: 'En Progreso' },
    { value: 'completed', label: 'Completado' },
    { value: 'cancelled', label: 'Cancelado' }
  ];

  const typeOptions = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'tow', label: 'Remolque' },
    { value: 'taxi', label: 'Taxi de Grúa' },
    { value: 'transport', label: 'Transporte' },
    { value: 'assistance', label: 'Asistencia' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'Todas las prioridades' },
    { value: 'low', label: 'Baja' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' },
    { value: 'urgent', label: 'Urgente' }
  ];

  const getActiveFiltersCount = () => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (typeFilter !== 'all') count++;
    if (priorityFilter !== 'all') count++;
    if (operatorFilter !== 'all') count++;
    if (dateFrom) count++;
    if (dateTo) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="gap-2 action-button-outline"
            >
              <X className="w-4 h-4" />
              Limpiar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label>Búsqueda</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número, cliente, descripción..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Fecha Desde</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, 'PPP', { locale: es }) : 'Seleccionar fecha'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={onDateFromChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Fecha Hasta</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, 'PPP', { locale: es }) : 'Seleccionar fecha'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={onDateToChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Filter Selects */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select value={statusFilter} onValueChange={onStatusChange}>
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

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={typeFilter} onValueChange={onTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Prioridad</Label>
            <Select value={priorityFilter} onValueChange={onPriorityChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Operador</Label>
            <Select value={operatorFilter} onValueChange={onOperatorChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los operadores</SelectItem>
                {operators.map((operator) => (
                  <SelectItem key={operator.id} value={operator.id}>
                    {operator.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}