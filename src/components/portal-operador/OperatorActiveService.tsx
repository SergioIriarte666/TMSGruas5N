import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Service } from '@/types';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Camera,
  FileText,
  Play,
  Pause,
  Square,
  Truck,
  User,
  Calendar,
  DollarSign,
  Upload,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface OperatorActiveServiceProps {
  service: Service;
  config: any;
}

export function OperatorActiveService({ service, config }: OperatorActiveServiceProps) {
  const [status, setStatus] = useState<Service['status']>(service.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notes, setNotes] = useState('');
  const [isInspectionOpen, setIsInspectionOpen] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);

  const getStatusBadge = (status: Service['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };

    const labels = {
      pending: 'Pendiente',
      assigned: 'Asignado',
      in_progress: 'En Progreso',
      completed: 'Completado',
      cancelled: 'Cancelado'
    };

    return (
      <Badge variant="outline" className={colors[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const handleStatusUpdate = async (newStatus: Service['status']) => {
    if (!config.allow_service_status_update) {
      toast.error('No tienes permisos para actualizar el estado del servicio');
      return;
    }

    if (newStatus === 'completed' && !config.allow_service_completion) {
      toast.error('No tienes permisos para completar servicios');
      return;
    }

    setIsUpdating(true);
    try {
      // Simular actualización de estado
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStatus(newStatus);
      toast.success(`Estado actualizado a: ${newStatus}`);
    } catch (error) {
      toast.error('Error al actualizar el estado');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedPhotos(Array.from(files));
      toast.success(`${files.length} fotos seleccionadas`);
    }
  };

  const handleSubmitInspection = async () => {
    if (config.require_photos && selectedPhotos.length === 0) {
      toast.error('Debes subir fotos para completar la inspección');
      return;
    }

    setIsUpdating(true);
    try {
      // Simular envío de inspección
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Inspección enviada correctamente');
      setIsInspectionOpen(false);
      setSelectedPhotos([]);
      setNotes('');
    } catch (error) {
      toast.error('Error al enviar la inspección');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Servicio Actual
            </CardTitle>
            {getStatusBadge(status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Información del Servicio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Número de Servicio</p>
              <p className="font-semibold text-lg">{service.service_number}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tipo de Servicio</p>
              <p className="font-semibold">
                {service.service_type === 'tow' ? 'Remolque' : 
                 service.service_type === 'taxi' ? 'Taxi de Grúa' : 
                 service.service_type === 'transport' ? 'Transporte' : 'Asistencia'}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Descripción</p>
              <p className="font-medium">{service.description}</p>
            </div>
          </div>

          {/* Información del Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="w-4 h-4" />
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Carlos Rodriguez</p>
                  <p className="text-sm text-muted-foreground">RUT: 98.765.432-1</p>
                </div>
                <Button size="sm" className="gap-2">
                  <Phone className="w-4 h-4" />
                  Llamar
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Teléfono: +56 9 8765 4321</p>
                <p>Email: carlos.rodriguez@email.com</p>
              </div>
            </CardContent>
          </Card>

          {/* Ubicaciones */}
          <div className="space-y-3">
            <h3 className="font-medium">Ubicaciones</h3>
            
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-600">Origen</p>
                <p className="text-sm">{service.origin_address}</p>
              </div>
              <Button size="sm" variant="outline" className="gap-2">
                <Navigation className="w-4 h-4" />
                Navegar
              </Button>
            </div>

            {service.destination_address && (
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-600">Destino</p>
                  <p className="text-sm">{service.destination_address}</p>
                </div>
                <Button size="sm" variant="outline" className="gap-2">
                  <Navigation className="w-4 h-4" />
                  Navegar
                </Button>
              </div>
            )}
          </div>

          {/* Detalles Adicionales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Fecha y Hora</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <p className="font-medium">
                  {new Date(service.service_date).toLocaleDateString('es-CL')} {service.requested_time}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Distancia</p>
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-muted-foreground" />
                <p className="font-medium">{service.distance_km || 0} km</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Costo Total</p>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <p className="font-medium">${service.total_cost.toLocaleString('es-CL')}</p>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="space-y-4">
            <h3 className="font-medium">Acciones</h3>
            
            {/* Botones de Control de Servicio */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {status === 'assigned' && config.allow_service_status_update && (
                <Button 
                  onClick={() => handleStatusUpdate('in_progress')} 
                  disabled={isUpdating}
                  className="gap-2"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Iniciar
                </Button>
              )}
              
              {status === 'in_progress' && config.allow_service_status_update && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => handleStatusUpdate('assigned')} 
                    disabled={isUpdating}
                    className="gap-2"
                  >
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pause className="w-4 h-4" />}
                    Pausar
                  </Button>
                  
                  {config.allow_service_completion && (
                    <Button 
                      variant="default" 
                      onClick={() => {
                        if (config.require_photos || config.require_signature) {
                          setIsInspectionOpen(true);
                        } else {
                          handleStatusUpdate('completed');
                        }
                      }} 
                      disabled={isUpdating}
                      className="gap-2"
                    >
                      {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Completar
                    </Button>
                  )}
                </>
              )}
              
              {(status === 'assigned' || status === 'in_progress') && config.allow_service_status_update && (
                <Button 
                  variant="destructive" 
                  onClick={() => handleStatusUpdate('cancelled')} 
                  disabled={isUpdating}
                  className="gap-2"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" />}
                  Cancelar
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => setIsInspectionOpen(true)} 
                disabled={isUpdating}
                className="gap-2"
              >
                <Camera className="w-4 h-4" />
                Fotos
              </Button>
              
              <Button 
                variant="outline" 
                disabled={isUpdating}
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                Inspección
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulario de Inspección/Finalización */}
      {isInspectionOpen && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                {status === 'in_progress' && config.allow_service_completion ? 'Completar Servicio' : 'Inspección'}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsInspectionOpen(false)}
                disabled={isUpdating}
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Fotos */}
            {config.require_photos && (
              <div className="space-y-3">
                <Label className="font-medium">Fotos del Servicio</Label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    {selectedPhotos.length > 0 
                      ? `${selectedPhotos.length} fotos seleccionadas` 
                      : 'Sube fotos del vehículo y servicio'}
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    disabled={isUpdating}
                    asChild
                  >
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      Subir Fotos
                    </label>
                  </Button>
                </div>
              </div>
            )}

            {/* Notas */}
            <div className="space-y-2">
              <Label className="font-medium">Notas del Servicio</Label>
              <Textarea
                placeholder="Describe cómo se realizó el servicio, problemas encontrados, etc."
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isUpdating}
              />
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsInspectionOpen(false)}
                disabled={isUpdating}
                className="flex-1"
              >
                Cancelar
              </Button>
              
              <Button
                onClick={handleSubmitInspection}
                disabled={isUpdating || (config.require_photos && selectedPhotos.length === 0)}
                className="flex-1 gap-2"
              >
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {status === 'in_progress' && config.allow_service_completion ? 'Completar Servicio' : 'Guardar Inspección'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Componente Label interno para no tener que importar
function Label({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={`text-sm font-medium ${className || ''}`}>
      {children}
    </div>
  );
}