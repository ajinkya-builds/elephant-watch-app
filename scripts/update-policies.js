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

async function updatePolicies() {
  try {
    console.log('Testing connection with service role key...');
    
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Service role connection failed:', testError);
      return;
    }
    console.log('✓ Service role connection successful');

    // Create a basic public policy for authentication
    const { error: policyError } = await supabase
      .from('users')
      .select()
      .limit(1)
      .single();

    if (policyError?.message?.includes('Invalid API key')) {
      console.log('\nTrying to fix anon key access...');
      
      // Try to create a basic policy
      const { error: createError } = await supabase
        .rpc('create_auth_policy', {
          table_name: 'users',
          policy_name: 'Allow public authentication',
          definition: "auth.role() IN ('anon', 'authenticated', 'service_role')"
        });

      if (createError) {
        console.error('❌ Failed to create policy:', createError);
      } else {
        console.log('✓ Created public authentication policy');
      }
    }

    // Test anonymous access
    const anonClient = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY?.trim());
    const { error: anonError } = await anonClient
      .from('users')
      .select('count')
      .limit(1)
      .single();

    if (anonError) {
      console.error('❌ Anonymous access still failing:', anonError);
    } else {
      console.log('✓ Anonymous access working');
    }

    // Additional debug information
    console.log('\nCurrent environment:');
    console.log('- URL:', supabaseUrl);
    console.log('- Service key valid:', !!supabaseServiceKey);
    console.log('- Anon key valid:', !!process.env.VITE_SUPABASE_ANON_KEY);

  } catch (error) {
    console.error('Error updating policies:', error);
  }
}

updatePolicies(); 