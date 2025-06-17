import React from 'react';
import { useNetworkStatus } from '@/utils/networkStatus';

export function SyncStatus() {
  const isOnline = useNetworkStatus();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`px-4 py-2 rounded-full shadow-lg ${
        isOnline ? 'bg-green-500' : 'bg-red-500'
      } text-white`}>
        {isOnline ? 'Online' : 'Offline'}
      </div>
    </div>
  );
} 