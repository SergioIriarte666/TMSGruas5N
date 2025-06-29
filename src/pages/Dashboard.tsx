import React, { useState, useEffect } from 'react';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { ServiceStatusChart } from '@/components/dashboard/ServiceStatusChart';
import { TopOperators } from '@/components/dashboard/TopOperators';
import { AlertsOverview } from '@/components/dashboard/AlertsOverview';
import { MOCK_DASHBOARD_STATS } from '@/data/mockData';
import { MOCK_OPERATORS, MOCK_TOW_TRUCKS } from '@/data/mockData';
import { MOCK_CALENDAR_EVENTS } from '@/data/mockCalendarData';
import { ExpiryAlert, generateAllAlerts } from '@/lib/expiry-alerts';
import { toast } from 'sonner';

// Mock invoices para las alertas
const MOCK_INVOICES = [
  {
    id: '1',
    invoice_number: 'F001-00000001',
    due_date: '2024-07-15',
    status: 'issued'
  },
  {
    id: '2',
    invoice_number: 'F001-00000002',
    due_date: '2024-07-05',
    status: 'issued'
  },
  {
    id: '3',
    invoice_number: 'F001-00000003',
    due_date: '2024-06-30',
    status: 'issued'
  }
];

export function Dashboard() {
  const stats = MOCK_DASHBOARD_STATS;
  const [alerts, setAlerts] = useState<ExpiryAlert[]>([]);

  // Generar alertas al cargar el componente
  useEffect(() => {
    const allAlerts = generateAllAlerts(
      MOCK_OPERATORS,
      MOCK_TOW_TRUCKS,
      MOCK_INVOICES,
      MOCK_CALENDAR_EVENTS
    );
    setAlerts(allAlerts);
  }, []);

  const handleViewAlertDetails = (alert: ExpiryAlert) => {
    // Aquí se podría abrir un modal con detalles o navegar a la página correspondiente
    // Por ahora, solo mostramos un toast
    toast.info(`Viendo detalles de: ${alert.message} - ${alert.entityName}`);
    
    // Dependiendo del tipo de entidad, podríamos navegar a diferentes páginas
    switch (alert.entityType) {
      case 'operator':
        // Navegar a la página de operadores o mostrar detalles del operador
        console.log('Navegar a detalles del operador', alert.entityId);
        break;
      case 'tow_truck':
        // Navegar a la página de grúas o mostrar detalles de la grúa
        console.log('Navegar a detalles de la grúa', alert.entityId);
        break;
      case 'invoice':
        // Navegar a la página de facturas o mostrar detalles de la factura
        console.log('Navegar a detalles de la factura', alert.entityId);
        break;
      case 'calendar':
        // Navegar a la página de calendario o mostrar detalles del evento
        console.log('Navegar a detalles del evento', alert.entityId);
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen general del sistema de gestión de transportes
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Alerts and Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts Overview */}
        <AlertsOverview 
          alerts={alerts}
          onViewDetails={handleViewAlertDetails}
        />

        {/* Charts */}
        <div className="lg:col-span-2">
          <RevenueChart data={stats.revenue_by_day} />
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ServiceStatusChart data={stats.services_by_status} />
        <TopOperators operators={stats.top_operators} />
      </div>
    </div>
  );
}