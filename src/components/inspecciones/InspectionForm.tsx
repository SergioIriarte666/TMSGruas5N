import React, { useState, useEffect } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ServiceInspection, VehicleCondition } from '@/types';
import { Loader2, Camera, Upload, X, Plus, MapPin, AlertTriangle, Signature } from 'lucide-react';
import { toast } from 'sonner';
import { SignaturePad } from '@/components/ui/signature-pad';

// Esquema de validación modificado para manejar fotos como un objeto simple
const inspectionSchema = z.object({
  service_id: z.string().min(1, 'Debe seleccionar un servicio'),
  interior_condition: z.enum(['excellent', 'good', 'fair', 'poor']),
  fuel_level: z.number().min(0).max(100),
  mileage: z.number().optional(),
  tire_condition: z.enum(['excellent', 'good', 'worn', 'needs_replacement']),
  inspection_notes: z.string().optional(),
  operator_signature_name: z.string().min(1, 'El nombre del operador es requerido'),
  operator_signature_image: z.string().min(1, 'La firma del operador es requerida'),
  client_signature_name: z.string().optional(),
  client_signature_image: z.string().optional(),
  // Eliminamos la validación de fotos del esquema Zod
});

type InspectionFormData = z.infer<typeof inspectionSchema>;

interface InspectionFormProps {
  inspection?: ServiceInspection;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InspectionFormData) => Promise<void>;
  services: Array<{ id: string; service_number: string; description: string; client_name?: string; origin_address?: string; destination_address?: string; vehicle_info?: string; tow_truck_info?: string; operator_name?: string; service_date?: string }>;
}

// Lista de elementos de inspección
const INSPECTION_ITEMS = [
  "Espejo Interno", "Encendedor", "Cint. Seguridad",
  "Piso Goma", "Cenicero", "Emblemas",
  "Espejo Exterior", "Neblineros", "Rueda Del Izq.",
  "Rueda Del.Der.", "Rueda Tra.Der.", "Tapa Bencina",
  "Batería", "Triángulos", "Rueda Rpto.",
  "Extintor", "Llave Rueda", "Pertiga",
  "Sombrilla", "Radio", "TAG",
  "Parlantes", "Consola", "Chaleco Reflectante",
  "Limp. Parab.", "Antena", "Extintor 10 K.",
  "Rueda Tra.Izq.", "Tapa Ruedas", "Cuñas",
  "Tapa Radiador", "Gata", "Baliza",
  "Botiquín", "Caja Invierno"
];

export function InspectionForm({ inspection, isOpen, onClose, onSubmit, services }: InspectionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [selectedService, setSelectedService] = useState<any>(null);
  const [photos, setPhotos] = useState<Record<string, File | null>>({
    front: null,
    left: null,
    right: null,
    back: null,
    engine: null,
    other: null
  });
  const [photoErrors, setPhotoErrors] = useState<Record<string, string>>({});
  const [operatorSignature, setOperatorSignature] = useState<string>('');
  const [clientSignature, setClientSignature] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InspectionFormData>({
    resolver: zodResolver(inspectionSchema),
    defaultValues: inspection ? {
      service_id: inspection.service_id,
      interior_condition: inspection.vehicle_condition_before.interior_condition,
      fuel_level: inspection.vehicle_condition_before.fuel_level,
      mileage: inspection.vehicle_condition_before.mileage,
      tire_condition: inspection.vehicle_condition_before.tire_condition,
      inspection_notes: inspection.inspection_notes || '',
      operator_signature_name: inspection.operator_signature_name || '',
      operator_signature_image: inspection.operator_signature_image || '',
      client_signature_name: inspection.client_signature_name || '',
      client_signature_image: inspection.client_signature_image || '',
    } : {
      service_id: '',
      interior_condition: 'good',
      fuel_level: 50,
      tire_condition: 'good',
      inspection_notes: '',
      operator_signature_name: '',
      operator_signature_image: '',
      client_signature_name: '',
      client_signature_image: '',
    }
  });

  // Actualizar el servicio seleccionado cuando cambia
  useEffect(() => {
    const serviceId = watch('service_id');
    if (serviceId) {
      const service = services.find(s => s.id === serviceId);
      setSelectedService(service);
      
      // Si el servicio tiene un operador, establecer su nombre como firma por defecto
      if (service?.operator_name) {
        setValue('operator_signature_name', service.operator_name);
      }
      
      // Si el servicio tiene un cliente, establecer su nombre como firma por defecto
      if (service?.client_name) {
        setValue('client_signature_name', service.client_name);
      }
    } else {
      setSelectedService(null);
    }
  }, [watch('service_id'), services, setValue]);

  // Inicializar firmas si hay una inspección existente
  useEffect(() => {
    if (inspection) {
      if (inspection.operator_signature_image) {
        setOperatorSignature(inspection.operator_signature_image);
        setValue('operator_signature_image', inspection.operator_signature_image);
      }
      if (inspection.client_signature_image) {
        setClientSignature(inspection.client_signature_image);
        setValue('client_signature_image', inspection.client_signature_image);
      }
    }
  }, [inspection, setValue]);

  const handleFormSubmit = async (data: InspectionFormData) => {
    console.log("Iniciando envío del formulario");
    
    // Validar que la foto delantera esté presente
    if (!photos.front) {
      setPhotoErrors({
        ...photoErrors,
        front: "La foto delantera es obligatoria"
      });
      console.log("Error: Falta foto delantera");
      toast.error("La foto delantera es obligatoria");
      return;
    }

    // Validar que la firma del operador esté presente
    if (!operatorSignature) {
      toast.error("La firma del operador es obligatoria");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Datos del formulario:", data);
      console.log("Fotos:", photos);
      
      // Preparar datos para enviar
      const formData = {
        ...data,
        checkedItems,
        photos,
        operator_signature_image: operatorSignature,
        client_signature_image: clientSignature
      };
      
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error("Error al enviar el formulario: " + (error instanceof Error ? error.message : "Error desconocido"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleItem = (item: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const toggleAllItems = () => {
    const allChecked = INSPECTION_ITEMS.every(item => checkedItems[item]);
    const newState = !allChecked;
    
    const newCheckedItems: Record<string, boolean> = {};
    INSPECTION_ITEMS.forEach(item => {
      newCheckedItems[item] = newState;
    });
    
    setCheckedItems(newCheckedItems);
  };

  const handlePhotoUpload = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setPhotos(prev => ({...prev, [type]: file}));
      
      // Limpiar error si existe
      if (photoErrors[type]) {
        setPhotoErrors(prev => {
          const newErrors = {...prev};
          delete newErrors[type];
          return newErrors;
        });
      }
    }
  };

  const removePhoto = (type: string) => {
    setPhotos(prev => ({...prev, [type]: null}));
    
    // Si es la foto delantera y es obligatoria, mostrar error
    if (type === 'front') {
      setPhotoErrors(prev => ({
        ...prev,
        front: "La foto delantera es obligatoria"
      }));
    }
  };

  const handleOperatorSignatureChange = (dataUrl: string) => {
    setOperatorSignature(dataUrl);
    setValue('operator_signature_image', dataUrl);
  };

  const handleClientSignatureChange = (dataUrl: string) => {
    setClientSignature(dataUrl);
    setValue('client_signature_image', dataUrl);
  };

  const conditionLabels = {
    excellent: 'Excelente',
    good: 'Bueno',
    fair: 'Regular',
    poor: 'Malo',
    worn: 'Desgastado',
    needs_replacement: 'Necesita reemplazo'
  };

  const photoTypes = [
    { id: 'front', label: 'Delantera', required: true },
    { id: 'left', label: 'Izquierda', required: false },
    { id: 'right', label: 'Derecha', required: false },
    { id: 'back', label: 'Trasera', required: false },
    { id: 'engine', label: 'Motor', required: false },
    { id: 'other', label: 'Otros', required: false }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {inspection ? 'Editar Inspección' : 'Nueva Inspección'}
          </DialogTitle>
          <DialogDescription>
            Registra el estado del vehículo antes y después del servicio
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit, (errors) => {
          console.error("Errores de validación:", errors);
          toast.error("Por favor, corrige los errores en el formulario");
        })} className="space-y-6">
          {/* Service Selection */}
          <div className="space-y-2">
            <Label>Servicio *</Label>
            <Select
              value={watch('service_id')}
              onValueChange={(value) => setValue('service_id', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el servicio" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.service_number} - {service.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.service_id && (
              <p className="text-sm text-destructive">{errors.service_id.message}</p>
            )}
          </div>

          {/* Información del Servicio - Solo se muestra si hay un servicio seleccionado */}
          {selectedService && (
            <Card>
              <CardHeader className="bg-[#5BA97F] text-white py-2">
                <CardTitle className="text-xl font-bold">INFORMACIÓN DEL SERVICIO</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b">
                      <td className="font-semibold p-4 border-r w-1/4">Folio:</td>
                      <td className="p-4">{selectedService.service_number || "REQ-1750714259767"}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="font-semibold p-4 border-r">Cliente:</td>
                      <td className="p-4">{selectedService.client_name || "Cliente de Prueba Portal"}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="font-semibold p-4 border-r">Fecha de Servicio:</td>
                      <td className="p-4">{selectedService.service_date || "28-06-2025"}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="font-semibold p-4 border-r">Origen:</td>
                      <td className="p-4">{selectedService.origin_address || "Copiapo"}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="font-semibold p-4 border-r">Destino:</td>
                      <td className="p-4">{selectedService.destination_address || "Copiapo"}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="font-semibold p-4 border-r">Vehículo:</td>
                      <td className="p-4">{selectedService.vehicle_info || "Toyota Hilux - PHJT-98"}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="font-semibold p-4 border-r">Grúa:</td>
                      <td className="p-4">{selectedService.tow_truck_info || "TLYF-23"}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold p-4 border-r">Operador:</td>
                      <td className="p-4">{selectedService.operator_name || "Sergio Iriarte"}</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {/* Inventory Checklist */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Inventario de Equipos y Accesorios</CardTitle>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={toggleAllItems}
                  className="gap-2"
                >
                  {INSPECTION_ITEMS.every(item => checkedItems[item]) ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary rounded flex items-center justify-center">
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                        </svg>
                      </div>
                      Quitar Todo
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 border-2 border-primary rounded"></div>
                      Seleccionar Todo
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {INSPECTION_ITEMS.map((item) => (
                  <div key={item} className="border rounded-md p-2 flex items-center">
                    <div 
                      className="flex items-center gap-2 w-full cursor-pointer"
                      onClick={() => toggleItem(item)}
                    >
                      <div className="w-5 h-5 border-2 border-primary rounded flex items-center justify-center">
                        {checkedItems[item] && (
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                          </svg>
                        )}
                      </div>
                      <Label className="text-sm cursor-pointer">
                        {item}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Photos Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Fotografías del Vehículo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {photoTypes.map((photoType) => (
                  <div key={photoType.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-1">
                        {photoType.label}
                        {photoType.required && <span className="text-red-500">*</span>}
                      </Label>
                      {photos[photoType.id] && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removePhoto(photoType.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {photos[photoType.id] ? (
                      <div className="relative border rounded-lg overflow-hidden h-40">
                        <img 
                          src={URL.createObjectURL(photos[photoType.id] as File)} 
                          alt={`Foto ${photoType.label}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center h-40 flex flex-col items-center justify-center">
                        <Camera className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                          {photoType.required ? 'Foto obligatoria' : 'Foto opcional'}
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(photoType.id, e)}
                          className="hidden"
                          id={`photo-${photoType.id}`}
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          asChild
                        >
                          <label htmlFor={`photo-${photoType.id}`} className="cursor-pointer">
                            <Upload className="w-4 h-4 mr-2" />
                            Subir Foto
                          </label>
                        </Button>
                      </div>
                    )}
                    
                    {photoErrors[photoType.id] && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {photoErrors[photoType.id]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Condition */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Estado Interior *</Label>
              <Select
                value={watch('interior_condition')}
                onValueChange={(value) => setValue('interior_condition', value as any)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(conditionLabels).slice(0, 4).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nivel de Combustible (%) *</Label>
              <Input
                type="number"
                min="0"
                max="100"
                {...register('fuel_level', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              {errors.fuel_level && (
                <p className="text-sm text-destructive">{errors.fuel_level.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Kilometraje</Label>
              <Input
                type="number"
                placeholder="150000"
                {...register('mileage', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label>Estado de Neumáticos *</Label>
              <Select
                value={watch('tire_condition')}
                onValueChange={(value) => setValue('tire_condition', value as any)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(conditionLabels).slice(0, 2).concat(Object.entries(conditionLabels).slice(4)).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Signatures - Side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Operator Signature */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Signature className="w-5 h-5" />
                  Firma del Operador *
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="operator_signature_name">Nombre del Operador *</Label>
                  <Input
                    id="operator_signature_name"
                    placeholder="Nombre completo del operador"
                    {...register('operator_signature_name')}
                    disabled={isSubmitting}
                  />
                  {errors.operator_signature_name && (
                    <p className="text-sm text-destructive">{errors.operator_signature_name.message}</p>
                  )}
                </div>

                <SignaturePad
                  value={operatorSignature}
                  onChange={handleOperatorSignatureChange}
                  height={150}
                  disabled={isSubmitting}
                  placeholder="Firme aquí (Operador)"
                  clearButtonLabel="Borrar"
                  saveButtonLabel="Guardar"
                  cancelButtonLabel="Cancelar"
                  penColor="white"
                />
                
                {errors.operator_signature_image && (
                  <p className="text-sm text-destructive">{errors.operator_signature_image.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Client Signature */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Signature className="w-5 h-5" />
                  Firma del Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client_signature_name">Nombre del Cliente</Label>
                  <Input
                    id="client_signature_name"
                    placeholder="Nombre completo del cliente"
                    {...register('client_signature_name')}
                    disabled={isSubmitting}
                  />
                </div>

                <SignaturePad
                  value={clientSignature}
                  onChange={handleClientSignatureChange}
                  height={150}
                  disabled={isSubmitting}
                  placeholder="Firme aquí (Cliente)"
                  clearButtonLabel="Borrar"
                  saveButtonLabel="Guardar"
                  cancelButtonLabel="Cancelar"
                  penColor="white"
                />
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="inspection_notes">Notas de Inspección</Label>
            <Textarea
              id="inspection_notes"
              placeholder="Observaciones adicionales sobre el estado del vehículo..."
              rows={3}
              {...register('inspection_notes')}
              disabled={isSubmitting}
            />
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
            <Button 
              type="submit" 
              disabled={isSubmitting}
              onClick={() => {
                // Validación manual de la foto delantera antes de enviar
                if (!photos.front) {
                  setPhotoErrors({
                    ...photoErrors,
                    front: "La foto delantera es obligatoria"
                  });
                  toast.error("La foto delantera es obligatoria");
                  return;
                }
                
                // Validación de la firma del operador
                if (!operatorSignature) {
                  toast.error("La firma del operador es obligatoria");
                  return;
                }
              }}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {inspection ? 'Actualizar' : 'Crear'} Inspección
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}