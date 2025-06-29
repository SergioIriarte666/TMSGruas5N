import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Client } from '@/types';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Edit, 
  Save, 
  X,
  Shield,
  Bell,
  CreditCard,
  Loader2
} from 'lucide-react';
import { CHILE_CONFIG, validateRUT, formatRUT } from '@/lib/chile-config';
import { toast } from 'sonner';

const profileSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  document: z.string().min(1, 'El documento es requerido'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().min(1, 'La dirección es requerida'),
  city: z.string().min(1, 'La ciudad es requerida'),
  province: z.string().min(1, 'La región es requerida'),
  postal_code: z.string().min(1, 'El código postal es requerido'),
  notes: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ClientProfileProps {
  client: Client;
}

export function ClientProfile({ client }: ClientProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rutError, setRutError] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: client.name,
      document: client.document,
      phone: client.phone,
      email: client.email || '',
      address: client.address,
      city: client.city,
      province: client.province,
      postal_code: client.postal_code,
      notes: client.notes || '',
    }
  });

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedRUT = formatRUT(value);
    setValue('document', formattedRUT);
    
    if (value.length >= 8) {
      if (!validateRUT(value)) {
        setRutError('RUT inválido');
      } else {
        setRutError('');
      }
    } else {
      setRutError('');
    }
  };

  const handleFormSubmit = async (data: ProfileFormData) => {
    if (!validateRUT(data.document)) {
      setRutError('RUT inválido');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simular actualización del perfil
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Profile updated:', data);
      toast.success('Perfil actualizado exitosamente');
      setIsEditing(false);
    } catch (error) {
      toast.error('Error al actualizar el perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
    setRutError('');
  };

  return (
    <div className="space-y-6">
      {/* Header del Perfil */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="text-2xl">
                {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{client.name}</h2>
              <p className="text-muted-foreground">{client.document}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Cliente desde {new Date(client.created_at).toLocaleDateString('es-CL')}
              </p>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="gap-2">
                  <Edit className="w-4 h-4" />
                  Editar Perfil
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSubmit(handleFormSubmit)}
                    disabled={isSubmitting}
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Guardar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Personal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo *</Label>
                    <Input
                      id="name"
                      {...register('name')}
                      disabled={!isEditing || isSubmitting}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="document">RUT *</Label>
                    <Input
                      id="document"
                      value={watch('document')}
                      onChange={handleRutChange}
                      disabled={!isEditing || isSubmitting}
                    />
                    {(errors.document || rutError) && (
                      <p className="text-sm text-destructive">
                        {rutError || errors.document?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      id="phone"
                      {...register('phone')}
                      disabled={!isEditing || isSubmitting}
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
                      {...register('email')}
                      disabled={!isEditing || isSubmitting}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Dirección</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección *</Label>
                    <Input
                      id="address"
                      {...register('address')}
                      disabled={!isEditing || isSubmitting}
                    />
                    {errors.address && (
                      <p className="text-sm text-destructive">{errors.address.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Ciudad *</Label>
                      <Input
                        id="city"
                        {...register('city')}
                        disabled={!isEditing || isSubmitting}
                      />
                      {errors.city && (
                        <p className="text-sm text-destructive">{errors.city.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Región *</Label>
                      <Select
                        value={watch('province')}
                        onValueChange={(value) => setValue('province', value)}
                        disabled={!isEditing || isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CHILE_CONFIG.regions.map((region) => (
                            <SelectItem key={region} value={region}>
                              {region}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.province && (
                        <p className="text-sm text-destructive">{errors.province.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postal_code">Código Postal *</Label>
                      <Input
                        id="postal_code"
                        {...register('postal_code')}
                        disabled={!isEditing || isSubmitting}
                      />
                      {errors.postal_code && (
                        <p className="text-sm text-destructive">{errors.postal_code.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    rows={3}
                    {...register('notes')}
                    disabled={!isEditing || isSubmitting}
                  />
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Configuración de Cuenta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Configuración
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Bell className="w-4 h-4" />
                Notificaciones
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <CreditCard className="w-4 h-4" />
                Métodos de Pago
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Shield className="w-4 h-4" />
                Privacidad
              </Button>
            </CardContent>
          </Card>

          {/* Información de Contacto */}
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Teléfono</p>
                  <p className="text-sm text-muted-foreground">{client.phone}</p>
                </div>
              </div>
              {client.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Dirección</p>
                  <p className="text-sm text-muted-foreground">
                    {client.address}, {client.city}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Soporte */}
          <Card>
            <CardHeader>
              <CardTitle>¿Necesitas Ayuda?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos.
              </p>
              <Button variant="outline" className="w-full">
                Contactar Soporte
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}