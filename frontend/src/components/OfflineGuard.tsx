import React from 'react';
import { useNetworkStatus } from '@/utils/networkStatus';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface OfflineGuardProps {
  children: React.ReactNode;
  allowedOffline?: boolean;
}

export function OfflineGuard({ children, allowedOffline = false }: OfflineGuardProps) {
  const isOnline = useNetworkStatus();

  if (!isOnline && !allowedOffline) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Offline Mode</AlertTitle>
          <AlertDescription>
            Please connect to the internet to access this page. The app is currently in offline mode.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
} 