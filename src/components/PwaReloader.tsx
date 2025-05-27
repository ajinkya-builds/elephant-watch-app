import { useEffect } from 'react';
// import { useRegisterSW } from 'virtual:pwa-register/react'; // Commented out as vite-plugin-pwa is not currently compatible
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

function PwaReloader() {
  // Since useRegisterSW is commented out, the rest of the hook logic will not work.
  // This component will effectively do nothing until vite-plugin-pwa is re-integrated.
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = { // Provide dummy values to prevent runtime errors if React.lazy still loads this in prod (though it shouldn't without the plugin)
    offlineReady: [false, () => {}],
    needRefresh: [false, () => {}],
    updateServiceWorker: () => {},
  }; // useRegisterSW(); // Original call commented out

  useEffect(() => {
    if (offlineReady) {
      toast.success('App is ready to work offline!');
      setOfflineReady(false); 
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
                if (updateServiceWorker) updateServiceWorker(true); 
                setNeedRefresh(false); 
              }}
            >
              Refresh
            </Button>
          ),
          duration: Infinity, 
          onDismiss: () => setNeedRefresh(false), 
          onAutoClose: () => setNeedRefresh(false), 
        }
      );
      return () => {
        toast.dismiss(toastId);
      }
    }
  }, [needRefresh, setNeedRefresh, updateServiceWorker]);

  return null; 
}

export default PwaReloader;