import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useActivityForm } from '@/contexts/ActivityFormContext';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass, Lock, Unlock, RefreshCw, AlertCircle, Camera, Navigation } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ActivityReport } from '@/types/activity-report';

interface CompassState {
  heading: number;
  accuracy: number;
  isGPSBased: boolean;
  isErratic: boolean;
  speed: number;
}

const VELOCITY_THRESHOLD = 1; // meters per second
const ERRATIC_THRESHOLD = 45; // degrees
const SMOOTHING_WINDOW = 5; // number of readings to average
const GPS_ACCURACY_THRESHOLD = 10; // meters

export function CompassBearingStep() {
  const { formData, updateFormData } = useActivityForm();
  const [isTracking, setIsTracking] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationSamples, setCalibrationSamples] = useState<number[]>([]);
  const [calibrationOffset, setCalibrationOffset] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [compassMode, setCompassMode] = useState<'gps' | 'manual' | 'visual'>('gps');
  const [compassState, setCompassState] = useState<CompassState>({
    heading: 0,
    accuracy: 0,
    isGPSBased: false,
    isErratic: false,
    speed: 0
  });
  
  const headingHistory = useRef<number[]>([]);
  const lastPosition = useRef<GeolocationPosition | null>(null);
  const lastHeading = useRef<number | null>(null);
  const watchId = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Check if device is iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Load saved calibration offset
    const savedOffset = localStorage.getItem('compassCalibrationOffset');
    if (savedOffset) {
      setCalibrationOffset(parseFloat(savedOffset));
    }

    // Load saved compass mode
    const savedMode = localStorage.getItem('compassMode');
    if (savedMode) {
      setCompassMode(savedMode as 'gps' | 'manual' | 'visual');
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
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
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

  const handleCompassBearingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 360) {
      updateFormData({ compass_bearing: value });
    }
  };

  const startCalibration = () => {
    if (compassMode === 'visual') {
      startVisualCalibration();
    } else {
      startManualCalibration();
    }
  };

  const startManualCalibration = () => {
    setIsCalibrating(true);
    toast.info("Point your device north and tap 'Set North' when ready");
  };

  const setNorth = () => {
    if (lastHeading.current !== null) {
      const offset = (360 - lastHeading.current) % 360;
      setCalibrationOffset(offset);
      localStorage.setItem('compassCalibrationOffset', offset.toString());
      setIsCalibrating(false);
      toast.success("North direction set successfully");
    }
  };

  const startVisualCalibration = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCalibrating(true);
        toast.info("Align the camera with a known landmark and tap 'Set Direction'");
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error("Failed to access camera");
    }
  };

  const setVisualDirection = () => {
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Draw the current frame
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get the image data for analysis
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Here you would implement image analysis to determine direction
        // For now, we'll use a placeholder value
        const visualHeading = 0; // Replace with actual image analysis
        
        setCalibrationOffset(visualHeading);
        localStorage.setItem('compassCalibrationOffset', visualHeading.toString());
        setIsCalibrating(false);
        toast.success("Direction set from visual reference");
      }
    }
  };

  const handleGPSUpdate = useCallback((position: GeolocationPosition) => {
    if (!isTracking || isLocked || !lastPosition.current) {
      lastPosition.current = position;
      return;
    }

    const { speed, accuracy } = position.coords;
    const prevPos = lastPosition.current.coords;
    const currPos = position.coords;

    // Update compass state with speed
    setCompassState(prev => ({
      ...prev,
      speed: speed || 0,
      accuracy: accuracy <= GPS_ACCURACY_THRESHOLD ? 1 : 0.5
    }));

    // Use GPS heading when moving fast enough
    if (speed && speed > VELOCITY_THRESHOLD) {
      const heading = Math.round(
        (Math.atan2(
          currPos.longitude - prevPos.longitude,
          currPos.latitude - prevPos.latitude
        ) * 180 / Math.PI + 360) % 360
      );

      setCompassState(prev => ({
        ...prev,
        heading,
        isGPSBased: true,
        isErratic: false
      }));

      if (!isLocked) {
        updateFormData({ compass_bearing: heading });
      }
    } else if (compassMode === 'manual' && lastHeading.current !== null) {
      // Use manual calibration when not moving
      const calibratedHeading = (lastHeading.current + calibrationOffset) % 360;
      setCompassState(prev => ({
        ...prev,
        heading: calibratedHeading,
        isGPSBased: false,
        isErratic: false
      }));

      if (!isLocked) {
        updateFormData({ compass_bearing: calibratedHeading });
      }
    }

    lastPosition.current = position;
  }, [isTracking, isLocked, updateFormData, compassMode, calibrationOffset]);

  const handleDeviceOrientation = useCallback((event: DeviceOrientationEvent & { webkitCompassHeading?: number }) => {
    if (!isTracking || isLocked) return;

    let heading = 0;
    if (isIOS && event.webkitCompassHeading) {
      heading = event.webkitCompassHeading;
    } else if (event.alpha !== null) {
      heading = Math.round((360 - event.alpha) % 360);
    }

    lastHeading.current = heading;

    // Only use device orientation in manual mode when not moving
    if (compassMode === 'manual' && compassState.speed <= VELOCITY_THRESHOLD) {
      const calibratedHeading = (heading + calibrationOffset) % 360;
      
      // Update heading history for smoothing
      headingHistory.current = [...headingHistory.current.slice(-SMOOTHING_WINDOW + 1), calibratedHeading];
      
      // Calculate smoothed heading
      const smoothedHeading = Math.round(
        headingHistory.current.reduce((a, b) => a + b, 0) / headingHistory.current.length
      );

      setCompassState(prev => ({
        ...prev,
        heading: smoothedHeading,
        accuracy: 0.8,
        isGPSBased: false,
        isErratic: false
      }));

      if (!isLocked) {
        updateFormData({ compass_bearing: smoothedHeading });
      }
    }
  }, [isTracking, isLocked, calibrationOffset, updateFormData, compassMode, compassState.speed]);

  useEffect(() => {
    if (isTracking) {
      // Start GPS tracking
      watchId.current = navigator.geolocation.watchPosition(
        handleGPSUpdate,
        (error) => console.error('GPS Error:', error),
        { enableHighAccuracy: true }
      );

      // Add device orientation listener for manual mode
      if (compassMode === 'manual') {
        window.addEventListener('deviceorientation', handleDeviceOrientation as EventListener);
      }
    }
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
      window.removeEventListener('deviceorientation', handleDeviceOrientation as EventListener);
    };
  }, [isTracking, handleGPSUpdate, handleDeviceOrientation, compassMode]);

  const toggleTracking = () => {
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

  const handleModeChange = (mode: 'gps' | 'manual' | 'visual') => {
    setCompassMode(mode);
    localStorage.setItem('compassMode', mode);
    toast.info(`Switched to ${mode} mode`);
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
            <Tabs defaultValue={compassMode} onValueChange={(v) => handleModeChange(v as 'gps' | 'manual' | 'visual')}>
              <TabsList>
                <TabsTrigger value="gps">
                  <Navigation className="w-4 h-4 mr-2" />
                  GPS
                </TabsTrigger>
                <TabsTrigger value="manual">
                  <Compass className="w-4 h-4 mr-2" />
                  Manual
                </TabsTrigger>
                <TabsTrigger value="visual">
                  <Camera className="w-4 h-4 mr-2" />
                  Visual
                </TabsTrigger>
              </TabsList>
            </Tabs>

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

              {isCalibrating ? (
                <Button
                  variant="default"
                  onClick={compassMode === 'visual' ? setVisualDirection : setNorth}
                  className="flex items-center space-x-2"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Set {compassMode === 'visual' ? 'Direction' : 'North'}</span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={startCalibration}
                  className="flex items-center space-x-2"
                  disabled={!isTracking}
                >
                  <RefreshCw className={`w-4 h-4 ${isCalibrating ? 'animate-spin' : ''}`} />
                  <span>Calibrate</span>
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
                  onChange={handleCompassBearingChange}
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
                    Using GPS-based heading (Speed: {compassState.speed.toFixed(1)} m/s)
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

            {compassMode === 'visual' && isCalibrating && (
              <div className="relative w-full aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover rounded-lg"
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                  width={640}
                  height={480}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 border-2 border-white rounded-full opacity-50" />
                </div>
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