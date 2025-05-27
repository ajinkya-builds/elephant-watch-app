import React, { useState, useEffect } from 'react';
import { useActivityForm } from '@/contexts/ActivityFormContext';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";

export function CompassBearingStep() {
  const { formData, setFormData } = useActivityForm();
  const [isTracking, setIsTracking] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const handleBearingChange = (value: string) => {
    const bearing = parseInt(value);
    if (!isNaN(bearing) && bearing >= 0 && bearing <= 360) {
      setFormData({ compass_bearing: bearing });
    }
  };

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
    window.addEventListener('deviceorientationabsolute', handleOrientation);
    window.addEventListener('deviceorientation', handleOrientation);
    toast.success("Compass tracking started");
  };

  const stopCompassTracking = () => {
    setIsTracking(false);
    window.removeEventListener('deviceorientationabsolute', handleOrientation);
    window.removeEventListener('deviceorientation', handleOrientation);
  };

  const handleOrientation = (event: DeviceOrientationEvent) => {
    if (isLocked) return;
    
    // Get the compass heading
    let heading: number | null = null;
    
    if ('webkitCompassHeading' in event) {
      // iOS devices
      heading = (event as any).webkitCompassHeading;
    } else if (event.alpha !== null) {
      // Android devices
      heading = 360 - event.alpha;
    }

    if (heading !== null) {
      // Round to nearest degree
      const roundedHeading = Math.round(heading);
      setFormData({ compass_bearing: roundedHeading });
    }
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
                <Button
                  type="button"
                  onClick={toggleLock}
                  variant="outline"
                  className={isLocked ? 'border-orange-500 text-orange-500' : 'border-green-500 text-green-500'}
                >
                  {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </Button>
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