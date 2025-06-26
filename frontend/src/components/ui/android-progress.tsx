import { HTMLAttributes, SVGAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * AndroidCircularProgress component
 * 
 * A Material Design 3 circular progress indicator
 */
export interface AndroidCircularProgressProps extends SVGAttributes<SVGSVGElement> {
  /**
   * Size of the progress indicator in pixels
   * @default 48
   */
  size?: number;

  /**
   * Stroke width/thickness
   * @default 4
   */
  strokeWidth?: number;

  /**
   * Whether this is a determinate progress indicator
   * @default false
   */
  determinate?: boolean;

  /**
   * Progress value (0-100) for determinate progress
   * @default 0
   */
  value?: number;

  /**
   * Color of the progress indicator
   */
  color?: "primary" | "secondary" | "neutral" | "success" | "warning" | "error";
}

export const AndroidCircularProgress = forwardRef<SVGSVGElement, AndroidCircularProgressProps>(
  ({
    className,
    size = 48,
    strokeWidth = 4,
    determinate = false,
    value = 0,
    color = "primary",
    ...props
  }, ref) => {
    // Normalize value between 0-100
    const normalizedValue = Math.min(100, Math.max(0, value));
    
    // Calculate svg parameters
    const center = size / 2;
    const radius = center - strokeWidth;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = determinate
      ? circumference - (normalizedValue / 100) * circumference
      : 0;
      
    // Color classes
    const colorClasses = {
      primary: "text-blue-600",
      secondary: "text-green-600",
      neutral: "text-gray-600",
      success: "text-green-600",
      warning: "text-amber-600",
      error: "text-red-600"
    };

    return (
      <svg
        ref={ref}
        className={cn(
          // Animation for indeterminate
          !determinate && "animate-spin",
          
          // Color classes
          colorClasses[color],
          
          // Custom class
          className
        )}
        style={{ width: size, height: size }}
        viewBox={`0 0 ${size} ${size}`}
        {...props}
      >
        {/* Background circle */}
        {determinate && (
          <circle
            className="text-gray-200"
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            stroke="currentColor"
          />
        )}
        
        {/* Progress circle */}
        <circle
          className="transition-all duration-300"
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          // For indeterminate, animate with css
          style={determinate ? {} : { strokeDashoffset: circumference * 0.75 }}
        />
      </svg>
    );
  }
);

AndroidCircularProgress.displayName = "AndroidCircularProgress";

/**
 * AndroidLinearProgress component
 * 
 * A Material Design 3 linear progress indicator
 */
export interface AndroidLinearProgressProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Whether this is a determinate progress indicator
   * @default false
   */
  determinate?: boolean;

  /**
   * Progress value (0-100) for determinate progress
   * @default 0
   */
  value?: number;

  /**
   * Color of the progress indicator
   */
  color?: "primary" | "secondary" | "neutral" | "success" | "warning" | "error";
  
  /**
   * Height of the progress bar
   * @default 4
   */
  height?: number;

  /**
   * Show percentage text
   * @default false
   */
  showPercentage?: boolean;
}

export const AndroidLinearProgress = forwardRef<HTMLDivElement, AndroidLinearProgressProps>(
  ({
    className,
    determinate = false,
    value = 0,
    color = "primary",
    height = 4,
    showPercentage = false,
    ...props
  }, ref) => {
    // Normalize value between 0-100
    const normalizedValue = Math.min(100, Math.max(0, value));
    
    // Color classes
    const colorClasses = {
      primary: "bg-blue-600",
      secondary: "bg-green-600",
      neutral: "bg-gray-600",
      success: "bg-green-600",
      warning: "bg-amber-600",
      error: "bg-red-600"
    };
    
    return (
      <div
        className={cn(
          "w-full flex flex-col",
          className
        )}
        {...props}
      >
        <div
          ref={ref}
          className="w-full bg-gray-200 rounded-full overflow-hidden"
          style={{ height }}
        >
          <div
            className={cn(
              // Color classes
              colorClasses[color],
              
              // Animation for indeterminate
              !determinate && "animate-indeterminate",
              
              // Basic style
              "h-full rounded-full"
            )}
            style={determinate ? { width: `${normalizedValue}%` } : {}}
          />
        </div>
        
        {/* Percentage text */}
        {determinate && showPercentage && (
          <div className="text-xs text-right mt-1 text-gray-600">
            {`${normalizedValue}%`}
          </div>
        )}
      </div>
    );
  }
);

AndroidLinearProgress.displayName = "AndroidLinearProgress";

/**
 * AndroidLoadingDots component
 * 
 * A Material Design loading dots animation
 */
export interface AndroidLoadingDotsProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Size of the dots
   * @default "medium"
   */
  size?: "small" | "medium" | "large";
  
  /**
   * Color of dots
   */
  color?: "primary" | "neutral" | "white";
}

export const AndroidLoadingDots = forwardRef<HTMLDivElement, AndroidLoadingDotsProps>(
  ({
    className,
    size = "medium", 
    color = "primary",
    ...props
  }, ref) => {
    // Size classes
    const sizeClasses = {
      small: "h-1 w-1 gap-1",
      medium: "h-2 w-2 gap-1.5",
      large: "h-3 w-3 gap-2"
    };
    
    // Color classes
    const colorClasses = {
      primary: "bg-blue-600",
      neutral: "bg-gray-600",
      white: "bg-white"
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center",
          className
        )}
        {...props}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "rounded-full animate-pulse",
              `animate-delay-${i * 200}`,
              sizeClasses[size],
              colorClasses[color]
            )}
          />
        ))}
      </div>
    );
  }
);

AndroidLoadingDots.displayName = "AndroidLoadingDots";

// Define keyframes for the indeterminate animation in your global CSS or Tailwind config
// @keyframes indeterminate {
//   0% { width: 30%; left: -30%; }
//   60% { left: 100%; width: 30%; }
//   100% { left: 100%; width: 0; }
// }
