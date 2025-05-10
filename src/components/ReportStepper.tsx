"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Clock, FileText, Image, Plus, Check, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AdministrativeDetailsSection } from "./form-sections/AdministrativeDetailsSection";
import { DamageAssessmentSection } from "./form-sections/DamageAssessmentSection";
import { ElephantSightingSection } from "./form-sections/ElephantSightingSection";
import { LocationDateTimeSection } from "./form-sections/LocationDateTimeSection";
import { AdditionalInfoSection } from "./form-sections/AdditionalInfoSection";
import { ReporterDetailsSection } from "./form-sections/ReporterDetailsSection";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormProvider } from "react-hook-form";

const reportFormSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  divisionName: z.string().min(1, "Division Name is required / वनमण्डल का नाम आवश्यक है"),
  rangeName: z.string().min(1, "Range Name is required / परिक्षेत्र का नाम आवश्यक है"),
  landType: z.enum(["RF", "PF", "ORANGE", "REVENUE", "OTHER"], {
    required_error: "Type of Land is required / भूमि की स्थिति आवश्यक है",
  }),
  beatName: z.string().min(1, "Beat Name is required / बीट का नाम आवश्यक है"),
  compartmentNo: z.string().min(1, "Compartment Number is required / कक्ष क्रमांक आवश्यक है"),
  damageDone: z.string().min(1, "Damage information is required / हानि की जानकारी आवश्यक है"),
  damageDescription: z.string().optional(),
  totalElephants: z.coerce.number({ invalid_type_error: "Must be a number / संख्या होनी चाहिए" })
    .min(0, "Total elephants cannot be negative / हाथियों की कुल संख्या नकारात्मक नहीं हो सकती")
    .int("Must be a whole number / पूर्णांक होना चाहिए"),
  maleElephants: z.coerce.number({ invalid_type_error: "Must be a number / संख्या होनी चाहिए" }).min(0).int().optional().nullable(),
  femaleElephants: z.coerce.number({ invalid_type_error: "Must be a number / संख्या होनी चाहिए" }).min(0).int().optional().nullable(),
  unknownElephants: z.coerce.number({ invalid_type_error: "Must be a number / संख्या होनी चाहिए" }).min(0).int().optional().nullable(),
  activityDate: z.string().min(1, "Date is required / दिनांक आवश्यक है"),
  activityTime: z.string().min(1, "Time is required / समय आवश्यक है"),
  latitude: z.string()
    .min(1, "Latitude is required / अक्षांश आवश्यक है")
    .regex(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/, "Invalid latitude (e.g., 23.4536) / अमान्य अक्षांश (उदा. 23.4536)"),
  longitude: z.string()
    .min(1, "Longitude is required / देशांतर आवश्यक है")
    .regex(/^[-+]?180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?$/, "Invalid longitude (e.g., 81.4763) / अमान्य देशांतर (उदा. 81.4763)"),
  headingTowards: z.string().optional(),
  localName: z.string().optional(),
  identificationMarks: z.string().optional(),
  reporterName: z.string().min(1, "Your name is required / आपका नाम आवश्यक है"),
  reporterMobile: z.string()
    .min(1, "Mobile number is required / मोबाइल नंबर आवश्यक है")
    .regex(/^\d{10}$/, "Invalid mobile (10 digits) / अमान्य मोबाइल (10 अंक)"),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface Step {
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  validation?: () => boolean;
}

interface ReportStepperProps {
  onSubmit: (data: ReportFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function ReportStepper({ onSubmit, isLoading }: ReportStepperProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      email: "",
      divisionName: "",
      rangeName: "",
      beatName: "",
      compartmentNo: "",
      damageDescription: "",
      totalElephants: 0,
      maleElephants: null,
      femaleElephants: null,
      unknownElephants: null,
      activityDate: "",
      activityTime: "",
      latitude: "",
      longitude: "",
      headingTowards: "",
      localName: "",
      identificationMarks: "",
      reporterName: "",
      reporterMobile: "",
    },
  });

  const steps: Step[] = [
    {
      title: "Administrative Details",
      icon: <FileText className="w-5 h-5" />,
      content: <AdministrativeDetailsSection control={form.control} />,
    },
    {
      title: "Location & Date Time",
      icon: <MapPin className="w-5 h-5" />,
      content: (
        <LocationDateTimeSection
          control={form.control}
          isFetching={false}
          handleFetchData={async () => {
            try {
              const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                if (!navigator.geolocation) {
                  reject(new Error('Geolocation is not supported'));
                  return;
                }
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  enableHighAccuracy: true,
                  timeout: 10000,
                  maximumAge: 0
                });
              });

              const now = new Date();
              const formattedDate = now.toISOString().split('T')[0];
              const formattedTime = now.toTimeString().split(' ')[0];

              form.setValue('activityDate', formattedDate);
              form.setValue('activityTime', formattedTime);
              form.setValue('latitude', position.coords.latitude.toString());
              form.setValue('longitude', position.coords.longitude.toString());
            } catch (error) {
              console.error('Error fetching location:', error);
              alert('Unable to fetch location. Please enter the details manually.');
            }
          }}
        />
      ),
    },
    {
      title: "Elephant Details",
      icon: <FileText className="w-5 h-5" />,
      content: <ElephantSightingSection control={form.control} />,
    },
    {
      title: "Damage Assessment",
      icon: <FileText className="w-5 h-5" />,
      content: <DamageAssessmentSection control={form.control} />,
    },
    {
      title: "Additional Information",
      icon: <FileText className="w-5 h-5" />,
      content: <AdditionalInfoSection control={form.control} />,
    },
    {
      title: "Reporter Details",
      icon: <FileText className="w-5 h-5" />,
      content: <ReporterDetailsSection control={form.control} />,
    },
  ];

  const handleStepData = (stepIndex: number, data: ReportFormValues) => {
    setCurrentStep(stepIndex + 1);
  };

  const handleSubmit = async () => {
    if (currentStep === steps.length - 1) {
      await onSubmit(form.getValues());
    } else {
      handleStepData(currentStep, form.getValues());
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <FormProvider {...form}>
      <Card className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg">
        <CardHeader className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-green-800">
              Elephant Watch Report
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Step {currentStep + 1} of {steps.length}
              </span>
              <Progress value={progress} className="w-48" />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {steps.map((step, index) => (
              <Button
                key={step.title}
                variant={index === currentStep ? "default" : "outline"}
                size="sm"
                className={`
                  ${index === currentStep ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-white hover:bg-green-100'}
                  flex items-center gap-2 px-4 py-2 rounded-md
                `}
                onClick={() => setCurrentStep(index)}
              >
                {step.icon}
                <span>{step.title}</span>
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-6">
            {steps[currentStep].content}
          </div>
        </CardContent>

        <div className="px-6 pb-6 pt-2 flex justify-between items-center border-t border-gray-200">
          {currentStep > 0 && (
            <Button
              variant="outline"
              className="bg-white hover:bg-green-50 text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            >
              <ArrowRight className="rotate-180 mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : currentStep === steps.length - 1 ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Submit
              </>
            ) : (
              <>
                <ArrowRight className="mr-2 h-4 w-4" />
                Next
              </>
            )}
          </Button>
        </div>
      </Card>
    </FormProvider>
  );
}
