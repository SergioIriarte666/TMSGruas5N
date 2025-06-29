import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Truck, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/chile-config';

const serviceSchema = z.object({
  base_rate_per_km: z.number().min(0, 'La tarifa debe ser mayor a 0'),
  minimum_charge: z.number().min(0, 'El cargo mínimo debe ser mayor a 0'),
  night_surcharge_percent: z.number().min(0).max(100, 'El recargo debe estar entre 0 y 100%'),
  weekend_surcharge_percent: z.number().min(0).max(100, 'El recargo debe estar entre 0 y 100%'),
  holiday_surcharge_percent: z.number().min(0).max(100, 'El recargo debe estar entre 0 y 100%'),
  auto_assign_services: z.boolean(),
  require_client_signature: z.boolean(),
  require_photos: z.boolean(),
  max_service_radius_km: z.number().min(1, 'El radio debe ser mayor a 0'),
  default_response_time_minutes: z.number().min(5, 'El tiempo debe ser mayor a 5 minutos'),
  iva_rate: z.number().min(0).max(100, 'El IVA debe estar entre 0 y 100%'),
  include_iva_in_prices: z.boolean(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceType {
  id: string;
  name: string;
  base_price: number;
  price_per_km: number;
  active: boolean;
}

interface ServiceSettingsProps {
  onSave: (data: ServiceFormData) => Promise<void>;
}

export function ServiceSettings({ onSave }: ServiceSettingsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([
    {
      id: '1',
      name: 'Remolque Estándar',
      base_price: 50000,
      price_per_km: 1500,
      active: true
    },
    {
      id: '2',
      name: 'Asistencia Mecánica',
      base_price: 30000,
      price_per_km: 1000,
      active: true
    },
    {
      id: '3',
      name: 'Taxi de Grúa',
      base_price: 25000,
      price_per_km: 1200,
      active: true
    },
    {
      id: '4',
      name: 'Transporte Especial',
      base_price: 80000,
      price_per_km: 2000,
      active: false
    }
  ]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      base_rate_per_km: 1500, // CLP por km
      minimum_charge: 25000, // CLP mínimo
      night_surcharge_percent: 25,
      weekend_surcharge_percent: 15,
      holiday_surcharge_percent: 30,
      auto_assign_services: true,
      require_client_signature: true,
      require_photos: false,
      max_service_radius_km: 50,
      default_response_time_minutes: 30,
      iva_rate: 19, // IVA chileno
      include_iva_in_prices: true,
    }
  });

  const handleFormSubmit = async (data: ServiceFormData) => {
    setIsSubmitting(true);
    try {
      await onSave(data);
      toast.success('Configuración de servicios actualizada exitosamente');
    } catch (error) {
      toast.error('Error al actualizar la configuración');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleServiceType = (id: string) => {
    setServiceTypes(prev => 
      prev.map(service => 
        service.id === id ? { ...service, active: !service.active } : service
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Pricing Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Configuración de Tarifas (Chile)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base_rate_per_km">Tarifa Base por Km (CLP) *</Label>
                <Input
                  id="base_rate_per_km"
                  type="number"
                  step="1"
                  {...register('base_rate_per_km', { valueAsNumber: true })}
                  disabled={isSubmitting}
                />
                {errors.base_rate_per_km && (
                  <p className="text-sm text-destructive">{errors.base_rate_per_km.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimum_charge">Cargo Mínimo (CLP) *</Label>
                <Input
                  id="minimum_charge"
                  type="number"
                  step="1"
                  {...register('minimum_charge', { valueAsNumber: true })}
                  disabled={isSubmitting}
                />
                {errors.minimum_charge && (
                  <p className="text-sm text-destructive">{errors.minimum_charge.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="iva_rate">Tasa de IVA (%) *</Label>
                <Input
                  id="iva_rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  {...register('iva_rate', { valueAsNumber: true })}
                  disabled={isSubmitting}
                />
                {errors.iva_rate && (
                  <p className="text-sm text-destructive">{errors.iva_rate.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="include_iva_in_prices"
                  checked={watch('include_iva_in_prices')}
                  onCheckedChange={(checked) => setValue('include_iva_in_prices', checked)}
                  disabled={isSubmitting}
                />
                <Label htmlFor="include_iva_in_prices">Incluir IVA en precios mostrados</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="night_surcharge_percent">Recargo Nocturno (%) *</Label>
                <Input
                  id="night_surcharge_percent"
                  type="number"
                  min="0"
                  max="100"
                  {...register('night_surcharge_percent', { valueAsNumber: true })}
                  disabled={isSubmitting}
                />
                {errors.night_surcharge_percent && (
                  <p className="text-sm text-destructive">{errors.night_surcharge_percent.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="weekend_surcharge_percent">Recargo Fin de Semana (%) *</Label>
                <Input
                  id="weekend_surcharge_percent"
                  type="number"
                  min="0"
                  max="100"
                  {...register('weekend_surcharge_percent', { valueAsNumber: true })}
                  disabled={isSubmitting}
                />
                {errors.weekend_surcharge_percent && (
                  <p className="text-sm text-destructive">{errors.weekend_surcharge_percent.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="holiday_surcharge_percent">Recargo Feriados (%) *</Label>
                <Input
                  id="holiday_surcharge_percent"
                  type="number"
                  min="0"
                  max="100"
                  {...register('holiday_surcharge_percent', { valueAsNumber: true })}
                  disabled={isSubmitting}
                />
                {errors.holiday_surcharge_percent && (
                  <p className="text-sm text-destructive">{errors.holiday_surcharge_percent.message}</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Service Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Configuración de Servicios</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_service_radius_km">Radio Máximo de Servicio (Km) *</Label>
                  <Input
                    id="max_service_radius_km"
                    type="number"
                    min="1"
                    {...register('max_service_radius_km', { valueAsNumber: true })}
                    disabled={isSubmitting}
                  />
                  {errors.max_service_radius_km && (
                    <p className="text-sm text-destructive">{errors.max_service_radius_km.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default_response_time_minutes">Tiempo de Respuesta por Defecto (min) *</Label>
                  <Input
                    id="default_response_time_minutes"
                    type="number"
                    min="5"
                    {...register('default_response_time_minutes', { valueAsNumber: true })}
                    disabled={isSubmitting}
                  />
                  {errors.default_response_time_minutes && (
                    <p className="text-sm text-destructive">{errors.default_response_time_minutes.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Asignación Automática</Label>
                    <p className="text-sm text-muted-foreground">
                      Asignar automáticamente servicios a operadores disponibles
                    </p>
                  </div>
                  <Switch
                    checked={watch('auto_assign_services')}
                    onCheckedChange={(checked) => setValue('auto_assign_services', checked)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Requerir Firma del Cliente</Label>
                    <p className="text-sm text-muted-foreground">
                      Solicitar firma digital del cliente al completar el servicio
                    </p>
                  </div>
                  <Switch
                    checked={watch('require_client_signature')}
                    onCheckedChange={(checked) => setValue('require_client_signature', checked)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Requerir Fotos</Label>
                    <p className="text-sm text-muted-foreground">
                      Obligar a tomar fotos antes y después del servicio
                    </p>
                  </div>
                  <Switch
                    checked={watch('require_photos')}
                    onCheckedChange={(checked) => setValue('require_photos', checked)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Configuración
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Service Types */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tipos de Servicio</CardTitle>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Agregar Tipo
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Precio Base</TableHead>
                <TableHead>Precio por Km</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceTypes.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{formatCurrency(service.base_price)}</TableCell>
                  <TableCell>{formatCurrency(service.price_per_km)}</TableCell>
                  <TableCell>
                    <Badge variant={service.active ? 'default' : 'secondary'}>
                      {service.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => toggleServiceType(service.id)}
                      >
                        {service.active ? (
                          <Trash2 className="w-4 h-4" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}