import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jxivchmrvtetiijdpehp.supabase.co';
const supabaseKey = 'sb_publishable_oaxumUvOAml0d5OLr_ly3A_ajG-hAXz';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('orders').select('*').limit(1);
  if (error) {
    console.error('Error fetching orders:', error);
  } else {
    console.log('Order row keys:', data.length > 0 ? Object.keys(data[0]) : 'No orders found');
  }
}
check();
