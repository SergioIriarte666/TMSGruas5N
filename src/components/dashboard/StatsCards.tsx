import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from '@/types';
import { 
  ClipboardList, 
  Clock, 
  Users, 
  Truck, 
  DollarSign, 
  TrendingUp 
} from 'lucide-react';

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Servicios Hoy',
      value: stats.today_services,
      icon: ClipboardList,
      description: 'Total del día',
      color: 'text-blue-600'
    },
    {
      title: 'Pendientes',
      value: stats.pending_services,
      icon: Clock,
      description: 'Por asignar',
      color: 'text-orange-600'
    },
    {
      title: 'Operadores Activos',
      value: stats.active_operators,
      icon: Users,
      description: 'En servicio',
      color: 'text-green-600'
    },
    {
      title: 'Grúas Disponibles',
      value: stats.available_trucks,
      icon: Truck,
      description: 'Listas para servicio',
      color: 'text-purple-600'
    },
    {
      title: 'Ingresos Hoy',
      value: `$${stats.today_revenue.toLocaleString('es-AR')}`,
      icon: DollarSign,
      description: 'Facturado',
      color: 'text-emerald-600'
    },
    {
      title: 'Ingresos Mensuales',
      value: `$${stats.monthly_revenue.toLocaleString('es-AR')}`,
      icon: TrendingUp,
      description: 'Mes actual',
      color: 'text-cyan-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {card.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}