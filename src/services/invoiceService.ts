import { v4 as uuidv4 } from 'uuid';
import { Invoice, InvoiceLineItem, InvoicePayment } from '@/types/billing';
import { MOCK_INVOICES } from '@/data/mockData';
import { MOCK_SERVICES } from '@/data/mockData';

// Copia local de los datos para simular una base de datos
let invoices = [...MOCK_INVOICES];
let services = [...MOCK_SERVICES];

// Obtener todas las facturas
export const getInvoices = async (): Promise<Invoice[]> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...invoices];
};

// Obtener una factura por ID
export const getInvoiceById = async (id: string): Promise<Invoice | null> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 200));
  const invoice = invoices.find(i => i.id === id);
  return invoice || null;
};

// Crear una nueva factura
export const createInvoice = async (
  invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>, 
  lineItems: Omit<InvoiceLineItem, 'id' | 'invoice_id' | 'created_at'>[]
): Promise<Invoice> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newInvoiceId = uuidv4();
  
  // Crear los ítems de la factura
  const newLineItems: InvoiceLineItem[] = lineItems.map(item => ({
    id: uuidv4(),
    invoice_id: newInvoiceId,
    ...item,
    created_at: new Date().toISOString()
  }));
  
  // Crear la factura
  const newInvoice: Invoice = {
    id: newInvoiceId,
    ...invoice,
    line_items: newLineItems,
    payments: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Marcar los servicios como facturados
  if (invoice.service_ids && invoice.service_ids.length > 0) {
    services = services.map(service => 
      invoice.service_ids.includes(service.id)
        ? { ...service, is_billed: true, bill_date: new Date().toISOString() }
        : service
    );
  }
  
  invoices.push(newInvoice);
  return newInvoice;
};

// Actualizar una factura existente
export const updateInvoice = async (
  id: string, 
  invoice: Partial<Invoice>, 
  lineItems?: Omit<InvoiceLineItem, 'id' | 'invoice_id' | 'created_at'>[]
): Promise<Invoice> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = invoices.findIndex(i => i.id === id);
  if (index === -1) {
    throw new Error(`Factura con ID ${id} no encontrada`);
  }
  
  // Si hay nuevos ítems, reemplazar los existentes
  let updatedLineItems = [...invoices[index].line_items];
  if (lineItems) {
    updatedLineItems = lineItems.map(item => ({
      id: uuidv4(),
      invoice_id: id,
      ...item,
      created_at: new Date().toISOString()
    }));
  }
  
  // Actualizar la factura
  const updatedInvoice = {
    ...invoices[index],
    ...invoice,
    line_items: updatedLineItems,
    updated_at: new Date().toISOString()
  };
  
  // Actualizar los servicios facturados
  if (invoice.service_ids) {
    // Primero, desmarcar todos los servicios asociados a esta factura
    services = services.map(service => 
      invoices[index].service_ids.includes(service.id)
        ? { ...service, is_billed: false, bill_date: undefined }
        : service
    );
    
    // Luego, marcar los nuevos servicios como facturados
    services = services.map(service => 
      invoice.service_ids.includes(service.id)
        ? { ...service, is_billed: true, bill_date: new Date().toISOString() }
        : service
    );
  }
  
  invoices[index] = updatedInvoice;
  return updatedInvoice;
};

// Eliminar una factura
export const deleteInvoice = async (id: string): Promise<void> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = invoices.findIndex(i => i.id === id);
  if (index === -1) {
    throw new Error(`Factura con ID ${id} no encontrada`);
  }
  
  // Desmarcar los servicios facturados
  services = services.map(service => 
    invoices[index].service_ids.includes(service.id)
      ? { ...service, is_billed: false, bill_date: undefined }
      : service
  );
  
  invoices.splice(index, 1);
};

// Registrar un pago para una factura
export const registerPayment = async (payment: Omit<InvoicePayment, 'id' | 'created_at'>): Promise<InvoicePayment> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = invoices.findIndex(i => i.id === payment.invoice_id);
  if (index === -1) {
    throw new Error(`Factura con ID ${payment.invoice_id} no encontrada`);
  }
  
  // Crear el pago
  const newPayment: InvoicePayment = {
    id: uuidv4(),
    ...payment,
    created_at: new Date().toISOString()
  };
  
  // Agregar el pago a la factura
  invoices[index].payments.push(newPayment);
  
  // Actualizar el estado de pago de la factura
  await updateInvoicePaymentStatus(payment.invoice_id);
  
  return newPayment;
};

// Actualizar el estado de pago de una factura
export const updateInvoicePaymentStatus = async (invoiceId: string): Promise<void> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const index = invoices.findIndex(i => i.id === invoiceId);
  if (index === -1) {
    throw new Error(`Factura con ID ${invoiceId} no encontrada`);
  }
  
  const invoice = invoices[index];
  
  // Calcular el total pagado
  const totalPaid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
  
  // Determinar el nuevo estado de pago
  let paymentStatus: Invoice['payment_status'] = 'pending';
  let status = invoice.status;
  
  if (totalPaid >= invoice.total_amount) {
    paymentStatus = 'paid';
    status = 'paid';
  } else if (totalPaid > 0) {
    paymentStatus = 'partial';
  } else if (invoice.due_date && new Date(invoice.due_date) < new Date()) {
    paymentStatus = 'overdue';
    status = 'overdue';
  }
  
  // Actualizar la factura
  invoices[index] = {
    ...invoice,
    payment_status: paymentStatus,
    status,
    updated_at: new Date().toISOString()
  };
};

// Obtener facturas por cliente
export const getInvoicesByClient = async (clientId: string): Promise<Invoice[]> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return invoices.filter(invoice => invoice.client_id === clientId);
};

// Marcar una factura como enviada
export const markInvoiceAsSent = async (id: string): Promise<Invoice> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = invoices.findIndex(i => i.id === id);
  if (index === -1) {
    throw new Error(`Factura con ID ${id} no encontrada`);
  }
  
  const updatedInvoice = {
    ...invoices[index],
    status: 'sent' as const,
    updated_at: new Date().toISOString()
  };
  
  invoices[index] = updatedInvoice;
  return updatedInvoice;
};

// Marcar una factura como cancelada
export const markInvoiceAsCancelled = async (id: string): Promise<Invoice> => {
  // Simular una llamada asíncrona
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = invoices.findIndex(i => i.id === id);
  if (index === -1) {
    throw new Error(`Factura con ID ${id} no encontrada`);
  }
  
  const updatedInvoice = {
    ...invoices[index],
    status: 'cancelled' as const,
    updated_at: new Date().toISOString()
  };
  
  invoices[index] = updatedInvoice;
  return updatedInvoice;
};