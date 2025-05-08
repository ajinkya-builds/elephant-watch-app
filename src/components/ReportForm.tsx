"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { useState } from "react";

import { ReporterInfoSection } from "./form-sections/ReporterInfoSection";
import { AdministrativeDetailsSection } from "./form-sections/AdministrativeDetailsSection";
import { ElephantSightingSection } from "./form-sections/ElephantSightingSection";
import { GpsLocationSection } from "./form-sections/GpsLocationSection";
import { DamageAssessmentSection } from "./form-sections/DamageAssessmentSection";
import { AdditionalInfoSection } from "./form-sections/AdditionalInfoSection";

// Main Zod schema remains here as the single source of truth for the entire form
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
  totalElephants: z.coerce.number({invalid_type_error: "Must be a number / संख्या होनी चाहिए"})
    .min(0, "Total elephants cannot be negative / हाथियों की कुल संख्या नकारात्मक नहीं हो सकती")
    .int("Must be a whole number / पूर्णांक होना चाहिए"),
  maleElephants: z.coerce.number({invalid_type_error: "Must be a number / संख्या होनी चाहिए"}).min(0).int().optional().nullable(),
  femaleElephants: z.coerce.number({invalid_type_error: "Must be a number / संख्या होनी चाहिए"}).min(0).int().optional().nullable(),
  unknownElephants: z.coerce.number({invalid_type_error: "Must be a number / संख्या होनी चाहिए"}).min(0).int().optional().nullable(),
  activityDate: z.string().min(1, "Date is required / दिनांक आवश्यक है"),
  activityTime: z.string().min(1, "Time is required / समय आवश्यक है"),
  latitude: z.string()
    .min(1, "Latitude is required / अक्षांश आवश्यक है")
    .regex(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/, "Invalid latitude (e.g., 23.4536) / अमान्य अक्षांश (उदा. 23.4536)"),
  longitude: z.string()
    .min(1, "Longitude is required / देशांतर आवश्यक है")
    .regex(/^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/, "Invalid longitude (e.g., 81.4763) / अमान्य देशांतर (उदा. 81.4763)"),
  headingTowards: z.string().optional(),
  localName: z.string().optional(),
  identificationMarks: z.string().optional(),
  reporterName: z.string().min(1, "Your name is required / आपका नाम आवश्यक है"),
  reporterMobile: z.string()
    .min(1, "Mobile number is required / मोबाइल नंबर आवश्यक है")
    .regex(/^\d{10}$/, "Invalid mobile (10 digits) / अमान्य मोबाइल (10 अंक)"),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

export function ReportForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      email: "",
      divisionName: "",
      rangeName: "",
      // landType: undefined, // Let zod handle default if not set or set explicitly
      beatName: "",
      compartmentNo: "",
      // damageDone: undefined,
      damageDescription: "",
      totalElephants: 0,
      maleElephants: null,
      femaleElephants: null,
      unknownElephants: null,
      activityDate: new Date().toISOString().split('T')[0],
      activityTime: new Date().toTimeString().split(' ')[0].substring(0,5),
      latitude: "",
      longitude: "",
      headingTowards: "",
      localName: "",
      identificationMarks: "",
      reporterName: "",
      reporterMobile: "",
    },
  });

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser. / आपके ब्राउज़र द्वारा जियोलोकेशन समर्थित नहीं है।");
      return;
    }

    setIsFetchingLocation(true);
    toast.info("Fetching location... / स्थान प्राप्त किया जा रहा है...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lon = position.coords.longitude.toFixed(6);
        form.setValue("latitude", lat, { shouldValidate: true });
        form.setValue("longitude", lon, { shouldValidate: true });
        toast.success("Location fetched successfully! / स्थान सफलतापूर्वक प्राप्त हुआ!");
        setIsFetchingLocation(false);
      },
      (error) => {
        let errorMessage = "Could not get location. / स्थान प्राप्त नहीं किया जा सका।";
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "Location permission denied. Please enable it in your browser settings. / स्थान की अनुमति अस्वीकृत। कृपया अपनी ब्राउज़र सेटिंग्स में इसे सक्षम करें।";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = "Location information is unavailable. / स्थान की जानकारी अनुपलब्ध है।";
        } else if (error.code === error.TIMEOUT) {
          errorMessage = "Location request timed out. / स्थान अनुरोध का समय समाप्त हो गया।";
        }
        toast.error(errorMessage);
        setIsFetchingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  async function onSubmit(data: ReportFormValues) {
    setIsSubmitting(true);
    toast.info("Submitting report... / रिपोर्ट सबमिट हो रही है...");
    console.log("Form data:", data);

    await new Promise(resolve => setTimeout(resolve, 2000)); 

    toast.success("Report submitted successfully! (Simulated) / रिपोर्ट सफलतापूर्वक सबमिट की गई! (सिम्युलेटेड)");
    form.reset();
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <ReporterInfoSection control={form.control} />
        <AdministrativeDetailsSection control={form.control} />
        <DamageAssessmentSection control={form.control} />
        <ElephantSightingSection control={form.control} />
        <GpsLocationSection 
          control={form.control} 
          isFetchingLocation={isFetchingLocation} 
          handleFetchLocation={handleFetchLocation} 
        />
        <AdditionalInfoSection control={form.control} />
        
        <Button type="submit" disabled={isSubmitting || isFetchingLocation} className="w-full sm:w-auto">
          {isSubmitting ? "Submitting... / सबमिट हो रहा है..." : "Submit Report / रिपोर्ट सबमिट करें"}
        </Button>
      </form>
    </Form>
  );
}