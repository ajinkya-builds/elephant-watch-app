import React from 'react';
import { Wifi, WifiOff, CloudOff } from 'lucide-react';
import { getPendingReports } from '@/lib/localStorageUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NetworkStatusIndicatorProps {
  isOnline: boolean;
  isSyncing: boolean;
}

export function NetworkStatusIndicator({ isOnline, isSyncing }: NetworkStatusIndicatorProps) {
  const pendingReports = getPendingReports();
  const hasPendingReports = pendingReports.length > 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-full shadow-lg border">
            {isOnline ? (
              hasPendingReports ? (
                <CloudOff className="h-5 w-5 text-yellow-500 animate-pulse" />
              ) : (
                <Wifi className="h-5 w-5 text-green-500" />
              )
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            {hasPendingReports && (
              <span className="text-sm font-medium">
                {pendingReports.length} pending
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {isOnline
            ? hasPendingReports
              ? `${pendingReports.length} report(s) pending sync`
              : "Online - All reports synced"
            : "Offline - Reports will sync when online"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 