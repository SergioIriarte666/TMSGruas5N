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
import { OperadorForm } from '@/components/operadores/OperadorForm';
import { MOCK_OPERATORS, ExtendedUser } from '@/data/mockData';
import { User } from '@/types';
import { Plus, Search, Filter, Eye, Edit, Trash2, Users, UserCheck, Shield, Clock, FileText, Stethoscope, Brain } from 'lucide-react';
import { toast } from 'sonner';

export function Operators() {
  const [operadores, setOperadores] = useState<ExtendedUser[]>(MOCK_OPERATORS);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOperador, setEditingOperador] = useState<ExtendedUser | undefined>();

  const getRoleBadge = (role: User['role']) => {
    const variants = {
      admin: 'default',
      operator: 'default',
      viewer: 'secondary'
    } as const;

    const labels = {
      admin: 'Administrador',
      operator: 'Operador',
      viewer: 'Supervisor'
    };

    const colors = {
      admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      operator: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      viewer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    };

    return (
      <Badge variant={variants[role]} className={colors[role]}>
        {labels[role]}
      </Badge>
    );
  };

  const getStatusBadge = (status: ExtendedUser['status']) => {
    if (!status) return null;

    const variants = {
      active: 'default',
      inactive: 'secondary',
      on_leave: 'destructive'
    } as const;

    const labels = {
      active: 'Activo',
      inactive: 'Inactivo',
      on_leave: 'De Licencia'
    };

    const colors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      on_leave: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const isLicenseExpiring = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isLicenseExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  };

  const filteredOperadores = operadores.filter(operador => {
    const matchesSearch = operador.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         operador.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (operador.phone && operador.phone.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || operador.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || operador.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateOperador = async (data: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newOperador: ExtendedUser = {
      id: (operadores.length + 1).toString(),
      ...data,
      status: 'active',
      services_completed: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setOperadores([...operadores, newOperador]);
    toast.success('Operador creado exitosamente');
  };

  const handleUpdateOperador = async (data: any) => {
    if (!editingOperador) return;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const updatedOperadores = operadores.map(operador =>
      operador.id === editingOperador.id
        ? { ...operador, ...data, updated_at: new Date().toISOString() }
        : operador
    );

    setOperadores(updatedOperadores);
    setEditingOperador(undefined);
    toast.success('Operador actualizado exitosamente');
  };

  const handleDeleteOperador = async (id: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    setOperadores(operadores.filter(operador => operador.id !== id));
    toast.success('Operador eliminado exitosamente');
  };

  const openEditForm = (operador: ExtendedUser) => {
    setEditingOperador(operador);
    setIsFormOpen(true);
  };

  const openCreateForm = () => {
    setEditingOperador(undefined);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingOperador(undefined);
  };

  // Statistics
  const stats = {
    total: operadores.length,
    active: operadores.filter(o => o.status === 'active').length,
    operators: operadores.filter(o => o.role === 'operator').length,
    expiring_licenses: operadores.filter(o => isLicenseExpiring(o.license_expiry)).length,
    expiring_exams: operadores.filter(o => 
      isLicenseExpiring(o.occupational_exam_expiry) || 
      isLicenseExpiring(o.psychosensometric_exam_expiry)
    ).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Operadores</h1>
          <p className="text-muted-foreground">
            Administra el personal y sus permisos en el sistema
          </p>
        </div>
        <Button onClick={openCreateForm} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Operador
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Personal</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.operators}</p>
                <p className="text-sm text-muted-foreground">Operadores</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.expiring_licenses}</p>
                <p className="text-sm text-muted-foreground">Licencias por Vencer</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <Stethoscope className="w-6 h-6 text-red-600 dark:text-red-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.expiring_exams}</p>
                <p className="text-sm text-muted-foreground">Exámenes por Vencer</p>
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
                  placeholder="Buscar por nombre, email o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="operator">Operador</SelectItem>
                <SelectItem value="viewer">Supervisor</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
                <SelectItem value="on_leave">De Licencia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Operators Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Operador</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Licencia</TableHead>
                <TableHead>Examen Ocupacional</TableHead>
                <TableHead>Psicosensotécnico</TableHead>
                <TableHead>Servicios</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOperadores.map((operador) => {
                const licenseExpiring = isLicenseExpiring(operador.license_expiry);
                const licenseExpired = isLicenseExpired(operador.license_expiry);
                
                const occupationalExpiring = isLicenseExpiring(operador.occupational_exam_expiry);
                const occupationalExpired = isLicenseExpired(operador.occupational_exam_expiry);
                
                const psychoExpiring = isLicenseExpiring(operador.psychosensometric_exam_expiry);
                const psychoExpired = isLicenseExpired(operador.psychosensometric_exam_expiry);
                
                return (
                  <TableRow key={operador.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            {operador.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{operador.name}</p>
                          {operador.license_number && (
                            <p className="text-sm text-muted-foreground">
                              Lic: {operador.license_number}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{operador.email}</TableCell>
                    <TableCell>{operador.phone || 'No especificado'}</TableCell>
                    <TableCell>{getRoleBadge(operador.role)}</TableCell>
                    <TableCell>{getStatusBadge(operador.status)}</TableCell>
                    <TableCell>
                      {operador.license_expiry ? (
                        <div className="space-y-1">
                          <p className={`text-sm ${
                            licenseExpired ? 'text-red-600' : 
                            licenseExpiring ? 'text-orange-600' : 
                            'text-muted-foreground'
                          }`}>
                            {new Date(operador.license_expiry).toLocaleDateString('es-AR')}
                          </p>
                          {(licenseExpired || licenseExpiring) && (
                            <Badge variant="destructive" className="text-xs">
                              {licenseExpired ? 'Vencida' : 'Por vencer'}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No especificada</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {operador.occupational_exam_expiry ? (
                        <div className="space-y-1">
                          <p className={`text-sm ${
                            occupationalExpired ? 'text-red-600' : 
                            occupationalExpiring ? 'text-orange-600' : 
                            'text-muted-foreground'
                          }`}>
                            {new Date(operador.occupational_exam_expiry).toLocaleDateString('es-AR')}
                          </p>
                          {(occupationalExpired || occupationalExpiring) && (
                            <Badge variant="destructive" className="text-xs">
                              {occupationalExpired ? 'Vencido' : 'Por vencer'}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No especificado</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {operador.psychosensometric_exam_expiry ? (
                        <div className="space-y-1">
                          <p className={`text-sm ${
                            psychoExpired ? 'text-red-600' : 
                            psychoExpiring ? 'text-orange-600' : 
                            'text-muted-foreground'
                          }`}>
                            {new Date(operador.psychosensometric_exam_expiry).toLocaleDateString('es-AR')}
                          </p>
                          {(psychoExpired || psychoExpiring) && (
                            <Badge variant="destructive" className="text-xs">
                              {psychoExpired ? 'Vencido' : 'Por vencer'}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No especificado</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {operador.role === 'operator' ? (
                        <span className="font-medium">{operador.services_completed || 0}</span>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openEditForm(operador)}
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
                              <AlertDialogTitle>¿Eliminar operador?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente 
                                el operador "{operador.name}" del sistema.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteOperador(operador.id)}
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
      <OperadorForm
        operador={editingOperador}
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={editingOperador ? handleUpdateOperador : handleCreateOperador}
      />
    </div>
  );
}