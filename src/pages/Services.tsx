import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ServiceForm } from '@/components/servicios/ServiceForm';
import { ServiceDetails } from '@/components/servicios/ServiceDetails';
import { ServiceFilters } from '@/components/servicios/ServiceFilters';
import { MOCK_SERVICES, MOCK_CLIENTS, MOCK_VEHICLES, MOCK_TOW_TRUCKS, MOCK_OPERATORS } from '@/data/mockData';
import { Service } from '@/types';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Users,
  Truck,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

export function Services() {
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [operatorFilter, setOperatorFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>();
  const [selectedService, setSelectedService] = useState<Service | undefined>();

  const getStatusBadge = (status: Service['status']) => {
    const variants = {
      pending: 'secondary',
      assigned: 'default',
      in_progress: 'default',
      completed: 'default',
      cancelled: 'destructive'
    } as const;

    const labels = {
      pending: 'Pendiente',
      assigned: 'Asignado',
      in_progress: 'En Progreso',
      completed: 'Completado',
      cancelled: 'Cancelado'
    };

    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: Service['priority']) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };

    const labels = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      urgent: 'Urgente'
    };

    return (
      <Badge variant="outline" className={colors[priority]}>
        {labels[priority]}
      </Badge>
    );
  };

  const getServiceTypeLabel = (type: Service['service_type']) => {
    const labels = {
      tow: 'Remolque',
      taxi: 'Taxi de Grúa',
      transport: 'Transporte',
      assistance: 'Asistencia'
    };
    return labels[type];
  };

  const filteredServices = services.filter(service => {
    const client = MOCK_CLIENTS.find(c => c.id === service.client_id);
    
    const matchesSearch = service.service_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (service.folio && service.folio.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (service.vehicle_license_plate && service.vehicle_license_plate.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (service.vehicle_brand && service.vehicle_brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (service.vehicle_model && service.vehicle_model.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
    const matchesType = typeFilter === 'all' || service.service_type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || service.priority === priorityFilter;
    const matchesOperator = operatorFilter === 'all' || service.operator_id === operatorFilter;
    
    const serviceDate = new Date(service.service_date);
    const matchesDateFrom = !dateFrom || serviceDate >= dateFrom;
    const matchesDateTo = !dateTo || serviceDate <= dateTo;
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority && 
           matchesOperator && matchesDateFrom && matchesDateTo;
  });

  const handleCreateService = async (data: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generar número de servicio
    const serviceNumber = `SRV-2024-${String(services.length + 1).padStart(4, '0')}`;
    
    // Generar folio automático si no se proporcionó uno manual
    const folio = data.folio || (data.client_id === '5' ? `ELS-${Date.now().toString().slice(-6)}` : null);
    
    const newService: Service = {
      id: (services.length + 1).toString(),
      service_number: serviceNumber,
      folio: folio,
      ...data,
      status: 'pending',
      additional_costs: [],
      total_cost: data.base_cost + (data.distance_km || 0) * 150,
      is_billed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setServices([newService, ...services]);
    toast.success('Servicio creado exitosamente');
  };

  const handleUpdateService = async (data: any) => {
    if (!editingService) return;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const updatedServices = services.map(service =>
      service.id === editingService.id
        ? { 
            ...service, 
            ...data,
            total_cost: data.base_cost + (data.distance_km || 0) * 150,
            updated_at: new Date().toISOString() 
          }
        : service
    );

    setServices(updatedServices);
    setEditingService(undefined);
    toast.success('Servicio actualizado exitosamente');
  };

  const handleUpdateStatus = async (serviceId: string, newStatus: Service['status']) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const updatedServices = services.map(service => {
      if (service.id === serviceId) {
        const updatedService = { 
          ...service, 
          status: newStatus,
          updated_at: new Date().toISOString()
        };

        // Add timestamps based on status
        if (newStatus === 'in_progress' && !service.started_time) {
          updatedService.started_time = new Date().toTimeString().slice(0, 5);
        } else if (newStatus === 'completed' && !service.completed_time) {
          updatedService.completed_time = new Date().toTimeString().slice(0, 5);
        }

        return updatedService;
      }
      return service;
    });

    setServices(updatedServices);
    
    const statusLabels = {
      pending: 'pendiente',
      assigned: 'asignado',
      in_progress: 'en progreso',
      completed: 'completado',
      cancelled: 'cancelado'
    };
    
    toast.success(`Servicio marcado como ${statusLabels[newStatus]}`);
  };

  const handleDeleteService = async (id: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    setServices(services.filter(service => service.id !== id));
    toast.success('Servicio eliminado exitosamente');
  };

  const openEditForm = (service: Service) => {
    setEditingService(service);
    setIsFormOpen(true);
  };

  const openCreateForm = () => {
    setEditingService(undefined);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingService(undefined);
  };

  const openDetails = (service: Service) => {
    setSelectedService(service);
    setIsDetailsOpen(true);
  };

  const closeDetails = () => {
    setIsDetailsOpen(false);
    setSelectedService(undefined);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setPriorityFilter('all');
    setOperatorFilter('all');
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  // Statistics
  const stats = {
    total: services.length,
    pending: services.filter(s => s.status === 'pending').length,
    in_progress: services.filter(s => s.status === 'in_progress').length,
    completed_today: services.filter(s => 
      s.status === 'completed' && 
      new Date(s.service_date).toDateString() === new Date().toDateString()
    ).length,
    total_revenue: services
      .filter(s => s.status === 'completed')
      .reduce((sum, s) => sum + s.total_cost, 0),
    avg_response_time: 25 // Mock average response time in minutes
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Servicios</h1>
          <p className="text-muted-foreground">
            Centro de control para todos los servicios de grúas y transporte
          </p>
        </div>
        <Button onClick={openCreateForm} className="gap-2 action-button">
          <Plus className="w-4 h-4" />
          Nuevo Servicio
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <ClipboardList className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Servicios</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.in_progress}</p>
                <p className="text-sm text-muted-foreground">En Progreso</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.completed_today}</p>
                <p className="text-sm text-muted-foreground">Completados Hoy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  ${(stats.total_revenue / 1000).toFixed(0)}k
                </p>
                <p className="text-sm text-muted-foreground">Ingresos Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 dark:bg-cyan-900 rounded-lg">
                <TrendingUp className="w-6 h-6 text-cyan-600 dark:text-cyan-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.avg_response_time}m</p>
                <p className="text-sm text-muted-foreground">Tiempo Promedio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <ServiceFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        operatorFilter={operatorFilter}
        onOperatorChange={setOperatorFilter}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        onClearFilters={clearFilters}
        operators={MOCK_OPERATORS}
      />

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Servicios ({filteredServices.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Folio</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Fecha/Hora</TableHead>
                <TableHead>Operador</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => {
                const client = MOCK_CLIENTS.find(c => c.id === service.client_id);
                const operator = MOCK_OPERATORS.find(o => o.id === service.operator_id);
                
                return (
                  <TableRow key={service.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div>
                        <p className="font-semibold">{service.service_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {service.requires_inspection && '🔍 '}
                          {getServiceTypeLabel(service.service_type)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {service.folio ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          {service.folio}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Auto</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{client?.name}</p>
                        <p className="text-sm text-muted-foreground">{client?.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {service.vehicle_license_plate && (
                        <div>
                          <p className="font-medium">{service.vehicle_license_plate}</p>
                          <p className="text-sm text-muted-foreground">
                            {service.vehicle_brand} {service.vehicle_model}
                          </p>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getServiceTypeLabel(service.service_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(service.status)}</TableCell>
                    <TableCell>{getPriorityBadge(service.priority)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(service.service_date).toLocaleDateString('es-AR')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {service.requested_time}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {operator ? (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">{operator.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sin asignar</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold">
                          ${service.total_cost.toLocaleString('es-AR')}
                        </p>
                        {service.distance_km && (
                          <p className="text-xs text-muted-foreground">
                            {service.distance_km} km
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openDetails(service)}
                          className="action-button-ghost"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openEditForm(service)}
                          className="action-button-ghost"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="action-button-ghost">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar servicio?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente 
                                el servicio "{service.service_number}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteService(service.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Service Form Dialog */}
      <ServiceForm
        service={editingService}
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={editingService ? handleUpdateService : handleCreateService}
        clients={MOCK_CLIENTS}
        vehicles={MOCK_VEHICLES}
        towTrucks={MOCK_TOW_TRUCKS}
        operators={MOCK_OPERATORS}
      />

      {/* Service Details Dialog */}
      {selectedService && (
        <ServiceDetails
          service={selectedService}
          client={MOCK_CLIENTS.find(c => c.id === selectedService.client_id)}
          towTruck={MOCK_TOW_TRUCKS.find(t => t.id === selectedService.tow_truck_id)}
          operator={MOCK_OPERATORS.find(o => o.id === selectedService.operator_id)}
          isOpen={isDetailsOpen}
          onClose={closeDetails}
          onEdit={() => {
            closeDetails();
            openEditForm(selectedService);
          }}
          onUpdateStatus={(status) => handleUpdateStatus(selectedService.id, status)}
        />
      )}
    </div>
  );
}