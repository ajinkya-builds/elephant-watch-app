import { useState, useEffect } from 'react';

const checkNetworkStatus = async (): Promise<boolean> => {
  // First check navigator.onLine
  if (!navigator.onLine) {
    console.log('[NetworkStatus] navigator.onLine is false');
    return false;
  }

  try {
    // Try to fetch a small resource to verify actual connectivity
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    console.log('[NetworkStatus] Attempting to fetch /ping.txt');
    const response = await fetch('/ping.txt', {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-cache'
    });
    clearTimeout(timeoutId);
    console.log('[NetworkStatus] Fetch /ping.txt response:', response.status, response.ok);
    return response.ok;
  } catch (error) {
    console.warn('[NetworkStatus] Network check failed:', error);
    // If fetch fails, fall back to navigator.onLine
    return navigator.onLine;
  }
};

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const updateNetworkStatus = async () => {
      const status = await checkNetworkStatus();
      setIsOnline(status);
    };

    // Initial check
    updateNetworkStatus();

    // Set up event listeners
    const handleOnline = () => updateNetworkStatus();
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Periodic check every 30 seconds
    const intervalId = setInterval(updateNetworkStatus, 30000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);
  
  return isOnline;
}; 