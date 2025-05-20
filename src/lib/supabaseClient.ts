import { createClient } from '@supabase/supabase-js';

// These environment variables will be read from your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Log masked values for debugging
console.log('Supabase Configuration:');
console.log('URL:', supabaseUrl?.substring(0, 20) + '...');
console.log('Anon Key:', supabaseAnonKey?.substring(0, 10) + '...');
console.log('Service Key:', supabaseServiceKey?.substring(0, 10) + '...');

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error(
    "Supabase URL, Anon Key, or Service Key is missing. Make sure you have VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and VITE_SUPABASE_SERVICE_ROLE_KEY set in your .env file."
  );
  throw new Error("Missing Supabase credentials");
}

// Create two clients - one for regular operations and one for admin operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper function to check Supabase connection and auth
export const checkSupabaseConnection = async () => {
  try {
    // Check if we have a session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return false;
    }

    if (!session) {
      console.log('No active session');
      return false;
    }

    // Try to query the users table to test the connection
    const { error: userError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
      .single();
    
    if (userError) {
      console.error('Supabase connection error:', userError);
      return false;
    }

    console.log('Supabase connection successful');
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

// Helper function to get current user
export async function getCurrentUser() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return session?.user || null;
}

// Update the user type to include mobile
export type User = {
  id: string;
  email_or_phone: string;
  password_hash: string;
  role: 'admin' | 'manager' | 'data_collector';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
};
