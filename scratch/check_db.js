import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jxivchmrvtetiijdpehp.supabase.co';
const supabaseKey = 'sb_publishable_oaxumUvOAml0d5OLr_ly3A_ajG-hAXz'; // Actually, let's look for service_role key or we can query using publishable key.
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('products').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Columns in products:', data[0] ? Object.keys(data[0]) : 'No data in products');
  }

  const { data: catData, error: catError } = await supabase.from('categories').select('*').limit(1);
  if (catError) {
    console.error('Cat Error:', catError);
  } else {
    console.log('Columns in categories:', catData[0] ? Object.keys(catData[0]) : 'No data in categories');
  }
}

check();
