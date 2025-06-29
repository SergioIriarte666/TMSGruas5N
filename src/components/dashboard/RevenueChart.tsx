import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardStats } from '@/types';

interface RevenueChartProps {
  data: DashboardStats['revenue_by_day'];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const formatCurrency = (value: number) => 
    `$${value.toLocaleString('es-AR')}`;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingresos Diarios</CardTitle>
        <CardDescription>
          Evolución de ingresos en los últimos 7 días
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={formatCurrency}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Ingresos']}
              labelFormatter={(label) => `Fecha: ${formatDate(label)}`}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}