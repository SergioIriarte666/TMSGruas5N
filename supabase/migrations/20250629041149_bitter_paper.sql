/*
  # Esquema inicial de la base de datos

  1. Nuevas Tablas
    - `profiles` - Información de perfiles de usuario
    - `clients` - Clientes de la empresa
    - `tow_trucks` - Grúas y vehículos de servicio
    - `operators` - Operadores y personal
    - `services` - Servicios de grúa y asistencia
    - `inspections` - Inspecciones de vehículos
    - `invoices` - Facturas y documentos de pago
    - `invoice_items` - Ítems de facturas
    - `payments` - Pagos de facturas
    - `calendar_events` - Eventos del calendario

  2. Seguridad
    - Habilitación de RLS en todas las tablas
    - Políticas de acceso para cada tabla
    - Funciones de ayuda para autenticación
*/

-- Habilitar la extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Función de ayuda para obtener el ID del usuario actual
CREATE OR REPLACE FUNCTION public.get_auth_user_id()
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT auth.uid();
$$;

-- Función para verificar si el usuario es administrador
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Función para verificar si el usuario es gerente
CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'manager'
  );
$$;

-- Función para verificar si el usuario es operador
CREATE OR REPLACE FUNCTION public.is_operator()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'operator'
  );
$$;

-- Función para verificar si el usuario es supervisor
CREATE OR REPLACE FUNCTION public.is_viewer()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'viewer'
  );
$$;

-- Función para verificar si el usuario es cliente
CREATE OR REPLACE FUNCTION public.is_client()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'client'
  );
$$;

-- Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
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
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de grúas
CREATE TABLE IF NOT EXISTS tow_trucks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  license_plate TEXT NOT NULL UNIQUE,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  capacity_tons NUMERIC(5,2) NOT NULL,
  truck_type TEXT NOT NULL CHECK (truck_type IN ('flatbed', 'wheel_lift', 'integrated', 'heavy_duty')),
  status TEXT NOT NULL CHECK (status IN ('available', 'in_service', 'maintenance', 'out_of_service')),
  current_operator_id UUID REFERENCES profiles(id),
  circulation_permit_expiry DATE,
  soap_expiry DATE,
  technical_review_expiry DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de servicios
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_number TEXT NOT NULL UNIQUE,
  folio TEXT,
  client_id UUID NOT NULL REFERENCES clients(id),
  vehicle_license_plate TEXT,
  vehicle_brand TEXT,
  vehicle_model TEXT,
  tow_truck_id UUID REFERENCES tow_trucks(id),
  operator_id UUID REFERENCES profiles(id),
  service_type TEXT NOT NULL CHECK (service_type IN ('tow', 'taxi', 'transport', 'assistance')),
  origin_address TEXT NOT NULL,
  origin_coordinates JSONB,
  destination_address TEXT,
  destination_coordinates JSONB,
  distance_km NUMERIC(8,2),
  service_date DATE NOT NULL,
  requested_time TIME NOT NULL,
  started_time TIME,
  completed_time TIME,
  status TEXT NOT NULL CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  base_cost INTEGER NOT NULL,
  additional_costs JSONB,
  total_cost INTEGER NOT NULL,
  description TEXT NOT NULL,
  notes TEXT,
  requires_inspection BOOLEAN DEFAULT false,
  special_fields JSONB,
  is_billed BOOLEAN DEFAULT false,
  bill_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de inspecciones
CREATE TABLE IF NOT EXISTS inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES services(id),
  vehicle_condition_before JSONB NOT NULL,
  vehicle_condition_after JSONB,
  operator_signature_name TEXT NOT NULL,
  client_signature_name TEXT,
  operator_signature_image TEXT,
  client_signature_image TEXT,
  photos_before TEXT[],
  photos_after TEXT[],
  inspection_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de facturas
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_type TEXT NOT NULL CHECK (invoice_type IN ('factura', 'boleta', 'nota_credito', 'nota_debito')),
  folio INTEGER NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id),
  service_ids UUID[] DEFAULT '{}',
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
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de ítems de factura
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  service_id UUID REFERENCES services(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'transfer', 'check', 'card', 'other')),
  reference TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de eventos de calendario
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  start TIMESTAMPTZ NOT NULL,
  "end" TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT false,
  description TEXT,
  location TEXT,
  type TEXT NOT NULL CHECK (type IN ('service', 'maintenance', 'meeting', 'other')),
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  assigned_to UUID[],
  related_service_id UUID REFERENCES services(id),
  related_client_id UUID REFERENCES clients(id),
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Configuración de seguridad (RLS)

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tow_trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Políticas para perfiles
CREATE POLICY "Usuarios pueden ver su propio perfil" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Administradores pueden ver todos los perfiles" 
  ON profiles FOR SELECT 
  USING (is_admin() OR is_manager());

CREATE POLICY "Administradores pueden crear perfiles" 
  ON profiles FOR INSERT 
  WITH CHECK (is_admin());

CREATE POLICY "Administradores pueden actualizar perfiles" 
  ON profiles FOR UPDATE 
  USING (is_admin())
  WITH CHECK (is_admin());

-- Políticas para clientes
CREATE POLICY "Todos los usuarios autenticados pueden ver clientes" 
  ON clients FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Administradores y gerentes pueden crear clientes" 
  ON clients FOR INSERT 
  WITH CHECK (is_admin() OR is_manager());

CREATE POLICY "Administradores y gerentes pueden actualizar clientes" 
  ON clients FOR UPDATE 
  USING (is_admin() OR is_manager())
  WITH CHECK (is_admin() OR is_manager());

-- Políticas para grúas
CREATE POLICY "Todos los usuarios autenticados pueden ver grúas" 
  ON tow_trucks FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Administradores y gerentes pueden crear grúas" 
  ON tow_trucks FOR INSERT 
  WITH CHECK (is_admin() OR is_manager());

CREATE POLICY "Administradores y gerentes pueden actualizar grúas" 
  ON tow_trucks FOR UPDATE 
  USING (is_admin() OR is_manager())
  WITH CHECK (is_admin() OR is_manager());

-- Políticas para servicios
CREATE POLICY "Todos los usuarios autenticados pueden ver servicios" 
  ON services FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Administradores, gerentes y operadores pueden crear servicios" 
  ON services FOR INSERT 
  WITH CHECK (is_admin() OR is_manager() OR is_operator());

CREATE POLICY "Administradores, gerentes y operadores pueden actualizar servicios" 
  ON services FOR UPDATE 
  USING (is_admin() OR is_manager() OR is_operator() OR operator_id = auth.uid())
  WITH CHECK (is_admin() OR is_manager() OR is_operator() OR operator_id = auth.uid());

-- Políticas para inspecciones
CREATE POLICY "Todos los usuarios autenticados pueden ver inspecciones" 
  ON inspections FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Administradores, gerentes y operadores pueden crear inspecciones" 
  ON inspections FOR INSERT 
  WITH CHECK (is_admin() OR is_manager() OR is_operator());

CREATE POLICY "Administradores, gerentes y operadores pueden actualizar inspecciones" 
  ON inspections FOR UPDATE 
  USING (is_admin() OR is_manager() OR is_operator())
  WITH CHECK (is_admin() OR is_manager() OR is_operator());

-- Políticas para facturas
CREATE POLICY "Todos los usuarios autenticados pueden ver facturas" 
  ON invoices FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Administradores y gerentes pueden crear facturas" 
  ON invoices FOR INSERT 
  WITH CHECK (is_admin() OR is_manager());

CREATE POLICY "Administradores y gerentes pueden actualizar facturas" 
  ON invoices FOR UPDATE 
  USING (is_admin() OR is_manager())
  WITH CHECK (is_admin() OR is_manager());

-- Políticas para ítems de factura
CREATE POLICY "Todos los usuarios autenticados pueden ver ítems de factura" 
  ON invoice_items FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Administradores y gerentes pueden crear ítems de factura" 
  ON invoice_items FOR INSERT 
  WITH CHECK (is_admin() OR is_manager());

CREATE POLICY "Administradores y gerentes pueden actualizar ítems de factura" 
  ON invoice_items FOR UPDATE 
  USING (is_admin() OR is_manager())
  WITH CHECK (is_admin() OR is_manager());

-- Políticas para pagos
CREATE POLICY "Todos los usuarios autenticados pueden ver pagos" 
  ON payments FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Administradores y gerentes pueden crear pagos" 
  ON payments FOR INSERT 
  WITH CHECK (is_admin() OR is_manager());

-- Políticas para eventos de calendario
CREATE POLICY "Todos los usuarios autenticados pueden ver eventos de calendario" 
  ON calendar_events FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Administradores, gerentes y operadores pueden crear eventos" 
  ON calendar_events FOR INSERT 
  WITH CHECK (is_admin() OR is_manager() OR is_operator());

CREATE POLICY "Administradores, gerentes y operadores pueden actualizar eventos" 
  ON calendar_events FOR UPDATE 
  USING (is_admin() OR is_manager() OR is_operator() OR created_by = auth.uid())
  WITH CHECK (is_admin() OR is_manager() OR is_operator() OR created_by = auth.uid());

-- Trigger para actualizar el campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar el trigger a todas las tablas con updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tow_trucks_updated_at
  BEFORE UPDATE ON tow_trucks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspections_updated_at
  BEFORE UPDATE ON inspections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();