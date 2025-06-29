import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Bell, AlertTriangle, Clock, CheckCircle, FileText, Car, ShieldCheck, User, Brain, Stethoscope, Calendar, Receipt, PenTool as Tool, IdCard } from 'lucide-react';
import { ExpiryAlert, getAlertLevelColor } from '@/lib/expiry-alerts';

interface AlertsDropdownProps {
  alerts: ExpiryAlert[];
  onMarkAsRead: (alertId: string) => void;
  onMarkAllAsRead: () => void;
  onViewDetails: (alert: ExpiryAlert) => void;
}

export function AlertsDropdown({ alerts, onMarkAsRead, onMarkAllAsRead, onViewDetails }: AlertsDropdownProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [isOpen, setIsOpen] = useState(false);

  // Filtrar alertas según la pestaña activa
  const filteredAlerts = activeTab === 'all' 
    ? alerts 
    : activeTab === 'critical' 
      ? alerts.filter(alert => alert.alertLevel === 'critical')
      : alerts.filter(alert => alert.alertLevel === 'warning');

  // Contar alertas no leídas
  const unreadCount = alerts.filter(alert => !alert.read).length;

  // Obtener icono según el tipo de documento
  const getAlertIcon = (alert: ExpiryAlert) => {
    switch (alert.documentType) {
      case 'license':
        return <IdCard className="w-4 h-4" />;
      case 'occupational_exam':
        return <Stethoscope className="w-4 h-4" />;
      case 'psychosensometric_exam':
        return <Brain className="w-4 h-4" />;
      case 'circulation_permit':
        return <FileText className="w-4 h-4" />;
      case 'soap':
        return <ShieldCheck className="w-4 h-4" />;
      case 'technical_review':
        return <Car className="w-4 h-4" />;
      case 'invoice':
        return <Receipt className="w-4 h-4" />;
      case 'calendar_event':
        return <Calendar className="w-4 h-4" />;
      case 'service_deadline':
        return <Clock className="w-4 h-4" />;
      case 'maintenance_schedule':
        return <Tool className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  // Obtener etiqueta para el tipo de entidad
  const getEntityTypeLabel = (entityType: ExpiryAlert['entityType']) => {
    switch (entityType) {
      case 'operator':
        return 'Operador';
      case 'tow_truck':
        return 'Grúa';
      case 'invoice':
        return 'Factura';
      case 'calendar':
        return 'Calendario';
      case 'service':
        return 'Servicio';
      case 'maintenance':
        return 'Mantenimiento';
      default:
        return 'Entidad';
    }
  };

  // Obtener etiqueta para el tipo de documento
  const getDocumentTypeLabel = (documentType: ExpiryAlert['documentType']) => {
    switch (documentType) {
      case 'license':
        return 'Licencia';
      case 'occupational_exam':
        return 'Examen Ocupacional';
      case 'psychosensometric_exam':
        return 'Examen Psicosensotécnico';
      case 'circulation_permit':
        return 'Permiso de Circulación';
      case 'soap':
        return 'SOAP';
      case 'technical_review':
        return 'Revisión Técnica';
      case 'invoice':
        return 'Factura';
      case 'calendar_event':
        return 'Evento';
      case 'service_deadline':
        return 'Plazo de Servicio';
      case 'maintenance_schedule':
        return 'Mantenimiento';
      default:
        return 'Documento';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[380px] z-[9999]" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="text-base font-semibold">Notificaciones</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onMarkAllAsRead}
              className="h-8 text-xs"
            >
              Marcar todas como leídas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="px-2 py-2">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                Todas ({alerts.length})
              </TabsTrigger>
              <TabsTrigger value="critical" className="flex-1">
                Críticas ({alerts.filter(a => a.alertLevel === 'critical').length})
              </TabsTrigger>
              <TabsTrigger value="warning" className="flex-1">
                Advertencias ({alerts.filter(a => a.alertLevel === 'warning').length})
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="m-0">
            <div className="max-h-[300px] overflow-y-auto">
              {renderAlertList(filteredAlerts)}
            </div>
          </TabsContent>
          
          <TabsContent value="critical" className="m-0">
            <div className="max-h-[300px] overflow-y-auto">
              {renderAlertList(filteredAlerts)}
            </div>
          </TabsContent>
          
          <TabsContent value="warning" className="m-0">
            <div className="max-h-[300px] overflow-y-auto">
              {renderAlertList(filteredAlerts)}
            </div>
          </TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  function renderAlertList(alertsToRender: ExpiryAlert[]) {
    if (alertsToRender.length === 0) {
      return (
        <div className="py-6 text-center">
          <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm text-muted-foreground">
            No hay notificaciones {activeTab !== 'all' ? 'en esta categoría' : ''}
          </p>
        </div>
      );
    }

    return (
      <DropdownMenuGroup>
        {alertsToRender.map((alert) => (
          <DropdownMenuItem 
            key={alert.id} 
            className={`px-4 py-3 cursor-pointer ${!alert.read ? 'bg-muted/50' : ''}`}
            onClick={() => {
              onMarkAsRead(alert.id);
              onViewDetails(alert);
              setIsOpen(false);
            }}
          >
            <div className="flex gap-3 w-full">
              <div className={`p-2 rounded-full ${getAlertLevelColor(alert.alertLevel)}`}>
                {getAlertIcon(alert)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {getDocumentTypeLabel(alert.documentType)}
                  </p>
                  <Badge 
                    variant={alert.alertLevel === 'critical' ? 'destructive' : 'outline'}
                    className={alert.alertLevel === 'critical' 
                      ? '' 
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'}
                  >
                    {alert.daysRemaining < 0 
                      ? 'Vencido' 
                      : alert.daysRemaining === 0 
                        ? 'Hoy' 
                        : `${alert.daysRemaining} días`}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {alert.message}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="w-3 h-3" />
                  <span>{getEntityTypeLabel(alert.entityType)}:</span>
                  <span className="font-medium">{alert.entityName}</span>
                </div>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuGroup>
    );
  }
}