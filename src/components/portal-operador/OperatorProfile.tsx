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
import { Badge } from '@/components/ui/badge';
import { User } from '@/types';
import { 
  User as UserIcon, 
  Phone, 
  Mail, 
  Edit, 
  Save, 
  X,
  Shield,
  Bell,
  Truck,
  Loader2,
  Calendar,
  Clock,
  FileText,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

const profileSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  emergency_contact: z.string().optional(),
  emergency_phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface OperatorProfileProps {
  operator?: User & { 
    license_number?: string; 
    license_expiry?: string; 
    emergency_contact?: string; 
    emergency_phone?: string; 
    address?: string;
    notes?: string;
  };
}

export function OperatorProfile({ operator }: OperatorProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Datos de ejemplo para el operador si no se proporciona
  const defaultOperator = {
    id: '2',
    email: 'juan@tmsgruas.com',
    name: 'Juan Operador',
    role: 'operator',
    phone: '+54 11 8765-4321',
    license_number: '87654321',
    license_expiry: '2024-06-30',
    emergency_contact: 'Ana Operador',
    emergency_phone: '+54 11 1111-1111',
    address: 'Av. Rivadavia 1234, Buenos Aires',
    notes: 'Especialista en remolques de vehículos pesados',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-25T08:15:00Z'
  };

  const currentOperator = operator || defaultOperator;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentOperator.name,
      email: currentOperator.email,
      phone: currentOperator.phone || '',
      emergency_contact: currentOperator.emergency_contact || '',
      emergency_phone: currentOperator.emergency_phone || '',
      address: currentOperator.address || '',
      notes: currentOperator.notes || '',
    }
  });

  const handleFormSubmit = async (data: ProfileFormData) => {
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
  };

  // Verificar si la licencia está por vencer (menos de 30 días)
  const isLicenseExpiring = () => {
    if (!currentOperator.license_expiry) return false;
    const expiry = new Date(currentOperator.license_expiry);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  // Verificar si la licencia está vencida
  const isLicenseExpired = () => {
    if (!currentOperator.license_expiry) return false;
    const expiry = new Date(currentOperator.license_expiry);
    const today = new Date();
    return expiry < today;
  };

  return (
    <div className="space-y-6">
      {/* Header del Perfil */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="text-2xl">
                {currentOperator.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{currentOperator.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  Operador
                </Badge>
                <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  Activo
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Operador desde {new Date(currentOperator.created_at).toLocaleDateString('es-CL')}
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
                <UserIcon className="w-5 h-5" />
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
                    <Label htmlFor="email">Email *</Label>
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
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      {...register('address')}
                      disabled={!isEditing || isSubmitting}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Contacto de Emergencia</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact">Nombre</Label>
                      <Input
                        id="emergency_contact"
                        {...register('emergency_contact')}
                        disabled={!isEditing || isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergency_phone">Teléfono</Label>
                      <Input
                        id="emergency_phone"
                        {...register('emergency_phone')}
                        disabled={!isEditing || isSubmitting}
                      />
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

          {/* Licencia de Conducir */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Licencia de Conducir
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">Número de Licencia</Label>
                  <p className="font-medium">{currentOperator.license_number || 'No especificado'}</p>
                </div>
                <div>
                  <Label className="mb-2 block">Fecha de Vencimiento</Label>
                  <div className="flex items-center gap-2">
                    <p className={`font-medium ${
                      isLicenseExpired() ? 'text-red-600' : 
                      isLicenseExpiring() ? 'text-orange-600' : ''
                    }`}>
                      {currentOperator.license_expiry 
                        ? new Date(currentOperator.license_expiry).toLocaleDateString('es-CL')
                        : 'No especificado'
                      }
                    </p>
                    {isLicenseExpired() && (
                      <Badge variant="destructive">Vencida</Badge>
                    )}
                    {isLicenseExpiring() && !isLicenseExpired() && (
                      <Badge variant="outline" className="bg-orange-100 text-orange-800">Por vencer</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Recuerda mantener tu licencia de conducir al día. Si está por vencer, contacta con recursos humanos para renovarla.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Estadísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Estadísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Servicios Hoy</span>
                </div>
                <Badge variant="outline">3</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Esta Semana</span>
                </div>
                <Badge variant="outline">12</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Completados</span>
                </div>
                <Badge variant="outline">45</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Eficiencia</span>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-800">98%</Badge>
              </div>
            </CardContent>
          </Card>

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
                <Shield className="w-4 h-4" />
                Cambiar Contraseña
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
                  <p className="text-sm text-muted-foreground">{currentOperator.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{currentOperator.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Componente Star interno para no tener que importar
function Star({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}