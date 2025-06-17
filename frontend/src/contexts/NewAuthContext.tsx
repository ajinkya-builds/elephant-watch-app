import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
  useRef,
} from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useNetworkStatus } from '@/utils/networkStatus';
import { FullPageLoader } from '@/components/ui/FullPageLoader';

// Storage key for session persistence
const STORAGE_KEY = 'sb-vfsyjvjghftfebvxyjba-auth-token';

// User roles
export type UserRole = 'admin' | 'manager' | 'data_collector' | 'viewer';

// User positions
export type UserPosition = 'Ranger' | 'DFO' | 'Officer' | 'Guard' | 'Manager' | 'Admin';

// Permission types
export type Permission = 
  | 'view_dashboard'
  | 'manage_users'
  | 'view_reports'
  | 'create_reports'
  | 'edit_reports'
  | 'delete_reports'
  | 'view_admin_panel'
  | 'manage_settings';

// User metadata stored in auth.users
export interface UserMetadata {
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  position?: UserPosition;
  avatar_url?: string;
  [key: string]: any;
}

export interface ExtendedUser {
  id: string;
  auth_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  position: UserPosition;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  avatar_url: string;
  metadata: Record<string, any>;
  permissions?: string[];
}

// Auth state type
type AuthState = {
  user: ExtendedUser | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
};

// Initial auth state
const initialState: AuthState = {
  user: null,
  session: null,
  loading: true,
  error: null,
  initialized: false,
};

// Authentication context type
export interface AuthContextType extends AuthState {
  // Authentication methods
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ 
    user: ExtendedUser | null; 
    error: Error | null 
  }>;
  signOut: () => Promise<{ error: Error | null }>;
  refreshUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  
  // Permission checks
  canCreateUserWithRole: (role: UserRole) => boolean;
  canManageUsers: () => boolean;
  canViewReports: () => boolean;
  canEditReports: () => boolean;
  hasPermission: (permission: Permission) => boolean;
  
  // Navigation
  setNavigation: (nav: (to: string) => void) => void;
  navigate: (to: string) => void;
  
  // Convenience methods
  isAdmin: boolean;
  
  // Auth state
  initialized: boolean;
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  ...initialState,
  signIn: async () => ({ user: null, error: new Error('AuthContext not initialized') }),
  signOut: async () => ({ error: new Error('AuthContext not initialized') }),
  refreshUser: async () => {},
  resetPassword: async () => ({ error: new Error('AuthContext not initialized') }),
  updatePassword: async () => ({ error: new Error('AuthContext not initialized') }),
  canCreateUserWithRole: () => false,
  canManageUsers: () => false,
  canViewReports: () => false,
  canEditReports: () => false,
  hasPermission: () => false,
  setNavigation: () => {},
  navigate: () => console.warn('Navigation not initialized'),
  isAdmin: false,
  initialized: false,
});

// Fetch user profile from auth.users and public.users
const fetchUserProfile = async (
  userId: string
): Promise<ExtendedUser | null> => {
  try {
    // Get user data from auth.users
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!authUser) return null;

    // Try to fetch from public.users using auth_id
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authUser.id)
      .single();

    if (dbError && dbError.code !== 'PGRST116') { // PGRST116: No rows found
      console.error('Error fetching user from public.users:', dbError);
    }

    // Use DB user if found, otherwise fallback to auth user
    const user: ExtendedUser = dbUser
      ? {
          id: String(dbUser.id),
          auth_id: String(dbUser.auth_id),
          first_name: dbUser.first_name || authUser.user_metadata?.first_name || '',
          last_name: dbUser.last_name || authUser.user_metadata?.last_name || '',
          email: typeof dbUser.email === 'string' ? dbUser.email : (typeof authUser.email === 'string' ? authUser.email : null),
          phone: typeof dbUser.phone === 'string' ? dbUser.phone : (typeof authUser.phone === 'string' ? authUser.phone : null),
          role: (dbUser.role as UserRole) || (authUser.user_metadata?.role as UserRole) || 'viewer',
          position: (dbUser.position as UserPosition) || (authUser.user_metadata?.position as UserPosition) || 'field_agent',
          status: (dbUser.status === 'active' || dbUser.status === 'inactive' || dbUser.status === 'pending') ? dbUser.status : 'active',
          created_at: dbUser.created_at ? String(dbUser.created_at) : (authUser.created_at ? String(authUser.created_at) : new Date().toISOString()),
          updated_at: dbUser.updated_at ? String(dbUser.updated_at) : (authUser.updated_at ? String(authUser.updated_at) : new Date().toISOString()),
          last_login_at: dbUser.last_login_at ? String(dbUser.last_login_at) : (authUser.last_sign_in_at ? String(authUser.last_sign_in_at) : null),
          avatar_url: dbUser.avatar_url || authUser.user_metadata?.avatar_url || '',
          metadata: {
            ...(typeof dbUser.metadata === 'object' && dbUser.metadata ? dbUser.metadata : {}),
            ...(authUser.user_metadata || {})
          },
          permissions: Array.isArray(dbUser.permissions) ? dbUser.permissions : undefined,
        }
      : {
          id: authUser.id,
          auth_id: authUser.id,
          first_name: authUser.user_metadata?.first_name || '',
          last_name: authUser.user_metadata?.last_name || '',
          email: typeof authUser.email === 'string' ? authUser.email : null,
          phone: typeof authUser.phone === 'string' ? authUser.phone : null,
          role: (authUser.user_metadata?.role as UserRole) || 'viewer',
          position: (authUser.user_metadata?.position as UserPosition) || 'field_agent',
          status: 'active',
          created_at: authUser.created_at ? String(authUser.created_at) : new Date().toISOString(),
          updated_at: authUser.updated_at ? String(authUser.updated_at) : new Date().toISOString(),
          last_login_at: authUser.last_sign_in_at ? authUser.last_sign_in_at : null,
          avatar_url: authUser.user_metadata?.avatar_url || '',
          metadata: authUser.user_metadata || {},
          permissions: Array.isArray(authUser.user_metadata?.permissions) ? authUser.user_metadata?.permissions : undefined,
        };

    return user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const [navigate, setNavigate] = useState<((to: string) => void) | null>(() => {
    return (to: string) => {
      console.warn('Navigation not yet initialized. Attempted to navigate to:', to);
    };
  });

  useEffect(() => {
    let isMounted = true;
    console.log("AuthProvider: Running initialization effect.");

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        
        console.log("AuthProvider: Initial getSession resolved.");
        const userProfile = session?.user ? await fetchUserProfile(session.user.id) : null;
        
        if (isMounted) {
          console.log("AuthProvider: Initialization complete. Setting initialized = true.");
          setState({
            user: userProfile,
            session,
            initialized: true,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        if (isMounted) {
          console.error("AuthProvider: Initialization failed.", error);
          setState({
            user: null, 
            session: null, 
            initialized: true, 
            loading: false,
            error: error instanceof Error ? error.message : "Initialization failed."
          });
        }
      }
    };

    initializeAuth();
      
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!state.initialized) {
      console.log("AuthProvider: Skipping auth state change listener until initialized.");
      return;
    }
    
    let isMounted = true;
    console.log("AuthProvider: Setting up auth state change listener.");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        console.log(`AuthProvider: Auth event received - ${event}`);
        
        try {
          const userProfile = session?.user ? await fetchUserProfile(session.user.id) : null;
          if (isMounted) {
            setState(prevState => ({ 
              ...prevState, 
              user: userProfile, 
              session, 
              error: null,
              loading: false 
            }));
          }
        } catch (error) {
          if (isMounted) {
            console.error("AuthProvider: Error handling auth state change:", error);
            setState(prevState => ({
              ...prevState,
              error: error instanceof Error ? error.message : "Failed to handle auth state change",
              loading: false
            }));
          }
        }
      }
    );

    return () => {
      isMounted = false;
      console.log("AuthProvider: Unsubscribing from auth state changes.");
      subscription?.unsubscribe();
    };
  }, [state.initialized]);

  const setNavigation = useCallback((nav: (to: string) => void) => {
    setNavigate(() => nav);
    return () => {
      setNavigate(null);
    };
  }, []);

  // Handle sign in
  const handleSignIn = useCallback(async (
    identifier: string, 
    password: string, 
    rememberMe: boolean = false
  ) => {
    try {
      setState((prev: AuthState) => ({ ...prev, loading: true, error: null }));

      // Check if identifier is email or phone
      const isEmail = identifier.includes('@');
      
      // Sign in with email/password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier,
        password,
      });
      
      if (error) throw error;
      if (!data.session) throw new Error('No session returned');
      
      // Get the user profile
      const user = await fetchUserProfile(data.user.id);
      
      // Update state with the new session and user
      setState((prev: AuthState) => ({
        ...prev,
        user,
        session: data.session,
        loading: false,
        error: null,
      }));
      
      return { 
        user,
        error: null 
      };
    } catch (error) {
      console.error('Sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      setState((prev: AuthState) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { 
        user: null, 
        error: error instanceof Error ? error : new Error(errorMessage) 
      };
    }
  }, [setState]);

  // Handle sign out
  const handleSignOut = useCallback(async () => {
    try {
      setState((prev: AuthState) => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setState((prev: AuthState) => ({
        ...prev,
        user: null,
        session: null,
        loading: false,
      }));
      
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
      setState((prev: AuthState) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { 
        error: error instanceof Error ? error : new Error(errorMessage) 
      };
    }
  }, []);

  // Handle password reset
  const handleResetPassword = useCallback(async (email: string) => {
    try {
      setState((prev: AuthState) => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      setState((prev: AuthState) => ({
        ...prev,
        loading: false,
        error: null,
      }));
      
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
      setState((prev: AuthState) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { 
        error: error instanceof Error ? error : new Error(errorMessage) 
      };
    }
  }, []);

  // Handle password update
  const handleUpdatePassword = useCallback(async (newPassword: string) => {
    try {
      setState((prev: AuthState) => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      setState((prev: AuthState) => ({
        ...prev,
        loading: false,
        error: null,
      }));
      
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update password';
      setState((prev: AuthState) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { 
        error: error instanceof Error ? error : new Error(errorMessage) 
      };
    }
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      if (!user) return;
      
      const userProfile = await fetchUserProfile(user.id);
      if (userProfile) {
        setState(prevState => ({ ...prevState, user: userProfile }));
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      throw error;
    }
  }, [setState]);

  // Permission checks
  const isAdmin = useMemo(() => state.user?.role === 'admin', [state.user]);
  const isManager = useMemo(() => state.user?.role === 'manager', [state.user]);
  const isDataCollector = useMemo(() => state.user?.role === 'data_collector', [state.user]);
  const isViewer = useMemo(() => state.user?.role === 'viewer', [state.user]);

  const canCreateUserWithRole = useCallback((role: UserRole): boolean => {
    if (!state.user) return false;
    
    switch (state.user.role) {
      case 'admin':
        return true;
      case 'manager':
        return ['data_collector', 'viewer'].includes(role);
      default:
        return false;
    }
  }, [state.user]);

  const canManageUsers = useCallback((): boolean => {
    return isAdmin || isManager;
  }, [isAdmin, isManager]);

  const canViewReports = useCallback((): boolean => {
    return !!state.user;
  }, [state.user]);

  const canEditReports = useCallback((): boolean => {
    return isAdmin || isDataCollector;
  }, [isAdmin, isDataCollector]);

  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!state.user) return false;
    
    switch (permission) {
      case 'manage_users':
        return canManageUsers();
      case 'view_reports':
        return canViewReports();
      case 'edit_reports':
        return canEditReports();
      default:
        return false;
    }
  }, [state.user, canManageUsers, canViewReports, canEditReports]);

  // Context value
  const contextValue = useMemo<AuthContextType>(() => ({
    ...state,
    signIn: handleSignIn,
    signOut: handleSignOut,
    refreshUser,
    resetPassword: handleResetPassword,
    updatePassword: handleUpdatePassword,
    canCreateUserWithRole,
    canManageUsers,
    canViewReports,
    canEditReports,
    hasPermission,
    setNavigation,
    navigate: (to: string) => {
      if (navigate) {
        navigate(to);
      } else {
        console.warn('Navigation not initialized');
      }
    },
    isAdmin: state.user?.role === 'admin',
    initialized: state.initialized,
  }), [
    state,
    handleSignIn,
    handleSignOut,
    refreshUser,
    handleResetPassword,
    handleUpdatePassword,
    canCreateUserWithRole,
    canManageUsers,
    canViewReports,
    canEditReports,
    hasPermission,
    navigate,
  ]);

  if (!state.initialized) {
    return <FullPageLoader message="Initializing authentication..." />;
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
