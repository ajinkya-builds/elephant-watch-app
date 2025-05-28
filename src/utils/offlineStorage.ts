import localforage from 'localforage';

const offlineStore = localforage.createInstance({
  name: 'ActivityReports',
  storeName: 'pending_activities'
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