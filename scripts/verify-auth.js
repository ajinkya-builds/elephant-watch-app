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

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifyAuth() {
  try {
    console.log('Testing anonymous access...');
    
    // Test auth endpoint
    const { data: authData, error: authError } = await supabase.auth.getSession();
    console.log('\nAuth endpoint test:');
    if (authError) {
      console.error('❌ Auth error:', authError);
    } else {
      console.log('✓ Auth endpoint accessible');
    }

    // Test public data access
    const { data: publicData, error: publicError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
      .single();

    console.log('\nPublic data access test:');
    if (publicError) {
      console.error('❌ Public data error:', {
        message: publicError.message,
        code: publicError.code,
        hint: publicError.hint
      });
    } else {
      console.log('✓ Public data accessible');
    }

    // Test RLS policies
    console.log('\nRLS policies test:');
    const { data: policies, error: policyError } = await supabase
      .rpc('get_policies', { table_name: 'users' });

    if (policyError) {
      console.error('❌ Policy error:', policyError);
    } else {
      console.log('✓ Policies retrieved:', policies);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

verifyAuth(); 