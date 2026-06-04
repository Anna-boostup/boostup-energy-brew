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
  const { data: inventory, error } = await supabase.from('inventory').select('*');
  if (error) {
    console.error('Error fetching inventory:', error);
  } else {
    console.log('Inventory table contents:', JSON.stringify(inventory, null, 2));
  }
}

run();
