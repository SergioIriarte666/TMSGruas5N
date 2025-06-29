import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Client } from '@/types';
import { 
  MapPin, 
  Clock, 
  Truck, 
  AlertTriangle, 
  Phone, 
  Navigation,
  Calculator,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { formatCurrency, calculateIVA, calculateTotal } from '@/lib/chile-config';
import { toast } from 'sonner';

const serviceRequestSchema = z.object({
  service_type: z.enum(['tow', 'taxi', 'transport', 'assistance']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  origin_address: z.string().min(1, 'La dirección de origen es requerida'),
  destination_address: z.string().optional(),
  service_date: z.string().min(1, 'La fecha es requerida'),
  requested_time: z.string().min(1, 'La hora es requerida'),
  description: z.string().min(10, 'Describe el problema con al menos 10 caracteres'),
  contact_phone: z.string().min(1, 'El teléfono de contacto es requerido'),
  vehicle_info: z.object({
    license_plate: z.string().optional(),
    brand: z.string().optional(),
    model: z.string().optional(),
    color: z.string().optional(),
  }).optional(),
  special_requirements: z.string().optional(),
  is_emergency: z.boolean().default(false),
});

type ServiceRequestData = z.infer<typeof serviceRequestSchema>;

interface ClientServiceRequestProps {
  client: Client;
  onSubmit: (data: ServiceRequestData) => Promise<void>;
}

export function ClientServiceRequest({ client, onSubmit }: ClientServiceRequestProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ServiceRequestData>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      service_type: 'tow',
      priority: 'medium',
      origin_address: '',
      destination_address: '',
      service_date: new Date().toISOString().split('T')[0],
      requested_time: new Date().toTimeString().slice(0, 5),
      description: '',
      contact_phone: client.phone,
      vehicle_info: {
        license_plate: '',
        brand: '',
        model: '',
        color: '',
      },
      special_requirements: '',
      is_emergency: false,
    }
  });

  const serviceType = watch('service_type');
  const priority = watch('priority');
  const isEmergency = watch('is_emergency');

  // Calcular costo estimado
  React.useEffect(() => {
    const baseCosts = {
      tow: 45000,
      taxi: 25000,
      transport: 35000,
      assistance: 20000
    };

    const priorityMultipliers = {
      low: 1,
      medium: 1,
      high: 1.2,
      urgent: 1.5
    };

    const emergencyMultiplier = isEmergency ? 1.3 : 1;
    
    const baseCost = baseCosts[serviceType] || 25000;
    const finalCost = baseCost * priorityMultipliers[priority] * emergencyMultiplier;
    
    setEstimatedCost(finalCost);
  }, [serviceType, priority, isEmergency]);

  const handleFormSubmit = async (data: ServiceRequestData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast.success('Solicitud de servicio enviada exitosamente');
    } catch (error) {
      toast.error('Error al enviar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  const serviceTypeLabels = {
    tow: 'Remolque',
    taxi: 'Taxi de Grúa',
    transport: 'Transporte',
    assistance: 'Asistencia Mecánica'
  };

  const priorityLabels = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    urgent: 'Urgente'
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Solicitar Nuevo Servicio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Tipo de Servicio y Prioridad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Servicio *</Label>
                <Select
                  value={serviceType}
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
                {errors.service_type && (
                  <p className="text-sm text-destructive">{errors.service_type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Prioridad *</Label>
                <Select
                  value={priority}
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
                {errors.priority && (
                  <p className="text-sm text-destructive">{errors.priority.message}</p>
                )}
              </div>
            </div>

            {/* Emergencia */}
            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <Label htmlFor="is_emergency" className="font-medium">Servicio de Emergencia</Label>
                  <p className="text-sm text-muted-foreground">
                    Marca si necesitas atención inmediata (recargo del 30%)
                  </p>
                </div>
              </div>
              <Switch
                id="is_emergency"
                checked={isEmergency}
                onCheckedChange={(checked) => setValue('is_emergency', checked)}
                disabled={isSubmitting}
              />
            </div>

            {/* Ubicaciones */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Ubicaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="origin_address">¿Dónde estás? *</Label>
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
                  <Label htmlFor="destination_address">¿A dónde necesitas ir?</Label>
                  <Input
                    id="destination_address"
                    placeholder="Taller Mecánico, Av. Las Condes 8000"
                    {...register('destination_address')}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Opcional para servicios de asistencia mecánica
                  </p>
                </div>

                <Button type="button" variant="outline" size="sm" className="gap-2">
                  <Navigation className="w-4 h-4" />
                  Usar mi ubicación actual
                </Button>
              </CardContent>
            </Card>

            {/* Fecha y Hora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service_date">Fecha del Servicio *</Label>
                <Input
                  id="service_date"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  {...register('service_date')}
                  disabled={isSubmitting}
                />
                {errors.service_date && (
                  <p className="text-sm text-destructive">{errors.service_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="requested_time">Hora Preferida *</Label>
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

            {/* Información del Vehículo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información del Vehículo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="license_plate">Patente</Label>
                    <Input
                      id="license_plate"
                      placeholder="ABC123"
                      {...register('vehicle_info.license_plate')}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand">Marca</Label>
                    <Input
                      id="brand"
                      placeholder="Toyota"
                      {...register('vehicle_info.brand')}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Modelo</Label>
                    <Input
                      id="model"
                      placeholder="Corolla"
                      {...register('vehicle_info.model')}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      placeholder="Blanco"
                      {...register('vehicle_info.color')}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Descripción del Problema */}
            <div className="space-y-2">
              <Label htmlFor="description">Describe el problema *</Label>
              <Textarea
                id="description"
                placeholder="Describe detalladamente qué pasó con tu vehículo..."
                rows={4}
                {...register('description')}
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Contacto */}
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Teléfono de Contacto *</Label>
              <Input
                id="contact_phone"
                placeholder="+56 9 1234 5678"
                {...register('contact_phone')}
                disabled={isSubmitting}
              />
              {errors.contact_phone && (
                <p className="text-sm text-destructive">{errors.contact_phone.message}</p>
              )}
            </div>

            {/* Requerimientos Especiales */}
            <div className="space-y-2">
              <Label htmlFor="special_requirements">Requerimientos Especiales</Label>
              <Textarea
                id="special_requirements"
                placeholder="¿Hay algo más que debemos saber? (acceso difícil, horarios especiales, etc.)"
                rows={2}
                {...register('special_requirements')}
                disabled={isSubmitting}
              />
            </div>

            <Separator />

            {/* Estimación de Costo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Estimación de Costo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Servicio base ({serviceTypeLabels[serviceType]}):</span>
                    <span className="font-medium">{formatCurrency(estimatedCost / (priority === 'high' ? 1.2 : priority === 'urgent' ? 1.5 : 1) / (isEmergency ? 1.3 : 1))}</span>
                  </div>
                  
                  {priority !== 'medium' && priority !== 'low' && (
                    <div className="flex justify-between items-center text-sm">
                      <span>Recargo por prioridad {priorityLabels[priority].toLowerCase()}:</span>
                      <span className="text-orange-600">+{priority === 'high' ? '20%' : '50%'}</span>
                    </div>
                  )}
                  
                  {isEmergency && (
                    <div className="flex justify-between items-center text-sm">
                      <span>Recargo por emergencia:</span>
                      <span className="text-red-600">+30%</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-sm">
                    <span>Subtotal:</span>
                    <span className="font-medium">{formatCurrency(estimatedCost)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span>IVA (19%):</span>
                    <span className="font-medium">{formatCurrency(calculateIVA(estimatedCost))}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Estimado:</span>
                    <span className="text-blue-600">{formatCurrency(calculateTotal(estimatedCost))}</span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    * El costo final puede variar según la distancia y condiciones específicas del servicio
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Botón de Envío */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1 gap-2">
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {isSubmitting ? 'Enviando Solicitud...' : 'Solicitar Servicio'}
              </Button>
              
              <Button type="button" variant="outline" className="gap-2">
                <Phone className="w-4 h-4" />
                Llamar Directamente
              </Button>
            </div>

            {/* Información Adicional */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                ¿Qué pasa después de enviar la solicitud?
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Recibirás una confirmación inmediata</li>
                <li>• Te asignaremos la grúa más cercana</li>
                <li>• Te contactaremos para confirmar detalles</li>
                <li>• Podrás seguir el estado en tiempo real</li>
              </ul>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}