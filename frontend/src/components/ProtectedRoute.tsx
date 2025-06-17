import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/NewAuthContext';
import { UserRole } from '@/types/auth';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { FullPageLoader } from '@/components/ui/FullPageLoader';

// Storage key constant for consistency
const STORAGE_KEY = 'sb-vfsyjvjghftfebvxyjba-auth-token';

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

export const ProtectedRoute: React.FC = () => {
  const { user, initialized } = useAuth();
  const location = useLocation();

  if (!initialized) {
    // While the auth state is being determined, show a full-page loading indicator.
    return <FullPageLoader message="Initializing session..." />;
  }

  if (!user) {
    // If initialization is complete and there's no user, redirect to login.
    // Pass the original location in state so we can redirect back after login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If initialization is complete and a user exists, render the child routes.
  return <Outlet />;
};