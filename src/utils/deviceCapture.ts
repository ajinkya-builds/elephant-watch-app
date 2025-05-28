interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface Compass {
  bearing: number;
  accuracy: number;
}

export const capturePhoto = async (): Promise<string> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } 
    });
    
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    
    video.srcObject = stream;
    await video.play();
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    
    stream.getTracks().forEach(track => track.stop());
    
    return canvas.toDataURL('image/jpeg', 0.8);
  } catch (error) {
    console.error('Error capturing photo:', error);
    throw new Error('Failed to capture photo');
  }
};

export const getLocationAndBearing = async (): Promise<{ location: Location; compass: Compass }> => {
  const location = await new Promise<Location>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      pos => resolve({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy
      }),
      reject,
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
  
  const compass = await new Promise<Compass>((resolve) => {
    const handler = (event: DeviceOrientationEvent) => {
      resolve({
        bearing: Math.round(event.alpha || 0),
        accuracy: (event as any).webkitCompassAccuracy || 0
      });
    };
    
    window.addEventListener('deviceorientationabsolute', handler as EventListener, { once: true });
    setTimeout(() => {
      window.addEventListener('deviceorientation', handler as EventListener, { once: true });
    }, 1000);
  });
  
  return { location, compass };
}; 