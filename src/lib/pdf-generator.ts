import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, InvoiceLineItem } from '@/types/billing';
import { Report } from '@/types';
import { Service, Client, DashboardStats, ServiceInspection } from '@/types';
import { formatCurrency, CHILE_CONFIG } from './chile-config';

// Configuración de empresa por defecto
const COMPANY_INFO = {
  name: 'TMS Grúas Chile',
  legalName: 'Transportes y Servicios TMS Chile SpA',
  rut: '76.123.456-7',
  address: 'Av. Providencia 1234',
  city: 'Santiago',
  region: 'Metropolitana de Santiago',
  phone: '+56 2 2234 5678',
  email: 'info@tmsgruas.cl',
  website: 'www.tmsgruas.cl'
};

// Configuración de colores y estilos
const COLORS = {
  primary: '#1f2937',
  secondary: '#6b7280',
  accent: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  light: '#f9fafb',
  white: '#ffffff'
};

export class PDFGenerator {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF();
  }

  // Generar PDF de factura
  generateInvoicePDF(invoice: Invoice, client?: Client): void {
    this.doc = new jsPDF();
    
    // Header de la empresa
    this.addCompanyHeader();
    
    // Información de la factura
    this.addInvoiceInfo(invoice);
    
    // Información del cliente
    this.addClientInfo(invoice, client);
    
    // Tabla de líneas de la factura
    this.addInvoiceTable(invoice);
    
    // Totales
    this.addInvoiceTotals(invoice);
    
    // Footer
    this.addInvoiceFooter();
    
    // Descargar el PDF
    this.doc.save(`Factura_${invoice.invoice_number}.pdf`);
  }

  // Generar PDF de reporte
  generateReportPDF(report: Report, data: any): void {
    this.doc = new jsPDF();
    
    // Header del reporte
    this.addReportHeader(report);
    
    // Contenido según el tipo de reporte
    switch (report.type) {
      case 'services':
        this.addServicesReport(data);
        break;
      case 'financial':
        this.addFinancialReport(data);
        break;
      case 'operators':
        this.addOperatorsReport(data);
        break;
      case 'vehicles':
        this.addVehiclesReport(data);
        break;
    }
    
    // Footer del reporte
    this.addReportFooter(report);
    
    // Descargar el PDF
    this.doc.save(`Reporte_${report.name.replace(/\s+/g, '_')}.pdf`);
  }

  // Generar PDF de inspección
  generateInspectionPDF(inspection: ServiceInspection, service?: Service, client?: Client): void {
    this.doc = new jsPDF();
    
    // Header de la empresa
    this.addCompanyHeader();
    
    // Información de la inspección
    this.addInspectionInfo(inspection, service);
    
    // Información del cliente y vehículo
    this.addInspectionClientInfo(client, service);
    
    // Detalles de la inspección
    this.addInspectionDetails(inspection);
    
    // Inventario
    this.addInspectionInventory(inspection);
    
    // Fotos
    this.addInspectionPhotos(inspection);
    
    // Firmas
    this.addInspectionSignatures(inspection);
    
    // Footer
    this.addInspectionFooter();
    
    // Descargar el PDF
    this.doc.save(`Inspeccion_${service?.service_number || 'SN'}.pdf`);
  }

  // Header de la empresa para facturas
  private addCompanyHeader(): void {
    const pageWidth = this.doc.internal.pageSize.width;
    
    // Logo placeholder (rectángulo azul)
    this.doc.setFillColor(COLORS.accent);
    this.doc.rect(20, 15, 25, 25, 'F');
    this.doc.setTextColor(COLORS.white);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('TMS', 32.5, 32, { align: 'center' });
    
    // Información de la empresa
    this.doc.setTextColor(COLORS.primary);
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(COMPANY_INFO.name, 50, 25);
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(COLORS.secondary);
    this.doc.text(COMPANY_INFO.legalName, 50, 32);
    this.doc.text(`RUT: ${COMPANY_INFO.rut}`, 50, 37);
    
    // Información de contacto (lado derecho)
    const contactX = pageWidth - 20;
    this.doc.text(COMPANY_INFO.address, contactX, 20, { align: 'right' });
    this.doc.text(`${COMPANY_INFO.city}, ${COMPANY_INFO.region}`, contactX, 25, { align: 'right' });
    this.doc.text(COMPANY_INFO.phone, contactX, 30, { align: 'right' });
    this.doc.text(COMPANY_INFO.email, contactX, 35, { align: 'right' });
    
    // Línea separadora
    this.doc.setDrawColor(COLORS.secondary);
    this.doc.line(20, 45, pageWidth - 20, 45);
  }

  // Información de la factura
  private addInvoiceInfo(invoice: Invoice): void {
    const pageWidth = this.doc.internal.pageSize.width;
    
    // Título de la factura
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(COLORS.primary);
    
    const invoiceTypeLabels = {
      factura: 'FACTURA',
      boleta: 'BOLETA',
      nota_credito: 'NOTA DE CRÉDITO',
      nota_debito: 'NOTA DE DÉBITO'
    };
    
    this.doc.text(invoiceTypeLabels[invoice.invoice_type], 20, 60);
    
    // Número y folio
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(COLORS.secondary);
    this.doc.text(`N° ${invoice.invoice_number}`, 20, 68);
    this.doc.text(`Folio: ${invoice.folio}`, 20, 75);
    
    // Fechas (lado derecho)
    const dateX = pageWidth - 20;
    this.doc.text(`Fecha de Emisión: ${new Date(invoice.issue_date).toLocaleDateString('es-CL')}`, dateX, 60, { align: 'right' });
    if (invoice.due_date) {
      this.doc.text(`Fecha de Vencimiento: ${new Date(invoice.due_date).toLocaleDateString('es-CL')}`, dateX, 67, { align: 'right' });
    }
    
    // Estado
    const statusLabels = {
      draft: 'BORRADOR',
      issued: 'EMITIDA',
      sent: 'ENVIADA',
      paid: 'PAGADA',
      overdue: 'VENCIDA',
      cancelled: 'CANCELADA'
    };
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(invoice.status === 'paid' ? COLORS.success : COLORS.warning);
    this.doc.text(`Estado: ${statusLabels[invoice.status]}`, dateX, 74, { align: 'right' });
  }

  // Información del cliente
  private addClientInfo(invoice: Invoice, client?: Client): void {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(COLORS.primary);
    this.doc.text('DATOS DEL CLIENTE', 20, 90);
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(COLORS.secondary);
    
    let y = 98;
    this.doc.text(`Nombre: ${invoice.client_name}`, 20, y);
    y += 6;
    this.doc.text(`RUT: ${invoice.client_rut}`, 20, y);
    y += 6;
    this.doc.text(`Dirección: ${invoice.client_address}`, 20, y);
    y += 6;
    this.doc.text(`Ciudad: ${invoice.client_city}, ${invoice.client_region}`, 20, y);
    
    if (client?.email) {
      y += 6;
      this.doc.text(`Email: ${client.email}`, 20, y);
    }
    
    if (client?.phone) {
      y += 6;
      this.doc.text(`Teléfono: ${client.phone}`, 20, y);
    }
  }

  // Tabla de líneas de la factura
  private addInvoiceTable(invoice: Invoice): void {
    const tableData = invoice.line_items.map((item, index) => [
      (index + 1).toString(),
      item.description,
      item.quantity.toString(),
      formatCurrency(item.unit_price),
      formatCurrency(item.subtotal),
      `${item.iva_rate}%`,
      formatCurrency(item.iva_amount),
      formatCurrency(item.total)
    ]);

    autoTable(this.doc, {
      startY: 130,
      head: [['#', 'Descripción', 'Cant.', 'Precio Unit.', 'Subtotal', 'IVA', 'IVA Monto', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: COLORS.white,
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: COLORS.primary
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 60 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 15, halign: 'center' },
        6: { cellWidth: 25, halign: 'right' },
        7: { cellWidth: 25, halign: 'right' }
      },
      margin: { left: 20, right: 20 }
    });
  }

  // Totales de la factura
  private addInvoiceTotals(invoice: Invoice): void {
    const pageWidth = this.doc.internal.pageSize.width;
    const finalY = (this.doc as any).lastAutoTable.finalY + 10;
    
    // Cuadro de totales
    const totalsX = pageWidth - 80;
    const totalsY = finalY;
    
    this.doc.setDrawColor(COLORS.secondary);
    this.doc.rect(totalsX, totalsY, 60, 30);
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(COLORS.secondary);
    
    let y = totalsY + 8;
    this.doc.text('Subtotal:', totalsX + 5, y);
    this.doc.text(formatCurrency(invoice.subtotal), totalsX + 55, y, { align: 'right' });
    
    y += 6;
    this.doc.text('IVA (19%):', totalsX + 5, y);
    this.doc.text(formatCurrency(invoice.iva_amount), totalsX + 55, y, { align: 'right' });
    
    // Total
    y += 8;
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.setTextColor(COLORS.primary);
    this.doc.text('TOTAL:', totalsX + 5, y);
    this.doc.text(formatCurrency(invoice.total_amount), totalsX + 55, y, { align: 'right' });
  }

  // Footer de la factura
  private addInvoiceFooter(): void {
    const pageHeight = this.doc.internal.pageSize.height;
    const pageWidth = this.doc.internal.pageSize.width;
    
    // Línea separadora
    this.doc.setDrawColor(COLORS.secondary);
    this.doc.line(20, pageHeight - 30, pageWidth - 20, pageHeight - 30);
    
    // Información adicional
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(COLORS.secondary);
    
    this.doc.text('Este documento es una representación impresa de una factura electrónica.', 20, pageHeight - 22);
    this.doc.text('Para consultas, contacte a: ' + COMPANY_INFO.email, 20, pageHeight - 17);
    
    // Número de página
    this.doc.text(`Página 1 de 1`, pageWidth - 20, pageHeight - 10, { align: 'right' });
    
    // Fecha de generación
    this.doc.text(`Generado el: ${new Date().toLocaleString('es-CL')}`, pageWidth - 20, pageHeight - 5, { align: 'right' });
  }

  // Información de la inspección
  private addInspectionInfo(inspection: ServiceInspection, service?: Service): void {
    const pageWidth = this.doc.internal.pageSize.width;
    
    // Título de la inspección
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(COLORS.primary);
    this.doc.text('ACTA DE INSPECCIÓN', 20, 60);
    
    // Número de servicio y fecha
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(COLORS.secondary);
    this.doc.text(`Servicio: ${service?.service_number || 'N/A'}`, 20, 68);
    if (service?.folio) {
      this.doc.text(`Folio: ${service.folio}`, 20, 75);
    }
    
    // Fechas (lado derecho)
    const dateX = pageWidth - 20;
    this.doc.text(`Fecha de Inspección: ${new Date(inspection.created_at).toLocaleDateString('es-CL')}`, dateX, 60, { align: 'right' });
    if (service?.service_date) {
      this.doc.text(`Fecha de Servicio: ${new Date(service.service_date).toLocaleDateString('es-CL')}`, dateX, 67, { align: 'right' });
    }
    
    // Operador
    this.doc.text(`Operador: ${inspection.operator_signature_name}`, dateX, 74, { align: 'right' });
  }

  // Información del cliente y vehículo para inspección
  private addInspectionClientInfo(client?: Client, service?: Service): void {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(COLORS.primary);
    this.doc.text('DATOS DEL CLIENTE Y VEHÍCULO', 20, 90);
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(COLORS.secondary);
    
    let y = 98;
    
    // Datos del cliente
    if (client) {
      this.doc.text(`Cliente: ${client.name}`, 20, y);
      y += 6;
      this.doc.text(`RUT: ${client.document}`, 20, y);
      y += 6;
      this.doc.text(`Teléfono: ${client.phone}`, 20, y);
      if (client.email) {
        y += 6;
        this.doc.text(`Email: ${client.email}`, 20, y);
      }
    } else {
      this.doc.text('Cliente: No especificado', 20, y);
      y += 6;
    }
    
    y += 10;
    
    // Datos del vehículo
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('VEHÍCULO:', 20, y);
    this.doc.setFont('helvetica', 'normal');
    
    y += 6;
    
    if (service) {
      if (service.vehicle_license_plate) {
        this.doc.text(`Patente: ${service.vehicle_license_plate}`, 20, y);
        y += 6;
      }
      
      if (service.vehicle_brand || service.vehicle_model) {
        this.doc.text(`Marca/Modelo: ${service.vehicle_brand || ''} ${service.vehicle_model || ''}`, 20, y);
        y += 6;
      }
      
      // Origen y destino
      this.doc.text(`Origen: ${service.origin_address}`, 20, y);
      y += 6;
      
      if (service.destination_address) {
        this.doc.text(`Destino: ${service.destination_address}`, 20, y);
        y += 6;
      }
    } else {
      this.doc.text('Vehículo: No especificado', 20, y);
      y += 6;
    }
  }

  // Detalles de la inspección
  private addInspectionDetails(inspection: ServiceInspection): void {
    const pageWidth = this.doc.internal.pageSize.width;
    
    // Título
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(COLORS.primary);
    this.doc.text('ESTADO DEL VEHÍCULO', 20, 140);
    
    // Tabla de condiciones
    const conditionLabels = {
      excellent: 'Excelente',
      good: 'Bueno',
      fair: 'Regular',
      poor: 'Malo',
      worn: 'Desgastado',
      needs_replacement: 'Necesita reemplazo'
    };
    
    const conditionData = [
      ['Estado Interior', conditionLabels[inspection.vehicle_condition_before.interior_condition as keyof typeof conditionLabels]],
      ['Nivel de Combustible', `${inspection.vehicle_condition_before.fuel_level}%`],
      ['Kilometraje', inspection.vehicle_condition_before.mileage?.toString() || 'No registrado'],
      ['Estado de Neumáticos', conditionLabels[inspection.vehicle_condition_before.tire_condition as keyof typeof conditionLabels]]
    ];
    
    autoTable(this.doc, {
      startY: 145,
      head: [['Característica', 'Estado']],
      body: conditionData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: COLORS.white,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: COLORS.primary
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 80 }
      },
      margin: { left: 20, right: 20 }
    });
    
    // Notas de inspección
    const finalY = (this.doc as any).lastAutoTable.finalY + 10;
    
    if (inspection.inspection_notes) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('OBSERVACIONES:', 20, finalY);
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(inspection.inspection_notes, 20, finalY + 8);
    }
  }

  // Inventario de la inspección
  private addInspectionInventory(inspection: ServiceInspection): void {
    // Obtener la posición Y actual
    let currentY = 200;
    
    if ((this.doc as any).lastAutoTable && (this.doc as any).lastAutoTable.finalY) {
      currentY = (this.doc as any).lastAutoTable.finalY + 20;
    }
    
    // Título
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(COLORS.primary);
    this.doc.text('INVENTARIO DE EQUIPOS Y ACCESORIOS', 20, currentY);
    
    // Crear datos de inventario (simulados para este ejemplo)
    const inventoryItems = [
      { name: 'Espejo Interno', checked: true },
      { name: 'Encendedor', checked: false },
      { name: 'Cint. Seguridad', checked: true },
      { name: 'Piso Goma', checked: true },
      { name: 'Cenicero', checked: false },
      { name: 'Emblemas', checked: true },
      { name: 'Espejo Exterior', checked: true },
      { name: 'Neblineros', checked: false },
      { name: 'Rueda Del Izq.', checked: true },
      { name: 'Rueda Del.Der.', checked: true },
      { name: 'Rueda Tra.Der.', checked: true },
      { name: 'Tapa Bencina', checked: true }
    ];
    
    // Dividir en columnas
    const columns = 3;
    const itemsPerColumn = Math.ceil(inventoryItems.length / columns);
    const inventoryData = [];
    
    for (let i = 0; i < itemsPerColumn; i++) {
      const row = [];
      for (let j = 0; j < columns; j++) {
        const index = j * itemsPerColumn + i;
        if (index < inventoryItems.length) {
          const item = inventoryItems[index];
          row.push(`${item.checked ? '☑' : '☐'} ${item.name}`);
        } else {
          row.push('');
        }
      }
      inventoryData.push(row);
    }
    
    autoTable(this.doc, {
      startY: currentY + 5,
      head: [['Columna 1', 'Columna 2', 'Columna 3']],
      body: inventoryData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: COLORS.white,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: COLORS.primary
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 60 },
        2: { cellWidth: 60 }
      },
      margin: { left: 20, right: 20 },
      showHead: false
    });
  }

  // Fotos de la inspección
  private addInspectionPhotos(inspection: ServiceInspection): void {
    // Obtener la posición Y actual
    let currentY = 250;
    
    if ((this.doc as any).lastAutoTable && (this.doc as any).lastAutoTable.finalY) {
      currentY = (this.doc as any).lastAutoTable.finalY + 20;
    }
    
    // Título
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(COLORS.primary);
    this.doc.text('REGISTRO FOTOGRÁFICO', 20, currentY);
    
    // Verificar si hay fotos
    if (inspection.photos_before.length === 0 && (!inspection.photos_after || inspection.photos_after.length === 0)) {
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'italic');
      this.doc.setTextColor(COLORS.secondary);
      this.doc.text('No hay fotografías registradas', 20, currentY + 10);
      return;
    }
    
    // Texto informativo
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(COLORS.secondary);
    this.doc.text(`Se adjuntan ${inspection.photos_before.length + (inspection.photos_after?.length || 0)} fotografías del vehículo`, 20, currentY + 10);
    
    // En un PDF real, aquí se insertarían las imágenes
    // Para este ejemplo, solo mostramos placeholders
    
    currentY += 15;
    
    // Fotos antes
    if (inspection.photos_before.length > 0) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Fotos Antes del Servicio:', 20, currentY);
      
      currentY += 10;
      
      // Placeholders para fotos
      const photoWidth = 40;
      const photoHeight = 30;
      const photosPerRow = 4;
      const margin = 20;
      const spacing = 10;
      
      for (let i = 0; i < Math.min(inspection.photos_before.length, 4); i++) {
        const x = margin + (i % photosPerRow) * (photoWidth + spacing);
        const y = currentY + Math.floor(i / photosPerRow) * (photoHeight + spacing);
        
        // Dibujar placeholder
        this.doc.setDrawColor(COLORS.secondary);
        this.doc.setFillColor('#f3f4f6');
        this.doc.rect(x, y, photoWidth, photoHeight, 'FD');
        
        // Texto de placeholder
        this.doc.setFontSize(8);
        this.doc.setTextColor(COLORS.secondary);
        this.doc.text(`Foto ${i + 1}`, x + photoWidth / 2, y + photoHeight / 2, { align: 'center' });
      }
      
      currentY += photoHeight + spacing;
      
      if (inspection.photos_before.length > 4) {
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'italic');
        this.doc.text(`(y ${inspection.photos_before.length - 4} fotos más)`, margin, currentY + 10);
        currentY += 15;
      }
    }
    
    // Fotos después
    if (inspection.photos_after && inspection.photos_after.length > 0) {
      currentY += 10;
      
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Fotos Después del Servicio:', 20, currentY);
      
      currentY += 10;
      
      // Placeholders para fotos
      const photoWidth = 40;
      const photoHeight = 30;
      const photosPerRow = 4;
      const margin = 20;
      const spacing = 10;
      
      for (let i = 0; i < Math.min(inspection.photos_after.length, 4); i++) {
        const x = margin + (i % photosPerRow) * (photoWidth + spacing);
        const y = currentY + Math.floor(i / photosPerRow) * (photoHeight + spacing);
        
        // Dibujar placeholder
        this.doc.setDrawColor(COLORS.secondary);
        this.doc.setFillColor('#f3f4f6');
        this.doc.rect(x, y, photoWidth, photoHeight, 'FD');
        
        // Texto de placeholder
        this.doc.setFontSize(8);
        this.doc.setTextColor(COLORS.secondary);
        this.doc.text(`Foto ${i + 1}`, x + photoWidth / 2, y + photoHeight / 2, { align: 'center' });
      }
    }
  }

  // Firmas de la inspección
  private addInspectionSignatures(inspection: ServiceInspection): void {
    // Obtener la posición Y actual o usar una posición fija
    let currentY = 350;
    
    if ((this.doc as any).lastAutoTable && (this.doc as any).lastAutoTable.finalY) {
      currentY = (this.doc as any).lastAutoTable.finalY + 40;
    }
    
    // Asegurarse de que hay espacio suficiente, si no, añadir nueva página
    if (currentY > 240) {
      this.doc.addPage();
      currentY = 40;
    }
    
    // Título
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(COLORS.primary);
    this.doc.text('FIRMAS', 20, currentY);
    
    currentY += 10;
    
    const pageWidth = this.doc.internal.pageSize.width;
    const signatureWidth = 70;
    const signatureHeight = 30;
    
    // Firma del operador
    this.doc.setDrawColor(COLORS.secondary);
    this.doc.rect(20, currentY, signatureWidth, signatureHeight);
    
    if (inspection.operator_signature_image) {
      // En un caso real, aquí se insertaría la imagen de la firma
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'italic');
      this.doc.setTextColor(COLORS.secondary);
      this.doc.text('Firma digital registrada', 20 + signatureWidth / 2, currentY + signatureHeight / 2, { align: 'center' });
    }
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(COLORS.primary);
    this.doc.text('Operador:', 20, currentY + signatureHeight + 5);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(inspection.operator_signature_name, 20, currentY + signatureHeight + 12);
    
    // Firma del cliente
    this.doc.setFont('helvetica', 'normal');
    this.doc.setDrawColor(COLORS.secondary);
    this.doc.rect(pageWidth - 20 - signatureWidth, currentY, signatureWidth, signatureHeight);
    
    if (inspection.client_signature_image) {
      // En un caso real, aquí se insertaría la imagen de la firma
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'italic');
      this.doc.setTextColor(COLORS.secondary);
      this.doc.text('Firma digital registrada', pageWidth - 20 - signatureWidth / 2, currentY + signatureHeight / 2, { align: 'center' });
    }
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(COLORS.primary);
    this.doc.text('Cliente:', pageWidth - 20 - signatureWidth, currentY + signatureHeight + 5);
    
    if (inspection.client_signature_name) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(inspection.client_signature_name, pageWidth - 20 - signatureWidth, currentY + signatureHeight + 12);
    } else {
      this.doc.setFont('helvetica', 'italic');
      this.doc.setTextColor(COLORS.secondary);
      this.doc.text('No firmado', pageWidth - 20 - signatureWidth, currentY + signatureHeight + 12);
    }
  }

  // Footer para inspecciones
  private addInspectionFooter(): void {
    const pageHeight = this.doc.internal.pageSize.height;
    const pageWidth = this.doc.internal.pageSize.width;
    
    // Línea separadora
    this.doc.setDrawColor(COLORS.secondary);
    this.doc.line(20, pageHeight - 30, pageWidth - 20, pageHeight - 30);
    
    // Información adicional
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(COLORS.secondary);
    
    this.doc.text('Este documento es un acta oficial de inspección de vehículo.', 20, pageHeight - 22);
    this.doc.text('Para consultas, contacte a: ' + COMPANY_INFO.email, 20, pageHeight - 17);
    
    // Número de página
    this.doc.text(`Página 1 de 1`, pageWidth - 20, pageHeight - 10, { align: 'right' });
    
    // Fecha de generación
    this.doc.text(`Generado el: ${new Date().toLocaleString('es-CL')}`, pageWidth - 20, pageHeight - 5, { align: 'right' });
  }

  // Header para reportes
  private addReportHeader(report: Report): void {
    const pageWidth = this.doc.internal.pageSize.width;
    
    // Logo y título
    this.doc.setFillColor(COLORS.accent);
    this.doc.rect(20, 15, 25, 25, 'F');
    this.doc.setTextColor(COLORS.white);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('TMS', 32.5, 32, { align: 'center' });
    
    // Título del reporte
    this.doc.setTextColor(COLORS.primary);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(report.name, 50, 25);
    
    // Tipo de reporte
    const typeLabels = {
      services: 'Reporte de Servicios',
      financial: 'Reporte Financiero',
      operators: 'Reporte de Operadores',
      vehicles: 'Reporte de Vehículos'
    };
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(COLORS.secondary);
    this.doc.text(typeLabels[report.type], 50, 32);
    
    // Período del reporte
    const dateFrom = new Date(report.parameters.date_from).toLocaleDateString('es-CL');
    const dateTo = new Date(report.parameters.date_to).toLocaleDateString('es-CL');
    this.doc.text(`Período: ${dateFrom} - ${dateTo}`, 50, 37);
    
    // Fecha de generación
    this.doc.text(`Generado: ${new Date().toLocaleDateString('es-CL')}`, pageWidth - 20, 25, { align: 'right' });
    this.doc.text(`Por: ${report.generated_by}`, pageWidth - 20, 30, { align: 'right' });
    
    // Línea separadora
    this.doc.setDrawColor(COLORS.secondary);
    this.doc.line(20, 45, pageWidth - 20, 45);
  }

  // Reporte de servicios
  private addServicesReport(data: any): void {
    let currentY = 60;
    
    // Resumen ejecutivo
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(COLORS.primary);
    this.doc.text('RESUMEN EJECUTIVO', 20, currentY);
    
    currentY += 10;
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(COLORS.secondary);
    
    const stats = data.stats || {
      total_services: 25,
      completed_services: 22,
      total_revenue: 2500000,
      avg_response_time: 28
    };
    
    this.doc.text(`Total de Servicios: ${stats.total_services}`, 20, currentY);
    currentY += 6;
    this.doc.text(`Servicios Completados: ${stats.completed_services}`, 20, currentY);
    currentY += 6;
    this.doc.text(`Ingresos Totales: ${formatCurrency(stats.total_revenue)}`, 20, currentY);
    currentY += 6;
    this.doc.text(`Tiempo Promedio de Respuesta: ${stats.avg_response_time} minutos`, 20, currentY);
    
    currentY += 15;
    
    // Tabla de servicios
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(COLORS.primary);
    this.doc.text('DETALLE DE SERVICIOS', 20, currentY);
    
    const servicesData = data.services || [];
    const tableData = servicesData.slice(0, 20).map((service: Service) => [
      service.service_number,
      service.service_type,
      new Date(service.service_date).toLocaleDateString('es-CL'),
      service.status,
      formatCurrency(service.total_cost)
    ]);

    autoTable(this.doc, {
      startY: currentY + 5,
      head: [['Número', 'Tipo', 'Fecha', 'Estado', 'Monto']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: COLORS.white,
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8
      },
      margin: { left: 20, right: 20 }
    });
  }

  // Reporte financiero
  private addFinancialReport(data: any): void {
    let currentY = 60;
    
    // Resumen financiero
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(COLORS.primary);
    this.doc.text('RESUMEN FINANCIERO', 20, currentY);
    
    currentY += 10;
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(COLORS.secondary);
    
    const financial = data.financial || {
      total_revenue: 5500000,
      total_costs: 3200000,
      net_profit: 2300000,
      profit_margin: 41.8,
      invoiced_amount: 4800000,
      pending_amount: 700000
    };
    
    this.doc.text(`Ingresos Totales: ${formatCurrency(financial.total_revenue)}`, 20, currentY);
    currentY += 6;
    this.doc.text(`Costos Totales: ${formatCurrency(financial.total_costs)}`, 20, currentY);
    currentY += 6;
    this.doc.text(`Utilidad Neta: ${formatCurrency(financial.net_profit)}`, 20, currentY);
    currentY += 6;
    this.doc.text(`Margen de Utilidad: ${financial.profit_margin}%`, 20, currentY);
    currentY += 6;
    this.doc.text(`Monto Facturado: ${formatCurrency(financial.invoiced_amount)}`, 20, currentY);
    currentY += 6;
    this.doc.text(`Por Cobrar: ${formatCurrency(financial.pending_amount)}`, 20, currentY);
    
    currentY += 15;
    
    // Gráfico de ingresos por día (simulado con tabla)
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(COLORS.primary);
    this.doc.text('INGRESOS POR DÍA', 20, currentY);
    
    const revenueData = data.revenue_by_day || [
      { date: '2024-01-20', revenue: 385000 },
      { date: '2024-01-21', revenue: 420000 },
      { date: '2024-01-22', revenue: 350000 },
      { date: '2024-01-23', revenue: 485000 },
      { date: '2024-01-24', revenue: 520000 },
      { date: '2024-01-25', revenue: 395000 }
    ];
    
    const revenueTableData = revenueData.map((item: any) => [
      new Date(item.date).toLocaleDateString('es-CL'),
      formatCurrency(item.revenue)
    ]);

    autoTable(this.doc, {
      startY: currentY + 5,
      head: [['Fecha', 'Ingresos']],
      body: revenueTableData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: COLORS.white,
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 40, halign: 'right' }
      },
      margin: { left: 20, right: 20 }
    });
  }

  // Reporte de operadores
  private addOperatorsReport(data: any): void {
    let currentY = 60;
    
    // Resumen de operadores
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(COLORS.primary);
    this.doc.text('RENDIMIENTO DE OPERADORES', 20, currentY);
    
    currentY += 10;
    
    const operators = data.operators || [
      { name: 'Juan Operador', services_count: 45, revenue: 1250000, efficiency: 92 },
      { name: 'Pedro Conductor', services_count: 38, revenue: 980000, efficiency: 88 },
      { name: 'Carlos Chofer', services_count: 32, revenue: 850000, efficiency: 85 }
    ];
    
    const operatorTableData = operators.map((op: any) => [
      op.name,
      op.services_count.toString(),
      formatCurrency(op.revenue),
      `${op.efficiency}%`
    ]);

    autoTable(this.doc, {
      startY: currentY,
      head: [['Operador', 'Servicios', 'Ingresos Generados', 'Eficiencia']],
      body: operatorTableData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: COLORS.white,
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8
      },
      margin: { left: 20, right: 20 }
    });
  }

  // Reporte de vehículos
  private addVehiclesReport(data: any): void {
    let currentY = 60;
    
    // Estado de la flota
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(COLORS.primary);
    this.doc.text('ESTADO DE LA FLOTA', 20, currentY);
    
    currentY += 10;
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(COLORS.secondary);
    
    const fleet = data.fleet || {
      total_trucks: 8,
      available: 5,
      in_service: 2,
      maintenance: 1,
      utilization_rate: 75
    };
    
    this.doc.text(`Total de Grúas: ${fleet.total_trucks}`, 20, currentY);
    currentY += 6;
    this.doc.text(`Disponibles: ${fleet.available}`, 20, currentY);
    currentY += 6;
    this.doc.text(`En Servicio: ${fleet.in_service}`, 20, currentY);
    currentY += 6;
    this.doc.text(`En Mantenimiento: ${fleet.maintenance}`, 20, currentY);
    currentY += 6;
    this.doc.text(`Tasa de Utilización: ${fleet.utilization_rate}%`, 20, currentY);
    
    currentY += 15;
    
    // Tabla de vehículos
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(COLORS.primary);
    this.doc.text('DETALLE DE VEHÍCULOS', 20, currentY);
    
    const vehicles = data.vehicles || [
      { name: 'Grúa 01', license_plate: 'GRU001', status: 'available', capacity: '3.5t' },
      { name: 'Grúa 02', license_plate: 'GRU002', status: 'in_service', capacity: '2.5t' },
      { name: 'Grúa 03', license_plate: 'GRU003', status: 'maintenance', capacity: '4.0t' }
    ];
    
    const vehicleTableData = vehicles.map((vehicle: any) => [
      vehicle.name,
      vehicle.license_plate,
      vehicle.status,
      vehicle.capacity
    ]);

    autoTable(this.doc, {
      startY: currentY + 5,
      head: [['Nombre', 'Patente', 'Estado', 'Capacidad']],
      body: vehicleTableData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: COLORS.white,
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8
      },
      margin: { left: 20, right: 20 }
    });
  }

  // Footer para reportes
  private addReportFooter(report: Report): void {
    const pageHeight = this.doc.internal.pageSize.height;
    const pageWidth = this.doc.internal.pageSize.width;
    
    // Línea separadora
    this.doc.setDrawColor(COLORS.secondary);
    this.doc.line(20, pageHeight - 30, pageWidth - 20, pageHeight - 30);
    
    // Información del reporte
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(COLORS.secondary);
    
    this.doc.text(`Reporte generado por: ${COMPANY_INFO.name}`, 20, pageHeight - 22);
    this.doc.text(`Contacto: ${COMPANY_INFO.email} | ${COMPANY_INFO.phone}`, 20, pageHeight - 17);
    
    // Información técnica
    this.doc.text(`ID del Reporte: ${report.id}`, pageWidth - 20, pageHeight - 22, { align: 'right' });
    this.doc.text(`Generado: ${new Date().toLocaleString('es-CL')}`, pageWidth - 20, pageHeight - 17, { align: 'right' });
    this.doc.text('Página 1 de 1', pageWidth - 20, pageHeight - 10, { align: 'right' });
  }
}

// Funciones de utilidad para generar PDFs
export const generateInvoicePDF = (invoice: Invoice, client?: Client): void => {
  const generator = new PDFGenerator();
  generator.generateInvoicePDF(invoice, client);
};

export const generateReportPDF = (report: Report, data: any): void => {
  const generator = new PDFGenerator();
  generator.generateReportPDF(report, data);
};

// Función para generar PDF de inspección
export const generateInspectionPDF = (inspection: ServiceInspection, service?: Service, client?: Client): void => {
  const generator = new PDFGenerator();
  generator.generateInspectionPDF(inspection, service, client);
};

// Función para previsualizar PDF (retorna blob)
export const generateInvoicePDFBlob = (invoice: Invoice, client?: Client): Blob => {
  const generator = new PDFGenerator();
  generator.generateInvoicePDF(invoice, client);
  return (generator as any).doc.output('blob');
};

export const generateReportPDFBlob = (report: Report, data: any): Blob => {
  const generator = new PDFGenerator();
  generator.generateReportPDF(report, data);
  return (generator as any).doc.output('blob');
};

export const generateInspectionPDFBlob = (inspection: ServiceInspection, service?: Service, client?: Client): Blob => {
  const generator = new PDFGenerator();
  generator.generateInspectionPDF(inspection, service, client);
  return (generator as any).doc.output('blob');
};