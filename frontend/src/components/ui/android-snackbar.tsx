import { HTMLAttributes, forwardRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

/**
 * AndroidSnackbar component
 * 
 * A Material Design 3 snackbar for brief messages and feedback
 */
export interface AndroidSnackbarProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Whether the snackbar is open/visible
   */
  open: boolean;
  
  /**
   * Message to display in the snackbar
   */
  message: string;
  
  /**
   * Optional action button text
   */
  actionLabel?: string;
  
  /**
   * Callback when action button is clicked
   */
  onAction?: () => void;
  
  /**
   * Callback when snackbar should close
   */
  onClose: () => void;
  
  /**
   * Duration in milliseconds before auto-closing
   * Set to 0 to disable auto-close
   * @default 5000
   */
  autoHideDuration?: number;
  
  /**
   * Leading icon element
   */
  icon?: ReactNode;
  
  /**
   * Snackbar position
   * @default "bottom-center"
   */
  position?: "bottom-center" | "bottom-left" | "bottom-right" | "top-center" | "top-left" | "top-right";
  
  /**
   * Snackbar variant
   */
  variant?: "default" | "success" | "warning" | "error";
}

export function AndroidSnackbar({
  className,
  open,
  message,
  actionLabel,
  onAction,
  onClose,
  autoHideDuration = 5000,
  icon,
  position = "bottom-center",
  variant = "default",
  ...props
}: AndroidSnackbarProps) {
  // Don't render anything if not open
  if (!open) return null;
  
  // Auto-close after duration
  if (autoHideDuration > 0) {
    const timer = setTimeout(() => {
      onClose();
    }, autoHideDuration);
    
    // Clean up timer
    const cleanup = () => {
      clearTimeout(timer);
    };
    cleanup();
  }
  
  // Position classes
  const positionClasses = {
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4"
  };
  
  // Variant classes
  const variantClasses = {
    "default": "bg-gray-900 text-white",
    "success": "bg-green-800 text-white",
    "warning": "bg-amber-800 text-white",
    "error": "bg-red-800 text-white"
  };
  
  return createPortal(
    <div
      className={cn(
        // Base styles
        "fixed z-50 flex items-center min-w-[250px] max-w-md p-4 rounded-lg shadow-lg animate-fade-in",
        
        // Position
        positionClasses[position],
        
        // Variant
        variantClasses[variant],
        
        className
      )}
      role="alert"
      {...props}
    >
      {/* Optional icon */}
      {icon && (
        <span className="mr-3 flex-shrink-0">
          {icon}
        </span>
      )}
      
      {/* Message */}
      <div className="flex-grow text-sm mr-2">
        {message}
      </div>
      
      {/* Action button */}
      {actionLabel && onAction && (
        <button
          className="ml-auto uppercase text-xs font-medium tracking-wider py-1 px-2 rounded hover:bg-white/10 active:bg-white/20"
          onClick={(e) => {
            e.stopPropagation();
            onAction();
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>,
    document.body
  );
}

/**
 * AndroidSnackbarProvider component
 * 
 * This component manages multiple snackbars in a queue
 * Usage: add this to your app and use the useSnackbar hook to show snackbars
 */
export interface SnackbarItem {
  id: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  autoHideDuration?: number;
  icon?: ReactNode;
  variant?: "default" | "success" | "warning" | "error";
}

export interface AndroidSnackbarProviderProps {
  /**
   * Maximum number of snackbars to show at once
   * @default 3
   */
  maxSnackbars?: number;
  
  /**
   * Children
   */
  children: ReactNode;
  
  /**
   * Default position for all snackbars
   * @default "bottom-center"
   */
  defaultPosition?: "bottom-center" | "bottom-left" | "bottom-right" | "top-center" | "top-left" | "top-right";
}

// You would implement a full snackbar provider and hook system here
// This would manage a queue of snackbars and display them
// For brevity, we're just providing the core component
// In a complete implementation, you would add:
// 1. A context provider for snackbars
// 2. A useSnackbar hook to show/hide snackbars
// 3. Queue management for multiple snackbars
// Example usage would be:
// const { showSnackbar } = useSnackbar();
// showSnackbar({message: "Item saved", actionLabel: "UNDO", variant: "success"});
