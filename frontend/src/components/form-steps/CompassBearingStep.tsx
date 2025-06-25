import { useState, useEffect, useCallback, useRef } from 'react';
import { useActivityForm } from '@/contexts/ActivityFormContext';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass, RefreshCw, Navigation, MapPin, ArrowRight, XCircle, Lock as LockClosed, Unlock as LockOpen } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import * as compassService from '@/utils/compassService';
import { logger } from '@/utils/loggerService';
import { Capacitor } from '@capacitor/core';

interface GeoPosition {
  latitude: number;
  longitude: number;
}

interface CompassState {
  heading: number | null;
  accuracy: number; // 0-1 where 1 is most accurate
  isGPSBased: boolean;
  isValid: boolean;
  lastUpdated: number;
  currentPosition: GeoPosition | null;
  targetPosition: GeoPosition | null;
}

export function CompassBearingStep() {
  const { formData, updateFormData } = useActivityForm();
  const [isTracking, setIsTracking] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isPointingMode, setIsPointingMode] = useState(false);
  const [compassState, setCompassState] = useState<CompassState>({
    heading: null,
    accuracy: 0,
    isGPSBased: false,
    isValid: false,
    lastUpdated: 0,
    currentPosition: null,
    targetPosition: null
  });
  
  const lastHeading = useRef<number | null>(null);
  const watchId = useRef<number | null>(null);

  // Initialize compass and get initial position on component mount
  useEffect(() => {
    // Log platform information
    logger.info(`Device platform: ${Capacitor.getPlatform()}`);

    // Initialize compass and get initial position
    const initialize = async () => {
      try {
        // Check if compass is available
        if (!compassService.isCompassAvailable()) {
          toast.error("Compass is not available on this device");
          return;
        }
        
        // Request permissions and initialize compass
        if (await compassService.requestCompassPermission()) {
          logger.info("Compass permission granted");
          await compassService.initCompass();
          toast.success("Compass initialized successfully");
          
          // Get initial position
          const position = await compassService.getCurrentPosition();
          if (position && position.coords) {
            setCompassState(prev => ({
              ...prev,
              currentPosition: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              }
            }));
            logger.info("Initial position acquired", {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          }
        } else {
          logger.warn("Compass permission denied");
          toast.error("Compass access denied");
        }
      } catch (error) {
        logger.error("Error initializing compass:", error);
        toast.error("Failed to initialize compass");
      }
    };
    
    initialize();

    return () => {
      // Clean up resources
      compassService.cleanupCompass();
      
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  // Handle manual compass bearing entry
  const handleCompassBearingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 360) {
      updateFormData({ compass_bearing: value });
      setCompassState(prev => ({
        ...prev,
        heading: value,
        isGPSBased: false,
        isValid: true,
        lastUpdated: Date.now()
      }));
    }
  };

  // Get bearing to the target position (elephant location)
  const calculateBearingToTarget = useCallback(async (targetLat: number, targetLng: number) => {
    if (!isTracking) return;
    
    try {
      // Save the target position
      const targetPosition = {
        latitude: targetLat,
        longitude: targetLng
      };
      
      setCompassState(prev => ({
        ...prev,
        targetPosition
      }));
      
      // Calculate bearing using the service
      const result = await compassService.getBearingToPosition(targetPosition);
      
      if (result.bearing !== null) {
        // Round to nearest whole degree
        const roundedBearing = Math.round(result.bearing);
        
        setCompassState(prev => ({
          ...prev,
          heading: roundedBearing,
          accuracy: result.accuracy,
          isGPSBased: true,
          isValid: true,
          currentPosition: result.currentPosition?.coords ? {
            latitude: result.currentPosition.coords.latitude,
            longitude: result.currentPosition.coords.longitude
          } : prev.currentPosition,
          lastUpdated: Date.now()
        }));
        
        // Update the form with the new bearing value
        if (!isLocked) {
          updateFormData({ compass_bearing: roundedBearing });
          toast.success(`Bearing calculated: ${roundedBearing}°`);
        }
        
        return roundedBearing;
      } else {
        toast.error("Could not calculate bearing. Please try again");
        return null;
      }
    } catch (error) {
      logger.error("Error calculating bearing:", error);
      toast.error("Failed to calculate bearing");
      return null;
    }
  }, [isTracking, isLocked, updateFormData]);

  // Handle device orientation events from compass service
  const handleCompassReading = useCallback((reading: {
    alpha: number;
    beta: number;
    gamma: number;
    trueBearing?: number;
    timestamp: number;
    accuracy?: number;
    source?: 'device' | 'gps' | 'manual';
  }) => {
    if (!isTracking || isLocked) return;
    
    // Get the most accurate heading available
    let heading = 0;
    if (reading.trueBearing !== undefined) {
      // Use true bearing if available (from iOS webkitCompassHeading)
      heading = Math.round(reading.trueBearing);
    } else {
      // Fall back to alpha with conversion for standard deviceorientation
      heading = Math.round((360 - reading.alpha) % 360);
    }
    
    // Store the raw heading
    lastHeading.current = heading;
    
    // Log compass data for debugging
    logger.debug('Compass reading', { 
      heading: heading,
      source: reading.source || 'device',
      accuracy: reading.accuracy || 'unknown',
      beta: reading.beta,
      gamma: reading.gamma
    });
    
    // Only update if not using GPS-based bearing
    if (!compassState.isGPSBased) {
      setCompassState(prev => ({
        ...prev,
        heading: heading,
        accuracy: reading.accuracy || 0.7,
        isGPSBased: false,
        isValid: true,
        lastUpdated: Date.now()
      }));
      
      if (!isLocked) {
        updateFormData({ compass_bearing: heading });
      }
    }
  }, [isTracking, isLocked, updateFormData, compassState.isGPSBased]);

  useEffect(() => {
    if (isTracking) {
      // Subscribe to compass readings from device orientation
      const compassIndex = compassService.subscribeToCompass(handleCompassReading);
      
      // Start location watching for accurate position updates
      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          // Update the current position in state
          if (position && position.coords) {
            setCompassState(prev => ({
              ...prev,
              currentPosition: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              },
              lastUpdated: Date.now()
            }));
            
            // If we have a target position, recalculate the bearing
            if (compassState.targetPosition) {
              calculateBearingToTarget(
                compassState.targetPosition.latitude,
                compassState.targetPosition.longitude
              );
            }
          }
        },
        (error) => {
          logger.error('GPS Error:', error);
          toast.error(`GPS error: ${error.message}`);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
      );
      
      // Return cleanup function
      return () => {
        compassService.unsubscribeFromCompass(compassIndex);
        if (watchId.current !== null) {
          navigator.geolocation.clearWatch(watchId.current);
        }
      };
    }
    
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [isTracking, handleCompassReading, calculateBearingToTarget, compassState.targetPosition]);

  const toggleTracking = async () => {
    // If starting tracking, ensure compass service is initialized
    if (!isTracking) {
      try {
        // Make sure compass is initialized
        if (!await compassService.initCompass()) {
          toast.error("Could not initialize compass service");
          return;
        }
        
        // Start tracking
        setIsTracking(true);
        toast.success("Bearing tracking started");
      } catch (error) {
        logger.error("Error starting compass tracking:", error);
        toast.error("Failed to start bearing tracking");
      }
    } else {
      // Stop tracking
      setIsTracking(false);
      setIsLocked(false);
      toast.info("Bearing tracking stopped");
    }
  };

  const toggleLock = () => {
    setIsLocked(!isLocked);
    if (!isLocked) {
      toast.info("Bearing locked");
    } else {
      toast.info("Bearing unlocked");
    }
  };
  
  const getTargetLocation = async () => {
    try {
      setIsPointingMode(true);
      toast.info("Point your device at the elephant's location and tap 'Set Target'.");
    } catch (error) {
      logger.error("Error setting pointing mode:", error);
      toast.error("Failed to enter pointing mode");
      setIsPointingMode(false);
    }
  };
  
  const setTarget = async () => {
    // Get the current position as the target for the elephant
    const position = await compassService.getCurrentPosition();
    if (!position || !position.coords) {
      toast.error("Could not get current position. Please try again.");
      return;
    }
    
    const targetPosition = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
    
    setCompassState(prev => ({
      ...prev,
      targetPosition
    }));
    
    toast.success("Target position set successfully");
    setIsPointingMode(false);
    
    // If we have current position, calculate bearing immediately
    if (compassState.currentPosition) {
      calculateBearingToTarget(targetPosition.latitude, targetPosition.longitude);
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy > 0.8) return 'text-green-500';
    if (accuracy > 0.5) return 'text-amber-500';
    return 'text-red-500';
  };

  // Removed unused getAccuracyClass function

  const getAccuracyLabel = (accuracy: number) => {
    if (accuracy > 0.8) return 'High';
    if (accuracy > 0.5) return 'Medium';
    return 'Low';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-medium">Compass Bearing</h3>
                <div className="flex items-center gap-2">
                  {isTracking ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={toggleTracking}
                        className="gap-1"
                      >
                        <XCircle className="h-4 w-4" />
                        Stop
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={toggleLock}
                        className="gap-1"
                      >
                        {isLocked ? (
                          <>
                            <LockOpen className="h-4 w-4" />
                            Unlock
                          </>
                        ) : (
                          <>
                            <LockClosed className="h-4 w-4" />
                            Lock
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={toggleTracking}
                      className="gap-1"
                    >
                      <Compass className="h-4 w-4" />
                      Start Tracking
                    </Button>
                  )}
                </div>
              </div>

              {/* Main compass UI */}
              <div className="flex flex-col items-center space-y-4">
                {/* Compass rose visualization */}
                <div 
                  className="relative w-48 h-48 rounded-full border-2 border-gray-300 flex items-center justify-center"
                  style={{
                    transform: `rotate(${compassState.heading || 0}deg)`
                  }}
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-primary rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Navigation className="h-12 w-12 text-primary" />
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {compassState.heading !== null ? `${compassState.heading}°` : "--°"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {compassState.isGPSBased ? "GPS-calculated bearing" : "Device orientation"}
                  </div>
                </div>
              </div>
              
              {/* Target position controls */}
              {isTracking && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Target Position</span>
                    <span className="text-sm text-muted-foreground">
                      {compassState.targetPosition ? 
                        `${compassState.targetPosition.latitude.toFixed(6)}, ${compassState.targetPosition.longitude.toFixed(6)}` : 
                        "Not set"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={getTargetLocation}
                      className="flex-1 gap-1"
                      disabled={isPointingMode}
                    >
                      <MapPin className="h-4 w-4" />
                      Set Target
                    </Button>
                    {compassState.currentPosition && compassState.targetPosition && (
                      <Button
                        onClick={() => calculateBearingToTarget(
                          compassState.targetPosition!.latitude,
                          compassState.targetPosition!.longitude
                        )}
                        className="flex-1 gap-1"
                        disabled={!compassState.currentPosition || !compassState.targetPosition}
                      >
                        <ArrowRight className="h-4 w-4" />
                        Calculate Bearing
                      </Button>
                    )}
                  </div>
                  {isPointingMode && (
                    <div className="mt-2 flex justify-between gap-2">
                      <Button 
                        variant="default" 
                        onClick={setTarget} 
                        className="flex-1"
                      >
                        Confirm Target
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsPointingMode(false)} 
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Accuracy indicator */}
              {isTracking && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Accuracy</span>
                    <span className="font-medium" style={{ color: getAccuracyColor(compassState.accuracy) }}>
                      {getAccuracyLabel(compassState.accuracy)}
                    </span>
                  </div>
                  <Progress 
                    value={compassState.accuracy * 100} 
                    className={`h-2 bg-${getAccuracyColor(compassState.accuracy).replace('text-', '')}`} 
                  />
                </div>
              )}

              {/* Manual input */}
              <div className="space-y-2">
                <Label htmlFor="compass-bearing">Bearing Value (0-360°)</Label>
                <div className="flex gap-2">
                  <Input 
                    id="compass-bearing"
                    type="number" 
                    min={0} 
                    max={360} 
                    step={1}
                    value={formData.compass_bearing || ''} 
                    onChange={handleCompassBearingChange}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      if (!isTracking) {
                        toggleTracking();
                      } else if (compassState.heading !== null) {
                        updateFormData({ compass_bearing: compassState.heading });
                      }
                    }}
                    className="gap-1"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Get Current
                  </Button>
                </div>
              </div>
            </div>

            {/* Help text */}
            {isTracking && (
              <div className="text-sm text-muted-foreground">
                <p>
                  For best results, hold your device flat and point it in the direction of the elephant. 
                  The bearing will be calculated automatically.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}