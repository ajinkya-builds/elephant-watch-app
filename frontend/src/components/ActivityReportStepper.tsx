import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MapPin, FileText, Compass, Camera } from "lucide-react";
import { ActivityFormProvider, useActivityForm, FormStep } from '@/contexts/ActivityFormContext';
import { DateTimeLocationStep } from '@/components/form-steps/DateTimeLocationStep';
import { ObservationTypeStep } from '@/components/form-steps/ObservationTypeStep';
import { CompassBearingStep } from '@/components/form-steps/CompassBearingStep';
import { PhotoStep } from '@/components/form-steps/PhotoStep';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/NewAuthContext';
import { supabase } from '@/lib/supabaseClient';
import { ActivityReport, ObservationType, IndirectSightingType, LossType } from '@/types/activity-report';

interface StepConfig {
  type: FormStep;
  title: string;
  icon: React.ReactNode;
  component: React.ComponentType;
}

const steps: StepConfig[] = [
  {
    type: 'dateTimeLocation',
    title: "Date/Time & Location",
    icon: <MapPin className="w-5 h-5" />,
    component: DateTimeLocationStep,
  },
  {
    type: 'observationType',
    title: "Type of Observation",
    icon: <FileText className="w-5 h-5" />,
    component: ObservationTypeStep,
  },
  {
    type: 'compassBearing',
    title: "Compass Bearing",
    icon: <Compass className="w-5 h-5" />,
    component: CompassBearingStep,
  },
  {
    type: 'photo',
    title: "Photo",
    icon: <Camera className="w-5 h-5" />,
    component: PhotoStep,
  },
];

interface ActivityReportStepperProps {
  onSubmit: (reportData: Partial<ActivityReport>) => Promise<void>;
  isSubmitting: boolean;
}

interface ActivityFormData {
  observation_type: ObservationType;
  latitude: string | number;
  longitude: string | number;
  photo_url?: string | null;
  indirect_sighting_type?: IndirectSightingType | null;
  loss_type?: LossType | null;
  activity_date?: Date;
  activity_time?: string;
}

const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().split('T')[0];
};

const StepperContent: React.FC<ActivityReportStepperProps> = ({ onSubmit, isSubmitting: externalIsSubmitting }) => {
  const { currentStep, formData, goToNextStep, goToPreviousStep, isStepValid, isLastStep, resetForm, isPhotoUploading } = useActivityForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentStepIndex = steps.findIndex(step => step.type === currentStep);

  
  const isActuallySubmitting = isSubmitting || externalIsSubmitting;

  const handleSubmit = useCallback(async () => {
    console.log('handleSubmit: Starting form submission.');
    try {
      setIsSubmitting(true);
      console.log('handleSubmit: isSubmitting set to true.');

      
      if (!formData.activity_date || !formData.activity_time || !formData.observation_type) {
        toast.error('Please fill in all required fields');
        return;
      }

      let userId = user?.id || null;
      
      if (!userId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          userId = session.user.id;
        }
      }
      
      const formattedDate = formatDate(formData.activity_date);
      const formattedTime = formData.activity_time || '';
      
      // Prepare the report data with all required fields
      const reportData: Partial<ActivityReport> = {
        // Required fields
        user_id: userId || '',

        activity_date: new Date(formattedDate),
        activity_time: formattedTime,
        observation_type: formData.observation_type as ObservationType,
        latitude: String(formData.latitude || '0'),
        longitude: String(formData.longitude || '0'),

        
        // Optional fields with type conversion
        total_elephants: formData.total_elephants ? Number(formData.total_elephants) : undefined,
        male_elephants: formData.male_elephants ? Number(formData.male_elephants) : undefined,
        female_elephants: formData.female_elephants ? Number(formData.female_elephants) : undefined,
        unknown_elephants: formData.unknown_elephants ? Number(formData.unknown_elephants) : undefined,
        calves: formData.calves ? Number(formData.calves) : undefined,
        compass_bearing: formData.compass_bearing ? Number(formData.compass_bearing) : undefined,
        photo_url: formData.photo_url || undefined,
        indirect_sighting_type: formData.indirect_sighting_type as IndirectSightingType | undefined,
        loss_type: formData.loss_type as LossType | undefined
      };
      
      // Ensure required fields are present
      if (!reportData.observation_type) {
        throw new Error('Observation type is required');
      }
      if (!reportData.latitude || !reportData.longitude) {
        throw new Error('Location is required');
      }
      
      try {
        await onSubmit(reportData);
        toast.success('Activity report submitted successfully');
        resetForm();
        navigate('/');
      } catch (error) {
        console.error('handleSubmit: Error submitting report:', error);
        toast.error('Failed to submit report');
      } finally {
        // Ensure isSubmitting is set to false even if onSubmit throws an error
        // This is already handled by the outer finally, but adding here for clarity/redundancy
        setIsSubmitting(false);
        console.log('handleSubmit: Inner try-catch finally block. isSubmitting set to false.');
      }
    } catch (error: any) {
      console.error('Error submitting activity report:', error);
      toast.error(error.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
      console.log('handleSubmit: Outer finally block. isSubmitting set to false.');
    }
  }, [formData, navigate, onSubmit, resetForm, user]);

  const CurrentStepComponent = steps.find(step => step.type === currentStep)?.component || null;



  return (
    <div className="container mx-auto p-2 sm:p-4">
      <Card className="w-full max-w-full sm:max-w-2xl bg-white rounded-xl shadow-sm border border-gray-100 mx-auto">
        <CardHeader className="space-y-4 sm:space-y-6 p-4 sm:p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <CardTitle className="text-lg sm:text-2xl font-bold text-gray-900">
              Elephant Watch Report
            </CardTitle>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <span className="text-xs sm:text-sm font-medium text-gray-600">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
              <Progress 
                value={((currentStepIndex + 1) / steps.length) * 100} 
                className="w-full sm:w-48 h-2 bg-gray-100" 
              />
            </div>
          </div>
          <div className="flex flex-nowrap overflow-x-auto gap-2 pb-2 sm:pb-0 -mx-2 sm:mx-0 px-2 sm:px-0">
            {steps.map((step, index) => (
              <Button
                key={step.type}
                variant={index === currentStepIndex ? "default" : "outline"}
                size="sm"
                className={
                  `flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-md transition-colors whitespace-nowrap text-xs sm:text-sm
                  ${index === currentStepIndex 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' 
                    : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-200'}`
                }
                disabled={index > currentStepIndex && !isStepValid(steps[index - 1].type)}
              >
                {step.icon}
                {step.title}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {CurrentStepComponent && <CurrentStepComponent />}
          <div className="flex flex-col sm:flex-row justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100 gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              disabled={currentStepIndex === 0 || isActuallySubmitting}
              className="border-gray-200 text-gray-600 hover:bg-gray-50 w-full sm:w-auto"
            >
              Previous
            </Button>
            {isLastStep() ? (
              <Button
                onClick={handleSubmit}
                disabled={(() => {
                  const isDisabled = !isStepValid(currentStep) || isActuallySubmitting || isPhotoUploading;
                  console.log(`Submit button disabled check: isStepValid(${currentStep})=${isStepValid(currentStep)}, isActuallySubmitting=${isActuallySubmitting}, isPhotoUploading=${isPhotoUploading}. Result: ${isDisabled}`);
                  return isDisabled;
                })()}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              >
                {isPhotoUploading ? 'Uploading Photo...' : (isActuallySubmitting ? 'Submitting...' : 'Submit Report')}
              </Button>
            ) : (
              <Button
                onClick={goToNextStep}
                disabled={!isStepValid(currentStep) || isActuallySubmitting || isPhotoUploading}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              >
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const ActivityReportStepper: React.FC<ActivityReportStepperProps> = (props) => {
  return (
    <ActivityFormProvider>
      <>
        <StepperContent {...props} />
      </>
    </ActivityFormProvider>
  );
};
