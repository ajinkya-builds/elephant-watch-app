import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Create two clients - one for regular operations and one for admin operations
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
const adminClient = createClient(supabaseUrl || '', supabaseServiceKey || '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export type UserRole = 'admin' | 'manager' | 'data_collector';

export interface User {
  id: string;
  email_or_phone: string;
  role: UserRole;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (identifier: string, password: string, rememberMe: boolean) => Promise<User>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  canCreateUserWithRole: (role: UserRole) => boolean;
  canManageUsers: () => boolean;
  canViewReports: () => boolean;
  canEditReports: () => boolean;
  hasPermission: (permission: string) => boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Check for Supabase credentials
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      console.error('Missing Supabase credentials');
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Missing Supabase credentials. Please check your environment variables.'
      }));
      return;
    }

    // Check for existing session
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    if (userId) {
      (async () => {
        try {
          const { data: user, error } = await adminClient
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

          if (error || !user) {
            localStorage.removeItem('userId');
            sessionStorage.removeItem('userId');
            setState({ user: null, loading: false, error: null });
          } else {
            setState({ user: user as User, loading: false, error: null });
          }
        } catch (error) {
          console.error('Error fetching user:', error);
          setState(prev => ({
            ...prev,
            loading: false,
            error: 'Failed to fetch user data. Please try logging in again.'
          }));
        }
      })();
    } else {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const signIn = async (identifier: string, password: string, rememberMe: boolean) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Find user by email/phone using adminClient
      const { data: user, error: userError } = await adminClient
        .from('users')
        .select('*')
        .eq('email_or_phone', identifier)
        .single();

      if (userError) {
        console.error('User lookup error:', userError);
        throw new Error('Invalid email/phone or password');
      }

      if (!user) {
        throw new Error('Invalid email/phone or password');
      }

      // Check if user is active
      if (user.status !== 'active') {
        throw new Error('Account is inactive. Please contact administrator.');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid email/phone or password');
      }

      // Store user ID in storage based on remember me
      if (rememberMe) {
        localStorage.setItem('userId', user.id);
      } else {
        sessionStorage.setItem('userId', user.id);
      }

      // Log successful login using adminClient
      await adminClient.from('login_logs').insert({
        user_id: user.id,
        login_type: identifier.includes('@') ? 'email' : 'phone',
        user_agent: navigator.userAgent,
        ip_address: '127.0.0.1',
        status: 'success',
      }).single();

      setState({
        user: user as User,
        loading: false,
        error: null
      });

      return user;
    } catch (error: any) {
      console.error('Login error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'An error occurred during login'
      }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      localStorage.removeItem('userId');
      sessionStorage.removeItem('userId');
      setState({ user: null, loading: false, error: null });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'An error occurred during logout'
      }));
      throw error;
    }
  };

  const refreshUser = async () => {
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    if (userId) {
      const { data: user, error } = await adminClient
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && user) {
        setState({ user: user as User, loading: false, error: null });
      }
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

    const rolePermissions: Record<UserRole, string[]> = {
      admin: ['manage_users', 'view_reports', 'manage_settings'],
      manager: ['view_reports', 'manage_data_collectors'],
      data_collector: ['submit_data', 'view_own_data'],
    };

    return rolePermissions[state.user.role]?.includes(permission) || false;
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
        hasPermission,
        isLoading: state.loading,
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