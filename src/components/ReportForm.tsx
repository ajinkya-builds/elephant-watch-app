"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";

import { AdministrativeDetailsSection } from "./form-sections/AdministrativeDetailsSection";
import { DamageAssessmentSection } from "./form-sections/DamageAssessmentSection";
import { ElephantSightingSection } from "./form-sections/ElephantSightingSection";
import { LocationDateTimeSection } from "./form-sections/LocationDateTimeSection"; // Ensure this path and name are exact
import { AdditionalInfoSection } from "./form-sections/AdditionalInfoSection";
import { ReporterDetailsSection } from "./form-sections/ReporterDetailsSection";

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
  const [isFetchingData, setIsFetchingData] = useState(false);

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

  const handleFetchData = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser. / आपके ब्राउज़र द्वारा जियोलोकेशन समर्थित नहीं है।");
      return;
    }

    setIsFetchingData(true);
    toast.info("Fetching location, date, and time... / स्थान, दिनांक और समय प्राप्त किया जा रहा है...");

    const now = new Date();
    form.setValue("activityDate", now.toISOString().split('T')[0], { shouldValidate: true });
    form.setValue("activityTime", now.toTimeString().split(' ')[0].substring(0,5), { shouldValidate: true });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lon = position.coords.longitude.toFixed(6);
        form.setValue("latitude", lat, { shouldValidate: true });
        form.setValue("longitude", lon, { shouldValidate: true });
        toast.success("Location, Date & Time fetched successfully! / स्थान, दिनांक और समय सफलतापूर्वक प्राप्त हुआ!");
        setIsFetchingData(false);
      },
      (error) => {
        let errorMessage = "Could not get location. Date & Time were set. / स्थान प्राप्त नहीं किया जा सका। दिनांक और समय सेट कर दिए गए हैं।";
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "Location permission denied. Date & Time were set. / स्थान की अनुमति अस्वीकृत। दिनांक और समय सेट कर दिए गए हैं।";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = "Location information is unavailable. Date & Time were set. / स्थान की जानकारी अनुपलब्ध है। दिनांक और समय सेट कर दिए गए हैं।";
        } else if (error.code === error.TIMEOUT) {
          errorMessage = "Location request timed out. Date & Time were set. / स्थान अनुरोध का समय समाप्त हो गया। दिनांक और समय सेट कर दिए गए हैं।";
        }
        toast.error(errorMessage);
        setIsFetchingData(false); 
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
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input type="email" placeholder="your.email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <AdministrativeDetailsSection control={form.control} />
        <DamageAssessmentSection control={form.control} />
        <ElephantSightingSection control={form.control} />
        <LocationDateTimeSection 
          control={form.control} 
          isFetching={isFetchingData} 
          handleFetchData={handleFetchData} 
        />
        <AdditionalInfoSection control={form.control} />
        <ReporterDetailsSection control={form.control} />
        
        <Button type="submit" disabled={isSubmitting || isFetchingData} className="w-full sm:w-auto">
          {isSubmitting ? "Submitting... / सबमिट हो रहा है..." : "Submit Report / रिपोर्ट सबमिट करें"}
        </Button>
      </form>
    </Form>
  );
}