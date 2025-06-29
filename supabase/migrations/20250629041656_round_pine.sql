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