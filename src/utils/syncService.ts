import { getPendingActivities, markActivitySynced, markActivityFailed, OfflineActivity } from './offlineStorage';
import { supabase } from '../lib/supabase';

export const syncPendingActivities = async (): Promise<void> => {
  if (!navigator.onLine) return;
  
  const pendingActivities = await getPendingActivities();
  
  for (const activity of pendingActivities) {
    try {
      // Remove offline-specific fields before syncing
      const { id, timestamp, syncStatus, createdOffline, ...activityData } = activity;
      
      // Submit to Supabase
      const { error } = await supabase
        .from('activities')
        .insert([activityData]);
        
      if (error) throw error;
      
      await markActivitySynced(id);
      console.log(`Synced activity ${id}`);
    } catch (error) {
      console.error(`Failed to sync activity ${activity.id}:`, error);
      await markActivityFailed(activity.id);
    }
  }
};

// Auto-sync when coming online
window.addEventListener('online', syncPendingActivities);

// Periodic sync attempt
setInterval(() => {
  if (navigator.onLine) {
    syncPendingActivities();
  }
}, 30000); // Every 30 seconds 