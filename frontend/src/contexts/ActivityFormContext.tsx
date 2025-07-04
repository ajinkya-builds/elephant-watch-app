import { createContext, useContext, useState, ReactNode } from 'react';


export type FormStep = 'dateTimeLocation' | 'observationType' | 'compassBearing' | 'photo';

interface ActivityFormData {
  activity_date: string | Date | null;
  activity_time: string | null;
  observation_type: string | null;
  latitude: number | null;
  longitude: number | null;
  total_elephants: number | null;
  male_elephants: number | null;
  female_elephants: number | null;
  unknown_elephants: number | null;
  calves: number | null;
  indirect_sighting_type: string | null;
  loss_type: string | null;
  compass_bearing: number | null;
  photo_url: string | null;
}

interface ActivityFormContextType {
  currentStep: FormStep;
  formData: ActivityFormData;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  updateFormData: (data: Partial<ActivityFormData>) => void;
  isStepValid: (step: FormStep) => boolean;
  isLastStep: () => boolean;
  resetForm: () => void;
  isPhotoUploading: boolean;
  setIsPhotoUploading: (isUploading: boolean) => void;
}

const initialFormData: ActivityFormData = {
  activity_date: null,
  activity_time: null,
  observation_type: null,
  latitude: null,
  longitude: null,
  total_elephants: null,
  male_elephants: null,
  female_elephants: null,
  unknown_elephants: null,
  calves: null,
  indirect_sighting_type: null,
  loss_type: null,
  compass_bearing: null,
  photo_url: null,
};

const ActivityFormContext = createContext<ActivityFormContextType | undefined>(undefined);

export function ActivityFormProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState<FormStep>('dateTimeLocation');
  const [formData, setFormData] = useState<ActivityFormData>(initialFormData);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);

  const steps: FormStep[] = ['dateTimeLocation', 'observationType', 'compassBearing', 'photo'];

  const goToNextStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const updateFormData = (data: Partial<ActivityFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const isStepValid = (step: FormStep): boolean => {
    switch (step) {
      case 'dateTimeLocation':
        return !!formData.activity_date && !!formData.activity_time && 
               formData.latitude !== null && formData.longitude !== null;
      case 'observationType':
        return !!formData.observation_type;
      case 'compassBearing':
        return formData.compass_bearing !== null;
      case 'photo':
        return true; // Photo is optional
      default:
        return false;
    }
  };

  const isLastStep = () => {
    return currentStep === steps[steps.length - 1];
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setCurrentStep('dateTimeLocation');
    setIsPhotoUploading(false);
  };

  return (
    <ActivityFormContext.Provider
      value={{
        currentStep,
        formData,
        goToNextStep,
        goToPreviousStep,
        updateFormData,
        isStepValid,
        isLastStep,
        resetForm,
        isPhotoUploading,
        setIsPhotoUploading,
      }}
    >
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