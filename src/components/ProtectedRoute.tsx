import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, canManageUsers, canViewReports, canEditReports } = useAuth();
  const location = useLocation();

  console.log("ProtectedRoute:", {
    pathname: location.pathname,
    user: user?.email || user?.phone,
    userRole: user?.role,
    loading,
    requiredRole
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!user) {
    console.log("No user found, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based permissions
  if (requiredRole) {
    console.log("Checking role permissions:", { userRole: user.role, requiredRole });
    switch (requiredRole) {
      case 'admin':
        if (user.role !== 'admin') {
          console.log("User is not admin, redirecting to home");
          return <Navigate to="/" replace />;
        }
        break;
      case 'manager':
        if (!['admin', 'manager'].includes(user.role)) {
          console.log("User is not manager or admin, redirecting to home");
          return <Navigate to="/" replace />;
        }
        break;
      case 'data_collector':
        // All roles can access data collector features
        break;
    }
  }

  // Check feature-specific permissions
  if (location.pathname.startsWith('/admin/users') && !canManageUsers()) {
    console.log("User cannot manage users, redirecting to home");
    return <Navigate to="/" replace />;
  }

  if (location.pathname.startsWith('/reports/edit') && !canEditReports()) {
    console.log("User cannot edit reports, redirecting to reports");
    return <Navigate to="/reports" replace />;
  }

  if (location.pathname.startsWith('/reports') && !canViewReports()) {
    console.log("User cannot view reports, redirecting to home");
    return <Navigate to="/" replace />;
  }

  // Add dashboard access check
  if (location.pathname === '/dashboard') {
    if (user.role === 'data_collector') {
      console.log("Data collector cannot access dashboard, redirecting to home");
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
} 