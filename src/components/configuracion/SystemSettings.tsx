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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Settings, Bell, Shield, Clock } from 'lucide-react';
import { toast } from 'sonner';

const systemSchema = z.object({
  timezone: z.string().min(1, 'La zona horaria es requerida'),
  currency: z.string().min(1, 'La moneda es requerida'),
  date_format: z.string().min(1, 'El formato de fecha es requerido'),
  language: z.string().min(1, 'El idioma es requerido'),
  auto_backup: z.boolean(),
  backup_frequency: z.string(),
  email_notifications: z.boolean(),
  sms_notifications: z.boolean(),
  push_notifications: z.boolean(),
  session_timeout: z.number().min(5).max(480),
  max_login_attempts: z.number().min(3).max(10),
  password_expiry_days: z.number().min(30).max(365),
  require_2fa: z.boolean(),
});

type SystemFormData = z.infer<typeof systemSchema>;

interface SystemSettingsProps {
  onSave: (data: SystemFormData) => Promise<void>;
}

export function SystemSettings({ onSave }: SystemSettingsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SystemFormData>({
    resolver: zodResolver(systemSchema),
    defaultValues: {
      timezone: 'America/Argentina/Buenos_Aires',
      currency: 'ARS',
      date_format: 'DD/MM/YYYY',
      language: 'es',
      auto_backup: true,
      backup_frequency: 'daily',
      email_notifications: true,
      sms_notifications: false,
      push_notifications: true,
      session_timeout: 60,
      max_login_attempts: 5,
      password_expiry_days: 90,
      require_2fa: false,
    }
  });

  const handleFormSubmit = async (data: SystemFormData) => {
    setIsSubmitting(true);
    try {
      await onSave(data);
      toast.success('Configuración del sistema actualizada exitosamente');
    } catch (error) {
      toast.error('Error al actualizar la configuración');
    } finally {
      setIsSubmitting(false);
    }
  };

  const timezones = [
    { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (GMT-3)' },
    { value: 'America/Argentina/Cordoba', label: 'Córdoba (GMT-3)' },
    { value: 'America/Argentina/Mendoza', label: 'Mendoza (GMT-3)' },
    { value: 'UTC', label: 'UTC (GMT+0)' },
  ];

  const currencies = [
    { value: 'ARS', label: 'Peso Argentino (ARS)' },
    { value: 'USD', label: 'Dólar Estadounidense (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
  ];

  const dateFormats = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  ];

  const languages = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
    { value: 'pt', label: 'Português' },
  ];

  const backupFrequencies = [
    { value: 'hourly', label: 'Cada hora' },
    { value: 'daily', label: 'Diario' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensual' },
  ];

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuración General
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Zona Horaria *</Label>
                <Select
                  value={watch('timezone')}
                  onValueChange={(value) => setValue('timezone', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Moneda *</Label>
                <Select
                  value={watch('currency')}
                  onValueChange={(value) => setValue('currency', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Formato de Fecha *</Label>
                <Select
                  value={watch('date_format')}
                  onValueChange={(value) => setValue('date_format', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dateFormats.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Idioma *</Label>
                <Select
                  value={watch('language')}
                  onValueChange={(value) => setValue('language', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Backup Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Respaldos Automáticos
              </h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Respaldos Automáticos</Label>
                  <p className="text-sm text-muted-foreground">
                    Crear respaldos automáticos de la base de datos
                  </p>
                </div>
                <Switch
                  checked={watch('auto_backup')}
                  onCheckedChange={(checked) => setValue('auto_backup', checked)}
                  disabled={isSubmitting}
                />
              </div>

              {watch('auto_backup') && (
                <div className="space-y-2">
                  <Label>Frecuencia de Respaldo</Label>
                  <Select
                    value={watch('backup_frequency')}
                    onValueChange={(value) => setValue('backup_frequency', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full md:w-[300px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {backupFrequencies.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Separator />

            {/* Notification Settings */}
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
                      Recibir notificaciones importantes por correo electrónico
                    </p>
                  </div>
                  <Switch
                    checked={watch('email_notifications')}
                    onCheckedChange={(checked) => setValue('email_notifications', checked)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones por SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibir alertas urgentes por mensaje de texto
                    </p>
                  </div>
                  <Switch
                    checked={watch('sms_notifications')}
                    onCheckedChange={(checked) => setValue('sms_notifications', checked)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibir notificaciones en tiempo real en el navegador
                    </p>
                  </div>
                  <Switch
                    checked={watch('push_notifications')}
                    onCheckedChange={(checked) => setValue('push_notifications', checked)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Security Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Seguridad
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session_timeout">Tiempo de Sesión (minutos) *</Label>
                  <Input
                    id="session_timeout"
                    type="number"
                    min="5"
                    max="480"
                    {...register('session_timeout', { valueAsNumber: true })}
                    disabled={isSubmitting}
                  />
                  {errors.session_timeout && (
                    <p className="text-sm text-destructive">{errors.session_timeout.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_login_attempts">Máximo Intentos de Login *</Label>
                  <Input
                    id="max_login_attempts"
                    type="number"
                    min="3"
                    max="10"
                    {...register('max_login_attempts', { valueAsNumber: true })}
                    disabled={isSubmitting}
                  />
                  {errors.max_login_attempts && (
                    <p className="text-sm text-destructive">{errors.max_login_attempts.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_expiry_days">Expiración de Contraseña (días) *</Label>
                  <Input
                    id="password_expiry_days"
                    type="number"
                    min="30"
                    max="365"
                    {...register('password_expiry_days', { valueAsNumber: true })}
                    disabled={isSubmitting}
                  />
                  {errors.password_expiry_days && (
                    <p className="text-sm text-destructive">{errors.password_expiry_days.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Autenticación de Dos Factores</Label>
                  <p className="text-sm text-muted-foreground">
                    Requerir verificación adicional para todos los usuarios
                  </p>
                </div>
                <Switch
                  checked={watch('require_2fa')}
                  onCheckedChange={(checked) => setValue('require_2fa', checked)}
                  disabled={isSubmitting}
                />
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
    </div>
  );
}