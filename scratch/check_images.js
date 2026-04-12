import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual env parsing since we might not have dotenv in the runner
const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value) env[key.trim()] = value.join('=').trim();
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_KEY;

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
    if (Array.isArray(p.images)) {
        p.images.forEach((img, i) => {
          console.log(`  [${i}] ${img}`);
        });
    } else {
        console.log(`  Images: ${JSON.stringify(p.images)}`);
    }
  });
}

checkProducts();
