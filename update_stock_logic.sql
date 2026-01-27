-- update_stock_logic.sql

-- 1. DROP old function to ensure clean state
DROP FUNCTION IF EXISTS secure_create_order;

-- 2. Re-create secure_create_order 
-- Changes: 
--  a) Removed immediate stock deduction
--  b) Added detailed item list to Telegram message (Name, SKU, Qty)
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
  v_price numeric;
  v_stock int;
  v_p_name_ar text;
  v_p_sku text;
  v_p_image text;
  v_final_items jsonb := '[]'::jsonb;
  
  -- Telegram vars
  v_tg_config jsonb;
  v_tg_bot_token text;
  v_tg_chat_id text;
  v_tg_msg text;
  v_tg_items_details text := ''; 
BEGIN
  -- 1. Validate Input
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'السلة فارغة';
  END IF;

  IF length(trim(p_customer_name)) < 2 THEN RAISE EXCEPTION 'الاسم غير صحيح'; END IF;
  IF length(trim(p_customer_phone)) < 10 THEN RAISE EXCEPTION 'رقم الهاتف غير صحيح'; END IF;

  -- 2. Process Items & Calculate Total
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'productId')::uuid;
    v_qty := (v_item->>'quantity')::int;

    IF v_qty <= 0 THEN RAISE EXCEPTION 'الكمية يجب أن تكون أكبر من صفر'; END IF;

    -- Lock & Check Stock (Warning only, do not deduct yet)
    SELECT "price", "quantity", "nameAr", "sku", "images"
    INTO v_price, v_stock, v_p_name_ar, v_p_sku, v_p_image
    FROM "products"
    WHERE id = v_product_id
    FOR UPDATE; 

    IF NOT FOUND THEN RAISE EXCEPTION 'منتج غير موجود: %', v_product_id; END IF;

    -- Ensure we don't allow ordering if stock is actually 0 or less than requested
    -- (You can remove this check if you want to allow backorders)
    IF v_stock < v_qty THEN
      RAISE EXCEPTION 'عذراً، الكمية المتوفرة للمنتج (%) هي % فقط', v_p_name_ar, v_stock;
    END IF;

    -- Generate Telegram Item Detail Line
    v_tg_items_details := v_tg_items_details || E'\n' || '• ' || v_p_name_ar || E'\n' || '   كود: `' || COALESCE(v_p_sku, 'N/A') || '` | عدد: ' || v_qty;

    -- Add to Total
    v_total := v_total + (v_price * v_qty);

    -- Build Secure Item
    v_final_items := v_final_items || jsonb_build_object(
      'productId', v_product_id,
      'quantity', v_qty,
      'price', v_price,
      'nameAr', v_p_name_ar,
      'sku', v_p_sku,
      'image', (CASE WHEN jsonb_typeof(v_item->'image') = 'string' THEN v_item->>'image' ELSE v_p_image::jsonb->>0 END)
    );
  END LOOP;

  -- 3. Add Shipping
  v_total := v_total + v_shipping_cost;

  -- 4. Create Order (Pending Status)
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

  -- 5. Send Telegram Notification
  BEGIN
    SELECT value INTO v_tg_config FROM settings WHERE id = 'telegram_config';
    
    IF v_tg_config IS NOT NULL AND (v_tg_config->>'enabled')::boolean = true THEN
       v_tg_bot_token := v_tg_config->>'botToken';
       v_tg_chat_id := v_tg_config->>'chatId';
       
       IF v_tg_bot_token IS NOT NULL AND v_tg_chat_id IS NOT NULL THEN
         v_tg_msg := '📦 *طلب جديد على دورادا*' || E'\n' ||
                     '-------------------' || E'\n' ||
                     '👤 *العميل:* ' || p_customer_name || E'\n' ||
                     '📱 *الهاتف:* ' || p_customer_phone || E'\n' ||
                     '📍 *العنوان:* ' || p_customer_city || ' - ' || p_customer_address || E'\n' ||
                     '💰 *المجموع:* ' || to_char(v_total, 'FM999,999') || ' IQD' || E'\n' ||
                     '-------------------' || E'\n' ||
                     '*المنتجات:*' || v_tg_items_details || E'\n' ||
                     '-------------------';
         
         PERFORM net.http_post(
            url := 'https://api.telegram.org/bot' || v_tg_bot_token || '/sendMessage',
            headers := '{"Content-Type": "application/json"}'::jsonb,
            body := jsonb_build_object(
                'chat_id', v_tg_chat_id,
                'text', v_tg_msg,
                'parse_mode', 'Markdown'
            )
         );
       END IF;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to send telegram notification: %', SQLERRM;
  END;

  RETURN (SELECT to_jsonb(o) FROM "orders" o WHERE id = v_order_id);
END;
$$;


-- 3. Create Trigger Function to Handle Stock Changes
CREATE OR REPLACE FUNCTION handle_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_item jsonb;
  v_product_id uuid;
  v_qty int;
BEGIN
  -- Case 1: Deduct Stock when marked as SHIPPED
  -- (Logic: If Moving TO Shipped AND NOT coming FROM Shipped)
  IF NEW.status = 'shipped' AND OLD.status != 'shipped' THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(NEW.items)
    LOOP
      v_product_id := (v_item->>'productId')::uuid;
      v_qty := (v_item->>'quantity')::int;

      UPDATE "products"
      SET 
        "quantity" = "quantity" - v_qty,
        "inStock" = ("quantity" - v_qty) > 0,
        "updatedAt" = now()
      WHERE id = v_product_id;
    END LOOP;
  END IF;

  -- Case 2: Restore Stock when CANCELLED (or moved away from shipped)
  -- (Logic: If Moving FROM Shipped to ANY other status)
  IF OLD.status = 'shipped' AND NEW.status != 'shipped' THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(NEW.items)
    LOOP
      v_product_id := (v_item->>'productId')::uuid;
      v_qty := (v_item->>'quantity')::int;

      UPDATE "products"
      SET 
        "quantity" = "quantity" + v_qty,
        "inStock" = true, -- If we add stock, it's definitely in stock now? Or at least > 0 if it was 0.
        "updatedAt" = now()
      WHERE id = v_product_id;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create The Trigger
DROP TRIGGER IF EXISTS on_order_status_change ON "orders";
CREATE TRIGGER on_order_status_change
  AFTER UPDATE OF status ON "orders"
  FOR EACH ROW
  EXECUTE FUNCTION handle_order_status_change();
