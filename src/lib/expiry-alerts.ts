import { addDays, isPast, isWithinInterval } from 'date-fns';

// Tipos de documentos que pueden tener fechas de vencimiento
export type DocumentType = 
  | 'license' 
  | 'occupational_exam' 
  | 'psychosensometric_exam'
  | 'circulation_permit'
  | 'soap'
  | 'technical_review'
  | 'invoice'
  | 'calendar_event'
  | 'service_deadline'
  | 'maintenance_schedule';

// Niveles de alerta
export type AlertLevel = 'critical' | 'warning' | 'info' | 'ok';

// Estructura de una alerta
export interface ExpiryAlert {
  id: string;
  documentType: DocumentType;
  entityId: string;
  entityType: 'operator' | 'tow_truck' | 'invoice' | 'calendar' | 'service' | 'maintenance';
  entityName: string;
  expiryDate: string;
  alertLevel: AlertLevel;
  message: string;
  daysRemaining: number;
  read: boolean;
}

// Configuración de umbrales para cada tipo de documento
const alertThresholds: Record<DocumentType, { warning: number; critical: number }> = {
  license: { warning: 30, critical: 7 },
  occupational_exam: { warning: 30, critical: 7 },
  psychosensometric_exam: { warning: 30, critical: 7 },
  circulation_permit: { warning: 30, critical: 7 },
  soap: { warning: 30, critical: 7 },
  technical_review: { warning: 30, critical: 7 },
  invoice: { warning: 7, critical: 1 },
  calendar_event: { warning: 3, critical: 1 },
  service_deadline: { warning: 2, critical: 0 },
  maintenance_schedule: { warning: 14, critical: 3 }
};

// Mensajes personalizados para cada tipo de documento
const alertMessages: Record<DocumentType, { warning: string; critical: string; expired: string }> = {
  license: {
    warning: 'La licencia de conducir vencerá pronto',
    critical: 'La licencia de conducir está a punto de vencer',
    expired: 'La licencia de conducir ha vencido'
  },
  occupational_exam: {
    warning: 'El examen ocupacional vencerá pronto',
    critical: 'El examen ocupacional está a punto de vencer',
    expired: 'El examen ocupacional ha vencido'
  },
  psychosensometric_exam: {
    warning: 'El examen psicosensotécnico vencerá pronto',
    critical: 'El examen psicosensotécnico está a punto de vencer',
    expired: 'El examen psicosensotécnico ha vencido'
  },
  circulation_permit: {
    warning: 'El permiso de circulación vencerá pronto',
    critical: 'El permiso de circulación está a punto de vencer',
    expired: 'El permiso de circulación ha vencido'
  },
  soap: {
    warning: 'El SOAP vencerá pronto',
    critical: 'El SOAP está a punto de vencer',
    expired: 'El SOAP ha vencido'
  },
  technical_review: {
    warning: 'La revisión técnica vencerá pronto',
    critical: 'La revisión técnica está a punto de vencer',
    expired: 'La revisión técnica ha vencido'
  },
  invoice: {
    warning: 'La factura vencerá pronto',
    critical: 'La factura vence mañana',
    expired: 'La factura ha vencido'
  },
  calendar_event: {
    warning: 'Evento próximo a realizarse',
    critical: 'Evento programado para mañana',
    expired: 'Evento vencido'
  },
  service_deadline: {
    warning: 'Plazo de servicio próximo a vencer',
    critical: 'Plazo de servicio vence hoy',
    expired: 'Plazo de servicio ha vencido'
  },
  maintenance_schedule: {
    warning: 'Mantenimiento programado próximamente',
    critical: 'Mantenimiento programado esta semana',
    expired: 'Mantenimiento vencido'
  }
};

/**
 * Determina el nivel de alerta basado en la fecha de vencimiento
 */
export function getAlertLevel(expiryDate: string | Date, documentType: DocumentType): AlertLevel {
  if (!expiryDate) return 'ok';
  
  const expiryDateObj = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  const today = new Date();
  
  // Si ya venció
  if (isPast(expiryDateObj)) {
    return 'critical';
  }
  
  const { warning, critical } = alertThresholds[documentType];
  
  // Si está en el umbral crítico
  if (isWithinInterval(expiryDateObj, {
    start: today,
    end: addDays(today, critical)
  })) {
    return 'critical';
  }
  
  // Si está en el umbral de advertencia
  if (isWithinInterval(expiryDateObj, {
    start: today,
    end: addDays(today, warning)
  })) {
    return 'warning';
  }
  
  return 'ok';
}

/**
 * Calcula los días restantes hasta la fecha de vencimiento
 */
export function getDaysRemaining(expiryDate: string | Date): number {
  if (!expiryDate) return 0;
  
  const expiryDateObj = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  const today = new Date();
  
  // Si ya venció, retornar un número negativo
  if (isPast(expiryDateObj)) {
    const diffTime = today.getTime() - expiryDateObj.getTime();
    return -Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  // Calcular días restantes
  const diffTime = expiryDateObj.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Genera un mensaje de alerta basado en el tipo de documento y nivel de alerta
 */
export function getAlertMessage(documentType: DocumentType, alertLevel: AlertLevel, daysRemaining: number): string {
  if (alertLevel === 'ok') {
    return '';
  }
  
  if (daysRemaining < 0) {
    return `${alertMessages[documentType].expired} hace ${Math.abs(daysRemaining)} días`;
  }
  
  if (alertLevel === 'critical') {
    return daysRemaining === 0 
      ? `${alertMessages[documentType].critical} hoy` 
      : `${alertMessages[documentType].critical} en ${daysRemaining} días`;
  }
  
  return `${alertMessages[documentType].warning} en ${daysRemaining} días`;
}

/**
 * Crea una alerta para un documento con fecha de vencimiento
 */
export function createAlert(
  documentType: DocumentType,
  entityId: string,
  entityType: ExpiryAlert['entityType'],
  entityName: string,
  expiryDate: string
): ExpiryAlert | null {
  if (!expiryDate) return null;
  
  const alertLevel = getAlertLevel(expiryDate, documentType);
  
  // Solo crear alertas para niveles warning y critical
  if (alertLevel === 'ok') {
    return null;
  }
  
  const daysRemaining = getDaysRemaining(expiryDate);
  const message = getAlertMessage(documentType, alertLevel, daysRemaining);
  
  return {
    id: `${entityType}-${entityId}-${documentType}`,
    documentType,
    entityId,
    entityType,
    entityName,
    expiryDate,
    alertLevel,
    message,
    daysRemaining,
    read: false
  };
}

/**
 * Genera alertas para un operador
 */
export function generateOperatorAlerts(operator: any): ExpiryAlert[] {
  const alerts: ExpiryAlert[] = [];
  
  if (operator.license_expiry) {
    const alert = createAlert(
      'license',
      operator.id,
      'operator',
      operator.name,
      operator.license_expiry
    );
    if (alert) alerts.push(alert);
  }
  
  if (operator.occupational_exam_expiry) {
    const alert = createAlert(
      'occupational_exam',
      operator.id,
      'operator',
      operator.name,
      operator.occupational_exam_expiry
    );
    if (alert) alerts.push(alert);
  }
  
  if (operator.psychosensometric_exam_expiry) {
    const alert = createAlert(
      'psychosensometric_exam',
      operator.id,
      'operator',
      operator.name,
      operator.psychosensometric_exam_expiry
    );
    if (alert) alerts.push(alert);
  }
  
  return alerts;
}

/**
 * Genera alertas para una grúa
 */
export function generateTowTruckAlerts(towTruck: any): ExpiryAlert[] {
  const alerts: ExpiryAlert[] = [];
  
  if (towTruck.circulation_permit_expiry) {
    const alert = createAlert(
      'circulation_permit',
      towTruck.id,
      'tow_truck',
      towTruck.name,
      towTruck.circulation_permit_expiry
    );
    if (alert) alerts.push(alert);
  }
  
  if (towTruck.soap_expiry) {
    const alert = createAlert(
      'soap',
      towTruck.id,
      'tow_truck',
      towTruck.name,
      towTruck.soap_expiry
    );
    if (alert) alerts.push(alert);
  }
  
  if (towTruck.technical_review_expiry) {
    const alert = createAlert(
      'technical_review',
      towTruck.id,
      'tow_truck',
      towTruck.name,
      towTruck.technical_review_expiry
    );
    if (alert) alerts.push(alert);
  }
  
  return alerts;
}

/**
 * Genera alertas para una factura
 */
export function generateInvoiceAlerts(invoice: any): ExpiryAlert[] {
  const alerts: ExpiryAlert[] = [];
  
  if (invoice.due_date && invoice.status !== 'paid' && invoice.status !== 'cancelled') {
    const alert = createAlert(
      'invoice',
      invoice.id,
      'invoice',
      invoice.invoice_number,
      invoice.due_date
    );
    if (alert) alerts.push(alert);
  }
  
  return alerts;
}

/**
 * Genera alertas para un evento de calendario
 */
export function generateCalendarAlerts(event: any): ExpiryAlert[] {
  const alerts: ExpiryAlert[] = [];
  
  if (event.start && event.status !== 'completed' && event.status !== 'cancelled') {
    const alert = createAlert(
      'calendar_event',
      event.id,
      'calendar',
      event.title,
      event.start
    );
    if (alert) alerts.push(alert);
  }
  
  return alerts;
}

/**
 * Genera todas las alertas del sistema
 */
export function generateAllAlerts(
  operators: any[],
  towTrucks: any[],
  invoices: any[],
  calendarEvents: any[]
): ExpiryAlert[] {
  let allAlerts: ExpiryAlert[] = [];
  
  // Alertas de operadores
  operators.forEach(operator => {
    allAlerts = [...allAlerts, ...generateOperatorAlerts(operator)];
  });
  
  // Alertas de grúas
  towTrucks.forEach(towTruck => {
    allAlerts = [...allAlerts, ...generateTowTruckAlerts(towTruck)];
  });
  
  // Alertas de facturas
  invoices.forEach(invoice => {
    allAlerts = [...allAlerts, ...generateInvoiceAlerts(invoice)];
  });
  
  // Alertas de calendario
  calendarEvents.forEach(event => {
    allAlerts = [...allAlerts, ...generateCalendarAlerts(event)];
  });
  
  // Ordenar por nivel de alerta (critical primero) y luego por días restantes
  return allAlerts.sort((a, b) => {
    if (a.alertLevel === 'critical' && b.alertLevel !== 'critical') return -1;
    if (a.alertLevel !== 'critical' && b.alertLevel === 'critical') return 1;
    return a.daysRemaining - b.daysRemaining;
  });
}

/**
 * Obtiene el color de alerta según el nivel
 */
export function getAlertLevelColor(alertLevel: AlertLevel): string {
  switch (alertLevel) {
    case 'critical':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'warning':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case 'info':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'ok':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
}

/**
 * Obtiene el icono para el tipo de documento
 */
export function getDocumentTypeIcon(documentType: DocumentType): string {
  switch (documentType) {
    case 'license':
      return 'id-card';
    case 'occupational_exam':
      return 'stethoscope';
    case 'psychosensometric_exam':
      return 'brain';
    case 'circulation_permit':
      return 'file-text';
    case 'soap':
      return 'shield-check';
    case 'technical_review':
      return 'car';
    case 'invoice':
      return 'receipt';
    case 'calendar_event':
      return 'calendar';
    case 'service_deadline':
      return 'clock';
    case 'maintenance_schedule':
      return 'tool';
    default:
      return 'alert-circle';
  }
}