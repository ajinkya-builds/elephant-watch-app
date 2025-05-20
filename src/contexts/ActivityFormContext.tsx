import React, { createContext, useContext, useState } from 'react';
import { ActivityReport, stepSchemas } from '@/lib/schemas/activityReport';
import { z } from 'zod';

export type FormStep = keyof typeof stepSchemas;

interface ActivityFormContextType {
  currentStep: FormStep;
  formData: Partial<ActivityReport>;
  setFormData: (data: Partial<ActivityReport>) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: FormStep) => void;
  isStepValid: (step: FormStep) => boolean;
  isLastStep: () => boolean;
  resetForm: () => void;
}

const steps: FormStep[] = ['dateTimeLocation', 'observationType', 'compassBearing', 'photo'];

const ActivityFormContext = createContext<ActivityFormContextType | undefined>(undefined);

export function ActivityFormProvider({ children }: { children: React.ReactNode }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Partial<ActivityReport>>({});

  const currentStep = steps[currentStepIndex];

  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const goToStep = (step: FormStep) => {
    const stepIndex = steps.indexOf(step);
    if (stepIndex !== -1) {
      setCurrentStepIndex(stepIndex);
    }
  };

  const isStepValid = (step: FormStep) => {
    try {
      console.log('Validating step:', step);
      console.log('Current form data:', formData);

      const schema = stepSchemas[step];
      if (!schema) {
        console.error('No schema found for step:', step);
        return false;
      }

      // For dateTimeLocation step, check required fields first
      if (step === 'dateTimeLocation') {
        const requiredFields = ['activity_date', 'activity_time', 'latitude', 'longitude'];
        const hasAllFields = requiredFields.every(field => {
          const value = formData[field as keyof ActivityReport];
          const isValid = value !== undefined && value !== '' && value !== null;
          console.log(`Field ${field}:`, value, 'isValid:', isValid);
          return isValid;
        });

        if (!hasAllFields) {
          console.log('Missing required fields');
          return false;
        }

        // Convert date string to Date object if needed
        const validationData = {
          ...formData,
          activity_date: formData.activity_date instanceof Date 
            ? formData.activity_date 
            : new Date(formData.activity_date as string)
        };

        // Validate against schema
        const result = schema.safeParse(validationData);
        console.log('Schema validation result:', result);
        return result.success;
      }

      // For photo step, always return true as it's optional
      if (step === 'photo') {
        return true;
      }

      // For other steps, just validate against their schemas
      const result = schema.safeParse(formData);
      console.log('Schema validation result:', result);
      return result.success;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  };

  const isLastStep = () => currentStepIndex === steps.length - 1;

  const resetForm = () => {
    setCurrentStepIndex(0);
    setFormData({});
  };

  const updateFormData = (newData: Partial<ActivityReport>) => {
    setFormData(current => {
      const updatedData = { ...current };
      
      Object.entries(newData).forEach(([key, value]) => {
        if (value === undefined) {
          delete updatedData[key as keyof ActivityReport];
        } else {
          (updatedData as any)[key] = value;
        }
      });
      
      return updatedData;
    });
  };

  const value = {
    currentStep,
    formData,
    setFormData: updateFormData,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    isStepValid,
    isLastStep,
    resetForm,
  };

  return (
    <ActivityFormContext.Provider value={value}>
      {children}
    </ActivityFormContext.Provider>
  );
}

export function useActivityForm() {
  const context = useContext(ActivityFormContext);
  if (context === undefined) {
    throw new Error('useActivityForm must be used within an ActivityFormProvider');
  }
  return context;
} 