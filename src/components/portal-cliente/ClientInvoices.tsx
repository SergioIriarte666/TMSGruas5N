import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  FileText, 
  Calendar, 
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { formatCurrency } from '@/lib/chile-config';

// Mock data para facturas del cliente
const MOCK_CLIENT_INVOICES = [
  {
    id: '1',
    invoice_number: 'F001-00000001',
    invoice_type: 'factura',
    issue_date: '2024-01-25',
    due_date: '2024-02-24',
    total_amount: 101150,
    status: 'paid',
    payment_status: 'paid',
    services: ['SRV-2024-0001']
  },
  {
    id: '2',
    invoice_number: 'F001-00000003',
    invoice_type: 'factura',
    issue_date: '2024-01-20',
    due_date: '2024-02-19',
    total_amount: 75000,
    status: 'issued',
    payment_status: 'pending',
    services: ['SRV-2024-0004']
  }
];

interface ClientInvoicesProps {
  clientId: string;
}

export function ClientInvoices({ clientId }: ClientInvoicesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      issued: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      sent: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };

    const labels = {
      draft: 'Borrador',
      issued: 'Emitida',
      sent: 'Enviada',
      paid: 'Pagada',
      overdue: 'Vencida',
      cancelled: 'Cancelada'
    };

    const icons = {
      draft: Clock,
      issued: FileText,
      sent: FileText,
      paid: CheckCircle,
      overdue: AlertTriangle,
      cancelled: AlertTriangle
    };

    const Icon = icons[status as keyof typeof icons];

    return (
      <Badge variant="outline" className={colors[status as keyof typeof colors]}>
        <Icon className="w-3 h-3 mr-1" />
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      partial: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };

    const labels = {
      pending: 'Pendiente',
      partial: 'Parcial',
      paid: 'Pagado',
      overdue: 'Vencido'
    };

    return (
      <Badge variant="outline" className={colors[status as keyof typeof colors]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const filteredInvoices = MOCK_CLIENT_INVOICES.filter(invoice => {
    const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalPending = MOCK_CLIENT_INVOICES
    .filter(inv => inv.payment_status !== 'paid')
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  const totalPaid = MOCK_CLIENT_INVOICES
    .filter(inv => inv.payment_status === 'paid')
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{MOCK_CLIENT_INVOICES.length}</p>
                <p className="text-sm text-muted-foreground">Total Facturas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(totalPending).replace('$', '')}
                </p>
                <p className="text-sm text-muted-foreground">Por Pagar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(totalPaid).replace('$', '')}
                </p>
                <p className="text-sm text-muted-foreground">Pagado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Facturas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Mis Facturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar facturas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="issued">Emitida</SelectItem>
                <SelectItem value="paid">Pagada</SelectItem>
                <SelectItem value="overdue">Vencida</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista */}
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{invoice.invoice_number}</h3>
                        {getStatusBadge(invoice.status)}
                        {getPaymentStatusBadge(invoice.payment_status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>
                            Emitida: {new Date(invoice.issue_date).toLocaleDateString('es-CL')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-orange-600" />
                          <span>
                            Vence: {new Date(invoice.due_date).toLocaleDateString('es-CL')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium text-lg">
                            {formatCurrency(invoice.total_amount)}
                          </span>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        Servicios: {invoice.services.join(', ')}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedInvoice(invoice)}
                        className="gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Detalles
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        Descargar PDF
                      </Button>
                      {invoice.payment_status !== 'paid' && (
                        <Button size="sm" className="gap-2">
                          <DollarSign className="w-4 h-4" />
                          Pagar Ahora
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredInvoices.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No se encontraron facturas
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'Aún no tienes facturas registradas'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalles de Factura */}
      {selectedInvoice && (
        <Card className="fixed inset-4 z-50 bg-background shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Factura {selectedInvoice.invoice_number}</CardTitle>
            <Button variant="ghost" onClick={() => setSelectedInvoice(null)}>
              ×
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Información de Factura</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Número:</strong> {selectedInvoice.invoice_number}</p>
                  <p><strong>Estado:</strong> {getStatusBadge(selectedInvoice.status)}</p>
                  <p><strong>Fecha Emisión:</strong> {new Date(selectedInvoice.issue_date).toLocaleDateString('es-CL')}</p>
                  <p><strong>Fecha Vencimiento:</strong> {new Date(selectedInvoice.due_date).toLocaleDateString('es-CL')}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Información de Pago</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Estado Pago:</strong> {getPaymentStatusBadge(selectedInvoice.payment_status)}</p>
                  <p><strong>Total:</strong> <span className="text-lg font-semibold">{formatCurrency(selectedInvoice.total_amount)}</span></p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Servicios Incluidos</h4>
              <div className="space-y-1">
                {selectedInvoice.services.map((serviceNumber: string) => (
                  <Badge key={serviceNumber} variant="outline">
                    {serviceNumber}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}