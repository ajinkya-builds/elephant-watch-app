import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';

/**
 * Network utility functions to check connectivity status
 * and provide real-time network status updates
 */

let networkStatus: { connected: boolean } = { connected: true };

// Initialize network status monitoring
export const initNetworkMonitoring = async () => {
  try {
    // Get initial network status
    const status = await Network.getStatus();
    networkStatus = status;
    console.log('Initial network status:', status);
    
    // Listen for network status changes
    Network.addListener('networkStatusChange', (status) => {
      console.log('Network status changed:', status);
      networkStatus = status;
    });
    
    return status;
  } catch (error) {
    console.error('Error initializing network monitoring:', error);
    // Default to considering connected if we can't determine
    return { connected: true };
  }
};

/**
 * Check if the device has an active network connection
 * @returns boolean indicating if the device is online
 */
export const isOnline = async (): Promise<boolean> => {
  try {
    // On web, use window.navigator.onLine
    if (!Capacitor.isNativePlatform()) {
      return window.navigator.onLine;
    }
    
    // On native platforms, use the Network plugin
    const status = await Network.getStatus();
    return status.connected;
  } catch (error) {
    console.error('Error checking network status:', error);
    
    // If we can't determine, use the last known status
    return networkStatus.connected;
  }
};

/**
 * Get the current network connection type
 * @returns string representing the connection type ('wifi', 'cellular', 'none', etc.)
 */
export const getConnectionType = async (): Promise<string> => {
  try {
    if (!Capacitor.isNativePlatform()) {
      return window.navigator.onLine ? 'unknown' : 'none';
    }
    
    const status = await Network.getStatus();
    return status.connectionType;
  } catch (error) {
    console.error('Error getting connection type:', error);
    return 'unknown';
  }
};
