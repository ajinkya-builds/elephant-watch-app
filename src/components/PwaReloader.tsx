import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

function PwaReloader() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      console.log(`Service Worker at: ${swUrl}`);
      // Send a message to the service worker to skip waiting if you want to activate it immediately
      // r?.active?.postMessage({ type: 'SKIP_WAITING' }); // Be cautious with this in production
    },
    onRegisterError(error) {
      console.error('SW registration error:', error);
    },
  });

  useEffect(() => {
    if (offlineReady) {
      toast.success('App is ready to work offline!');
      setOfflineReady(false); // Reset to prevent multiple toasts if component re-renders
    }
  }, [offlineReady, setOfflineReady]);

  useEffect(() => {
    if (needRefresh) {
      const toastId = toast(
        'New version available! Click to refresh.',
        {
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                updateServiceWorker(true); // true means reload the page after update
                setNeedRefresh(false); // Hide the current toast
              }}
            >
              Refresh
            </Button>
          ),
          duration: Infinity, // Keep toast visible until action or dismissed
          onDismiss: () => setNeedRefresh(false), // Reset if user dismisses
          onAutoClose: () => setNeedRefresh(false), // Reset if auto-closes (though duration is Infinity)
        }
      );
      // Optional: return a cleanup function if needed, though toast.dismiss should handle it
      return () => {
        toast.dismiss(toastId);
      }
    }
  }, [needRefresh, setNeedRefresh, updateServiceWorker]);

  return null; // This component only handles effects and toasts
}

export default PwaReloader;