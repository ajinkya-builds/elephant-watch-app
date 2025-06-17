import { useToast as useToastOriginal } from '@/components/ui/use-toast';

export type ToastProps = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
};

export function useToast() {
  const { toast: originalToast, ...rest } = useToastOriginal();

  const toast = (props: ToastProps) => {
    const { title, description, variant = 'default', duration = 5000 } = props;
    return originalToast({
      title,
      description,
      variant,
      duration,
    });
  };

  return {
    toast,
    ...rest,
  };
}
