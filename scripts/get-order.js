import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load .env
const envConfig = dotenv.parse(fs.readFileSync('.env'));
const supabaseUrl = envConfig.VITE_SUPABASE_URL || envConfig.SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY || envConfig.SUPABASE_ANON_KEY || envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase config in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: orders, error } = await supabase.from('orders').select('*').limit(1);
  if (error) {
    console.error('Error fetching orders:', error);
  } else {
    console.log('Orders table sample:', JSON.stringify(orders, null, 2));
  }
}

run();
