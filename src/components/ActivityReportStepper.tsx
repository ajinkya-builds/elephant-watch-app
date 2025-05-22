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
import { createActivityObservation } from '@/lib/activity-observation';

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
    console.log('handleSubmit called');
    if (!user) {
      toast.error("You must be logged in to submit a report");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('About to fetch session');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Session:', session);
      console.log('Session error:', sessionError);
      
      if (!session) {
        alert("You are not logged in! Please log in to submit a report.");
        throw new Error("No session!");
      }
      
      if (session.user.id !== user.id) {
        console.warn('Session user ID does not match user object ID:', {
          sessionUserId: session.user.id,
          userObjectId: user.id
        });
      }

      console.log('Session user:', session.user);
      console.log('Session user ID:', session.user.id);

      // Always use the authenticated user's UUID from the session for user_id
      const userId = session.user.id; // This is the ONLY correct value for user_id
      // Build the report data
      const reportData = {
        latitude: formData.latitude.toString(),
        longitude: formData.longitude.toString(),
        activity_date: formData.activity_date,
        activity_time: formData.activity_time,
        observation_type: formData.observation_type,
        total_elephants: formData.total_elephants || null,
        male_elephants: formData.male_elephants || null,
        female_elephants: formData.female_elephants || null,
        unknown_elephants: formData.unknown_elephants || null,
        calves: formData.calves || null,
        indirect_sighting_type: formData.indirect_sighting_type || null,
        loss_type: formData.loss_type || null,
        compass_bearing: formData.compass_bearing || null,
        photo_url: formData.photo_url || null,
        user_id: userId // Always use the session user id, never from lookup or form
      };
      console.log('Submitting reportData:', reportData, typeof reportData.user_id);

      // Validate required fields based on observation type
      if (formData.observation_type === 'direct' && !formData.total_elephants) {
        throw new Error('Total elephants count is required for direct observations');
      }
      if (formData.observation_type === 'indirect' && !formData.indirect_sighting_type) {
        throw new Error('Indirect sighting type is required for indirect observations');
      }
      if (formData.observation_type === 'loss' && !formData.loss_type) {
        throw new Error('Loss type is required for loss observations');
      }

      // Insert the report
      const { data: reportResult, error: reportError } = await supabase
        .from('activity_reports')
        .insert([reportData])
        .select()
        .single();
      if (reportError) {
        console.error('Insert error:', reportError);
        throw reportError;
      }

      console.log('Activity report created successfully:', reportResult);

      // Then create the activity observation
      const observationData = {
        activity_report_id: reportResult.id,
        latitude: parseFloat(formData.latitude as string),
        longitude: parseFloat(formData.longitude as string),
        activity_date: formData.activity_date,
        activity_time: formData.activity_time,
        observation_type: formData.observation_type,
        total_elephants: formData.total_elephants || null,
        male_elephants: formData.male_elephants || null,
        female_elephants: formData.female_elephants || null,
        unknown_elephants: formData.unknown_elephants || null,
        calves: formData.calves || null,
        indirect_sighting_type: formData.indirect_sighting_type || null,
        loss_type: formData.loss_type || null,
        compass_bearing: formData.compass_bearing || null,
        photo_url: formData.photo_url || null,
        user_id: userId
      };
      console.log('Creating activity observation with data:', observationData);
      console.log('Observation user_id:', observationData.user_id);

      await createActivityObservation(reportResult.id, observationData);
      console.log('Activity observation created successfully');

      toast.success("Report submitted successfully!");
      navigate('/reports');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error(error instanceof Error ? error.message : "Failed to submit report. Please try again.");
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