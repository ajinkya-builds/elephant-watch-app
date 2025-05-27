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

console.log('Testing connection with new anon key...');
console.log('URL:', supabaseUrl);
console.log('Key format check:');
console.log('- Length:', supabaseAnonKey.length);
console.log('- JWT parts:', supabaseAnonKey.split('.').length);
console.log('- First chars:', supabaseAnonKey.substring(0, 10) + '...');

// Create a minimal client with debug logging
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    detectSessionInUrl: false,
    autoRefreshToken: false
  },
  db: {
    schema: 'public'
  }
});

// Test basic query
async function testQuery() {
  try {
    console.log('\nTesting basic query...');
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Query error:', {
        message: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details
      });
    } else {
      console.log('Query successful:', data);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testQuery(); 