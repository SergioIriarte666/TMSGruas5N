export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'operator' | 'viewer' | 'client';
  license_number?: string;
  license_expiry?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  occupational_exam_expiry?: string;
  psychosensometric_exam_expiry?: string;
  avatar?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  document: string;
  document_type: 'rut' | 'passport' | 'foreign_id';
  phone: string;
  email?: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  license_plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  vehicle_type: 'car' | 'truck' | 'motorcycle' | 'van' | 'bus';
  client_id: string;
  client?: Client;
  created_at: string;
  updated_at: string;
}

export interface TowTruck {
  id: string;
  name: string;
  license_plate: string;
  brand: string;
  model: string;
  year: number;
  capacity_tons: number;
  truck_type: 'flatbed' | 'wheel_lift' | 'integrated' | 'heavy_duty';
  status: 'available' | 'in_service' | 'maintenance' | 'out_of_service';
  current_operator_id?: string;
  current_operator?: User;
  notes?: string;
  circulation_permit_expiry?: string;
  soap_expiry?: string;
  technical_review_expiry?: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  service_number: string;
  folio?: string; // Número de folio manual o automático
  client_id: string;
  client?: Client;
  // Campos para vehículo manual
  vehicle_license_plate?: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  tow_truck_id: string;
  tow_truck?: TowTruck;
  operator_id: string;
  operator?: User;
  service_type: 'tow' | 'taxi' | 'transport' | 'assistance';
  origin_address: string;
  origin_coordinates?: { lat: number; lng: number };
  destination_address?: string;
  destination_coordinates?: { lat: number; lng: number };
  distance_km?: number;
  service_date: string;
  requested_time: string;
  started_time?: string;
  completed_time?: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  base_cost: number;
  additional_costs: ServiceAdditionalCost[];
  total_cost: number;
  description: string;
  notes?: string;
  requires_inspection: boolean;
  inspection?: ServiceInspection;
  special_fields?: ServiceSpecialFields;
  is_billed: boolean;
  bill_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceAdditionalCost {
  id: string;
  service_id: string;
  concept: string;
  amount: number;
  created_at: string;
}

export interface ServiceSpecialFields {
  // For taxi services
  passenger_count?: number;
  has_luggage?: boolean;
  pickup_instructions?: string;
  
  // For transport services
  cargo_type?: string;
  cargo_weight_kg?: number;
  requires_special_handling?: boolean;
  loading_instructions?: string;
}

export interface ServiceInspection {
  id: string;
  service_id: string;
  vehicle_condition_before: VehicleCondition;
  vehicle_condition_after?: VehicleCondition;
  operator_signature_name: string;
  client_signature_name?: string;
  operator_signature_image?: string;
  client_signature_image?: string;
  photos_before: string[];
  photos_after: string[];
  inspection_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleCondition {
  exterior_damage: DamagePoint[];
  interior_condition: 'excellent' | 'good' | 'fair' | 'poor';
  fuel_level: number; // 0-100
  mileage?: number;
  tire_condition: 'excellent' | 'good' | 'worn' | 'needs_replacement';
  notes?: string;
}

export interface DamagePoint {
  id: string;
  x: number; // percentage from left
  y: number; // percentage from top
  type: 'scratch' | 'dent' | 'missing_part' | 'crack' | 'other';
  severity: 'minor' | 'moderate' | 'severe';
  description: string;
}

export interface Report {
  id: string;
  name: string;
  type: 'services' | 'financial' | 'operators' | 'vehicles';
  parameters: Record<string, any>;
  generated_by: string;
  generated_at: string;
  file_url?: string;
}

export interface DashboardStats {
  today_services: number;
  pending_services: number;
  active_operators: number;
  available_trucks: number;
  today_revenue: number;
  monthly_revenue: number;
  services_by_status: Record<Service['status'], number>;
  revenue_by_day: Array<{ date: string; revenue: number }>;
  top_operators: Array<{ operator: User; services_count: number; revenue: number }>;
}