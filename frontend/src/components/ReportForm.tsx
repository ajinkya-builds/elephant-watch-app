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
import { savePendingReport, getPendingReports, removePendingReport, updatePendingReportRetry, getReportsReadyForRetry, hasExceededMaxRetries } from "@/lib/localStorageUtils";
import { createActivityReport } from '@/services/activity-report.service';

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

    // Fetch user_id for all offline reports
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) {
      toast.error("User not authenticated. Please log in again.");
      setIsSyncing(false);
      return;
    }

    for (const storedReport of reportsToSync) {
      try {
        const payload = {
          ...storedReport.data,
          user_id: user.id,
          latitude: Number(storedReport.data.latitude),
          longitude: Number(storedReport.data.longitude),
        };
        const result = await createActivityReport(payload);
        if (!result) throw new Error('RPC returned null');
        removePendingReport(storedReport.id);
        successfulSyncs++;
      } catch (error: any) {
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
    if (successfulSyncs > 0) toast.success(`${successfulSyncs} report(s) synced successfully!`);
    if (failedSyncs > 0) toast.error(`${failedSyncs} report(s) failed to sync. Will retry automatically.`);
    if (maxRetriesExceeded > 0) toast.error(`${maxRetriesExceeded} report(s) exceeded maximum retry attempts.`);
    setIsSyncing(false);
  }, [isOnline, isSyncing]);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
  }, []);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
  }, []);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  useEffect(() => {
    if (!isOnline) return;
    setIsSubmitting(false);
  }, [isOnline]);

  // Set up periodic sync when online
  useEffect(() => {
    if (!isOnline) return;
    const syncInterval = setInterval(() => {
      syncPendingReports();
    }, 30000); // Try to sync every 30 seconds when online
    return () => clearInterval(syncInterval);
  }, [isOnline, syncPendingReports]);

  // --- DATA FETCHING STATE ---
  const [isFetchingData, setIsFetchingData] = useState(false);

  // --- FETCH LOCATION, DATE, TIME HANDLER ---
  const handleFetchData = async () => {
    setIsFetchingData(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            form.setValue("latitude", latitude.toString());
            form.setValue("longitude", longitude.toString());
            const now = new Date();
            form.setValue("activityDate", now.toISOString().split('T')[0]);
            form.setValue("activityTime", now.toTimeString().slice(0, 5));
            setIsFetchingData(false);
          },
          (err) => {
            toast.error("Failed to fetch location: " + err.message);
            setIsFetchingData(false);
          }
        );
      } else {
        toast.error("Geolocation is not supported by this browser.");
        setIsFetchingData(false);
      }
    } catch (error: any) {
      toast.error("Failed to fetch location: " + (error?.message || error));
      setIsFetchingData(false);
    }
  };

  // --- SUBMIT HANDLER ---
  const onSubmit = async (reportData: ReportFormValues) => {
    try {
      setIsSubmitting(true);
      // Fetch user_id from Supabase auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        toast.error("User not authenticated. Please log in again.");
        setIsSubmitting(false);
        return;
      }
      // Prepare payload for DB/RPC, mapping only the fields that exist in the DB
      const payload: any = {
        user_id: user.id,
        email: reportData.email,
        division_name: reportData.divisionName,
        range_name: reportData.rangeName,
        beat_name: reportData.beatName,
        compartment_no: reportData.compartmentNo,

        total_elephants: reportData.totalElephants ?? null,
        male_elephants: reportData.maleElephants ?? null,
        female_elephants: reportData.femaleElephants ?? null,
        unknown_elephants: reportData.unknownElephants ?? null,
        activity_date: reportData.activityDate,
        activity_time: reportData.activityTime,
        latitude: Number(reportData.latitude),
        longitude: Number(reportData.longitude),
        heading_towards: reportData.headingTowards,
        local_name: reportData.localName,
        identification_marks: reportData.identificationMarks,
        reporter_name: reportData.reporterName,
        reporter_mobile: reportData.reporterMobile,
        // DO NOT include '' or '' fields in the payload
      };

      if (!isOnline) {
        savePendingReport(payload);
        toast.success("You are offline. Report saved locally and will be synced when online.");
        form.reset();
        setIsSubmitting(false);
      } else {
        const result = await createActivityReport(payload);
        if (!result) {
          toast.error("Failed to submit report. Please check your data and try again.");
          setIsSubmitting(false);
          return;
        }
        toast.success("Report submitted successfully!");
        form.reset();
        setIsSubmitting(false);
      }
    } catch (error: any) {
      toast.error("An error occurred during submission: " + (error?.message || error));
      setIsSubmitting(false);
    }
  };

  // --- COMPONENT RETURN ---
  return (
    <>
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
            <Button type="submit" disabled={isSubmitting || isSyncing} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </Form>
      <NetworkStatusIndicator isOnline={isOnline} isSyncing={isSyncing} />
    </>
  );
}