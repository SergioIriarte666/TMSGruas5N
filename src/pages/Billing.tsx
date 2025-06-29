import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InvoiceForm } from '@/components/facturacion/InvoiceForm';
import { InvoiceList } from '@/components/facturacion/InvoiceList';
import { InvoicePreview } from '@/components/facturacion/InvoicePreview';
import { PaymentForm } from '@/components/facturacion/PaymentForm';
import { Invoice, InvoicePayment } from '@/types/billing';
import { MOCK_CLIENTS, MOCK_SERVICES } from '@/data/mockData';
import { 
  Plus, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  CreditCard
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/chile-config';

// Mock data for invoices
const MOCK_INVOICES: Invoice[] = [
  {
    id: '1',
    invoice_number: 'F001-00000001',
    invoice_type: 'factura',
    folio: 1,
    client_id: '1',
    service_ids: ['1'],
    issue_date: '2024-01-25',
    due_date: '2024-02-24',
    subtotal: 85000,
    iva_amount: 16150,
    total_amount: 101150,
    status: 'issued',
    payment_status: 'pending',
    client_rut: '12.345.678-9',
    client_name: 'María González',
    client_address: 'Av. Providencia 1234',
    client_city: 'Santiago',
    client_region: 'Metropolitana de Santiago',
    line_items: [
      {
        id: '1',
        description: 'SRV-2024-0001 - Remolque por falla mecánica',
        quantity: 1,
        unit_price: 85000,
        subtotal: 85000,
        iva_rate: 19,
        iva_amount: 16150,
        total: 101150,
        service_id: '1'
      }
    ],
    payments: [],
    created_by: 'admin@tmsgruas.cl',
    created_at: '2024-01-25T10:30:00Z',
    updated_at: '2024-01-25T10:30:00Z'
  },
  {
    id: '2',
    invoice_number: 'F001-00000002',
    invoice_type: 'factura',
    folio: 2,
    client_id: '2',
    service_ids: ['2'],
    issue_date: '2024-01-24',
    due_date: '2024-02-23',
    subtotal: 55000,
    iva_amount: 10450,
    total_amount: 65450,
    status: 'paid',
    payment_status: 'paid',
    client_rut: '98.765.432-1',
    client_name: 'Carlos Rodriguez',
    client_address: 'Av. Las Condes 2567',
    client_city: 'Santiago',
    client_region: 'Metropolitana de Santiago',
    line_items: [
      {
        id: '2',
        description: 'SRV-2024-0002 - Asistencia por batería descargada',
        quantity: 1,
        unit_price: 55000,
        subtotal: 55000,
        iva_rate: 19,
        iva_amount: 10450,
        total: 65450,
        service_id: '2'
      }
    ],
    payments: [
      {
        id: '1',
        invoice_id: '2',
        amount: 65450,
        payment_date: '2024-01-24',
        payment_method: 'transfer',
        reference: 'TRF-123456789',
        created_at: '2024-01-24T16:00:00Z'
      }
    ],
    created_by: 'admin@tmsgruas.cl',
    created_at: '2024-01-24T14:30:00Z',
    updated_at: '2024-01-24T16:00:00Z'
  }
];

export function Billing() {
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);
  const [isInvoicePreviewOpen, setIsInvoicePreviewOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | undefined>();
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | undefined>();
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | undefined>();

  const handleCreateInvoice = async (data: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newInvoice: Invoice = {
      id: (invoices.length + 1).toString(),
      invoice_number: `F001-${String(invoices.length + 1).padStart(8, '0')}`,
      folio: invoices.length + 1,
      ...data,
      subtotal: data.line_items.reduce((sum: number, item: any) => sum + item.subtotal, 0),
      iva_amount: data.line_items.reduce((sum: number, item: any) => sum + item.iva_amount, 0),
      total_amount: data.line_items.reduce((sum: number, item: any) => sum + item.total, 0),
      status: 'draft' as const,
      payment_status: 'pending' as const,
      payments: [],
      created_by: 'admin@tmsgruas.cl',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Get client info
    const client = MOCK_CLIENTS.find(c => c.id === data.client_id);
    if (client) {
      newInvoice.client_rut = client.document;
      newInvoice.client_name = client.name;
      newInvoice.client_address = client.address;
      newInvoice.client_city = client.city;
      newInvoice.client_region = client.province;
    }

    setInvoices([newInvoice, ...invoices]);
    toast.success('Factura creada exitosamente');
  };

  const handleUpdateInvoice = async (data: any) => {
    if (!editingInvoice) return;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const updatedInvoices = invoices.map(invoice =>
      invoice.id === editingInvoice.id
        ? { 
            ...invoice, 
            ...data,
            subtotal: data.line_items.reduce((sum: number, item: any) => sum + item.subtotal, 0),
            iva_amount: data.line_items.reduce((sum: number, item: any) => sum + item.iva_amount, 0),
            total_amount: data.line_items.reduce((sum: number, item: any) => sum + item.total, 0),
            updated_at: new Date().toISOString() 
          }
        : invoice
    );

    setInvoices(updatedInvoices);
    setEditingInvoice(undefined);
    toast.success('Factura actualizada exitosamente');
  };

  const handleAddPayment = async (data: any) => {
    if (!selectedInvoiceForPayment) return;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const newPayment: InvoicePayment = {
      id: Date.now().toString(),
      invoice_id: selectedInvoiceForPayment.id,
      ...data,
      created_at: new Date().toISOString(),
    };

    const updatedInvoices = invoices.map(invoice => {
      if (invoice.id === selectedInvoiceForPayment.id) {
        const updatedPayments = [...invoice.payments, newPayment];
        const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
        
        let paymentStatus: Invoice['payment_status'] = 'pending';
        if (totalPaid >= invoice.total_amount) {
          paymentStatus = 'paid';
        } else if (totalPaid > 0) {
          paymentStatus = 'partial';
        }

        return {
          ...invoice,
          payments: updatedPayments,
          payment_status: paymentStatus,
          status: paymentStatus === 'paid' ? 'paid' as const : invoice.status,
          updated_at: new Date().toISOString()
        };
      }
      return invoice;
    });

    setInvoices(updatedInvoices);
    setSelectedInvoiceForPayment(undefined);
    toast.success('Pago registrado exitosamente');
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setPreviewInvoice(invoice);
    setIsInvoicePreviewOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsInvoiceFormOpen(true);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // PDF generation is handled in the preview component
    toast.success(`PDF de factura ${invoice.invoice_number} descargado`);
  };

  const handleSendInvoice = (invoice: Invoice) => {
    // Simulate sending
    const updatedInvoices = invoices.map(inv =>
      inv.id === invoice.id
        ? { ...inv, status: 'sent' as const, updated_at: new Date().toISOString() }
        : inv
    );
    setInvoices(updatedInvoices);
    toast.success(`Factura ${invoice.invoice_number} enviada por email`);
  };

  const handleMarkPaid = (invoice: Invoice) => {
    setSelectedInvoiceForPayment(invoice);
    setIsPaymentFormOpen(true);
  };

  const handleCancelInvoice = (invoice: Invoice) => {
    const updatedInvoices = invoices.map(inv =>
      inv.id === invoice.id
        ? { ...inv, status: 'cancelled' as const, updated_at: new Date().toISOString() }
        : inv
    );
    setInvoices(updatedInvoices);
    toast.success(`Factura ${invoice.invoice_number} cancelada`);
  };

  const openCreateForm = () => {
    setEditingInvoice(undefined);
    setIsInvoiceFormOpen(true);
  };

  const closeInvoiceForm = () => {
    setIsInvoiceFormOpen(false);
    setEditingInvoice(undefined);
  };

  const closeInvoicePreview = () => {
    setIsInvoicePreviewOpen(false);
    setPreviewInvoice(undefined);
  };

  const closePaymentForm = () => {
    setIsPaymentFormOpen(false);
    setSelectedInvoiceForPayment(undefined);
  };

  // Statistics
  const stats = {
    total_invoices: invoices.length,
    pending_amount: invoices
      .filter(i => i.payment_status !== 'paid')
      .reduce((sum, i) => sum + (i.total_amount - i.payments.reduce((pSum, p) => pSum + p.amount, 0)), 0),
    paid_amount: invoices
      .filter(i => i.payment_status === 'paid')
      .reduce((sum, i) => sum + i.total_amount, 0),
    overdue_count: invoices.filter(i => {
      if (!i.due_date || i.payment_status === 'paid') return false;
      return new Date(i.due_date) < new Date();
    }).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Facturación</h1>
          <p className="text-muted-foreground">
            Gestión completa de facturación electrónica para Chile
          </p>
        </div>
        <Button onClick={openCreateForm} className="gap-2">
          <Plus className="w-4 h-4" />
          Nueva Factura
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total_invoices}</p>
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
                  {formatCurrency(stats.pending_amount).replace('$', '')}
                </p>
                <p className="text-sm text-muted-foreground">Por Cobrar</p>
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
                  {formatCurrency(stats.paid_amount).replace('$', '')}
                </p>
                <p className="text-sm text-muted-foreground">Cobrado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.overdue_count}</p>
                <p className="text-sm text-muted-foreground">Vencidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="invoices" className="space-y-6">
        <TabsList>
          <TabsTrigger value="invoices" className="gap-2">
            <FileText className="w-4 h-4" />
            Facturas
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="w-4 h-4" />
            Pagos
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Reportes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <InvoiceList
            invoices={invoices}
            onView={handleViewInvoice}
            onEdit={handleEditInvoice}
            onDownload={handleDownloadInvoice}
            onSend={handleSendInvoice}
            onMarkPaid={handleMarkPaid}
            onCancel={handleCancelInvoice}
          />
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Pagos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidad de gestión de pagos en desarrollo...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reportes Tributarios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Reportes para SII y análisis financiero en desarrollo...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Forms and Dialogs */}
      <InvoiceForm
        invoice={editingInvoice}
        isOpen={isInvoiceFormOpen}
        onClose={closeInvoiceForm}
        onSubmit={editingInvoice ? handleUpdateInvoice : handleCreateInvoice}
        clients={MOCK_CLIENTS}
        services={MOCK_SERVICES}
      />

      {previewInvoice && (
        <InvoicePreview
          invoice={previewInvoice}
          client={MOCK_CLIENTS.find(c => c.id === previewInvoice.client_id)}
          isOpen={isInvoicePreviewOpen}
          onClose={closeInvoicePreview}
          onDownload={() => handleDownloadInvoice(previewInvoice)}
          onSend={() => handleSendInvoice(previewInvoice)}
        />
      )}

      {selectedInvoiceForPayment && (
        <PaymentForm
          invoice={selectedInvoiceForPayment}
          isOpen={isPaymentFormOpen}
          onClose={closePaymentForm}
          onSubmit={handleAddPayment}
        />
      )}
    </div>
  );
}