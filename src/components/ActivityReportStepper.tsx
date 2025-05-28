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
  const { currentStep, formData, goToNextStep, goToPreviousStep, isStepValid, isLastStep } = useActivityForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentStepIndex = ['dateTimeLocation', 'observationType', 'compassBearing', 'photo'].indexOf(currentStep);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
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

      console.log('Auth ID:', authId);

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

      const userId = userRow.id;
      console.log('User ID:', userId);

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

      // Explicitly cast and log types
      const latitude = Number(formData.latitude);
      const longitude = Number(formData.longitude);
      console.log('Latitude:', latitude, typeof latitude);
      console.log('Longitude:', longitude, typeof longitude);

      // Prepare the report data with guaranteed types
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
        user_id: userId // Use the app user id from public.users
      };
      console.log('reportData payload:', reportData);
      Object.entries(reportData).forEach(([k, v]) => {
        console.log(`${k}:`, v, typeof v);
      });

      // Insert the activity report
      const { error: insertError } = await supabase
        .from('activity_reports')
        .insert([reportData])

      if (insertError) {
        console.error('Insert error details:', insertError);
        throw insertError;
      }

      toast.success('Activity report submitted successfully')
      navigate('/')
    } catch (error: unknown) {
      console.error('Error submitting activity report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit activity report';
      toast.error(errorMessage);
    }
  }

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
    <Card className="w-full bg-white rounded-xl shadow-sm border border-gray-100">
      <CardHeader className="space-y-6 p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Elephant Watch Report
          </CardTitle>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <Progress 
              value={((currentStepIndex + 1) / steps.length) * 100} 
              className="w-48 h-2 bg-gray-100" 
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {steps.map((step, index) => (
            <Button
              key={step.type}
              variant={index === currentStepIndex ? "default" : "outline"}
              size="sm"
              className={`
                ${index === currentStepIndex 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' 
                  : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-200'}
                flex items-center gap-2 px-4 py-2 rounded-md transition-colors
              `}
              disabled={index > currentStepIndex && !isStepValid(steps[index - 1].type)}
            >
              {step.icon}
              {step.title}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {CurrentStepComponent && <CurrentStepComponent />}

        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={currentStepIndex === 0 || isSubmitting}
            className="border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Previous
          </Button>
          {isLastStep() ? (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid(currentStep) || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          ) : (
            <Button
              onClick={goToNextStep}
              disabled={!isStepValid(currentStep) || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ActivityReportStepper() {
  return (
    <ActivityFormProvider>
      <StepperContent />
    </ActivityFormProvider>
  );
} 