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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ClienteForm } from '@/components/clientes/ClienteForm';
import { MOCK_CLIENTS, MOCK_VEHICLES } from '@/data/mockData';
import { Client } from '@/types';
import { Plus, Search, Filter, Eye, Edit, Trash2, Users, UserPlus, MapPin, Phone } from 'lucide-react';
import { toast } from 'sonner';

export function Clients() {
  const [clientes, setClientes] = useState<Client[]>(MOCK_CLIENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>('all');
  const [provinceFilter, setProvinceFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Client | undefined>();

  const getDocumentTypeBadge = (type: Client['document_type']) => {
    const labels = {
      dni: 'DNI',
      cuit: 'CUIT',
      passport: 'Pasaporte'
    };

    const colors = {
      dni: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      cuit: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      passport: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    };

    return (
      <Badge variant="outline" className={colors[type]}>
        {labels[type]}
      </Badge>
    );
  };

  const filteredClientes = clientes.filter(cliente => {
    const matchesSearch = cliente.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cliente.document.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cliente.phone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDocumentType = documentTypeFilter === 'all' || cliente.document_type === documentTypeFilter;
    const matchesProvince = provinceFilter === 'all' || cliente.province === provinceFilter;
    
    return matchesSearch && matchesDocumentType && matchesProvince;
  });

  const handleCreateCliente = async (data: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newCliente: Client = {
      id: (clientes.length + 1).toString(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setClientes([...clientes, newCliente]);
    toast.success('Cliente creado exitosamente');
  };

  const handleUpdateCliente = async (data: any) => {
    if (!editingCliente) return;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const updatedClientes = clientes.map(cliente =>
      cliente.id === editingCliente.id
        ? { ...cliente, ...data, updated_at: new Date().toISOString() }
        : cliente
    );

    setClientes(updatedClientes);
    setEditingCliente(undefined);
    toast.success('Cliente actualizado exitosamente');
  };

  const handleDeleteCliente = async (id: string) => {
    // Check if client has vehicles
    const clientVehicles = MOCK_VEHICLES.filter(v => v.client_id === id);
    if (clientVehicles.length > 0) {
      toast.error('No se puede eliminar el cliente porque tiene vehículos asociados');
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    setClientes(clientes.filter(cliente => cliente.id !== id));
    toast.success('Cliente eliminado exitosamente');
  };

  const openEditForm = (cliente: Client) => {
    setEditingCliente(cliente);
    setIsFormOpen(true);
  };

  const openCreateForm = () => {
    setEditingCliente(undefined);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCliente(undefined);
  };

  // Get unique provinces for filter
  const provinces = Array.from(new Set(clientes.map(c => c.province))).sort();

  // Statistics
  const stats = {
    total: clientes.length,
    with_email: clientes.filter(c => c.email).length,
    by_province: clientes.reduce((acc, cliente) => {
      acc[cliente.province] = (acc[cliente.province] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    vehicles_count: MOCK_VEHICLES.length,
  };

  const topProvince = Object.entries(stats.by_province).sort(([,a], [,b]) => b - a)[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Clientes</h1>
          <p className="text-muted-foreground">
            Administra la base de datos de clientes y sus datos de contacto
          </p>
        </div>
        <Button onClick={openCreateForm} className="gap-2 action-button">
          <Plus className="w-4 h-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Clientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <UserPlus className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.with_email}</p>
                <p className="text-sm text-muted-foreground">Con Email</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{topProvince?.[1] || 0}</p>
                <p className="text-sm text-muted-foreground">{topProvince?.[0] || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Phone className="w-6 h-6 text-orange-600 dark:text-orange-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.vehicles_count}</p>
                <p className="text-sm text-muted-foreground">Vehículos Registrados</p>
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
                  placeholder="Buscar por nombre, documento, email o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Tipo Documento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="dni">DNI</SelectItem>
                <SelectItem value="cuit">CUIT</SelectItem>
                <SelectItem value="passport">Pasaporte</SelectItem>
              </SelectContent>
            </Select>
            <Select value={provinceFilter} onValueChange={setProvinceFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Provincia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las provincias</SelectItem>
                {provinces.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Vehículos</TableHead>
                <TableHead>Registro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.map((cliente) => {
                const clientVehicles = MOCK_VEHICLES.filter(v => v.client_id === cliente.id);
                
                return (
                  <TableRow key={cliente.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            {cliente.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{cliente.name}</p>
                          {cliente.notes && (
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {cliente.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getDocumentTypeBadge(cliente.document_type)}
                        <p className="text-sm font-mono">{cliente.document}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{cliente.phone}</p>
                        {cliente.email && (
                          <p className="text-sm text-muted-foreground">{cliente.email}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{cliente.city}</p>
                        <p className="text-sm text-muted-foreground">{cliente.province}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {clientVehicles.length}
                        </Badge>
                        {clientVehicles.length > 0 && (
                          <span className="text-sm text-muted-foreground">
                            vehículo{clientVehicles.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(cliente.created_at).toLocaleDateString('es-AR')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="action-button-ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openEditForm(cliente)}
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
                              <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente 
                                el cliente "{cliente.name}" del sistema.
                                {clientVehicles.length > 0 && (
                                  <span className="block mt-2 text-destructive font-medium">
                                    Atención: Este cliente tiene {clientVehicles.length} vehículo(s) asociado(s).
                                  </span>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteCliente(cliente.id)}
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
      <ClienteForm
        cliente={editingCliente}
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={editingCliente ? handleUpdateCliente : handleCreateCliente}
      />
    </div>
  );
}