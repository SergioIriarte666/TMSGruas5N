export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_type: 'factura' | 'boleta' | 'nota_credito' | 'nota_debito';
  folio: number;
  client_id: string;
  client?: Client;
  service_ids: string[];
  services?: Service[];
  issue_date: string;
  due_date?: string;
  
  // Montos
  subtotal: number;
  iva_amount: number;
  total_amount: number;
  
  // Estado
  status: 'draft' | 'issued' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  payment_status: 'pending' | 'partial' | 'paid' | 'overdue';
  
  // Información del cliente
  client_rut: string;
  client_name: string;
  client_address: string;
  client_city: string;
  client_region: string;
  
  // Detalles de líneas
  line_items: InvoiceLineItem[];
  
  // Información tributaria
  sii_status?: 'pending' | 'accepted' | 'rejected';
  sii_track_id?: string;
  sii_response?: string;
  electronic_signature?: string;
  
  // Archivos
  pdf_url?: string;
  xml_url?: string;
  
  // Pagos
  payments: InvoicePayment[];
  
  // Metadatos
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent?: number;
  discount_amount?: number;
  subtotal: number;
  iva_rate: number;
  iva_amount: number;
  total: number;
  service_id?: string;
}

export interface InvoicePayment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_date: string;
  payment_method: 'cash' | 'transfer' | 'check' | 'card' | 'other';
  reference?: string;
  notes?: string;
  created_at: string;
}

export interface BillingSettings {
  company_rut: string;
  company_name: string;
  company_address: string;
  company_city: string;
  company_region: string;
  company_phone: string;
  company_email: string;
  
  // Configuración SII
  sii_environment: 'production' | 'certification';
  sii_certificate?: string;
  sii_private_key?: string;
  
  // Configuración de folios
  folio_ranges: FolioRange[];
  
  // Configuración de facturación
  default_payment_terms: number; // días
  auto_send_invoices: boolean;
  include_iva: boolean;
  iva_rate: number;
  
  // Plantillas
  invoice_template: string;
  invoice_footer?: string;
  
  created_at: string;
  updated_at: string;
}

export interface FolioRange {
  id: string;
  document_type: 'factura' | 'boleta' | 'nota_credito' | 'nota_debito';
  start_folio: number;
  end_folio: number;
  current_folio: number;
  authorized_date: string;
  expiry_date: string;
  caf_file?: string; // Código de Autorización de Folios
  status: 'active' | 'expired' | 'exhausted';
}

export interface TaxReport {
  id: string;
  period_month: number;
  period_year: number;
  total_sales: number;
  total_iva: number;
  total_invoices: number;
  status: 'draft' | 'submitted' | 'accepted';
  generated_at: string;
  submitted_at?: string;
  file_url?: string;
}

// Re-export types from main types file
import type { Client, Service } from '@/types';