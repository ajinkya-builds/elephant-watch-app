import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User, Session } from '@supabase/supabase-js';

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
  const [state, setState] = useState<{
    user: ExtendedUser | null;
    session: Session | null;
    loading: boolean;
    error: string | null;
  }>({
    user: null,
    session: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Set up Supabase auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setState(prev => ({ ...prev, session, loading: true }));
          await refreshUser();
        } else if (event === 'SIGNED_OUT') {
          setState({ user: null, session: null, loading: false, error: null });
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setState(prev => ({ ...prev, session, loading: true }));
        refreshUser();
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshUser = async () => {
    try {
      if (!state.session?.user?.id) {
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', state.session.user.id)
        .single();

      if (error) throw error;

      setState(prev => ({
        ...prev,
        user: profile as ExtendedUser,
        loading: false,
        error: null
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  const signIn = async (identifier: string, password: string, rememberMe: boolean = false) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Determine if identifier is email or phone
      const isEmail = identifier.includes('@');
      
      // Log authentication attempt
      console.log('Attempting authentication with:', {
        type: isEmail ? 'email' : 'phone',
        identifier: isEmail ? identifier : '******' // Don't log phone numbers
      });

      const credentials = isEmail 
        ? { email: identifier, password }
        : { phone: identifier, password };

      const { data, error } = await supabase.auth.signInWithPassword(credentials);

      if (error) {
        console.error('Authentication error:', error);
        throw error;
      }

      if (!data.user || !data.session) {
        console.error('No user data received');
        throw new Error('No user data received after authentication');
      }

      console.log('Authentication successful, fetching user profile...');

      // Get the user profile using the correct columns
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${identifier},phone.eq.${identifier}`)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw profileError;
      }

      if (!profile) {
        console.error('No profile found for user');
        throw new Error('User profile not found');
      }

      console.log('User profile fetched successfully');

      setState(prev => ({
        ...prev,
        user: profile as ExtendedUser,
        session: data.session,
        loading: false,
        error: null
      }));

      return profile as ExtendedUser;

    } catch (error) {
      console.error('Login error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred during login'
      }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
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