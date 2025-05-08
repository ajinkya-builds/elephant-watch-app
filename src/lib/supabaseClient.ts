import { createClient } from '@supabase/supabase-js';

// These environment variables will be read from your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL or Anon Key is missing. Make sure you have VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY set in your .env file."
  );
  // You might want to throw an error here or handle it more gracefully
  // For now, we'll proceed, but Supabase operations will fail.
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);