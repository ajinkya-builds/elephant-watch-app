import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function listPolicies() {
  console.log('Current RLS policies for users table:');
  
  // This requires elevated privileges and may not work directly, 
  // but let's try to get existing policies
  try {
    const { data, error } = await supabase.rpc('get_policies_for_table', { table_name: 'users' });
    if (error) {
      console.log('Could not retrieve policies via RPC:', error.message);
    } else if (data) {
      console.log(data);
    }
  } catch (error) {
    console.log('Error retrieving policies:', error.message);
  }
}

async function fixPolicies() {
  try {
    console.log('Dropping all existing policies on users table...');
    
    // First, drop all existing policies
    await supabase.rpc('drop_all_policies_for_table', { table_name: 'users' });
    
    console.log('Creating new simplified policies...');
    
    // Create simplified policies that avoid recursion
    
    // 1. Basic policy for everyone to see own profile
    const { error: error1 } = await supabase.query(`
      CREATE POLICY "Users can view their own profile"
      ON public.users FOR SELECT
      USING (auth.uid() = auth_id);
    `);
    
    if (error1) throw error1;
    
    // 2. Service role can do anything
    const { error: error2 } = await supabase.query(`
      CREATE POLICY "Service role has full access"
      ON public.users FOR ALL
      USING (auth.role() = 'service_role');
    `);
    
    if (error2) throw error2;
    
    // 3. Admins can do anything
    const { error: error3 } = await supabase.query(`
      CREATE POLICY "Admins can do anything" 
      ON public.users FOR ALL 
      USING (
        EXISTS (
          SELECT 1 FROM auth.users 
          WHERE id = auth.uid() 
          AND raw_app_meta_data->>'role' = 'admin'
        )
      );
    `);
    
    if (error3) throw error3;
    
    console.log('RLS policies have been updated.');
    
  } catch (error) {
    console.error('Error fixing policies:', error);
  }
}

// Run the functions
listPolicies()
  .then(() => fixPolicies())
  .catch(error => console.error('Script error:', error)); 