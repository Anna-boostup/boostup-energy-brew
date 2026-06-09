import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createUsers() {
  const users = [
    { email: process.env.TEST_ADMIN_EMAIL, password: process.env.TEST_ADMIN_PASSWORD, role: 'admin', type: 'admin' },
    { email: process.env.TEST_BASIC_EMAIL, password: process.env.TEST_BASIC_PASSWORD, role: 'user', type: 'personal' }
  ];

  for (const u of users) {
    if (!u.email || !u.password) continue;
    console.log(`Creating user ${u.email}...`);
    const { data, error } = await supabase.auth.signUp({
      email: u.email,
      password: u.password,
    });
    
    if (error) {
      console.error(`Failed to create ${u.email}:`, error.message);
    } else {
      console.log(`Created ${u.email}! ID:`, data.user?.id);
      
      // Update profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            role: u.role,
            account_type: u.type,
            full_name: 'Test ' + u.role
          })
          .eq('id', data.user.id);
          
        if (profileError) {
          console.error("Profile update error:", profileError.message);
        } else {
          console.log("Profile updated!");
        }
      }
    }
  }
}

createUsers();
