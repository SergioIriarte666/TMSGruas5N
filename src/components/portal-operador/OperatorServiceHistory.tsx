import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Service } from '@/types';
import { 
  Search, 
  Filter, 
  Eye, 
  Calendar, 
  MapPin, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Truck
} from 'lucide-react';
import { formatCurrency } from '@/lib/chile-config';

interface OperatorServiceHistoryProps {
  services: Service[];
}

export function OperatorServiceHistory({ services }: OperatorServiceHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);

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

    const icons = {
      pending: Clock,
      assigned: Truck,
      in_progress: AlertTriangle,
      completed: CheckCircle,
      cancelled: AlertTriangle
    };

    const Icon = icons[status];

    return (
      <Badge variant="outline" className={colors[status]}>
        <Icon className="w-3 h-3 mr-1" />
        {labels[status]}
      </Badge>
    );
  };

  const getServiceTypeLabel = (type: Service['service_type']) => {
    const labels = {
      tow: 'Remolque',
      taxi: 'Taxi de Grúa',
      transport: 'Transporte',
      assistance: 'Asistencia'
    };
    return labels[type];
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.service_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Ordenar servicios por fecha (más recientes primero)
  const sortedServices = [...filteredServices].sort(
    (a, b) => new Date(b.service_date).getTime() - new Date(a.service_date).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Historial de Servicios
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar servicios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="assigned">Asignado</SelectItem>
                <SelectItem value="in_progress">En Progreso</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de Servicios */}
          <div className="space-y-4">
            {sortedServices.map((service) => (
              <Card key={service.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{service.service_number}</h3>
                        {getStatusBadge(service.status)}
                        <Badge variant="outline">
                          {getServiceTypeLabel(service.service_type)}
                        </Badge>
                      </div>

                      <p className="text-muted-foreground">{service.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {new Date(service.service_date).toLocaleDateString('es-CL')} a las {service.requested_time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{formatCurrency(service.total_cost)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="truncate">{service.origin_address}</span>
                        </div>
                        {service.destination_address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-green-600" />
                            <span className="truncate">{service.destination_address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedService(service)}
                        className="gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {sortedServices.length === 0 && (
              <div className="text-center py-12">
                <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No se encontraron servicios
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'Aún no tienes servicios registrados'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalles del Servicio */}
      <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Detalles del Servicio {selectedService?.service_number}
            </DialogTitle>
          </DialogHeader>
          
          {selectedService && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Información General</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Tipo:</strong> {getServiceTypeLabel(selectedService.service_type)}</p>
                    <div className="flex items-center gap-2">
                      <strong>Estado:</strong> {getStatusBadge(selectedService.status)}
                    </div>
                    <p><strong>Fecha:</strong> {new Date(selectedService.service_date).toLocaleDateString('es-CL')}</p>
                    <p><strong>Hora:</strong> {selectedService.requested_time}</p>
                    <p><strong>Costo:</strong> {formatCurrency(selectedService.total_cost)}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Ubicaciones</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Origen:</strong> {selectedService.origin_address}</p>
                    {selectedService.destination_address && (
                      <p><strong>Destino:</strong> {selectedService.destination_address}</p>
                    )}
                    {selectedService.distance_km && (
                      <p><strong>Distancia:</strong> {selectedService.distance_km} km</p>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Descripción</h4>
                <p className="text-sm text-muted-foreground">{selectedService.description}</p>
              </div>
              {selectedService.notes && (
                <div>
                  <h4 className="font-medium mb-2">Notas</h4>
                  <p className="text-sm text-muted-foreground">{selectedService.notes}</p>
                </div>
              )}
              
              {/* Tiempos */}
              <div>
                <h4 className="font-medium mb-2">Tiempos</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Solicitado:</strong> {selectedService.requested_time}</p>
                  {selectedService.started_time && (
                    <p><strong>Iniciado:</strong> {selectedService.started_time}</p>
                  )}
                  {selectedService.completed_time && (
                    <p><strong>Completado:</strong> {selectedService.completed_time}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}