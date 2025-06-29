import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  Truck,
  ClipboardList,
  FileText,
  BarChart3,
  Settings,
  UserCheck,
  MapPin,
  Receipt,
  Calendar
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    roles: ['admin', 'operator', 'viewer']
  },
  {
    name: 'Servicios',
    href: '/services',
    icon: ClipboardList,
    roles: ['admin', 'operator', 'viewer']
  },
  {
    name: 'Facturación',
    href: '/billing',
    icon: Receipt,
    roles: ['admin', 'viewer']
  },
  {
    name: 'Calendario',
    href: '/calendar',
    icon: Calendar,
    roles: ['admin', 'operator', 'viewer']
  },
  {
    name: 'Portal Operador',
    href: '/operator',
    icon: MapPin,
    roles: ['operator', 'admin']
  },
  {
    name: 'Clientes',
    href: '/clients',
    icon: Users,
    roles: ['admin', 'viewer']
  },
  {
    name: 'Grúas',
    href: '/tow-trucks',
    icon: Truck,
    roles: ['admin', 'viewer']
  },
  {
    name: 'Operadores',
    href: '/operators',
    icon: UserCheck,
    roles: ['admin']
  },
  {
    name: 'Reportes',
    href: '/reports',
    icon: BarChart3,
    roles: ['admin', 'viewer']
  },
  {
    name: 'Configuración',
    href: '/settings',
    icon: Settings,
    roles: ['admin']
  }
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role || 'viewer')
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-3 p-6 border-b border-border">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Truck className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">TMS Grúas</h1>
              <p className="text-sm text-muted-foreground">Sistema de Gestión</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-full">
                <span className="text-sm font-medium text-muted-foreground">
                  {user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}