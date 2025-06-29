import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Invoice } from '@/types/billing';
import { Client } from '@/types';
import { Download, Send, Printer as Print, Eye, FileText, Building, User, Calendar, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/chile-config';
import { generateInvoicePDF } from '@/lib/pdf-generator';

interface InvoicePreviewProps {
  invoice: Invoice;
  client?: Client;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: () => void;
  onSend?: () => void;
  onPrint?: () => void;
}

export function InvoicePreview({
  invoice,
  client,
  isOpen,
  onClose,
  onDownload,
  onSend,
  onPrint
}: InvoicePreviewProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      generateInvoicePDF(invoice, client);
      onDownload?.();
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrint = () => {
    window.print();
    onPrint?.();
  };

  const getStatusBadge = (status: Invoice['status']) => {
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
      nota_credito: 'Nota de Crédito',
      nota_debito: 'Nota de Débito'
    };

    return (
      <Badge variant="outline" className={colors[type]}>
        {labels[type]}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Vista Previa de Factura
          </DialogTitle>
          <DialogDescription>
            Revisa los detalles de la factura antes de descargar o enviar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header de la factura */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Building className="w-8 h-8 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">TMS Grúas Chile</h2>
                    <p className="text-sm text-muted-foreground">Transportes y Servicios TMS Chile SpA</p>
                    <p className="text-sm text-muted-foreground">RUT: 76.123.456-7</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeBadge(invoice.invoice_type)}
                    {getStatusBadge(invoice.status)}
                  </div>
                  <p className="text-lg font-bold">{invoice.invoice_number}</p>
                  <p className="text-sm text-muted-foreground">Folio: {invoice.folio}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Fechas
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Emisión:</span> {new Date(invoice.issue_date).toLocaleDateString('es-CL')}</p>
                    {invoice.due_date && (
                      <p><span className="text-muted-foreground">Vencimiento:</span> {new Date(invoice.due_date).toLocaleDateString('es-CL')}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Cliente
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{invoice.client_name}</p>
                    <p><span className="text-muted-foreground">RUT:</span> {invoice.client_rut}</p>
                    <p>{invoice.client_address}</p>
                    <p>{invoice.client_city}, {invoice.client_region}</p>
                    {client?.email && <p><span className="text-muted-foreground">Email:</span> {client.email}</p>}
                    {client?.phone && <p><span className="text-muted-foreground">Teléfono:</span> {client.phone}</p>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Líneas de la factura */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Detalle de Servicios
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium">#</th>
                      <th className="text-left p-3 text-sm font-medium">Descripción</th>
                      <th className="text-center p-3 text-sm font-medium">Cant.</th>
                      <th className="text-right p-3 text-sm font-medium">Precio Unit.</th>
                      <th className="text-right p-3 text-sm font-medium">Subtotal</th>
                      <th className="text-center p-3 text-sm font-medium">IVA</th>
                      <th className="text-right p-3 text-sm font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.line_items.map((item, index) => (
                      <tr key={item.id} className="border-b">
                        <td className="p-3 text-sm">{index + 1}</td>
                        <td className="p-3 text-sm">
                          <div>
                            <p className="font-medium">{item.description}</p>
                            {item.service_id && (
                              <p className="text-xs text-muted-foreground">Servicio ID: {item.service_id}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-sm text-center">{item.quantity}</td>
                        <td className="p-3 text-sm text-right">{formatCurrency(item.unit_price)}</td>
                        <td className="p-3 text-sm text-right">{formatCurrency(item.subtotal)}</td>
                        <td className="p-3 text-sm text-center">{item.iva_rate}%</td>
                        <td className="p-3 text-sm text-right font-medium">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Totales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Resumen de Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA (19%):</span>
                  <span className="font-medium">{formatCurrency(invoice.iva_amount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(invoice.total_amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de pagos */}
          {invoice.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Historial de Pagos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoice.payments.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{formatCurrency(payment.amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.payment_date).toLocaleDateString('es-CL')} - {payment.payment_method}
                        </p>
                        {payment.reference && (
                          <p className="text-xs text-muted-foreground">Ref: {payment.reference}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total Pagado:</span>
                    <span>{formatCurrency(invoice.payments.reduce((sum, p) => sum + p.amount, 0))}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-red-600">
                    <span>Saldo Pendiente:</span>
                    <span>{formatCurrency(invoice.total_amount - invoice.payments.reduce((sum, p) => sum + p.amount, 0))}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notas */}
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Observaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Print className="w-4 h-4" />
              Imprimir
            </Button>
            {onSend && (
              <Button variant="outline" onClick={onSend} className="gap-2">
                <Send className="w-4 h-4" />
                Enviar por Email
              </Button>
            )}
            <Button 
              onClick={handleDownloadPDF} 
              disabled={isGeneratingPDF}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              {isGeneratingPDF ? 'Generando...' : 'Descargar PDF'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}