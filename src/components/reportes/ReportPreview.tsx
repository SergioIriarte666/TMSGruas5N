import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Report } from '@/types';
import { Download, Send, Printer as Print, Eye, FileText, BarChart3, Calendar, Filter, TrendingUp } from 'lucide-react';
import { generateReportPDF } from '@/lib/pdf-generator';
import { formatCurrency } from '@/lib/chile-config';

interface ReportPreviewProps {
  report: Report;
  data: any;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: () => void;
  onSend?: () => void;
}

export function ReportPreview({
  report,
  data,
  isOpen,
  onClose,
  onDownload,
  onSend
}: ReportPreviewProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      generateReportPDF(report, data);
      onDownload?.();
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getTypeBadge = (type: Report['type']) => {
    const colors = {
      services: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      financial: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      operators: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      vehicles: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    };

    const labels = {
      services: 'Servicios',
      financial: 'Financiero',
      operators: 'Operadores',
      vehicles: 'Vehículos'
    };

    return (
      <Badge variant="outline" className={colors[type]}>
        {labels[type]}
      </Badge>
    );
  };

  const renderReportContent = () => {
    switch (report.type) {
      case 'services':
        return renderServicesContent();
      case 'financial':
        return renderFinancialContent();
      case 'operators':
        return renderOperatorsContent();
      case 'vehicles':
        return renderVehiclesContent();
      default:
        return null;
    }
  };

  const renderServicesContent = () => {
    const stats = data.stats || {
      total_services: 25,
      completed_services: 22,
      total_revenue: 2500000,
      avg_response_time: 28
    };

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Resumen Ejecutivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.total_services}</p>
                <p className="text-sm text-muted-foreground">Total Servicios</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.completed_services}</p>
                <p className="text-sm text-muted-foreground">Completados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.total_revenue).replace('$', '')}</p>
                <p className="text-sm text-muted-foreground">Ingresos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{stats.avg_response_time}m</p>
                <p className="text-sm text-muted-foreground">Tiempo Promedio</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Servicios por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { type: 'Remolque', count: 12, percentage: 48 },
                { type: 'Asistencia', count: 8, percentage: 32 },
                { type: 'Taxi', count: 3, percentage: 12 },
                { type: 'Transporte', count: 2, percentage: 8 }
              ].map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <span className="text-sm">{item.type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderFinancialContent = () => {
    const financial = data.financial || {
      total_revenue: 5500000,
      total_costs: 3200000,
      net_profit: 2300000,
      profit_margin: 41.8,
      invoiced_amount: 4800000,
      pending_amount: 700000
    };

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Resumen Financiero
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{formatCurrency(financial.total_revenue)}</p>
                <p className="text-sm text-muted-foreground">Ingresos Totales</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{formatCurrency(financial.total_costs)}</p>
                <p className="text-sm text-muted-foreground">Costos Totales</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(financial.net_profit)}</p>
                <p className="text-sm text-muted-foreground">Utilidad Neta</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Indicadores Clave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Margen de Utilidad:</span>
                <span className="font-bold text-green-600">{financial.profit_margin}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Monto Facturado:</span>
                <span className="font-medium">{formatCurrency(financial.invoiced_amount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Por Cobrar:</span>
                <span className="font-medium text-orange-600">{formatCurrency(financial.pending_amount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderOperatorsContent = () => {
    const operators = data.operators || [
      { name: 'Juan Operador', services_count: 45, revenue: 1250000, efficiency: 92 },
      { name: 'Pedro Conductor', services_count: 38, revenue: 980000, efficiency: 88 },
      { name: 'Carlos Chofer', services_count: 32, revenue: 850000, efficiency: 85 }
    ];

    return (
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento de Operadores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {operators.map((operator, index) => (
              <div key={operator.name} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{operator.name}</h3>
                  <Badge variant={index === 0 ? 'default' : 'secondary'}>
                    #{index + 1}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Servicios</p>
                    <p className="font-medium">{operator.services_count}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ingresos</p>
                    <p className="font-medium">{formatCurrency(operator.revenue)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Eficiencia</p>
                    <p className="font-medium">{operator.efficiency}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderVehiclesContent = () => {
    const fleet = data.fleet || {
      total_trucks: 8,
      available: 5,
      in_service: 2,
      maintenance: 1,
      utilization_rate: 75
    };

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Estado de la Flota</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{fleet.total_trucks}</p>
                <p className="text-sm text-muted-foreground">Total Grúas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{fleet.available}</p>
                <p className="text-sm text-muted-foreground">Disponibles</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{fleet.in_service}</p>
                <p className="text-sm text-muted-foreground">En Servicio</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{fleet.maintenance}</p>
                <p className="text-sm text-muted-foreground">Mantenimiento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Utilización de la Flota</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Tasa de Utilización:</span>
                <span className="font-bold text-blue-600">{fleet.utilization_rate}%</span>
              </div>
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${fleet.utilization_rate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Vista Previa del Reporte
          </DialogTitle>
          <DialogDescription>
            Revisa el contenido del reporte antes de descargar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header del reporte */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold">{report.name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    {getTypeBadge(report.type)}
                    <Badge variant="outline">
                      {report.parameters.format.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div className="flex items-center gap-1 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(report.parameters.date_from).toLocaleDateString('es-CL')} - {' '}
                      {new Date(report.parameters.date_to).toLocaleDateString('es-CL')}
                    </span>
                  </div>
                  <p>Generado: {new Date().toLocaleDateString('es-CL')}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>ID: {report.id}</span>
                </div>
                {report.parameters.filters && Object.keys(report.parameters.filters).length > 0 && (
                  <div className="flex items-center gap-1">
                    <Filter className="w-4 h-4" />
                    <span>Con filtros aplicados</span>
                  </div>
                )}
                {report.parameters.include_charts && (
                  <div className="flex items-center gap-1">
                    <BarChart3 className="w-4 h-4" />
                    <span>Incluye gráficos</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contenido del reporte */}
          {renderReportContent()}

          {/* Información adicional */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Reporte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><span className="font-medium">Generado por:</span> {report.generated_by}</p>
                  <p><span className="font-medium">Fecha de generación:</span> {new Date(report.generated_at).toLocaleString('es-CL')}</p>
                  <p><span className="font-medium">Formato:</span> {report.parameters.format.toUpperCase()}</p>
                </div>
                <div>
                  <p><span className="font-medium">Período:</span> {new Date(report.parameters.date_from).toLocaleDateString('es-CL')} - {new Date(report.parameters.date_to).toLocaleDateString('es-CL')}</p>
                  <p><span className="font-medium">Incluye gráficos:</span> {report.parameters.include_charts ? 'Sí' : 'No'}</p>
                  {report.parameters.filters && (
                    <p><span className="font-medium">Filtros:</span> {Object.keys(report.parameters.filters).length} aplicados</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            {onSend && (
              <Button variant="outline" onClick={onSend} className="gap-2">
                <Send className="w-4 h-4" />
                Enviar por Email
              </Button>
            )}
            <Button 
              onClick={handleDownloadPDF} 
              disabled={isGeneratingPDF}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              {isGeneratingPDF ? 'Generando...' : 'Descargar PDF'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}