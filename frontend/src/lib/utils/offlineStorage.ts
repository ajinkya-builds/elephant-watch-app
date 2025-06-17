/**
 * Utility functions for offline storage with TypeScript support
 * Provides a unified interface for localStorage and Android WebView storage
 */

// Types
export type Session = {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user?: {
    id: string;
    email?: string | null;
    [key: string]: any;
  };
  [key: string]: any;
};

// Check if running in an Android WebView
export const isAndroidApp = (): boolean => {
  return typeof window !== 'undefined' && 
         (window as any).Android !== undefined;
};

/**
 * Saves the session to the appropriate storage
 */
export const saveUserSession = async (session: Session): Promise<void> => {
  if (!session?.access_token) {
    throw new Error('Invalid session: No access token provided');
  }

  try {
    const sessionStr = JSON.stringify(session);
    
    if (isAndroidApp() && (window as any).Android?.saveSession) {
      // Save to Android storage
      (window as any).Android.saveSession(sessionStr);
    } else {
      // Fallback to localStorage
      localStorage.setItem('sb-auth-token', sessionStr);
    }
  } catch (error) {
    console.error('Failed to save session:', error);
    throw new Error('Failed to save session to storage');
  }
};

/**
 * Retrieves the user session from storage
 */
export const getUserSession = async (): Promise<Session | null> => {
  try {
    let sessionStr: string | null = null;
    
    if (isAndroidApp() && (window as any).Android?.getSession) {
      // Get from Android storage
      sessionStr = await (window as any).Android.getSession();
    } else {
      // Get from localStorage
      sessionStr = localStorage.getItem('sb-auth-token');
    }

    if (!sessionStr) return null;
    
    const session = JSON.parse(sessionStr) as Session;
    
    // Validate session structure
    if (!session?.access_token) {
      console.warn('Invalid session format in storage');
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error reading session from storage:', error);
    return null;
  }
};

/**
 * Clears the user session from storage
 */
export const clearUserSession = async (): Promise<void> => {
  try {
    if (isAndroidApp() && (window as any).Android?.clearSession) {
      // Clear Android storage
      await (window as any).Android.clearSession();
    } else {
      // Clear localStorage
      localStorage.removeItem('sb-auth-token');
    }
  } catch (error) {
    console.error('Failed to clear session:', error);
    throw new Error('Failed to clear session from storage');
  }
};

/**
 * Checks if a session exists and is valid
 */
export const hasValidSession = async (): Promise<boolean> => {
  try {
    const session = await getUserSession();
    if (!session) return false;
    
    // Check if token is expired
    if (session.expires_at) {
      const now = Math.floor(Date.now() / 1000);
      return session.expires_at > now;
    }
    
    return !!session.access_token;
  } catch (error) {
    console.error('Error checking session validity:', error);
    return false;
  }
};
