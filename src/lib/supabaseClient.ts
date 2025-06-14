import { createClient } from '@supabase/supabase-js';

// These environment variables will be read from your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// Storage key constant for consistency - Updated to new Supabase project ID
const STORAGE_KEY = 'sb-vfsyjvjghftfebvxyjba-auth-token';

// Debug environment variables
console.log('=== Supabase Client Configuration Debug ===');
console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Present' : 'Missing', {
  length: supabaseUrl?.length,
  hasPrefixHttps: supabaseUrl?.startsWith('https://'),
  containsSpaces: supabaseUrl?.includes(' '),
  containsNewlines: supabaseUrl?.includes('\n')
});

console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing', {
  length: supabaseAnonKey?.length,
  startsWithEyJ: supabaseAnonKey?.startsWith('eyJ'),
  containsSpaces: supabaseAnonKey?.includes(' '),
  containsNewlines: supabaseAnonKey?.includes('\n')
});

// Validate URL and key
if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
  throw new Error('Invalid VITE_SUPABASE_URL format');
}

if (!supabaseAnonKey || !supabaseAnonKey.startsWith('eyJ')) {
  throw new Error('Invalid VITE_SUPABASE_ANON_KEY format');
}

// Special function to apply a fix for session persistence
function applySessionPersistenceFix() {
  const existingSessionStr = localStorage.getItem(STORAGE_KEY);
  if (!existingSessionStr) {
    return;
  }
  
  try {
    // Try to parse the stored session
    const existingSession = JSON.parse(existingSessionStr);
    
    // Check if the session is valid
    if (!existingSession || !existingSession.access_token) {
      console.warn('Invalid session format in localStorage, removing');
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    
    // Check if the session is expired
    const now = Math.floor(Date.now() / 1000);
    if (existingSession.expires_at && existingSession.expires_at < now) {
      console.warn('Expired session found in localStorage, but keeping for potential refresh');
    }
    
    // On page unload, re-save the session to ensure it's not lost
    window.addEventListener('beforeunload', () => {
      const currentSession = localStorage.getItem(STORAGE_KEY);
      if (currentSession) {
        sessionStorage.setItem('temp_' + STORAGE_KEY, currentSession);
      }
    });
    
    // On page load, restore from session storage if needed
    const tempSession = sessionStorage.getItem('temp_' + STORAGE_KEY);
    if (tempSession) {
      localStorage.setItem(STORAGE_KEY, tempSession);
      sessionStorage.removeItem('temp_' + STORAGE_KEY);
    }
    
  } catch (error) {
    console.error('Error applying session persistence fix:', error);
  }
}

// Apply the fix immediately
applySessionPersistenceFix();

// Check for existing session before creating client
const existingSessionStr = localStorage.getItem(STORAGE_KEY);
if (existingSessionStr) {
  try {
    const existingSession = JSON.parse(existingSessionStr);
    // Only log session details if in development mode
    if (import.meta.env.DEV) {
      console.log('Found existing session in localStorage:', {
        hasAccessToken: !!existingSession.access_token,
        expiresAt: existingSession.expires_at ? new Date(existingSession.expires_at * 1000).toLocaleString() : 'unknown',
        hasRefreshToken: !!existingSession.refresh_token,
        userId: existingSession.user?.id
      });
    }
  } catch (error) {
    console.error('Error parsing existing session:', error);
  }
} else {
  console.log('No existing session found in localStorage');
}

// Custom storage implementation to ensure proper session handling
const customStorage = {
  getItem: (key: string): string | null => {
    try {
      console.log(`Getting item from storage: ${key}`);
      const item = localStorage.getItem(key);
      if (!item) {
        console.log(`No item found in storage for key: ${key}`);
        return null;
      }
      
      try {
        // Log the session info for debugging
        const session = JSON.parse(item);
        console.log(`Retrieved session from storage:`, {
          hasAccessToken: !!session.access_token,
          expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'unknown',
          hasRefreshToken: !!session.refresh_token
        });
        
        return item;
      } catch (parseError) {
        console.error('Error parsing session from storage:', parseError);
        return item; // Return the raw item if parsing fails
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return null;
    }
  },
  
  setItem: (key: string, value: string): void => {
    try {
      console.log(`Setting item in storage: ${key}`);
      try {
        // Log the session info for debugging
        const session = JSON.parse(value);
        console.log(`Storing session in storage:`, {
          hasAccessToken: !!session.access_token,
          expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'unknown',
          hasRefreshToken: !!session.refresh_token
        });
      } catch (parseError) {
        // Just for logging, don't throw
        console.error('Error parsing session for logging:', parseError);
      }
      
      localStorage.setItem(key, value);
      
      // Store a backup in sessionStorage
      try {
        sessionStorage.setItem('backup_' + key, value);
      } catch (e) {
        // Ignore sessionStorage errors
      }
    } catch (error) {
      console.error('Error setting item in storage:', error);
    }
  },
  
  removeItem: (key: string): void => {
    try {
      console.log(`Removing item from storage: ${key}`);
      localStorage.removeItem(key);
      try {
        sessionStorage.removeItem('backup_' + key);
        sessionStorage.removeItem('temp_' + key);
      } catch (e) {
        // Ignore sessionStorage errors
      }
    } catch (error) {
      console.error('Error removing item from storage:', error);
    }
  }
};

// Create the Supabase client with enhanced configuration
// Ensure we're using the correct URL and key
export const supabase = createClient(
  'https://vfsyjvjghftfebvxyjba.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmc3lqdmpnaGZ0ZmVidnh5amJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNTU3MjYsImV4cCI6MjA2NDYzMTcyNn0.td6SnbD51RuNG_tTuKSC7Jwcz_lUk1tcrcNTwC3OLxc',
  {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: STORAGE_KEY,
    storage: customStorage,
    flowType: 'pkce' // Use PKCE flow for better security and session handling
  }
});

// Initialize session on load - minimal logging version
supabase.auth.getSession().then(({ data: { session }, error }) => {
  if (error && import.meta.env.DEV) {
    console.error('Error getting initial session:', error);
    return;
  }
  
  if (session) {
    // Only log in development mode
    if (import.meta.env.DEV) {
      console.log('Initial session loaded successfully');
    }
    
    // Always save to localStorage to ensure persistence
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    
    // Set up refresh before expiry
    if (session.expires_at) {
      const expiresAt = session.expires_at * 1000;
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
      
      if (timeUntilExpiry > 0) {
        // Refresh 5 minutes before expiry or halfway to expiry for short-lived tokens
        const refreshTime = Math.min(timeUntilExpiry - 5 * 60 * 1000, timeUntilExpiry / 2);
        if (refreshTime > 0) {
          setTimeout(() => {
            supabase.auth.refreshSession().then(({ data, error }) => {
              if (error && import.meta.env.DEV) {
                console.error('Scheduled refresh failed:', error);
              } else if (data.session) {
                // Save directly to localStorage
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data.session));
              }
            });
          }, refreshTime);
        }
      }
    }
  } else {
    console.log('No active session found');
    
    // As a fallback, check localStorage directly
    const storedSession = localStorage.getItem(STORAGE_KEY);
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        if (parsedSession && parsedSession.access_token) {
          console.log('Found session in localStorage but not in Supabase, attempting to restore');
          // Let AuthContext handle this situation
        }
      } catch (e) {
        console.error('Error parsing stored session during fallback check:', e);
      }
    }
  }
});

// Listen for auth events
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session ? {
    userId: session.user?.id,
    expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'unknown'
  } : 'No session');
  
  // Verify the session was stored in localStorage
  if (session) {
    setTimeout(() => {
      const storedSession = localStorage.getItem(STORAGE_KEY);
      if (!storedSession) {
        console.error('Session not found in localStorage after auth state change!');
      } else {
        console.log('Session correctly stored in localStorage');
      }
    }, 100);
  }
});

// Helper function to check Supabase connection
export const checkSupabaseConnection = async () => {
  try {
    // Run a simple query to test connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
      .single();

    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    // Don't show toast notifications on successful connection
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
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
