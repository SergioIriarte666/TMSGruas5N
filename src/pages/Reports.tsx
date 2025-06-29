import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
import { ReportGenerator } from '@/components/reportes/ReportGenerator';
import { ReportPreview } from '@/components/reportes/ReportPreview';
import { Report } from '@/types';
import { 
  Plus, 
  Download, 
  Trash2, 
  FileText, 
  BarChart3, 
  DollarSign, 
  Users, 
  Car,
  Calendar,
  TrendingUp,
  PieChart,
  Activity,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

// Mock data for reports
const MOCK_REPORTS: Report[] = [
  {
    id: '1',
    name: 'Reporte Mensual Enero 2024',
    type: 'services',
    parameters: {
      date_from: '2024-01-01',
      date_to: '2024-01-31',
      format: 'pdf',
      include_charts: true,
      filters: {
        status: ['completed'],
        service_types: ['tow', 'assistance']
      }
    },
    generated_by: 'admin@tmsgruas.com',
    generated_at: '2024-01-25T10:30:00Z',
    file_url: '/reports/services-enero-2024.pdf'
  },
  {
    id: '2',
    name: 'Análisis Financiero Q1 2024',
    type: 'financial',
    parameters: {
      date_from: '2024-01-01',
      date_to: '2024-03-31',
      format: 'excel',
      include_charts: true
    },
    generated_by: 'admin@tmsgruas.com',
    generated_at: '2024-01-20T15:45:00Z',
    file_url: '/reports/financial-q1-2024.xlsx'
  },
  {
    id: '3',
    name: 'Rendimiento Operadores',
    type: 'operators',
    parameters: {
      date_from: '2024-01-01',
      date_to: '2024-01-31',
      format: 'pdf',
      include_charts: true,
      filters: {
        operators: ['2', '3']
      }
    },
    generated_by: 'admin@tmsgruas.com',
    generated_at: '2024-01-18T09:15:00Z',
    file_url: '/reports/operators-enero-2024.pdf'
  }
];

export function Reports() {
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewReport, setPreviewReport] = useState<Report | undefined>();

  const getReportTypeBadge = (type: Report['type']) => {
    const variants = {
      services: 'default',
      financial: 'default',
      operators: 'secondary',
      vehicles: 'outline'
    } as const;

    const labels = {
      services: 'Servicios',
      financial: 'Financiero',
      operators: 'Operadores',
      vehicles: 'Vehículos'
    };

    const colors = {
      services: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      financial: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      operators: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      vehicles: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    };

    return (
      <Badge variant={variants[type]} className={colors[type]}>
        {labels[type]}
      </Badge>
    );
  };

  const getFormatBadge = (format: string) => {
    const colors = {
      pdf: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      excel: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      csv: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    };

    return (
      <Badge variant="outline" className={colors[format as keyof typeof colors]}>
        {format.toUpperCase()}
      </Badge>
    );
  };

  const handleGenerateReport = async (data: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newReport: Report = {
      id: (reports.length + 1).toString(),
      name: data.name,
      type: data.type,
      parameters: data,
      generated_by: 'admin@tmsgruas.com',
      generated_at: new Date().toISOString(),
      file_url: `/reports/${data.name.toLowerCase().replace(/\s+/g, '-')}.${data.format}`
    };

    setReports([newReport, ...reports]);
    toast.success('Reporte generado exitosamente');
  };

  const handleDeleteReport = async (id: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    setReports(reports.filter(report => report.id !== id));
    toast.success('Reporte eliminado exitosamente');
  };

  const handlePreviewReport = (report: Report) => {
    setPreviewReport(report);
    setIsPreviewOpen(true);
  };

  const handleDownloadReport = (report: Report) => {
    // PDF generation is handled in the preview component
    toast.success(`Descargando ${report.name}...`);
  };

  // Mock data for report previews
  const getReportData = (report: Report) => {
    switch (report.type) {
      case 'services':
        return {
          stats: {
            total_services: 25,
            completed_services: 22,
            total_revenue: 2500000,
            avg_response_time: 28
          },
          services: []
        };
      case 'financial':
        return {
          financial: {
            total_revenue: 5500000,
            total_costs: 3200000,
            net_profit: 2300000,
            profit_margin: 41.8,
            invoiced_amount: 4800000,
            pending_amount: 700000
          },
          revenue_by_day: [
            { date: '2024-01-20', revenue: 385000 },
            { date: '2024-01-21', revenue: 420000 },
            { date: '2024-01-22', revenue: 350000 },
            { date: '2024-01-23', revenue: 485000 },
            { date: '2024-01-24', revenue: 520000 },
            { date: '2024-01-25', revenue: 395000 }
          ]
        };
      case 'operators':
        return {
          operators: [
            { name: 'Juan Operador', services_count: 45, revenue: 1250000, efficiency: 92 },
            { name: 'Pedro Conductor', services_count: 38, revenue: 980000, efficiency: 88 },
            { name: 'Carlos Chofer', services_count: 32, revenue: 850000, efficiency: 85 }
          ]
        };
      case 'vehicles':
        return {
          fleet: {
            total_trucks: 8,
            available: 5,
            in_service: 2,
            maintenance: 1,
            utilization_rate: 75
          },
          vehicles: [
            { name: 'Grúa 01', license_plate: 'GRU001', status: 'available', capacity: '3.5t' },
            { name: 'Grúa 02', license_plate: 'GRU002', status: 'in_service', capacity: '2.5t' },
            { name: 'Grúa 03', license_plate: 'GRU003', status: 'maintenance', capacity: '4.0t' }
          ]
        };
      default:
        return {};
    }
  };

  // Statistics
  const stats = {
    total: reports.length,
    this_month: reports.filter(r => {
      const reportDate = new Date(r.generated_at);
      const now = new Date();
      return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
    }).length,
    by_type: reports.reduce((acc, report) => {
      acc[report.type] = (acc[report.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  const quickReports = [
    {
      title: 'Servicios del Día',
      description: 'Reporte de servicios completados hoy',
      icon: Activity,
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      action: () => {
        const today = new Date().toISOString().split('T')[0];
        handleGenerateReport({
          name: `Servicios del Día ${today}`,
          type: 'services',
          date_from: today,
          date_to: today,
          format: 'pdf',
          include_charts: true
        });
      }
    },
    {
      title: 'Resumen Semanal',
      description: 'Análisis de la semana actual',
      icon: TrendingUp,
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      action: () => {
        const today = new Date();
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
        const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
        
        handleGenerateReport({
          name: `Resumen Semanal ${weekStart.toISOString().split('T')[0]}`,
          type: 'financial',
          date_from: weekStart.toISOString().split('T')[0],
          date_to: weekEnd.toISOString().split('T')[0],
          format: 'excel',
          include_charts: true
        });
      }
    },
    {
      title: 'Estado de Flota',
      description: 'Reporte actual de vehículos y grúas',
      icon: Car,
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      action: () => {
        const today = new Date().toISOString().split('T')[0];
        handleGenerateReport({
          name: `Estado de Flota ${today}`,
          type: 'vehicles',
          date_from: today,
          date_to: today,
          format: 'pdf',
          include_charts: true
        });
      }
    },
    {
      title: 'Rendimiento Operadores',
      description: 'Análisis mensual de operadores',
      icon: Users,
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      action: () => {
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        handleGenerateReport({
          name: `Rendimiento Operadores ${monthStart.toISOString().split('T')[0]}`,
          type: 'operators',
          date_from: monthStart.toISOString().split('T')[0],
          date_to: monthEnd.toISOString().split('T')[0],
          format: 'pdf',
          include_charts: true
        });
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reportes y Análisis</h1>
          <p className="text-muted-foreground">
            Genera reportes personalizados y analiza el rendimiento del negocio
          </p>
        </div>
        <Button onClick={() => setIsGeneratorOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Generar Reporte
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Reportes</p>
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
                <p className="text-2xl font-bold text-foreground">{stats.this_month}</p>
                <p className="text-sm text-muted-foreground">Este Mes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.by_type.services || 0}</p>
                <p className="text-sm text-muted-foreground">Servicios</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.by_type.financial || 0}</p>
                <p className="text-sm text-muted-foreground">Financieros</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Reportes Rápidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickReports.map((report, index) => {
              const Icon = report.icon;
              return (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" onClick={report.action}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${report.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{report.title}</p>
                        <p className="text-xs text-muted-foreground">{report.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Reports History */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Reportes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Formato</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Generado por</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.name}</TableCell>
                  <TableCell>{getReportTypeBadge(report.type)}</TableCell>
                  <TableCell>{getFormatBadge(report.parameters.format)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{new Date(report.parameters.date_from).toLocaleDateString('es-AR')}</p>
                      <p className="text-muted-foreground">
                        hasta {new Date(report.parameters.date_to).toLocaleDateString('es-AR')}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{report.generated_by}</TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {new Date(report.generated_at).toLocaleDateString('es-AR')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handlePreviewReport(report)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDownloadReport(report)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar reporte?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente 
                              el reporte "{report.name}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteReport(report.id)}
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Report Generator Dialog */}
      <ReportGenerator
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onGenerate={handleGenerateReport}
      />

      {/* Report Preview Dialog */}
      {previewReport && (
        <ReportPreview
          report={previewReport}
          data={getReportData(previewReport)}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onDownload={() => handleDownloadReport(previewReport)}
        />
      )}
    </div>
  );
}