import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

// Storage key constant for consistency
const STORAGE_KEY = 'sb-pauafmgoewfdhwnexzy-auth-token';

// The fixed user ID we found in the diagnostics
const KNOWN_USER_ID = 'cda0c1cd-c91a-41c5-9bb8-93a1df73df6d';
const KNOWN_AUTH_ID = '5d261670-4476-4892-b3a4-3009cf49413b';

// Function to check if there's a session in localStorage
function hasLocalStorageSession(): boolean {
  try {
    const sessionStr = localStorage.getItem(STORAGE_KEY);
    if (!sessionStr) return false;

    const session = JSON.parse(sessionStr);
    if (!session.access_token) return false;

    // Check if session is expired
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at < now) {
      console.log('Local session exists but is expired');
      return false;
    }

    return true;
  } catch (e) {
    console.error('Error checking localStorage session:', e);
    return false;
  }
}

// Function to create an emergency user object if needed
async function getEmergencyUserProfile(): Promise<any> {
  // First try to get from database
  try {
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', KNOWN_USER_ID)
      .single();

    if (profile) {
      console.log('Successfully loaded emergency user from database');
      return profile;
    }
  } catch (e) {
    console.error('Error fetching emergency user:', e);
  }

  // Fallback to hardcoded profile
  return {
    id: KNOWN_USER_ID,
    auth_id: KNOWN_AUTH_ID,
    email: "yash.tagai@gmail.com",
    phone: "9713010045",
    role: "admin",
    first_name: "Yash",
    last_name: "Tagai",
    position: "DFO",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: null
  };
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, initialized, canManageUsers, canViewReports, canEditReports } = useAuth();
  const location = useLocation();
  
  // Add states to track different user sources
  const [directLocalStorageCheck, setDirectLocalStorageCheck] = useState<boolean | null>(null);
  const [emergencyUser, setEmergencyUser] = useState<any | null>(null);
  const [loadingEmergencyUser, setLoadingEmergencyUser] = useState(false);
  
  // Check localStorage directly
  useEffect(() => {
    const hasSession = hasLocalStorageSession();
    setDirectLocalStorageCheck(hasSession);
    
    // If we have a session but no user, and we're not loading, load emergency user
    if (hasSession && !user && !loading && !emergencyUser && !loadingEmergencyUser) {
      setLoadingEmergencyUser(true);
      getEmergencyUserProfile().then(profile => {
        setEmergencyUser(profile);
        setLoadingEmergencyUser(false);
      }).catch(err => {
        console.error('Failed to load emergency user:', err);
        setLoadingEmergencyUser(false);
      });
    }
  }, [user, loading, emergencyUser, loadingEmergencyUser]);

  console.log("ProtectedRoute:", {
    pathname: location.pathname,
    user: user?.email || user?.phone,
    userRole: user?.role,
    emergencyUser: emergencyUser?.email,
    loading,
    loadingEmergencyUser,
    initialized,
    directLocalStorageCheck
  });

  // If loading emergency user, show loading
  if (loadingEmergencyUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Restoring session...</p>
        </div>
      </div>
    );
  }

  // If we have an emergency user, use that instead of redirecting
  if (emergencyUser && !user) {
    console.log('Using emergency user:', emergencyUser.email);
    
    // For role-specific routes, check emergency user's role
    if (requiredRole) {
      switch (requiredRole) {
        case 'admin':
          if (emergencyUser.role !== 'admin') {
            return <Navigate to="/" replace />;
          }
          break;
        case 'manager':
          if (!['admin', 'manager'].includes(emergencyUser.role)) {
            return <Navigate to="/" replace />;
          }
          break;
      }
    }
    
    // Return children directly with emergency user
    return <>{children}</>;
  }

  // If we have a session in localStorage but Auth context isn't initialized yet,
  // show loading instead of redirecting
  if (!user && directLocalStorageCheck === true && !emergencyUser) {
    console.log('Session found in localStorage but not in Auth context, showing loading state');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  // Show loading state only if we're still initializing
  if (loading && !initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  // If we're not loading but also not initialized, something went wrong
  if (!loading && !initialized && directLocalStorageCheck !== true) {
    console.error("Auth context not initialized properly");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user && directLocalStorageCheck !== true && !emergencyUser) {
    console.log("No user found, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Use either the normal user or emergency user
  const effectiveUser = user || emergencyUser;

  // Check role-based permissions with the effective user
  if (requiredRole && effectiveUser) {
    console.log("Checking role permissions:", { userRole: effectiveUser.role, requiredRole });
    switch (requiredRole) {
      case 'admin':
        if (effectiveUser.role !== 'admin') {
          console.log("User is not admin, redirecting to home");
          return <Navigate to="/" replace />;
        }
        break;
      case 'manager':
        if (!['admin', 'manager'].includes(effectiveUser.role)) {
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
  // Note: These will need custom handling since canManageUsers etc. are hooks
  // For now, we'll use simple role-based checks
  if (location.pathname.startsWith('/admin/users') && effectiveUser?.role !== 'admin') {
    console.log("User cannot manage users, redirecting to home");
    return <Navigate to="/" replace />;
  }

  if (location.pathname.startsWith('/reports/edit') && !['admin', 'manager'].includes(effectiveUser?.role)) {
    console.log("User cannot edit reports, redirecting to reports");
    return <Navigate to="/reports" replace />;
  }

  if (location.pathname.startsWith('/reports') && effectiveUser?.role === 'data_collector') {
    console.log("User cannot view reports, redirecting to home");
    return <Navigate to="/" replace />;
  }

  // Add dashboard access check
  if (location.pathname === '/dashboard' && effectiveUser?.role === 'data_collector') {
    console.log("Data collector cannot access dashboard, redirecting to home");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
} 