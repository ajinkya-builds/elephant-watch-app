import { useState, useEffect } from 'react';
import { ActivityReportStepper } from "@/components/ActivityReportStepper";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { useAuth } from '@/contexts/NewAuthContext';
import { ActivityReport } from '@/types/activity-report';
import { AlertCircle, CloudOff, Wifi } from "lucide-react";
import { submitActivityReport, syncPendingReports } from '@/utils/offlineStorage';
import { isOnline, initNetworkMonitoring } from '@/utils/networkUtils';
import { logger } from '@/utils/loggerService';
import { AndroidCard } from '@/components/ui/android-card';
import { useAndroidTheme } from '@/theme/AndroidThemeProvider';
import { applyThemeClasses } from '@/theme/AndroidThemeUtils';
import { cn } from '@/lib/utils';


const ReportActivityPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<boolean | null>(null);
  const [pendingReports, setPendingReports] = useState<number>(0);
  const { user, loading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const { theme } = useAndroidTheme();

  // Check authentication status
  useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate('/login');
    }
  }, [user, isAuthLoading, navigate]);

  // Initialize network monitoring
  useEffect(() => {
    const initialize = async () => {
      // Init network monitoring
      const status = await initNetworkMonitoring();
      setNetworkStatus(status.connected);

      // Check for pending reports to sync
      syncPendingReports().then(result => {
        setPendingReports(result.remaining);
        if (result.success > 0) {
          toast.success(`Successfully synced ${result.success} pending reports`);
        }
      });
    };
    
    initialize();

    // Set up interval to check for network changes and sync reports
    const intervalId = setInterval(async () => {
      const online = await isOnline();
      setNetworkStatus(online);
      
      if (online) {
        const result = await syncPendingReports();
        setPendingReports(result.remaining);
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  if (isAuthLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const handleSubmit = async (reportData: Partial<ActivityReport>) => {
    setIsSubmitting(true);
    try {
      // Log submission attempt
      logger.info('Submitting activity report', {
        type: reportData.observation_type,
        location: `${reportData.latitude},${reportData.longitude}`
      });
      
      // Use offline-aware submission
      const result = await submitActivityReport(reportData);
      
      if (result.success) {
        if (result.offline) {
          toast.success('Report saved locally and will be submitted when online');
          setPendingReports(prev => prev + 1);
        } else {
          toast.success('Activity report submitted successfully');
        }
        navigate('/activities');
      } else {
        logger.error('Error submitting report', result.error);
        toast.error(result.message);
      }
    } catch (err) {
      logger.error('Unexpected error submitting report:', err);
      toast.error(`Failed to submit report: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Apply Android theme classes
  const containerClasses = applyThemeClasses(theme, 'bg-background text-onBackground');
  const headerClasses = applyThemeClasses(theme, 'text-onSurface');
  const subtitleClasses = applyThemeClasses(theme, 'text-onSurfaceVariant');
  
  return (
    <div className={cn("min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#e8f1fe]/30", containerClasses)}>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-10 sm:mb-12">
          <h1 className={cn("font-light tracking-tight", headerClasses, theme.typography.headlineLarge)}>
            Wild Elephant Monitoring System
          </h1>
          <h2 className={cn("mt-2 opacity-80", subtitleClasses, theme.typography.titleLarge)}>
            जंगली हाथी निगरानी प्रणाली (2025)
          </h2>
          
          {/* Network Status Indicator - Android style chip */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {networkStatus === null ? (
              <div className={cn(
                "inline-flex items-center px-4 py-1.5 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 backdrop-blur-sm", 
                applyThemeClasses(theme, 'bg-surfaceVariant/50 text-onSurfaceVariant')
              )}>
                <AlertCircle className="h-4 w-4 mr-2" />
                <span className={theme.typography.labelLarge}>Checking network status...</span>
              </div>
            ) : networkStatus ? (
              <div className={cn(
                "inline-flex items-center px-4 py-1.5 rounded-full shadow-sm border border-green-100 dark:border-green-800 backdrop-blur-sm", 
                "bg-green-50/80 dark:bg-green-900/30 text-green-700 dark:text-green-300"
              )}>
                <Wifi className="h-4 w-4 mr-2" />
                <span className={theme.typography.labelLarge}>Online Mode</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                <div className={cn(
                  "inline-flex items-center px-4 py-1.5 rounded-full shadow-sm border border-amber-100 dark:border-amber-800 backdrop-blur-sm", 
                  "bg-amber-50/80 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                )}>
                  <CloudOff className="h-4 w-4 mr-2" />
                  <span className={theme.typography.labelLarge}>Offline Mode</span>
                </div>
                {pendingReports > 0 && (
                  <div className={cn(
                    "inline-flex items-center px-4 py-1.5 rounded-full shadow-sm border border-blue-100 dark:border-blue-800 backdrop-blur-sm", 
                    "bg-blue-50/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  )}>
                    <span className={theme.typography.labelLarge}>{pendingReports} pending</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        <AndroidCard 
          variant="elevated" 
          className="mb-10 overflow-hidden shadow-md border border-slate-100 dark:border-slate-800 transition-all duration-300 hover:shadow-lg"
        >
          <AndroidCard.Header className="border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800">
                <AlertCircle className={cn("h-5 w-5 flex-shrink-0", applyThemeClasses(theme, 'text-primary'))} />
              </div>
              <AndroidCard.Title className={cn(theme.typography.titleLarge, "font-light tracking-tight")}>
                निर्देश / Instructions
              </AndroidCard.Title>
            </div>
          </AndroidCard.Header>
          <AndroidCard.Content className="pt-5">
            <ul className={cn("space-y-5", applyThemeClasses(theme, 'text-onSurfaceVariant'))}>  
              <li className="flex items-start gap-3">
                <span className={cn("h-5 w-5 rounded-full flex items-center justify-center text-sm", applyThemeClasses(theme, 'bg-primary text-onPrimary'))}>1</span>
                <div>
                  <p className={cn(theme.typography.bodyLarge, "mb-1 text-gray-800 dark:text-gray-200")}>
                    इस फॉर्म को चार चरणों में पूरा करें: तारीख/समय और स्थान, अवलोकन का प्रकार, कम्पास बेयरिंग, और फोटो।
                  </p>
                  <p className={cn(theme.typography.bodyMedium, "opacity-80", applyThemeClasses(theme, 'text-onSurfaceVariant'))}>
                    Complete this form in four steps: Date/Time & Location, Type of Observation, Compass Bearing, and Photo.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className={cn("h-5 w-5 rounded-full flex items-center justify-center text-sm", applyThemeClasses(theme, 'bg-primary text-onPrimary'))}>2</span>
                <div>
                  <p className={cn(theme.typography.bodyLarge, "mb-1 text-gray-800 dark:text-gray-200")}>
                    प्रत्येक चरण में आवश्यक जानकारी भरें और 'Next' बटन पर क्लिक करें। पिछले चरण पर जाने के लिए 'Previous' बटन का उपयोग करें।
                  </p>
                  <p className={cn(theme.typography.bodyMedium, "opacity-80", applyThemeClasses(theme, 'text-onSurfaceVariant'))}>
                    Fill in the required information in each step and click 'Next'. Use 'Previous' to go back to earlier steps.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className={cn("h-5 w-5 rounded-full flex items-center justify-center text-sm", applyThemeClasses(theme, 'bg-primary text-onPrimary'))}>3</span>
                <div>
                  <p className={cn(theme.typography.bodyLarge, "mb-1 text-gray-800 dark:text-gray-200")}>
                    GPS लोकेशन को Degree Decimal फॉर्मेट में भरें (उदाहरण: 23.4536 81.4763)। सटीक स्थान महत्वपूर्ण है।
                  </p>
                  <p className={cn(theme.typography.bodyMedium, "opacity-80", applyThemeClasses(theme, 'text-onSurfaceVariant'))}>
                    Enter GPS location in Degree Decimal format (Example: 23.4536 81.4763). Accurate location is crucial.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className={cn("h-5 w-5 rounded-full flex items-center justify-center text-sm", applyThemeClasses(theme, 'bg-primary text-onPrimary'))}>4</span>
                <div>
                  <p className={cn(theme.typography.bodyLarge, "mb-1 text-gray-800 dark:text-gray-200")}>
                    अवलोकन के प्रकार के अनुसार, हाथियों की संख्या या अप्रत्यक्ष साक्ष्य का विवरण दें।
                  </p>
                  <p className={cn(theme.typography.bodyMedium, applyThemeClasses(theme, 'text-onSurfaceVariant'))}>
                    Based on the type of observation, provide details on the number of elephants or indirect evidence.
                  </p>
                </div>
              </li>
            </ul>
          </AndroidCard.Content>
        </AndroidCard>

        <main className="max-w-4xl mx-auto">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-5 shadow-md border border-slate-100 dark:border-slate-800 transition-all duration-300">
            <ActivityReportStepper onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportActivityPage;