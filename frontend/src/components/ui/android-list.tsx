import { forwardRef, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * AndroidList component
 * 
 * A Material Design 3 list component for displaying collections of items
 */
export interface AndroidListProps extends HTMLAttributes<HTMLUListElement> {
  /**
   * List density
   * - default: Standard list items (56px one-line, 72px two-line)
   * - compact: More compact list items (48px one-line, 64px two-line)
   * - comfortable: More spacious list items (64px one-line, 80px two-line)
   */
  density?: "default" | "compact" | "comfortable";

  /**
   * List appearance
   * - plain: No background or borders
   * - outlined: List has an outline
   * - card: List appears as a card
   */
  appearance?: "plain" | "outlined" | "card";
  
  /**
   * Whether to include dividers between list items
   */
  dividers?: boolean;
  
  /**
   * Whether to disable rounded corners (for full-width lists)
   */
  disableRounded?: boolean;
}

export const AndroidList = forwardRef<HTMLUListElement, AndroidListProps>(
  ({
    className,
    density = "default",
    appearance = "plain",
    dividers = false,
    disableRounded = false,
    ...props
  }, ref) => {
    return (
      <ul
        ref={ref}
        className={cn(
          // Base styles
          "w-full",
          
          // Appearance styling
          appearance === "outlined" && "border border-gray-200",
          appearance === "card" && "bg-white shadow-sm",
          
          // Rounded corners (unless disabled)
          !disableRounded && (appearance !== "plain") && "rounded-lg overflow-hidden",
          
          // Custom class
          className
        )}
        {...props}
      />
    );
  }
);

AndroidList.displayName = "AndroidList";

/**
 * AndroidListItem component
 */
export interface AndroidListItemProps extends HTMLAttributes<HTMLLIElement> {
  /**
   * Leading element (typically an icon or avatar)
   */
  leading?: ReactNode;
  
  /**
   * Primary text content
   */
  primary: ReactNode;
  
  /**
   * Secondary text content (for two-line list items)
   */
  secondary?: ReactNode;
  
  /**
   * Trailing element (typically an icon, checkbox, switch)
   */
  trailing?: ReactNode;
  
  /**
   * Whether this item is currently active/selected
   */
  active?: boolean;
  
  /**
   * Make the list item interactive (with hover effects)
   */
  interactive?: boolean;
  
  /**
   * Whether to show a divider below this item
   */
  divider?: boolean;
  
  /**
   * Custom padding for special cases
   */
  padding?: string;
}

export const AndroidListItem = forwardRef<HTMLLIElement, AndroidListItemProps>(
  ({
    className,
    leading,
    primary,
    secondary,
    trailing,
    active = false,
    divider = false,
    interactive = true,
    padding,
    ...props
  }, ref) => {
    return (
      <li
        ref={ref}
        className={cn(
          // Base styles
          "relative flex items-center w-full",
          
          // Default padding (unless custom specified)
          padding || "px-4 py-3",
          
          // Interactive states
          interactive && "transition-colors",
          interactive && !active && "hover:bg-gray-50 active:bg-gray-100",
          active && "bg-blue-50",
          
          // Divider
          divider && "border-b border-gray-100",
          
          // Custom class
          className
        )}
        {...props}
      >
        {/* Leading element */}
        {leading && (
          <div className="mr-4 flex-shrink-0">
            {leading}
          </div>
        )}
        
        {/* Text content */}
        <div className="flex-1 min-w-0">
          {/* Primary text */}
          <div className="text-sm font-medium text-gray-900 truncate">
            {primary}
          </div>
          
          {/* Secondary text (if provided) */}
          {secondary && (
            <div className="text-xs text-gray-500 truncate mt-0.5">
              {secondary}
            </div>
          )}
        </div>
        
        {/* Trailing element */}
        {trailing && (
          <div className="ml-4 flex-shrink-0">
            {trailing}
          </div>
        )}
      </li>
    );
  }
);

AndroidListItem.displayName = "AndroidListItem";

/**
 * AndroidListSubheader component
 */
export interface AndroidListSubheaderProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to make the subheader sticky
   */
  sticky?: boolean;
}

export const AndroidListSubheader = forwardRef<HTMLDivElement, AndroidListSubheaderProps>(
  ({
    className,
    sticky = false,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider",
          
          // Sticky positioning
          sticky && "sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10",
          
          // Custom class
          className
        )}
        {...props}
      />
    );
  }
);

AndroidListSubheader.displayName = "AndroidListSubheader";

/**
 * AndroidListDivider component
 */
export interface AndroidListDividerProps extends HTMLAttributes<HTMLHRElement> {
  /**
   * Whether the divider should have inset margin
   */
  inset?: boolean;
}

export const AndroidListDivider = forwardRef<HTMLHRElement, AndroidListDividerProps>(
  ({
    className,
    inset = false,
    ...props
  }, ref) => {
    return (
      <hr
        ref={ref}
        className={cn(
          // Base styles
          "border-t border-gray-100",
          
          // Inset margin
          inset && "ml-16",
          
          // Custom class
          className
        )}
        {...props}
      />
    );
  }
);

AndroidListDivider.displayName = "AndroidListDivider";
