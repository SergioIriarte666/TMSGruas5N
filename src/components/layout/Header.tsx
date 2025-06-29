import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { Menu, LogOut, User, Settings } from 'lucide-react';
import { AlertsDropdown } from '@/components/layout/AlertsDropdown';
import { ExpiryAlert, generateAllAlerts } from '@/lib/expiry-alerts';
import { MOCK_OPERATORS, MOCK_TOW_TRUCKS } from '@/data/mockData';
import { MOCK_CALENDAR_EVENTS } from '@/data/mockCalendarData';
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

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const [alerts, setAlerts] = useState<ExpiryAlert[]>([]);
  const [alertDetailsOpen, setAlertDetailsOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<ExpiryAlert | null>(null);

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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleMarkAsRead = (alertId: string) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === alertId ? { ...alert, read: true } : alert
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => ({ ...alert, read: true }))
    );
  };

  const handleViewAlertDetails = (alert: ExpiryAlert) => {
    setSelectedAlert(alert);
    
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
    <header className="flex items-center justify-between px-6 py-4 bg-background border-b border-border">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </Button>
        
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Bienvenido, {user?.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('es-AR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Alertas */}
        <AlertsDropdown 
          alerts={alerts}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onViewDetails={handleViewAlertDetails}
        />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 p-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-sm">
                  {user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-fit flex flex-row flex-wrap gap-2 p-2 z-[9999]">
            <DropdownMenuItem className="w-fit flex items-center gap-2">
              <User className="w-4 h-4" />
              Mi Perfil
            </DropdownMenuItem>
            <DropdownMenuItem className="w-fit flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator className="w-full" />
            <DropdownMenuItem 
              className="w-fit flex items-center gap-2 text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}