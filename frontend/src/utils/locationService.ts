import { Geolocation, PermissionStatus } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

// Interface for location data
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

/**
 * Request location permissions explicitly
 * @returns Promise with permission status
 */
export const requestLocationPermission = async (): Promise<PermissionStatus> => {
  console.log('Requesting location permission');
  if (!Capacitor.isNativePlatform()) {
    console.warn('Geolocation is not available on web platform. Returning default denied status.');
    return { location: 'denied', coarseLocation: 'denied' };
  }
  try {
    const status = await Geolocation.requestPermissions();
    console.log('Location permission status:', status);
    return status;
  } catch (error) {
    console.error('Error requesting location permission:', error);
    throw error;
  }
};

/**
 * Check if location permissions are granted
 * @returns Promise with boolean indicating if permission is granted
 */
export const checkLocationPermission = async (): Promise<boolean> => {
  try {
    const status = await Geolocation.checkPermissions();
    return status.location === 'granted';
  } catch (error) {
    console.error('Error checking location permissions:', error);
    return false;
  }
};

/**
 * Get current position with proper error handling
 * @param options Optional position options
 * @returns Promise with location data
 */
export const getCurrentPosition = async (): Promise<LocationData> => {
  if (!Capacitor.isNativePlatform()) {
    console.warn('Geolocation is not available on web platform. Returning default location.');
    // Return a default or null location for web
    return {
      latitude: 0,
      longitude: 0,
      accuracy: 0,
      timestamp: Date.now()
    };
  }
  try {
    // First ensure we have permission
    const hasPermission = await checkLocationPermission();
    
    if (!hasPermission) {
      // Request permission if not granted
      const permissionStatus = await requestLocationPermission();
      if (permissionStatus.location !== 'granted') {
        throw new Error('Location permission denied');
      }
    }
    
    // Get position with high accuracy
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
    
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp
    };
  } catch (error) {
    console.error('Error getting current position:', error);
    throw error;
  }
};
