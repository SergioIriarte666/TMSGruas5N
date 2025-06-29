import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DashboardStats } from '@/types';

interface ServiceStatusChartProps {
  data: DashboardStats['services_by_status'];
}

export function ServiceStatusChart({ data }: ServiceStatusChartProps) {
  const chartData = Object.entries(data).map(([status, count]) => ({
    name: getStatusLabel(status),
    value: count,
    status
  }));

  const COLORS = {
    pending: '#f59e0b',
    assigned: '#3b82f6',
    in_progress: '#8b5cf6',
    completed: '#10b981',
    cancelled: '#ef4444'
  };

  function getStatusLabel(status: string): string {
    const labels = {
      pending: 'Pendiente',
      assigned: 'Asignado',
      in_progress: 'En Progreso',
      completed: 'Completado',
      cancelled: 'Cancelado'
    };
    return labels[status as keyof typeof labels] || status;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de Servicios</CardTitle>
        <CardDescription>
          Distribución por estado actual
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={(entry) => `${entry.name}: ${entry.value}`}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.status as keyof typeof COLORS]} 
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}