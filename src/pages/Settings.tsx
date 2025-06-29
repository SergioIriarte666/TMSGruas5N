import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CompanySettings } from '@/components/configuracion/CompanySettings';
import { SystemSettings } from '@/components/configuracion/SystemSettings';
import { ServiceSettings } from '@/components/configuracion/ServiceSettings';
import { ClientPortalSettings } from '@/components/configuracion/ClientPortalSettings';
import { OperatorPortalSettings } from '@/components/configuracion/OperatorPortalSettings';
import { NotificationSettings } from '@/components/configuracion/NotificationSettings';
import { 
  Building, 
  Settings as SettingsIcon, 
  Truck, 
  Users, 
  Database, 
  Shield,
  Activity,
  HardDrive,
  UserCheck,
  Bell
} from 'lucide-react';

export function Settings() {
  const [activeTab, setActiveTab] = useState('company');

  const handleSaveCompany = async (data: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Company settings saved:', data);
  };

  const handleSaveSystem = async (data: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('System settings saved:', data);
  };

  const handleSaveService = async (data: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Service settings saved:', data);
  };

  const handleSaveClientPortal = async (data: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Client portal settings saved:', data);
  };

  const handleSaveOperatorPortal = async (data: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Operator portal settings saved:', data);
  };

  const handleSaveNotifications = async (data: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Notification settings saved:', data);
  };

  // System status data
  const systemStatus = {
    database: { status: 'healthy', last_backup: '2024-01-25T02:00:00Z' },
    server: { status: 'healthy', uptime: '15 días, 8 horas' },
    storage: { used: 45, total: 100, unit: 'GB' },
    active_users: 12,
    active_sessions: 8,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configuración del Sistema</h1>
        <p className="text-muted-foreground">
          Administra la configuración general, servicios y parámetros del sistema
        </p>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Database className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Base de Datos</p>
                <p className="text-xs text-green-600">Saludable</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Servidor</p>
                <p className="text-xs text-blue-600">{systemStatus.server.uptime}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <HardDrive className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Almacenamiento</p>
                <p className="text-xs text-purple-600">
                  {systemStatus.storage.used}/{systemStatus.storage.total} {systemStatus.storage.unit}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Users className="w-6 h-6 text-orange-600 dark:text-orange-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Usuarios Activos</p>
                <p className="text-xs text-orange-600">{systemStatus.active_users} conectados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4" />
            Sistema
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Servicios
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Alertas
          </TabsTrigger>
          <TabsTrigger value="client-portal" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Portal Cliente
          </TabsTrigger>
          <TabsTrigger value="operator-portal" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Portal Operador
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6">
          <CompanySettings onSave={handleSaveCompany} />
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <SystemSettings onSave={handleSaveSystem} />
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <ServiceSettings onSave={handleSaveService} />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettings onSave={handleSaveNotifications} />
        </TabsContent>

        <TabsContent value="client-portal" className="space-y-6">
          <ClientPortalSettings onSave={handleSaveClientPortal} />
        </TabsContent>

        <TabsContent value="operator-portal" className="space-y-6">
          <OperatorPortalSettings onSave={handleSaveOperatorPortal} />
        </TabsContent>
      </Tabs>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Información del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium">Versión del Sistema</h4>
              <p className="text-sm text-muted-foreground">TMS Grúas v2.1.0</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Último Respaldo</h4>
              <p className="text-sm text-muted-foreground">
                {new Date(systemStatus.database.last_backup).toLocaleString('es-AR')}
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Sesiones Activas</h4>
              <p className="text-sm text-muted-foreground">
                {systemStatus.active_sessions} sesiones abiertas
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Licencia</h4>
              <p className="text-sm text-muted-foreground">Empresarial - Válida hasta 2025</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Soporte Técnico</h4>
              <p className="text-sm text-muted-foreground">soporte@tmsgruas.com</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Documentación</h4>
              <p className="text-sm text-muted-foreground">
                <a href="#" className="text-primary hover:underline">
                  Manual de Usuario
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}