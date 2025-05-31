import React, { useEffect, useState } from 'react';
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
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useNetworkStatus } from '@/utils/networkStatus';
import { saveActivityOffline, getPendingActivities } from '@/utils/offlineStorage';
import { SyncStatus } from '@/components/SyncStatus';

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

function StepperContent() {
  const { currentStep, formData, goToNextStep, goToPreviousStep, isStepValid, isLastStep, resetForm } = useActivityForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOnline = useNetworkStatus();
  const currentStepIndex = ['dateTimeLocation', 'observationType', 'compassBearing', 'photo'].indexOf(currentStep);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      let userId = null;
      if (isOnline) {
        // Get the session and fetch the user's id from the users table
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error('You must be logged in to submit an activity report');
          return;
        }
        // Get the user's auth_id from the session
        const authId = session.user.id;
        if (!authId) {
          toast.error('User auth ID not found');
          return;
        }
        // Look up the app user by auth_id
        const { data: userRow, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', authId)
          .single();
        if (userError) {
          console.error('Error fetching user:', userError);
          toast.error('Error fetching user information');
          return;
        }
        if (!userRow || !userRow.id) {
          console.error('User not found in users table');
          toast.error('User not found in system');
          return;
        }
        userId = userRow.id;
      } else {
        // Use user from context if available, otherwise fallback to session
        userId = user?.id || null;
      }
      // Validate form data
      if (!formData.activity_date || !formData.activity_time || !formData.observation_type) {
        toast.error('Please fill in all required fields')
        return
      }
      // Format the activity date and time as strings
      const formattedDate =
        typeof formData.activity_date === 'string'
          ? formData.activity_date
          : formData.activity_date?.toISOString().split('T')[0];
      const formattedTime = formData.activity_time || '';
      // Prepare the report data
      const reportData = {
        activity_date: formattedDate,
        activity_time: formattedTime,
        observation_type: String(formData.observation_type),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        total_elephants: formData.total_elephants ? Number(formData.total_elephants) : null,
        male_elephants: formData.male_elephants ? Number(formData.male_elephants) : null,
        female_elephants: formData.female_elephants ? Number(formData.female_elephants) : null,
        unknown_elephants: formData.unknown_elephants ? Number(formData.unknown_elephants) : null,
        calves: formData.calves ? Number(formData.calves) : null,
        indirect_sighting_type: formData.indirect_sighting_type ? String(formData.indirect_sighting_type) : null,
        loss_type: formData.loss_type ? String(formData.loss_type) : null,
        compass_bearing: formData.compass_bearing ? Number(formData.compass_bearing) : null,
        photo_url: formData.photo_url ? String(formData.photo_url) : null,
        user_id: userId
      };
      if (isOnline) {
        // Try to submit to Supabase directly
        const { error: insertError } = await supabase
          .from('activity_reports')
          .insert([reportData]);
        if (insertError) {
          console.error('Insert error details:', insertError);
          // If online submission fails, save offline
          await saveActivityOffline(reportData);
          toast.error('Online submission failed. Report saved offline.');
        } else {
          toast.success('Activity report submitted successfully');
          resetForm();
          navigate('/');
        }
      } else {
        // Save offline
        await saveActivityOffline(reportData);
        toast.success('You are offline. Report saved locally and will be synced when online.');
        resetForm();
        navigate('/');
      }
    } catch (error: any) {
      console.error('Error submitting activity report:', error);
      toast.error(error.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  let CurrentStepComponent;
  switch (currentStep) {
    case 'dateTimeLocation':
      CurrentStepComponent = DateTimeLocationStep;
      break;
    case 'observationType':
      CurrentStepComponent = ObservationTypeStep;
      break;
    case 'compassBearing':
      CurrentStepComponent = CompassBearingStep;
      break;
    case 'photo':
      CurrentStepComponent = PhotoStep;
      break;
    default:
      CurrentStepComponent = null;
  }

  return (
    <div className="container mx-auto p-2 sm:p-4">
      {!isOnline && (
        <div className="p-2 sm:p-3 mb-3 sm:mb-4 text-xs sm:text-sm text-yellow-800 bg-yellow-100 rounded-lg dark:bg-yellow-900 dark:text-yellow-300" role="alert">
          <span className="font-medium">You are currently offline.</span> Reports will be saved locally and synced when you reconnect.
        </div>
      )}
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
                className={`
                  ${index === currentStepIndex 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' 
                    : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-200'}
                  flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-md transition-colors whitespace-nowrap text-xs sm:text-sm
                `}
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
              disabled={currentStepIndex === 0 || isSubmitting}
              className="border-gray-200 text-gray-600 hover:bg-gray-50 w-full sm:w-auto"
            >
              Previous
            </Button>
            {isLastStep() ? (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid(currentStep) || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            ) : (
              <Button
                onClick={goToNextStep}
                disabled={!isStepValid(currentStep) || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              >
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      <SyncStatus />
    </div>
  );
}

export function ActivityReportStepper() {
  return (
    <ActivityFormProvider>
      <StepperContent />
    </ActivityFormProvider>
  );
} 