import { supabase } from '@/lib/supabase';
import { Invoice, InvoiceLineItem, InvoicePayment } from '@/types/billing';

// Obtener todas las facturas
export const getInvoices = async (): Promise<Invoice[]> => {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      invoice_items:invoice_items(*),
      payments:payments(*)
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
  
  // Transformar los datos para que coincidan con el tipo Invoice
  const invoices = data.map(invoice => {
    return {
      ...invoice,
      line_items: invoice.invoice_items,
      payments: invoice.payments
    } as unknown as Invoice;
  });
  
  return invoices;
};

// Obtener una factura por ID
export const getInvoiceById = async (id: string): Promise<Invoice | null> => {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      invoice_items:invoice_items(*),
      payments:payments(*)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching invoice:', error);
    throw error;
  }
  
  if (!data) return null;
  
  // Transformar los datos para que coincidan con el tipo Invoice
  const invoice = {
    ...data,
    line_items: data.invoice_items,
    payments: data.payments
  } as unknown as Invoice;
  
  return invoice;
};

// Crear una nueva factura
export const createInvoice = async (
  invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>, 
  lineItems: Omit<InvoiceLineItem, 'id' | 'invoice_id' | 'created_at'>[]
): Promise<Invoice> => {
  // Iniciar una transacción
  const { data, error } = await supabase.rpc('create_invoice', {
    invoice_data: invoice,
    line_items_data: lineItems
  });
  
  if (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
  
  // Obtener la factura recién creada con todos sus detalles
  return await getInvoiceById(data.id);
};

// Actualizar una factura existente
export const updateInvoice = async (
  id: string, 
  invoice: Partial<Invoice>, 
  lineItems?: Omit<InvoiceLineItem, 'id' | 'invoice_id' | 'created_at'>[]
): Promise<Invoice> => {
  // Iniciar una transacción
  const { data, error } = await supabase.rpc('update_invoice', {
    invoice_id: id,
    invoice_data: invoice,
    line_items_data: lineItems || []
  });
  
  if (error) {
    console.error('Error updating invoice:', error);
    throw error;
  }
  
  // Obtener la factura actualizada con todos sus detalles
  return await getInvoiceById(id);
};

// Eliminar una factura
export const deleteInvoice = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting invoice:', error);
    throw error;
  }
};

// Registrar un pago para una factura
export const registerPayment = async (payment: Omit<InvoicePayment, 'id' | 'created_at'>): Promise<InvoicePayment> => {
  // Insertar el pago
  const { data, error } = await supabase
    .from('payments')
    .insert([payment])
    .select()
    .single();
  
  if (error) {
    console.error('Error registering payment:', error);
    throw error;
  }
  
  // Actualizar el estado de la factura si es necesario
  await updateInvoicePaymentStatus(payment.invoice_id);
  
  return data as InvoicePayment;
};

// Actualizar el estado de pago de una factura
export const updateInvoicePaymentStatus = async (invoiceId: string): Promise<void> => {
  // Obtener la factura y sus pagos
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*, payments(*)')
    .eq('id', invoiceId)
    .single();
  
  if (invoiceError) {
    console.error('Error fetching invoice for payment status update:', invoiceError);
    throw invoiceError;
  }
  
  // Calcular el total pagado
  const totalPaid = invoice.payments.reduce((sum: number, payment: any) => sum + payment.amount, 0);
  
  // Determinar el nuevo estado de pago
  let paymentStatus: Invoice['payment_status'] = 'pending';
  let status = invoice.status;
  
  if (totalPaid >= invoice.total_amount) {
    paymentStatus = 'paid';
    status = 'paid';
  } else if (totalPaid > 0) {
    paymentStatus = 'partial';
  } else if (new Date(invoice.due_date) < new Date()) {
    paymentStatus = 'overdue';
    status = 'overdue';
  }
  
  // Actualizar la factura
  const { error: updateError } = await supabase
    .from('invoices')
    .update({ payment_status: paymentStatus, status })
    .eq('id', invoiceId);
  
  if (updateError) {
    console.error('Error updating invoice payment status:', updateError);
    throw updateError;
  }
};

// Obtener facturas por cliente
export const getInvoicesByClient = async (clientId: string): Promise<Invoice[]> => {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      invoice_items:invoice_items(*),
      payments:payments(*)
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching client invoices:', error);
    throw error;
  }
  
  // Transformar los datos para que coincidan con el tipo Invoice
  const invoices = data.map(invoice => {
    return {
      ...invoice,
      line_items: invoice.invoice_items,
      payments: invoice.payments
    } as unknown as Invoice;
  });
  
  return invoices;
};

// Marcar una factura como enviada
export const markInvoiceAsSent = async (id: string): Promise<Invoice> => {
  const { data, error } = await supabase
    .from('invoices')
    .update({ status: 'sent' })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error marking invoice as sent:', error);
    throw error;
  }
  
  // Obtener la factura actualizada con todos sus detalles
  return await getInvoiceById(id);
};

// Marcar una factura como cancelada
export const markInvoiceAsCancelled = async (id: string): Promise<Invoice> => {
  const { data, error } = await supabase
    .from('invoices')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error marking invoice as cancelled:', error);
    throw error;
  }
  
  // Obtener la factura actualizada con todos sus detalles
  return await getInvoiceById(id);
};