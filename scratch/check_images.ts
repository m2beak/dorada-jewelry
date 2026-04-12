import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
  const { data, error } = await supabase.from('products').select('id, nameAr, images');
  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  console.log(`Found ${data.length} products:`);
  data.forEach(p => {
    console.log(`- ${p.nameAr} (${p.id}):`);
    p.images.forEach((img, i) => {
      console.log(`  [${i}] ${img}`);
    });
  });
}

checkProducts();
