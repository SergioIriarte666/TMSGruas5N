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
import { GruaForm } from '@/components/gruas/GruaForm';
import { MOCK_TOW_TRUCKS } from '@/data/mockData';
import { TowTruck } from '@/types';
import { Plus, Search, Filter, Eye, Edit, Trash2, Truck, Settings, MapPin, FileText, Car, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export function TowTrucks() {
  const [gruas, setGruas] = useState<TowTruck[]>(MOCK_TOW_TRUCKS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGrua, setEditingGrua] = useState<TowTruck | undefined>();

  // Mock operators for the form
  const mockOperators = [
    { id: '2', name: 'Juan Operador' },
    { id: '3', name: 'Pedro Conductor' },
    { id: '4', name: 'Carlos Chofer' },
  ];

  const getStatusBadge = (status: TowTruck['status']) => {
    const variants = {
      available: 'default',
      in_service: 'default',
      maintenance: 'secondary',
      out_of_service: 'destructive'
    } as const;

    const labels = {
      available: 'Disponible',
      in_service: 'En Servicio',
      maintenance: 'Mantenimiento',
      out_of_service: 'Fuera de Servicio'
    };

    const colors = {
      available: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      in_service: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      maintenance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      out_of_service: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getTypeBadge = (type: TowTruck['truck_type']) => {
    const labels = {
      flatbed: 'Plataforma',
      wheel_lift: 'Elevador',
      integrated: 'Integrada',
      heavy_duty: 'Pesada'
    };

    return (
      <Badge variant="outline">
        {labels[type]}
      </Badge>
    );
  };

  const isDocumentExpiring = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isDocumentExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  };

  const filteredGruas = gruas.filter(grua => {
    const matchesSearch = grua.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grua.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grua.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grua.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || grua.status === statusFilter;
    const matchesType = typeFilter === 'all' || grua.truck_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreateGrua = async (data: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newGrua: TowTruck = {
      id: (gruas.length + 1).toString(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setGruas([...gruas, newGrua]);
    toast.success('Grúa creada exitosamente');
  };

  const handleUpdateGrua = async (data: any) => {
    if (!editingGrua) return;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const updatedGruas = gruas.map(grua =>
      grua.id === editingGrua.id
        ? { ...grua, ...data, updated_at: new Date().toISOString() }
        : grua
    );

    setGruas(updatedGruas);
    setEditingGrua(undefined);
    toast.success('Grúa actualizada exitosamente');
  };

  const handleDeleteGrua = async (id: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    setGruas(gruas.filter(grua => grua.id !== id));
    toast.success('Grúa eliminada exitosamente');
  };

  const openEditForm = (grua: TowTruck) => {
    setEditingGrua(grua);
    setIsFormOpen(true);
  };

  const openCreateForm = () => {
    setEditingGrua(undefined);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingGrua(undefined);
  };

  // Statistics
  const stats = {
    total: gruas.length,
    available: gruas.filter(g => g.status === 'available').length,
    in_service: gruas.filter(g => g.status === 'in_service').length,
    maintenance: gruas.filter(g => g.status === 'maintenance').length,
    expiring_documents: gruas.filter(g => 
      isDocumentExpiring(g.circulation_permit_expiry) || 
      isDocumentExpiring(g.soap_expiry) || 
      isDocumentExpiring(g.technical_review_expiry)
    ).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Grúas</h1>
          <p className="text-muted-foreground">
            Administra la flota de grúas y su estado operativo
          </p>
        </div>
        <Button onClick={openCreateForm} className="gap-2">
          <Plus className="w-4 h-4" />
          Nueva Grúa
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Truck className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total de Grúas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <MapPin className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.available}</p>
                <p className="text-sm text-muted-foreground">Disponibles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Settings className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.in_service}</p>
                <p className="text-sm text-muted-foreground">En Servicio</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Settings className="w-6 h-6 text-orange-600 dark:text-orange-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.maintenance}</p>
                <p className="text-sm text-muted-foreground">Mantenimiento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <FileText className="w-6 h-6 text-red-600 dark:text-red-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.expiring_documents}</p>
                <p className="text-sm text-muted-foreground">Docs. por Vencer</p>
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
                  placeholder="Buscar por nombre, patente, marca o modelo..."
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
                <SelectItem value="available">Disponible</SelectItem>
                <SelectItem value="in_service">En Servicio</SelectItem>
                <SelectItem value="maintenance">Mantenimiento</SelectItem>
                <SelectItem value="out_of_service">Fuera de Servicio</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="flatbed">Plataforma</SelectItem>
                <SelectItem value="wheel_lift">Elevador</SelectItem>
                <SelectItem value="integrated">Integrada</SelectItem>
                <SelectItem value="heavy_duty">Pesada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Gruas Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Patente</TableHead>
                <TableHead>Marca/Modelo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Capacidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Permiso Circulación</TableHead>
                <TableHead>SOAP</TableHead>
                <TableHead>Revisión Técnica</TableHead>
                <TableHead>Operador</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGruas.map((grua) => {
                const operator = mockOperators.find(op => op.id === grua.current_operator_id);
                
                const circulationExpiring = isDocumentExpiring(grua.circulation_permit_expiry);
                const circulationExpired = isDocumentExpired(grua.circulation_permit_expiry);
                
                const soapExpiring = isDocumentExpiring(grua.soap_expiry);
                const soapExpired = isDocumentExpired(grua.soap_expiry);
                
                const technicalExpiring = isDocumentExpiring(grua.technical_review_expiry);
                const technicalExpired = isDocumentExpired(grua.technical_review_expiry);
                
                return (
                  <TableRow key={grua.id}>
                    <TableCell className="font-medium">
                      {grua.name}
                    </TableCell>
                    <TableCell className="font-mono">
                      {grua.license_plate}
                    </TableCell>
                    <TableCell>
                      {grua.brand} {grua.model} ({grua.year})
                    </TableCell>
                    <TableCell>{getTypeBadge(grua.truck_type)}</TableCell>
                    <TableCell>{grua.capacity_tons} ton</TableCell>
                    <TableCell>{getStatusBadge(grua.status)}</TableCell>
                    <TableCell>
                      {grua.circulation_permit_expiry ? (
                        <div className="space-y-1">
                          <p className={`text-sm ${
                            circulationExpired ? 'text-red-600' : 
                            circulationExpiring ? 'text-orange-600' : 
                            'text-muted-foreground'
                          }`}>
                            {new Date(grua.circulation_permit_expiry).toLocaleDateString('es-AR')}
                          </p>
                          {(circulationExpired || circulationExpiring) && (
                            <Badge variant="destructive" className="text-xs">
                              {circulationExpired ? 'Vencido' : 'Por vencer'}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No especificado</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {grua.soap_expiry ? (
                        <div className="space-y-1">
                          <p className={`text-sm ${
                            soapExpired ? 'text-red-600' : 
                            soapExpiring ? 'text-orange-600' : 
                            'text-muted-foreground'
                          }`}>
                            {new Date(grua.soap_expiry).toLocaleDateString('es-AR')}
                          </p>
                          {(soapExpired || soapExpiring) && (
                            <Badge variant="destructive" className="text-xs">
                              {soapExpired ? 'Vencido' : 'Por vencer'}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No especificado</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {grua.technical_review_expiry ? (
                        <div className="space-y-1">
                          <p className={`text-sm ${
                            technicalExpired ? 'text-red-600' : 
                            technicalExpiring ? 'text-orange-600' : 
                            'text-muted-foreground'
                          }`}>
                            {new Date(grua.technical_review_expiry).toLocaleDateString('es-AR')}
                          </p>
                          {(technicalExpired || technicalExpiring) && (
                            <Badge variant="destructive" className="text-xs">
                              {technicalExpired ? 'Vencida' : 'Por vencer'}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No especificada</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {operator ? operator.name : 'Sin asignar'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openEditForm(grua)}
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
                              <AlertDialogTitle>¿Eliminar grúa?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente 
                                la grúa "{grua.name}" del sistema.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteGrua(grua.id)}
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
      <GruaForm
        grua={editingGrua}
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={editingGrua ? handleUpdateGrua : handleCreateGrua}
        operators={mockOperators}
      />
    </div>
  );
}