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