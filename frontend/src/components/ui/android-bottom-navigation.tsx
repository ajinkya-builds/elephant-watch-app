import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

export interface AndroidBottomNavigationProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Navigation items to be displayed in the bottom bar
   */
  items: {
    /**
     * Unique identifier for the item
     */
    id: string;
    
    /**
     * Display label for the navigation item
     */
    label: string;
    
    /**
     * URL to navigate to when the item is clicked
     */
    href: string;
    
    /**
     * Icon to display for the navigation item
     */
    icon: React.ReactNode;
    
    /**
     * Optional badge count to display on the icon
     */
    badgeCount?: number;
    
    /**
     * Whether the navigation item is disabled
     */
    disabled?: boolean;
  }[];
  
  /**
   * Custom value for the active item. If not provided, uses the current route.
   */
  value?: string;
  
  /**
   * Handler for when a navigation item is changed
   */
  onValueChange?: (value: string) => void;
  
  /**
   * Whether the bottom navigation should display labels
   */
  showLabels?: "always" | "selected" | "never";
}

export function AndroidBottomNavigation({
  className,
  items,
  value,
  onValueChange,
  showLabels = "always",
  ...props
}: AndroidBottomNavigationProps) {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(value || getCurrentRouteValue(location.pathname, items));
  
  // Update active item when route changes
  React.useEffect(() => {
    if (!value) {
      setActiveItem(getCurrentRouteValue(location.pathname, items));
    }
  }, [location.pathname, items, value]);
  
  // Update active item when value prop changes
  React.useEffect(() => {
    if (value) {
      setActiveItem(value);
    }
  }, [value]);

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
    if (onValueChange) {
      onValueChange(itemId);
    }
  };
  
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-white dark:bg-gray-800",
        "border-t border-gray-100 dark:border-gray-700",
        "flex items-center justify-around",
        "h-16 px-1",
        "shadow-lg shadow-gray-100/50 dark:shadow-gray-900/20",
        "backdrop-blur-sm bg-white/95 dark:bg-gray-800/95",
        className
      )}
      {...props}
    >
      {items.map((item) => {
        const isActive = activeItem === item.id;
        return (
          <Link
            key={item.id}
            to={item.href}
            onClick={() => !item.disabled && handleItemClick(item.id)}
            className={cn(
              "relative flex-1 flex flex-col items-center justify-center h-full px-2",
              "transition-all duration-200",
              isActive 
                ? "text-blue-500 dark:text-blue-300" 
                : "text-gray-500 dark:text-gray-400",
              item.disabled 
                ? "opacity-40 cursor-not-allowed" 
                : "hover:text-blue-400 hover:-translate-y-0.5 active:translate-y-0 dark:hover:text-blue-300",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 focus-visible:ring-offset-2 rounded-md"
            )}
            aria-current={isActive ? "page" : undefined}
            aria-disabled={item.disabled}
            tabIndex={item.disabled ? -1 : 0}
          >
            {/* Icon */}
            <div className="relative">
              <div className={cn(
                "text-xl",
                isActive ? "scale-110 transition-transform text-blue-500 dark:text-blue-300" : "text-gray-500 dark:text-gray-400"
              )}>
                {item.icon}
              </div>
              
              {/* Badge */}
              {item.badgeCount && item.badgeCount > 0 && (
                <span className={cn(
                  "absolute -top-1 -right-1",
                  "flex items-center justify-center",
                  "min-w-[18px] h-[18px]",
                  "text-[10px] font-medium",
                  "rounded-full",
                  "bg-red-500 text-white",
                  "shadow-sm",
                  "border border-white dark:border-gray-800",
                  "px-1"
                )}>
                  {item.badgeCount > 99 ? "99+" : item.badgeCount}
                </span>
              )}
            </div>
            
            {/* Label */}
            {(showLabels === "always" || (showLabels === "selected" && isActive)) && (
              <span className={cn(
                "mt-1 text-xs font-medium",
                "whitespace-nowrap overflow-hidden text-ellipsis",
                "max-w-full",
                isActive ? "text-blue-500 dark:text-blue-300" : "text-gray-500 dark:text-gray-400"
              )}>
                {item.label}
              </span>
            )}
            
            {/* Active indicator */}
            {isActive && (
              <div className="absolute bottom-0 w-12 h-0.5 rounded-t-full bg-blue-500 dark:bg-blue-300 shadow-sm transition-all duration-200" />
            )}
          </Link>
        );
      })}
    </div>
  );
}

// Helper function to determine active item based on current route
function getCurrentRouteValue(pathname: string, items: AndroidBottomNavigationProps["items"]) {
  // Try exact match first
  const exactMatch = items.find((item) => item.href === pathname);
  if (exactMatch) return exactMatch.id;
  
  // Try partial match (for nested routes)
  const partialMatch = items.find((item) => 
    pathname.startsWith(item.href) && item.href !== "/"
  );
  if (partialMatch) return partialMatch.id;
  
  // Default to first non-disabled item
  const defaultItem = items.find((item) => !item.disabled);
  return defaultItem ? defaultItem.id : items[0].id;
}
