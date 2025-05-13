import { createClient } from '@supabase/supabase-js';

// These environment variables will be read from your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL or Anon Key is missing. Make sure you have VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY set in your .env file."
  );
  throw new Error("Supabase URL or Anon Key is missing.");
}

// Create the Supabase client with additional configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey
    },
  },
  db: {
    schema: 'public'
  }
});

// Helper function to check Supabase connection
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('activity_reports').select('count').limit(1);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
}

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
