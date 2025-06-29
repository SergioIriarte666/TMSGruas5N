import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, UserCheck, Eye, EyeOff, FileText, Truck, MapPin, Bell, Settings } from 'lucide-react';
import { toast } from 'sonner';

const operatorPortalSettingsSchema = z.object({
  // Visibilidad de secciones
  enable_operator_portal: z.boolean().default(true),
  show_dashboard: z.boolean().default(true),
  show_active_service: z.boolean().default(true),
  show_service_history: z.boolean().default(true),
  show_inspections: z.boolean().default(true),
  show_profile: z.boolean().default(true),
  
  // Configuración de servicios
  allow_service_status_update: z.boolean().default(true),
  allow_service_completion: z.boolean().default(true),
  require_photos: z.boolean().default(true),
  require_signature: z.boolean().default(true),
  
  // Configuración de ubicación
  enable_location_tracking: z.boolean().default(true),
  location_update_interval: z.number().min(1).max(60),
  
  // Notificaciones
  send_email_notifications: z.boolean().default(true),
  send_sms_notifications: z.boolean().default(true),
  send_push_notifications: z.boolean().default(true),
  
  // Personalización
  welcome_message: z.string().max(500),
  support_phone: z.string(),
  support_email: z.string().email(),
});

type OperatorPortalSettingsData = z.infer<typeof operatorPortalSettingsSchema>;

interface OperatorPortalSettingsProps {
  onSave: (data: OperatorPortalSettingsData) => Promise<void>;
}

export function OperatorPortalSettings({ onSave }: OperatorPortalSettingsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OperatorPortalSettingsData>({
    resolver: zodResolver(operatorPortalSettingsSchema),
    defaultValues: {
      enable_operator_portal: true,
      show_dashboard: true,
      show_active_service: true,
      show_service_history: true,
      show_inspections: true,
      show_profile: true,
      allow_service_status_update: true,
      allow_service_completion: true,
      require_photos: true,
      require_signature: true,
      enable_location_tracking: true,
      location_update_interval: 5,
      send_email_notifications: true,
      send_sms_notifications: true,
      send_push_notifications: true,
      welcome_message: 'Bienvenido al portal de operadores de TMS Grúas. Aquí podrás gestionar tus servicios asignados y completar inspecciones.',
      support_phone: '+56 2 2234 5678',
      support_email: 'soporte@tmsgruas.cl',
    }
  });

  const handleFormSubmit = async (data: OperatorPortalSettingsData) => {
    setIsSubmitting(true);
    try {
      await onSave(data);
      toast.success('Configuración del portal operador actualizada exitosamente');
    } catch (error) {
      toast.error('Error al actualizar la configuración');
    } finally {
      setIsSubmitting(false);
    }
  };

  const enableOperatorPortal = watch('enable_operator_portal');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Configuración del Portal Operador
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Activación Principal */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base">Activar Portal Operador</Label>
                <p className="text-sm text-muted-foreground">
                  Habilita o deshabilita completamente el acceso al portal para operadores
                </p>
              </div>
              <Switch
                checked={watch('enable_operator_portal')}
                onCheckedChange={(checked) => setValue('enable_operator_portal', checked)}
                disabled={isSubmitting}
              />
            </div>

            {enableOperatorPortal && (
              <>
                {/* Visibilidad de Secciones */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Visibilidad de Secciones
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Dashboard</Label>
                        <p className="text-sm text-muted-foreground">
                          Resumen general y estadísticas del operador
                        </p>
                      </div>
                      <Switch
                        checked={watch('show_dashboard')}
                        onCheckedChange={(checked) => setValue('show_dashboard', checked)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Servicio Activo</Label>
                        <p className="text-sm text-muted-foreground">
                          Detalles y gestión del servicio actual
                        </p>
                      </div>
                      <Switch
                        checked={watch('show_active_service')}
                        onCheckedChange={(checked) => setValue('show_active_service', checked)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Historial de Servicios</Label>
                        <p className="text-sm text-muted-foreground">
                          Lista de servicios pasados y completados
                        </p>
                      </div>
                      <Switch
                        checked={watch('show_service_history')}
                        onCheckedChange={(checked) => setValue('show_service_history', checked)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Inspecciones</Label>
                        <p className="text-sm text-muted-foreground">
                          Formularios de inspección de vehículos
                        </p>
                      </div>
                      <Switch
                        checked={watch('show_inspections')}
                        onCheckedChange={(checked) => setValue('show_inspections', checked)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Perfil</Label>
                        <p className="text-sm text-muted-foreground">
                          Gestión de información personal
                        </p>
                      </div>
                      <Switch
                        checked={watch('show_profile')}
                        onCheckedChange={(checked) => setValue('show_profile', checked)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Configuración de Servicios */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Configuración de Servicios
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Permitir Actualización de Estado</Label>
                        <p className="text-sm text-muted-foreground">
                          Los operadores pueden cambiar el estado de los servicios
                        </p>
                      </div>
                      <Switch
                        checked={watch('allow_service_status_update')}
                        onCheckedChange={(checked) => setValue('allow_service_status_update', checked)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Permitir Completar Servicios</Label>
                        <p className="text-sm text-muted-foreground">
                          Los operadores pueden marcar servicios como completados
                        </p>
                      </div>
                      <Switch
                        checked={watch('allow_service_completion')}
                        onCheckedChange={(checked) => setValue('allow_service_completion', checked)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Requerir Fotos</Label>
                        <p className="text-sm text-muted-foreground">
                          Exigir fotos antes y después del servicio
                        </p>
                      </div>
                      <Switch
                        checked={watch('require_photos')}
                        onCheckedChange={(checked) => setValue('require_photos', checked)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Requerir Firma</Label>
                        <p className="text-sm text-muted-foreground">
                          Exigir firma del cliente al completar el servicio
                        </p>
                      </div>
                      <Switch
                        checked={watch('require_signature')}
                        onCheckedChange={(checked) => setValue('require_signature', checked)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Configuración de Ubicación */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Configuración de Ubicación
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Seguimiento de Ubicación</Label>
                        <p className="text-sm text-muted-foreground">
                          Rastrear la ubicación del operador durante el servicio
                        </p>
                      </div>
                      <Switch
                        checked={watch('enable_location_tracking')}
                        onCheckedChange={(checked) => setValue('enable_location_tracking', checked)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location_update_interval">Intervalo de Actualización (minutos)</Label>
                      <Input
                        id="location_update_interval"
                        type="number"
                        min="1"
                        max="60"
                        {...register('location_update_interval', { valueAsNumber: true })}
                        disabled={isSubmitting || !watch('enable_location_tracking')}
                      />
                      {errors.location_update_interval && (
                        <p className="text-sm text-destructive">{errors.location_update_interval.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Notificaciones */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notificaciones
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notificaciones por Email</Label>
                        <p className="text-sm text-muted-foreground">
                          Enviar actualizaciones de servicios por email
                        </p>
                      </div>
                      <Switch
                        checked={watch('send_email_notifications')}
                        onCheckedChange={(checked) => setValue('send_email_notifications', checked)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notificaciones por SMS</Label>
                        <p className="text-sm text-muted-foreground">
                          Enviar actualizaciones de servicios por SMS
                        </p>
                      </div>
                      <Switch
                        checked={watch('send_sms_notifications')}
                        onCheckedChange={(checked) => setValue('send_sms_notifications', checked)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notificaciones Push</Label>
                        <p className="text-sm text-muted-foreground">
                          Enviar notificaciones push a la aplicación móvil
                        </p>
                      </div>
                      <Switch
                        checked={watch('send_push_notifications')}
                        onCheckedChange={(checked) => setValue('send_push_notifications', checked)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Personalización */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Personalización
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="welcome_message">Mensaje de Bienvenida</Label>
                      <Textarea
                        id="welcome_message"
                        rows={3}
                        {...register('welcome_message')}
                        disabled={isSubmitting}
                      />
                      {errors.welcome_message && (
                        <p className="text-sm text-destructive">{errors.welcome_message.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="support_phone">Teléfono de Soporte</Label>
                        <Input
                          id="support_phone"
                          {...register('support_phone')}
                          disabled={isSubmitting}
                        />
                        {errors.support_phone && (
                          <p className="text-sm text-destructive">{errors.support_phone.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="support_email">Email de Soporte</Label>
                        <Input
                          id="support_email"
                          type="email"
                          {...register('support_email')}
                          disabled={isSubmitting}
                        />
                        {errors.support_email && (
                          <p className="text-sm text-destructive">{errors.support_email.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Configuración
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Información de Acceso */}
      {enableOperatorPortal && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Acceso al Portal Operador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Información de Acceso
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                Los operadores pueden acceder al portal a través de:
              </p>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• URL: <span className="font-mono">https://tmsgruas.cl/portal-operador</span></li>
                <li>• Credenciales: Email y contraseña registrados</li>
                <li>• Usuarios de prueba: operator@tmsgruas.com / password123</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="gap-2">
                <Eye className="w-4 h-4" />
                Vista Previa del Portal
              </Button>
              <Button variant="outline" className="gap-2">
                <EyeOff className="w-4 h-4" />
                Deshabilitar Temporalmente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}