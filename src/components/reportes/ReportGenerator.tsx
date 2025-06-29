import React, { useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Report } from '@/types';
import { Loader2, FileText, Download, Calendar, Filter } from 'lucide-react';

const reportSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  type: z.enum(['services', 'financial', 'operators', 'vehicles']),
  date_from: z.string().min(1, 'Fecha inicial requerida'),
  date_to: z.string().min(1, 'Fecha final requerida'),
  format: z.enum(['pdf', 'excel', 'csv']),
  include_charts: z.boolean().default(true),
  filters: z.object({
    status: z.array(z.string()).optional(),
    operators: z.array(z.string()).optional(),
    clients: z.array(z.string()).optional(),
    service_types: z.array(z.string()).optional(),
  }).optional()
});

type ReportFormData = z.infer<typeof reportSchema>;

interface ReportGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: ReportFormData) => Promise<void>;
}

export function ReportGenerator({ isOpen, onClose, onGenerate }: ReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    status: [],
    operators: [],
    clients: [],
    service_types: []
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      name: '',
      type: 'services',
      date_from: '',
      date_to: '',
      format: 'pdf',
      include_charts: true,
      filters: {
        status: [],
        operators: [],
        clients: [],
        service_types: []
      }
    }
  });

  const handleFormSubmit = async (data: ReportFormData) => {
    setIsGenerating(true);
    try {
      await onGenerate({
        ...data,
        filters: selectedFilters
      });
      onClose();
      reset();
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const reportTypes = {
    services: 'Servicios',
    financial: 'Financiero',
    operators: 'Operadores',
    vehicles: 'Vehículos'
  };

  const formats = {
    pdf: 'PDF',
    excel: 'Excel',
    csv: 'CSV'
  };

  const statusOptions = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'assigned', label: 'Asignado' },
    { value: 'in_progress', label: 'En Progreso' },
    { value: 'completed', label: 'Completado' },
    { value: 'cancelled', label: 'Cancelado' }
  ];

  const serviceTypeOptions = [
    { value: 'tow', label: 'Remolque' },
    { value: 'taxi', label: 'Taxi' },
    { value: 'transport', label: 'Transporte' },
    { value: 'assistance', label: 'Asistencia' }
  ];

  const operatorOptions = [
    { value: '1', label: 'Juan Operador' },
    { value: '2', label: 'Pedro Conductor' },
    { value: '3', label: 'Carlos Chofer' }
  ];

  const clientOptions = [
    { value: '1', label: 'María González' },
    { value: '2', label: 'Carlos Rodriguez' },
    { value: '3', label: 'Ana Martínez' }
  ];

  const handleFilterChange = (filterType: string, value: string, checked: boolean) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: checked 
        ? [...(prev[filterType] || []), value]
        : (prev[filterType] || []).filter(item => item !== value)
    }));
  };

  const getReportDescription = (type: string) => {
    const descriptions = {
      services: 'Incluye estadísticas de servicios, tiempos de respuesta, y análisis por tipo de servicio',
      financial: 'Análisis de ingresos, costos, rentabilidad y facturación por período',
      operators: 'Rendimiento de operadores, servicios completados y eficiencia',
      vehicles: 'Estado de flota, mantenimientos y utilización de vehículos'
    };
    return descriptions[type as keyof typeof descriptions] || '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Generar Reporte
          </DialogTitle>
          <DialogDescription>
            Configura los parámetros para generar un reporte personalizado
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Reporte *</Label>
              <Input
                id="name"
                placeholder="Ej: Reporte Mensual Enero 2024"
                {...register('name')}
                disabled={isGenerating}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tipo de Reporte *</Label>
              <Select
                value={watch('type')}
                onValueChange={(value) => setValue('type', value as any)}
                disabled={isGenerating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(reportTypes).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_from">Fecha Desde *</Label>
              <Input
                id="date_from"
                type="date"
                {...register('date_from')}
                disabled={isGenerating}
              />
              {errors.date_from && (
                <p className="text-sm text-destructive">{errors.date_from.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_to">Fecha Hasta *</Label>
              <Input
                id="date_to"
                type="date"
                {...register('date_to')}
                disabled={isGenerating}
              />
              {errors.date_to && (
                <p className="text-sm text-destructive">{errors.date_to.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Formato *</Label>
              <Select
                value={watch('format')}
                onValueChange={(value) => setValue('format', value as any)}
                disabled={isGenerating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(formats).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include_charts"
                  checked={watch('include_charts')}
                  onCheckedChange={(checked) => setValue('include_charts', !!checked)}
                  disabled={isGenerating}
                />
                <Label htmlFor="include_charts">Incluir gráficos</Label>
              </div>
            </div>
          </div>

          {/* Report Description */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                <strong>Descripción:</strong> {getReportDescription(watch('type'))}
              </p>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros Avanzados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status Filter */}
              {(watch('type') === 'services' || watch('type') === 'financial') && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Estado de Servicios</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {statusOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${option.value}`}
                          checked={selectedFilters.status?.includes(option.value)}
                          onCheckedChange={(checked) => 
                            handleFilterChange('status', option.value, !!checked)
                          }
                          disabled={isGenerating}
                        />
                        <Label htmlFor={`status-${option.value}`} className="text-sm">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Type Filter */}
              {watch('type') === 'services' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tipo de Servicio</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {serviceTypeOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`service-type-${option.value}`}
                          checked={selectedFilters.service_types?.includes(option.value)}
                          onCheckedChange={(checked) => 
                            handleFilterChange('service_types', option.value, !!checked)
                          }
                          disabled={isGenerating}
                        />
                        <Label htmlFor={`service-type-${option.value}`} className="text-sm">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Operators Filter */}
              {(watch('type') === 'services' || watch('type') === 'operators') && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Operadores</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {operatorOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`operator-${option.value}`}
                          checked={selectedFilters.operators?.includes(option.value)}
                          onCheckedChange={(checked) => 
                            handleFilterChange('operators', option.value, !!checked)
                          }
                          disabled={isGenerating}
                        />
                        <Label htmlFor={`operator-${option.value}`} className="text-sm">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clients Filter */}
              {(watch('type') === 'services' || watch('type') === 'financial') && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Clientes</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {clientOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`client-${option.value}`}
                          checked={selectedFilters.clients?.includes(option.value)}
                          onCheckedChange={(checked) => 
                            handleFilterChange('clients', option.value, !!checked)
                          }
                          disabled={isGenerating}
                        />
                        <Label htmlFor={`client-${option.value}`} className="text-sm">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isGenerating}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isGenerating}>
              {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Download className="mr-2 h-4 w-4" />
              Generar Reporte
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}