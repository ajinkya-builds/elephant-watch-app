import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { 
  getPendingReports, 
  removePendingReport, 
  getPendingReportsCount,
  isAndroidApp 
} from '@/utils/offlineStorage';

let isSyncing = false;

export const syncPendingReports = async () => {
  if (!isAndroidApp() || isSyncing) return;
  
  isSyncing = true;
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
    isSyncing = false;
  }
};

// Auto-sync when coming online
window.addEventListener('online', () => {
  console.log('[SyncService] Online event detected, starting sync');
  syncPendingReports();
});

// Periodically attempt to sync pending reports when online
setInterval(() => {
  if (navigator.onLine) {
    syncPendingReports();
  }
}, 30000); // Try to sync every 30 seconds when online

// Export the sync function for manual triggering
export default syncPendingReports; 