import { useContext, useMemo } from 'react';
import type { UserRole, AuthContextType, ExtendedUser } from '@/contexts/NewAuthContext';
import AuthContext from '@/contexts/NewAuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

export function useAuth() {
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const {
    user,
    session,
    loading,
    error,
    signIn,
    signOut: contextSignOut,
    resetPassword,
    updatePassword,
    refreshUser,
    initialized,
  } = context;

  const isAuthenticated = useMemo(() => !!user && !!session, [user, session]);
  const isAdmin = useMemo(() => user?.role === 'admin', [user]);
  const hasRole = useMemo(() => (role: UserRole) => user?.role === role, [user]);
  const hasAnyRole = useMemo(() => (roles: UserRole[]) => user ? roles.includes(user.role) : false, [user]);
  const hasAllRoles = useMemo(() => (roles: UserRole[]) => user ? roles.every(role => user.role === role) : false, [user]);

  const signOut = async () => {
    try {
      await contextSignOut();
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const checkPermission = (permission: string) => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    // Implement permission logic based on user role
    switch (permission) {
      case 'view_dashboard':
        return ['admin', 'manager', 'data_collector', 'viewer'].includes(user.role);
      case 'manage_users':
        return ['admin', 'manager'].includes(user.role);
      case 'view_reports':
        return ['admin', 'manager', 'data_collector', 'viewer'].includes(user.role);
      case 'create_reports':
        return ['admin', 'manager', 'data_collector'].includes(user.role);
      case 'edit_reports':
        return ['admin', 'manager', 'data_collector'].includes(user.role);
      case 'delete_reports':
        return ['admin', 'manager'].includes(user.role);
      case 'view_admin_panel':
        return ['admin', 'manager'].includes(user.role);
      case 'manage_settings':
        return ['admin'].includes(user.role);
      default:
        return false;
    }
  };

  return {
    // State
    user,
    session,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    initialized,
    
    // Actions
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    refreshUser,
    
    // Role and permission checks
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasPermission: checkPermission,
    
    // Helpers
    canCreateUserWithRole: (role: UserRole) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      if (user.role === 'manager' && role !== 'admin') return true;
      return false;
    },
    canManageUsers: () => checkPermission('manage_users'),
    canViewReports: () => checkPermission('view_reports'),
    canEditReports: () => checkPermission('edit_reports'),
  };
}
