import React, { useState, useEffect, useCallback } from 'react';
import { useActivityForm } from '@/contexts/ActivityFormContext';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass, Lock, Unlock, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function CompassBearingStep() {
  const { formData, setFormData } = useActivityForm();
  const [isTracking, setIsTracking] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationSamples, setCalibrationSamples] = useState<number[]>([]);
  const [calibrationOffset, setCalibrationOffset] = useState(0);
  const [lastHeading, setLastHeading] = useState<number | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if device is iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

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
      if (lastHeading !== null) {
        setCalibrationSamples(prev => [...prev, lastHeading]);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(calibrationInterval);
      setIsCalibrating(false);
      if (calibrationSamples.length > 0) {
        const avg = calibrationSamples.reduce((a, b) => a + b, 0) / calibrationSamples.length;
        setCalibrationOffset(avg);
        toast.success("Compass calibrated successfully");
      }
    }, 10000);
  };

  const calculateHeading = (event: DeviceOrientationEvent & { webkitCompassHeading?: number }) => {
    let heading = 0;

    if (isIOS && event.webkitCompassHeading) {
      // iOS devices
      heading = event.webkitCompassHeading;
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
      } else {
        heading = Math.round((360 - alpha) % 360);
      }
    }

    return heading;
  };

  const handleDeviceOrientation = useCallback((event: DeviceOrientationEvent & { webkitCompassHeading?: number }) => {
    if (!isTracking || isLocked) return;

    const heading = calculateHeading(event);
    
    if (heading !== null) {
      // Apply calibration offset
      let calibratedHeading = (heading + calibrationOffset) % 360;
      if (calibratedHeading < 0) calibratedHeading += 360;

      // Smooth out readings
      if (lastHeading !== null) {
        const diff = Math.abs(calibratedHeading - lastHeading);
        if (diff > 180) {
          calibratedHeading = calibratedHeading > lastHeading ? calibratedHeading - 360 : calibratedHeading + 360;
        }
        calibratedHeading = Math.round(lastHeading * 0.7 + calibratedHeading * 0.3);
      }

      setLastHeading(calibratedHeading);
      if (!isLocked) {
        setFormData({ compass_bearing: calibratedHeading });
      }

      if (isCalibrating) {
        setCalibrationSamples(prev => [...prev, calibratedHeading]);
      }
    }
  }, [isTracking, isLocked, calibrationOffset, lastHeading, setFormData, isCalibrating]);

  useEffect(() => {
    if (isTracking && hasPermission) {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, [isTracking, hasPermission, handleDeviceOrientation]);

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