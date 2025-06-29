import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { VehiculoForm } from '@/components/vehiculos/VehiculoForm';
import { MOCK_VEHICLES, MOCK_CLIENTS } from '@/data/mockData';
import { Vehicle } from '@/types';
import { Plus, Search, Filter, Eye, Edit, Trash2, Car, Truck, Calendar, Palette } from 'lucide-react';
import { toast } from 'sonner';

export function Vehicles() {
  const [vehiculos, setVehiculos] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState<Vehicle | undefined>();

  const getVehicleTypeBadge = (type: Vehicle['vehicle_type']) => {
    const labels = {
      car: 'Automóvil',
      truck: 'Camión',
      motorcycle: 'Motocicleta',
      van: 'Camioneta',
      bus: 'Autobús'
    };

    const colors = {
      car: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      truck: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      motorcycle: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      van: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      bus: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };

    const icons = {
      car: Car,
      truck: Truck,
      motorcycle: Car,
      van: Car,
      bus: Truck
    };

    const Icon = icons[type];

    return (
      <Badge variant="outline" className={colors[type]}>
        <Icon className="w-3 h-3 mr-1" />
        {labels[type]}
      </Badge>
    );
  };

  const filteredVehiculos = vehiculos.filter(vehiculo => {
    const cliente = MOCK_CLIENTS.find(c => c.id === vehiculo.client_id);
    const matchesSearch = vehiculo.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehiculo.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehiculo.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cliente?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || vehiculo.vehicle_type === typeFilter;
    const matchesClient = clientFilter === 'all' || vehiculo.client_id === clientFilter;
    
    return matchesSearch && matchesType && matchesClient;
  });

  const handleCreateVehiculo = async (data: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newVehiculo: Vehicle = {
      id: (vehiculos.length + 1).toString(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setVehiculos([...vehiculos, newVehiculo]);
    toast.success('Vehículo creado exitosamente');
  };

  const handleUpdateVehiculo = async (data: any) => {
    if (!editingVehiculo) return;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const updatedVehiculos = vehiculos.map(vehiculo =>
      vehiculo.id === editingVehiculo.id
        ? { ...vehiculo, ...data, updated_at: new Date().toISOString() }
        : vehiculo
    );

    setVehiculos(updatedVehiculos);
    setEditingVehiculo(undefined);
    toast.success('Vehículo actualizado exitosamente');
  };

  const handleDeleteVehiculo = async (id: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    setVehiculos(vehiculos.filter(vehiculo => vehiculo.id !== id));
    toast.success('Vehículo eliminado exitosamente');
  };

  const openEditForm = (vehiculo: Vehicle) => {
    setEditingVehiculo(vehiculo);
    setIsFormOpen(true);
  };

  const openCreateForm = () => {
    setEditingVehiculo(undefined);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingVehiculo(undefined);
  };

  // Statistics
  const stats = {
    total: vehiculos.length,
    by_type: vehiculos.reduce((acc, vehiculo) => {
      acc[vehiculo.vehicle_type] = (acc[vehiculo.vehicle_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    avg_year: Math.round(vehiculos.reduce((sum, v) => sum + v.year, 0) / vehiculos.length),
    newest: Math.max(...vehiculos.map(v => v.year)),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Vehículos</h1>
          <p className="text-muted-foreground">
            Administra el registro de vehículos de los clientes
          </p>
        </div>
        <Button onClick={openCreateForm} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Vehículo
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Car className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Vehículos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Truck className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.by_type.car || 0}</p>
                <p className="text-sm text-muted-foreground">Automóviles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.avg_year}</p>
                <p className="text-sm text-muted-foreground">Año Promedio</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Palette className="w-6 h-6 text-orange-600 dark:text-orange-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.newest}</p>
                <p className="text-sm text-muted-foreground">Más Nuevo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por patente, marca, modelo o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="car">Automóvil</SelectItem>
                <SelectItem value="truck">Camión</SelectItem>
                <SelectItem value="motorcycle">Motocicleta</SelectItem>
                <SelectItem value="van">Camioneta</SelectItem>
                <SelectItem value="bus">Autobús</SelectItem>
              </SelectContent>
            </Select>
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los clientes</SelectItem>
                {MOCK_CLIENTS.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patente</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Año</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Propietario</TableHead>
                <TableHead>Registro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehiculos.map((vehiculo) => {
                const cliente = MOCK_CLIENTS.find(c => c.id === vehiculo.client_id);
                
                return (
                  <TableRow key={vehiculo.id}>
                    <TableCell className="font-mono font-bold text-lg">
                      {vehiculo.license_plate}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{vehiculo.brand} {vehiculo.model}</p>
                        <p className="text-sm text-muted-foreground">
                          {vehiculo.brand}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getVehicleTypeBadge(vehiculo.vehicle_type)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {vehiculo.year}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ 
                            backgroundColor: vehiculo.color === 'Blanco' ? '#ffffff' :
                                           vehiculo.color === 'Negro' ? '#000000' :
                                           vehiculo.color === 'Gris' ? '#808080' :
                                           vehiculo.color === 'Rojo' ? '#dc2626' :
                                           vehiculo.color === 'Azul' ? '#2563eb' :
                                           vehiculo.color === 'Verde' ? '#16a34a' :
                                           vehiculo.color === 'Amarillo' ? '#eab308' :
                                           '#6b7280'
                          }}
                        />
                        <span className="text-sm">{vehiculo.color}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {cliente ? (
                        <div>
                          <p className="font-medium">{cliente.name}</p>
                          <p className="text-sm text-muted-foreground">{cliente.phone}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Cliente no encontrado</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(vehiculo.created_at).toLocaleDateString('es-AR')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openEditForm(vehiculo)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar vehículo?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente 
                                el vehículo "{vehiculo.license_plate}" del sistema.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteVehiculo(vehiculo.id)}
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

      {/* Form Dialog */}
      <VehiculoForm
        vehiculo={editingVehiculo}
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={editingVehiculo ? handleUpdateVehiculo : handleCreateVehiculo}
        clientes={MOCK_CLIENTS}
      />
    </div>
  );
}