import localforage from 'localforage';
import { ActivityReport } from '@/lib/schemas/activityReport';
import { Session } from '@supabase/supabase-js';

const offlineStore = localforage.createInstance({
  name: 'ActivityReports',
  storeName: 'pending_activities'
});

const userStore = localforage.createInstance({
  name: 'UserData',
  storeName: 'user_session'
});

export interface OfflineActivity {
  id: string;
  timestamp: string;
  syncStatus: 'pending' | 'synced' | 'failed';
  createdOffline: boolean;
  [key: string]: any;
}

export const saveActivityOffline = async (activityData: Omit<OfflineActivity, 'id' | 'timestamp' | 'syncStatus' | 'createdOffline'>): Promise<string> => {
  const id = crypto.randomUUID();
  const activity: OfflineActivity = {
    ...activityData,
    id,
    timestamp: new Date().toISOString(),
    syncStatus: 'pending',
    createdOffline: true
  };
  
  await offlineStore.setItem(id, activity);
  return id;
};

export const getPendingActivities = async (): Promise<OfflineActivity[]> => {
  const activities: OfflineActivity[] = [];
  await offlineStore.iterate((value: OfflineActivity) => {
    if (value.syncStatus === 'pending') {
      activities.push(value);
    }
  });
  return activities;
};

export const markActivitySynced = async (id: string): Promise<void> => {
  await offlineStore.removeItem(id);
};

export const markActivityFailed = async (id: string): Promise<void> => {
  const activity = await offlineStore.getItem<OfflineActivity>(id);
  if (activity) {
    activity.syncStatus = 'failed';
    await offlineStore.setItem(id, activity);
  }
};

export const getPendingActivitiesCount = async (): Promise<number> => {
  const activities = await getPendingActivities();
  return activities.length;
};

export const saveUserSession = async (session: Session): Promise<void> => {
  await userStore.setItem('session', session);
};

export const getUserSession = async (): Promise<Session | null> => {
  return await userStore.getItem<Session>('session');
};

export const clearUserSession = async (): Promise<void> => {
  await userStore.removeItem('session');
};

export const isAndroidApp = () => {
  return typeof window !== 'undefined' && window.offlineStorage !== undefined;
};

export const savePendingReport = async (report: ActivityReport) => {
  if (!isAndroidApp()) {
    console.warn('Offline storage not available');
    return;
  }

  try {
    window.offlineStorage!.savePendingReport(report);
    console.log('Report saved to offline storage');
  } catch (error) {
    console.error('Error saving report to offline storage:', error);
    throw error;
  }
};

export const getPendingReports = async (): Promise<ActivityReport[]> => {
  if (!isAndroidApp()) {
    console.warn('Offline storage not available');
    return [];
  }

  try {
    return window.offlineStorage!.getPendingReports();
  } catch (error) {
    console.error('Error getting pending reports:', error);
    return [];
  }
};

export const removePendingReport = async (index: number) => {
  if (!isAndroidApp()) {
    console.warn('Offline storage not available');
    return;
  }

  try {
    window.offlineStorage!.removePendingReport(index);
    console.log('Report removed from offline storage');
  } catch (error) {
    console.error('Error removing report from offline storage:', error);
    throw error;
  }
};

export const getPendingReportsCount = async (): Promise<number> => {
  if (!isAndroidApp()) {
    return 0;
  }

  try {
    return window.offlineStorage!.getPendingReportsCount();
  } catch (error) {
    console.error('Error getting pending reports count:', error);
    return 0;
  }
};

export const clearAllOfflineData = async (): Promise<void> => {
  await offlineStore.clear();
  await userStore.clear();
  if (isAndroidApp()) {
    try {
      window.offlineStorage!.clearUserSession();
    } catch (error) {
      console.error('Error clearing Android offline storage:', error);
    }
  }
};

declare global {
  interface Window {
    offlineStorage?: {
      savePendingReport: (report: any) => void;
      getPendingReports: () => any[];
      removePendingReport: (index: number) => void;
      saveUserSession: (session: any) => void;
      getUserSession: () => Session | null;
      clearUserSession: () => void;
      getPendingReportsCount: () => number;
    };
  }
} 