import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User, Session } from '@supabase/supabase-js';
import { saveUserSession, getUserSession, clearUserSession, isAndroidApp } from '@/utils/offlineStorage';
import { useNetworkStatus } from '@/utils/networkStatus';

// Storage key constant for consistency
const STORAGE_KEY = 'sb-pauafmgoewfdhwnexzy-auth-token';

// Custom hook to directly read session from localStorage
function useLocalStorageSession() {
  const [localSession, setLocalSession] = useState<Session | null>(null);
  const isOnline = useNetworkStatus();
  
  useEffect(() => {
    // Initial load from localStorage
    const loadSessionFromStorage = async () => {
      try {
        // First try localStorage
        const sessionStr = localStorage.getItem(STORAGE_KEY);
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          if (session && session.access_token) {
            console.log('Direct localStorage session found:', {
              userId: session.user?.id,
              expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'unknown'
            });
            setLocalSession(session);
            return session;
          }
        }

        // If no localStorage session and we're in Android app, try Android storage
        if (isAndroidApp()) {
          const androidSession = await getUserSession();
          if (androidSession) {
            console.log('Android storage session found');
            setLocalSession(androidSession);
            return androidSession;
          }
        }

        return null;
      } catch (e) {
        console.error('Error reading session from storage:', e);
        return null;
      }
    };
    
    // Load on mount
    loadSessionFromStorage();
    
    // Set up localStorage event listener for changes across tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        if (event.newValue) {
          try {
            const session = JSON.parse(event.newValue);
            setLocalSession(session);
          } catch (e) {
            console.error('Error parsing session from storage event:', e);
          }
        } else {
          setLocalSession(null);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  return localSession;
}

export type UserRole = 'admin' | 'manager' | 'data_collector';

export interface ExtendedUser {
  id: string;
  auth_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  position: 'Ranger' | 'DFO' | 'Officer' | 'Guard';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export type AuthContextType = {
  user: ExtendedUser | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  signIn: (identifier: string, password: string, rememberMe?: boolean) => Promise<ExtendedUser>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  canCreateUserWithRole: (role: UserRole) => boolean;
  canManageUsers: () => boolean;
  canViewReports: () => boolean;
  canEditReports: () => boolean;
  hasPermission: (permission: string) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const localSession = useLocalStorageSession();
  const isOnline = useNetworkStatus();
  const mounted = React.useRef(true);
  
  const [state, setState] = useState<{
    user: ExtendedUser | null;
    session: Session | null;
    loading: boolean;
    error: string | null;
    initialized: boolean;
  }>({
    user: null,
    session: null,
    loading: true,
    error: null,
    initialized: false
  });

  // Define processSession before it's used
  const processSession = async (session: Session | null) => {
    if (!mounted.current) return;

    if (session) {
      console.log(`Processing session for user ID: ${session.user?.id}`);

      // Save session to all available storage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      if (isAndroidApp()) {
        await saveUserSession(session);
      }
      
      // Update state with session immediately
      setState(prev => ({
        ...prev,
        session,
        loading: true,
        initialized: true
      }));

      // Only try to fetch user profile if we're online
      if (isOnline) {
        try {
          const userId = session.user?.id;
          if (userId) {
            const profile = await fetchUserProfile(userId);
            if (mounted.current && profile) {
              setState(prev => ({
                ...prev,
                user: profile,
                loading: false,
                error: null
              }));
            }
          }
        } catch (error: any) {
          console.error('Error fetching profile:', error);
          // Don't set error state if we're offline
          if (isOnline && mounted.current) {
            setState(prev => ({
              ...prev,
              loading: false,
              error: error.message
            }));
          }
        }
      } else {
        // If offline, just use the session without profile
        setState(prev => ({
          ...prev,
          loading: false,
          error: null
        }));
      }
    } else {
      setState(prev => ({
        ...prev,
        session: null,
        user: null,
        loading: false,
        initialized: true
      }));
    }
  };

  // Effect to initialize session
  useEffect(() => {
    const initializeSession = async () => {
      if (!state.initialized) {
        if (isOnline) {
          // Try to get session from Supabase if online
          const { data: { session: supabaseSession } } = await supabase.auth.getSession();
          if (supabaseSession) {
            await processSession(supabaseSession);
            return;
          }
        }

        // If no Supabase session or offline, use local session
        if (localSession) {
          await processSession(localSession);
        } else {
          setState(prev => ({
            ...prev,
            loading: false,
            initialized: true
          }));
        }
      }
    };

    initializeSession();
  }, [state.initialized, localSession, isOnline]);

  // Function to refresh the session
  const refreshSession = async () => {
    try {
      console.log('Manually refreshing session...');
      const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      if (refreshedSession) {
        console.log('Session refreshed successfully, new expiry:', new Date(refreshedSession.expires_at! * 1000).toLocaleString());
        
        // Always save to localStorage directly
        localStorage.setItem(STORAGE_KEY, JSON.stringify(refreshedSession));
        
        return refreshedSession;
      }
      return null;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return null;
    }
  };

  // Function to fetch user profile with retry
  const fetchUserProfile = async (authId: string, retryCount = 0): Promise<ExtendedUser | null> => {
    try {
      // Always look up the user by auth_id
      let { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .single();
      if (error || !profile) {
        return null;
      }
      return profile as ExtendedUser;
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const refreshUser = async () => {
    try {
      // Try to get session from state or localStorage
      const effectiveSession = state.session || localSession;
      if (!effectiveSession?.user?.id) {
        setState(prev => ({ ...prev, loading: false, initialized: true }));
        return;
      }
      // Always use auth_id to look up the user
      const profile = await fetchUserProfile(effectiveSession.user.id);
      if (profile) {
        setState(prev => ({
          ...prev,
          user: profile,
          session: effectiveSession,  // Ensure session is set
          loading: false,
          error: null,
          initialized: true
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to fetch user profile',
          initialized: true
        }));
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
        initialized: true
      }));
    }
  };

  // Use a ref to track if we're handling initialization
  const handlingInitializationRef = React.useRef(false);

  useEffect(() => {
    // Set mounted to true on mount
    mounted.current = true;
    
    let refreshTimeout: NodeJS.Timeout;
    let userRefreshTimeout: NodeJS.Timeout;

    // Force session persistence check
    const checkSessionPersistence = () => {
      try {
        const storedSession = localStorage.getItem(STORAGE_KEY);
        
        if (storedSession) {
          try {
            const sessionData = JSON.parse(storedSession);
            console.log('Session persistence check - Session found in localStorage:', {
              hasAccessToken: !!sessionData.access_token,
              expiresAt: sessionData.expires_at ? new Date(sessionData.expires_at * 1000).toLocaleString() : 'unknown',
              userId: sessionData.user?.id
            });
          } catch (e) {
            console.error('Error parsing stored session:', e);
          }
        } else {
          console.warn('No session found in localStorage during persistence check');
        }
      } catch (error) {
        console.error('Error checking session persistence:', error);
      }
    };

    const initializeAuth = async () => {
      // Prevent multiple initializations
      if (handlingInitializationRef.current) {
        console.log('Already handling initialization, skipping');
        return;
      }
      
      handlingInitializationRef.current = true;
      
      try {
        console.log("Starting enhanced initializeAuth...");
        
        // Force check session persistence 
        checkSessionPersistence();

        // First check localStorage directly
        const storedSessionStr = localStorage.getItem(STORAGE_KEY);
        if (storedSessionStr) {
          try {
            const storedSession = JSON.parse(storedSessionStr);
            console.log('Found valid session in localStorage, using it directly');
            await processSession(storedSession);
            return;
          } catch (e) {
            console.error('Error parsing stored session, falling back to Supabase:', e);
          }
        }

        // Try to get session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          if (mounted.current) {
            setState(prev => ({ ...prev, loading: false, error: error.message, initialized: true }));
          }
          return;
        }

        // If we have a session, use it
        if (session) {
          console.log('Got session from Supabase, user ID:', session.user?.id);
          
          // Always save to localStorage
          localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
          
          // Check if the session is expired
          const expiresAt = session.expires_at;
          const now = Math.floor(Date.now() / 1000);
          
          if (expiresAt && expiresAt < now) {
            console.log('Session expired, attempting to refresh...');
            const refreshedSession = await refreshSession();
            
            if (refreshedSession) {
              // Process the refreshed session
              await processSession(refreshedSession);
            } else {
              if (mounted.current) {
                setState(prev => ({ ...prev, loading: false, initialized: true }));
              }
            }
          } else {
            console.log('Session valid, expires at:', expiresAt ? new Date(expiresAt * 1000).toLocaleString() : 'unknown');
            
            // Process the valid session
            await processSession(session);
          }
        } else {
          console.log('No active session found during initialization');
          if (mounted.current) {
            setState(prev => ({ ...prev, loading: false, initialized: true }));
          }
        }
      } catch (error: any) {
        console.error('Error in initializeAuth:', error);
        if (mounted.current) {
          setState(prev => ({ ...prev, loading: false, error: error.message, initialized: true }));
        }
      } finally {
        handlingInitializationRef.current = false;
      }
    };

    // Set up Supabase auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id, 'initialized:', state.initialized);
        
        if (event === 'INITIAL_SESSION') {
          console.log('Processing INITIAL_SESSION event');
          // Call our initialization function
          await initializeAuth();
          return;
        }

        // For other events, handle normally
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (mounted.current) {
            // Make sure session is saved to localStorage
            if (session) {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
              console.log('Session saved to localStorage after', event);
              
              // Process the session
              await processSession(session);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted.current) {
            // Clear localStorage
            localStorage.removeItem(STORAGE_KEY);
            console.log('Session removed from localStorage after SIGNED_OUT');
            
            setState({ user: null, session: null, loading: false, error: null, initialized: true });
          }
        } else if (event === 'USER_UPDATED') {
          if (mounted.current && session) {
            // Make sure session is saved to localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
            console.log('Session saved to localStorage after USER_UPDATED');
            
            await processSession(session);
          }
        }
      }
    );

    // IMPORTANT: Immediately check if we already have a session in localStorage
    const immediateSession = localStorage.getItem(STORAGE_KEY);
    if (immediateSession) {
      console.log('Found session in localStorage on initial mount');
      try {
        const parsedSession = JSON.parse(immediateSession);
        if (parsedSession && parsedSession.access_token) {
          processSession(parsedSession);
        }
      } catch (e) {
        console.error('Error parsing immediate session:', e);
      }
    } else {
      // No session in localStorage, initialize auth
      initializeAuth();
    }

    // Set up periodic session refresh
    const setupRefreshInterval = () => {
      // Use either state session or localStorage session
      const effectiveSession = state.session || localSession;
      
      if (effectiveSession) {
        const expiresAt = effectiveSession.expires_at;
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = expiresAt ? expiresAt - now : 0;
        
        if (timeUntilExpiry <= 0) {
          console.log('Session already expired, refreshing immediately');
          refreshSession().then(refreshedSession => {
            if (refreshedSession && mounted.current) {
              // Make sure session is saved to localStorage
              localStorage.setItem(STORAGE_KEY, JSON.stringify(refreshedSession));
              
              setState(prev => ({ ...prev, session: refreshedSession }));
              setupRefreshInterval(); // Setup next refresh
            }
          });
          return;
        }
        
        // Refresh 5 minutes before expiry
        const refreshTime = Math.max(0, (timeUntilExpiry - 300) * 1000);
        console.log(`Setting up session refresh in ${Math.round(refreshTime / 60000)} minutes`);
        
        refreshTimeout = setTimeout(async () => {
          const refreshedSession = await refreshSession();
          if (refreshedSession && mounted.current) {
            // Make sure session is saved to localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(refreshedSession));
            
            setState(prev => ({ ...prev, session: refreshedSession }));
            setupRefreshInterval(); // Setup next refresh
          }
        }, refreshTime);
      }
    };

    setupRefreshInterval();

    return () => {
      // Set mounted to false on unmount
      mounted.current = false;
      subscription.unsubscribe();
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      if (userRefreshTimeout) {
        clearTimeout(userRefreshTimeout);
      }
    };
  }, []); // Removed dependencies to prevent loops

  const signIn = async (identifier: string, password: string, rememberMe: boolean = false) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const isEmail = identifier.includes('@');
      
      console.log('Attempting authentication with:', {
        type: isEmail ? 'email' : 'phone',
        identifier: isEmail ? identifier : '******'
      });

      const credentials = isEmail 
        ? { email: identifier, password }
        : { phone: identifier, password };

      const { data, error } = await supabase.auth.signInWithPassword({
        ...credentials,
        options: {
          persistSession: true
        }
      });

      if (error) throw error;

      if (!data.user || !data.session) {
        throw new Error('No user data received after authentication');
      }

      // Save session to Android storage if available
      if (isAndroidApp()) {
        await saveUserSession(data.session);
      }

      const profile = await fetchUserProfile(data.user.id);
      
      setState(prev => ({
        ...prev,
        user: profile,
        session: data.session,
        loading: false,
        error: null,
        initialized: true
      }));

      return profile;
    } catch (error: any) {
      console.error('Login error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Clear Android storage if available
      if (isAndroidApp()) {
        await clearUserSession();
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setState({
        user: null,
        session: null,
        loading: false,
        error: null,
        initialized: true
      });
      
      console.log('Sign-out completed successfully');
    } catch (error: any) {
      console.error('Sign-out error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
      throw error;
    }
  };

  const canCreateUserWithRole = (role: UserRole): boolean => {
    if (!state.user) return false;
    
    switch (state.user.role) {
      case 'admin':
        return true; // Admin can create any role
      case 'manager':
        return role === 'data_collector'; // Manager can only create data collectors
      default:
        return false; // Data collectors cannot create users
    }
  };

  const canManageUsers = (): boolean => {
    if (!state.user) return false;
    return ['admin', 'manager'].includes(state.user.role);
  };

  const canViewReports = (): boolean => {
    if (!state.user) return false;
    return true; // All roles can view reports
  };

  const canEditReports = (): boolean => {
    if (!state.user) return false;
    return ['admin', 'manager'].includes(state.user.role);
  };

  const hasPermission = (permission: string): boolean => {
    if (!state.user) return false;
    
    // Add your permission logic here
    switch (permission) {
      case 'create_user':
        return canManageUsers();
      case 'edit_reports':
        return canEditReports();
      case 'view_reports':
        return canViewReports();
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signOut,
        refreshUser,
        canCreateUserWithRole,
        canManageUsers,
        canViewReports,
        canEditReports,
        hasPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 