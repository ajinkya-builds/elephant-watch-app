import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { Session, User } from '@supabase/supabase-js';
import { Profile } from '../types/supabase';
import { supabase } from '@/lib/supabaseClient';
import { Preferences } from '@capacitor/preferences';
import { useNetworkStatus } from '../utils/networkStatus';
import { getCurrentPosition, requestLocationPermission } from '../utils/locationService';
import { FullPageLoader } from '@/components/ui/FullPageLoader';


// Storage key for session persistence
const STORAGE_KEY = 'sb-vfsyjvjghftfebvxyjba-auth-token';

// Session expiration duration (30 days in milliseconds)
const SESSION_EXPIRATION = 30 * 24 * 60 * 60 * 1000; // 30 days

// User roles
export type UserRole = 'admin' | 'manager' | 'data_collector' | 'viewer';

// User positions
export type UserPosition = 'Ranger' | 'DFO' | 'Officer' | 'Guard' | 'Manager' | 'Admin';

// User status
export type UserStatus = 'active' | 'inactive' | 'pending';

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
  cached_at?: string; // Timestamp for cache management
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
};

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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const [navigate, setNavigate] = useState<((to: string) => void) | null>(() => {
    return (to: string) => {
      console.warn('Navigation not yet initialized. Attempted to navigate to:', to);
    };
  });
  const { isOnline } = useNetworkStatus();
  
  // Memoized fetchUserProfile to avoid re-renders - properly moved inside component

  // Function to create a timeout for any promise
  const promiseWithTimeout = async (promise: Promise<any>, timeoutMs: number, errorMessage: string) => {
    // Create a promise that rejects in <timeoutMs> milliseconds
    const timeoutPromise = new Promise((_, reject) => {
      const id = setTimeout(() => {
        clearTimeout(id);
        reject(new Error(`Timeout after ${timeoutMs}ms: ${errorMessage}`));
      }, timeoutMs);
    });
  
    // Returns a race between our timeout and the passed in promise
    return Promise.race([
      promise,
      timeoutPromise
    ]);
  };

  const fetchUserProfile = useCallback(async (userId: string): Promise<ExtendedUser | null> => {
    console.log("Checking Supabase connection (will continue offline if unavailable)...", userId);
    console.log("fetchUserProfile: Checking for cached user data first...");
    
    // No valid cached data, fetch from API
    console.log("fetchUserProfile: Calling supabase.auth.getUser()...");
    let supabaseUser: User | null = null;
    let profileData: Profile | null = null;

    try {
      // Use timeout to prevent indefinite hang
      let result;
      try {
        result = await promiseWithTimeout(
          supabase.auth.getUser(),
          10000, // 10 second timeout
          "supabase.auth.getUser() call timed out"
        );
      } catch (timeoutError) {
        console.error("fetchUserProfile: Timeout error:", timeoutError);
        throw new Error("Could not get authentication data: network request timed out");
      }
      
      const { data: { user }, error: userError } = result;
      supabaseUser = user;

      console.log("fetchUserProfile: supabase.auth.getUser() completed. User error:", userError, "User exists:", !!supabaseUser);
      console.log("DEBUG: supabaseUser object:", supabaseUser);

      if (userError) {
        console.error("fetchUserProfile: Error from supabase.auth.getUser():", userError);
        // If it's an AuthSessionMissingError, treat it as no user logged in
        if (userError.name === 'AuthSessionMissingError') {
          console.warn("fetchUserProfile: Auth session missing. Treating as no user logged in.");
          return null; // Return null to indicate no active user
        } else {
          throw userError; // Re-throw other unexpected errors
        }
      }
      if (!supabaseUser) {
        console.warn("fetchUserProfile: No user returned from supabase.auth.getUser(). Treating as no user logged in.");
        return null; // Return null to indicate no active user
      }

      // Fetch profile data with timeout
      let profileResult;
      try {
        // Convert PostgrestBuilder to Promise for TypeScript compatibility
        const fetchProfile = async () => {
          // Make sure supabaseUser exists before trying to use it
          if (!supabaseUser) {
            throw new Error("Cannot fetch profile: user is null");
          }
          
          return await supabase
            .from('users')
            .select(`id, first_name, last_name, email, phone, role, position`)
            .eq('auth_id', supabaseUser.id)
            .single();
        };
        
        profileResult = await promiseWithTimeout(
          fetchProfile(),
          10000, // 10 second timeout
          "Profile fetch from Supabase timed out"
        );
      } catch (timeoutError) {
        console.error("fetchUserProfile: Profile fetch timeout:", timeoutError);
        throw new Error("Could not get profile data: network request timed out");
      }
      
      const { data: profile, error: profileError } = profileResult;
      profileData = profile;

      console.log("DEBUG: Profile data from 'profiles' table:", profileData);
      console.log("DEBUG: Profile fetch error:", profileError);
      console.log("DEBUG: Role from profileData:", profileData?.role);

      if (profileError) {
        console.error("fetchUserProfile: Error fetching profile from 'profiles' table:", profileError);
        throw profileError;
      }

      if (!profileData) {
        console.warn("fetchUserProfile: No profile data found for user:", supabaseUser.id);
        throw new Error("No profile data found.");
      }

    } catch (error) {
      console.error("fetchUserProfile: An unexpected error occurred during user profile fetch:", error);
      throw error;
    }

    // Correctly construct ExtendedUser from supabaseUser and profileData
    const extendedUser = {
      id: supabaseUser.id,
      auth_id: supabaseUser.id,
      first_name: profileData?.first_name || '',
      last_name: profileData?.last_name || '',
      email: supabaseUser.email || null,
      phone: supabaseUser.phone || null,
      role: (profileData?.role || 'viewer') as UserRole, // Use role from profileData
      position: (supabaseUser.user_metadata?.position || 'field_agent') as UserPosition,
      status: (supabaseUser.user_metadata?.status || 'active') as UserStatus,
      created_at: supabaseUser.created_at || new Date().toISOString(),
      updated_at: supabaseUser.updated_at || new Date().toISOString(),
      last_login_at: supabaseUser.last_sign_in_at || null,
      avatar_url: '', // Removed avatar_url as it's not in the 'users' table
      metadata: supabaseUser.user_metadata || {},
      permissions: supabaseUser.user_metadata?.permissions || [],
      cached_at: new Date().toISOString() // Add timestamp for cache invalidation
    };

    console.log("DEBUG: Final extendedUser object before return:", extendedUser);
    console.log("DEBUG: Role in final extendedUser object:", extendedUser.role);
    

    
    return extendedUser;
  }, []);

  useEffect(() => {
    let isMounted = true; // Declare isMounted here

    console.log("AuthProvider: Running initialization effect.");

    const initializeAuth = async (onlineStatus: boolean) => {
      console.log("AuthProvider: Starting initializeAuth.");
      let session: Session | null = null; // Declare session here
      let userProfile: ExtendedUser | null = null; // Declare userProfile here

      try {
        // Try to load session from Capacitor Preferences first
        console.log("AuthProvider: Attempting to load session from preferences...");
        const { value: storedSession } = await Preferences.get({ key: STORAGE_KEY });
        console.log("AuthProvider: Preferences.get completed. Stored session exists:", !!storedSession);

        if (storedSession) {
          try {
            const parsedSession = JSON.parse(storedSession);
            
            // Check if the session is still within our 30-day validity period
            const sessionTimestamp = parsedSession.created_at || parsedSession.expires_at;
            const sessionDate = new Date(sessionTimestamp).getTime();
            const currentDate = new Date().getTime();
            const isSessionValid = (currentDate - sessionDate) < SESSION_EXPIRATION;
            
            if (isSessionValid) {
              // When offline, just use the stored session without validation
              if (!onlineStatus) {
                session = parsedSession;
                console.log("AuthProvider: Offline mode - using stored session without validation.");
              } else {
                // Online mode - try to validate with Supabase
                try {
                  // Only attempt to set session if it's not null and has an access_token
                  if (parsedSession && parsedSession.access_token) {
                    await supabase.auth.setSession(parsedSession);
                    session = parsedSession; // Assign to the outer-scoped session
                    console.log("AuthProvider: Session restored and validated with Supabase.");
                  } else {
                    console.warn("AuthProvider: Parsed session is invalid or missing access_token. Not setting session.");
                    await Preferences.remove({ key: STORAGE_KEY });
                  }
                } catch (validationError) {
                  console.error("AuthProvider: Error validating session with Supabase:", validationError);
                  if (validationError instanceof Error && validationError.name === 'AuthSessionMissingError') {
                    console.log("AuthProvider: AuthSessionMissingError during validation. Clearing session.");
                    await Preferences.remove({ key: STORAGE_KEY });
                    session = null; // Explicitly clear session
                  } else {
                    // Even if online validation fails, keep the session if within 30 days
                    console.log("AuthProvider: Online validation failed, but session is within 30 days. Keeping session.");
                    session = parsedSession;
                  }
                }
              }
            } else {
              console.log("AuthProvider: Stored session expired (older than 30 days). Clearing.");
              await Preferences.remove({ key: STORAGE_KEY });
            }
          } catch (parseError) {
            console.error("AuthProvider: Failed to parse stored session.", parseError);
            await Preferences.remove({ key: STORAGE_KEY });
            console.log("AuthProvider: Invalid session format. Clearing.");
          }
        }

        // If no session from preferences, and we are online, try to get it from Supabase
        if (!session && onlineStatus) {
          console.log("AuthProvider: No session from preferences, attempting to get from Supabase...");
          try {
            const { data: { session: currentSession }, error: getSessionError } = await supabase.auth.getSession();
            if (getSessionError) {
              console.error("AuthProvider: Error getting session from Supabase:", getSessionError);
              if (getSessionError.name === 'AuthSessionMissingError') {
                console.log("AuthProvider: AuthSessionMissingError when getting session. Clearing session.");
                await Preferences.remove({ key: STORAGE_KEY });
                session = null; // Explicitly clear session
              }
            } else {
              console.log("AuthProvider: supabase.auth.getSession completed. Session exists:", !!currentSession);
              session = currentSession;
              console.log("AuthProvider: Fetched session from Supabase.");
            }
          } catch (error) {
            console.warn("AuthProvider: Failed to get session from Supabase (possibly network issue or unexpected error):");
          }
        }

        if (session?.user) {
          console.log("AuthProvider: Session user found, attempting to fetch user profile.");
          // Attempt to fetch full profile only if online, otherwise use minimal user data from session
          if (onlineStatus) {
            try {
              userProfile = await fetchUserProfile(session.user.id);
              console.log("AuthProvider: fetchUserProfile completed.");
            } catch (profileError) {
              console.warn("AuthProvider: Failed to fetch user profile during initialization (possibly offline or error).", profileError);
              // Fallback to minimal user if online fetch fails
              userProfile = {
                id: session.user.id,
                auth_id: session.user.id,
                first_name: session.user.user_metadata?.first_name || '',
                last_name: session.user.user_metadata?.last_name || '',
                email: session.user.email || null,
                phone: session.user.phone || null,
                role: (session.user.user_metadata?.role || 'viewer') as UserRole,
                position: (session.user.user_metadata?.position || 'field_agent') as UserPosition,
                status: (session.user.user_metadata?.status || 'active') as UserStatus,
                created_at: session.user.created_at || new Date().toISOString(),
                updated_at: session.user.updated_at || new Date().toISOString(),
                last_login_at: session.user.last_sign_in_at || new Date().toISOString(),
                avatar_url: session.user.user_metadata?.avatar_url || '',
                metadata: session.user.user_metadata || {},
                permissions: session.user.user_metadata?.permissions || [],
              };
            }
          } else {
            // If offline, use the session's user data directly
            userProfile = {
              id: session.user.id,
              auth_id: session.user.id,
              first_name: session.user.user_metadata?.first_name || '',
              last_name: session.user.user_metadata?.last_name || '',
              email: session.user.email || null,
              phone: session.user.phone || null,
              role: (session.user.user_metadata?.role || 'viewer') as UserRole,
              position: (session.user.user_metadata?.position || 'field_agent') as UserPosition,
              status: (session.user.user_metadata?.status || 'active') as UserStatus,
              created_at: session.user.created_at || new Date().toISOString(),
              updated_at: session.user.updated_at || new Date().toISOString(),
              last_login_at: session.user.last_sign_in_at || new Date().toISOString(),
              avatar_url: session.user.user_metadata?.avatar_url || '',
              metadata: session.user.user_metadata || {},
              permissions: session.user.user_metadata?.permissions || [],
              cached_at: new Date().toISOString(), // Add timestamp for cache invalidation
            };
            
            // Try to retrieve cached profile first, even when offline
            try {
              const { value: cachedProfileStr } = await Preferences.get({ key: `user_profile_${session.user.id}` });
              if (cachedProfileStr) {
                const cachedProfile = JSON.parse(cachedProfileStr);
                // Use cached profile if it's more complete than the basic one
                if (cachedProfile.avatar_url && !userProfile.avatar_url) {
                  userProfile.avatar_url = cachedProfile.avatar_url;
                }
                // Any other cached properties we want to use can be added here
              }
            } catch (cacheError) {
              console.warn('AuthProvider: Error retrieving cached profile:', cacheError);
            }
            console.log("AuthProvider: Offline, using session user for profile.");
          }
        }
      } catch (mainError) {
        console.error("AuthProvider: Error during main initialization process:", mainError);
      } finally {
        console.log("AuthProvider: initializeAuth finally block reached. isMounted:", isMounted);
        if (isMounted) {
          setState(prevState => ({
            ...prevState,
            user: userProfile,
            session,
            error: null,
            loading: false,
            initialized: true, // Ensure initialized is set to true
          }));
        }
      }
    };

    initializeAuth(isOnline); // Call initializeAuth with the current online status
  }, [isOnline, fetchUserProfile]);

  // Refresh user data
  // Sign in handler - with offline support and login tracking
  const handleSignIn = useCallback(async (email: string, password: string, rememberMe: boolean = true): Promise<{
    user: ExtendedUser | null;
    error: Error | null
  }> => {
    console.log("handleSignIn: Attempting to sign in user:", email);
    setState(prevState => ({ ...prevState, loading: true, error: null }));
    
    // Record login attempt with device information and location if available
    const loginAttempt: any = {
      email,
      timestamp: new Date().toISOString(),
      success: false,
      online: isOnline,
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        screenSize: `${window.screen.width}x${window.screen.height}`,
      }
    };
    
    // Try to get geolocation data through the Capacitor Geolocation plugin
    try {
      // Request location permissions first
      await requestLocationPermission();
      
      // Then try to get the current position
      try {
        const locationData = await getCurrentPosition();
        
        // When position is available, update the login record
        loginAttempt.location = locationData;
        
        // Update the stored login history with location
        try {
          const { value } = await Preferences.get({ key: 'login_history' });
          let history = value ? JSON.parse(value) : [];
          
          // Find and update the most recent login attempt
          if (history.length > 0) {
            const lastIndex = history.length - 1;
            if (history[lastIndex].email === email) {
              history[lastIndex].location = loginAttempt.location;
              await Preferences.set({
                key: 'login_history',
                value: JSON.stringify(history)
              });
              console.log("Location data added to login history");
            }
          }
        } catch (err) {
          console.warn("Failed to update location in login history:", err);
        }
      } catch (locationError) {
        console.warn("Error getting location:", locationError);
      }
    } catch (permissionError) {
      console.warn("Location permission error:", permissionError);
    }
      
    // Try to get device orientation (compass) if available
    try {
      if (window.DeviceOrientationEvent) {
        const handleOrientation = (event: DeviceOrientationEvent) => {
          // Only capture orientation once
          window.removeEventListener('deviceorientation', handleOrientation);
          
          if (event.alpha !== null) {
            loginAttempt.orientation = {
              alpha: event.alpha, // compass direction (0-360)
              beta: event.beta,   // front-to-back tilt
              gamma: event.gamma  // left-to-right tilt
            };
            
            // Update stored login history with orientation data
            Preferences.get({ key: 'login_history' }).then(({ value }) => {
              let history = value ? JSON.parse(value) : [];
              if (history.length > 0) {
                const lastIndex = history.length - 1;
                if (history[lastIndex].email === email) {
                  history[lastIndex].orientation = loginAttempt.orientation;
                  Preferences.set({
                    key: 'login_history',
                    value: JSON.stringify(history)
                  });
                  console.log("Orientation data added to login history");
                }
              }
            }).catch(err => {
              console.warn("Failed to update orientation in login history:", err);
            });
          }
        };
        
        // Request device orientation permission and data
        window.addEventListener('deviceorientation', handleOrientation, true);
      }
    } catch (sensorError) {
      console.warn("Error accessing device sensors:", sensorError);
    }
    
    try {
      // Store login attempt in Preferences
      const { value: loginHistoryStr } = await Preferences.get({ key: 'login_history' });
      const loginHistory = loginHistoryStr ? JSON.parse(loginHistoryStr) : [];
      loginHistory.push(loginAttempt);
      await Preferences.set({
        key: 'login_history',
        value: JSON.stringify(loginHistory)
      });
      
      // If offline, check for cached credentials
      if (!isOnline) {
        console.log("handleSignIn: Offline mode, checking cached session");
        try {
          const { value: storedSessionStr } = await Preferences.get({ key: STORAGE_KEY });
          if (storedSessionStr) {
            const storedSession = JSON.parse(storedSessionStr);
            
            // Also load cached user profile
            const { value: cachedUserStr } = await Preferences.get({
              key: `user_profile_${storedSession.user.id}`
            });
            
            if (cachedUserStr) {
              const cachedUser = JSON.parse(cachedUserStr);
              const cachedEmail = cachedUser.email;
              
              // Basic offline validation - just check if emails match
              // In a real app, we'd want more secure offline auth
              if (cachedEmail === email) {
                console.log("handleSignIn: Offline login successful with cached credentials");
                
                // Update login history to mark success
                loginHistory[loginHistory.length - 1].success = true;
                await Preferences.set({
                  key: 'login_history',
                  value: JSON.stringify(loginHistory)
                });
                
                setState(prevState => ({
                  ...prevState,
                  user: cachedUser,
                  session: storedSession,
                  loading: false,
                  error: null,
                }));
                
                return {
                  user: cachedUser,
                  error: null
                };
              }
            }
            
            // If we reach here, offline login failed
            const offlineError = new Error("Offline login failed. Please ensure you've logged in at least once with internet connection.");
            setState(prevState => ({ ...prevState, loading: false, error: offlineError.message }));
            return { user: null, error: offlineError };
          }
        } catch (offlineError) {
          console.error("handleSignIn: Error during offline login:", offlineError);
          setState(prevState => ({
            ...prevState,
            loading: false,
            error: "Offline login failed. No cached session available."
          }));
          return {
            user: null,
            error: offlineError instanceof Error
              ? offlineError
              : new Error("Offline login failed")
          };
        }
      }
      
      // Online login with Supabase
      console.log("handleSignIn: Online mode, calling Supabase auth");
      const authResponse = await promiseWithTimeout(
        supabase.auth.signInWithPassword({ email, password }),
        15000, // 15 second timeout
        "Supabase auth login request timed out"
      );
      
      const { data, error } = authResponse;
      
      if (error) {
        console.error("handleSignIn: Error signing in with Supabase:", error);
        setState(prevState => ({ ...prevState, loading: false, error: error.message }));
        return { user: null, error };
      }
      
      if (!data.user || !data.session) {
        const noUserError = new Error("No user or session returned from Supabase auth");
        console.error("handleSignIn: No user returned in auth response");
        setState(prevState => ({ ...prevState, loading: false, error: noUserError.message }));
        return { user: null, error: noUserError };
      }
      
      console.log("handleSignIn: Supabase auth successful, getting full user profile");
      
      // Update login history to mark success
      loginHistory[loginHistory.length - 1].success = true;
      await Preferences.set({
        key: 'login_history',
        value: JSON.stringify(loginHistory)
      });
      
      // Store session in Preferences for offline use if rememberMe is true
      if (rememberMe) {
        // Add timestamp information to ensure we can track the 30-day expiration
        const sessionWithMetadata = {
          ...data.session,
          created_at: new Date().toISOString(),
          local_expiry: new Date(Date.now() + SESSION_EXPIRATION).toISOString()
        };
        
        await Preferences.set({
          key: STORAGE_KEY,
          value: JSON.stringify(sessionWithMetadata)
        });
        
        console.log("handleSignIn: Session stored with 30-day local expiration date:", sessionWithMetadata.local_expiry);
      }
      
      // Get full user profile with location data and permissions
      let userProfile: ExtendedUser | null = null;
      try {
        userProfile = await fetchUserProfile(data.user.id);
        
        if (!userProfile) {
          console.warn("handleSignIn: fetchUserProfile returned null. User profile not found or session invalid.");
          // If userProfile is null, it means there's no active user or session.
          // We should clear any potentially lingering session and return an error.
          await Preferences.remove({ key: STORAGE_KEY });
          setState(prevState => ({ ...prevState, loading: false, user: null, session: null, error: "User profile not found or session invalid." }));
          return { user: null, error: new Error("User profile not found or session invalid.") };
        }

        // Store user profile for offline use
        await Preferences.set({
          key: `user_profile_${data.user.id}`,
          value: JSON.stringify({
            ...userProfile,
            cached_at: new Date().toISOString()
          })
        });
        
        console.log("handleSignIn: User profile fetched and cached successfully");
      } catch (profileError) {
        console.warn("handleSignIn: Error fetching full profile, using basic user data", profileError);
        // Still continue with basic user info if profile fetch fails
        userProfile = {
          id: data.user.id,
          auth_id: data.user.id,
          first_name: data.user.user_metadata?.first_name || '',
          last_name: data.user.user_metadata?.last_name || '',
          email: data.user.email || null,
          phone: data.user.phone || null,
          role: (data.user.user_metadata?.role || 'viewer') as UserRole,
          position: (data.user.user_metadata?.position || 'field_agent') as UserPosition,
          status: (data.user.user_metadata?.status || 'active') as UserStatus,
          created_at: data.user.created_at || new Date().toISOString(),
          updated_at: data.user.updated_at || new Date().toISOString(),
          last_login_at: data.user.last_sign_in_at || new Date().toISOString(),
          avatar_url: data.user.user_metadata?.avatar_url || '',
          metadata: data.user.user_metadata || {},
          permissions: data.user.user_metadata?.permissions || [],
          cached_at: new Date().toISOString()
        };
        
        // Still cache the basic user profile
        await Preferences.set({
          key: `user_profile_${data.user.id}`,
          value: JSON.stringify(userProfile)
        });
      }
      
      setState(prevState => ({
        ...prevState,
        user: userProfile,
        session: data.session,
        loading: false,
        error: null,
      }));
      
      return { user: userProfile, error: null };
      
    } catch (unexpectedError) {
      console.error("handleSignIn: Unexpected error during sign in:", unexpectedError);
      setState(prevState => ({
        ...prevState,
        loading: false,
        error: unexpectedError instanceof Error ? unexpectedError.message : "An unexpected error occurred"
      }));
      return {
        user: null,
        error: unexpectedError instanceof Error ? unexpectedError : new Error("Unknown error during sign in")
      };
    }
  }, [setState, isOnline, fetchUserProfile]);
  
  // Sign out handler
  const handleSignOut = useCallback(async (): Promise<{ error: Error | null }> => {
    console.log("handleSignOut: Signing out user");
    setState(prevState => ({ ...prevState, loading: true, error: null }));
    
    try {
      // Record sign out in login history
      const { value: loginHistoryStr } = await Preferences.get({ key: 'login_history' });
      const loginHistory = loginHistoryStr ? JSON.parse(loginHistoryStr) : [];
      
      loginHistory.push({
        timestamp: new Date().toISOString(),
        event: 'signout',
        online: isOnline,
        userId: state.user?.id || null
      });
      
      await Preferences.set({
        key: 'login_history',
        value: JSON.stringify(loginHistory)
      });
      
      // If online, sign out from Supabase
      if (isOnline) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      
      // Always remove cached session
      await Preferences.remove({ key: STORAGE_KEY });
      
      // Don't remove cached user profiles to allow offline login later
      
      setState({
        user: null,
        session: null,
        loading: false,
        error: null,
        initialized: true,
      });
      
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      
      setState(prevState => ({
        ...prevState,
        loading: false,
        error: error instanceof Error ? error.message : "Error signing out"
      }));
      
      return { error: error instanceof Error ? error : new Error("Error signing out") };
    }
  }, [setState, isOnline, state.user]);
  
  // Reset password
  const handleResetPassword = useCallback(async (email: string): Promise<{ error: Error | null }> => {
    console.log("handleResetPassword: Requesting password reset for:", email);
    setState(prevState => ({ ...prevState, loading: true, error: null }));
    
    try {
      if (!isOnline) {
        throw new Error("Cannot reset password while offline");
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) throw error;
      
      setState(prevState => ({ ...prevState, loading: false }));
      return { error: null };
    } catch (error) {
      console.error('Error resetting password:', error);
      
      setState(prevState => ({
        ...prevState,
        loading: false,
        error: error instanceof Error ? error.message : "Error resetting password"
      }));
      
      return { error: error instanceof Error ? error : new Error("Error resetting password") };
    }
  }, [setState, isOnline]);
  
  // Update password
  const handleUpdatePassword = useCallback(async (newPassword: string): Promise<{ error: Error | null }> => {
    console.log("handleUpdatePassword: Updating password");
    setState(prevState => ({ ...prevState, loading: true, error: null }));
    
    try {
      if (!isOnline) {
        throw new Error("Cannot update password while offline");
      }
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      setState(prevState => ({ ...prevState, loading: false }));
      return { error: null };
    } catch (error) {
      console.error('Error updating password:', error);
      
      setState(prevState => ({
        ...prevState,
        loading: false,
        error: error instanceof Error ? error.message : "Error updating password"
      }));
      
      return { error: error instanceof Error ? error : new Error("Error updating password") };
    }
  }, [setState, isOnline]);
  
  // Navigation setter
  const setNavigation = useCallback((nav: (to: string) => void) => {
    setNavigate(() => nav);
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
  }, [setState, fetchUserProfile]);

  // Permission checks
  const isAdmin = useMemo(() => state.user?.role === 'admin', [state.user]);
  const isManager = useMemo(() => state.user?.role === 'manager', [state.user]);
  const isDataCollector = useMemo(() => state.user?.role === 'data_collector', [state.user]);

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
    setNavigation
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
