import React, { useState } from 'react';
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
import { Invoice, InvoicePayment } from '@/types/billing';
import { Loader2, CreditCard, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/chile-config';

const paymentSchema = z.object({
  amount: z.number().min(1, 'El monto debe ser mayor a 0'),
  payment_date: z.string().min(1, 'La fecha es requerida'),
  payment_method: z.enum(['cash', 'transfer', 'check', 'card', 'other']),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PaymentFormData) => Promise<void>;
}

export function PaymentForm({ invoice, isOpen, onClose, onSubmit }: PaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPaid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingAmount = invoice.total_amount - totalPaid;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: remainingAmount,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'transfer',
      reference: '',
      notes: '',
    }
  });

  const handleFormSubmit = async (data: PaymentFormData) => {
    if (data.amount > remainingAmount) {
      alert(`El monto no puede ser mayor al saldo pendiente: ${formatCurrency(remainingAmount)}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(data);
      onClose();
      reset();
    } catch (error) {
      console.error('Error submitting payment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentMethodLabels = {
    cash: 'Efectivo',
    transfer: 'Transferencia',
    check: 'Cheque',
    card: 'Tarjeta',
    other: 'Otro'
  };

  const setFullAmount = () => {
    setValue('amount', remainingAmount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Registrar Pago
          </DialogTitle>
          <DialogDescription>
            Registra un pago para la factura {invoice.invoice_number}
          </DialogDescription>
        </DialogHeader>

        {/* Invoice Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Resumen de Factura
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Total Factura:</span>
              <span className="font-semibold">{formatCurrency(invoice.total_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Pagado:</span>
              <span className="font-semibold text-green-600">{formatCurrency(totalPaid)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold">Saldo Pendiente:</span>
              <span className="font-bold text-red-600">{formatCurrency(remainingAmount)}</span>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto del Pago *</Label>
              <div className="flex gap-2">
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  max={remainingAmount}
                  step="1"
                  {...register('amount', { valueAsNumber: true })}
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={setFullAmount}
                  disabled={isSubmitting}
                >
                  Total
                </Button>
              </div>
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Máximo: {formatCurrency(remainingAmount)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_date">Fecha de Pago *</Label>
              <Input
                id="payment_date"
                type="date"
                {...register('payment_date')}
                disabled={isSubmitting}
              />
              {errors.payment_date && (
                <p className="text-sm text-destructive">{errors.payment_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Método de Pago *</Label>
              <Select
                value={watch('payment_method')}
                onValueChange={(value) => setValue('payment_method', value as any)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(paymentMethodLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.payment_method && (
                <p className="text-sm text-destructive">{errors.payment_method.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Referencia</Label>
              <Input
                id="reference"
                placeholder="Número de transferencia, cheque, etc."
                {...register('reference')}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observaciones</Label>
            <Textarea
              id="notes"
              placeholder="Observaciones adicionales sobre el pago..."
              rows={3}
              {...register('notes')}
              disabled={isSubmitting}
            />
          </div>

          {/* Previous Payments */}
          {invoice.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Pagos Anteriores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {invoice.payments.map((payment, index) => (
                    <div key={payment.id} className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium">
                          {paymentMethodLabels[payment.payment_method]}
                        </span>
                        {payment.reference && (
                          <span className="text-muted-foreground ml-2">
                            ({payment.reference})
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(payment.amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.payment_date).toLocaleDateString('es-CL')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || remainingAmount <= 0}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrar Pago
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}