import React from 'react';
import { useActivityForm } from '@/contexts/ActivityFormContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, RefreshCw } from 'lucide-react';

export function DateTimeLocationStep() {
  const { formData, updateFormData } = useActivityForm();
  const { latitude, longitude, error: geoError } = useGeolocation();



  const handleFetchCurrentData = () => {
    // Set current date and time
    const now = new Date();
    updateFormData({
      activity_date: now.toISOString().split('T')[0],
      activity_time: now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
    });
    
    // Update location from geolocation hook
    if (latitude && longitude) {
      updateFormData({ latitude, longitude });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={handleFetchCurrentData}
          className="flex items-center gap-2 text-sm"
        >
          <RefreshCw className="h-4 w-4" />
          Get Location, Date and Time
        </Button>
      </div>
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Label htmlFor="activity_date">Date</Label>
            <Clock className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            id="activity_date"
            type="date"
            value={formData.activity_date instanceof Date 
              ? formData.activity_date.toISOString().split('T')[0]
              : formData.activity_date || ''}
            onChange={(e) => updateFormData({ activity_date: e.target.value })}
            required
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <Label htmlFor="activity_time">Time</Label>
            <Clock className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            id="activity_time"
            type="time"
            value={formData.activity_time || ''}
            onChange={(e) => updateFormData({ activity_time: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Location</Label>
            <MapPin className="h-4 w-4 text-gray-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude" className="text-sm text-gray-500">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude || ''}
                onChange={(e) => updateFormData({ latitude: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label htmlFor="longitude" className="text-sm text-gray-500">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude || ''}
                onChange={(e) => updateFormData({ longitude: parseFloat(e.target.value) })}
                required
              />
            </div>
          </div>
          {geoError && (
            <p className="text-sm text-red-500 mt-1">
              Error getting location: {geoError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 