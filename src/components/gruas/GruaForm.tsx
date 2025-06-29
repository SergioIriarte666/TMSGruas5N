import React from 'react';
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
import { TowTruck } from '@/types';
import { MOCK_OPERATORS } from '@/data/mockData';
import { Loader2 } from 'lucide-react';

const gruaSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  license_plate: z.string().min(1, 'La patente es requerida'),
  brand: z.string().min(1, 'La marca es requerida'),
  model: z.string().min(1, 'El modelo es requerido'),
  year: z.number().min(1900, 'Año inválido').max(new Date().getFullYear() + 1, 'Año inválido'),
  capacity_tons: z.number().min(0.1, 'La capacidad debe ser mayor a 0'),
  truck_type: z.enum(['flatbed', 'wheel_lift', 'integrated', 'heavy_duty']),
  status: z.enum(['available', 'in_service', 'maintenance', 'out_of_service']),
  current_operator_id: z.string().optional(),
  circulation_permit_expiry: z.string().optional(),
  soap_expiry: z.string().optional(),
  technical_review_expiry: z.string().optional(),
  notes: z.string().optional(),
});

type GruaFormData = z.infer<typeof gruaSchema>;

interface GruaFormProps {
  grua?: TowTruck;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GruaFormData) => Promise<void>;
  operators?: Array<{ id: string; name: string }>;
}

export function GruaForm({ grua, isOpen, onClose, onSubmit, operators = MOCK_OPERATORS }: GruaFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<GruaFormData>({
    resolver: zodResolver(gruaSchema),
    defaultValues: grua ? {
      name: grua.name,
      license_plate: grua.license_plate,
      brand: grua.brand,
      model: grua.model,
      year: grua.year,
      capacity_tons: grua.capacity_tons,
      truck_type: grua.truck_type,
      status: grua.status,
      current_operator_id: grua.current_operator_id || '',
      circulation_permit_expiry: grua.circulation_permit_expiry || '',
      soap_expiry: grua.soap_expiry || '',
      technical_review_expiry: grua.technical_review_expiry || '',
      notes: grua.notes || '',
    } : {
      name: '',
      license_plate: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      capacity_tons: 3.5,
      truck_type: 'flatbed',
      status: 'available',
      current_operator_id: '',
      circulation_permit_expiry: '',
      soap_expiry: '',
      technical_review_expiry: '',
      notes: '',
    }
  });

  React.useEffect(() => {
    if (grua) {
      reset({
        name: grua.name,
        license_plate: grua.license_plate,
        brand: grua.brand,
        model: grua.model,
        year: grua.year,
        capacity_tons: grua.capacity_tons,
        truck_type: grua.truck_type,
        status: grua.status,
        current_operator_id: grua.current_operator_id || '',
        circulation_permit_expiry: grua.circulation_permit_expiry || '',
        soap_expiry: grua.soap_expiry || '',
        technical_review_expiry: grua.technical_review_expiry || '',
        notes: grua.notes || '',
      });
    } else {
      reset({
        name: '',
        license_plate: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        capacity_tons: 3.5,
        truck_type: 'flatbed',
        status: 'available',
        current_operator_id: '',
        circulation_permit_expiry: '',
        soap_expiry: '',
        technical_review_expiry: '',
        notes: '',
      });
    }
  }, [grua, reset]);

  const handleFormSubmit = async (data: GruaFormData) => {
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

  const truckTypeLabels = {
    flatbed: 'Plataforma',
    wheel_lift: 'Elevador de ruedas',
    integrated: 'Integrada',
    heavy_duty: 'Trabajo pesado'
  };

  const statusLabels = {
    available: 'Disponible',
    in_service: 'En servicio',
    maintenance: 'Mantenimiento',
    out_of_service: 'Fuera de servicio'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {grua ? 'Editar Grúa' : 'Nueva Grúa'}
          </DialogTitle>
          <DialogDescription>
            {grua ? 'Modifica los datos de la grúa' : 'Completa los datos para registrar una nueva grúa'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Grúa *</Label>
              <Input
                id="name"
                placeholder="Ej: Grúa 01"
                {...register('name')}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_plate">Patente *</Label>
              <Input
                id="license_plate"
                placeholder="ABC123"
                {...register('license_plate')}
                disabled={isSubmitting}
              />
              {errors.license_plate && (
                <p className="text-sm text-destructive">{errors.license_plate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Marca *</Label>
              <Input
                id="brand"
                placeholder="Mercedes-Benz"
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
                placeholder="Atego"
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
              <Label htmlFor="capacity_tons">Capacidad (Toneladas) *</Label>
              <Input
                id="capacity_tons"
                type="number"
                step="0.1"
                min="0.1"
                placeholder="3.5"
                {...register('capacity_tons', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              {errors.capacity_tons && (
                <p className="text-sm text-destructive">{errors.capacity_tons.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tipo de Grúa *</Label>
              <Select
                value={watch('truck_type')}
                onValueChange={(value) => setValue('truck_type', value as any)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(truckTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.truck_type && (
                <p className="text-sm text-destructive">{errors.truck_type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Estado *</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value as any)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Operador Asignado</Label>
              <Select
                value={watch('current_operator_id') || 'unassigned'}
                onValueChange={(value) => setValue('current_operator_id', value === 'unassigned' ? undefined : value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin operador asignado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Sin operador asignado</SelectItem>
                  {operators.map((operator) => (
                    <SelectItem key={operator.id} value={operator.id}>
                      {operator.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="circulation_permit_expiry">Vencimiento Permiso de Circulación</Label>
              <Input
                id="circulation_permit_expiry"
                type="date"
                {...register('circulation_permit_expiry')}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="soap_expiry">Vencimiento SOAP</Label>
              <Input
                id="soap_expiry"
                type="date"
                {...register('soap_expiry')}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="technical_review_expiry">Vencimiento Revisión Técnica</Label>
              <Input
                id="technical_review_expiry"
                type="date"
                {...register('technical_review_expiry')}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                placeholder="Observaciones adicionales..."
                rows={3}
                {...register('notes')}
                disabled={isSubmitting}
              />
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
              {grua ? 'Actualizar' : 'Crear'} Grúa
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}