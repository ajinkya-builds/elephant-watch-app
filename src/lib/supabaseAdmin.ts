import { createClient } from '@supabase/supabase-js';

// These environment variables will be read from your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Supabase URL or Service Role Key is missing. Make sure you have VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY set in your .env file."
  );
  throw new Error("Supabase URL or Service Role Key is missing.");
}

// Log the keys for debugging (without revealing full key)
const maskedKey = supabaseServiceKey ? `${supabaseServiceKey.substring(0, 10)}...` : 'undefined';
console.log(`Using service role key: ${maskedKey}`);

// Create the Supabase admin client with service role key
// This client bypasses RLS policies
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  global: {
    headers: {
      Accept: "application/json", // Ensure the response format is JSON
      // Add explicit authorization header for service role
      Authorization: `Bearer ${supabaseServiceKey}`
    },
  },
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test the admin client
supabaseAdmin.from('activity_reports').select('count', { count: 'exact', head: true })
  .then(({ count, error }) => {
    if (error) {
      console.error('Error testing admin client:', error);
    } else {
      console.log('Admin client working, table has', count, 'records');
    }
  });
