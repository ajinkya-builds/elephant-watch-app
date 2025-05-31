import { useEffect, useState } from 'react';
import { getPlatformNetworkStatus } from './platform';

const platformNetwork = getPlatformNetworkStatus();

export const checkNetworkStatus = async (): Promise<boolean> => {
  try {
    // First check platform-specific network status
    const isPlatformOnline = await platformNetwork.isOnline();
    if (!isPlatformOnline) return false;

    // If platform reports online, verify with a small fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('/ping.txt', {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
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