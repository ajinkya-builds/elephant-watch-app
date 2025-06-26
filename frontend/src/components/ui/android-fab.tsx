import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * AndroidFab component
 * 
 * A Material Design 3 Floating Action Button (FAB) component
 * FABs help people take primary actions in your app, appearing elevated above the UI
 */
export interface AndroidFabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * FAB variant based on Material Design 3
   * - regular: Standard FAB (56dp)
   * - small: Small FAB (40dp)
   * - large: Large FAB (96dp)
   * - extended: Extended FAB with text label
   */
  variant?: "regular" | "small" | "large" | "extended";
  
  /**
   * Alternative to variant for size specification - maps to variant
   * @deprecated Use variant instead
   */
  size?: "small" | "regular" | "large";

  /**
   * Icon element to display in the FAB
   */
  icon?: React.ReactNode;

  /**
   * Optional label text (required for 'extended' variant)
   */
  label?: string;

  /**
   * Color variant for the FAB
   */
  color?: "primary" | "secondary" | "tertiary" | "surface";
  
  /**
   * Position of the FAB on the screen
   */
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "center";
  
  /**
   * Accessibility label for screen readers
   */
  ariaLabel?: string;
}

const AndroidFab = forwardRef<HTMLButtonElement, AndroidFabProps>(
  ({
    className,
    variant,
    size,
    icon,
    label,
    color = "primary",
    position = "bottom-right",
    ariaLabel,
    type = "button",
    ...props
  }, ref) => {
    // If size is provided but variant isn't, use size as variant
    const resolvedVariant = variant || size || "regular";
    // Base color classes based on color prop
    const colorClasses = {
      primary: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white",
      secondary: "bg-green-600 hover:bg-green-700 active:bg-green-800 text-white",
      tertiary: "bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white",
      surface: "bg-white hover:bg-gray-50 active:bg-gray-100 text-blue-600 border border-gray-200",
    };

    // Size classes based on variant
    const sizeClasses = {
      small: "w-10 h-10 rounded-full shadow-md",
      regular: "w-14 h-14 rounded-full shadow-lg",
      large: "w-24 h-24 rounded-full shadow-xl",
      extended: "h-14 px-6 rounded-full shadow-lg",
    };
    
    // Position classes
    const positionClasses = {
      "bottom-right": "fixed bottom-6 right-6",
      "bottom-left": "fixed bottom-6 left-6",
      "top-right": "fixed top-6 right-6",
      "top-left": "fixed top-6 left-6",
      "center": "fixed bottom-1/2 right-1/2 translate-x-1/2 translate-y-1/2",
    };

    return (
      <button
        type={type}
        ref={ref}
        className={cn(
          // Common styles
          "inline-flex items-center justify-center",
          "transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          
          // Color and size classes
          colorClasses[color],
          sizeClasses[resolvedVariant],
          position && positionClasses[position],
          
          // Extended FAB specific style for icon+text alignment
          variant === "extended" && "pr-6",
          
          // Custom classes
          className
        )}
        aria-label={ariaLabel}
        {...props}
      >
        {/* Icon */}
        {icon && (
          <span className={cn(
            // Different spacing for extended variant
            variant === "extended" ? "mr-2" : "",
            
            // Size adjustment for large variant
            variant === "large" ? "text-3xl" : "text-xl",
          )}>
            {icon}
          </span>
        )}

        {/* Label - only for extended variant */}
        {variant === "extended" && label && (
          <span className="font-medium">{label}</span>
        )}
      </button>
    );
  }
);

AndroidFab.displayName = "AndroidFab";

export { AndroidFab };
