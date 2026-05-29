import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jxivchmrvtetiijdpehp.supabase.co';
const supabaseKey = 'sb_publishable_oaxumUvOAml0d5OLr_ly3A_ajG-hAXz';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRealOrder() {
  // 1. Get a real product
  const { data: products, error: pError } = await supabase.from('products').select('*').limit(1);
  if (pError || !products || products.length === 0) {
    console.error('Failed to fetch a product or no products exist:', pError);
    return;
  }
  
  const product = products[0];
  console.log(`Using real product: ${product.nameAr} (${product.id})`);

  // 2. Build the order params
  const testOrder = {
    p_customer_name: 'Test Real Customer',
    p_customer_phone: '7701234567',
    p_customer_address: 'Al-Mansour, Baghdad',
    p_customer_city: 'بغداد',
    p_items: [
      {
        productId: product.id,
        quantity: 1,
        price: product.price,
        nameAr: product.nameAr,
        sku: product.sku || 'N/A',
        image: product.images[0] || 'http://example.com/image.jpg'
      }
    ]
  };

  // Try RPC call
  const { data, error } = await supabase.rpc('secure_create_order', testOrder);
  
  if (error) {
    console.error('RPC Error:', error);
  } else {
    console.log('RPC Success! Created order:', data);
  }
}

testRealOrder();
