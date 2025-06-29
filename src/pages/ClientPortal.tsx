import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ClientServiceRequest } from '@/components/portal-cliente/ClientServiceRequest';
import { ClientServiceHistory } from '@/components/portal-cliente/ClientServiceHistory';
import { ClientInvoices } from '@/components/portal-cliente/ClientInvoices';
import { ClientProfile } from '@/components/portal-cliente/ClientProfile';
import { MOCK_CLIENTS, MOCK_SERVICES } from '@/data/mockData';
import { useAuth } from '@/hooks/useAuth';
import { 
  Plus, 
  Clock, 
  CheckCircle, 
  FileText, 
  User, 
  Phone, 
  MapPin,
  Calendar,
  DollarSign,
  Truck,
  Star,
  Bell,
  LayoutDashboard,
  LogOut
} from 'lucide-react';
import { formatCurrency } from '@/lib/chile-config';

// Configuración por defecto del portal cliente
const DEFAULT_PORTAL_CONFIG = {
  enable_client_portal: true,
  show_dashboard: true,
  show_service_request: true,
  show_service_history: true,
  show_invoices: true,
  show_profile: true,
  allow_service_request: true,
  require_approval: true,
  max_service_requests_per_day: 3,
  allow_invoice_download: true,
  allow_online_payment: true,
  send_email_notifications: true,
  send_sms_notifications: false,
  welcome_message: 'Bienvenido a su portal de cliente de TMS Grúas. Aquí podrá solicitar servicios, ver su historial y gestionar sus facturas.',
  support_phone: '+56 2 2234 5678',
  support_email: 'soporte@tmsgruas.cl',
};

export function ClientPortal() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isServiceRequestOpen, setIsServiceRequestOpen] = useState(false);
  const [portalConfig, setPortalConfig] = useState(DEFAULT_PORTAL_CONFIG);
  
  const { user, logout } = useAuth();
  
  // Obtener el cliente correspondiente al usuario logueado
  const currentClient = MOCK_CLIENTS.find(c => c.name === user?.name) || MOCK_CLIENTS[0];
  const clientServices = MOCK_SERVICES.filter(s => s.client_id === currentClient.id);
  
  // Simular carga de configuración del portal
  useEffect(() => {
    // En un caso real, aquí se cargaría la configuración desde el backend
    const loadPortalConfig = async () => {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));
      // Por ahora usamos la configuración por defecto
      setPortalConfig(DEFAULT_PORTAL_CONFIG);
    };
    
    loadPortalConfig();
  }, []);
  
  // Estadísticas del cliente
  const stats = {
    total_services: clientServices.length,
    pending_services: clientServices.filter(s => ['pending', 'assigned', 'in_progress'].includes(s.status)).length,
    completed_services: clientServices.filter(s => s.status === 'completed').length,
    total_spent: clientServices.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.total_cost, 0),
    avg_rating: 4.8,
    last_service: clientServices.sort((a, b) => new Date(b.service_date).getTime() - new Date(a.service_date).getTime())[0]
  };

  const handleServiceRequest = async (data: any) => {
    // Simular creación de servicio
    console.log('Nueva solicitud de servicio:', data);
    // Aquí se enviaría al backend
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Si el portal está desactivado, mostrar mensaje
  if (!portalConfig.enable_client_portal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Portal Cliente Desactivado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              El portal de cliente se encuentra temporalmente desactivado. 
              Por favor, contacte con soporte para más información.
            </p>
            <Button onClick={handleLogout}>Volver al Inicio</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Determinar qué pestañas mostrar según la configuración
  const visibleTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, visible: portalConfig.show_dashboard },
    { id: 'request', label: 'Solicitar', icon: Plus, visible: portalConfig.show_service_request && portalConfig.allow_service_request },
    { id: 'services', label: 'Servicios', icon: Truck, visible: portalConfig.show_service_history },
    { id: 'invoices', label: 'Facturas', icon: FileText, visible: portalConfig.show_invoices },
    { id: 'profile', label: 'Perfil', icon: User, visible: portalConfig.show_profile }
  ].filter(tab => tab.visible);

  // Si no hay pestañas visibles, mostrar mensaje
  if (visibleTabs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Portal en Mantenimiento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              El portal de cliente se encuentra en mantenimiento. 
              Por favor, intente más tarde o contacte con soporte.
            </p>
            <Button onClick={handleLogout}>Cerrar Sesión</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si la pestaña activa no está visible, cambiar a la primera pestaña visible
  useEffect(() => {
    if (!visibleTabs.some(tab => tab.id === activeTab)) {
      setActiveTab(visibleTabs[0].id);
    }
  }, [activeTab, visibleTabs]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header del Portal */}
      <div className="bg-white dark:bg-slate-900 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Portal Cliente</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">TMS Grúas Chile</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <Badge variant="destructive" className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs">
                  2
                </Badge>
              </Button>
              
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    {user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Cliente Premium</p>
                </div>
              </div>
              
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full grid-cols-${visibleTabs.length} lg:w-auto lg:grid-cols-${visibleTabs.length}`}>
            {visibleTabs.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Dashboard */}
          {portalConfig.show_dashboard && (
            <TabsContent value="dashboard" className="space-y-6">
              {/* Bienvenida */}
              <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">¡Hola, {user?.name.split(' ')[0]}!</h2>
                      <p className="text-blue-100 mb-4">
                        {portalConfig.welcome_message}
                      </p>
                      {portalConfig.show_service_request && portalConfig.allow_service_request && (
                        <Button 
                          variant="secondary" 
                          onClick={() => setActiveTab('request')}
                          className="gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Solicitar Servicio
                        </Button>
                      )}
                    </div>
                    <div className="hidden md:block">
                      <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                        <Truck className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Truck className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{stats.total_services}</p>
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
                        <p className="text-2xl font-bold text-foreground">{stats.pending_services}</p>
                        <p className="text-sm text-muted-foreground">En Proceso</p>
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
                        <p className="text-2xl font-bold text-foreground">{stats.completed_services}</p>
                        <p className="text-sm text-muted-foreground">Completados</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <Star className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{stats.avg_rating}</p>
                        <p className="text-sm text-muted-foreground">Calificación</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Último Servicio y Acciones Rápidas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Último Servicio */}
                {stats.last_service && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Último Servicio
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{stats.last_service.service_number}</span>
                        <Badge variant="outline">
                          {stats.last_service.status === 'completed' ? 'Completado' : 'En Proceso'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {stats.last_service.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {new Date(stats.last_service.service_date).toLocaleDateString('es-CL')}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          {formatCurrency(stats.last_service.total_cost)}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => portalConfig.show_service_history && setActiveTab('services')}
                      >
                        Ver Detalles
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Acciones Rápidas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Acciones Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {portalConfig.show_service_request && portalConfig.allow_service_request && (
                      <Button 
                        className="w-full justify-start gap-3" 
                        onClick={() => setActiveTab('request')}
                      >
                        <Plus className="w-4 h-4" />
                        Solicitar Nuevo Servicio
                      </Button>
                    )}
                    
                    {portalConfig.show_service_history && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-3"
                        onClick={() => setActiveTab('services')}
                      >
                        <Truck className="w-4 h-4" />
                        Ver Mis Servicios
                      </Button>
                    )}
                    
                    {portalConfig.show_invoices && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-3"
                        onClick={() => setActiveTab('invoices')}
                      >
                        <FileText className="w-4 h-4" />
                        Revisar Facturas
                      </Button>
                    )}
                    
                    {portalConfig.show_profile && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-3"
                        onClick={() => setActiveTab('profile')}
                      >
                        <User className="w-4 h-4" />
                        Actualizar Perfil
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Información de Contacto */}
              <Card>
                <CardHeader>
                  <CardTitle>¿Necesitas Ayuda?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Emergencias 24/7</p>
                        <p className="text-sm text-muted-foreground">{portalConfig.support_phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Oficina Central</p>
                        <p className="text-sm text-muted-foreground">Av. Providencia 1234</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <FileText className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Soporte</p>
                        <p className="text-sm text-muted-foreground">{portalConfig.support_email}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Solicitar Servicio */}
          {portalConfig.show_service_request && portalConfig.allow_service_request && (
            <TabsContent value="request">
              <ClientServiceRequest 
                client={currentClient}
                onSubmit={handleServiceRequest}
              />
            </TabsContent>
          )}

          {/* Historial de Servicios */}
          {portalConfig.show_service_history && (
            <TabsContent value="services">
              <ClientServiceHistory 
                services={clientServices}
                client={currentClient}
              />
            </TabsContent>
          )}

          {/* Facturas */}
          {portalConfig.show_invoices && (
            <TabsContent value="invoices">
              <ClientInvoices 
                clientId={currentClient.id}
              />
            </TabsContent>
          )}

          {/* Perfil */}
          {portalConfig.show_profile && (
            <TabsContent value="profile">
              <ClientProfile 
                client={currentClient}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}