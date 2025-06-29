import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ServiceSelector } from './ServiceSelector';
import { Invoice, InvoiceLineItem } from '@/types/billing';
import { Client, Service } from '@/types';
import { Loader2, Plus, X, Calculator, FileText, Search } from 'lucide-react';
import { formatCurrency, calculateIVA, calculateTotal } from '@/lib/chile-config';

const invoiceSchema = z.object({
  client_id: z.string().min(1, 'Debe seleccionar un cliente'),
  invoice_type: z.enum(['factura', 'boleta', 'nota_credito', 'nota_debito']),
  issue_date: z.string().min(1, 'La fecha es requerida'),
  due_date: z.string().optional(),
  service_ids: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  invoice?: Invoice;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InvoiceFormData & { line_items: InvoiceLineItem[] }) => Promise<void>;
  clients: Client[];
  services: Service[];
}

export function InvoiceForm({ 
  invoice, 
  isOpen, 
  onClose, 
  onSubmit, 
  clients, 
  services 
}: InvoiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [ivaAmount, setIvaAmount] = useState(0);
  const [total, setTotal] = useState(0);
  const [isServiceSelectorOpen, setIsServiceSelectorOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: invoice ? {
      client_id: invoice.client_id,
      invoice_type: invoice.invoice_type,
      issue_date: invoice.issue_date,
      due_date: invoice.due_date || '',
      service_ids: invoice.service_ids,
      notes: invoice.notes || '',
    } : {
      client_id: '',
      invoice_type: 'factura',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: '',
      service_ids: [],
      notes: '',
    }
  });

  useEffect(() => {
    if (invoice) {
      setLineItems(invoice.line_items);
    }
  }, [invoice]);

  useEffect(() => {
    // Recalcular totales cuando cambien las líneas
    const newSubtotal = lineItems.reduce((sum, item) => sum + item.subtotal, 0);
    const newIvaAmount = calculateIVA(newSubtotal);
    const newTotal = calculateTotal(newSubtotal);
    
    setSubtotal(newSubtotal);
    setIvaAmount(newIvaAmount);
    setTotal(newTotal);
  }, [lineItems]);

  const addLineItem = () => {
    const newItem: InvoiceLineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unit_price: 0,
      subtotal: 0,
      iva_rate: 19,
      iva_amount: 0,
      total: 0,
    };
    setLineItems([...lineItems, newItem]);
  };

  const updateLineItem = (id: string, field: keyof InvoiceLineItem, value: any) => {
    setLineItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        // Recalcular montos si cambia cantidad o precio
        if (field === 'quantity' || field === 'unit_price') {
          const subtotal = updated.quantity * updated.unit_price;
          const discountAmount = updated.discount_percent ? 
            subtotal * (updated.discount_percent / 100) : 
            (updated.discount_amount || 0);
          
          updated.subtotal = subtotal - discountAmount;
          updated.iva_amount = calculateIVA(updated.subtotal);
          updated.total = calculateTotal(updated.subtotal);
        }
        
        return updated;
      }
      return item;
    }));
  };

  const removeLineItem = (id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  };

  const handleServicesSelected = (selectedServices: Service[]) => {
    const newItems: InvoiceLineItem[] = selectedServices.map(service => {
      const subtotal = service.total_cost;
      return {
        id: `service-${service.id}`,
        description: `${service.service_number} - ${service.description}`,
        quantity: 1,
        unit_price: service.total_cost,
        subtotal,
        iva_rate: 19,
        iva_amount: calculateIVA(subtotal),
        total: calculateTotal(subtotal),
        service_id: service.id,
      };
    });
    
    // Remove existing service items and add new ones
    const nonServiceItems = lineItems.filter(item => !item.service_id);
    setLineItems([...nonServiceItems, ...newItems]);
    
    // Update service_ids in form
    setValue('service_ids', selectedServices.map(s => s.id));
  };

  const handleFormSubmit = async (data: InvoiceFormData) => {
    if (lineItems.length === 0) {
      alert('Debe agregar al menos una línea a la factura');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        line_items: lineItems,
      });
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const invoiceTypeLabels = {
    factura: 'Factura',
    boleta: 'Boleta',
    nota_credito: 'Nota de Crédito',
    nota_debito: 'Nota de Débito'
  };

  const selectedClient = clients.find(c => c.id === watch('client_id'));
  const availableServices = services.filter(s => 
    s.status === 'completed' && !s.is_billed && s.client_id === watch('client_id')
  );

  const serviceLineItems = lineItems.filter(item => item.service_id);
  const manualLineItems = lineItems.filter(item => !item.service_id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {invoice ? 'Editar Factura' : 'Nueva Factura'}
          </DialogTitle>
          <DialogDescription>
            {invoice ? 'Modifica los datos de la factura' : 'Crea una nueva factura para el cliente'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Header Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Documento *</Label>
                  <Select
                    value={watch('invoice_type')}
                    onValueChange={(value) => setValue('invoice_type', value as any)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(invoiceTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issue_date">Fecha de Emisión *</Label>
                  <Input
                    id="issue_date"
                    type="date"
                    {...register('issue_date')}
                    disabled={isSubmitting}
                  />
                  {errors.issue_date && (
                    <p className="text-sm text-destructive">{errors.issue_date.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_date">Fecha de Vencimiento</Label>
                  <Input
                    id="due_date"
                    type="date"
                    {...register('due_date')}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cliente *</Label>
                <Select
                  value={watch('client_id')}
                  onValueChange={(value) => {
                    setValue('client_id', value);
                    // Clear service items when client changes
                    const nonServiceItems = lineItems.filter(item => !item.service_id);
                    setLineItems(nonServiceItems);
                    setValue('service_ids', []);
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} - {client.document}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.client_id && (
                  <p className="text-sm text-destructive">{errors.client_id.message}</p>
                )}
              </div>

              {selectedClient && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{selectedClient.name}</p>
                  <p className="text-sm text-muted-foreground">RUT: {selectedClient.document}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedClient.address}, {selectedClient.city}, {selectedClient.province}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Services Selection */}
          {watch('client_id') && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Servicios del Cliente</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsServiceSelectorOpen(true)}
                    className="gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Buscar Servicios
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {serviceLineItems.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {serviceLineItems.length} servicio{serviceLineItems.length !== 1 ? 's' : ''} seleccionado{serviceLineItems.length !== 1 ? 's' : ''}
                    </p>
                    {serviceLineItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{item.description}</p>
                          <p className="text-sm text-muted-foreground">
                            Cantidad: {item.quantity} × {formatCurrency(item.unit_price)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(item.total)}</p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLineItem(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay servicios seleccionados</p>
                    <p className="text-xs">Haz clic en "Buscar Servicios" para agregar servicios del cliente</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Manual Line Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Líneas Manuales</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLineItem}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Línea
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {manualLineItems.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Línea Manual {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLineItem(item.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="md:col-span-2">
                        <Label className="text-xs">Descripción</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                          placeholder="Descripción del servicio"
                          className="h-8"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs">Cantidad</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          className="h-8"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs">Precio Unitario</Label>
                        <Input
                          type="number"
                          min="0"
                          value={item.unit_price}
                          onChange={(e) => updateLineItem(item.id, 'unit_price', parseInt(e.target.value) || 0)}
                          className="h-8"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span>Subtotal: {formatCurrency(item.subtotal)}</span>
                      <span>IVA: {formatCurrency(item.iva_amount)}</span>
                      <span className="font-medium">Total: {formatCurrency(item.total)}</span>
                    </div>
                  </div>
                ))}
                
                {manualLineItems.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay líneas manuales</p>
                    <p className="text-xs">Haz clic en "Agregar Línea" para agregar conceptos manuales</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Totals */}
          {lineItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Resumen de Totales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (19%):</span>
                    <span className="font-medium">{formatCurrency(ivaAmount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observaciones</Label>
            <Textarea
              id="notes"
              placeholder="Observaciones adicionales para la factura..."
              rows={3}
              {...register('notes')}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || lineItems.length === 0}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {invoice ? 'Actualizar' : 'Crear'} Factura
            </Button>
          </DialogFooter>
        </form>

        {/* Service Selector Dialog */}
        <ServiceSelector
          isOpen={isServiceSelectorOpen}
          onClose={() => setIsServiceSelectorOpen(false)}
          onSelectServices={handleServicesSelected}
          clients={clients}
          services={services}
          selectedServiceIds={watch('service_ids') || []}
        />
      </DialogContent>
    </Dialog>
  );
}