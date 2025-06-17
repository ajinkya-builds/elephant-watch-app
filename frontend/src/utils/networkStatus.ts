import { useEffect, useState } from 'react';
import { getPlatformNetworkStatus } from './platform';

const platformNetwork = getPlatformNetworkStatus();

// Simple check that doesn't require authentication
export const checkNetworkStatus = async (): Promise<boolean> => {
  try {
    // First check if we're in a browser environment
    if (typeof window === 'undefined') return false;
    
    // Check basic online status
    if (!navigator.onLine) return false;
    
    // Check platform-specific network status if available
    if (typeof platformNetwork?.isOnline === 'function') {
      const isPlatformOnline = await platformNetwork.isOnline();
      if (!isPlatformOnline) return false;
    }
    
    // Try to fetch a small public resource
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      // Use a public endpoint that doesn't require authentication
      const response = await fetch('https://httpbin.org/get', {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn('Network check failed, falling back to basic online check');
      return navigator.onLine;
    }
  } catch (error) {
    console.warn('Network check failed:', error);
    return false;
  }
};

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const updateNetworkStatus = async () => {
      const status = await checkNetworkStatus();
      setIsOnline(status);
    };

    // Initial check
    updateNetworkStatus();

    // Set up event listeners
    const handleOnline = () => {
      setIsOnline(true);
      // Verify connection when coming back online
      updateNetworkStatus();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set up periodic checks
    const intervalId = setInterval(updateNetworkStatus, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  return isOnline;
}; 