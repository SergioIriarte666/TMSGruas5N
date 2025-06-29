Instructivo de Integración con Supabase para TMS Grúas
1. Introducción a Supabase
Supabase es una alternativa de código abierto a Firebase que proporciona una base de datos PostgreSQL, autenticación, almacenamiento y APIs instantáneas. En este instructivo, veremos cómo integrar Supabase con el sistema TMS Grúas.
2. Configuración Inicial
2.1 Crear un proyecto en Supabase
1. Regístrate o inicia sesión en Supabase
2. Crea un nuevo proyecto
3. Anota la URL del proyecto y la clave anónima (API Key)
2.2 Configuración en el proyecto
Crea un archivo .env en la raíz del proyecto con las siguientes variables:

VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima
3. Estructura de la Base de Datos
A continuación se presenta el código SQL para crear todas las tablas necesarias para el sistema TMS Grúas.
3.1 Tabla de Perfiles

-- Crear tabla de perfiles (extensión de la tabla auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'operator', 'viewer', 'client')),
  phone TEXT,
  avatar_url TEXT,
  license_number TEXT,
  license_expiry DATE,
  occupational_exam_expiry DATE,
  psychosensometric_exam_expiry DATE,
  emergency_contact TEXT,
  emergency_phone TEXT,
  last_login TIMESTAMPTZ,
  services_completed INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para actualizar el campo updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
3.2 Tabla de Clientes

-- Crear tabla de clientes
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  document TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('rut', 'passport', 'foreign_id')),
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para actualizar el campo updated_at
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
3.3 Tabla de Grúas

-- Crear tabla de grúas
CREATE TABLE tow_trucks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  license_plate TEXT NOT NULL UNIQUE,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  capacity_tons NUMERIC(5,2) NOT NULL,
  truck_type TEXT NOT NULL CHECK (truck_type IN ('flatbed', 'wheel_lift', 'integrated', 'heavy_duty')),
  status TEXT NOT NULL CHECK (status IN ('available', 'in_service', 'maintenance', 'out_of_service')),
  current_operator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  circulation_permit_expiry DATE,
  soap_expiry DATE,
  technical_review_expiry DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para actualizar el campo updated_at
CREATE TRIGGER update_tow_trucks_updated_at
BEFORE UPDATE ON tow_trucks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
3.4 Tabla de Servicios

-- Crear tabla de servicios
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_number TEXT NOT NULL UNIQUE,
  folio TEXT,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  vehicle_license_plate TEXT,
  vehicle_brand TEXT,
  vehicle_model TEXT,
  tow_truck_id UUID REFERENCES tow_trucks(id) ON DELETE SET NULL,
  operator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('tow', 'taxi', 'transport', 'assistance')),
  origin_address TEXT NOT NULL,
  origin_coordinates JSONB,
  destination_address TEXT,
  destination_coordinates JSONB,
  distance_km NUMERIC(8,2),
  service_date DATE NOT NULL,
  requested_time TEXT NOT NULL,
  started_time TEXT,
  completed_time TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  base_cost INTEGER NOT NULL,
  additional_costs JSONB,
  total_cost INTEGER NOT NULL,
  description TEXT NOT NULL,
  notes TEXT,
  requires_inspection BOOLEAN DEFAULT FALSE,
  special_fields JSONB,
  is_billed BOOLEAN DEFAULT FALSE,
  bill_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para actualizar el campo updated_at
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON services
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
3.5 Tabla de Inspecciones

-- Crear tabla de inspecciones
CREATE TABLE inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  vehicle_condition_before JSONB NOT NULL,
  vehicle_condition_after JSONB,
  operator_signature_name TEXT NOT NULL,
  client_signature_name TEXT,
  operator_signature_image TEXT,
  client_signature_image TEXT,
  photos_before TEXT[],
  photos_after TEXT[],
  inspection_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para actualizar el campo updated_at
CREATE TRIGGER update_inspections_updated_at
BEFORE UPDATE ON inspections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
3.6 Tabla de Facturas

-- Crear tabla de facturas
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_type TEXT NOT NULL CHECK (invoice_type IN ('factura', 'boleta', 'nota_credito', 'nota_debito')),
  folio INTEGER NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  service_ids UUID[],
  issue_date DATE NOT NULL,
  due_date DATE,
  subtotal INTEGER NOT NULL,
  iva_amount INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'issued', 'sent', 'paid', 'overdue', 'cancelled')),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue')),
  client_rut TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_address TEXT NOT NULL,
  client_city TEXT NOT NULL,
  client_region TEXT NOT NULL,
  sii_status TEXT,
  sii_track_id TEXT,
  sii_response TEXT,
  electronic_signature TEXT,
  pdf_url TEXT,
  xml_url TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para actualizar el campo updated_at
CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
3.7 Tabla de Ítems de Factura

-- Crear tabla de ítems de factura
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  discount_percent NUMERIC(5,2),
  discount_amount INTEGER,
  subtotal INTEGER NOT NULL,
  iva_rate NUMERIC(5,2) NOT NULL,
  iva_amount INTEGER NOT NULL,
  total INTEGER NOT NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
3.8 Tabla de Pagos

-- Crear tabla de pagos
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'transfer', 'check', 'card', 'other')),
  reference TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
3.9 Tabla de Eventos de Calendario

-- Crear tabla de eventos de calendario
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  start TIMESTAMPTZ NOT NULL,
  end TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT FALSE,
  description TEXT,
  location TEXT,
  type TEXT NOT NULL CHECK (type IN ('service', 'maintenance', 'meeting', 'other')),
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  assigned_to UUID[],
  related_service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  related_client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para actualizar el campo updated_at
CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON calendar_events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
3.10 Función de Actualización de Timestamp

-- Función para actualizar automáticamente el campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
4. Configuración de Row Level Security (RLS)
4.1 Funciones de Ayuda para RLS

-- Función para obtener el ID del usuario autenticado
CREATE OR REPLACE FUNCTION get_auth_user_id()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT auth.uid();
$$;

-- Función para verificar si el usuario es administrador
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Función para verificar si el usuario es gerente
CREATE OR REPLACE FUNCTION is_manager()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'manager'
  );
$$;

-- Función para verificar si el usuario es operador
CREATE OR REPLACE FUNCTION is_operator()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'operator'
  );
$$;

-- Función para verificar si el usuario es supervisor
CREATE OR REPLACE FUNCTION is_viewer()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'viewer'
  );
$$;

-- Función para verificar si el usuario es cliente
CREATE OR REPLACE FUNCTION is_client()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'client'
  );
$$;
4.2 Políticas de RLS para Perfiles

-- Habilitar RLS para la tabla profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política para que los administradores puedan hacer todo
CREATE POLICY admin_all_profiles ON profiles
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Política para que los gerentes puedan leer todos los perfiles
CREATE POLICY manager_read_profiles ON profiles
  FOR SELECT
  TO authenticated
  USING (is_manager());

-- Política para que los gerentes puedan crear operadores y supervisores
CREATE POLICY manager_create_operators ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (is_manager() AND NEW.role IN ('operator', 'viewer'));

-- Política para que los gerentes puedan actualizar operadores y supervisores
CREATE POLICY manager_update_operators ON profiles
  FOR UPDATE
  TO authenticated
  USING (is_manager() AND role IN ('operator', 'viewer'))
  WITH CHECK (is_manager() AND NEW.role IN ('operator', 'viewer'));

-- Política para que los usuarios puedan leer su propio perfil
CREATE POLICY read_own_profile ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Política para que los usuarios puedan actualizar su propio perfil
CREATE POLICY update_own_profile ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = OLD.role);
4.3 Políticas de RLS para Clientes

-- Habilitar RLS para la tabla clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Política para que los administradores puedan hacer todo
CREATE POLICY admin_all_clients ON clients
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Política para que los gerentes puedan hacer todo
CREATE POLICY manager_all_clients ON clients
  FOR ALL
  TO authenticated
  USING (is_manager());

-- Política para que los operadores y supervisores puedan leer todos los clientes
CREATE POLICY staff_read_clients ON clients
  FOR SELECT
  TO authenticated
  USING (is_operator() OR is_viewer());

-- Política para que los clientes puedan leer su propio perfil
CREATE POLICY client_read_own_profile ON clients
  FOR SELECT
  TO authenticated
  USING (is_client() AND id = (
    SELECT client_id FROM client_profiles WHERE user_id = auth.uid()
  ));
4.4 Políticas de RLS para Grúas

-- Habilitar RLS para la tabla tow_trucks
ALTER TABLE tow_trucks ENABLE ROW LEVEL SECURITY;

-- Política para que los administradores puedan hacer todo
CREATE POLICY admin_all_tow_trucks ON tow_trucks
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Política para que los gerentes puedan hacer todo
CREATE POLICY manager_all_tow_trucks ON tow_trucks
  FOR ALL
  TO authenticated
  USING (is_manager());

-- Política para que los operadores y supervisores puedan leer todas las grúas
CREATE POLICY staff_read_tow_trucks ON tow_trucks
  FOR SELECT
  TO authenticated
  USING (is_operator() OR is_viewer());

-- Política para que los operadores puedan actualizar grúas asignadas a ellos
CREATE POLICY operator_update_assigned_tow_trucks ON tow_trucks
  FOR UPDATE
  TO authenticated
  USING (is_operator() AND current_operator_id = auth.uid())
  WITH CHECK (is_operator() AND current_operator_id = auth.uid() AND status IN ('available', 'in_service'));
4.5 Políticas de RLS para Servicios

-- Habilitar RLS para la tabla services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Política para que los administradores puedan hacer todo
CREATE POLICY admin_all_services ON services
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Política para que los gerentes puedan hacer todo
CREATE POLICY manager_all_services ON services
  FOR ALL
  TO authenticated
  USING (is_manager());

-- Política para que los operadores puedan leer todos los servicios
CREATE POLICY operator_read_services ON services
  FOR SELECT
  TO authenticated
  USING (is_operator());

-- Política para que los operadores puedan actualizar servicios asignados a ellos
CREATE POLICY operator_update_assigned_services ON services
  FOR UPDATE
  TO authenticated
  USING (is_operator() AND operator_id = auth.uid())
  WITH CHECK (is_operator() AND operator_id = auth.uid());

-- Política para que los supervisores puedan leer todos los servicios
CREATE POLICY viewer_read_services ON services
  FOR SELECT
  TO authenticated
  USING (is_viewer());

-- Política para que los clientes puedan leer sus propios servicios
CREATE POLICY client_read_own_services ON services
  FOR SELECT
  TO authenticated
  USING (is_client() AND client_id = (
    SELECT client_id FROM client_profiles WHERE user_id = auth.uid()
  ));

-- Política para que los clientes puedan crear servicios
CREATE POLICY client_create_services ON services
  FOR INSERT
  TO authenticated
  WITH CHECK (is_client() AND client_id = (
    SELECT client_id FROM client_profiles WHERE user_id = auth.uid()
  ));
4.6 Políticas de RLS para Inspecciones

-- Habilitar RLS para la tabla inspections
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

-- Política para que los administradores puedan hacer todo
CREATE POLICY admin_all_inspections ON inspections
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Política para que los gerentes puedan hacer todo
CREATE POLICY manager_all_inspections ON inspections
  FOR ALL
  TO authenticated
  USING (is_manager());

-- Política para que los operadores puedan leer todas las inspecciones
CREATE POLICY operator_read_inspections ON inspections
  FOR SELECT
  TO authenticated
  USING (is_operator());

-- Política para que los operadores puedan crear inspecciones
CREATE POLICY operator_create_inspections ON inspections
  FOR INSERT
  TO authenticated
  WITH CHECK (is_operator());

-- Política para que los operadores puedan actualizar inspecciones de servicios asignados a ellos
CREATE POLICY operator_update_own_inspections ON inspections
  FOR UPDATE
  TO authenticated
  USING (is_operator() AND service_id IN (
    SELECT id FROM services WHERE operator_id = auth.uid()
  ))
  WITH CHECK (is_operator() AND service_id IN (
    SELECT id FROM services WHERE operator_id = auth.uid()
  ));

-- Política para que los supervisores puedan leer todas las inspecciones
CREATE POLICY viewer_read_inspections ON inspections
  FOR SELECT
  TO authenticated
  USING (is_viewer());

-- Política para que los clientes puedan leer inspecciones de sus propios servicios
CREATE POLICY client_read_own_inspections ON inspections
  FOR SELECT
  TO authenticated
  USING (is_client() AND service_id IN (
    SELECT id FROM services WHERE client_id = (
      SELECT client_id FROM client_profiles WHERE user_id = auth.uid()
    )
  ));
4.7 Políticas de RLS para Facturas

-- Habilitar RLS para la tabla invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Política para que los administradores puedan hacer todo
CREATE POLICY admin_all_invoices ON invoices
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Política para que los gerentes puedan hacer todo
CREATE POLICY manager_all_invoices ON invoices
  FOR ALL
  TO authenticated
  USING (is_manager());

-- Política para que los supervisores puedan leer todas las facturas
CREATE POLICY viewer_read_invoices ON invoices
  FOR SELECT
  TO authenticated
  USING (is_viewer());

-- Política para que los clientes puedan leer sus propias facturas
CREATE POLICY client_read_own_invoices ON invoices
  FOR SELECT
  TO authenticated
  USING (is_client() AND client_id = (
    SELECT client_id FROM client_profiles WHERE user_id = auth.uid()
  ));
4.8 Políticas de RLS para Ítems de Factura

-- Habilitar RLS para la tabla invoice_items
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Política para que los administradores puedan hacer todo
CREATE POLICY admin_all_invoice_items ON invoice_items
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Política para que los gerentes puedan hacer todo
CREATE POLICY manager_all_invoice_items ON invoice_items
  FOR ALL
  TO authenticated
  USING (is_manager());

-- Política para que los supervisores puedan leer todos los ítems
CREATE POLICY viewer_read_invoice_items ON invoice_items
  FOR SELECT
  TO authenticated
  USING (is_viewer());

-- Política para que los clientes puedan leer ítems de sus propias facturas
CREATE POLICY client_read_own_invoice_items ON invoice_items
  FOR SELECT
  TO authenticated
  USING (is_client() AND invoice_id IN (
    SELECT id FROM invoices WHERE client_id = (
      SELECT client_id FROM client_profiles WHERE user_id = auth.uid()
    )
  ));
4.9 Políticas de RLS para Pagos

-- Habilitar RLS para la tabla payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Política para que los administradores puedan hacer todo
CREATE POLICY admin_all_payments ON payments
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Política para que los gerentes puedan hacer todo
CREATE POLICY manager_all_payments ON payments
  FOR ALL
  TO authenticated
  USING (is_manager());

-- Política para que los supervisores puedan leer todos los pagos
CREATE POLICY viewer_read_payments ON payments
  FOR SELECT
  TO authenticated
  USING (is_viewer());

-- Política para que los clientes puedan leer pagos de sus propias facturas
CREATE POLICY client_read_own_payments ON payments
  FOR SELECT
  TO authenticated
  USING (is_client() AND invoice_id IN (
    SELECT id FROM invoices WHERE client_id = (
      SELECT client_id FROM client_profiles WHERE user_id = auth.uid()
    )
  ));
4.10 Políticas de RLS para Eventos de Calendario

-- Habilitar RLS para la tabla calendar_events
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Política para que los administradores puedan hacer todo
CREATE POLICY admin_all_calendar_events ON calendar_events
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Política para que los gerentes puedan hacer todo
CREATE POLICY manager_all_calendar_events ON calendar_events
  FOR ALL
  TO authenticated
  USING (is_manager());

-- Política para que los operadores puedan leer todos los eventos
CREATE POLICY operator_read_calendar_events ON calendar_events
  FOR SELECT
  TO authenticated
  USING (is_operator());

-- Política para que los operadores puedan actualizar eventos asignados a ellos
CREATE POLICY operator_update_assigned_events ON calendar_events
  FOR UPDATE
  TO authenticated
  USING (is_operator() AND auth.uid()::TEXT = ANY(assigned_to))
  WITH CHECK (is_operator() AND auth.uid()::TEXT = ANY(assigned_to));

-- Política para que los supervisores puedan leer todos los eventos
CREATE POLICY viewer_read_calendar_events ON calendar_events
  FOR SELECT
  TO authenticated
  USING (is_viewer());

-- Política para que los clientes puedan leer eventos relacionados con ellos
CREATE POLICY client_read_related_events ON calendar_events
  FOR SELECT
  TO authenticated
  USING (is_client() AND (
    related_client_id = (SELECT client_id FROM client_profiles WHERE user_id = auth.uid()) OR
    related_service_id IN (
      SELECT id FROM services WHERE client_id = (
        SELECT client_id FROM client_profiles WHERE user_id = auth.uid()
      )
    )
  ));
5. Integración con el Frontend
5.1 Cliente de Supabase
Crea un archivo src/lib/supabase.ts para configurar el cliente de Supabase:

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be defined in environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Función para obtener el usuario actual
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Función para obtener el perfil del usuario actual
export const getCurrentProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return data;
};

// Función para verificar si el usuario tiene un rol específico
export const hasRole = async (requiredRole: string) => {
  const profile = await getCurrentProfile();
  
  if (!profile) return false;
  
  const roleHierarchy = { 
    admin: 4, 
    manager: 3, 
    operator: 2, 
    viewer: 1, 
    client: 1 
  };
  
  return roleHierarchy[profile.role as keyof typeof roleHierarchy] >= 
         roleHierarchy[requiredRole as keyof typeof roleHierarchy];
};

// Función para verificar si el usuario puede acceder a un recurso
export const canAccess = async (resource: string, action: string) => {
  const profile = await getCurrentProfile();
  
  if (!profile) return false;
  
  // Admin tiene acceso a todo
  if (profile.role === 'admin') return true;
  
  // Manager tiene acceso a casi todo
  if (profile.role === 'manager') {
    if (resource === 'services' && ['read', 'create', 'update'].includes(action)) return true;
    if (resource === 'inspections' && ['read', 'create', 'update'].includes(action)) return true;
    if (resource === 'clients' && ['read', 'create', 'update'].includes(action)) return true;
    if (resource === 'operators' && ['read', 'create'].includes(action)) return true;
    if (resource === 'tow-trucks' && ['read', 'create', 'update'].includes(action)) return true;
    if (resource === 'reports' && action === 'read') return true;
    if (resource === 'billing' && ['read', 'create'].includes(action)) return true;
    return false;
  }
  
  // Operator tiene acceso limitado
  if (profile.role === 'operator') {
    if (resource === 'services' && ['read', 'create', 'update'].includes(action)) return true;
    if (resource === 'inspections' && ['read', 'create', 'update'].includes(action)) return true;
    if (resource === 'clients' && action === 'read') return true;
    if (resource === 'tow-trucks' && action === 'read') return true;
    return false;
  }
  
  // Viewer solo puede ver
  if (profile.role === 'viewer') {
    return action === 'read';
  }
  
  // Client tiene acceso muy limitado
  if (profile.role === 'client') {
    if (resource === 'portal-cliente') return true;
    if (resource === 'services' && ['read', 'create'].includes(action)) return true;
    if (resource === 'invoices' && action === 'read') return true;
    return false;
  }
  
  return false;
};
5.2 Hook de Autenticación
Crea un hook personalizado para manejar la autenticación en src/hooks/useAuth.ts:

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, hasRole, canAccess } from '@/lib/supabase';
import { toast } from 'sonner';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer' | 'client';
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inicializar y escuchar cambios de autenticación
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Obtener el usuario actual
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError('Error al inicializar la autenticación');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Inicializar
    initialize();

    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    // Limpiar suscripción
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Función para obtener el perfil del usuario
  const fetchUserProfile = async (authUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Actualizar el último login
        await supabase
          .from('profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('id', authUser.id);
        
        setUser(data as AuthUser);
      } else {
        // Si no existe el perfil, podríamos crearlo aquí
        setUser(null);
        setError('Perfil de usuario no encontrado');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setUser(null);
      setError('Error al obtener el perfil de usuario');
    }
  };

  // Función para iniciar sesión
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        await fetchUserProfile(data.user);
        return user;
      }
    } catch (err: any) {
      console.error('Error logging in:', err);
      setError(err.message || 'Error al iniciar sesión');
      toast.error(err.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setUser(null);
    } catch (err: any) {
      console.error('Error logging out:', err);
      setError(err.message || 'Error al cerrar sesión');
      toast.error(err.message || 'Error al cerrar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    hasRole: (role: string) => hasRole(role),
    canAccess: (resource: string, action: string) => canAccess(resource, action)
  };
}
5.3 Servicios para Interactuar con la Base de Datos
5.3.1 Servicio de Clientes

import { supabase } from '@/lib/supabase';
import { Client } from '@/types';

// Obtener todos los clientes
export const getClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
  
  return data as Client[];
};

// Obtener un cliente por ID
export const getClientById = async (id: string): Promise<Client | null> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching client:', error);
    throw error;
  }
  
  return data as Client;
};

// Crear un nuevo cliente
export const createClient = async (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> => {
  const { data, error } = await supabase
    .from('clients')
    .insert([client])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating client:', error);
    throw error;
  }
  
  return data as Client;
};

// Actualizar un cliente existente
export const updateClient = async (id: string, client: Partial<Client>): Promise<Client> => {
  const { data, error } = await supabase
    .from('clients')
    .update(client)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating client:', error);
    throw error;
  }
  
  return data as Client;
};

// Eliminar un cliente
export const deleteClient = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
};

// Buscar clientes por término
export const searchClients = async (term: string): Promise<Client[]> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .or(`name.ilike.%${term}%,document.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`)
    .order('name');
  
  if (error) {
    console.error('Error searching clients:', error);
    throw error;
  }
  
  return data as Client[];
};
5.3.2 Servicio de Servicios

import { supabase } from '@/lib/supabase';
import { Service } from '@/types';

// Obtener todos los servicios
export const getServices = async (): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
  
  return data as Service[];
};

// Obtener un servicio por ID
export const getServiceById = async (id: string): Promise<Service | null> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching service:', error);
    throw error;
  }
  
  return data as Service;
};

// Crear un nuevo servicio
export const createService = async (service: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service> => {
  // Generar número de servicio si no se proporciona
  if (!service.service_number) {
    const { count } = await supabase
      .from('services')
      .select('*', { count: 'exact', head: true });
    
    const nextNumber = (count || 0) + 1;
    service.service_number = `SRV-${new Date().getFullYear()}-${String(nextNumber).padStart(4, '0')}`;
  }
  
  const { data, error } = await supabase
    .from('services')
    .insert([service])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating service:', error);
    throw error;
  }
  
  return data as Service;
};

// Actualizar un servicio existente
export const updateService = async (id: string, service: Partial<Service>): Promise<Service> => {
  const { data, error } = await supabase
    .from('services')
    .update(service)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating service:', error);
    throw error;
  }
  
  return data as Service;
};

// Eliminar un servicio
export const deleteService = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
};

// Buscar servicios por término
export const searchServices = async (term: string): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .or(`service_number.ilike.%${term}%,description.ilike.%${term}%,folio.ilike.%${term}%`)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error searching services:', error);
    throw error;
  }
  
  return data as Service[];
};

// Obtener servicios por cliente
export const getServicesByClient = async (clientId: string): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching client services:', error);
    throw error;
  }
  
  return data as Service[];
};

// Obtener servicios por operador
export const getServicesByOperator = async (operatorId: string): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('operator_id', operatorId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching operator services:', error);
    throw error;
  }
  
  return data as Service[];
};

// Obtener servicios por estado
export const getServicesByStatus = async (status: Service['status']): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching services by status:', error);
    throw error;
  }
  
  return data as Service[];
};

// Actualizar el estado de un servicio
export const updateServiceStatus = async (id: string, status: Service['status']): Promise<Service> => {
  const updates: Partial<Service> = { status };
  
  // Si el estado es 'in_progress', agregar la hora de inicio
  if (status === 'in_progress') {
    updates.started_time = new Date().toTimeString().slice(0, 5);
  }
  
  // Si el estado es 'completed', agregar la hora de finalización
  if (status === 'completed') {
    updates.completed_time = new Date().toTimeString().slice(0, 5);
  }
  
  const { data, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating service status:', error);
    throw error;
  }
  
  return data as Service;
};
5.3.3 Servicio de Inspecciones

import { supabase } from '@/lib/supabase';
import { ServiceInspection } from '@/types';

// Obtener todas las inspecciones
export const getInspections = async (): Promise<ServiceInspection[]> => {
  const { data, error } = await supabase
    .from('inspections')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching inspections:', error);
    throw error;
  }
  
  return data as ServiceInspection[];
};

// Obtener una inspección por ID
export const getInspectionById = async (id: string): Promise<ServiceInspection | null> => {
  const { data, error } = await supabase
    .from('inspections')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching inspection:', error);
    throw error;
  }
  
  return data as ServiceInspection;
};

// Obtener inspecciones por servicio
export const getInspectionsByService = async (serviceId: string): Promise<ServiceInspection[]> => {
  const { data, error } = await supabase
    .from('inspections')
    .select('*')
    .eq('service_id', serviceId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching inspections by service:', error);
    throw error;
  }
  
  return data as ServiceInspection[];
};

// Crear una nueva inspección
export const createInspection = async (inspection: Omit<ServiceInspection, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceInspection> => {
  // Subir fotos a Supabase Storage si es necesario
  let photosBefore: string[] = [];
  let photosAfter: string[] = [];
  
  if (inspection.photos_before && inspection.photos_before.length > 0) {
    // Aquí iría la lógica para subir las fotos a Supabase Storage
    // Por ahora, simplemente pasamos los nombres de archivo
    photosBefore = inspection.photos_before;
  }
  
  if (inspection.photos_after && inspection.photos_after.length > 0) {
    // Aquí iría la lógica para subir las fotos a Supabase Storage
    photosAfter = inspection.photos_after;
  }
  
  const { data, error } = await supabase
    .from('inspections')
    .insert([{
      ...inspection,
      photos_before: photosBefore,
      photos_after: photosAfter
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating inspection:', error);
    throw error;
  }
  
  return data as ServiceInspection;
};

// Actualizar una inspección existente
export const updateInspection = async (id: string, inspection: Partial<ServiceInspection>): Promise<ServiceInspection> => {
  // Subir fotos a Supabase Storage si es necesario
  if (inspection.photos_before && typeof inspection.photos_before[0] !== 'string') {
    // Aquí iría la lógica para subir las fotos a Supabase Storage
    // Por ahora, simplemente pasamos los nombres de archivo
  }
  
  if (inspection.photos_after && typeof inspection.photos_after[0] !== 'string') {
    // Aquí iría la lógica para subir las fotos a Supabase Storage
  }
  
  const { data, error } = await supabase
    .from('inspections')
    .update(inspection)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating inspection:', error);
    throw error;
  }
  
  return data as ServiceInspection;
};

// Eliminar una inspección
export const deleteInspection = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('inspections')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting inspection:', error);
    throw error;
  }
};

// Completar una inspección (agregar condición después del servicio)
export const completeInspection = async (
  id: string, 
  vehicleConditionAfter: ServiceInspection['vehicle_condition_after'],
  clientSignatureName?: string,
  clientSignatureImage?: string,
  photosAfter?: string[]
): Promise<ServiceInspection> => {
  const { data, error } = await supabase
    .from('inspections')
    .update({
      vehicle_condition_after: vehicleConditionAfter,
      client_signature_name: clientSignatureName,
      client_signature_image: clientSignatureImage,
      photos_after: photosAfter
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error completing inspection:', error);
    throw error;
  }
  
  return data as ServiceInspection;
};
6. Subida de Archivos a Supabase Storage
6.1 Configuración de Buckets de Storage
Primero, debes crear los buckets necesarios en Supabase Storage:
1. Inicia sesión en tu proyecto de Supabase
2. Ve a la sección "Storage"
3. Crea los siguientes buckets:
    * inspection-photos: Para fotos de inspecciones
    * client-documents: Para documentos de clientes
    * operator-documents: Para documentos de operadores
    * invoice-attachments: Para adjuntos de facturas
6.2 Función para Subir Fotos de Inspección

import { supabase } from '@/lib/supabase';

// Subir una foto de inspección
export const uploadInspectionPhoto = async (
  serviceId: string,
  file: File,
  type: 'before' | 'after',
  index: number
): Promise<string> => {
  // Generar un nombre de archivo único
  const fileExt = file.name.split('.').pop();
  const fileName = `${serviceId}/${type}_${index}_${Date.now()}.${fileExt}`;
  
  // Subir el archivo
  const { data, error } = await supabase.storage
    .from('inspection-photos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) {
    console.error('Error uploading inspection photo:', error);
    throw error;
  }
  
  // Obtener la URL pública del archivo
  const { data: { publicUrl } } = supabase.storage
    .from('inspection-photos')
    .getPublicUrl(data.path);
  
  return publicUrl;
};

// Subir múltiples fotos de inspección
export const uploadInspectionPhotos = async (
  serviceId: string,
  files: File[],
  type: 'before' | 'after'
): Promise<string[]> => {
  const uploadPromises = files.map((file, index) => 
    uploadInspectionPhoto(serviceId, file, type, index)
  );
  
  return Promise.all(uploadPromises);
};

// Eliminar una foto de inspección
export const deleteInspectionPhoto = async (filePath: string): Promise<void> => {
  const { error } = await supabase.storage
    .from('inspection-photos')
    .remove([filePath]);
  
  if (error) {
    console.error('Error deleting inspection photo:', error);
    throw error;
  }
};
6.3 Función para Subir Documentos de Operadores

import { supabase } from '@/lib/supabase';

// Subir un documento de operador
export const uploadOperatorDocument = async (
  operatorId: string,
  file: File,
  documentType: 'license' | 'occupational_exam' | 'psychosensometric_exam' | 'other'
): Promise<string> => {
  // Generar un nombre de archivo único
  const fileExt = file.name.split('.').pop();
  const fileName = `${operatorId}/${documentType}_${Date.now()}.${fileExt}`;
  
  // Subir el archivo
  const { data, error } = await supabase.storage
    .from('operator-documents')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) {
    console.error('Error uploading operator document:', error);
    throw error;
  }
  
  // Obtener la URL pública del archivo
  const { data: { publicUrl } } = supabase.storage
    .from('operator-documents')
    .getPublicUrl(data.path);
  
  return publicUrl;
};

// Eliminar un documento de operador
export const deleteOperatorDocument = async (filePath: string): Promise<void> => {
  const { error } = await supabase.storage
    .from('operator-documents')
    .remove([filePath]);
  
  if (error) {
    console.error('Error deleting operator document:', error);
    throw error;
  }
};
7. Funciones RPC Personalizadas
7.1 Función para Crear Facturas con Ítems

-- Función para crear una factura con sus ítems en una transacción
CREATE OR REPLACE FUNCTION create_invoice(
  invoice_data JSONB,
  line_items_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_invoice_id UUID;
  result JSONB;
BEGIN
  -- Iniciar transacción
  BEGIN
    -- Insertar la factura
    INSERT INTO invoices (
      invoice_number,
      invoice_type,
      folio,
      client_id,
      service_ids,
      issue_date,
      due_date,
      subtotal,
      iva_amount,
      total_amount,
      status,
      payment_status,
      client_rut,
      client_name,
      client_address,
      client_city,
      client_region,
      notes,
      created_by
    )
    VALUES (
      invoice_data->>'invoice_number',
      invoice_data->>'invoice_type',
      (invoice_data->>'folio')::INTEGER,
      invoice_data->>'client_id',
      (invoice_data->'service_ids')::UUID[],
      (invoice_data->>'issue_date')::DATE,
      (invoice_data->>'due_date')::DATE,
      (invoice_data->>'subtotal')::INTEGER,
      (invoice_data->>'iva_amount')::INTEGER,
      (invoice_data->>'total_amount')::INTEGER,
      invoice_data->>'status',
      invoice_data->>'payment_status',
      invoice_data->>'client_rut',
      invoice_data->>'client_name',
      invoice_data->>'client_address',
      invoice_data->>'client_city',
      invoice_data->>'client_region',
      invoice_data->>'notes',
      auth.uid()
    )
    RETURNING id INTO new_invoice_id;
    
    -- Insertar los ítems de la factura
    FOR i IN 0..jsonb_array_length(line_items_data) - 1 LOOP
      INSERT INTO invoice_items (
        invoice_id,
        description,
        quantity,
        unit_price,
        discount_percent,
        discount_amount,
        subtotal,
        iva_rate,
        iva_amount,
        total,
        service_id
      )
      VALUES (
        new_invoice_id,
        line_items_data->i->>'description',
        (line_items_data->i->>'quantity')::INTEGER,
        (line_items_data->i->>'unit_price')::INTEGER,
        (line_items_data->i->>'discount_percent')::NUMERIC,
        (line_items_data->i->>'discount_amount')::INTEGER,
        (line_items_data->i->>'subtotal')::INTEGER,
        (line_items_data->i->>'iva_rate')::NUMERIC,
        (line_items_data->i->>'iva_amount')::INTEGER,
        (line_items_data->i->>'total')::INTEGER,
        (line_items_data->i->>'service_id')::UUID
      );
    END LOOP;
    
    -- Marcar los servicios como facturados
    IF jsonb_array_length(invoice_data->'service_ids') > 0 THEN
      UPDATE services
      SET is_billed = TRUE, bill_date = NOW()
      WHERE id = ANY((invoice_data->'service_ids')::UUID[]);
    END IF;
    
    -- Preparar resultado
    result = jsonb_build_object(
      'id', new_invoice_id,
      'success', TRUE
    );
    
    RETURN result;
  EXCEPTION
    WHEN OTHERS THEN
      -- En caso de error, revertir la transacción
      RAISE;
  END;
END;
$$;
7.2 Función para Actualizar Facturas con Ítems

-- Función para actualizar una factura con sus ítems en una transacción
CREATE OR REPLACE FUNCTION update_invoice(
  invoice_id UUID,
  invoice_data JSONB,
  line_items_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Iniciar transacción
  BEGIN
    -- Actualizar la factura
    UPDATE invoices
    SET
      invoice_number = COALESCE(invoice_data->>'invoice_number', invoice_number),
      invoice_type = COALESCE(invoice_data->>'invoice_type', invoice_type),
      folio = COALESCE((invoice_data->>'folio')::INTEGER, folio),
      client_id = COALESCE(invoice_data->>'client_id', client_id),
      service_ids = COALESCE((invoice_data->'service_ids')::UUID[], service_ids),
      issue_date = COALESCE((invoice_data->>'issue_date')::DATE, issue_date),
      due_date = COALESCE((invoice_data->>'due_date')::DATE, due_date),
      subtotal = COALESCE((invoice_data->>'subtotal')::INTEGER, subtotal),
      iva_amount = COALESCE((invoice_data->>'iva_amount')::INTEGER, iva_amount),
      total_amount = COALESCE((invoice_data->>'total_amount')::INTEGER, total_amount),
      status = COALESCE(invoice_data->>'status', status),
      payment_status = COALESCE(invoice_data->>'payment_status', payment_status),
      client_rut = COALESCE(invoice_data->>'client_rut', client_rut),
      client_name = COALESCE(invoice_data->>'client_name', client_name),
      client_address = COALESCE(invoice_data->>'client_address', client_address),
      client_city = COALESCE(invoice_data->>'client_city', client_city),
      client_region = COALESCE(invoice_data->>'client_region', client_region),
      notes = COALESCE(invoice_data->>'notes', notes),
      updated_at = NOW()
    WHERE id = invoice_id;
    
    -- Si hay ítems nuevos, eliminar los existentes y agregar los nuevos
    IF jsonb_array_length(line_items_data) > 0 THEN
      -- Eliminar ítems existentes
      DELETE FROM invoice_items WHERE invoice_id = invoice_id;
      
      -- Insertar los nuevos ítems
      FOR i IN 0..jsonb_array_length(line_items_data) - 1 LOOP
        INSERT INTO invoice_items (
          invoice_id,
          description,
          quantity,
          unit_price,
          discount_percent,
          discount_amount,
          subtotal,
          iva_rate,
          iva_amount,
          total,
          service_id
        )
        VALUES (
          invoice_id,
          line_items_data->i->>'description',
          (line_items_data->i->>'quantity')::INTEGER,
          (line_items_data->i->>'unit_price')::INTEGER,
          (line_items_data->i->>'discount_percent')::NUMERIC,
          (line_items_data->i->>'discount_amount')::INTEGER,
          (line_items_data->i->>'subtotal')::INTEGER,
          (line_items_data->i->>'iva_rate')::NUMERIC,
          (line_items_data->i->>'iva_amount')::INTEGER,
          (line_items_data->i->>'total')::INTEGER,
          (line_items_data->i->>'service_id')::UUID
        );
      END LOOP;
    END IF;
    
    -- Actualizar los servicios facturados
    IF invoice_data ? 'service_ids' THEN
      -- Primero, desmarcar todos los servicios asociados a esta factura
      UPDATE services
      SET is_billed = FALSE, bill_date = NULL
      WHERE id IN (
        SELECT unnest(service_ids) FROM invoices WHERE id = invoice_id
      );
      
      -- Luego, marcar los nuevos servicios como facturados
      IF jsonb_array_length(invoice_data->'service_ids') > 0 THEN
        UPDATE services
        SET is_billed = TRUE, bill_date = NOW()
        WHERE id = ANY((invoice_data->'service_ids')::UUID[]);
      END IF;
    END IF;
    
    -- Preparar resultado
    result = jsonb_build_object(
      'id', invoice_id,
      'success', TRUE
    );
    
    RETURN result;
  EXCEPTION
    WHEN OTHERS THEN
      -- En caso de error, revertir la transacción
      RAISE;
  END;
END;
$$;
7.3 Función para Incrementar Servicios Completados de un Operador

-- Función para incrementar el contador de servicios completados de un operador
CREATE OR REPLACE FUNCTION increment_operator_services(operator_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET services_completed = COALESCE(services_completed, 0) + 1
  WHERE id = operator_id;
END;
$$;
8. Triggers y Funciones Automáticas
8.1 Trigger para Actualizar Estado de Factura al Registrar un Pago

-- Función para actualizar el estado de pago de una factura
CREATE OR REPLACE FUNCTION update_invoice_payment_status()
RETURNS TRIGGER AS $$
DECLARE
  total_amount INTEGER;
  total_paid INTEGER;
  due_date DATE;
  current_date DATE := CURRENT_DATE;
BEGIN
  -- Obtener el monto total de la factura y la fecha de vencimiento
  SELECT i.total_amount, i.due_date
  INTO total_amount, due_date
  FROM invoices i
  WHERE i.id = NEW.invoice_id;
  
  -- Calcular el total pagado
  SELECT COALESCE(SUM(amount), 0)
  INTO total_paid
  FROM payments
  WHERE invoice_id = NEW.invoice_id;
  
  -- Actualizar el estado de pago
  IF total_paid >= total_amount THEN
    -- Pagado completamente
    UPDATE invoices
    SET payment_status = 'paid', status = 'paid'
    WHERE id = NEW.invoice_id;
  ELSE
    -- Pagado parcialmente
    UPDATE invoices
    SET payment_status = 'partial'
    WHERE id = NEW.invoice_id;
    
    -- Verificar si está vencida
    IF due_date < current_date THEN
      UPDATE invoices
      SET payment_status = 'overdue', status = 'overdue'
      WHERE id = NEW.invoice_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar el estado de pago al insertar un nuevo pago
CREATE TRIGGER update_invoice_payment_status_on_insert
AFTER INSERT ON payments
FOR EACH ROW
EXECUTE FUNCTION update_invoice_payment_status();
8.2 Trigger para Actualizar Estado de Servicio al Completar una Inspección

-- Función para actualizar el estado de un servicio al completar una inspección
CREATE OR REPLACE FUNCTION update_service_on_inspection_complete()
RETURNS TRIGGER AS $$
BEGIN
  -- Si se ha agregado una condición después del servicio, actualizar el servicio
  IF NEW.vehicle_condition_after IS NOT NULL AND OLD.vehicle_condition_after IS NULL THEN
    UPDATE services
    SET status = 'completed', completed_time = CURRENT_TIME::TEXT
    WHERE id = NEW.service_id AND status = 'in_progress';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar el servicio al completar una inspección
CREATE TRIGGER update_service_on_inspection_complete
AFTER UPDATE ON inspections
FOR EACH ROW
EXECUTE FUNCTION update_service_on_inspection_complete();
8.3 Trigger para Verificar Vencimientos de Documentos

-- Función para verificar vencimientos de documentos
CREATE OR REPLACE FUNCTION check_document_expiry()
RETURNS TRIGGER AS $$
DECLARE
  warning_days INTEGER := 30;
  critical_days INTEGER := 7;
  expiry_date DATE;
  current_date DATE := CURRENT_DATE;
  days_remaining INTEGER;
  notification_text TEXT;
  notification_level TEXT;
BEGIN
  -- Determinar qué campo de fecha se actualizó
  IF TG_TABLE_NAME = 'profiles' THEN
    IF NEW.license_expiry IS NOT NULL AND (OLD.license_expiry IS NULL OR NEW.license_expiry <> OLD.license_expiry) THEN
      expiry_date := NEW.license_expiry;
      notification_text := 'Licencia de conducir';
    ELSIF NEW.occupational_exam_expiry IS NOT NULL AND (OLD.occupational_exam_expiry IS NULL OR NEW.occupational_exam_expiry <> OLD.occupational_exam_expiry) THEN
      expiry_date := NEW.occupational_exam_expiry;
      notification_text := 'Examen ocupacional';
    ELSIF NEW.psychosensometric_exam_expiry IS NOT NULL AND (OLD.psychosensometric_exam_expiry IS NULL OR NEW.psychosensometric_exam_expiry <> OLD.psychosensometric_exam_expiry) THEN
      expiry_date := NEW.psychosensometric_exam_expiry;
      notification_text := 'Examen psicosensotécnico';
    ELSE
      RETURN NEW;
    END IF;
  ELSIF TG_TABLE_NAME = 'tow_trucks' THEN
    IF NEW.circulation_permit_expiry IS NOT NULL AND (OLD.circulation_permit_expiry IS NULL OR NEW.circulation_permit_expiry <> OLD.circulation_permit_expiry) THEN
      expiry_date := NEW.circulation_permit_expiry;
      notification_text := 'Permiso de circulación';
    ELSIF NEW.soap_expiry IS NOT NULL AND (OLD.soap_expiry IS NULL OR NEW.soap_expiry <> OLD.soap_expiry) THEN
      expiry_date := NEW.soap_expiry;
      notification_text := 'SOAP';
    ELSIF NEW.technical_review_expiry IS NOT NULL AND (OLD.technical_review_expiry IS NULL OR NEW.technical_review_expiry <> OLD.technical_review_expiry) THEN
      expiry_date := NEW.technical_review_expiry;
      notification_text := 'Revisión técnica';
    ELSE
      RETURN NEW;
    END IF;
  ELSE
    RETURN NEW;
  END IF;
  
  -- Calcular días restantes
  days_remaining := expiry_date - current_date;
  
  -- Determinar nivel de notificación
  IF days_remaining <= 0 THEN
    notification_level := 'critical';
    notification_text := notification_text || ' ha vencido';
  ELSIF days_remaining <= critical_days THEN
    notification_level := 'critical';
    notification_text := notification_text || ' vence en ' || days_remaining || ' días';
  ELSIF days_remaining <= warning_days THEN
    notification_level := 'warning';
    notification_text := notification_text || ' vence en ' || days_remaining || ' días';
  ELSE
    RETURN NEW;
  END IF;
  
  -- Insertar notificación en la tabla de notificaciones
  INSERT INTO notifications (
    user_id,
    entity_id,
    entity_type,
    message,
    level,
    expiry_date,
    days_remaining
  )
  VALUES (
    CASE
      WHEN TG_TABLE_NAME = 'profiles' THEN NEW.id
      WHEN TG_TABLE_NAME = 'tow_trucks' THEN NEW.current_operator_id
      ELSE NULL
    END,
    NEW.id,
    TG_TABLE_NAME,
    notification_text,
    notification_level,
    expiry_date,
    days_remaining
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para verificar vencimientos en perfiles
CREATE TRIGGER check_profile_document_expiry
AFTER INSERT OR UPDATE OF license_expiry, occupational_exam_expiry, psychosensometric_exam_expiry ON profiles
FOR EACH ROW
EXECUTE FUNCTION check_document_expiry();

-- Trigger para verificar vencimientos en grúas
CREATE TRIGGER check_tow_truck_document_expiry
AFTER INSERT OR UPDATE OF circulation_permit_expiry, soap_expiry, technical_review_expiry ON tow_trucks
FOR EACH ROW
EXECUTE FUNCTION check_document_expiry();
9. Integración con Supabase Storage
9.1 Configuración de Políticas de Storage

-- Política para que los administradores puedan hacer todo en todos los buckets
CREATE POLICY "Admin Full Access"
ON storage.objects
FOR ALL
TO authenticated
USING (is_admin());

-- Política para que los operadores puedan subir fotos de inspección
CREATE POLICY "Operators Can Upload Inspection Photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  is_operator() AND
  bucket_id = 'inspection-photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM services WHERE operator_id = auth.uid()
  )
);

-- Política para que los operadores puedan leer fotos de inspección
CREATE POLICY "Operators Can Read Inspection Photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  is_operator() AND
  bucket_id = 'inspection-photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM services WHERE operator_id = auth.uid()
  )
);

-- Política para que los clientes puedan ver fotos de sus propios servicios
CREATE POLICY "Clients Can View Their Service Photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  is_client() AND
  bucket_id = 'inspection-photos' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM services WHERE client_id = (
      SELECT client_id FROM client_profiles WHERE user_id = auth.uid()
    )
  )
);
9.2 Función para Subir Fotos a Supabase Storage

import { supabase } from '@/lib/supabase';

// Subir una imagen a Supabase Storage
export const uploadImage = async (
  bucket: string,
  folder: string,
  file: File,
  fileName?: string
): Promise<string> => {
  // Generar un nombre de archivo único si no se proporciona
  const fileExt = file.name.split('.').pop();
  const finalFileName = fileName || `${Date.now()}.${fileExt}`;
  const filePath = `${folder}/${finalFileName}`;
  
  // Subir el archivo
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) {
    console.error(`Error uploading file to ${bucket}/${folder}:`, error);
    throw error;
  }
  
  // Obtener la URL pública del archivo
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);
  
  return publicUrl;
};

// Subir múltiples imágenes a Supabase Storage
export const uploadMultipleImages = async (
  bucket: string,
  folder: string,
  files: File[]
): Promise<string[]> => {
  const uploadPromises = files.map((file, index) => 
    uploadImage(bucket, folder, file, `${index}_${Date.now()}.${file.name.split('.').pop()}`)
  );
  
  return Promise.all(uploadPromises);
};

// Eliminar una imagen de Supabase Storage
export const deleteImage = async (
  bucket: string,
  filePath: string
): Promise<void> => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);
  
  if (error) {
    console.error(`Error deleting file from ${bucket}/${filePath}:`, error);
    throw error;
  }
};
10. Integración con Supabase Auth
10.1 Configuración de Autenticación
1. En el panel de Supabase, ve a "Authentication" > "Providers"
2. Habilita el proveedor "Email"
3. Configura las opciones según tus necesidades (confirmación de email, etc.)
10.2 Funciones para Autenticación

import { supabase } from '@/lib/supabase';

// Registrar un nuevo usuario
export const signUp = async (
  email: string,
  password: string,
  userData: {
    name: string;
    role: 'client';
    phone?: string;
  }
): Promise<void> => {
  // Registrar el usuario en Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: userData.name,
        role: userData.role
      }
    }
  });
  
  if (error) {
    console.error('Error signing up:', error);
    throw error;
  }
  
  // El perfil se creará automáticamente mediante un trigger en Supabase
};

// Iniciar sesión
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    console.error('Error signing in:', error);
    throw error;
  }
  
  return data;
};

// Cerrar sesión
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Restablecer contraseña
export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });
  
  if (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

// Actualizar contraseña
export const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });
  
  if (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};
10.3 Trigger para Crear Perfil Automáticamente

-- Función para crear un perfil automáticamente al registrar un usuario
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (
    id,
    email,
    name,
    role,
    phone,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    NEW.raw_user_meta_data->>'phone',
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$;

-- Trigger para crear un perfil cuando se crea un nuevo usuario
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();
11. Ejemplo de Uso en Componentes React
11.1 Componente de Login

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Truck, Loader2, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@tmsgruas.com',
      password: 'password123'
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const user = await login(data.email, data.password);
      if (user?.role === 'client') {
        navigate('/portal-cliente');
      } else if (user?.role === 'operator') {
        navigate('/portal-operador');
      } else {
        navigate('/');
      }
    } catch (err) {
      // Error is handled by the auth store
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-lg">
              <Truck className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">TMS Grúas</CardTitle>
          <CardDescription>
            Sistema de Gestión de Transportes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@tmsgruas.com"
                {...register('email')}
                disabled={isSubmitting || isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                disabled={isSubmitting || isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || isLoading}
            >
              {(isSubmitting || isLoading) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Iniciar Sesión
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Usuarios de prueba:</p>
            <div className="space-y-1 text-xs">
              <p><strong>Admin:</strong> admin@tmsgruas.com</p>
              <p><strong>Operador:</strong> operator@tmsgruas.com</p>
              <p><strong>Supervisor:</strong> viewer@tmsgruas.com</p>
              <p><strong>Cliente:</strong> cliente@tmsgruas.com</p>
              <p className="mt-1"><strong>Contraseña:</strong> password123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
11.2 Componente de Lista de Clientes con Supabase

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ClienteForm } from '@/components/clientes/ClienteForm';
import { Client } from '@/types';
import { Plus, Search, Filter, Eye, Edit, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { getClients, createClient, updateClient, deleteClient } from '@/services/clientService';

export function Clients() {
  const [clientes, setClientes] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Client | undefined>();

  // Cargar clientes al montar el componente
  useEffect(() => {
    const loadClients = async () => {
      try {
        setIsLoading(true);
        const data = await getClients();
        setClientes(data);
      } catch (error) {
        console.error('Error loading clients:', error);
        toast.error('Error al cargar los clientes');
      } finally {
        setIsLoading(false);
      }
    };

    loadClients();
  }, []);

  const filteredClientes = clientes.filter(cliente => {
    const matchesSearch = cliente.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cliente.document.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cliente.phone.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleCreateCliente = async (data: any) => {
    try {
      const newClient = await createClient(data);
      setClientes([...clientes, newClient]);
      toast.success('Cliente creado exitosamente');
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error creating client:', error);
      toast.error('Error al crear el cliente');
    }
  };

  const handleUpdateCliente = async (data: any) => {
    if (!editingCliente) return;

    try {
      const updatedClient = await updateClient(editingCliente.id, data);
      setClientes(clientes.map(c => c.id === updatedClient.id ? updatedClient : c));
      toast.success('Cliente actualizado exitosamente');
      setIsFormOpen(false);
      setEditingCliente(undefined);
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Error al actualizar el cliente');
    }
  };

  const handleDeleteCliente = async (id: string) => {
    try {
      await deleteClient(id);
      setClientes(clientes.filter(c => c.id !== id));
      toast.success('Cliente eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Error al eliminar el cliente');
    }
  };

  const openEditForm = (cliente: Client) => {
    setEditingCliente(cliente);
    setIsFormOpen(true);
  };

  const openCreateForm = () => {
    setEditingCliente(undefined);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCliente(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Clientes</h1>
          <p className="text-muted-foreground">
            Administra la base de datos de clientes y sus datos de contacto
          </p>
        </div>
        <Button onClick={openCreateForm} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, documento, email o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            {cliente.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{cliente.name}</p>
                          {cliente.notes && (
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {cliente.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="outline">
                          {cliente.document_type === 'rut' ? 'RUT' : 
                           cliente.document_type === 'passport' ? 'Pasaporte' : 'ID Extranjero'}
                        </Badge>
                        <p className="text-sm font-mono">{cliente.document}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{cliente.phone}</p>
                        {cliente.email && (
                          <p className="text-sm text-muted-foreground">{cliente.email}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{cliente.city}</p>
                        <p className="text-sm text-muted-foreground">{cliente.province}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openEditForm(cliente)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
                              handleDeleteCliente(cliente.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredClientes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium text-muted-foreground">
                        No se encontraron clientes
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {searchTerm ? 'Intenta con otra búsqueda' : 'Agrega tu primer cliente'}
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <ClienteForm
        cliente={editingCliente}
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={editingCliente ? handleUpdateCliente : handleCreateCliente}
      />
    </div>
  );
}
12. Migración de Datos
12.1 Migración de Datos de Prueba

-- Insertar usuarios de prueba
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@tmsgruas.com', '$2a$10$abcdefghijklmnopqrstuvwxyz', NOW(), '{"name":"Administrador","role":"admin"}'),
  ('00000000-0000-0000-0000-000000000002', 'manager@tmsgruas.com', '$2a$10$abcdefghijklmnopqrstuvwxyz', NOW(), '{"name":"Carlos Gerente","role":"manager"}'),
  ('00000000-0000-0000-0000-000000000003', 'operator@tmsgruas.com', '$2a$10$abcdefghijklmnopqrstuvwxyz', NOW(), '{"name":"Juan Operador","role":"operator"}'),
  ('00000000-0000-0000-0000-000000000004', 'viewer@tmsgruas.com', '$2a$10$abcdefghijklmnopqrstuvwxyz', NOW(), '{"name":"Ana Supervisora","role":"viewer"}'),
  ('00000000-0000-0000-0000-000000000005', 'cliente@tmsgruas.com', '$2a$10$abcdefghijklmnopqrstuvwxyz', NOW(), '{"name":"María González","role":"client"}');

-- Insertar perfiles
INSERT INTO profiles (id, email, name, role, phone, license_number, license_expiry, occupational_exam_expiry, psychosensometric_exam_expiry, emergency_contact, emergency_phone, services_completed, status, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@tmsgruas.com', 'Administrador', 'admin', '+56 2 2234 5678', '12345678', '2025-12-31', '2025-06-15', '2025-08-20', 'María Admin', '+56 9 8765 4321', 0, 'active', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000002', 'manager@tmsgruas.com', 'Carlos Gerente', 'manager', '+56 9 6666 6666', NULL, NULL, NULL, NULL, 'Laura Gerente', '+56 9 7777 7777', 0, 'active', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000003', 'operator@tmsgruas.com', 'Juan Operador', 'operator', '+56 9 8765 4321', '87654321', '2024-06-30', '2024-05-10', '2024-07-15', 'Ana Operador', '+56 9 1111 1111', 45, 'active', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000004', 'viewer@tmsgruas.com', 'Ana Supervisora', 'viewer', '+56 9 3333 3333', NULL, NULL, NULL, NULL, 'Luis Supervisor', '+56 9 4444 4444', 0, 'active', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000005', 'cliente@tmsgruas.com', 'María González', 'client', '+56 9 1234 5678', NULL, NULL, NULL, NULL, NULL, NULL, 0, 'active', NOW(), NOW());

-- Insertar clientes
INSERT INTO clients (id, name, document, document_type, phone, email, address, city, province, postal_code, notes, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000010', 'María González', '12.345.678-9', 'rut', '+56 9 1234 5678', 'maria.gonzalez@email.com', 'Av. Providencia 1234', 'Santiago', 'Metropolitana de Santiago', '7500000', 'Cliente premium con múltiples vehículos', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000011', 'Carlos Rodriguez', '98.765.432-1', 'rut', '+56 9 8765 4321', 'carlos.rodriguez@email.com', 'Av. Las Condes 2567', 'Santiago', 'Metropolitana de Santiago', '7550000', NULL, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000012', 'Ana Martínez', '15.678.912-3', 'rut', '+56 9 5555 1234', 'ana.martinez@gmail.com', 'Av. Libertador Bernardo O''Higgins 3456', 'Valparaíso', 'Valparaíso', '2340000', 'Requiere facturación especial', NOW(), NOW());

-- Insertar grúas
INSERT INTO tow_trucks (id, name, license_plate, brand, model, year, capacity_tons, truck_type, status, current_operator_id, circulation_permit_expiry, soap_expiry, technical_review_expiry, notes, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000020', 'Grúa 01', 'GRU001', 'Mercedes-Benz', 'Atego', 2021, 3.5, 'flatbed', 'available', '00000000-0000-0000-0000-000000000003', '2024-12-31', '2024-10-15', '2024-11-30', 'Equipada con GPS y sistema de comunicación', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000021', 'Grúa 02', 'GRU002', 'Iveco', 'Daily', 2020, 2.5, 'wheel_lift', 'in_service', NULL, '2024-08-15', '2024-09-20', '2024-07-10', 'Ideal para vehículos livianos', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000022', 'Grúa 03', 'GRU003', 'Ford', 'F-4000', 2019, 4.0, 'integrated', 'maintenance', NULL, '2025-01-15', '2024-06-05', '2024-05-20', 'En mantenimiento preventivo', NOW(), NOW());

-- Insertar servicios
INSERT INTO services (id, service_number, folio, client_id, vehicle_license_plate, vehicle_brand, vehicle_model, tow_truck_id, operator_id, service_type, origin_address, destination_address, distance_km, service_date, requested_time, started_time, completed_time, status, priority, base_cost, total_cost, description, requires_inspection, is_billed, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000030', 'SRV-2024-0001', 'F-2024-0001', '00000000-0000-0000-0000-000000000010', 'ABCD12', 'Toyota', 'Corolla', '00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000003', 'tow', 'Av. Providencia 500, Santiago', 'Taller Mecánico Sur, Av. Libertador 8000', 12.5, '2024-01-25', '09:00:00', '09:15:00', '10:30:00', 'completed', 'medium', 85000, 85000, 'Remolque por falla mecánica', TRUE, FALSE, '2024-01-25T08:45:00Z', '2024-01-25T10:30:00Z'),
  ('00000000-0000-0000-0000-000000000031', 'SRV-2024-0002', NULL, '00000000-0000-0000-0000-000000000011', 'WXYZ89', 'Ford', 'F-150', '00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000003', 'assistance', 'Av. Las Condes 3000, Santiago', NULL, NULL, '2024-01-25', '14:00:00', '14:20:00', NULL, 'in_progress', 'high', 55000, 55000, 'Asistencia por batería descargada', FALSE, FALSE, '2024-01-25T13:45:00Z', '2024-01-25T14:20:00Z'),
  ('00000000-0000-0000-0000-000000000032', 'SRV-2024-0003', 'CLI-2023-0045', '00000000-0000-0000-0000-000000000012', 'GHIJ78', 'Yamaha', 'YBR 125', '00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000003', 'tow', 'Ruta 68 Km 45, Valparaíso', 'Concesionario Yamaha, Av. Brasil 1234', 8.2, '2024-01-24', '16:30:00', '16:45:00', '17:30:00', 'completed', 'urgent', 65000, 65000, 'Accidente de motocicleta', TRUE, TRUE, '2024-01-24T16:15:00Z', '2024-01-24T17:30:00Z');

-- Insertar inspecciones
INSERT INTO inspections (id, service_id, vehicle_condition_before, vehicle_condition_after, operator_signature_name, client_signature_name, operator_signature_image, client_signature_image, photos_before, photos_after, inspection_notes, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000030', 
   '{"exterior_damage":[{"id":"1","x":25,"y":30,"type":"scratch","severity":"minor","description":"Rayón en puerta delantera izquierda"}],"interior_condition":"good","fuel_level":75,"mileage":85000,"tire_condition":"good","notes":"Vehículo en buen estado general"}',
   '{"exterior_damage":[{"id":"1","x":25,"y":30,"type":"scratch","severity":"minor","description":"Rayón en puerta delantera izquierda"}],"interior_condition":"good","fuel_level":70,"tire_condition":"good"}',
   'Juan Operador', 'María González', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51AAAA', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51AAABB',
   ARRAY['photo1.jpg', 'photo2.jpg'], ARRAY['photo3.jpg', 'photo4.jpg'], 'Servicio completado sin incidentes', '2024-01-25T10:30:00Z', '2024-01-25T11:45:00Z');
13. Consideraciones de Seguridad
13.1 Protección de Datos Sensibles
* Utiliza variables de entorno para almacenar claves de API y credenciales
* No almacenes contraseñas en texto plano, utiliza el sistema de autenticación de Supabase
* Implementa políticas de RLS para proteger los datos
13.2 Validación de Datos
* Utiliza Zod para validar los datos en el frontend
* Implementa restricciones y validaciones en la base de datos
* Valida los datos en el backend antes de insertarlos en la base de datos
13.3 Manejo de Errores
* Implementa un sistema de manejo de errores consistente
* Registra los errores para su posterior análisis
* Muestra mensajes de error amigables para el usuario
14. Optimización de Rendimiento
14.1 Índices de Base de Datos

-- Índices para mejorar el rendimiento de consultas frecuentes
CREATE INDEX idx_services_client_id ON services(client_id);
CREATE INDEX idx_services_operator_id ON services(operator_id);
CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_services_service_date ON services(service_date);
CREATE INDEX idx_services_is_billed ON services(is_billed);

CREATE INDEX idx_inspections_service_id ON inspections(service_id);

CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_payment_status ON invoices(payment_status);
CREATE INDEX idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);

CREATE INDEX idx_calendar_events_start ON calendar_events(start);
CREATE INDEX idx_calendar_events_type ON calendar_events(type);
CREATE INDEX idx_calendar_events_status ON calendar_events(status);
14.2 Optimización de Consultas
* Utiliza select para especificar solo las columnas necesarias
* Utiliza limit y offset para paginación
* Implementa filtrado en el lado del servidor

// Ejemplo de consulta paginada y filtrada
export const getFilteredServices = async (
  page: number = 1,
  pageSize: number = 10,
  filters: {
    status?: string;
    type?: string;
    priority?: string;
    operatorId?: string;
    clientId?: string;
    dateFrom?: string;
    dateTo?: string;
    searchTerm?: string;
  }
): Promise<{ data: Service[]; count: number }> => {
  let query = supabase
    .from('services')
    .select('*', { count: 'exact' });
  
  // Aplicar filtros
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  
  if (filters.type && filters.type !== 'all') {
    query = query.eq('service_type', filters.type);
  }
  
  if (filters.priority && filters.priority !== 'all') {
    query = query.eq('priority', filters.priority);
  }
  
  if (filters.operatorId && filters.operatorId !== 'all') {
    query = query.eq('operator_id', filters.operatorId);
  }
  
  if (filters.clientId && filters.clientId !== 'all') {
    query = query.eq('client_id', filters.clientId);
  }
  
  if (filters.dateFrom) {
    query = query.gte('service_date', filters.dateFrom);
  }
  
  if (filters.dateTo) {
    query = query.lte('service_date', filters.dateTo);
  }
  
  if (filters.searchTerm) {
    query = query.or(`service_number.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%,folio.ilike.%${filters.searchTerm}%`);
  }
  
  // Aplicar paginación
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);
  
  if (error) {
    console.error('Error fetching filtered services:', error);
    throw error;
  }
  
  return { data: data as Service[], count: count || 0 };
};
15. Despliegue
15.1 Configuración para Producción
1. Crea un proyecto de producción en Supabase
2. Configura las variables de entorno para producción
3. Ejecuta las migraciones en el entorno de producción
15.2 Migración de Datos a Producción

# Exportar datos de desarrollo
npx supabase db dump -f data.sql

# Importar datos en producción
npx supabase db push --db-url=postgres://postgres:password@db.production.supabase.co:5432/postgres
16. Conclusión
La integración con Supabase proporciona una base sólida para el sistema TMS Grúas, ofreciendo:
* Base de datos PostgreSQL potente y escalable
* Sistema de autenticación seguro
* Almacenamiento de archivos
* APIs instantáneas
* Seguridad a nivel de fila (RLS)
* Funciones y triggers para lógica de negocio
Siguiendo este instructivo, podrás implementar una solución completa y robusta para la gestión de transportes con Supabase.
con lo anterior crea un archivo en la raiz
Bolt

