import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

// Create a minimal client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
});

async function testAccess() {
  try {
    console.log('Testing with anon key...');
    console.log('URL:', supabaseUrl);
    console.log('Key length:', supabaseAnonKey.length);
    console.log('Key starts with:', supabaseAnonKey.substring(0, 10) + '...');
    
    // Test 1: Auth endpoint
    console.log('\n1. Testing auth endpoint...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.error('❌ Auth error:', authError);
    } else {
      console.log('✓ Auth endpoint working');
    }

    // Test 2: Public schema access
    console.log('\n2. Testing public schema access...');
    const { data: schemaData, error: schemaError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
      .single();

    if (schemaError) {
      console.error('❌ Schema error:', {
        message: schemaError.message,
        code: schemaError.code,
        hint: schemaError.hint
      });
    } else {
      console.log('✓ Schema access working');
    }

    // Test 3: Raw query
    console.log('\n3. Testing raw query...');
    const { data: rawData, error: rawError } = await supabase
      .rpc('get_service_status');

    if (rawError) {
      console.error('❌ Raw query error:', rawError);
    } else {
      console.log('✓ Raw query working');
    }

    // Test 4: Headers
    console.log('\n4. Testing with explicit headers...');
    const { data: headerData, error: headerError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
      .single()
      .headers({
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      });

    if (headerError) {
      console.error('❌ Header test error:', headerError);
    } else {
      console.log('✓ Header test working');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testAccess(); 