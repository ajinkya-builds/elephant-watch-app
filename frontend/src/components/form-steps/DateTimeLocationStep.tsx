import React, { useEffect } from 'react';
import { useActivityForm } from '@/contexts/ActivityFormContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGeolocation } from '@/hooks/useGeolocation';

export function DateTimeLocationStep() {
  const { formData, updateFormData } = useActivityForm();
  const { latitude, longitude, error: geoError } = useGeolocation();

  useEffect(() => {
    if (latitude && longitude) {
      updateFormData({ latitude, longitude });
    }
  }, [latitude, longitude, updateFormData]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="activity_date">Date</Label>
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
          <Label htmlFor="activity_time">Time</Label>
          <Input
            id="activity_time"
            type="time"
            value={formData.activity_time || ''}
            onChange={(e) => updateFormData({ activity_time: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Location</Label>
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