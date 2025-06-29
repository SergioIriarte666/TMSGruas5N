import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DashboardStats } from '@/types';

interface TopOperatorsProps {
  operators: DashboardStats['top_operators'];
}

export function TopOperators({ operators }: TopOperatorsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Operadores</CardTitle>
        <CardDescription>
          Operadores con mejor rendimiento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {operators.map((item, index) => (
          <div key={item.operator.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>
                    {item.operator.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {index < 3 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs"
                  >
                    {index + 1}
                  </Badge>
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">{item.operator.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.services_count} servicios
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-foreground">
                ${item.revenue.toLocaleString('es-AR')}
              </p>
              <p className="text-xs text-muted-foreground">
                Ingresos generados
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}