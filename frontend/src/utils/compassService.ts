import { Capacitor } from '@capacitor/core';
import { logger } from './loggerService';
import { Motion } from '@capacitor/motion';
import { Geolocation, Position } from '@capacitor/geolocation';

interface CompassReading {
  // Alpha is the compass direction (0-360 degrees, 0 = north)
  alpha: number;
  // Beta is the front-to-back tilt (pitch)
  beta: number;
  // Gamma is the left-to-right tilt (roll)
  gamma: number;
  // Optional true bearing if using DeviceOrientation API with absolute values
  trueBearing?: number;
  // Timestamp of reading
  timestamp: number;
  // Accuracy of reading in degrees (if available)
  accuracy?: number;
  // Source of the compass reading (device, gps, manual)
  source?: 'device' | 'gps' | 'manual';
}

interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

// Compass events listeners
type CompassCallback = (reading: CompassReading) => void;
const compassListeners: CompassCallback[] = [];

// Track if compass is initialized
let compassInitialized = false;
let hasPermission = false;
let isAbsolute = false;
let isWebKit = false;

// Check if device supports compass
export const isCompassAvailable = (): boolean => {
  // Check if DeviceOrientationEvent exists
  if (typeof DeviceOrientationEvent === 'undefined') {
    logger.warn('DeviceOrientationEvent is not supported on this device');
    return false;
  }
  
  return true;
};

// Request permission to access device orientation
export const requestCompassPermission = async (): Promise<boolean> => {
  try {
    if (!isCompassAvailable()) {
      return false;
    }
    
    // For iOS 13+ devices
    if (Capacitor.getPlatform() === 'ios') {
      const iosPermissionAPI = (DeviceOrientationEvent as any).requestPermission;
      
      if (typeof iosPermissionAPI === 'function') {
        const permission = await iosPermissionAPI();
        hasPermission = permission === 'granted';
        logger.info(`iOS device orientation permission: ${hasPermission ? 'granted' : 'denied'}`);
        return hasPermission;
      }
    }
    
    // For other platforms, assume permission is granted
    hasPermission = true;
    return true;
  } catch (error) {
    logger.error('Error requesting compass permission:', error);
    return false;
  }
};

// Apply calibration adjustment to the compass reading
const calibrateReading = (reading: CompassReading): CompassReading => {
  // Implement any necessary calibration
  // This could include magnetic declination adjustment or device-specific adjustments
  
  // For now, just return the reading as-is
  return reading;
};

// Handle device orientation event
const handleOrientation = (event: DeviceOrientationEvent) => {
  if (!event.alpha && event.alpha !== 0) {
    logger.warn('Received device orientation event without alpha value');
    return;
  }
  
  const reading: CompassReading = {
    alpha: event.alpha,
    beta: event.beta || 0,
    gamma: event.gamma || 0,
    timestamp: Date.now()
  };
  
  // Check if we're getting absolute values (true north)
  if ((event as any).absolute || isAbsolute) {
    reading.trueBearing = event.alpha;
  } else if (isWebKit && (event as any).webkitCompassHeading) {
    // iOS devices provide webkitCompassHeading (inverted compared to alpha)
    reading.trueBearing = (event as any).webkitCompassHeading;
    reading.accuracy = (event as any).webkitCompassAccuracy;
  }
  
  // Apply any calibration
  const calibratedReading = calibrateReading(reading);
  
  // Notify all listeners
  compassListeners.forEach(listener => {
    try {
      listener(calibratedReading);
    } catch (error) {
      logger.error('Error in compass listener callback:', error);
    }
  });
};

// Initialize the compass service
export const initCompass = async (): Promise<boolean> => {
  if (compassInitialized) {
    return true;
  }
  
  try {
    if (!isCompassAvailable()) {
      return false;
    }
    
    // Request permission if needed
    const hasPerms = await requestCompassPermission();
    if (!hasPerms) {
      logger.warn('Compass permissions denied');
      return false;
    }
    
    // Check if we're on an iOS device
    isWebKit = typeof (window as any).DeviceOrientationEvent !== 'undefined' && 
               typeof (DeviceOrientationEvent as any).webkitCompassHeading !== 'undefined';
    
    // Check if absolute values are available
    isAbsolute = typeof (DeviceOrientationEvent as any).absolute !== 'undefined';
    
    // Register device orientation event listener
    window.addEventListener('deviceorientation', handleOrientation, true);
    
    // Try to also use Capacitor Motion if available
    if (Capacitor.isPluginAvailable('Motion')) {
      try {
        await Motion.addListener('orientation', data => {
          const motionReading: CompassReading = {
            alpha: data.alpha,
            beta: data.beta,
            gamma: data.gamma,
            timestamp: Date.now()
          };
          
          // Notify all listeners with Capacitor Motion data
          compassListeners.forEach(listener => {
            try {
              listener(motionReading);
            } catch (error) {
              logger.error('Error in motion listener callback:', error);
            }
          });
        });
      } catch (motionError) {
        logger.warn('Error setting up Capacitor Motion:', motionError);
      }
    }
    
    compassInitialized = true;
    logger.info('Compass initialized successfully');
    return true;
  } catch (error) {
    logger.error('Error initializing compass:', error);
    return false;
  }
};

// Clean up compass event listeners
export const cleanupCompass = (): void => {
  if (!compassInitialized) {
    return;
  }
  
  window.removeEventListener('deviceorientation', handleOrientation, true);
  
  if (Capacitor.isPluginAvailable('Motion')) {
    Motion.removeAllListeners();
  }
  
  compassListeners.length = 0;
  compassInitialized = false;
};

// Subscribe to compass updates
export const subscribeToCompass = (callback: CompassCallback): number => {
  compassListeners.push(callback);
  return compassListeners.length - 1;
};

// Unsubscribe from compass updates
export const unsubscribeFromCompass = (index: number): void => {
  if (index >= 0 && index < compassListeners.length) {
    compassListeners.splice(index, 1);
  }
};

// Get current device heading as a cardinal direction
export const getCardinalDirection = (heading: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N'];
  const index = Math.round(heading / 22.5);
  return directions[index];
};

// Get a single compass reading (useful for one-time measurements)
export const getCurrentHeading = async (): Promise<CompassReading | null> => {
  if (!compassInitialized) {
    await initCompass();
  }
  
  return new Promise((resolve) => {
    // Set a timeout in case we don't get an orientation event
    const timeoutId = setTimeout(() => {
      logger.warn('Compass reading timed out');
      unsubscribeFromCompass(listenerIndex);
      resolve(null);
    }, 3000);
    
    // Subscribe for a single reading
    const listenerIndex = subscribeToCompass((reading) => {
      clearTimeout(timeoutId);
      unsubscribeFromCompass(listenerIndex);
      resolve(reading);
    });
  });
};

// Calculate bearing between two geo positions (in degrees, 0-360, 0 = north)
export const calculateBearing = (start: GeoPosition, end: GeoPosition): number => {
  // Convert to radians
  const startLat = start.latitude * Math.PI / 180;
  const startLng = start.longitude * Math.PI / 180;
  const endLat = end.latitude * Math.PI / 180;
  const endLng = end.longitude * Math.PI / 180;

  // Calculate bearing
  const y = Math.sin(endLng - startLng) * Math.cos(endLat);
  const x = Math.cos(startLat) * Math.sin(endLat) -
            Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);
  
  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  bearing = (bearing + 360) % 360; // Normalize to 0-360
  
  return bearing;
};

// Get current device position
export const getCurrentPosition = async (): Promise<Position | null> => {
  try {
    const options = { enableHighAccuracy: true, timeout: 10000 };
    return await Geolocation.getCurrentPosition(options);
  } catch (error) {
    logger.error('Error getting device position:', error);
    return null;
  }
};

// Calculate bearing from current position to a target position
export const getBearingToPosition = async (target: GeoPosition): Promise<{
  bearing: number | null;
  currentPosition: Position | null;
  accuracy: number;
}> => {
  try {
    const position = await getCurrentPosition();
    if (!position) {
      return { bearing: null, currentPosition: null, accuracy: 0 };
    }
    
    const start = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
    
    const bearing = calculateBearing(start, target);
    
    // Calculate accuracy based on GPS accuracy
    let accuracy = 1;
    if (position.coords.accuracy) {
      accuracy = Math.min(1, 20 / Math.max(position.coords.accuracy, 1)); // 1.0 for <= 20m accuracy
    }
    
    return { bearing, currentPosition: position, accuracy };
  } catch (error) {
    logger.error('Error calculating bearing to position:', error);
    return { bearing: null, currentPosition: null, accuracy: 0 };
  }
};
