import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Building, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { CHILE_CONFIG, validateRUT, formatRUT } from '@/lib/chile-config';

const companySchema = z.object({
  name: z.string().min(1, 'El nombre de la empresa es requerido'),
  legal_name: z.string().min(1, 'La razón social es requerida'),
  rut: z.string().min(1, 'El RUT es requerido').refine((val) => validateRUT(val), 'RUT inválido'),
  address: z.string().min(1, 'La dirección es requerida'),
  city: z.string().min(1, 'La ciudad es requerida'),
  region: z.string().min(1, 'La región es requerida'),
  postal_code: z.string().min(1, 'El código postal es requerido'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  email: z.string().email('Email inválido'),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  description: z.string().optional(),
  // Campos específicos para Chile
  sii_activity_code: z.string().optional(),
  bank_account: z.string().optional(),
  bank_name: z.string().optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface CompanySettingsProps {
  onSave: (data: CompanyFormData) => Promise<void>;
}

export function CompanySettings({ onSave }: CompanySettingsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [rutError, setRutError] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: 'TMS Grúas Chile',
      legal_name: 'Transportes y Servicios TMS Chile SpA',
      rut: '76.123.456-7',
      address: 'Av. Providencia 1234',
      city: 'Santiago',
      region: 'Metropolitana de Santiago',
      postal_code: '7500000',
      phone: '+56 2 2234 5678',
      email: 'info@tmsgruas.cl',
      website: 'https://www.tmsgruas.cl',
      description: 'Empresa líder en servicios de grúas y transporte especializado en Chile con más de 10 años de experiencia en el mercado.',
      sii_activity_code: '602100', // Transporte de carga por carretera
      bank_account: '12345678',
      bank_name: 'Banco de Chile',
    }
  });

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedRUT = formatRUT(value);
    setValue('rut', formattedRUT);
    
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

  const handleFormSubmit = async (data: CompanyFormData) => {
    if (!validateRUT(data.rut)) {
      setRutError('RUT inválido');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(data);
      toast.success('Configuración de empresa actualizada exitosamente');
    } catch (error) {
      toast.error('Error al actualizar la configuración');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogo(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5" />
          Información de la Empresa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Logo Section */}
          <div className="space-y-4">
            <Label>Logo de la Empresa</Label>
            <div className="flex items-center gap-4">
              {logo ? (
                <div className="relative">
                  <img 
                    src={logo} 
                    alt="Logo" 
                    className="w-24 h-24 object-contain border rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 w-6 h-6"
                    onClick={removeLogo}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <Building className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" className="gap-2" asChild>
                    <span>
                      <Upload className="w-4 h-4" />
                      Subir Logo
                    </span>
                  </Button>
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos: JPG, PNG. Tamaño máximo: 2MB
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Company Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Comercial *</Label>
              <Input
                id="name"
                {...register('name')}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="legal_name">Razón Social *</Label>
              <Input
                id="legal_name"
                {...register('legal_name')}
                disabled={isSubmitting}
              />
              {errors.legal_name && (
                <p className="text-sm text-destructive">{errors.legal_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rut">RUT *</Label>
              <Input
                id="rut"
                placeholder="76.123.456-7"
                value={watch('rut')}
                onChange={handleRutChange}
                disabled={isSubmitting}
              />
              {(errors.rut || rutError) && (
                <p className="text-sm text-destructive">{rutError || errors.rut?.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                id="phone"
                placeholder="+56 2 2234 5678"
                {...register('phone')}
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Sitio Web</Label>
              <Input
                id="website"
                placeholder="https://www.empresa.cl"
                {...register('website')}
                disabled={isSubmitting}
              />
              {errors.website && (
                <p className="text-sm text-destructive">{errors.website.message}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Dirección</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Dirección *</Label>
                <Input
                  id="address"
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
                  {...register('city')}
                  disabled={isSubmitting}
                />
                {errors.city && (
                  <p className="text-sm text-destructive">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Región *</Label>
                <select
                  id="region"
                  {...register('region')}
                  disabled={isSubmitting}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecciona una región</option>
                  {CHILE_CONFIG.regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
                {errors.region && (
                  <p className="text-sm text-destructive">{errors.region.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="postal_code">Código Postal *</Label>
                <Input
                  id="postal_code"
                  {...register('postal_code')}
                  disabled={isSubmitting}
                />
                {errors.postal_code && (
                  <p className="text-sm text-destructive">{errors.postal_code.message}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Tax and Banking Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información Tributaria y Bancaria</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sii_activity_code">Código de Actividad SII</Label>
                <Input
                  id="sii_activity_code"
                  placeholder="602100"
                  {...register('sii_activity_code')}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  Código de actividad económica según el SII
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_name">Banco</Label>
                <Input
                  id="bank_name"
                  placeholder="Banco de Chile"
                  {...register('bank_name')}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_account">Número de Cuenta</Label>
                <Input
                  id="bank_account"
                  placeholder="12345678"
                  {...register('bank_account')}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción de la Empresa</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Describe tu empresa, servicios y experiencia..."
              {...register('description')}
              disabled={isSubmitting}
            />
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
  );
}