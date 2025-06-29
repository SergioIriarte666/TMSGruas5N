import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Service, Client } from '@/types';
import { 
  Search, 
  Calendar as CalendarIcon, 
  Filter, 
  CheckCircle, 
  Clock,
  FileText,
  X,
  Plus
} from 'lucide-react';
import { formatCurrency } from '@/lib/chile-config';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ServiceSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectServices: (services: Service[]) => void;
  clients: Client[];
  services: Service[];
  selectedServiceIds?: string[];
}

export function ServiceSelector({
  isOpen,
  onClose,
  onSelectServices,
  clients,
  services,
  selectedServiceIds = []
}: ServiceSelectorProps) {
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>('completed');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>(selectedServiceIds);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);

  useEffect(() => {
    // Filter services based on criteria
    let filtered = services.filter(service => {
      // Only show completed and unbilled services by default
      const statusMatch = statusFilter === 'all' || service.status === statusFilter;
      const clientMatch = selectedClient === 'all' || service.client_id === selectedClient;
      const searchMatch = !searchTerm || 
        service.service_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Date filters
      const serviceDate = new Date(service.service_date);
      const dateFromMatch = !dateFrom || serviceDate >= dateFrom;
      const dateToMatch = !dateTo || serviceDate <= dateTo;
      
      // Only show unbilled services for new invoices
      const billingMatch = !service.is_billed;
      
      return statusMatch && clientMatch && searchMatch && dateFromMatch && dateToMatch && billingMatch;
    });

    setFilteredServices(filtered);
  }, [services, selectedClient, dateFrom, dateTo, statusFilter, searchTerm]);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSelectAll = () => {
    const allServiceIds = filteredServices.map(s => s.id);
    setSelectedServices(allServiceIds);
  };

  const handleClearAll = () => {
    setSelectedServices([]);
  };

  const handleConfirmSelection = () => {
    const selected = services.filter(s => selectedServices.includes(s.id));
    onSelectServices(selected);
    onClose();
  };

  const getStatusBadge = (status: Service['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };

    const labels = {
      pending: 'Pendiente',
      assigned: 'Asignado',
      in_progress: 'En Progreso',
      completed: 'Completado',
      cancelled: 'Cancelado'
    };

    return (
      <Badge variant="outline" className={colors[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getServiceTypeLabel = (type: Service['service_type']) => {
    const labels = {
      tow: 'Remolque',
      taxi: 'Taxi',
      transport: 'Transporte',
      assistance: 'Asistencia'
    };
    return labels[type];
  };

  const selectedServicesData = services.filter(s => selectedServices.includes(s.id));
  const totalAmount = selectedServicesData.reduce((sum, service) => sum + service.total_cost, 0);

  const clearFilters = () => {
    setSelectedClient('all');
    setDateFrom(undefined);
    setDateTo(undefined);
    setStatusFilter('completed');
    setSearchTerm('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Seleccionar Servicios para Facturar
          </DialogTitle>
          <DialogDescription>
            Filtra y selecciona los servicios que deseas incluir en la factura
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtros de Búsqueda
                </CardTitle>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Limpiar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Client */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Buscar Servicio</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por número o descripción..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los clientes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los clientes</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} - {client.document}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date Range and Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        onSelect={setDateFrom}
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
                        onSelect={setDateTo}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="completed">Completados</SelectItem>
                      <SelectItem value="in_progress">En Progreso</SelectItem>
                      <SelectItem value="assigned">Asignados</SelectItem>
                      <SelectItem value="pending">Pendientes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Results Summary */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    {filteredServices.length} servicios encontrados
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {selectedServices.length} seleccionados
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    disabled={filteredServices.length === 0}
                  >
                    Seleccionar Todos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAll}
                    disabled={selectedServices.length === 0}
                  >
                    Limpiar Selección
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Servicios Disponibles</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredServices.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-primary rounded flex items-center justify-center">
                            {selectedServices.length === filteredServices.length && filteredServices.length > 0 && (
                              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                              </svg>
                            )}
                          </div>
                        </div>
                      </TableHead>
                      <TableHead>Número</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredServices.map((service) => {
                      const client = clients.find(c => c.id === service.client_id);
                      const isSelected = selectedServices.includes(service.id);
                      
                      return (
                        <TableRow 
                          key={service.id} 
                          className={`cursor-pointer hover:bg-muted/50 ${isSelected ? 'bg-blue-50 dark:bg-blue-950' : ''}`}
                          onClick={() => handleServiceToggle(service.id)}
                        >
                          <TableCell>
                            <div className="flex items-center justify-center">
                              <div className="w-5 h-5 border-2 border-primary rounded flex items-center justify-center">
                                {isSelected && (
                                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                  </svg>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {service.service_number}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{client?.name}</p>
                              <p className="text-sm text-muted-foreground">{client?.document}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getServiceTypeLabel(service.service_type)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">
                                {new Date(service.service_date).toLocaleDateString('es-CL')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {service.requested_time}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(service.status)}
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{service.description}</p>
                            {service.distance_km && (
                              <p className="text-xs text-muted-foreground">
                                {service.distance_km} km
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <p className="font-semibold">
                              {formatCurrency(service.total_cost)}
                            </p>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No se encontraron servicios</p>
                  <p className="text-sm">
                    Ajusta los filtros para encontrar servicios disponibles para facturar
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected Services Summary */}
          {selectedServices.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Servicios Seleccionados ({selectedServices.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedServicesData.map((service) => {
                    const client = clients.find(c => c.id === service.client_id);
                    return (
                      <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{service.service_number}</span>
                            <Badge variant="outline">
                              {getServiceTypeLabel(service.service_type)}
                            </Badge>
                            {getStatusBadge(service.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {client?.name} - {service.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(service.total_cost)}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleServiceToggle(service.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total Seleccionado:</span>
                      <span>{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmSelection}
            disabled={selectedServices.length === 0}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Agregar {selectedServices.length} Servicio{selectedServices.length !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}