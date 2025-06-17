import { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ProtectedRouteProps {
  /**
   * If specified, the user must have at least one of these roles to access the route
   */
  roles?: string[];
  /**
   * If specified, the user must have all of these permissions to access the route
   */
  permissions?: string[];
  /**
   * The path to redirect to if the user is not authenticated
   * @default "/login"
   */
  redirectTo?: string;
  /**
   * The message to display when the user is not authorized
   */
  unauthorizedMessage?: string;
  /**
   * The element to render when the user is not authorized
   */
  unauthorizedElement?: React.ReactNode;
}

/**
 * A component that protects routes based on authentication and authorization
 * 
 * @example
 * // Basic usage - only authenticated users can access
 * <Route element={<ProtectedRoute />}>
 *   <Route path="/dashboard" element={<Dashboard />} />
 * </Route>
 * 
 * // With role-based access control
 * <Route element={<ProtectedRoute roles={['admin']} />}>
 *   <Route path="/admin" element={<AdminDashboard />} />
 * </Route>
 * 
 * // With custom unauthorized view
 * <Route 
 *   element={
 *     <ProtectedRoute 
 *       unauthorizedElement={
 *         <div className="p-4">
 *           <h1>Access Denied</h1>
 *           <p>You don't have permission to view this page.</p>
 *         </div>
 *       } 
 *     />
 *   }
 * >
 *   <Route path="/restricted" element={<RestrictedPage />} />
 * </Route>
 */
export function ProtectedRoute({
  roles = [],
  permissions = [],
  redirectTo = '/login',
  unauthorizedMessage = 'You do not have permission to access this page.',
  unauthorizedElement,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading) {
      // If no auth requirements, just check if user is authenticated
      if (roles.length === 0 && permissions.length === 0) {
        setIsAuthorized(isAuthenticated);
        return;
      }

      // Check roles if specified
      const hasRequiredRole = roles.length === 0 || (user?.role && roles.includes(user.role));

      // Check permissions if specified
      const hasRequiredPermissions = permissions.length === 0 || 
        (user?.permissions && permissions.every(p => user.permissions?.includes(p)));

      setIsAuthorized(hasRequiredRole && hasRequiredPermissions || false);
    }
  }, [isAuthenticated, loading, permissions, roles, user]);

  // Show loading state while checking auth
  if (loading || isAuthorized === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Show unauthorized view if user doesn't have required roles/permissions
  if (!isAuthorized) {
    if (unauthorizedElement) {
      return <>{unauthorizedElement}</>;
    }
    
    return (
      <div className="flex h-screen w-full items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
          <h2 className="mb-4 text-2xl font-bold">Access Denied</h2>
          <p className="mb-6 text-muted-foreground">{unauthorizedMessage}</p>
          <div className="flex justify-end">
            <button
              onClick={() => window.history.back()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and authorized
  return <Outlet />;
}
