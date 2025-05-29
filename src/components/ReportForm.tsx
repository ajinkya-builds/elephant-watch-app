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
import { useState, useEffect, useCallback } from "react";

import { supabase } from "@/lib/supabaseClient";
import { StoredReportData, savePendingReport, getPendingReports, removePendingReport, updatePendingReportRetry, getReportsReadyForRetry, hasExceededMaxRetries } from "@/lib/localStorageUtils";
import { findBeatForCoordinates } from '../lib/utils/shapefileImporter';

import { AdministrativeDetailsSection } from "./form-sections/AdministrativeDetailsSection";
import { DamageAssessmentSection } from "./form-sections/DamageAssessmentSection";
import { ElephantSightingSection } from "./form-sections/ElephantSightingSection";
import { LocationDateTimeSection } from "./form-sections/LocationDateTimeSection";
import { AdditionalInfoSection } from "./form-sections/AdditionalInfoSection";
import { ReporterDetailsSection } from "./form-sections/ReporterDetailsSection";
import { NetworkStatusIndicator } from './NetworkStatusIndicator';

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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

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

  // Fetch and set user's email
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        form.setValue("email", user.email);
      }
    };
    getUser();
  }, [form]);

  // Enhanced sync function with retry logic
  const syncPendingReports = useCallback(async () => {
    if (isSyncing || !isOnline) return;

    const reportsToSync = getReportsReadyForRetry();
    if (reportsToSync.length === 0) return;

    setIsSyncing(true);
    const syncToastId = toast.loading(`Syncing ${reportsToSync.length} pending report(s)...`);

    let successfulSyncs = 0;
    let failedSyncs = 0;
    let maxRetriesExceeded = 0;

    for (const storedReport of reportsToSync) {
      try {
        const { error } = await supabase.from("activity_reports").insert([storedReport.data]);
        
        if (error) {
          throw error;
        }
        
        removePendingReport(storedReport.id);
        successfulSyncs++;
      } catch (error: any) {
        console.error("Failed to sync report:", storedReport.id, error);
        
        if (hasExceededMaxRetries(storedReport)) {
          maxRetriesExceeded++;
          toast.error(`Report ${storedReport.id} failed after ${storedReport.retryCount} attempts. Please try submitting again.`);
          removePendingReport(storedReport.id);
        } else {
          updatePendingReportRetry(storedReport.id, error);
          failedSyncs++;
        }
      }
    }

    toast.dismiss(syncToastId);
    
    if (successfulSyncs > 0) {
      toast.success(`${successfulSyncs} report(s) synced successfully!`);
    }
    if (failedSyncs > 0) {
      toast.error(`${failedSyncs} report(s) failed to sync. Will retry automatically.`);
    }
    if (maxRetriesExceeded > 0) {
      toast.error(`${maxRetriesExceeded} report(s) exceeded maximum retry attempts.`);
    }

    setIsSyncing(false);
  }, [isOnline, isSyncing]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingReports();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncPendingReports]);

  // Periodically attempt to sync pending reports
  useEffect(() => {
    if (!isOnline) return;

    const syncInterval = setInterval(() => {
      syncPendingReports();
    }, 30000); // Try to sync every 30 seconds when online

    return () => clearInterval(syncInterval);
  }, [isOnline, syncPendingReports]);

  const handleFetchData = () => {
    // ... (keep existing handleFetchData logic)
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
        let errorMessage = "Could not get location. Date & Time were set.";
        if (error.code === error.PERMISSION_DENIED) errorMessage = "Location permission denied. Date & Time were set.";
        else if (error.code === error.POSITION_UNAVAILABLE) errorMessage = "Location information is unavailable. Date & Time were set.";
        else if (error.code === error.TIMEOUT) errorMessage = "Location request timed out. Date & Time were set.";
        toast.error(errorMessage);
        setIsFetchingData(false);
      }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  async function onSubmit(data: ReportFormValues) {
    setIsSubmitting(true);

    try {
      // Find beat for coordinates
      const beatInfo = await findBeatForCoordinates(
        parseFloat(data.latitude),
        parseFloat(data.longitude)
      );

      if (!beatInfo) {
        throw new Error('Could not determine beat for the given coordinates');
      }

      const reportData = { 
        email: data.email,
        division_name: beatInfo.division_name,
        range_name: beatInfo.range_name,
        land_type: data.landType,
        beat_name: beatInfo.beat_name,
        compartment_no: data.compartmentNo,
        damage_done: data.damageDone,
        damage_description: data.damageDescription || null,
        total_elephants: data.totalElephants,
        male_elephants: data.maleElephants,
        female_elephants: data.femaleElephants,
        unknown_elephants: data.unknownElephants,
        activity_date: data.activityDate,
        activity_time: data.activityTime,
        latitude: parseFloat(data.latitude), 
        longitude: parseFloat(data.longitude), 
        heading_towards: data.headingTowards || null,
        local_name: data.localName || null,
        identification_marks: data.identificationMarks || null,
        reporter_name: data.reporterName,
        reporter_mobile: data.reporterMobile,
      };

      if (isOnline) {
        const submissionToastId = toast.loading("Submitting report online...");
        try {
          const { error } = await supabase.from("activity_reports").insert([reportData]);
          if (error) {
            console.error("Supabase submission error:", error);
            toast.error(`Online submission failed: ${error.message}. Report saved locally.`);
            savePendingReport(reportData); // Save locally if online submission fails
          } else {
            toast.success("Report submitted successfully online!");
            form.reset();
          }
        } catch (error: any) {
          console.error("Unexpected error during online submission:", error);
          toast.error(`An unexpected error occurred: ${error.message}. Report saved locally.`);
          savePendingReport(reportData); // Save locally on unexpected error
        } finally {
          toast.dismiss(submissionToastId);
          setIsSubmitting(false);
        }
      } else {
        // Offline: Save to localStorage
        savePendingReport(reportData); 
        toast.success("You are offline. Report saved locally and will be synced when online.");
        form.reset(); 
        setIsSubmitting(false);
        console.log("Current pending reports:", getPendingReports().length);
      }
    } catch (error: any) {
      console.error("Error during onSubmit:", error);
      toast.error(`An error occurred: ${error.message}`);
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8 w-full max-w-full sm:max-w-2xl mx-auto p-2 sm:p-4">
          {!isOnline && (
            <div className="p-2 sm:p-3 mb-3 sm:mb-4 text-xs sm:text-sm text-yellow-800 bg-yellow-100 rounded-lg dark:bg-yellow-900 dark:text-yellow-300" role="alert">
              <span className="font-medium">You are currently offline.</span> Reports will be saved locally and synced when you reconnect.
              Currently {getPendingReports().length} report(s) pending sync.
            </div>
          )}
          {isOnline && getPendingReports().length > 0 && !isSyncing && (
            <div className="p-2 sm:p-3 mb-3 sm:mb-4 text-xs sm:text-sm text-blue-800 bg-blue-100 rounded-lg dark:bg-blue-900 dark:text-blue-300" role="alert">
              <span className="font-medium">{getPendingReports().length} report(s) pending sync.</span>
              <Button type="button" variant="link" className="ml-2 p-0 h-auto text-blue-800 dark:text-blue-300 text-xs sm:text-sm" onClick={syncPendingReports}>Sync Now</Button>
            </div>
          )}
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
          
          <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 mt-4 sm:mt-8 pt-2 sm:pt-6 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={handlePrevious} disabled={isFirstStep || isSubmitting} className="w-full sm:w-auto border-gray-200 text-gray-600 hover:bg-gray-50">
              Previous
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting ? 'Submitting...' : isLastStep ? 'Submit Report' : 'Next'}
            </Button>
          </div>
        </form>
      </Form>
      <NetworkStatusIndicator isOnline={isOnline} isSyncing={isSyncing} />
    </>
  );
}