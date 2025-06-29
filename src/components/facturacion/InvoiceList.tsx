import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Invoice } from '@/types/billing';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Download, 
  Send, 
  CreditCard,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  X
} from 'lucide-react';
import { formatCurrency } from '@/lib/chile-config';

interface InvoiceListProps {
  invoices: Invoice[];
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onDownload: (invoice: Invoice) => void;
  onSend: (invoice: Invoice) => void;
  onMarkPaid: (invoice: Invoice) => void;
  onCancel: (invoice: Invoice) => void;
}

export function InvoiceList({
  invoices,
  onView,
  onEdit,
  onDownload,
  onSend,
  onMarkPaid,
  onCancel
}: InvoiceListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const getStatusBadge = (status: Invoice['status']) => {
    const variants = {
      draft: 'secondary',
      issued: 'default',
      sent: 'default',
      paid: 'default',
      overdue: 'destructive',
      cancelled: 'destructive'
    } as const;

    const labels = {
      draft: 'Borrador',
      issued: 'Emitida',
      sent: 'Enviada',
      paid: 'Pagada',
      overdue: 'Vencida',
      cancelled: 'Cancelada'
    };

    const colors = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      issued: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      sent: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };

    const icons = {
      draft: Clock,
      issued: FileText,
      sent: Send,
      paid: CheckCircle,
      overdue: AlertCircle,
      cancelled: X
    };

    const Icon = icons[status];

    return (
      <Badge variant={variants[status]} className={`${colors[status]} gap-1`}>
        <Icon className="w-3 h-3" />
        {labels[status]}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: Invoice['payment_status']) => {
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
      <Badge variant="outline" className={colors[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getTypeBadge = (type: Invoice['invoice_type']) => {
    const colors = {
      factura: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      boleta: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      nota_credito: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      nota_debito: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };

    const labels = {
      factura: 'Factura',
      boleta: 'Boleta',
      nota_credito: 'N. Crédito',
      nota_debito: 'N. Débito'
    };

    return (
      <Badge variant="outline" className={colors[type]}>
        {labels[type]}
      </Badge>
    );
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.client_rut.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesType = typeFilter === 'all' || invoice.invoice_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const canEdit = (invoice: Invoice) => invoice.status === 'draft';
  const canSend = (invoice: Invoice) => ['issued', 'draft'].includes(invoice.status);
  const canMarkPaid = (invoice: Invoice) => ['issued', 'sent', 'overdue'].includes(invoice.status) && invoice.payment_status !== 'paid';
  const canCancel = (invoice: Invoice) => !['paid', 'cancelled'].includes(invoice.status);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número, cliente o RUT..."
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
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="issued">Emitida</SelectItem>
                <SelectItem value="sent">Enviada</SelectItem>
                <SelectItem value="paid">Pagada</SelectItem>
                <SelectItem value="overdue">Vencida</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="factura">Factura</SelectItem>
                <SelectItem value="boleta">Boleta</SelectItem>
                <SelectItem value="nota_credito">Nota de Crédito</SelectItem>
                <SelectItem value="nota_debito">Nota de Débito</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div>
                      <p className="font-semibold">{invoice.invoice_number}</p>
                      <p className="text-xs text-muted-foreground">
                        Folio: {invoice.folio}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(invoice.invoice_type)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{invoice.client_name}</p>
                      <p className="text-sm text-muted-foreground">{invoice.client_rut}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {new Date(invoice.issue_date).toLocaleDateString('es-CL')}
                    </span>
                  </TableCell>
                  <TableCell>
                    {invoice.due_date ? (
                      <span className="text-sm">
                        {new Date(invoice.due_date).toLocaleDateString('es-CL')}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Sin vencimiento</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>{getPaymentStatusBadge(invoice.payment_status)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-semibold">{formatCurrency(invoice.total_amount)}</p>
                      {invoice.payment_status === 'partial' && (
                        <p className="text-xs text-muted-foreground">
                          Pagado: {formatCurrency(
                            invoice.payments.reduce((sum, p) => sum + p.amount, 0)
                          )}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(invoice)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalle
                        </DropdownMenuItem>
                        
                        {canEdit(invoice) && (
                          <DropdownMenuItem onClick={() => onEdit(invoice)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem onClick={() => onDownload(invoice)}>
                          <Download className="w-4 h-4 mr-2" />
                          Descargar PDF
                        </DropdownMenuItem>
                        
                        {canSend(invoice) && (
                          <DropdownMenuItem onClick={() => onSend(invoice)}>
                            <Send className="w-4 h-4 mr-2" />
                            Enviar por Email
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuSeparator />
                        
                        {canMarkPaid(invoice) && (
                          <DropdownMenuItem onClick={() => onMarkPaid(invoice)}>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Marcar como Pagada
                          </DropdownMenuItem>
                        )}
                        
                        {canCancel(invoice) && (
                          <DropdownMenuItem 
                            onClick={() => onCancel(invoice)}
                            className="text-destructive"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}