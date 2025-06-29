import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Service, Client, TowTruck, User } from '@/types';
import { 
  MapPin, 
  Clock, 
  User as UserIcon, 
  Truck, 
  Phone, 
  DollarSign,
  FileText,
  Camera,
  Navigation,
  CheckCircle,
  AlertCircle,
  Calendar,
  Car
} from 'lucide-react';

interface ServiceDetailsProps {
  service: Service;
  client?: Client;
  towTruck?: TowTruck;
  operator?: User;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onUpdateStatus?: (status: Service['status']) => void;
}

export function ServiceDetails({ 
  service, 
  client, 
  towTruck, 
  operator, 
  isOpen, 
  onClose, 
  onEdit,
  onUpdateStatus 
}: ServiceDetailsProps) {
  
  const getStatusBadge = (status: Service['status']) => {
    const variants = {
      pending: 'secondary',
      assigned: 'default',
      in_progress: 'default',
      completed: 'default',
      cancelled: 'destructive'
    } as const;

    const labels = {
      pending: 'Pendiente',
      assigned: 'Asignado',
      in_progress: 'En Progreso',
      completed: 'Completado',
      cancelled: 'Cancelado'
    };

    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: Service['priority']) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };

    const labels = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      urgent: 'Urgente'
    };

    return (
      <Badge variant="outline" className={colors[priority]}>
        {labels[priority]}
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

  const canUpdateStatus = (currentStatus: Service['status'], newStatus: Service['status']) => {
    const statusFlow = {
      pending: ['assigned', 'cancelled'],
      assigned: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'cancelled'],
      completed: [],
      cancelled: []
    };
    return statusFlow[currentStatus]?.includes(newStatus) || false;
  };

  const getNextActions = () => {
    const actions = [];
    
    if (canUpdateStatus(service.status, 'assigned') && service.status === 'pending') {
      actions.push({
        label: 'Asignar',
        status: 'assigned' as const,
        variant: 'default' as const
      });
    }
    
    if (canUpdateStatus(service.status, 'in_progress') && service.status === 'assigned') {
      actions.push({
        label: 'Iniciar Servicio',
        status: 'in_progress' as const,
        variant: 'default' as const
      });
    }
    
    if (canUpdateStatus(service.status, 'completed') && service.status === 'in_progress') {
      actions.push({
        label: 'Completar',
        status: 'completed' as const,
        variant: 'default' as const
      });
    }
    
    if (service.status !== 'completed' && service.status !== 'cancelled') {
      actions.push({
        label: 'Cancelar',
        status: 'cancelled' as const,
        variant: 'destructive' as const
      });
    }
    
    return actions;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">
                Servicio {service.service_number}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-2">
                <Badge className={service.folio ? "bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-300" : ""}>
                  {service.folio ? `Folio: ${service.folio}` : "Sin folio"}
                </Badge>
                <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
                  {getServiceTypeLabel(service.service_type)}
                </Badge>
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(service.status)}
              {getPriorityBadge(service.priority)}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Service Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Fecha y Hora
                  </div>
                  <p className="font-medium">
                    {new Date(service.service_date).toLocaleDateString('es-AR')} a las {service.requested_time}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    Descripción
                  </div>
                  <p className="font-medium">{service.description}</p>
                </div>

                {service.distance_km && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Navigation className="w-4 h-4" />
                      Distancia
                    </div>
                    <p className="font-medium">{service.distance_km} km</p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    Costo Total
                  </div>
                  <p className="font-medium text-lg">${service.total_cost.toLocaleString('es-AR')}</p>
                </div>
              </div>

              {service.notes && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Notas</div>
                  <p className="text-sm bg-muted p-3 rounded">{service.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Client Information */}
          {client && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-lg">{client.name}</p>
                    <p className="text-sm text-muted-foreground">{client.document}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{client.phone}</span>
                    </div>
                    {client.email && (
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                    )}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    {client.address}, {client.city}, {client.province}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vehicle Information */}
          {(service.vehicle_license_plate || service.vehicle_brand || service.vehicle_model) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Vehículo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {service.vehicle_license_plate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Patente</p>
                      <p className="font-bold text-lg">{service.vehicle_license_plate}</p>
                    </div>
                  )}
                  {service.vehicle_brand && (
                    <div>
                      <p className="text-sm text-muted-foreground">Marca</p>
                      <p className="font-medium">{service.vehicle_brand}</p>
                    </div>
                  )}
                  {service.vehicle_model && (
                    <div>
                      <p className="text-sm text-muted-foreground">Modelo</p>
                      <p className="font-medium">{service.vehicle_model}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Ubicaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  Origen
                </div>
                <p className="font-medium">{service.origin_address}</p>
              </div>

              {service.destination_address && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    Destino
                  </div>
                  <p className="font-medium">{service.destination_address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assignment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Asignación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {towTruck && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Truck className="w-4 h-4" />
                      Grúa Asignada
                    </div>
                    <div>
                      <p className="font-medium">{towTruck.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {towTruck.license_plate} - {towTruck.brand} {towTruck.model}
                      </p>
                    </div>
                  </div>
                )}

                {operator && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <UserIcon className="w-4 h-4" />
                      Operador Asignado
                    </div>
                    <div>
                      <p className="font-medium">{operator.name}</p>
                      <p className="text-sm text-muted-foreground">{operator.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Cronología
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Servicio solicitado</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(service.created_at).toLocaleString('es-AR')}
                    </p>
                  </div>
                </div>

                {service.started_time && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Servicio iniciado</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(`${service.service_date}T${service.started_time}`).toLocaleString('es-AR')}
                      </p>
                    </div>
                  </div>
                )}

                {service.completed_time && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Servicio completado</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(`${service.service_date}T${service.completed_time}`).toLocaleString('es-AR')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Special Fields */}
          {service.special_fields && Object.keys(service.special_fields).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalles Especiales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {service.service_type === 'taxi' && (
                    <>
                      {service.special_fields.passenger_count && (
                        <div>
                          <p className="text-sm text-muted-foreground">Pasajeros</p>
                          <p className="font-medium">{service.special_fields.passenger_count}</p>
                        </div>
                      )}
                      {service.special_fields.has_luggage !== undefined && (
                        <div>
                          <p className="text-sm text-muted-foreground">Equipaje</p>
                          <p className="font-medium">{service.special_fields.has_luggage ? 'Sí' : 'No'}</p>
                        </div>
                      )}
                      {service.special_fields.pickup_instructions && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-muted-foreground">Instrucciones</p>
                          <p className="font-medium">{service.special_fields.pickup_instructions}</p>
                        </div>
                      )}
                    </>
                  )}

                  {service.service_type === 'transport' && (
                    <>
                      {service.special_fields.cargo_type && (
                        <div>
                          <p className="text-sm text-muted-foreground">Tipo de Carga</p>
                          <p className="font-medium">{service.special_fields.cargo_type}</p>
                        </div>
                      )}
                      {service.special_fields.cargo_weight_kg && (
                        <div>
                          <p className="text-sm text-muted-foreground">Peso</p>
                          <p className="font-medium">{service.special_fields.cargo_weight_kg} kg</p>
                        </div>
                      )}
                      {service.special_fields.requires_special_handling !== undefined && (
                        <div>
                          <p className="text-sm text-muted-foreground">Manejo Especial</p>
                          <p className="font-medium">{service.special_fields.requires_special_handling ? 'Sí' : 'No'}</p>
                        </div>
                      )}
                      {service.special_fields.loading_instructions && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-muted-foreground">Instrucciones de Carga</p>
                          <p className="font-medium">{service.special_fields.loading_instructions}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Costs */}
          {service.additional_costs && service.additional_costs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Costos Adicionales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {service.additional_costs.map((cost) => (
                    <div key={cost.id} className="flex justify-between items-center">
                      <span className="text-sm">{cost.concept}</span>
                      <span className="font-medium">${cost.amount.toLocaleString('es-AR')}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total</span>
                    <span>${service.total_cost.toLocaleString('es-AR')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {onEdit && (
              <Button variant="outline" onClick={onEdit}>
                Editar Servicio
              </Button>
            )}

            {getNextActions().map((action) => (
              <Button
                key={action.status}
                variant={action.variant}
                onClick={() => onUpdateStatus?.(action.status)}
                className="gap-2"
              >
                {action.status === 'completed' && <CheckCircle className="w-4 h-4" />}
                {action.status === 'cancelled' && <AlertCircle className="w-4 h-4" />}
                {action.label}
              </Button>
            ))}

            {service.requires_inspection && (
              <Button variant="outline" className="gap-2">
                <Camera className="w-4 h-4" />
                Ver Inspección
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}