import React, { useState, useEffect } from 'react';
import { ActivityReportStepper } from "@/components/ActivityReportStepper";
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';
import { ActivityReport } from '@/lib/schemas/activityReport';
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { savePendingReport, isAndroidApp } from '@/utils/offlineStorage';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useNetworkStatus } from '@/utils/networkStatus';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { isAndroid } from '@/utils/platform';

const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'navigator not available';
if (typeof window !== 'undefined') {
  // Log user agent for debugging
  console.log('User Agent:', userAgent);
}

const ReportActivityPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, loading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const { pendingCount, isSyncing } = useOfflineSync();
  const isOnline = useNetworkStatus();

  // Check authentication status
  useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate('/login');
    }
  }, [user, isAuthLoading, navigate]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isAuthLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const handleSubmit = async (reportData: ActivityReport) => {
    setIsSubmitting(true);
    try {
      if (isOnline) {
        // If online, try to submit directly to Supabase
        const { error } = await supabase
          .from('activity_reports')
          .insert([reportData]);

        if (error) throw error;
        toast.success('Report submitted successfully');
      } else {
        // If offline, save to local storage
        await savePendingReport(reportData);
        toast.success('Report saved offline. It will be synced when you are back online.');
      }
      navigate('/');
    } catch (error: any) {
      console.error('Error submitting report:', error);
      toast.error(`Failed to submit report: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Android debug and minimal select test at top-level */}
      {isAndroid() && (
        <div style={{ padding: 16, background: '#ffe', border: '1px solid #ccc', marginBottom: 16 }}>
          <div style={{color: 'red', fontWeight: 'bold', marginBottom: 8}}>Android detected (debug, top-level)</div>
          <label htmlFor="minimal-test-select-top" style={{ display: 'block', marginBottom: 8 }}>Minimal Android Select Test (Top Level):</label>
          <select
            id="minimal-test-select-top"
            style={{ width: '100%', minHeight: 40, fontSize: 18 }}
            onChange={e => console.log('Minimal select value (top):', e.target.value)}
          >
            <option value="">Choose an option</option>
            <option value="one">Option One</option>
            <option value="two">Option Two</option>
            <option value="three">Option Three</option>
          </select>
        </div>
      )}
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-2 sm:p-4">
          <header className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Wild Elephant Monitoring System
            </h1>
            <h2 className="mt-2 text-2xl font-semibold text-gray-600">
              जंगली हाथी निगरानी प्रणाली (2025)
            </h2>
          </header>

          {!isOnline && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Offline Mode</AlertTitle>
              <AlertDescription>
                You are currently offline. Your report will be saved locally and synced when you are back online.
                {pendingCount > 0 && ` You have ${pendingCount} pending report(s) to sync.`}
              </AlertDescription>
            </Alert>
          )}
          
          {isOnline && pendingCount > 0 && !isSyncing && (
            <Card className="mb-4 p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2 text-blue-800">
                <AlertCircle className="h-5 w-5" />
                <p>{pendingCount} report(s) pending sync.</p>
              </div>
            </Card>
          )}

          <Card className="mb-8 overflow-hidden border border-blue-100 bg-white shadow-sm">
            <div className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">निर्देश / Instructions:</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>
                        इस फॉर्म को चार चरणों में पूरा करें: तारीख/समय और स्थान, अवलोकन का प्रकार, कम्पास बेयरिंग, और फोटो।
                        <br />
                        <span className="text-gray-500">Complete this form in four steps: Date/Time & Location, Type of Observation, Compass Bearing, and Photo.</span>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>
                        प्रत्येक चरण में आवश्यक जानकारी भरें और 'Next' बटन पर क्लिक करें। पिछले चरण पर जाने के लिए 'Previous' बटन का उपयोग करें।
                        <br />
                        <span className="text-gray-500">Fill in the required information in each step and click 'Next'. Use 'Previous' to go back to earlier steps.</span>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>
                        GPS लोकेशन को Degree Decimal फॉर्मेट में भरें (उदाहरण: 23.4536 81.4763)। सटीक स्थान महत्वपूर्ण है।
                        <br />
                        <span className="text-gray-500">Enter GPS location in Degree Decimal format (Example: 23.4536 81.4763). Accurate location is crucial.</span>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>
                        अवलोकन के प्रकार के अनुसार, हाथियों की संख्या या अप्रत्यक्ष साक्ष्य का विवरण दें।
                        <br />
                        <span className="text-gray-500">Based on observation type, provide elephant count or indirect evidence details.</span>
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          <main className="max-w-4xl mx-auto">
            <ActivityReportStepper onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default ReportActivityPage;