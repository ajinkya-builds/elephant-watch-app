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

  const handleBearingChange = (value: string) => {
    const bearing = parseInt(value);
    if (!isNaN(bearing) && bearing >= 0 && bearing <= 360) {
      setFormData({ compass_bearing: bearing });
    }
  };

  const startCalibration = () => {
    setIsCalibrating(true);
    setCalibrationSamples([]);
    toast.info("Please rotate your device in a figure-8 pattern for 10 seconds");
    
    // Stop calibration after 10 seconds
    setTimeout(() => {
      setIsCalibrating(false);
      if (calibrationSamples.length > 0) {
        const avg = calibrationSamples.reduce((a, b) => a + b, 0) / calibrationSamples.length;
        setCalibrationOffset(avg);
        toast.success("Compass calibrated successfully");
      }
    }, 10000);
  };

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    if (isLocked || isCalibrating) return;
    
    let heading: number | null = null;
    
    if ('webkitCompassHeading' in event) {
      // iOS devices
      heading = (event as any).webkitCompassHeading;
    } else if (event.alpha !== null) {
      // Android devices
      const alpha = event.alpha;
      const beta = event.beta;
      const gamma = event.gamma;
      
      // Convert to heading using device orientation
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

    if (heading !== null) {
      // Apply calibration offset
      heading = (heading + calibrationOffset) % 360;
      
      // Smooth out readings
      if (lastHeading !== null) {
        const diff = Math.abs(heading - lastHeading);
        if (diff > 180) {
          heading = heading > lastHeading ? heading - 360 : heading + 360;
        }
        heading = Math.round(lastHeading * 0.7 + heading * 0.3);
      }
      
      setLastHeading(heading);
      setFormData({ compass_bearing: heading });
      
      if (isCalibrating && heading !== null) {
        setCalibrationSamples(prev => [...prev, heading]);
      }
    }
  }, [isLocked, isCalibrating, calibrationOffset, lastHeading, setFormData]);

  const startCompassTracking = () => {
    if (!window.DeviceOrientationEvent) {
      toast.error("Device compass is not supported on this device");
      return;
    }

    // Request permission for iOS 13+ devices
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((permissionState: string) => {
          if (permissionState === 'granted') {
            enableCompassTracking();
          } else {
            toast.error("Permission to access device orientation was denied");
          }
        })
        .catch((error: Error) => {
          toast.error("Error requesting device orientation permission");
          console.error(error);
        });
    } else {
      // For non-iOS devices or older iOS versions
      enableCompassTracking();
    }
  };

  const enableCompassTracking = () => {
    setIsTracking(true);
    setIsLocked(false);
    window.addEventListener('deviceorientation', handleOrientation);
    toast.success("Compass tracking started");
  };

  const stopCompassTracking = () => {
    setIsTracking(false);
    window.removeEventListener('deviceorientation', handleOrientation);
  };

  const toggleLock = () => {
    setIsLocked(!isLocked);
    toast.success(isLocked ? "Compass unlocked" : "Compass bearing locked");
  };

  useEffect(() => {
    return () => {
      stopCompassTracking();
    };
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Compass 
                className={`w-16 h-16 ${isTracking ? 'text-green-600' : 'text-gray-400'}`}
                style={{
                  transform: `rotate(${formData.compass_bearing || 0}deg)`,
                  transition: 'transform 0.3s ease'
                }}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={isTracking ? stopCompassTracking : startCompassTracking}
                className={isTracking ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
              >
                {isTracking ? 'Stop Tracking' : 'Start Compass'}
              </Button>
              
              {isTracking && (
                <>
                  <Button
                    type="button"
                    onClick={toggleLock}
                    variant="outline"
                    className={isLocked ? 'border-orange-500 text-orange-500' : 'border-green-500 text-green-500'}
                  >
                    {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </Button>
                  <Button
                    type="button"
                    onClick={startCalibration}
                    variant="outline"
                    className="border-blue-500 text-blue-500"
                    disabled={isCalibrating}
                  >
                    <RefreshCw className={`w-4 h-4 ${isCalibrating ? 'animate-spin' : ''}`} />
                  </Button>
                </>
              )}
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