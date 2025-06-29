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