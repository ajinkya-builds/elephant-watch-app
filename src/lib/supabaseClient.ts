import { createClient } from '@supabase/supabase-js';

// These environment variables will be read from your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// Debug environment variables
console.log('=== Supabase Client Configuration Debug ===');
console.log('URL:', {
  value: supabaseUrl,
  length: supabaseUrl?.length,
  type: typeof supabaseUrl,
  firstChar: supabaseUrl?.[0],
  lastChar: supabaseUrl?.[supabaseUrl.length - 1],
  hasSpaces: supabaseUrl?.includes(' '),
  hasNewlines: supabaseUrl?.includes('\n'),
});

console.log('Anon Key:', {
  exists: !!supabaseAnonKey,
  length: supabaseAnonKey?.length,
  type: typeof supabaseAnonKey,
  firstChar: supabaseAnonKey?.[0],
  lastChar: supabaseAnonKey?.[supabaseAnonKey.length - 1],
  hasSpaces: supabaseAnonKey?.includes(' '),
  hasNewlines: supabaseAnonKey?.includes('\n'),
  parts: supabaseAnonKey?.split('.').length,
});

// Validate URL and key
if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
  throw new Error('Invalid VITE_SUPABASE_URL format');
}

if (!supabaseAnonKey || !supabaseAnonKey.startsWith('eyJ')) {
  throw new Error('Invalid VITE_SUPABASE_ANON_KEY format');
}

// Create the Supabase client with minimal configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper function to check Supabase connection
export const checkSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // 1. Test auth endpoint
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Auth endpoint test failed:', sessionError);
      return false;
    }
    console.log('✓ Auth endpoint accessible');

    // 2. Test public data access
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
      .single();

    if (userError) {
      console.error('Database access test failed:', {
        code: userError.code,
        message: userError.message,
        hint: userError.hint
      });
      return false;
    }
    console.log('✓ Database accessible');

    return true;
  } catch (error) {
    console.error('Connection check failed:', error);
    return false;
  }
};

// Helper function to get current user
export const getCurrentUser = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session?.user ?? null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Helper function for authentication
export const signInWithRedirect = async (provider: 'google' | 'phone' | 'email', options: any = {}) => {
  try {
    let signInResult;
    
    if (provider === 'google') {
      signInResult = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
    } else if (provider === 'phone') {
      signInResult = await supabase.auth.signInWithPassword({
        phone: options.phone,
        password: options.password
      });
    } else {
      signInResult = await supabase.auth.signInWithPassword({
        email: options.email,
        password: options.password
      });
    }

    if (signInResult.error) {
      console.error('Sign in failed:', signInResult.error);
      throw signInResult.error;
    }

    return signInResult;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

// Update the user type to include separate email and phone fields
export type User = {
  id: string;
  email: string | null;
  phone: string | null;
  password_hash: string;
  role: 'admin' | 'manager' | 'data_collector';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
};
