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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Bell, Mail, MessageSquare, AlertTriangle, Clock, Calendar, FileText, Car, IdCard, Brain, Stethoscope, Receipt } from 'lucide-react';
import { toast } from 'sonner';

const notificationSchema = z.object({
  // Canales de notificación
  enable_email_notifications: z.boolean().default(true),
  enable_sms_notifications: z.boolean().default(false),
  enable_push_notifications: z.boolean().default(true),
  enable_in_app_notifications: z.boolean().default(true),
  
  // Configuración de correo electrónico
  email_sender: z.string().email('Email inválido'),
  email_subject_prefix: z.string(),
  
  // Configuración de SMS
  sms_sender_id: z.string(),
  sms_provider: z.string(),
  
  // Umbrales de alerta
  thresholds: z.object({
    license: z.object({
      warning_days: z.number().min(1).max(90),
      critical_days: z.number().min(1).max(30),
    }),
    occupational_exam: z.object({
      warning_days: z.number().min(1).max(90),
      critical_days: z.number().min(1).max(30),
    }),
    psychosensometric_exam: z.object({
      warning_days: z.number().min(1).max(90),
      critical_days: z.number().min(1).max(30),
    }),
    circulation_permit: z.object({
      warning_days: z.number().min(1).max(90),
      critical_days: z.number().min(1).max(30),
    }),
    soap: z.object({
      warning_days: z.number().min(1).max(90),
      critical_days: z.number().min(1).max(30),
    }),
    technical_review: z.object({
      warning_days: z.number().min(1).max(90),
      critical_days: z.number().min(1).max(30),
    }),
    invoice: z.object({
      warning_days: z.number().min(1).max(30),
      critical_days: z.number().min(1).max(7),
    }),
    calendar_event: z.object({
      warning_days: z.number().min(1).max(14),
      critical_days: z.number().min(1).max(3),
    }),
  }),
  
  // Notificaciones por tipo
  notifications: z.object({
    license: z.boolean().default(true),
    occupational_exam: z.boolean().default(true),
    psychosensometric_exam: z.boolean().default(true),
    circulation_permit: z.boolean().default(true),
    soap: z.boolean().default(true),
    technical_review: z.boolean().default(true),
    invoice: z.boolean().default(true),
    calendar_event: z.boolean().default(true),
    service_deadline: z.boolean().default(true),
    maintenance_schedule: z.boolean().default(true),
  }),
  
  // Destinatarios
  recipients: z.object({
    admin_email: z.string().email('Email inválido'),
    finance_email: z.string().email('Email inválido').optional(),
    operations_email: z.string().email('Email inválido').optional(),
  }),
});

type NotificationSettingsData = z.infer<typeof notificationSchema>;

interface NotificationSettingsProps {
  onSave: (data: NotificationSettingsData) => Promise<void>;
}

export function NotificationSettings({ onSave }: NotificationSettingsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NotificationSettingsData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      enable_email_notifications: true,
      enable_sms_notifications: false,
      enable_push_notifications: true,
      enable_in_app_notifications: true,
      
      email_sender: 'notificaciones@tmsgruas.cl',
      email_subject_prefix: '[TMS Grúas]',
      
      sms_sender_id: 'TMSGRUAS',
      sms_provider: 'twilio',
      
      thresholds: {
        license: {
          warning_days: 30,
          critical_days: 7,
        },
        occupational_exam: {
          warning_days: 30,
          critical_days: 7,
        },
        psychosensometric_exam: {
          warning_days: 30,
          critical_days: 7,
        },
        circulation_permit: {
          warning_days: 30,
          critical_days: 7,
        },
        soap: {
          warning_days: 30,
          critical_days: 7,
        },
        technical_review: {
          warning_days: 30,
          critical_days: 7,
        },
        invoice: {
          warning_days: 7,
          critical_days: 1,
        },
        calendar_event: {
          warning_days: 3,
          critical_days: 1,
        },
      },
      
      notifications: {
        license: true,
        occupational_exam: true,
        psychosensometric_exam: true,
        circulation_permit: true,
        soap: true,
        technical_review: true,
        invoice: true,
        calendar_event: true,
        service_deadline: true,
        maintenance_schedule: true,
      },
      
      recipients: {
        admin_email: 'admin@tmsgruas.cl',
        finance_email: 'finanzas@tmsgruas.cl',
        operations_email: 'operaciones@tmsgruas.cl',
      },
    }
  });

  const handleFormSubmit = async (data: NotificationSettingsData) => {
    setIsSubmitting(true);
    try {
      await onSave(data);
      toast.success('Configuración de notificaciones actualizada exitosamente');
    } catch (error) {
      toast.error('Error al actualizar la configuración');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Configuración de Alertas y Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="thresholds">Umbrales</TabsTrigger>
                <TabsTrigger value="recipients">Destinatarios</TabsTrigger>
              </TabsList>
              
              {/* Configuración General */}
              <TabsContent value="general" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Canales de Notificación</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <Mail className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div className="space-y-0.5">
                          <Label>Notificaciones por Email</Label>
                          <p className="text-sm text-muted-foreground">
                            Enviar alertas de vencimiento por correo electrónico
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={watch('enable_email_notifications')}
                        onCheckedChange={(checked) => setValue('enable_email_notifications', checked)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                          <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-300" />
                        </div>
                        <div className="space-y-0.5">
                          <Label>Notificaciones por SMS</Label>
                          <p className="text-sm text-muted-foreground">
                            Enviar alertas de vencimiento por mensaje de texto
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={watch('enable_sms_notifications')}
                        onCheckedChange={(checked) => setValue('enable_sms_notifications', checked)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                          <Bell className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                        </div>
                        <div className="space-y-0.5">
                          <Label>Notificaciones Push</Label>
                          <p className="text-sm text-muted-foreground">
                            Enviar alertas push al navegador o aplicación móvil
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={watch('enable_push_notifications')}
                        onCheckedChange={(checked) => setValue('enable_push_notifications', checked)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-300" />
                        </div>
                        <div className="space-y-0.5">
                          <Label>Notificaciones en la Aplicación</Label>
                          <p className="text-sm text-muted-foreground">
                            Mostrar alertas dentro del sistema
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={watch('enable_in_app_notifications')}
                        onCheckedChange={(checked) => setValue('enable_in_app_notifications', checked)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <Separator />

                  <h3 className="text-lg font-medium">Tipos de Alertas</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <IdCard className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <Label>Licencias de Conducir</Label>
                        <p className="text-sm text-muted-foreground">
                          Alertas de vencimiento de licencias
                        </p>
                      </div>
                      <Switch
                        checked={watch('notifications.license')}
                        onCheckedChange={(checked) => setValue('notifications.license', checked)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <Stethoscope className="w-5 h-5 text-green-600 dark:text-green-300" />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <Label>Exámenes Ocupacionales</Label>
                        <p className="text-sm text-muted-foreground">
                          Alertas de vencimiento de exámenes
                        </p>
                      </div>
                      <Switch
                        checked={watch('notifications.occupational_exam')}
                        onCheckedChange={(checked) => setValue('notifications.occupational_exam', checked)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <Brain className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <Label>Exámenes Psicosensotécnicos</Label>
                        <p className="text-sm text-muted-foreground">
                          Alertas de vencimiento de exámenes
                        </p>
                      </div>
                      <Switch
                        checked={watch('notifications.psychosensometric_exam')}
                        onCheckedChange={(checked) => setValue('notifications.psychosensometric_exam', checked)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                        <FileText className="w-5 h-5 text-orange-600 dark:text-orange-300" />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <Label>Permisos de Circulación</Label>
                        <p className="text-sm text-muted-foreground">
                          Alertas de vencimiento de permisos
                        </p>
                      </div>
                      <Switch
                        checked={watch('notifications.circulation_permit')}
                        onCheckedChange={(checked) => setValue('notifications.circulation_permit', checked)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                        <Car className="w-5 h-5 text-red-600 dark:text-red-300" />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <Label>SOAP</Label>
                        <p className="text-sm text-muted-foreground">
                          Alertas de vencimiento de seguros
                        </p>
                      </div>
                      <Switch
                        checked={watch('notifications.soap')}
                        onCheckedChange={(checked) => setValue('notifications.soap', checked)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-cyan-100 dark:bg-cyan-900 rounded-lg">
                        <Car className="w-5 h-5 text-cyan-600 dark:text-cyan-300" />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <Label>Revisión Técnica</Label>
                        <p className="text-sm text-muted-foreground">
                          Alertas de vencimiento de revisiones
                        </p>
                      </div>
                      <Switch
                        checked={watch('notifications.technical_review')}
                        onCheckedChange={(checked) => setValue('notifications.technical_review', checked)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                        <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <Label>Facturas</Label>
                        <p className="text-sm text-muted-foreground">
                          Alertas de vencimiento de facturas
                        </p>
                      </div>
                      <Switch
                        checked={watch('notifications.invoice')}
                        onCheckedChange={(checked) => setValue('notifications.invoice', checked)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                        <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <Label>Eventos de Calendario</Label>
                        <p className="text-sm text-muted-foreground">
                          Alertas de eventos próximos
                        </p>
                      </div>
                      <Switch
                        checked={watch('notifications.calendar_event')}
                        onCheckedChange={(checked) => setValue('notifications.calendar_event', checked)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Umbrales de Alerta */}
              <TabsContent value="thresholds" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Umbrales de Alerta (días antes del vencimiento)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Licencias */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <IdCard className="w-4 h-4" />
                          Licencias de Conducir
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="license_warning">Advertencia</Label>
                            <Input
                              id="license_warning"
                              type="number"
                              min="1"
                              max="90"
                              {...register('thresholds.license.warning_days', { valueAsNumber: true })}
                              disabled={isSubmitting}
                            />
                            {errors.thresholds?.license?.warning_days && (
                              <p className="text-sm text-destructive">{errors.thresholds.license.warning_days.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="license_critical">Crítico</Label>
                            <Input
                              id="license_critical"
                              type="number"
                              min="1"
                              max="30"
                              {...register('thresholds.license.critical_days', { valueAsNumber: true })}
                              disabled={isSubmitting}
                            />
                            {errors.thresholds?.license?.critical_days && (
                              <p className="text-sm text-destructive">{errors.thresholds.license.critical_days.message}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Exámenes Ocupacionales */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Stethoscope className="w-4 h-4" />
                          Exámenes Ocupacionales
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="occupational_warning">Advertencia</Label>
                            <Input
                              id="occupational_warning"
                              type="number"
                              min="1"
                              max="90"
                              {...register('thresholds.occupational_exam.warning_days', { valueAsNumber: true })}
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="occupational_critical">Crítico</Label>
                            <Input
                              id="occupational_critical"
                              type="number"
                              min="1"
                              max="30"
                              {...register('thresholds.occupational_exam.critical_days', { valueAsNumber: true })}
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Exámenes Psicosensotécnicos */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Brain className="w-4 h-4" />
                          Exámenes Psicosensotécnicos
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="psycho_warning">Advertencia</Label>
                            <Input
                              id="psycho_warning"
                              type="number"
                              min="1"
                              max="90"
                              {...register('thresholds.psychosensometric_exam.warning_days', { valueAsNumber: true })}
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="psycho_critical">Crítico</Label>
                            <Input
                              id="psycho_critical"
                              type="number"
                              min="1"
                              max="30"
                              {...register('thresholds.psychosensometric_exam.critical_days', { valueAsNumber: true })}
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Permisos de Circulación */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Permisos de Circulación
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="circulation_warning">Advertencia</Label>
                            <Input
                              id="circulation_warning"
                              type="number"
                              min="1"
                              max="90"
                              {...register('thresholds.circulation_permit.warning_days', { valueAsNumber: true })}
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="circulation_critical">Crítico</Label>
                            <Input
                              id="circulation_critical"
                              type="number"
                              min="1"
                              max="30"
                              {...register('thresholds.circulation_permit.critical_days', { valueAsNumber: true })}
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* SOAP */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Car className="w-4 h-4" />
                          SOAP
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="soap_warning">Advertencia</Label>
                            <Input
                              id="soap_warning"
                              type="number"
                              min="1"
                              max="90"
                              {...register('thresholds.soap.warning_days', { valueAsNumber: true })}
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="soap_critical">Crítico</Label>
                            <Input
                              id="soap_critical"
                              type="number"
                              min="1"
                              max="30"
                              {...register('thresholds.soap.critical_days', { valueAsNumber: true })}
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Revisión Técnica */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Car className="w-4 h-4" />
                          Revisión Técnica
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="technical_warning">Advertencia</Label>
                            <Input
                              id="technical_warning"
                              type="number"
                              min="1"
                              max="90"
                              {...register('thresholds.technical_review.warning_days', { valueAsNumber: true })}
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="technical_critical">Crítico</Label>
                            <Input
                              id="technical_critical"
                              type="number"
                              min="1"
                              max="30"
                              {...register('thresholds.technical_review.critical_days', { valueAsNumber: true })}
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Facturas */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Receipt className="w-4 h-4" />
                          Facturas
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="invoice_warning">Advertencia</Label>
                            <Input
                              id="invoice_warning"
                              type="number"
                              min="1"
                              max="30"
                              {...register('thresholds.invoice.warning_days', { valueAsNumber: true })}
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="invoice_critical">Crítico</Label>
                            <Input
                              id="invoice_critical"
                              type="number"
                              min="1"
                              max="7"
                              {...register('thresholds.invoice.critical_days', { valueAsNumber: true })}
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Eventos de Calendario */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Eventos de Calendario
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="calendar_warning">Advertencia</Label>
                            <Input
                              id="calendar_warning"
                              type="number"
                              min="1"
                              max="14"
                              {...register('thresholds.calendar_event.warning_days', { valueAsNumber: true })}
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="calendar_critical">Crítico</Label>
                            <Input
                              id="calendar_critical"
                              type="number"
                              min="1"
                              max="3"
                              {...register('thresholds.calendar_event.critical_days', { valueAsNumber: true })}
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              {/* Destinatarios */}
              <TabsContent value="recipients" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Destinatarios de Notificaciones</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="admin_email">Email de Administración *</Label>
                      <Input
                        id="admin_email"
                        type="email"
                        placeholder="admin@tmsgruas.cl"
                        {...register('recipients.admin_email')}
                        disabled={isSubmitting}
                      />
                      {errors.recipients?.admin_email && (
                        <p className="text-sm text-destructive">{errors.recipients.admin_email.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Recibe todas las notificaciones críticas del sistema
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="finance_email">Email de Finanzas</Label>
                      <Input
                        id="finance_email"
                        type="email"
                        placeholder="finanzas@tmsgruas.cl"
                        {...register('recipients.finance_email')}
                        disabled={isSubmitting}
                      />
                      {errors.recipients?.finance_email && (
                        <p className="text-sm text-destructive">{errors.recipients.finance_email.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Recibe notificaciones relacionadas con facturas y pagos
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="operations_email">Email de Operaciones</Label>
                      <Input
                        id="operations_email"
                        type="email"
                        placeholder="operaciones@tmsgruas.cl"
                        {...register('recipients.operations_email')}
                        disabled={isSubmitting}
                      />
                      {errors.recipients?.operations_email && (
                        <p className="text-sm text-destructive">{errors.recipients.operations_email.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Recibe notificaciones relacionadas con servicios, grúas y operadores
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <h3 className="text-lg font-medium">Configuración de Correo Electrónico</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email_sender">Email Remitente *</Label>
                      <Input
                        id="email_sender"
                        type="email"
                        placeholder="notificaciones@tmsgruas.cl"
                        {...register('email_sender')}
                        disabled={isSubmitting}
                      />
                      {errors.email_sender && (
                        <p className="text-sm text-destructive">{errors.email_sender.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email_subject_prefix">Prefijo del Asunto *</Label>
                      <Input
                        id="email_subject_prefix"
                        placeholder="[TMS Grúas]"
                        {...register('email_subject_prefix')}
                        disabled={isSubmitting}
                      />
                      {errors.email_subject_prefix && (
                        <p className="text-sm text-destructive">{errors.email_subject_prefix.message}</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <h3 className="text-lg font-medium">Configuración de SMS</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="sms_sender_id">ID de Remitente *</Label>
                      <Input
                        id="sms_sender_id"
                        placeholder="TMSGRUAS"
                        {...register('sms_sender_id')}
                        disabled={isSubmitting || !watch('enable_sms_notifications')}
                      />
                      {errors.sms_sender_id && (
                        <p className="text-sm text-destructive">{errors.sms_sender_id.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sms_provider">Proveedor de SMS *</Label>
                      <Input
                        id="sms_provider"
                        placeholder="twilio"
                        {...register('sms_provider')}
                        disabled={isSubmitting || !watch('enable_sms_notifications')}
                      />
                      {errors.sms_provider && (
                        <p className="text-sm text-destructive">{errors.sms_provider.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Configuración
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}