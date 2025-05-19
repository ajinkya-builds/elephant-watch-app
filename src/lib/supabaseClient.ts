import { createClient } from '@supabase/supabase-js';

// These environment variables will be read from your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error(
    "Supabase URL, Anon Key, or Service Key is missing. Make sure you have VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and VITE_SUPABASE_SERVICE_ROLE_KEY set in your .env file."
  );
  throw new Error("Missing Supabase credentials");
}

// Create two clients - one for regular operations and one for admin operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper function to check Supabase connection
export const checkSupabaseConnection = async () => {
  try {
    // Use a simple health check instead of querying users table
    const { data, error } = await supabase.rpc('get_service_status');
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
};

// Helper function to subscribe to realtime changes
export function subscribeToRealtimeChanges(
  table: string,
  callback: (payload: any) => void
) {
  const channel = supabase.channel(`${table}-changes`);
  
  channel
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: table
    }, callback)
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to ${table} changes`);
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`Error subscribing to ${table} changes`);
      } else if (status === 'CLOSED') {
        console.log(`Unsubscribed from ${table} changes`);
      }
    });

  return channel;
}

// Update the user type to include mobile
export type User = {
  id: string;
  email: string;
  mobile: string;
  password_hash: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
};
