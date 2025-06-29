import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Vehicle, Client } from '@/types';
import { Loader2 } from 'lucide-react';

const vehiculoSchema = z.object({
  license_plate: z.string().min(1, 'La patente es requerida'),
  brand: z.string().min(1, 'La marca es requerida'),
  model: z.string().min(1, 'El modelo es requerido'),
  year: z.number().min(1900, 'Año inválido').max(new Date().getFullYear() + 1, 'Año inválido'),
  color: z.string().min(1, 'El color es requerido'),
  vehicle_type: z.enum(['car', 'truck', 'motorcycle', 'van', 'bus']),
  client_id: z.string().min(1, 'Debe seleccionar un cliente'),
});

type VehiculoFormData = z.infer<typeof vehiculoSchema>;

interface VehiculoFormProps {
  vehiculo?: Vehicle;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VehiculoFormData) => Promise<void>;
  clientes: Client[];
}

export function VehiculoForm({ vehiculo, isOpen, onClose, onSubmit, clientes }: VehiculoFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<VehiculoFormData>({
    resolver: zodResolver(vehiculoSchema),
    defaultValues: vehiculo ? {
      license_plate: vehiculo.license_plate,
      brand: vehiculo.brand,
      model: vehiculo.model,
      year: vehiculo.year,
      color: vehiculo.color,
      vehicle_type: vehiculo.vehicle_type,
      client_id: vehiculo.client_id,
    } : {
      license_plate: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      vehicle_type: 'car',
      client_id: '',
    }
  });

  React.useEffect(() => {
    if (vehiculo) {
      reset({
        license_plate: vehiculo.license_plate,
        brand: vehiculo.brand,
        model: vehiculo.model,
        year: vehiculo.year,
        color: vehiculo.color,
        vehicle_type: vehiculo.vehicle_type,
        client_id: vehiculo.client_id,
      });
    } else {
      reset({
        license_plate: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        color: '',
        vehicle_type: 'car',
        client_id: '',
      });
    }
  }, [vehiculo, reset]);

  const handleFormSubmit = async (data: VehiculoFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const vehicleTypeLabels = {
    car: 'Automóvil',
    truck: 'Camión',
    motorcycle: 'Motocicleta',
    van: 'Camioneta',
    bus: 'Autobús'
  };

  const colors = [
    'Blanco', 'Negro', 'Gris', 'Plata', 'Rojo', 'Azul', 'Verde', 'Amarillo',
    'Naranja', 'Violeta', 'Marrón', 'Dorado', 'Beige', 'Celeste', 'Rosa'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {vehiculo ? 'Editar Vehículo' : 'Nuevo Vehículo'}
          </DialogTitle>
          <DialogDescription>
            {vehiculo ? 'Modifica los datos del vehículo' : 'Completa los datos para registrar un nuevo vehículo'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="license_plate">Patente *</Label>
              <Input
                id="license_plate"
                placeholder="ABC123"
                {...register('license_plate')}
                disabled={isSubmitting}
                className="uppercase"
              />
              {errors.license_plate && (
                <p className="text-sm text-destructive">{errors.license_plate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tipo de Vehículo *</Label>
              <Select
                value={watch('vehicle_type')}
                onValueChange={(value) => setValue('vehicle_type', value as any)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(vehicleTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vehicle_type && (
                <p className="text-sm text-destructive">{errors.vehicle_type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Marca *</Label>
              <Input
                id="brand"
                placeholder="Toyota"
                {...register('brand')}
                disabled={isSubmitting}
              />
              {errors.brand && (
                <p className="text-sm text-destructive">{errors.brand.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Modelo *</Label>
              <Input
                id="model"
                placeholder="Corolla"
                {...register('model')}
                disabled={isSubmitting}
              />
              {errors.model && (
                <p className="text-sm text-destructive">{errors.model.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Año *</Label>
              <Input
                id="year"
                type="number"
                min="1900"
                max={new Date().getFullYear() + 1}
                {...register('year', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              {errors.year && (
                <p className="text-sm text-destructive">{errors.year.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Color *</Label>
              <Select
                value={watch('color')}
                onValueChange={(value) => setValue('color', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el color" />
                </SelectTrigger>
                <SelectContent>
                  {colors.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.color && (
                <p className="text-sm text-destructive">{errors.color.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Cliente Propietario *</Label>
              <Select
                value={watch('client_id')}
                onValueChange={(value) => setValue('client_id', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.name} - {cliente.document}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.client_id && (
                <p className="text-sm text-destructive">{errors.client_id.message}</p>
              )}
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
              {vehiculo ? 'Actualizar' : 'Crear'} Vehículo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}