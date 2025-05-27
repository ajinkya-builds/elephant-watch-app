import React from 'react';
import { useActivityForm } from '@/contexts/ActivityFormContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";

export function DateTimeLocationStep() {
  const { formData, setFormData } = useActivityForm();

  const handleFetchLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const now = new Date();
      const formattedTime = now.toTimeString().split(' ')[0].substring(0, 5);
      
      setFormData({
        ...formData,
        activity_date: now,
        activity_time: formattedTime,
        latitude: position.coords.latitude.toFixed(6),
        longitude: position.coords.longitude.toFixed(6),
      });

      toast.success("Location, date & time fetched successfully!");
    } catch (error) {
      console.error('Error fetching location:', error);
      toast.error("Failed to fetch location. Please enter manually.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleFetchLocation}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Get Current Location & Time
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="activity_date">Date</Label>
          <div className="relative">
            <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="date"
              id="activity_date"
              value={formData.activity_date ? new Date(formData.activity_date).toISOString().split('T')[0] : ''}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value + 'T00:00:00') : null;
                setFormData({
                  ...formData,
                  activity_date: date
                });
              }}
              className="pl-8"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="activity_time">Time</Label>
          <div className="relative">
            <Clock className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="time"
              id="activity_time"
              value={formData.activity_time || ''}
              onChange={(e) => {
                const timeValue = e.target.value;
                setFormData({
                  ...formData,
                  activity_time: timeValue
                });
              }}
              className="pl-8"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            type="text"
            id="latitude"
            placeholder="e.g., 23.4536"
            value={formData.latitude || ''}
            onChange={(e) => {
              const value = e.target.value.trim();
              const num = parseFloat(value);
              if (value === '' || (!isNaN(num) && num >= -90 && num <= 90)) {
                setFormData({
                  ...formData,
                  latitude: value
                });
              }
            }}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            type="text"
            id="longitude"
            placeholder="e.g., 81.4763"
            value={formData.longitude || ''}
            onChange={(e) => {
              const value = e.target.value.trim();
              const num = parseFloat(value);
              if (value === '' || (!isNaN(num) && num >= -180 && num <= 180)) {
                setFormData({
                  ...formData,
                  longitude: value
                });
              }
            }}
            required
          />
        </div>
      </div>
    </div>
  );
} 