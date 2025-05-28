import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useActivityForm } from '@/contexts/ActivityFormContext';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass, Lock, Unlock, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface CompassState {
  heading: number;
  accuracy: number;
  isGPSBased: boolean;
  isErratic: boolean;
}

const VELOCITY_THRESHOLD = 2; // meters per second
const ERRATIC_THRESHOLD = 45; // degrees
const SMOOTHING_WINDOW = 5; // number of readings to average

export function CompassBearingStep() {
  const { formData, setFormData } = useActivityForm();
  const [isTracking, setIsTracking] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationSamples, setCalibrationSamples] = useState<number[]>([]);
  const [calibrationOffset, setCalibrationOffset] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [compassState, setCompassState] = useState<CompassState>({
    heading: 0,
    accuracy: 0,
    isGPSBased: false,
    isErratic: false
  });
  
  const headingHistory = useRef<number[]>([]);
  const lastPosition = useRef<GeolocationPosition | null>(null);
  const lastHeading = useRef<number | null>(null);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    // Check if device is iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Load saved calibration offset
    const savedOffset = localStorage.getItem('compassCalibrationOffset');
    if (savedOffset) {
      setCalibrationOffset(parseFloat(savedOffset));
    }

    // Check if device orientation is supported
    if (window.DeviceOrientationEvent) {
      if (isIOSDevice) {
        setHasPermission(false);
      } else {
        setHasPermission(true);
      }
    } else {
      toast.error("Device orientation is not supported on this device");
      setHasPermission(false);
    }

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  const requestPermission = async () => {
    try {
      if (isIOS && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setHasPermission(true);
          toast.success("Compass access granted");
        } else {
          setHasPermission(false);
          toast.error("Compass access denied");
        }
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast.error("Failed to get compass access");
      setHasPermission(false);
    }
  };

  const handleBearingChange = (value: string) => {
    const bearing = parseInt(value);
    if (!isNaN(bearing) && bearing >= 0 && bearing <= 360) {
      setFormData({ compass_bearing: bearing });
    }
  };

  const startCalibration = () => {
    if (!hasPermission) {
      requestPermission();
      return;
    }

    setIsCalibrating(true);
    setCalibrationSamples([]);
    toast.info("Please rotate your device in a figure-8 pattern for 10 seconds");
    
    const calibrationInterval = setInterval(() => {
      if (compassState.heading !== null) {
        setCalibrationSamples(prev => [...prev, compassState.heading]);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(calibrationInterval);
      setIsCalibrating(false);
      if (calibrationSamples.length > 0) {
        const avg = calibrationSamples.reduce((a, b) => a + b, 0) / calibrationSamples.length;
        setCalibrationOffset(avg);
        localStorage.setItem('compassCalibrationOffset', avg.toString());
        toast.success("Compass calibrated successfully");
      }
    }, 10000);
  };

  const calculateHeading = (event: DeviceOrientationEvent & { webkitCompassHeading?: number }) => {
    let heading = 0;
    let accuracy = 0;

    if (isIOS && event.webkitCompassHeading) {
      // iOS devices
      heading = event.webkitCompassHeading;
      accuracy = event.webkitCompassAccuracy || 0;
    } else if (event.alpha !== null) {
      // Android devices
      const alpha = event.alpha;
      const beta = event.beta;
      const gamma = event.gamma;

      if (beta !== null && gamma !== null) {
        // Calculate heading based on device orientation
        const x = Math.cos(beta * Math.PI / 180);
        const y = Math.sin(beta * Math.PI / 180) * Math.sin(gamma * Math.PI / 180);
        const z = Math.sin(beta * Math.PI / 180) * Math.cos(gamma * Math.PI / 180);
        
        heading = Math.round((Math.atan2(y, x) * 180 / Math.PI + 360) % 360);
        accuracy = event.absolute ? 1 : 0;
      } else {
        heading = Math.round((360 - alpha) % 360);
        accuracy = event.absolute ? 1 : 0;
      }
    }

    return { heading, accuracy };
  };

  const handleDeviceOrientation = useCallback((event: DeviceOrientationEvent & { webkitCompassHeading?: number }) => {
    if (!isTracking || isLocked) return;

    const { heading, accuracy } = calculateHeading(event);
    
    if (heading !== null) {
      // Apply calibration offset
      let calibratedHeading = (heading + calibrationOffset) % 360;
      if (calibratedHeading < 0) calibratedHeading += 360;

      // Update heading history for smoothing
      headingHistory.current = [...headingHistory.current.slice(-SMOOTHING_WINDOW + 1), calibratedHeading];
      
      // Calculate smoothed heading
      const smoothedHeading = Math.round(
        headingHistory.current.reduce((a, b) => a + b, 0) / headingHistory.current.length
      );

      // Check for erratic readings
      const isErratic = headingHistory.current.length >= 3 && 
        Math.max(...headingHistory.current) - Math.min(...headingHistory.current) > ERRATIC_THRESHOLD;

      setCompassState(prev => ({
        ...prev,
        heading: smoothedHeading,
        accuracy,
        isGPSBased: false,
        isErratic
      }));

      if (!isLocked) {
        setFormData({ compass_bearing: smoothedHeading });
      }

      if (isCalibrating) {
        setCalibrationSamples(prev => [...prev, smoothedHeading]);
      }
    }
  }, [isTracking, isLocked, calibrationOffset, setFormData, isCalibrating]);

  const handleGPSUpdate = useCallback((position: GeolocationPosition) => {
    if (!isTracking || isLocked || !lastPosition.current) return;

    const { speed } = position.coords;
    if (speed && speed > VELOCITY_THRESHOLD) {
      const prevPos = lastPosition.current.coords;
      const currPos = position.coords;
      
      // Calculate heading from GPS coordinates
      const heading = Math.round(
        (Math.atan2(
          currPos.longitude - prevPos.longitude,
          currPos.latitude - prevPos.latitude
        ) * 180 / Math.PI + 360) % 360
      );

      setCompassState(prev => ({
        ...prev,
        heading,
        accuracy: 1,
        isGPSBased: true,
        isErratic: false
      }));

      if (!isLocked) {
        setFormData({ compass_bearing: heading });
      }
    }

    lastPosition.current = position;
  }, [isTracking, isLocked, setFormData]);

  useEffect(() => {
    if (isTracking && hasPermission) {
      window.addEventListener('deviceorientationabsolute', handleDeviceOrientation as EventListener);
      window.addEventListener('deviceorientation', handleDeviceOrientation as EventListener);

      // Start GPS tracking
      watchId.current = navigator.geolocation.watchPosition(
        handleGPSUpdate,
        (error) => console.error('GPS Error:', error),
        { enableHighAccuracy: true }
      );
    }
    return () => {
      window.removeEventListener('deviceorientationabsolute', handleDeviceOrientation as EventListener);
      window.removeEventListener('deviceorientation', handleDeviceOrientation as EventListener);
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [isTracking, hasPermission, handleDeviceOrientation, handleGPSUpdate]);

  const toggleTracking = () => {
    if (!hasPermission) {
      requestPermission();
      return;
    }
    setIsTracking(!isTracking);
    if (!isTracking) {
      toast.info("Compass tracking started");
    } else {
      toast.info("Compass tracking stopped");
    }
  };

  const toggleLock = () => {
    setIsLocked(!isLocked);
    if (!isLocked) {
      toast.info("Compass bearing locked");
    } else {
      toast.info("Compass bearing unlocked");
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.8) return "bg-green-500";
    if (accuracy >= 0.5) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-4">
              <Button
                variant={isTracking ? "destructive" : "default"}
                onClick={toggleTracking}
                className="flex items-center space-x-2"
              >
                <Compass className={`w-4 h-4 ${isTracking ? 'animate-spin' : ''}`} />
                <span>{isTracking ? 'Stop Tracking' : 'Start Tracking'}</span>
              </Button>

              <Button
                variant={isLocked ? "default" : "outline"}
                onClick={toggleLock}
                className="flex items-center space-x-2"
                disabled={!isTracking}
              >
                {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                <span>{isLocked ? 'Unlock' : 'Lock'}</span>
              </Button>

              <Button
                variant="outline"
                onClick={startCalibration}
                className="flex items-center space-x-2"
                disabled={!isTracking}
              >
                <RefreshCw className={`w-4 h-4 ${isCalibrating ? 'animate-spin' : ''}`} />
                <span>Calibrate</span>
              </Button>
            </div>

            <div className="text-center space-y-2">
              <Label htmlFor="compass_bearing" className="text-lg">
                Compass Bearing (0-360°)
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  id="compass_bearing"
                  min="0"
                  max="360"
                  value={formData.compass_bearing || ''}
                  onChange={(e) => handleBearingChange(e.target.value)}
                  className="w-32 text-center"
                  disabled={isTracking && !isLocked}
                />
                <span className="text-lg">°</span>
              </div>
            </div>

            {isTracking && (
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Accuracy:</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={compassState.accuracy * 100} className="w-24" />
                    <span className={`w-3 h-3 rounded-full ${getAccuracyColor(compassState.accuracy)}`} />
                  </div>
                </div>
                {compassState.isGPSBased && (
                  <div className="text-sm text-blue-500">
                    Using GPS-based heading
                  </div>
                )}
                {compassState.isErratic && (
                  <div className="flex items-center space-x-2 text-sm text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    <span>Compass readings are erratic. Please calibrate or use manual mode.</span>
                  </div>
                )}
              </div>
            )}

            <div className="text-sm text-gray-500 text-center max-w-md">
              Enter the compass bearing in degrees, where:
              <ul className="mt-2 space-y-1">
                <li>0° or 360° = North</li>
                <li>90° = East</li>
                <li>180° = South</li>
                <li>270° = West</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 