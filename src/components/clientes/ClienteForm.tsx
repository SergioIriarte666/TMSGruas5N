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
import { Client } from '@/types';
import { Loader2 } from 'lucide-react';
import { CHILE_CONFIG, validateRUT, formatRUT } from '@/lib/chile-config';

const clienteSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  document: z.string().min(1, 'El documento es requerido').refine((val) => {
    // Validar RUT si es el tipo de documento seleccionado
    return true; // Validación más específica se hará en el componente
  }, 'Documento inválido'),
  document_type: z.enum(['rut', 'passport', 'foreign_id']),
  phone: z.string().min(1, 'El teléfono es requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().min(1, 'La dirección es requerida'),
  city: z.string().min(1, 'La ciudad es requerida'),
  region: z.string().min(1, 'La región es requerida'),
  postal_code: z.string().min(1, 'El código postal es requerido'),
  notes: z.string().optional(),
});

type ClienteFormData = z.infer<typeof clienteSchema>;

interface ClienteFormProps {
  cliente?: Client;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClienteFormData) => Promise<void>;
}

export function ClienteForm({ cliente, isOpen, onClose, onSubmit }: ClienteFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [documentError, setDocumentError] = React.useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: cliente ? {
      name: cliente.name,
      document: cliente.document,
      document_type: cliente.document_type as any,
      phone: cliente.phone,
      email: cliente.email || '',
      address: cliente.address,
      city: cliente.city,
      region: cliente.province, // Mapear province a region
      postal_code: cliente.postal_code,
      notes: cliente.notes || '',
    } : {
      name: '',
      document: '',
      document_type: 'rut',
      phone: '',
      email: '',
      address: '',
      city: '',
      region: '',
      postal_code: '',
      notes: '',
    }
  });

  React.useEffect(() => {
    if (cliente) {
      reset({
        name: cliente.name,
        document: cliente.document,
        document_type: cliente.document_type as any,
        phone: cliente.phone,
        email: cliente.email || '',
        address: cliente.address,
        city: cliente.city,
        region: cliente.province,
        postal_code: cliente.postal_code,
        notes: cliente.notes || '',
      });
    } else {
      reset({
        name: '',
        document: '',
        document_type: 'rut',
        phone: '',
        email: '',
        address: '',
        city: '',
        region: '',
        postal_code: '',
        notes: '',
      });
    }
  }, [cliente, reset]);

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const documentType = watch('document_type');
    
    if (documentType === 'rut') {
      // Formatear RUT mientras se escribe
      const formattedRUT = formatRUT(value);
      setValue('document', formattedRUT);
      
      // Validar RUT
      if (value.length >= 8) {
        if (!validateRUT(value)) {
          setDocumentError('RUT inválido');
        } else {
          setDocumentError('');
        }
      } else {
        setDocumentError('');
      }
    } else {
      setValue('document', value);
      setDocumentError('');
    }
  };

  const handleFormSubmit = async (data: ClienteFormData) => {
    // Validación final del RUT
    if (data.document_type === 'rut' && !validateRUT(data.document)) {
      setDocumentError('RUT inválido');
      return;
    }

    setIsSubmitting(true);
    try {
      // Mapear region de vuelta a province para compatibilidad
      const submitData = {
        ...data,
        province: data.region,
      };
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const documentTypeLabels = CHILE_CONFIG.documentTypes;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
          </DialogTitle>
          <DialogDescription>
            {cliente ? 'Modifica los datos del cliente' : 'Completa los datos para registrar un nuevo cliente'}
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
              <Label>Tipo de Documento *</Label>
              <Select
                value={watch('document_type')}
                onValueChange={(value) => {
                  setValue('document_type', value as any);
                  setValue('document', ''); // Limpiar documento al cambiar tipo
                  setDocumentError('');
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(documentTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.document_type && (
                <p className="text-sm text-destructive">{errors.document_type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">
                {watch('document_type') === 'rut' ? 'RUT *' : 'Número de Documento *'}
              </Label>
              <Input
                id="document"
                placeholder={watch('document_type') === 'rut' ? '12.345.678-9' : 'Número de documento'}
                value={watch('document')}
                onChange={handleDocumentChange}
                disabled={isSubmitting}
              />
              {(errors.document || documentError) && (
                <p className="text-sm text-destructive">
                  {documentError || errors.document?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                id="phone"
                placeholder="+56 9 1234 5678"
                {...register('phone')}
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="juan@email.com"
                {...register('email')}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Dirección *</Label>
              <Input
                id="address"
                placeholder="Av. Providencia 1234"
                {...register('address')}
                disabled={isSubmitting}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad *</Label>
              <Input
                id="city"
                placeholder="Santiago"
                {...register('city')}
                disabled={isSubmitting}
              />
              {errors.city && (
                <p className="text-sm text-destructive">{errors.city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Región *</Label>
              <Select
                value={watch('region')}
                onValueChange={(value) => setValue('region', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la región" />
                </SelectTrigger>
                <SelectContent>
                  {CHILE_CONFIG.regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.region && (
                <p className="text-sm text-destructive">{errors.region.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code">Código Postal *</Label>
              <Input
                id="postal_code"
                placeholder="7500000"
                {...register('postal_code')}
                disabled={isSubmitting}
              />
              {errors.postal_code && (
                <p className="text-sm text-destructive">{errors.postal_code.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                placeholder="Observaciones adicionales sobre el cliente..."
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
              {cliente ? 'Actualizar' : 'Crear'} Cliente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}