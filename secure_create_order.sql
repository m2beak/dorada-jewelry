-- Secure Order Creation Function
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION secure_create_order(
  p_customer_name text,
  p_customer_phone text,
  p_customer_address text,
  p_customer_city text,
  p_items jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total numeric := 0;
  v_shipping_cost numeric := 5000;
  v_order_id uuid;
  v_item jsonb;
  v_product_id uuid;
  v_qty int;
  v_price numeric; -- Real DB price
  v_stock int;
  v_p_name_ar text;
  v_p_sku text;
  v_p_image text;
  v_final_items jsonb := '[]'::jsonb;
BEGIN
  -- 1. Validate Input
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'السلة فارغة';
  END IF;

  -- 2. Validate Customer Data
  IF length(trim(p_customer_name)) < 2 THEN RAISE EXCEPTION 'الاسم غير صحيح'; END IF;
  IF length(trim(p_customer_phone)) < 10 THEN RAISE EXCEPTION 'رقم الهاتف غير صحيح'; END IF;

  -- 3. Process Items & Calculate Total
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'productId')::uuid;
    v_qty := (v_item->>'quantity')::int;

    IF v_qty <= 0 THEN RAISE EXCEPTION 'الكمية يجب أن تكون أكبر من صفر'; END IF;

    -- Lock the product row for update to prevent race conditions
    SELECT "price", "quantity", "nameAr", "sku", "images"
    INTO v_price, v_stock, v_p_name_ar, v_p_sku, v_p_image
    FROM "products"
    WHERE id = v_product_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'منتج غير موجود: %', v_product_id;
    END IF;

    IF v_stock < v_qty THEN
      RAISE EXCEPTION 'عذراً، الكمية المتوفرة للمنتج (%) هي % فقط', v_p_name_ar, v_stock;
    END IF;

    -- Deduct Stock
    UPDATE "products"
    SET 
      "quantity" = "quantity" - v_qty,
      "inStock" = ("quantity" - v_qty) > 0,
      "updatedAt" = now()
    WHERE id = v_product_id;

    -- Add to Total (Using REAL price from DB)
    v_total := v_total + (v_price * v_qty);

    -- Build Secure Item Object
    v_final_items := v_final_items || jsonb_build_object(
      'productId', v_product_id,
      'quantity', v_qty,
      'price', v_price,
      'nameAr', v_p_name_ar,
      'sku', v_p_sku,
      'image', (CASE WHEN jsonb_typeof(v_item->'image') = 'string' THEN v_item->>'image' ELSE v_p_image::jsonb->>0 END) -- Fallback logic if needed
    );
  END LOOP;

  -- 4. Add Shipping
  v_total := v_total + v_shipping_cost;

  -- 5. Create Order
  INSERT INTO "orders" (
    "customerName",
    "customerPhone",
    "customerAddress",
    "customerCity",
    "items",
    "total",
    "status",
    "statusAr",
    "createdAt",
    "updatedAt"
  ) VALUES (
    p_customer_name,
    p_customer_phone,
    p_customer_address,
    p_customer_city,
    v_final_items,
    v_total,
    'pending',
    'قيد الانتظار',
    now(),
    now()
  )
  RETURNING id INTO v_order_id;

  -- 6. Return the new order
  RETURN (SELECT to_jsonb(o) FROM "orders" o WHERE id = v_order_id);
END;
$$;
