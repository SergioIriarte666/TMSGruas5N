// Configuración específica para Chile
export const CHILE_CONFIG = {
  // Moneda
  currency: {
    code: 'CLP',
    symbol: '$',
    name: 'Peso Chileno',
    decimals: 0, // Los pesos chilenos no usan decimales
  },

  // Impuestos
  taxes: {
    iva: {
      rate: 0.19, // 19% IVA en Chile
      name: 'IVA',
      description: 'Impuesto al Valor Agregado'
    },
    // Otros impuestos específicos si aplican
    municipal: {
      rate: 0.005, // 0.5% ejemplo para impuestos municipales
      name: 'Impuesto Municipal',
      description: 'Impuesto Municipal sobre Servicios'
    }
  },

  // Tipos de documento de identidad en Chile
  documentTypes: {
    rut: 'RUT',
    passport: 'Pasaporte',
    foreign_id: 'Cédula Extranjera'
  },

  // Regiones de Chile
  regions: [
    'Arica y Parinacota',
    'Tarapacá',
    'Antofagasta',
    'Atacama',
    'Coquimbo',
    'Valparaíso',
    'Metropolitana de Santiago',
    'Libertador General Bernardo O\'Higgins',
    'Maule',
    'Ñuble',
    'Biobío',
    'La Araucanía',
    'Los Ríos',
    'Los Lagos',
    'Aysén del General Carlos Ibáñez del Campo',
    'Magallanes y de la Antártica Chilena'
  ],

  // Configuración de facturación
  billing: {
    requireRut: true,
    electronicInvoicing: true,
    siiIntegration: true, // Servicio de Impuestos Internos
  },

  // Formato de números y fechas
  formatting: {
    numberFormat: 'es-CL',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    phoneFormat: '+56 9 XXXX XXXX'
  }
};

// Utilidades para formateo
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('es-CL').format(number);
};

export const calculateIVA = (amount: number): number => {
  return Math.round(amount * CHILE_CONFIG.taxes.iva.rate);
};

export const calculateTotal = (subtotal: number): number => {
  const iva = calculateIVA(subtotal);
  return subtotal + iva;
};

export const validateRUT = (rut: string): boolean => {
  // Validación básica de RUT chileno
  const cleanRut = rut.replace(/[^0-9kK]/g, '');
  if (cleanRut.length < 8 || cleanRut.length > 9) return false;
  
  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1).toUpperCase();
  
  let sum = 0;
  let multiplier = 2;
  
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const remainder = sum % 11;
  const calculatedDV = remainder < 2 ? remainder.toString() : (11 - remainder === 10 ? 'K' : (11 - remainder).toString());
  
  return dv === calculatedDV;
};

export const formatRUT = (rut: string): string => {
  const cleanRut = rut.replace(/[^0-9kK]/g, '');
  if (cleanRut.length < 8) return rut;
  
  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1);
  
  // Formatear con puntos y guión
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formattedBody}-${dv}`;
};