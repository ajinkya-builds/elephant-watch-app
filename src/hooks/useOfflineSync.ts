import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { 
  getPendingReports, 
  removePendingReport, 
  getPendingReportsCount,
  isAndroidApp 
} from '@/utils/offlineStorage';

export const useOfflineSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const syncPendingReports = async () => {
    if (!isAndroidApp()) return;
    
    setIsSyncing(true);
    try {
      const pendingReports = await getPendingReports();
      
      for (let i = 0; i < pendingReports.length; i++) {
        try {
          const { error } = await supabase
            .from('activity_reports')
            .insert([pendingReports[i]]);

          if (error) throw error;

          await removePendingReport(i);
          toast.success('Report synced successfully');
        } catch (error: any) {
          console.error('Error syncing report:', error);
          toast.error(`Failed to sync report: ${error.message}`);
          break; // Stop syncing if we encounter an error
        }
      }
    } catch (error: any) {
      console.error('Error during sync:', error);
      toast.error(`Sync failed: ${error.message}`);
    } finally {
      setIsSyncing(false);
      updatePendingCount();
    }
  };

  const updatePendingCount = async () => {
    if (!isAndroidApp()) return;
    const count = await getPendingReportsCount();
    setPendingCount(count);
  };

  useEffect(() => {
    // Initial count
    updatePendingCount();

    // Listen for online/offline events
    const handleOnline = () => {
      toast.success('Back online');
      syncPendingReports();
    };

    const handleOffline = () => {
      toast.warning('You are offline. Reports will be saved locally.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for custom sync event from Android
    const handleSyncEvent = () => {
      syncPendingReports();
    };

    window.addEventListener('syncPendingReports', handleSyncEvent);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('syncPendingReports', handleSyncEvent);
    };
  }, []);

  return {
    isSyncing,
    pendingCount,
    syncPendingReports,
    updatePendingCount
  };
}; 