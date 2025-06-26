import { HTMLAttributes, DialogHTMLAttributes, forwardRef, Fragment, ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/**
 * AndroidDialog component
 * 
 * A Material Design 3 dialog component for alerts, confirmations, and decisions
 */
export interface AndroidDialogProps extends DialogHTMLAttributes<HTMLDialogElement> {
  /**
   * Whether the dialog is open
   */
  open: boolean;
  
  /**
   * Callback when dialog is dismissed
   */
  onDismiss: () => void;
  
  /**
   * Dialog title
   */
  title?: ReactNode;
  
  /**
   * Dialog content
   */
  children: ReactNode;
  
  /**
   * Dialog actions (buttons)
   */
  actions?: ReactNode;
  
  /**
   * Dialog size
   */
  size?: "auto" | "sm" | "md" | "lg" | "fullscreen";
  
  /**
   * Whether to show a close button in the title bar
   */
  showCloseButton?: boolean;
  
  /**
   * Dialog icon (shown in title area)
   */
  icon?: ReactNode;
}

export function AndroidDialog({
  className,
  open,
  onDismiss,
  title,
  children,
  actions,
  size = "auto",
  showCloseButton = false,
  icon,
  ...props
}: AndroidDialogProps) {
  // Size classes
  const sizeClasses = {
    auto: "w-auto",
    sm: "w-full max-w-sm",
    md: "w-full max-w-md",
    lg: "w-full max-w-lg",
    fullscreen: "w-full h-full max-w-none m-0 rounded-none",
  };

  // Only render if open
  if (!open) return null;
  
  // Create portal for dialog
  return createPortal(
    <Fragment>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onDismiss}
        aria-hidden="true"
      />
      
      {/* Dialog */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            // Base styles
            "bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all",
            "focus:outline-none",
            // Size class
            sizeClasses[size],
            // Custom class
            className
          )}
          {...props}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Title area */}
          {title && (
            <div className="flex items-center justify-between px-6 pt-5 pb-2">
              <div className="flex items-center">
                {/* Optional icon */}
                {icon && <span className="mr-3 text-blue-600">{icon}</span>}
                
                {/* Title text */}
                <h2 className="text-lg font-medium text-gray-900">{title}</h2>
              </div>
              
              {/* Close button */}
              {showCloseButton && (
                <button
                  type="button"
                  className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                  onClick={onDismiss}
                  aria-label="Close"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}
          
          {/* Content area */}
          <div className={cn(
            "px-6 py-4",
            size === "fullscreen" && "flex-grow overflow-auto",
          )}>
            {children}
          </div>
          
          {/* Actions area */}
          {actions && (
            <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50">
              {actions}
            </div>
          )}
        </div>
      </div>
    </Fragment>,
    document.body
  );
}

/**
 * AndroidDialogTitle component
 */
interface AndroidDialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export const AndroidDialogTitle = forwardRef<HTMLHeadingElement, AndroidDialogTitleProps>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn("text-lg font-medium text-gray-900", className)}
      {...props}
    />
  )
);

AndroidDialogTitle.displayName = "AndroidDialogTitle";

/**
 * AndroidDialogContent component
 */
interface AndroidDialogContentProps extends HTMLAttributes<HTMLDivElement> {}

export const AndroidDialogContent = forwardRef<HTMLDivElement, AndroidDialogContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-sm text-gray-600", className)}
      {...props}
    />
  )
);

AndroidDialogContent.displayName = "AndroidDialogContent";

/**
 * AndroidDialogActions component
 */
interface AndroidDialogActionsProps extends HTMLAttributes<HTMLDivElement> {}

export const AndroidDialogActions = forwardRef<HTMLDivElement, AndroidDialogActionsProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex justify-end gap-2", className)}
      {...props}
    />
  )
);

AndroidDialogActions.displayName = "AndroidDialogActions";
