import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InspectionForm } from '@/components/inspecciones/InspectionForm';
import { Service, ServiceInspection } from '@/types';
import { 
  Search, 
  Filter, 
  Camera, 
  FileText, 
  CheckCircle, 
  Upload,
  Truck,
  Loader2,
  Plus,
  X,
  MapPin,
  Eye,
  Download,
  Signature
} from 'lucide-react';
import { toast } from 'sonner';
import { generateInspectionPDF } from '@/lib/pdf-generator';

// Mock data for inspections
const MOCK_INSPECTIONS: ServiceInspection[] = [
  {
    id: '1',
    service_id: '1',
    vehicle_condition_before: {
      exterior_damage: [
        {
          id: '1',
          x: 25,
          y: 30,
          type: 'scratch',
          severity: 'minor',
          description: 'Rayón en puerta delantera izquierda'
        }
      ],
      interior_condition: 'good',
      fuel_level: 75,
      mileage: 85000,
      tire_condition: 'good',
      notes: 'Vehículo en buen estado general'
    },
    vehicle_condition_after: {
      exterior_damage: [
        {
          id: '1',
          x: 25,
          y: 30,
          type: 'scratch',
          severity: 'minor',
          description: 'Rayón en puerta delantera izquierda'
        }
      ],
      interior_condition: 'good',
      fuel_level: 70,
      tire_condition: 'good'
    },
    operator_signature_name: 'Juan Operador',
    client_signature_name: 'María González',
    operator_signature_image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51AAAA',
    client_signature_image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51AAABB',
    photos_before: ['photo1.jpg', 'photo2.jpg'],
    photos_after: ['photo3.jpg', 'photo4.jpg'],
    inspection_notes: 'Servicio completado sin incidentes',
    created_at: '2024-01-25T10:30:00Z',
    updated_at: '2024-01-25T11:45:00Z'
  },
  {
    id: '2',
    service_id: '2',
    vehicle_condition_before: {
      exterior_damage: [],
      interior_condition: 'excellent',
      fuel_level: 50,
      mileage: 45000,
      tire_condition: 'excellent'
    },
    operator_signature_name: 'Pedro Conductor',
    operator_signature_image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51AAACC',
    photos_before: ['photo5.jpg'],
    photos_after: [],
    inspection_notes: 'Inspección inicial completada',
    created_at: '2024-01-25T14:20:00Z',
    updated_at: '2024-01-25T14:20:00Z'
  },
  {
    id: '3',
    service_id: '4',
    vehicle_condition_before: {
      exterior_damage: [],
      interior_condition: 'good',
      fuel_level: 65,
      mileage: 32500,
      tire_condition: 'good'
    },
    operator_signature_name: 'Juan Operador',
    operator_signature_image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51AAADD',
    photos_before: ['photo6.jpg', 'photo7.jpg'],
    photos_after: [],
    inspection_notes: 'Vehículo en buen estado general, sin daños visibles',
    created_at: '2024-06-28T09:30:00Z',
    updated_at: '2024-06-28T09:45:00Z'
  }
];

interface OperatorInspectionsProps {
  services: Service[];
}

export function OperatorInspections({ services }: OperatorInspectionsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isCreatingInspection, setIsCreatingInspection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inspections, setInspections] = useState<ServiceInspection[]>(MOCK_INSPECTIONS);
  const [viewingInspection, setViewingInspection] = useState<ServiceInspection | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Filtrar servicios que requieren inspección
  const inspectionServices = services.filter(service => 
    service.requires_inspection && 
    (service.status === 'assigned' || service.status === 'in_progress' || service.status === 'completed')
  );

  const filteredServices = inspectionServices.filter(service => {
    const matchesSearch = service.service_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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

  const getInspectionStatus = (inspection: ServiceInspection) => {
    if (inspection.vehicle_condition_after && inspection.client_signature_name) {
      return 'completed';
    } else if (inspection.vehicle_condition_after) {
      return 'pending_signature';
    } else {
      return 'in_progress';
    }
  };

  const getStatusBadgeForInspection = (status: string) => {
    const variants = {
      completed: 'default',
      pending_signature: 'secondary',
      in_progress: 'destructive'
    } as const;

    const labels = {
      completed: 'Completada',
      pending_signature: 'Pendiente Firma',
      in_progress: 'En Progreso'
    };

    const colors = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      pending_signature: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]} className={colors[status as keyof typeof colors]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const handleSubmitInspection = async (data: any) => {
    setIsSubmitting(true);
    try {
      // En un caso real, aquí enviaríamos los datos al backend
      console.log('Datos de inspección:', data);
      
      // Crear una nueva inspección
      const newInspection: ServiceInspection = {
        id: Date.now().toString(),
        service_id: data.service_id,
        vehicle_condition_before: {
          exterior_damage: [],
          interior_condition: data.interior_condition,
          fuel_level: data.fuel_level,
          mileage: data.mileage,
          tire_condition: data.tire_condition,
          notes: data.inspection_notes
        },
        operator_signature_name: data.operator_signature_name,
        client_signature_name: data.client_signature_name,
        operator_signature_image: data.operator_signature_image,
        client_signature_image: data.client_signature_image,
        photos_before: Object.values(data.photos)
          .filter(Boolean)
          .map((file: File) => URL.createObjectURL(file)),
        photos_after: [],
        inspection_notes: data.inspection_notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setInspections([...inspections, newInspection]);
      toast.success('Inspección creada correctamente');
      setIsCreatingInspection(false);
      setSelectedService(null);
    } catch (error) {
      toast.error('Error al crear la inspección');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGeneratePDF = async (inspection: ServiceInspection) => {
    setIsGeneratingPDF(true);
    try {
      const service = services.find(s => s.id === inspection.service_id);
      
      // Generar el PDF
      generateInspectionPDF(inspection, service);
      
      toast.success('PDF de inspección generado correctamente');
    } catch (error) {
      toast.error('Error al generar el PDF');
      console.error(error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Inspecciones de Vehículos
            </CardTitle>
            <Button 
              size="sm" 
              onClick={() => setIsCreatingInspection(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Nueva Inspección
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar servicios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="assigned">Asignado</SelectItem>
                <SelectItem value="in_progress">En Progreso</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de Servicios para Inspección */}
          {!isCreatingInspection && !viewingInspection ? (
            <div className="space-y-4">
              <h3 className="font-medium text-lg mb-4">Servicios Pendientes de Inspección</h3>
              {filteredServices.map((service) => (
                <Card key={service.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{service.service_number}</h3>
                          {getStatusBadge(service.status)}
                        </div>

                        <p className="text-muted-foreground">{service.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-muted-foreground" />
                            <span>
                              {service.service_type === 'tow' ? 'Remolque' : 
                               service.service_type === 'taxi' ? 'Taxi de Grúa' : 
                               service.service_type === 'transport' ? 'Transporte' : 'Asistencia'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="truncate">{service.origin_address}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedService(service);
                            setIsCreatingInspection(true);
                          }}
                          className="gap-2"
                        >
                          <Camera className="w-4 h-4" />
                          Inspeccionar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <h3 className="font-medium text-lg mt-8 mb-4">Inspecciones Realizadas</h3>
              {inspections.length > 0 ? (
                <div className="space-y-4">
                  {inspections.map((inspection) => {
                    const service = services.find(s => s.id === inspection.service_id);
                    const status = getInspectionStatus(inspection);
                    
                    return (
                      <Card key={inspection.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-lg">{service?.service_number || 'Servicio desconocido'}</h3>
                                {getStatusBadgeForInspection(status)}
                              </div>
                              
                              <p className="text-muted-foreground">{service?.description || 'Sin descripción'}</p>
                              
                              <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Camera className="w-4 h-4 text-muted-foreground" />
                                  <span>{inspection.photos_before.length + (inspection.photos_after?.length || 0)} fotos</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Signature className="w-4 h-4 text-muted-foreground" />
                                  <span>{inspection.client_signature_name ? 'Firmado por cliente' : 'Sin firma de cliente'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-muted-foreground" />
                                  <span>Creada: {new Date(inspection.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setViewingInspection(inspection)}
                                className="gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                Ver Detalles
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleGeneratePDF(inspection)}
                                disabled={isGeneratingPDF}
                                className="gap-2"
                              >
                                <Download className="w-4 h-4" />
                                PDF
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No hay inspecciones registradas
                  </h3>
                  <p className="text-muted-foreground">
                    Realiza tu primera inspección de vehículo
                  </p>
                </div>
              )}

              {filteredServices.length === 0 && inspections.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No hay servicios para inspección
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Intenta ajustar los filtros de búsqueda'
                      : 'No tienes servicios que requieran inspección'
                    }
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Formulario de Inspección o Vista de Detalles
            <>
              {isCreatingInspection && (
                <InspectionForm
                  isOpen={true}
                  onClose={() => {
                    setIsCreatingInspection(false);
                    setSelectedService(null);
                  }}
                  onSubmit={handleSubmitInspection}
                  services={selectedService ? [
                    {
                      id: selectedService.id,
                      service_number: selectedService.service_number,
                      description: selectedService.description,
                      client_name: "Cliente de Prueba",
                      origin_address: selectedService.origin_address,
                      destination_address: selectedService.destination_address,
                      vehicle_info: `${selectedService.vehicle_brand || ''} ${selectedService.vehicle_model || ''} - ${selectedService.vehicle_license_plate || ''}`,
                      tow_truck_info: "Grúa 01",
                      operator_name: "Juan Operador",
                      service_date: new Date(selectedService.service_date).toLocaleDateString('es-CL')
                    }
                  ] : 
                  // Si no hay servicio seleccionado, mostrar todos los servicios disponibles
                  filteredServices.map(service => ({
                    id: service.id,
                    service_number: service.service_number,
                    description: service.description,
                    client_name: "Cliente de Prueba",
                    origin_address: service.origin_address,
                    destination_address: service.destination_address,
                    vehicle_info: `${service.vehicle_brand || ''} ${service.vehicle_model || ''} - ${service.vehicle_license_plate || ''}`,
                    tow_truck_info: "Grúa 01",
                    operator_name: "Juan Operador",
                    service_date: new Date(service.service_date).toLocaleDateString('es-CL')
                  }))
                }
                />
              )}

              {viewingInspection && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-xl">Detalles de la Inspección</h3>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setViewingInspection(null)}
                      >
                        Volver
                      </Button>
                      <Button
                        onClick={() => handleGeneratePDF(viewingInspection)}
                        disabled={isGeneratingPDF}
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        {isGeneratingPDF ? 'Generando...' : 'Descargar PDF'}
                      </Button>
                    </div>
                  </div>

                  <Card>
                    <CardHeader className="bg-[#5BA97F] text-white py-2">
                      <CardTitle className="text-xl font-bold">INFORMACIÓN DEL SERVICIO</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <table className="w-full border-collapse">
                        <tbody>
                          <tr className="border-b">
                            <td className="font-semibold p-4 border-r w-1/4">Servicio:</td>
                            <td className="p-4">
                              {services.find(s => s.id === viewingInspection.service_id)?.service_number || "Desconocido"}
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="font-semibold p-4 border-r">Estado:</td>
                            <td className="p-4">
                              {getStatusBadgeForInspection(getInspectionStatus(viewingInspection))}
                            </td>
                          </tr>
                          <tr className="border-b">
                            <td className="font-semibold p-4 border-r">Fecha:</td>
                            <td className="p-4">{new Date(viewingInspection.created_at).toLocaleDateString('es-CL')}</td>
                          </tr>
                          <tr className="border-b">
                            <td className="font-semibold p-4 border-r">Operador:</td>
                            <td className="p-4">{viewingInspection.operator_signature_name}</td>
                          </tr>
                          <tr>
                            <td className="font-semibold p-4 border-r">Cliente:</td>
                            <td className="p-4">{viewingInspection.client_signature_name || "No firmado"}</td>
                          </tr>
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Condición del Vehículo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">Estado Interior</h4>
                          <p>{
                            viewingInspection.vehicle_condition_before.interior_condition === 'excellent' ? 'Excelente' :
                            viewingInspection.vehicle_condition_before.interior_condition === 'good' ? 'Bueno' :
                            viewingInspection.vehicle_condition_before.interior_condition === 'fair' ? 'Regular' : 'Malo'
                          }</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Nivel de Combustible</h4>
                          <p>{viewingInspection.vehicle_condition_before.fuel_level}%</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Kilometraje</h4>
                          <p>{viewingInspection.vehicle_condition_before.mileage || 'No registrado'}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Estado de Neumáticos</h4>
                          <p>{
                            viewingInspection.vehicle_condition_before.tire_condition === 'excellent' ? 'Excelente' :
                            viewingInspection.vehicle_condition_before.tire_condition === 'good' ? 'Bueno' :
                            viewingInspection.vehicle_condition_before.tire_condition === 'worn' ? 'Desgastado' : 'Necesita reemplazo'
                          }</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Firmas */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Firmas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Operador</h4>
                            <div className="border rounded-lg p-2 h-24 flex items-center justify-center bg-gray-50">
                              {viewingInspection.operator_signature_image ? (
                                <img 
                                  src={viewingInspection.operator_signature_image} 
                                  alt="Firma del operador" 
                                  className="max-h-full"
                                />
                              ) : (
                                <p className="text-sm text-muted-foreground">Sin firma</p>
                              )}
                            </div>
                            <p className="text-sm font-medium">{viewingInspection.operator_signature_name}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Cliente</h4>
                            <div className="border rounded-lg p-2 h-24 flex items-center justify-center bg-gray-50">
                              {viewingInspection.client_signature_image ? (
                                <img 
                                  src={viewingInspection.client_signature_image} 
                                  alt="Firma del cliente" 
                                  className="max-h-full"
                                />
                              ) : (
                                <p className="text-sm text-muted-foreground">Sin firma</p>
                              )}
                            </div>
                            <p className="text-sm font-medium">{viewingInspection.client_signature_name || "No firmado"}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Fotografías */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Fotografías</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-2">
                          {viewingInspection.photos_before.map((photo, index) => (
                            <div key={index} className="border rounded-lg overflow-hidden">
                              <div className="bg-muted h-20 flex items-center justify-center">
                                <Camera className="w-8 h-8 text-muted-foreground opacity-50" />
                              </div>
                              <div className="p-1 text-center">
                                <p className="text-xs font-medium">Foto {index + 1}</p>
                              </div>
                            </div>
                          ))}
                          {viewingInspection.photos_before.length === 0 && (
                            <div className="col-span-3 text-center py-4">
                              <p className="text-muted-foreground text-sm">No hay fotografías registradas</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {viewingInspection.inspection_notes && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Notas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{viewingInspection.inspection_notes}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}