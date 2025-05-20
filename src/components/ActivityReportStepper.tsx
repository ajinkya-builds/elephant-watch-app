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
import { adminClient } from '@/lib/supabaseClient';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

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

  const handleSubmit = async () => {
    try {
      if (!isStepValid(currentStep)) {
        toast.error('Please fill in all required fields');
        return;
      }

      setIsSubmitting(true);

      if (!user) {
        toast.error('You must be logged in to submit a report');
        return;
      }

      console.log('Current user:', user);

      // First get all users to debug
      const { data: allUsers, error: usersError } = await adminClient
        .from('users')
        .select('*');

      console.log('All users:', allUsers);
      
      if (usersError) {
        console.error('Error fetching users:', usersError);
        toast.error('Failed to verify user access');
        return;
      }

      // Now try to find the specific user
      const { data: userData, error: userError } = await adminClient
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('Found user data:', userData);

      if (userError || !userData) {
        console.error('User verification error:', userError);
        toast.error('Failed to verify user. Please try logging in again.');
        return;
      }

      // Format the data for submission
      const submissionData = {
        ...formData,
        user_id: userData.id,
        activity_date: formData.activity_date instanceof Date 
          ? formData.activity_date.toISOString().split('T')[0]
          : new Date(formData.activity_date as string).toISOString().split('T')[0],
        // Remove any undefined values
        ...Object.fromEntries(
          Object.entries(formData).filter(([_, value]) => value !== undefined)
        )
      };

      console.log('Submitting data:', submissionData);

      const { error } = await adminClient
        .from('activity_reports')
        .insert([submissionData]);

      if (error) {
        console.error('Submission error:', error);
        throw error;
      }

      toast.success('Report submitted successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error submitting report:', error);
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