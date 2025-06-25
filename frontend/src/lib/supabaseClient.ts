import { createClient } from '@supabase/supabase-js';

// These environment variables will be read from your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// Storage key constant for consistency
const STORAGE_KEY = 'sb-vfsyjvjghftfebvxyjba-auth-token';

// Validate environment variables
if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
  throw new Error('Invalid VITE_SUPABASE_URL format');
}

if (!supabaseAnonKey || !supabaseAnonKey.startsWith('eyJ')) {
  throw new Error('Invalid VITE_SUPABASE_ANON_KEY format');
}

// Create a single instance of the Supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null;

// Custom storage implementation with debugging
const customStorage = {
  getItem: (key: string): string | null => {
    try {
      if (import.meta.env.DEV) {
        console.log(`Getting item from storage: ${key}`);
      }
      const value = localStorage.getItem(key);
      if (import.meta.env.DEV) {
        console.log(`Item ${key} ${value ? 'found' : 'not found'}`);
      }
      return value;
    } catch (error) {
      console.error(`Error getting item ${key} from storage:`, error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (import.meta.env.DEV) {
        console.log(`Setting item in storage: ${key}`);
      }
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting item ${key} in storage:`, error);
    }
  },
  removeItem: (key: string): void => {
    try {
      if (import.meta.env.DEV) {
        console.log(`Removing item from storage: ${key}`);
      }
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key} from storage:`, error);
    }
  },
};

export const getSupabaseClient = () => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  if (import.meta.env.DEV) {
    console.log('Creating new Supabase client instance');
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: customStorage,
        storageKey: STORAGE_KEY,
        flowType: 'pkce',
        debug: import.meta.env.DEV
      }
    });

    // Add debug logging for auth state changes in development
    if (import.meta.env.DEV) {
      supabaseInstance.auth.onAuthStateChange((event, session) => {
        console.log('Supabase auth state changed:', {
          event,
          userId: session?.user?.id,
          timestamp: new Date().toISOString()
        });
      });
    }

    // Test the connection and session
    supabaseInstance.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Error testing Supabase connection:', error);
      } else {
        console.log('Supabase connection test successful:', {
          hasSession: !!data.session,
          timestamp: new Date().toISOString()
        });
      }
    });

    return supabaseInstance;
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    throw error;
  }
};

// Export the singleton instance
export const supabase = getSupabaseClient();

// Helper function to check Supabase connection
export const checkSupabaseConnection = async () => {
  try {
    console.log('Checking Supabase connection (offline operation will still work)...');

    // Check if we have a locally stored session first
    let hasLocalSession = false;
    try {
      const storedSession = localStorage.getItem(STORAGE_KEY);
      hasLocalSession = !!storedSession;
    } catch (storageError) {
      console.warn('Error checking local storage for session:', storageError);
    }

    // Set a timeout to prevent hanging too long on network requests when offline
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection check timed out')), 3000); // 3 second timeout
    });

    const connectionPromise = supabase.from('users').select('id').limit(1);
    
    // Race between timeout and actual request
    const { error } = await Promise.race([
      connectionPromise,
      timeoutPromise
    ]) as { error?: { status?: number } };

    if (!error) {
      console.log('Supabase connection successful');
      return true;
    }

    // Treat auth/permission errors as "still connected" because they prove
    // the backend responded.
    const statusCode = error?.status;
    if (statusCode === 401 || statusCode === 403) {
      console.warn('Supabase reachable but access denied (expected for unauthenticated request).');
      return true;
    }

    if (hasLocalSession) {
      console.log('Supabase connection failed, but local session exists. App will work offline.');
      return true; // Return true to prevent logout when operating offline with cached session
    }

    console.error('Supabase connection error:', error);
    return false;
  } catch (error) {
    // Even if connection check fails with an exception, as long as we have a local session, 
    // we should return true to enable offline operation
    try {
      const storedSession = localStorage.getItem(STORAGE_KEY);
      if (storedSession) {
        console.log('Supabase connection check failed, but local session exists. Will work offline.');
        return true; 
      }
    } catch (storageError) {
      console.warn('Error checking local storage for session:', storageError);
    }
    
    console.error('Supabase connection error:', error);
    return false;
  }
};

// Helper function to get current user
export const getCurrentUser = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
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
