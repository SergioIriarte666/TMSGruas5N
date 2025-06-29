/*
  # Datos iniciales para el sistema

  1. Datos de Prueba
    - Perfiles de usuario (admin, gerente, operador, supervisor, cliente)
    - Clientes
    - Grúas
    - Servicios
    - Inspecciones
    - Facturas
    - Eventos de calendario

  Este archivo inserta datos de prueba para poder comenzar a usar el sistema
  inmediatamente después de la migración.
*/

-- Insertar perfiles de usuario (basados en los usuarios creados en Auth)
INSERT INTO profiles (id, email, name, role, phone, license_number, license_expiry, occupational_exam_expiry, psychosensometric_exam_expiry, status, created_at)
VALUES
  -- Nota: Los IDs deben ser reemplazados por los IDs reales de los usuarios creados en Auth
  ('00000000-0000-0000-0000-000000000001', 'admin@tmsgruas.com', 'Administrador Principal', 'admin', '+54 11 1234-5678', '12345678', '2025-12-31', '2025-06-15', '2025-08-20', 'active', '2024-01-01T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000002', 'manager@tmsgruas.com', 'Carlos Gerente', 'manager', '+54 11 6666-6666', NULL, NULL, NULL, NULL, 'active', '2024-01-01T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000003', 'juan@tmsgruas.com', 'Juan Operador', 'operator', '+54 11 8765-4321', '87654321', '2024-06-30', '2024-05-10', '2024-07-15', 'active', '2024-01-01T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000004', 'pedro@tmsgruas.com', 'Pedro Conductor', 'operator', '+54 11 5555-5555', '11223344', '2025-03-15', '2025-02-20', '2024-12-05', 'active', '2024-01-01T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000005', 'ana@tmsgruas.com', 'Ana Supervisora', 'viewer', '+54 11 3333-3333', NULL, NULL, NULL, NULL, 'active', '2024-01-01T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000006', 'cliente@tmsgruas.com', 'María González', 'client', '+56 9 1234 5678', NULL, NULL, NULL, NULL, 'active', '2024-01-01T00:00:00Z');

-- Insertar clientes
INSERT INTO clients (id, name, document, document_type, phone, email, address, city, province, postal_code, notes, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000010', 'María González', '12.345.678-9', 'rut', '+56 9 1234 5678', 'maria.gonzalez@email.com', 'Av. Providencia 1234', 'Santiago', 'Metropolitana de Santiago', '7500000', 'Cliente premium con múltiples vehículos', '2024-01-15T10:00:00Z'),
  ('00000000-0000-0000-0000-000000000011', 'Carlos Rodriguez', '98.765.432-1', 'rut', '+56 9 8765 4321', 'carlos.rodriguez@email.com', 'Av. Las Condes 2567', 'Santiago', 'Metropolitana de Santiago', '7550000', NULL, '2024-01-20T14:30:00Z'),
  ('00000000-0000-0000-0000-000000000012', 'Ana Martínez', '15.678.912-3', 'rut', '+56 9 5555 1234', 'ana.martinez@gmail.com', 'Av. Libertador Bernardo O''Higgins 3456', 'Valparaíso', 'Valparaíso', '2340000', 'Requiere facturación especial', '2024-01-22T09:15:00Z'),
  ('00000000-0000-0000-0000-000000000013', 'Roberto Silva', '23.789.456-K', 'rut', '+56 9 9876 5432', NULL, 'Av. San Martín 789', 'Concepción', 'Biobío', '4030000', NULL, '2024-01-25T16:45:00Z'),
  ('00000000-0000-0000-0000-000000000014', 'Empresa Logística del Sur SpA', '76.123.456-7', 'rut', '+56 2 2444 7777', 'contacto@logisticasur.cl', 'Av. Industrial 1500', 'Temuco', 'La Araucanía', '4780000', 'Cliente corporativo - Flota de camiones', '2024-01-10T11:30:00Z');

-- Insertar grúas
INSERT INTO tow_trucks (id, name, license_plate, brand, model, year, capacity_tons, truck_type, status, current_operator_id, circulation_permit_expiry, soap_expiry, technical_review_expiry, notes, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000020', 'Grúa 01', 'GRU001', 'Mercedes-Benz', 'Atego', 2021, 3.5, 'flatbed', 'available', '00000000-0000-0000-0000-000000000003', '2024-12-31', '2024-10-15', '2024-11-30', 'Equipada con GPS y sistema de comunicación', '2024-01-01T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000021', 'Grúa 02', 'GRU002', 'Iveco', 'Daily', 2020, 2.5, 'wheel_lift', 'in_service', '00000000-0000-0000-0000-000000000004', '2024-08-15', '2024-09-20', '2024-07-10', 'Ideal para vehículos livianos', '2024-01-01T00:00:00Z'),
  ('00000000-0000-0000-0000-000000000022', 'Grúa 03', 'GRU003', 'Ford', 'F-4000', 2019, 4.0, 'integrated', 'maintenance', NULL, '2025-01-15', '2024-06-05', '2024-05-20', 'En mantenimiento preventivo', '2024-01-01T00:00:00Z');

-- Insertar servicios
INSERT INTO services (id, service_number, folio, client_id, vehicle_license_plate, vehicle_brand, vehicle_model, tow_truck_id, operator_id, service_type, origin_address, destination_address, distance_km, service_date, requested_time, started_time, completed_time, status, priority, base_cost, additional_costs, total_cost, description, requires_inspection, is_billed, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000030', 'SRV-2024-0001', 'F-2024-0001', '00000000-0000-0000-0000-000000000010', 'ABCD12', 'Toyota', 'Corolla', '00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000003', 'tow', 'Av. Providencia 500, Santiago', 'Taller Mecánico Sur, Av. Libertador 8000', 12.5, '2024-01-25', '09:00:00', '09:15:00', '10:30:00', 'completed', 'medium', 85000, '[]', 85000, 'Remolque por falla mecánica', true, false, '2024-01-25T08:45:00Z'),
  ('00000000-0000-0000-0000-000000000031', 'SRV-2024-0002', NULL, '00000000-0000-0000-0000-000000000011', 'WXYZ89', 'Ford', 'F-150', '00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000004', 'assistance', 'Av. Las Condes 3000, Santiago', NULL, NULL, '2024-01-25', '14:00:00', '14:20:00', NULL, 'in_progress', 'high', 55000, '[]', 55000, 'Asistencia por batería descargada', false, false, '2024-01-25T13:45:00Z'),
  ('00000000-0000-0000-0000-000000000032', 'SRV-2024-0003', 'CLI-2023-0045', '00000000-0000-0000-0000-000000000012', 'GHIJ78', 'Yamaha', 'YBR 125', '00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000003', 'tow', 'Ruta 68 Km 45, Valparaíso', 'Concesionario Yamaha, Av. Brasil 1234', 8.2, '2024-01-24', '16:30:00', '16:45:00', '17:30:00', 'completed', 'urgent', 65000, '[]', 65000, 'Accidente de motocicleta', true, true, '2024-01-24T16:15:00Z'),
  ('00000000-0000-0000-0000-000000000033', 'SRV-2024-0004', 'INSP-2024-001', '00000000-0000-0000-0000-000000000010', 'PHJT98', 'Toyota', 'Hilux', '00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000003', 'tow', 'Copiapo 1234, Santiago', 'Taller Mecánico Norte, Av. Independencia 5678', 15.3, '2024-06-28', '10:00:00', NULL, NULL, 'assigned', 'medium', 75000, '[]', 75000, 'Remolque por problemas de transmisión', true, false, '2024-06-27T18:30:00Z');

-- Insertar inspecciones
INSERT INTO inspections (id, service_id, vehicle_condition_before, operator_signature_name, client_signature_name, operator_signature_image, client_signature_image, photos_before, photos_after, inspection_notes, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000030', 
   '{"exterior_damage": [{"id": "1", "x": 25, "y": 30, "type": "scratch", "severity": "minor", "description": "Rayón en puerta delantera izquierda"}], "interior_condition": "good", "fuel_level": 75, "mileage": 85000, "tire_condition": "good", "notes": "Vehículo en buen estado general"}',
   'Juan Operador', 'María González', 
   'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51AAAA', 
   'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51AAABB', 
   '{"photo1.jpg", "photo2.jpg"}', '{"photo3.jpg", "photo4.jpg"}', 
   'Servicio completado sin incidentes', '2024-01-25T10:30:00Z'),
   
  ('00000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000031', 
   '{"exterior_damage": [], "interior_condition": "excellent", "fuel_level": 50, "mileage": 45000, "tire_condition": "excellent"}',
   'Pedro Conductor', NULL, 
   'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51AAACC', 
   NULL, 
   '{"photo5.jpg"}', NULL, 
   'Inspección inicial completada', '2024-01-25T14:20:00Z'),
   
  ('00000000-0000-0000-0000-000000000042', '00000000-0000-0000-0000-000000000033', 
   '{"exterior_damage": [], "interior_condition": "good", "fuel_level": 65, "mileage": 32500, "tire_condition": "good"}',
   'Juan Operador', NULL, 
   'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51AAADD', 
   NULL, 
   '{"photo6.jpg", "photo7.jpg"}', NULL, 
   'Vehículo en buen estado general, sin daños visibles', '2024-06-28T09:30:00Z');

-- Insertar facturas
INSERT INTO invoices (id, invoice_number, invoice_type, folio, client_id, service_ids, issue_date, due_date, subtotal, iva_amount, total_amount, status, payment_status, client_rut, client_name, client_address, client_city, client_region, notes, created_by, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000050', 'F001-00000001', 'factura', 1, '00000000-0000-0000-0000-000000000010', ARRAY['00000000-0000-0000-0000-000000000030']::UUID[], '2024-01-25', '2024-02-24', 85000, 16150, 101150, 'issued', 'pending', '12.345.678-9', 'María González', 'Av. Providencia 1234', 'Santiago', 'Metropolitana de Santiago', NULL, '00000000-0000-0000-0000-000000000001', '2024-01-25T10:30:00Z'),
  ('00000000-0000-0000-0000-000000000051', 'F001-00000002', 'factura', 2, '00000000-0000-0000-0000-000000000011', ARRAY['00000000-0000-0000-0000-000000000031']::UUID[], '2024-01-24', '2024-02-23', 55000, 10450, 65450, 'paid', 'paid', '98.765.432-1', 'Carlos Rodriguez', 'Av. Las Condes 2567', 'Santiago', 'Metropolitana de Santiago', NULL, '00000000-0000-0000-0000-000000000001', '2024-01-24T14:30:00Z');

-- Insertar ítems de factura
INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price, subtotal, iva_rate, iva_amount, total, service_id, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000060', '00000000-0000-0000-0000-000000000050', 'SRV-2024-0001 - Remolque por falla mecánica', 1, 85000, 85000, 19, 16150, 101150, '00000000-0000-0000-0000-000000000030', '2024-01-25T10:30:00Z'),
  ('00000000-0000-0000-0000-000000000061', '00000000-0000-0000-0000-000000000051', 'SRV-2024-0002 - Asistencia por batería descargada', 1, 55000, 55000, 19, 10450, 65450, '00000000-0000-0000-0000-000000000031', '2024-01-24T14:30:00Z');

-- Insertar pagos
INSERT INTO payments (id, invoice_id, amount, payment_date, payment_method, reference, created_by, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000070', '00000000-0000-0000-0000-000000000051', 65450, '2024-01-24', 'transfer', 'TRF-123456789', '00000000-0000-0000-0000-000000000001', '2024-01-24T16:00:00Z');

-- Insertar eventos de calendario
INSERT INTO calendar_events (id, title, start, "end", all_day, description, location, type, status, assigned_to, related_service_id, related_client_id, created_by, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000080', 'Servicio de Remolque - Carlos Rodriguez', '2024-07-01 10:00:00', '2024-07-01 12:00:00', false, 'Remolque de vehículo por falla mecánica', 'Av. Las Condes 3000, Santiago', 'service', 'scheduled', ARRAY['00000000-0000-0000-0000-000000000003']::UUID[], '00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', '2024-06-30'),
  ('00000000-0000-0000-0000-000000000081', 'Mantenimiento Grúa 01', '2024-07-02 09:00:00', '2024-07-02 13:00:00', false, 'Mantenimiento preventivo programado', 'Taller Central', 'maintenance', 'scheduled', ARRAY['00000000-0000-0000-0000-000000000004']::UUID[], NULL, NULL, '00000000-0000-0000-0000-000000000001', '2024-06-28'),
  ('00000000-0000-0000-0000-000000000082', 'Reunión de Operadores', '2024-07-03 15:00:00', '2024-07-03 16:00:00', false, 'Reunión mensual de coordinación', 'Sala de Reuniones', 'meeting', 'scheduled', ARRAY['00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004']::UUID[], NULL, NULL, '00000000-0000-0000-0000-000000000001', '2024-06-25');