import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const sessionStr = localStorage.getItem('session');
      console.log('ProtectedRoute: checking session', sessionStr ? 'exists' : 'missing');
      
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        const now = new Date();
        const expiresAt = new Date(session.expires_at);
        const isExpired = expiresAt <= now;
        
        console.log('ProtectedRoute: session details', { 
          userId: session.user.id,
          expires: session.expires_at,
          isExpired,
          currentTime: now.toISOString()
        });
        
        if (!isExpired) {
          setIsAuthenticated(true);
        } else {
          // Session expired
          console.log('ProtectedRoute: session expired, removing');
          localStorage.removeItem('session');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    // Set up storage event listener for cross-tab synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'session') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (isAuthenticated === null) {
    // Still checking authentication
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page with the return url
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
} 