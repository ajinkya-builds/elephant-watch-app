import { useState, useEffect } from 'react';
import { getPendingActivities } from '../utils/offlineStorage';

export const SyncStatus = () => {
  const [pendingCount, setPendingCount] = useState(0);
  
  useEffect(() => {
    const updateCount = async () => {
      const pending = await getPendingActivities();
      setPendingCount(pending.length);
    };
    
    updateCount();
    const interval = setInterval(updateCount, 5000);
    return () => clearInterval(interval);
  }, []);
  
  if (pendingCount === 0) return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
      <span>📤</span>
      <span>{pendingCount} activities pending sync</span>
    </div>
  );
}; 