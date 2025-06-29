import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Service, Client, TowTruck, User } from '@/types';
import { Loader2, MapPin, Clock, DollarSign, Plus, X, Calculator, FileText } from 'lucide-react';
import { formatCurrency, calculateIVA, calculateTotal } from '@/lib/chile-config';

const serviceSchema = z.object({
  client_id: z.string().min(1, 'Debe seleccionar un cliente'),
  // Datos del vehículo manual
  vehicle_license_plate: z.string().optional(),
  vehicle_brand: z.string().optional(),
  vehicle_model: z.string().optional(),
  service_type: z.enum(['tow', 'taxi', 'transport', 'assistance']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  origin_address: z.string().min(1, 'La dirección de origen es requerida'),
  destination_address: z.string().optional(),
  service_date: z.string().min(1, 'La fecha es requerida'),
  requested_time: z.string().min(1, 'La hora es requerida'),
  description: z.string().min(1, 'La descripción es requerida'),
  notes: z.string().optional(),
  tow_truck_id: z.string().optional(),
  operator_id: z.string().optional(),
  base_cost: z.number().min(0, 'El costo debe ser mayor a 0'),
  distance_km: z.number().min(0).optional(),
  requires_inspection: z.boolean().default(false),
  folio: z.string().optional(), // Campo para folio manual (opcional)
  special_fields: z.object({
    passenger_count: z.number().optional(),
    has_luggage: z.boolean().optional(),
    pickup_instructions: z.string().optional(),
    cargo_type: z.string().optional(),
    cargo_weight_kg: z.number().optional(),
    requires_special_handling: z.boolean().optional(),
    loading_instructions: z.string().optional(),
  }).optional()
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  service?: Service;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ServiceFormData) => Promise<void>;
  clients: Client[];
  towTrucks: TowTruck[];
  operators: User[];
}

export function ServiceForm({ 
  service, 
  isOpen, 
  onClose, 
  onSubmit, 
  clients, 
  towTrucks, 
  operators 
}: ServiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [additionalCosts, setAdditionalCosts] = useState<Array<{id: string, concept: string, amount: number}>>([]);
  const [calculatedSubtotal, setCalculatedSubtotal] = useState(0);
  const [calculatedIVA, setCalculatedIVA] = useState(0);
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [usesManualFolio, setUsesManualFolio] = useState(service?.folio ? true : false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: service ? {
      client_id: service.client_id,
      vehicle_license_plate: service.vehicle_license_plate || '',
      vehicle_brand: service.vehicle_brand || '',
      vehicle_model: service.vehicle_model || '',
      service_type: service.service_type,
      priority: service.priority,
      origin_address: service.origin_address,
      destination_address: service.destination_address || '',
      service_date: service.service_date,
      requested_time: service.requested_time,
      description: service.description,
      notes: service.notes || '',
      tow_truck_id: service.tow_truck_id || 'none',
      operator_id: service.operator_id || 'none',
      base_cost: service.base_cost,
      distance_km: service.distance_km || 0,
      requires_inspection: service.requires_inspection,
      folio: service.folio || '',
      special_fields: service.special_fields || {}
    } : {
      client_id: '',
      vehicle_license_plate: '',
      vehicle_brand: '',
      vehicle_model: '',
      service_type: 'tow',
      priority: 'medium',
      origin_address: '',
      destination_address: '',
      service_date: new Date().toISOString().split('T')[0],
      requested_time: new Date().toTimeString().slice(0, 5),
      description: '',
      notes: '',
      tow_truck_id: 'none',
      operator_id: 'none',
      base_cost: 25000, // Precio base en pesos chilenos
      distance_km: 0,
      requires_inspection: false,
      folio: '',
      special_fields: {}
    }
  });

  React.useEffect(() => {
    // Calculate costs when base cost, distance, or additional costs change
    const baseCost = watch('base_cost') || 0;
    const distance = watch('distance_km') || 0;
    const distanceCost = distance * 1500; // $1500 CLP por km
    const additionalTotal = additionalCosts.reduce((sum, cost) => sum + cost.amount, 0);
    const subtotal = baseCost + distanceCost + additionalTotal;
    const iva = calculateIVA(subtotal);
    const total = calculateTotal(subtotal);
    
    setCalculatedSubtotal(subtotal);
    setCalculatedIVA(iva);
    setCalculatedTotal(total);
  }, [watch('base_cost'), watch('distance_km'), additionalCosts]);

  const handleFormSubmit = async (data: ServiceFormData) => {
    setIsSubmitting(true);
    try {
      // Convert 'none' values back to undefined for optional fields
      const processedData = {
        ...data,
        tow_truck_id: data.tow_truck_id === 'none' ? undefined : data.tow_truck_id,
        operator_id: data.operator_id === 'none' ? undefined : data.operator_id,
        folio: usesManualFolio ? data.folio : undefined, // Solo enviar folio si es manual
        special_fields: getSpecialFields(data.service_type)
      };
      
      await onSubmit(processedData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSpecialFields = (serviceType: string) => {
    const fields: any = {};
    
    if (serviceType === 'taxi') {
      fields.passenger_count = watch('special_fields.passenger_count');
      fields.has_luggage = watch('special_fields.has_luggage');
      fields.pickup_instructions = watch('special_fields.pickup_instructions');
    } else if (serviceType === 'transport') {
      fields.cargo_type = watch('special_fields.cargo_type');
      fields.cargo_weight_kg = watch('special_fields.cargo_weight_kg');
      fields.requires_special_handling = watch('special_fields.requires_special_handling');
      fields.loading_instructions = watch('special_fields.loading_instructions');
    }
    
    return fields;
  };

  const addAdditionalCost = () => {
    const newCost = {
      id: Date.now().toString(),
      concept: '',
      amount: 0
    };
    setAdditionalCosts([...additionalCosts, newCost]);
  };

  const updateAdditionalCost = (id: string, field: string, value: any) => {
    setAdditionalCosts(prev => 
      prev.map(cost => 
        cost.id === id ? { ...cost, [field]: value } : cost
      )
    );
  };

  const removeAdditionalCost = (id: string) => {
    setAdditionalCosts(prev => prev.filter(cost => cost.id !== id));
  };

  const serviceTypeLabels = {
    tow: 'Remolque',
    taxi: 'Taxi de Grúa',
    transport: 'Transporte',
    assistance: 'Asistencia'
  };

  const priorityLabels = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    urgent: 'Urgente'
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  };

  const selectedClient = clients.find(c => c.id === watch('client_id'));
  const availableTrucks = towTrucks.filter(t => t.status === 'available');
  const availableOperators = operators.filter(o => o.role === 'operator');

  const toggleManualFolio = () => {
    setUsesManualFolio(!usesManualFolio);
    if (!usesManualFolio) {
      // Si estamos cambiando a folio manual, mantener el valor actual
    } else {
      // Si estamos cambiando a folio automático, limpiar el campo
      setValue('folio', '');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {service ? 'Editar Servicio' : 'Nuevo Servicio'}
          </DialogTitle>
          <DialogDescription>
            {service ? 'Modifica los datos del servicio' : 'Completa los datos para crear un nuevo servicio'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Client and Vehicle Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cliente y Vehículo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cliente *</Label>
                  <Select
                    value={watch('client_id')}
                    onValueChange={(value) => setValue('client_id', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} - {client.document}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.client_id && (
                    <p className="text-sm text-destructive">{errors.client_id.message}</p>
                  )}
                </div>

                {/* Folio Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="folio">Número de Folio</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="manual_folio"
                        checked={usesManualFolio}
                        onCheckedChange={toggleManualFolio}
                        disabled={isSubmitting}
                      />
                      <Label htmlFor="manual_folio" className="text-sm">Folio Manual</Label>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="folio"
                      placeholder={usesManualFolio ? "Ingrese número de folio" : "Se generará automáticamente"}
                      {...register('folio')}
                      disabled={isSubmitting || !usesManualFolio}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {usesManualFolio 
                      ? "Ingrese el número de folio proporcionado por el cliente" 
                      : "El sistema generará un número de folio automáticamente"}
                  </p>
                </div>
              </div>

              {/* Datos del vehículo manual */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle_license_plate">Patente del Vehículo</Label>
                  <Input
                    id="vehicle_license_plate"
                    placeholder="ABC123"
                    {...register('vehicle_license_plate')}
                    disabled={isSubmitting}
                    className="uppercase"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicle_brand">Marca del Vehículo</Label>
                  <Input
                    id="vehicle_brand"
                    placeholder="Toyota"
                    {...register('vehicle_brand')}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicle_model">Modelo del Vehículo</Label>
                  <Input
                    id="vehicle_model"
                    placeholder="Corolla"
                    {...register('vehicle_model')}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {selectedClient && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">{selectedClient.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedClient.phone}</p>
                  <p className="text-sm text-muted-foreground">{selectedClient.address}, {selectedClient.city}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalles del Servicio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Servicio *</Label>
                  <Select
                    value={watch('service_type')}
                    onValueChange={(value) => setValue('service_type', value as any)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(serviceTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Prioridad *</Label>
                  <Select
                    value={watch('priority')}
                    onValueChange={(value) => setValue('priority', value as any)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(priorityLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              value === 'urgent' ? 'bg-red-500' :
                              value === 'high' ? 'bg-orange-500' :
                              value === 'medium' ? 'bg-blue-500' : 'bg-gray-500'
                            }`} />
                            {label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service_date">Fecha del Servicio *</Label>
                  <Input
                    id="service_date"
                    type="date"
                    {...register('service_date')}
                    disabled={isSubmitting}
                  />
                  {errors.service_date && (
                    <p className="text-sm text-destructive">{errors.service_date.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requested_time">Hora Solicitada *</Label>
                  <Input
                    id="requested_time"
                    type="time"
                    {...register('requested_time')}
                    disabled={isSubmitting}
                  />
                  {errors.requested_time && (
                    <p className="text-sm text-destructive">{errors.requested_time.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción del Servicio *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe el motivo del servicio..."
                  rows={3}
                  {...register('description')}
                  disabled={isSubmitting}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Ubicaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="origin_address">Dirección de Origen *</Label>
                <Input
                  id="origin_address"
                  placeholder="Av. Providencia 1234, Santiago"
                  {...register('origin_address')}
                  disabled={isSubmitting}
                />
                {errors.origin_address && (
                  <p className="text-sm text-destructive">{errors.origin_address.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination_address">Dirección de Destino</Label>
                <Input
                  id="destination_address"
                  placeholder="Taller Mecánico, Av. Las Condes 8000"
                  {...register('destination_address')}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="distance_km">Distancia Estimada (Km)</Label>
                <Input
                  id="distance_km"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="12.5"
                  {...register('distance_km', { valueAsNumber: true })}
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
          </Card>

          {/* Special Fields based on Service Type */}
          {(watch('service_type') === 'taxi' || watch('service_type') === 'transport') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {watch('service_type') === 'taxi' ? 'Detalles del Taxi' : 'Detalles del Transporte'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {watch('service_type') === 'taxi' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="passenger_count">Número de Pasajeros</Label>
                        <Input
                          id="passenger_count"
                          type="number"
                          min="1"
                          max="8"
                          placeholder="1"
                          {...register('special_fields.passenger_count', { valueAsNumber: true })}
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="has_luggage"
                          checked={watch('special_fields.has_luggage')}
                          onCheckedChange={(checked) => setValue('special_fields.has_luggage', checked)}
                          disabled={isSubmitting}
                        />
                        <Label htmlFor="has_luggage">Tiene equipaje</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pickup_instructions">Instrucciones de Recogida</Label>
                      <Textarea
                        id="pickup_instructions"
                        placeholder="Instrucciones especiales para el conductor..."
                        rows={2}
                        {...register('special_fields.pickup_instructions')}
                        disabled={isSubmitting}
                      />
                    </div>
                  </>
                )}

                {watch('service_type') === 'transport' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cargo_type">Tipo de Carga</Label>
                        <Input
                          id="cargo_type"
                          placeholder="Ej: Maquinaria, Muebles, etc."
                          {...register('special_fields.cargo_type')}
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cargo_weight_kg">Peso de la Carga (Kg)</Label>
                        <Input
                          id="cargo_weight_kg"
                          type="number"
                          min="0"
                          placeholder="500"
                          {...register('special_fields.cargo_weight_kg', { valueAsNumber: true })}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requires_special_handling"
                        checked={watch('special_fields.requires_special_handling')}
                        onCheckedChange={(checked) => setValue('special_fields.requires_special_handling', checked)}
                        disabled={isSubmitting}
                      />
                      <Label htmlFor="requires_special_handling">Requiere manejo especial</Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="loading_instructions">Instrucciones de Carga</Label>
                      <Textarea
                        id="loading_instructions"
                        placeholder="Instrucciones especiales para la carga y descarga..."
                        rows={2}
                        {...register('special_fields.loading_instructions')}
                        disabled={isSubmitting}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Asignación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Grúa Asignada</Label>
                  <Select
                    value={watch('tow_truck_id')}
                    onValueChange={(value) => setValue('tow_truck_id', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Asignar automáticamente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Asignación automática</SelectItem>
                      {availableTrucks.map((truck) => (
                        <SelectItem key={truck.id} value={truck.id}>
                          {truck.name} - {truck.license_plate} ({truck.capacity_tons}t)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Operador Asignado</Label>
                  <Select
                    value={watch('operator_id')}
                    onValueChange={(value) => setValue('operator_id', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Asignar automáticamente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Asignación automática</SelectItem>
                      {availableOperators.map((operator) => (
                        <SelectItem key={operator.id} value={operator.id}>
                          {operator.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="requires_inspection"
                  checked={watch('requires_inspection')}
                  onCheckedChange={(checked) => setValue('requires_inspection', checked)}
                  disabled={isSubmitting}
                />
                <Label htmlFor="requires_inspection">Requiere inspección del vehículo</Label>
              </div>
            </CardContent>
          </Card>

          {/* Cost Calculation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Cálculo de Costos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="base_cost">Costo Base (CLP) *</Label>
                  <Input
                    id="base_cost"
                    type="number"
                    step="1"
                    min="0"
                    {...register('base_cost', { valueAsNumber: true })}
                    disabled={isSubmitting}
                  />
                  {errors.base_cost && (
                    <p className="text-sm text-destructive">{errors.base_cost.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Costo por Distancia</Label>
                  <div className="p-2 bg-muted rounded text-sm">
                    {(watch('distance_km') || 0)} km × {formatCurrency(1500)} = {formatCurrency((watch('distance_km') || 0) * 1500)}
                  </div>
                </div>
              </div>

              {/* Additional Costs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Costos Adicionales</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAdditionalCost}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar
                  </Button>
                </div>

                {additionalCosts.map((cost) => (
                  <div key={cost.id} className="flex items-center gap-2">
                    <Input
                      placeholder="Concepto"
                      value={cost.concept}
                      onChange={(e) => updateAdditionalCost(cost.id, 'concept', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Monto"
                      value={cost.amount}
                      onChange={(e) => updateAdditionalCost(cost.id, 'amount', parseFloat(e.target.value) || 0)}
                      className="w-32"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAdditionalCost(cost.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Tax Calculation */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatCurrency(calculatedSubtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>IVA (19%):</span>
                  <span className="font-medium">{formatCurrency(calculatedIVA)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span>{formatCurrency(calculatedTotal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas Adicionales</Label>
            <Textarea
              id="notes"
              placeholder="Observaciones, instrucciones especiales, etc..."
              rows={3}
              {...register('notes')}
              disabled={isSubmitting}
            />
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
              {service ? 'Actualizar' : 'Crear'} Servicio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}