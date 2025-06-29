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
import { User } from '@/types';
import { Loader2 } from 'lucide-react';

const operadorSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  role: z.enum(['admin', 'operator', 'viewer']),
  license_number: z.string().optional(),
  license_expiry: z.string().optional(),
  occupational_exam_expiry: z.string().optional(),
  psychosensometric_exam_expiry: z.string().optional(),
  emergency_contact: z.string().optional(),
  emergency_phone: z.string().optional(),
});

type OperadorFormData = z.infer<typeof operadorSchema>;

interface OperadorFormProps {
  operador?: User & { 
    license_number?: string; 
    license_expiry?: string; 
    occupational_exam_expiry?: string;
    psychosensometric_exam_expiry?: string;
    emergency_contact?: string; 
    emergency_phone?: string; 
  };
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OperadorFormData) => Promise<void>;
}

export function OperadorForm({ operador, isOpen, onClose, onSubmit }: OperadorFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<OperadorFormData>({
    resolver: zodResolver(operadorSchema),
    defaultValues: operador ? {
      name: operador.name,
      email: operador.email,
      phone: operador.phone || '',
      role: operador.role,
      license_number: operador.license_number || '',
      license_expiry: operador.license_expiry || '',
      occupational_exam_expiry: operador.occupational_exam_expiry || '',
      psychosensometric_exam_expiry: operador.psychosensometric_exam_expiry || '',
      emergency_contact: operador.emergency_contact || '',
      emergency_phone: operador.emergency_phone || '',
    } : {
      name: '',
      email: '',
      phone: '',
      role: 'operator',
      license_number: '',
      license_expiry: '',
      occupational_exam_expiry: '',
      psychosensometric_exam_expiry: '',
      emergency_contact: '',
      emergency_phone: '',
    }
  });

  React.useEffect(() => {
    if (operador) {
      reset({
        name: operador.name,
        email: operador.email,
        phone: operador.phone || '',
        role: operador.role,
        license_number: operador.license_number || '',
        license_expiry: operador.license_expiry || '',
        occupational_exam_expiry: operador.occupational_exam_expiry || '',
        psychosensometric_exam_expiry: operador.psychosensometric_exam_expiry || '',
        emergency_contact: operador.emergency_contact || '',
        emergency_phone: operador.emergency_phone || '',
      });
    } else {
      reset({
        name: '',
        email: '',
        phone: '',
        role: 'operator',
        license_number: '',
        license_expiry: '',
        occupational_exam_expiry: '',
        psychosensometric_exam_expiry: '',
        emergency_contact: '',
        emergency_phone: '',
      });
    }
  }, [operador, reset]);

  const handleFormSubmit = async (data: OperadorFormData) => {
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

  const roleLabels = {
    admin: 'Administrador',
    operator: 'Operador',
    viewer: 'Supervisor'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {operador ? 'Editar Operador' : 'Nuevo Operador'}
          </DialogTitle>
          <DialogDescription>
            {operador ? 'Modifica los datos del operador' : 'Completa los datos para registrar un nuevo operador'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Nombre Completo *</Label>
              <Input
                id="name"
                placeholder="Juan Pérez"
                {...register('name')}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="juan@tmsgruas.com"
                {...register('email')}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                id="phone"
                placeholder="+54 11 1234-5678"
                {...register('phone')}
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Rol *</Label>
              <Select
                value={watch('role')}
                onValueChange={(value) => setValue('role', value as any)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el rol" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_number">Número de Licencia</Label>
              <Input
                id="license_number"
                placeholder="12345678"
                {...register('license_number')}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_expiry">Vencimiento de Licencia</Label>
              <Input
                id="license_expiry"
                type="date"
                {...register('license_expiry')}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupational_exam_expiry">Vencimiento Examen Ocupacional</Label>
              <Input
                id="occupational_exam_expiry"
                type="date"
                {...register('occupational_exam_expiry')}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="psychosensometric_exam_expiry">Vencimiento Psicosensotécnico</Label>
              <Input
                id="psychosensometric_exam_expiry"
                type="date"
                {...register('psychosensometric_exam_expiry')}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_contact">Contacto de Emergencia</Label>
              <Input
                id="emergency_contact"
                placeholder="María Pérez"
                {...register('emergency_contact')}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_phone">Teléfono de Emergencia</Label>
              <Input
                id="emergency_phone"
                placeholder="+54 11 8765-4321"
                {...register('emergency_phone')}
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
              {operador ? 'Actualizar' : 'Crear'} Operador
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}