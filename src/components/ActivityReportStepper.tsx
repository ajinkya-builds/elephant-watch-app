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

      const formattedTime =
        typeof formData.activity_time === 'string'
          ? (formData.activity_time.length === 5
              ? formData.activity_time + ':00'
              : formData.activity_time)
          : formData.activity_time?.toString().slice(0, 8); // fallback

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
    } catch (error) {
      console.error('Error submitting activity report:', error)
      toast.error(error.message || 'Failed to submit activity report')
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
    <Card className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg">
      <CardHeader className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-green-800">
            Elephant Watch Report
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <Progress value={((currentStepIndex + 1) / steps.length) * 100} className="w-48" />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {steps.map((step, index) => (
            <Button
              key={step.type}
              variant={index === currentStepIndex ? "default" : "outline"}
              size="sm"
              className={`
                ${index === currentStepIndex ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-white hover:bg-green-100'}
                flex items-center gap-2 px-4 py-2 rounded-md
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

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={currentStepIndex === 0 || isSubmitting}
          >
            Previous
          </Button>
          {isLastStep() ? (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid(currentStep) || isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          ) : (
            <Button
              onClick={goToNextStep}
              disabled={!isStepValid(currentStep) || isSubmitting}
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