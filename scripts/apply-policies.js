import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim();
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyPolicies() {
  try {
    console.log('Applying RLS policies...\n');

    // First, verify service role connection
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Service role connection failed:', testError);
      return;
    }
    console.log('✓ Service role connection successful');

    // Apply RLS policies
    const queries = [
      // Enable RLS
      'ALTER TABLE users ENABLE ROW LEVEL SECURITY;',
      
      // Drop existing policies
      'DROP POLICY IF EXISTS "Allow public authentication" ON users;',
      'DROP POLICY IF EXISTS "Service role has full access" ON users;',
      'DROP POLICY IF EXISTS "Users can update their own data" ON users;',
      
      // Create new policies
      `CREATE POLICY "Allow public authentication" ON users 
       FOR SELECT USING (auth.role() IN ('anon', 'authenticated', 'service_role'));`,
      
      `CREATE POLICY "Service role has full access" ON users 
       FOR ALL USING (auth.role() = 'service_role');`,
      
      `CREATE POLICY "Users can update their own data" ON users 
       FOR UPDATE USING (auth.uid() = id OR auth.role() = 'service_role') 
       WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');`
    ];

    // Execute each query using the superuser function
    for (const query of queries) {
      const { error } = await supabase.rpc('execute_as_superuser', { sql: query });
      if (error) {
        console.error(`❌ Failed to execute query: ${query}`);
        console.error('Error:', error);
      } else {
        console.log(`✓ Successfully executed: ${query}`);
      }
    }

    // Verify policies using the new function
    console.log('\nVerifying policies...');
    const { data: policies, error: policyError } = await supabase
      .rpc('get_table_policies', { table_name: 'users' });

    if (policyError) {
      console.error('❌ Failed to verify policies:', policyError);
    } else {
      console.log('\nCurrent policies on users table:');
      policies.forEach(policy => {
        console.log(`\nPolicy: ${policy.policyname}`);
        console.log(`- Command: ${policy.cmd}`);
        console.log(`- Using: ${policy.qual}`);
        if (policy.with_check) {
          console.log(`- With Check: ${policy.with_check}`);
        }
      });
    }

  } catch (error) {
    console.error('Error applying policies:', error);
  }
}

applyPolicies(); 