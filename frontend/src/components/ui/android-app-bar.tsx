import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useAndroidTheme } from "@/theme/AndroidThemeProvider";
import { applyThemeClasses } from "@/theme/AndroidThemeUtils";

export interface AndroidAppBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to apply elevation shadow to the app bar
   * @default true
   */
  elevated?: boolean;
  
  /**
   * The title text to display in the app bar
   */
  title?: string;
  
  /**
   * Icon component to display on the left side of the app bar (typically a menu or back button)
   */
  navigationIcon?: ReactNode;
  
  /**
   * Event handler for when the navigation icon is clicked
   */
  onNavigationIconClick?: () => void;
  
  /**
   * Array of action items to display on the right side of the app bar
   */
  actions?: {
    icon: ReactNode;
    label: string;
    onClick: () => void;
    disabled?: boolean;
  }[];
  
  /**
   * Whether the app bar is in a prominent style (taller with larger title)
   * @default false
   */
  prominent?: boolean;
  
  /**
   * Center-align the title
   * @default false
   */
  centerTitle?: boolean;
  
  /**
   * Custom content to render below the main app bar (e.g., tabs)
   */
  bottom?: ReactNode;
}

export function AndroidAppBar({
  className,
  elevated = true,
  title,
  navigationIcon,
  onNavigationIconClick,
  actions = [],
  prominent = false,
  centerTitle = false,
  bottom,
  children,
  ...props
}: AndroidAppBarProps) {
  const { theme } = useAndroidTheme();
  
  // Apply theme colors
  const themeClasses = applyThemeClasses(theme, 
    'bg-primary text-onPrimary'
  );
  
  return (
    <header
      className={cn(
        // Base styles
        "relative w-full flex flex-col",
        // Elevation and border
        elevated ? "shadow-md" : "border-b border-gray-200 dark:border-gray-800",
        themeClasses,
        className
      )}
      {...props}
    >
      {/* Main toolbar area */}
      <div
        className={cn(
          "flex items-center gap-4 px-4",
          prominent ? "h-24" : "h-14",
        )}
      >
        {/* Navigation icon (e.g., menu or back button) */}
        {navigationIcon && (
          <button
            type="button"
            onClick={onNavigationIconClick}
            className={cn(
              "flex items-center justify-center",
              "w-10 h-10 rounded-full",
              "text-current",
              "hover:bg-white/10 active:bg-white/20",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
            )}
            aria-label="Navigation"
          >
            {navigationIcon}
          </button>
        )}
        
        {/* Title */}
        {title && (
          <h1
            className={cn(
              "font-medium truncate text-white",
              prominent ? "text-2xl" : "text-xl",
              centerTitle && "absolute left-1/2 transform -translate-x-1/2",
              centerTitle && navigationIcon && "pl-10", // Offset for nav icon
              centerTitle && actions.length > 0 && "pr-10" // Offset for actions
            )}
          >
            {title}
          </h1>
        )}
        
        {/* Action items */}
        {actions.length > 0 && (
          <div className="flex items-center gap-1 ml-auto">
            {actions.map((action, index) => (
              <button
                key={index}
                type="button"
                onClick={action.onClick}
                disabled={action.disabled}
                className={cn(
                  "flex items-center justify-center",
                  "w-10 h-10 rounded-full",
                  "text-current",
                  "hover:bg-white/10 active:bg-white/20",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75",
                  "disabled:opacity-40 disabled:cursor-not-allowed"
                )}
                aria-label={action.label}
                title={action.label}
              >
                {action.icon}
              </button>
            ))}
          </div>
        )}
        
        {/* Custom children */}
        {children}
      </div>
      
      {/* Bottom content (e.g., tabs) */}
      {bottom && (
        <div className="w-full bg-inherit">
          {bottom}
        </div>
      )}
    </header>
  );
}
