import { Client, Vehicle, TowTruck, Service, DashboardStats, User } from '@/types';

export const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'María González',
    document: '12.345.678-9',
    document_type: 'rut',
    phone: '+56 9 1234 5678',
    email: 'maria.gonzalez@email.com',
    address: 'Av. Providencia 1234',
    city: 'Santiago',
    province: 'Metropolitana de Santiago',
    postal_code: '7500000',
    notes: 'Cliente premium con múltiples vehículos',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Carlos Rodriguez',
    document: '98.765.432-1',
    document_type: 'rut',
    phone: '+56 9 8765 4321',
    email: 'carlos.rodriguez@email.com',
    address: 'Av. Las Condes 2567',
    city: 'Santiago',
    province: 'Metropolitana de Santiago',
    postal_code: '7550000',
    created_at: '2024-01-20T14:30:00Z',
    updated_at: '2024-01-20T14:30:00Z'
  },
  {
    id: '3',
    name: 'Ana Martínez',
    document: '15.678.912-3',
    document_type: 'rut',
    phone: '+56 9 5555 1234',
    email: 'ana.martinez@gmail.com',
    address: 'Av. Libertador Bernardo O\'Higgins 3456',
    city: 'Valparaíso',
    province: 'Valparaíso',
    postal_code: '2340000',
    notes: 'Requiere facturación especial',
    created_at: '2024-01-22T09:15:00Z',
    updated_at: '2024-01-22T09:15:00Z'
  },
  {
    id: '4',
    name: 'Roberto Silva',
    document: '23.789.456-K',
    document_type: 'rut',
    phone: '+56 9 9876 5432',
    address: 'Av. San Martín 789',
    city: 'Concepción',
    province: 'Biobío',
    postal_code: '4030000',
    created_at: '2024-01-25T16:45:00Z',
    updated_at: '2024-01-25T16:45:00Z'
  },
  {
    id: '5',
    name: 'Empresa Logística del Sur SpA',
    document: '76.123.456-7',
    document_type: 'rut',
    phone: '+56 2 2444 7777',
    email: 'contacto@logisticasur.cl',
    address: 'Av. Industrial 1500',
    city: 'Temuco',
    province: 'La Araucanía',
    postal_code: '4780000',
    notes: 'Cliente corporativo - Flota de camiones',
    created_at: '2024-01-10T11:30:00Z',
    updated_at: '2024-01-10T11:30:00Z'
  }
];

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: '1',
    license_plate: 'ABCD12',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    color: 'Blanco',
    vehicle_type: 'car',
    client_id: '1',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    license_plate: 'WXYZ89',
    brand: 'Ford',
    model: 'F-150',
    year: 2019,
    color: 'Negro',
    vehicle_type: 'truck',
    client_id: '2',
    created_at: '2024-01-20T14:30:00Z',
    updated_at: '2024-01-20T14:30:00Z'
  },
  {
    id: '3',
    license_plate: 'DEFG45',
    brand: 'Honda',
    model: 'Civic',
    year: 2021,
    color: 'Azul',
    vehicle_type: 'car',
    client_id: '1',
    created_at: '2024-01-16T12:00:00Z',
    updated_at: '2024-01-16T12:00:00Z'
  },
  {
    id: '4',
    license_plate: 'GHIJ78',
    brand: 'Yamaha',
    model: 'YBR 125',
    year: 2022,
    color: 'Rojo',
    vehicle_type: 'motorcycle',
    client_id: '3',
    created_at: '2024-01-22T09:15:00Z',
    updated_at: '2024-01-22T09:15:00Z'
  },
  {
    id: '5',
    license_plate: 'JKLM01',
    brand: 'Volkswagen',
    model: 'Amarok',
    year: 2023,
    color: 'Gris',
    vehicle_type: 'van',
    client_id: '4',
    created_at: '2024-01-25T16:45:00Z',
    updated_at: '2024-01-25T16:45:00Z'
  },
  {
    id: '6',
    license_plate: 'MNOP34',
    brand: 'Mercedes-Benz',
    model: 'Sprinter',
    year: 2020,
    color: 'Blanco',
    vehicle_type: 'van',
    client_id: '5',
    created_at: '2024-01-10T11:30:00Z',
    updated_at: '2024-01-10T11:30:00Z'
  },
  {
    id: '7',
    license_plate: 'PQRS67',
    brand: 'Scania',
    model: 'R450',
    year: 2021,
    color: 'Azul',
    vehicle_type: 'truck',
    client_id: '5',
    created_at: '2024-01-11T14:20:00Z',
    updated_at: '2024-01-11T14:20:00Z'
  }
];

export const MOCK_TOW_TRUCKS: TowTruck[] = [
  {
    id: '1',
    name: 'Grúa 01',
    license_plate: 'GRU001',
    brand: 'Mercedes-Benz',
    model: 'Atego',
    year: 2021,
    capacity_tons: 3.5,
    truck_type: 'flatbed',
    status: 'available',
    current_operator_id: '2',
    notes: 'Equipada con GPS y sistema de comunicación',
    circulation_permit_expiry: '2024-12-31',
    soap_expiry: '2024-10-15',
    technical_review_expiry: '2024-11-30',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-25T08:00:00Z'
  },
  {
    id: '2',
    name: 'Grúa 02',
    license_plate: 'GRU002',
    brand: 'Iveco',
    model: 'Daily',
    year: 2020,
    capacity_tons: 2.5,
    truck_type: 'wheel_lift',
    status: 'in_service',
    current_operator_id: '3',
    notes: 'Ideal para vehículos livianos',
    circulation_permit_expiry: '2024-08-15',
    soap_expiry: '2024-09-20',
    technical_review_expiry: '2024-07-10',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-25T09:30:00Z'
  },
  {
    id: '3',
    name: 'Grúa 03',
    license_plate: 'GRU003',
    brand: 'Ford',
    model: 'F-4000',
    year: 2019,
    capacity_tons: 4.0,
    truck_type: 'integrated',
    status: 'maintenance',
    notes: 'En mantenimiento preventivo',
    circulation_permit_expiry: '2025-01-15',
    soap_expiry: '2024-06-05',
    technical_review_expiry: '2024-05-20',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-24T15:00:00Z'
  }
];

// Extended User type for operators with additional fields
export type ExtendedUser = User & {
  license_number?: string;
  license_expiry?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  occupational_exam_expiry?: string;
  psychosensometric_exam_expiry?: string;
  last_login?: string;
  services_completed?: number;
  status?: 'active' | 'inactive' | 'on_leave';
};

export const MOCK_OPERATORS: ExtendedUser[] = [
  {
    id: '1',
    email: 'admin@tmsgruas.com',
    name: 'Administrador Principal',
    role: 'admin',
    phone: '+54 11 1234-5678',
    license_number: '12345678',
    license_expiry: '2025-12-31',
    emergency_contact: 'María Admin',
    emergency_phone: '+54 11 8765-4321',
    occupational_exam_expiry: '2025-06-15',
    psychosensometric_exam_expiry: '2025-08-20',
    last_login: '2024-01-25T10:30:00Z',
    services_completed: 0,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-25T10:30:00Z'
  },
  {
    id: '2',
    email: 'juan@tmsgruas.com',
    name: 'Juan Operador',
    role: 'operator',
    phone: '+54 11 8765-4321',
    license_number: '87654321',
    license_expiry: '2024-06-30',
    emergency_contact: 'Ana Operador',
    emergency_phone: '+54 11 1111-1111',
    occupational_exam_expiry: '2024-05-10',
    psychosensometric_exam_expiry: '2024-07-15',
    last_login: '2024-01-25T08:15:00Z',
    services_completed: 45,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-25T08:15:00Z'
  },
  {
    id: '3',
    email: 'pedro@tmsgruas.com',
    name: 'Pedro Conductor',
    role: 'operator',
    phone: '+54 11 5555-5555',
    license_number: '11223344',
    license_expiry: '2025-03-15',
    emergency_contact: 'Carmen Conductor',
    emergency_phone: '+54 11 2222-2222',
    occupational_exam_expiry: '2025-02-20',
    psychosensometric_exam_expiry: '2024-12-05',
    last_login: '2024-01-24T16:45:00Z',
    services_completed: 32,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-24T16:45:00Z'
  },
  {
    id: '4',
    email: 'ana@tmsgruas.com',
    name: 'Ana Supervisora',
    role: 'viewer',
    phone: '+54 11 3333-3333',
    emergency_contact: 'Luis Supervisor',
    emergency_phone: '+54 11 4444-4444',
    last_login: '2024-01-25T09:00:00Z',
    services_completed: 0,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-25T09:00:00Z'
  },
  {
    id: '5',
    email: 'carlos@tmsgruas.com',
    name: 'Carlos Gerente',
    role: 'manager',
    phone: '+54 11 6666-6666',
    emergency_contact: 'Laura Gerente',
    emergency_phone: '+54 11 7777-7777',
    last_login: '2024-01-25T11:00:00Z',
    services_completed: 0,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-25T11:00:00Z'
  }
];

export const MOCK_SERVICES: Service[] = [
  {
    id: '1',
    service_number: 'SRV-2024-0001',
    folio: 'F-2024-0001', // Folio manual
    client_id: '1',
    vehicle_license_plate: 'ABCD12',
    vehicle_brand: 'Toyota',
    vehicle_model: 'Corolla',
    tow_truck_id: '1',
    operator_id: '2',
    service_type: 'tow',
    origin_address: 'Av. Providencia 500, Santiago',
    destination_address: 'Taller Mecánico Sur, Av. Libertador 8000',
    distance_km: 12.5,
    service_date: '2024-01-25',
    requested_time: '09:00:00',
    started_time: '09:15:00',
    completed_time: '10:30:00',
    status: 'completed',
    priority: 'medium',
    base_cost: 85000,
    additional_costs: [],
    total_cost: 85000,
    description: 'Remolque por falla mecánica',
    requires_inspection: true,
    is_billed: false,
    created_at: '2024-01-25T08:45:00Z',
    updated_at: '2024-01-25T10:30:00Z'
  },
  {
    id: '2',
    service_number: 'SRV-2024-0002',
    // Sin folio manual, se generará automáticamente
    client_id: '2',
    vehicle_license_plate: 'WXYZ89',
    vehicle_brand: 'Ford',
    vehicle_model: 'F-150',
    tow_truck_id: '2',
    operator_id: '3',
    service_type: 'assistance',
    origin_address: 'Av. Las Condes 3000, Santiago',
    service_date: '2024-01-25',
    requested_time: '14:00:00',
    started_time: '14:20:00',
    status: 'in_progress',
    priority: 'high',
    base_cost: 55000,
    additional_costs: [],
    total_cost: 55000,
    description: 'Asistencia por batería descargada',
    requires_inspection: false,
    is_billed: false,
    created_at: '2024-01-25T13:45:00Z',
    updated_at: '2024-01-25T14:20:00Z'
  },
  {
    id: '3',
    service_number: 'SRV-2024-0003',
    folio: 'CLI-2023-0045', // Folio proporcionado por el cliente
    client_id: '3',
    vehicle_license_plate: 'GHIJ78',
    vehicle_brand: 'Yamaha',
    vehicle_model: 'YBR 125',
    tow_truck_id: '1',
    operator_id: '2',
    service_type: 'tow',
    origin_address: 'Ruta 68 Km 45, Valparaíso',
    destination_address: 'Concesionario Yamaha, Av. Brasil 1234',
    distance_km: 8.2,
    service_date: '2024-01-24',
    requested_time: '16:30:00',
    started_time: '16:45:00',
    completed_time: '17:30:00',
    status: 'completed',
    priority: 'urgent',
    base_cost: 65000,
    additional_costs: [],
    total_cost: 65000,
    description: 'Accidente de motocicleta',
    requires_inspection: true,
    is_billed: true,
    created_at: '2024-01-24T16:15:00Z',
    updated_at: '2024-01-24T17:30:00Z'
  },
  {
    id: '4',
    service_number: 'SRV-2024-0004',
    folio: 'INSP-2024-001',
    client_id: '1',
    vehicle_license_plate: 'PHJT98',
    vehicle_brand: 'Toyota',
    vehicle_model: 'Hilux',
    tow_truck_id: '1',
    operator_id: '2',
    service_type: 'tow',
    origin_address: 'Copiapo 1234, Santiago',
    destination_address: 'Taller Mecánico Norte, Av. Independencia 5678',
    distance_km: 15.3,
    service_date: '2024-06-28',
    requested_time: '10:00:00',
    status: 'assigned',
    priority: 'medium',
    base_cost: 75000,
    additional_costs: [],
    total_cost: 75000,
    description: 'Remolque por problemas de transmisión',
    requires_inspection: true,
    is_billed: false,
    created_at: '2024-06-27T18:30:00Z',
    updated_at: '2024-06-27T18:30:00Z'
  }
];

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  today_services: 8,
  pending_services: 3,
  active_operators: 5,
  available_trucks: 3,
  today_revenue: 455000,
  monthly_revenue: 6875000,
  services_by_status: {
    pending: 3,
    assigned: 2,
    in_progress: 2,
    completed: 15,
    cancelled: 1
  },
  revenue_by_day: [
    { date: '2024-01-19', revenue: 385000 },
    { date: '2024-01-20', revenue: 420000 },
    { date: '2024-01-21', revenue: 350000 },
    { date: '2024-01-22', revenue: 485000 },
    { date: '2024-01-23', revenue: 520000 },
    { date: '2024-01-24', revenue: 395000 },
    { date: '2024-01-25', revenue: 455000 }
  ],
  top_operators: [
    { operator: { id: '2', name: 'Juan Operador', email: 'juan@tms.com', role: 'operator', created_at: '', updated_at: '' }, services_count: 12, revenue: 1250000 },
    { operator: { id: '3', name: 'Pedro Conductor', email: 'pedro@tms.com', role: 'operator', created_at: '', updated_at: '' }, services_count: 8, revenue: 895000 }
  ]
};