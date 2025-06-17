import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/components/ui/button';

export function PwaReloader() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error:', error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      console.log('New content available, please refresh.');
    }
  }, [needRefresh]);

  return needRefresh ? (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => {
          updateServiceWorker(true);
          setNeedRefresh(false);
        }}
      >
        Update Available - Click to Refresh
      </Button>
    </div>
  ) : null;
}