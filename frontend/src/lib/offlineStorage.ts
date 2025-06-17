import type { OfflineActivity } from '@/types/offline-activity';

const OFFLINE_ACTIVITIES_KEY = 'offline_activities';

export async function getPendingActivities(): Promise<OfflineActivity[]> {
  const stored = localStorage.getItem(OFFLINE_ACTIVITIES_KEY);
  if (!stored) return [];
  return JSON.parse(stored);
}

export async function savePendingActivity(activity: Omit<OfflineActivity, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
  const activities = await getPendingActivities();
  const newActivity: OfflineActivity = {
    ...activity,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    retryCount: 0
  };
  activities.push(newActivity);
  localStorage.setItem(OFFLINE_ACTIVITIES_KEY, JSON.stringify(activities));
}

export async function removePendingActivity(id: string): Promise<void> {
  const activities = await getPendingActivities();
  const filtered = activities.filter(a => a.id !== id);
  localStorage.setItem(OFFLINE_ACTIVITIES_KEY, JSON.stringify(filtered));
}

export async function updatePendingActivityRetry(id: string, error: Error): Promise<void> {
  const activities = await getPendingActivities();
  const updated = activities.map(a => {
    if (a.id === id) {
      return {
        ...a,
        retryCount: a.retryCount + 1,
        lastError: error.message
      };
    }
    return a;
  });
  localStorage.setItem(OFFLINE_ACTIVITIES_KEY, JSON.stringify(updated));
}

export function isAndroidApp(): boolean {
  return window.navigator.userAgent.includes('Android');
} 