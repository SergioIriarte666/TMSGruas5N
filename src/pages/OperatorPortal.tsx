import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { OperatorActiveService } from '@/components/portal-operador/OperatorActiveService';
import { OperatorServiceHistory } from '@/components/portal-operador/OperatorServiceHistory';
import { OperatorInspections } from '@/components/portal-operador/OperatorInspections';
import { OperatorProfile } from '@/components/portal-operador/OperatorProfile';
import { MOCK_SERVICES } from '@/data/mockData';
import { useAuth } from '@/hooks/useAuth';
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
  Bell,
  LayoutDashboard,
  LogOut,
  Calendar,
  Star
} from 'lucide-react';

// Configuración por defecto del portal operador
const DEFAULT_PORTAL_CONFIG = {
  enable_operator_portal: true,
  show_dashboard: true,
  show_active_service: true,
  show_service_history: true,
  show_inspections: true,
  show_profile: true,
  allow_service_status_update: true,
  allow_service_completion: true,
  require_photos: true,
  require_signature: true,
  enable_location_tracking: true,
  location_update_interval: 5,
  send_email_notifications: true,
  send_sms_notifications: true,
  send_push_notifications: true,
  welcome_message: 'Bienvenido al portal de operadores de TMS Grúas. Aquí podrás gestionar tus servicios asignados y completar inspecciones.',
  support_phone: '+56 2 2234 5678',
  support_email: 'soporte@tmsgruas.cl',
};

export function OperatorPortal() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [portalConfig, setPortalConfig] = useState(DEFAULT_PORTAL_CONFIG);
  const [currentService, setCurrentService] = useState(MOCK_SERVICES[1]); // Servicio en progreso
  
  const { user, logout } = useAuth();
  
  // Filtrar servicios asignados al operador actual
  const operatorServices = MOCK_SERVICES.filter(s => s.operator_id === user?.id);
  
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
  
  // Estadísticas del operador
  const stats = {
    today_services: 3,
    week_services: 12,
    month_services: 45,
    efficiency: 98,
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Si el portal está desactivado, mostrar mensaje
  if (!portalConfig.enable_operator_portal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Portal Operador Desactivado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              El portal de operador se encuentra temporalmente desactivado. 
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
    { id: 'active', label: 'Servicio Actual', icon: Truck, visible: portalConfig.show_active_service },
    { id: 'history', label: 'Historial', icon: Clock, visible: portalConfig.show_service_history },
    { id: 'inspections', label: 'Inspecciones', icon: FileText, visible: portalConfig.show_inspections },
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
              El portal de operador se encuentra en mantenimiento. 
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
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Portal Operador</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">TMS Grúas Chile</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <Badge variant="destructive" className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs">
                  3
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
                  <p className="text-xs text-gray-500 dark:text-gray-400">Operador</p>
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
          <TabsList className="horizontal-menu-wrapper force-horizontal">
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
                      {portalConfig.show_active_service && currentService && (
                        <Button 
                          variant="secondary" 
                          onClick={() => setActiveTab('active')}
                          className="gap-2"
                        >
                          <Truck className="w-4 h-4" />
                          Ver Servicio Actual
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
                        <p className="text-2xl font-bold text-foreground">{stats.today_services}</p>
                        <p className="text-sm text-muted-foreground">Servicios Hoy</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <Calendar className="w-6 h-6 text-green-600 dark:text-green-300" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{stats.week_services}</p>
                        <p className="text-sm text-muted-foreground">Esta Semana</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <Clock className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{stats.month_services}</p>
                        <p className="text-sm text-muted-foreground">Este Mes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                        <Star className="w-6 h-6 text-orange-600 dark:text-orange-300" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{stats.efficiency}%</p>
                        <p className="text-sm text-muted-foreground">Eficiencia</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Servicio Actual y Acciones Rápidas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Servicio Actual */}
                {currentService && (
                  <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Servicio Actual</CardTitle>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          En Progreso
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Service Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Número de Servicio</p>
                          <p className="font-semibold">{currentService.service_number}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Cliente</p>
                          <p className="font-semibold">Carlos Rodriguez</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-muted-foreground">Descripción</p>
                          <p className="font-medium">{currentService.description}</p>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                        <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-600">Origen</p>
                          <p className="text-sm">{currentService.origin_address}</p>
                        </div>
                        <Button size="sm" variant="outline" className="gap-2">
                          <Navigation className="w-4 h-4" />
                          Navegar
                        </Button>
                      </div>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setActiveTab('active')}
                        className="w-full"
                      >
                        Ver Detalles Completos
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
                    {portalConfig.show_active_service && currentService && (
                      <Button 
                        className="w-full justify-start gap-3" 
                        onClick={() => setActiveTab('active')}
                      >
                        <Truck className="w-4 h-4" />
                        Gestionar Servicio Actual
                      </Button>
                    )}
                    
                    {portalConfig.show_inspections && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-3"
                        onClick={() => setActiveTab('inspections')}
                      >
                        <Camera className="w-4 h-4" />
                        Nueva Inspección
                      </Button>
                    )}
                    
                    {portalConfig.show_service_history && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-3"
                        onClick={() => setActiveTab('history')}
                      >
                        <Clock className="w-4 h-4" />
                        Ver Historial
                      </Button>
                    )}
                    
                    {portalConfig.show_profile && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-3"
                        onClick={() => setActiveTab('profile')}
                      >
                        <User className="w-4 h-4" />
                        Mi Perfil
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
                        <p className="font-medium">Soporte 24/7</p>
                        <p className="text-sm text-muted-foreground">{portalConfig.support_phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Base Central</p>
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

          {/* Servicio Activo */}
          {portalConfig.show_active_service && (
            <TabsContent value="active">
              <OperatorActiveService 
                service={currentService}
                config={portalConfig}
              />
            </TabsContent>
          )}

          {/* Historial de Servicios */}
          {portalConfig.show_service_history && (
            <TabsContent value="history">
              <OperatorServiceHistory 
                services={operatorServices}
              />
            </TabsContent>
          )}

          {/* Inspecciones */}
          {portalConfig.show_inspections && (
            <TabsContent value="inspections">
              <OperatorInspections 
                services={operatorServices}
              />
            </TabsContent>
          )}

          {/* Perfil */}
          {portalConfig.show_profile && (
            <TabsContent value="profile">
              <OperatorProfile 
                operator={user}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}