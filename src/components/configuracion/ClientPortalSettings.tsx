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
import { Loader2, Users, Eye, EyeOff, FileText, Truck, CreditCard, Bell, Settings } from 'lucide-react';
import { toast } from 'sonner';

const portalSettingsSchema = z.object({
  // Visibilidad de secciones
  enable_client_portal: z.boolean().default(true),
  show_dashboard: z.boolean().default(true),
  show_service_request: z.boolean().default(true),
  show_service_history: z.boolean().default(true),
  show_invoices: z.boolean().default(true),
  show_profile: z.boolean().default(true),
  
  // Configuración de servicios
  allow_service_request: z.boolean().default(true),
  require_approval: z.boolean().default(true),
  max_service_requests_per_day: z.number().min(1).max(10),
  
  // Configuración de facturas
  allow_invoice_download: z.boolean().default(true),
  allow_online_payment: z.boolean().default(true),
  
  // Notificaciones
  send_email_notifications: z.boolean().default(true),
  send_sms_notifications: z.boolean().default(false),
  
  // Personalización
  welcome_message: z.string().max(500),
  support_phone: z.string(),
  support_email: z.string().email(),
});

type PortalSettingsData = z.infer<typeof portalSettingsSchema>;

interface ClientPortalSettingsProps {
  onSave: (data: PortalSettingsData) => Promise<void>;
}

export function ClientPortalSettings({ onSave }: ClientPortalSettingsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PortalSettingsData>({
    resolver: zodResolver(portalSettingsSchema),
    defaultValues: {
      enable_client_portal: true,
      show_dashboard: true,
      show_service_request: true,
      show_service_history: true,
      show_invoices: true,
      show_profile: true,
      allow_service_request: true,
      require_approval: true,
      max_service_requests_per_day: 3,
      allow_invoice_download: true,
      allow_online_payment: true,
      send_email_notifications: true,
      send_sms_notifications: false,
      welcome_message: 'Bienvenido a su portal de cliente de TMS Grúas. Aquí podrá solicitar servicios, ver su historial y gestionar sus facturas.',
      support_phone: '+56 2 2234 5678',
      support_email: 'soporte@tmsgruas.cl',
    }
  });

  const handleFormSubmit = async (data: PortalSettingsData) => {
    setIsSubmitting(true);
    try {
      await onSave(data);
      toast.success('Configuración del portal cliente actualizada exitosamente');
    } catch (error) {
      toast.error('Error al actualizar la configuración');
    } finally {
      setIsSubmitting(false);
    }
  };

  const enableClientPortal = watch('enable_client_portal');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Configuración del Portal Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Activación Principal */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base">Activar Portal Cliente</Label>
                <p className="text-sm text-muted-foreground">
                  Habilita o deshabilita completamente el acceso al portal para clientes
                </p>
              </div>
              <Switch
                checked={watch('enable_client_portal')}
                onCheckedChange={(checked) => setValue('enable_client_portal', checked)}
                disabled={isSubmitting}
              />
            </div>

            {enableClientPortal && (
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
                          Resumen general y estadísticas del cliente
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
                        <Label>Solicitud de Servicios</Label>
                        <p className="text-sm text-muted-foreground">
                          Formulario para solicitar nuevos servicios
                        </p>
                      </div>
                      <Switch
                        checked={watch('show_service_request')}
                        onCheckedChange={(checked) => setValue('show_service_request', checked)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Historial de Servicios</Label>
                        <p className="text-sm text-muted-foreground">
                          Lista de servicios pasados y actuales
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
                        <Label>Facturas</Label>
                        <p className="text-sm text-muted-foreground">
                          Acceso a facturas y pagos
                        </p>
                      </div>
                      <Switch
                        checked={watch('show_invoices')}
                        onCheckedChange={(checked) => setValue('show_invoices', checked)}
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
                        <Label>Permitir Solicitud de Servicios</Label>
                        <p className="text-sm text-muted-foreground">
                          Los clientes pueden solicitar servicios directamente
                        </p>
                      </div>
                      <Switch
                        checked={watch('allow_service_request')}
                        onCheckedChange={(checked) => setValue('allow_service_request', checked)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Requerir Aprobación</Label>
                        <p className="text-sm text-muted-foreground">
                          Las solicitudes requieren aprobación antes de procesarse
                        </p>
                      </div>
                      <Switch
                        checked={watch('require_approval')}
                        onCheckedChange={(checked) => setValue('require_approval', checked)}
                        disabled={isSubmitting || !watch('allow_service_request')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max_service_requests_per_day">Máximo de Solicitudes por Día</Label>
                      <Input
                        id="max_service_requests_per_day"
                        type="number"
                        min="1"
                        max="10"
                        {...register('max_service_requests_per_day', { valueAsNumber: true })}
                        disabled={isSubmitting || !watch('allow_service_request')}
                      />
                      {errors.max_service_requests_per_day && (
                        <p className="text-sm text-destructive">{errors.max_service_requests_per_day.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Configuración de Facturas */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Configuración de Facturas
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Permitir Descarga de Facturas</Label>
                        <p className="text-sm text-muted-foreground">
                          Los clientes pueden descargar sus facturas en PDF
                        </p>
                      </div>
                      <Switch
                        checked={watch('allow_invoice_download')}
                        onCheckedChange={(checked) => setValue('allow_invoice_download', checked)}
                        disabled={isSubmitting || !watch('show_invoices')}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Permitir Pago en Línea</Label>
                        <p className="text-sm text-muted-foreground">
                          Los clientes pueden pagar sus facturas directamente en el portal
                        </p>
                      </div>
                      <Switch
                        checked={watch('allow_online_payment')}
                        onCheckedChange={(checked) => setValue('allow_online_payment', checked)}
                        disabled={isSubmitting || !watch('show_invoices')}
                      />
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
                          Enviar actualizaciones de servicios y facturas por email
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
                          Enviar actualizaciones de servicios y facturas por SMS
                        </p>
                      </div>
                      <Switch
                        checked={watch('send_sms_notifications')}
                        onCheckedChange={(checked) => setValue('send_sms_notifications', checked)}
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
      {enableClientPortal && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Acceso al Portal Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Información de Acceso
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                Los clientes pueden acceder al portal cliente a través de:
              </p>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• URL: <span className="font-mono">https://tmsgruas.cl/portal-cliente</span></li>
                <li>• Credenciales: Email y contraseña registrados</li>
                <li>• Usuarios de prueba: cliente@tmsgruas.com / password123</li>
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