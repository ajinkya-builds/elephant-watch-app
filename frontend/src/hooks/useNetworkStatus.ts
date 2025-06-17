import { useState, useEffect } from 'react';

/**
 * Custom hook to track network status
 * @returns {boolean} Boolean indicating if the device is online
 */
export const useNetworkStatus = (): boolean => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    // Update network status on mount
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clean up
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

/**
 * Hook that returns network status with additional metadata
 * @returns {Object} Network status information
 */
export const useEnhancedNetworkStatus = () => {
  const isOnline = useNetworkStatus();
  const [lastOnline, setLastOnline] = useState<Date | null>(null);
  const [lastOffline, setLastOffline] = useState<Date | null>(null);

  useEffect(() => {
    const now = new Date();
    if (isOnline) {
      setLastOnline(now);
    } else {
      setLastOffline(now);
    }
  }, [isOnline]);

  return {
    isOnline,
    lastOnline,
    lastOffline,
    offlineDuration: lastOffline ? Date.now() - lastOffline.getTime() : 0,
  };
};

export default useNetworkStatus;
