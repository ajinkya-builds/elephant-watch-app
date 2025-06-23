import React, { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useActivityForm } from '@/contexts/ActivityFormContext';
import { Camera, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export const PhotoStep: React.FC = () => {
  const { formData, updateFormData, setIsPhotoUploading } = useActivityForm();
  const [isUploading, setIsUploadingLocal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    console.log('handleFileChange: Starting photo upload process');
    setIsUploadingLocal(true);
    setIsPhotoUploading(true);
    console.log('handleFileChange: isUploadingLocal and isPhotoUploading set to true');
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `activity-photos/${fileName}`;

      const uploadPromise = supabase.storage
        .from('photos')
        .upload(filePath, file);

      const timeoutPromise = new Promise<never>((_, reject) => {
        const id = setTimeout(() => {
          clearTimeout(id);
          reject(new Error('Photo upload timed out (30 seconds)'));
        }, 30000); // 30 seconds
      });

      const result = await Promise.race([
        uploadPromise,
        timeoutPromise
      ]);

      // Check if the result is an error from the timeout or Supabase
      if (result && typeof result === 'object' && 'error' in result && result.error) {
        console.error('handleFileChange: Supabase upload error:', result.error);
        throw result.error;
      } else if (result instanceof Error) { // This handles the timeout error
        console.error('handleFileChange: Timeout error:', result.message);
        toast.error(result.message); // Display the timeout message to the user
        throw result; // Re-throw to ensure finally block is reached
      }

      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      updateFormData({ photo_url: publicUrl });
      console.log('handleFileChange: Photo uploaded successfully. Public URL:', publicUrl);
      toast.success('Photo uploaded successfully');
    } catch (error) {
      console.error('handleFileChange: Caught error during photo upload:', error);
      // Only show a generic error if it's not the specific timeout error already handled
      if (!(error instanceof Error && error.message.includes('timed out')))
      {
        toast.error('Failed to upload photo. Please try again.');
      }
    } finally {
      console.log('handleFileChange: Finally block executed. Setting isUploadingLocal and isPhotoUploading to false');
      setIsUploadingLocal(false);
      setIsPhotoUploading(false);
    }
  };

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label>Photo</Label>
              <div className="mt-2 flex flex-col items-center justify-center">
                {formData.photo_url ? (
                  <div className="relative w-full max-w-md">
                    <img
                      src={formData.photo_url}
                      alt="Activity photo"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => updateFormData({ photo_url: undefined })}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="w-full max-w-md h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
                    <Camera className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 mb-4">No photo selected</p>
                    <Button
                      onClick={handleCameraClick}
                      disabled={isUploading}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {isUploading ? 'Uploading...' : 'Upload Photo'}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 