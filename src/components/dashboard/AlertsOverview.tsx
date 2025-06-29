import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExpiryAlert, getAlertLevelColor } from '@/lib/expiry-alerts';
import { Bell, AlertTriangle, Clock, Calendar, FileText, Car, ShieldCheck, User, Brain, Stethoscope, Receipt, PenTool as Tool, IdCard, ArrowRight, CheckCircle } from 'lucide-react';

interface AlertsOverviewProps {
  alerts: ExpiryAlert[];
  onViewDetails: (alert: ExpiryAlert) => void;
}

export function AlertsOverview({ alerts, onViewDetails }: AlertsOverviewProps) {
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

  // Filtrar alertas críticas y de advertencia
  const criticalAlerts = alerts.filter(alert => alert.alertLevel === 'critical');
  const warningAlerts = alerts.filter(alert => alert.alertLevel === 'warning');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Alertas de Vencimiento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="critical">
          <TabsList className="w-full">
            <TabsTrigger value="critical" className="flex-1">
              Críticas ({criticalAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="warning" className="flex-1">
              Advertencias ({warningAlerts.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="critical" className="mt-4 space-y-3">
            {criticalAlerts.length > 0 ? (
              criticalAlerts.slice(0, 5).map((alert) => (
                <div 
                  key={alert.id} 
                  className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                  onClick={() => onViewDetails(alert)}
                >
                  <div className={`p-2 rounded-full ${getAlertLevelColor(alert.alertLevel)}`}>
                    {getAlertIcon(alert)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {getDocumentTypeLabel(alert.documentType)}
                      </p>
                      <Badge 
                        variant="destructive"
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
                  <Button variant="ghost" size="icon" className="ml-2">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="py-6 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No hay alertas críticas en este momento
                </p>
              </div>
            )}
            
            {criticalAlerts.length > 5 && (
              <Button variant="outline" className="w-full mt-2">
                Ver todas ({criticalAlerts.length})
              </Button>
            )}
          </TabsContent>
          
          <TabsContent value="warning" className="mt-4 space-y-3">
            {warningAlerts.length > 0 ? (
              warningAlerts.slice(0, 5).map((alert) => (
                <div 
                  key={alert.id} 
                  className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                  onClick={() => onViewDetails(alert)}
                >
                  <div className={`p-2 rounded-full ${getAlertLevelColor(alert.alertLevel)}`}>
                    {getAlertIcon(alert)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {getDocumentTypeLabel(alert.documentType)}
                      </p>
                      <Badge 
                        variant="outline"
                        className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                      >
                        {alert.daysRemaining} días
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
                  <Button variant="ghost" size="icon" className="ml-2">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="py-6 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No hay alertas de advertencia en este momento
                </p>
              </div>
            )}
            
            {warningAlerts.length > 5 && (
              <Button variant="outline" className="w-full mt-2">
                Ver todas ({warningAlerts.length})
              </Button>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}