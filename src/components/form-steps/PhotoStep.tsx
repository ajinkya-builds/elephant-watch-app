import React, { useCallback, useState, useRef } from 'react';
import { useActivityForm } from '@/contexts/ActivityFormContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

export function PhotoStep() {
  const { formData, setFormData } = useActivityForm();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(formData.photo_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      if (!user) {
        toast.error('Please log in to upload photos');
        return;
      }

      if (!file) {
        toast.error('No file selected');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }

      setIsUploading(true);
      toast.info('Uploading photo...');

      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `activity-photos/${fileName}`;

      // Create a URL for local preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Upload to Supabase Storage using regular client
      const { error: uploadError } = await supabase.storage
        .from('elephant-watch')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Failed to upload photo. Please try again.');
        // Reset preview and form data on error
        setPreviewUrl(null);
        setFormData({
          ...formData,
          photo_url: undefined
        });
        return;
      }

      // Update form data with the file path
      setFormData({
        ...formData,
        photo_url: filePath
      });

      toast.success('Photo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo. Please try again.');
      // Reset form data and preview on error
      setPreviewUrl(null);
      setFormData({
        ...formData,
        photo_url: undefined
      });
    } finally {
      setIsUploading(false);
    }
  }, [formData, setFormData, user]);

  const handleRemovePhoto = useCallback(async () => {
    if (!formData.photo_url) return;

    try {
      setIsUploading(true);

      // Remove from Supabase Storage if it was uploaded
      if (formData.photo_url.startsWith('activity-photos/')) {
        const { error } = await supabase.storage
          .from('elephant-watch')
          .remove([formData.photo_url]);

        if (error) {
          console.error('Error removing photo:', error);
          toast.error('Failed to remove photo');
          return;
        }
      }

      // Clear the preview and form data
      setPreviewUrl(null);
      setFormData({
        ...formData,
        photo_url: undefined
      });

      toast.success('Photo removed successfully!');
    } catch (error) {
      console.error('Error removing photo:', error);
      toast.error('Failed to remove photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [formData, setFormData]);

  const handleTakePhoto = () => {
    if (!user) {
      toast.error('Please log in to take photos');
      return;
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleUploadPhoto = () => {
    if (!user) {
      toast.error('Please log in to upload photos');
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-4">
          {previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full h-auto rounded-lg shadow-lg"
                style={{ maxHeight: '300px' }}
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemovePhoto}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Camera className="w-16 h-16 text-gray-400" />
              <p className="text-sm text-gray-500 text-center">
                Upload a photo of the elephant or signs of elephant activity (optional)
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Hidden Camera Input */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file);
                    }
                  }}
                  disabled={isUploading}
                />
                
                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file);
                    }
                  }}
                  disabled={isUploading}
                />

                {/* Camera Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTakePhoto}
                  disabled={isUploading}
                  className="w-full sm:w-auto"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Take Photo'}
                </Button>

                {/* Upload Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUploadPhoto}
                  disabled={isUploading}
                  className="w-full sm:w-auto"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload Photo'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 