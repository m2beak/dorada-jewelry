import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jxivchmrvtetiijdpehp.supabase.co';
const supabaseKey = 'sb_publishable_oaxumUvOAml0d5OLr_ly3A_ajG-hAXz';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRpc() {
  const testOrder = {
    p_customer_name: 'Test Customer',
    p_customer_phone: '7701234567',
    p_customer_address: 'Test Address',
    p_customer_city: 'بغداد',
    p_items: [
      {
        productId: 'f7b587d5-d72b-426b-801b-534bc7e4f3a7', // Let's try to query a valid product first or just pass a UUID
        quantity: 1,
        price: 25000,
        nameAr: 'حلقة تجريبية',
        sku: 'TEST-SKU',
        image: 'http://example.com/image.jpg'
      }
    ]
  };

  console.log('Testing RPC secure_create_order with params:', testOrder);
  const { data, error } = await supabase.rpc('secure_create_order', testOrder);
  
  if (error) {
    console.error('RPC Error:', error);
  } else {
    console.log('RPC Success! Created order:', data);
  }
}

testRpc();
