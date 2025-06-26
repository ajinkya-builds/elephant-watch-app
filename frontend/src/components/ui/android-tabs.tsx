import { useState, ReactNode, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * AndroidTabs component
 * 
 * A Material Design 3 Tabs component for organizing content
 */
type Tab = {
  /**
   * Unique identifier for the tab
   */
  id: string;
  
  /**
   * Tab label text
   */
  label: string;
  
  /**
   * Optional icon to display in the tab
   */
  icon?: ReactNode;
  
  /**
   * Optional badge count to display
   */
  badgeCount?: number;
  
  /**
   * Optional disabled state
   */
  disabled?: boolean;
  
  /**
   * Content to display when tab is selected
   */
  content: ReactNode;
};

interface AndroidTabsProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Array of tab definitions
   */
  tabs: Tab[];
  
  /**
   * Initially selected tab ID
   */
  defaultTabId?: string;
  
  /**
   * Tabs variant
   * - fixed: Equal width tabs that fill the container
   * - scrollable: Tabs can scroll horizontally
   */
  variant?: "fixed" | "scrollable";
  
  /**
   * Callback when tab changes
   */
  onTabChange?: (tabId: string) => void;
  
  /**
   * Show icons in tabs
   */
  showIcons?: boolean;
}

export function AndroidTabs({
  className,
  tabs,
  defaultTabId,
  variant = "fixed",
  onTabChange,
  showIcons = false,
  ...props
}: AndroidTabsProps) {
  // Use first tab as default if not specified
  const initialTabId = defaultTabId || (tabs.length > 0 ? tabs[0].id : "");
  const [activeTabId, setActiveTabId] = useState(initialTabId);
  
  // Get the content of the active tab
  const activeTabContent = tabs.find(tab => tab.id === activeTabId)?.content;
  
  // Handle tab click
  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId);
    onTabChange?.(tabId);
  };
  
  return (
    <div className={cn("w-full", className)} {...props}>
      {/* Tab bar */}
      <div className={cn(
        "flex border-b border-gray-200",
        variant === "scrollable" ? "overflow-x-auto" : "justify-between"
      )}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            disabled={tab.disabled}
            className={cn(
              // Base styles
              "flex items-center justify-center py-3 px-4 text-sm font-medium transition-all",
              "relative focus:outline-none",
              
              // Fixed or scrollable variant
              variant === "fixed" ? "flex-1" : "whitespace-nowrap",
              
              // Active/inactive styling
              activeTabId === tab.id
                ? "text-blue-600"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
              
              // Disabled state
              tab.disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {/* Icon */}
            {showIcons && tab.icon && (
              <span className={cn(
                "inline-flex",
                tab.label && "mr-2"
              )}>
                {tab.icon}
              </span>
            )}
            
            {/* Label */}
            <span>{tab.label}</span>
            
            {/* Badge */}
            {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
              <span className="ml-1.5 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                {tab.badgeCount}
              </span>
            )}
            
            {/* Active indicator line */}
            {activeTabId === tab.id && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full bg-blue-600" />
            )}
          </button>
        ))}
      </div>
      
      {/* Tab content */}
      <div className="py-4">
        {activeTabContent}
      </div>
    </div>
  );
}

/**
 * AndroidTabPanel component
 * 
 * Container for tab content with proper accessibility attributes
 */
interface AndroidTabPanelProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Tab ID this panel is associated with
   */
  tabId: string;
  
  /**
   * Whether this panel is currently selected
   */
  selected: boolean;
}

export function AndroidTabPanel({
  className,
  children,
  tabId,
  selected,
  ...props
}: AndroidTabPanelProps) {
  return (
    <div
      role="tabpanel"
      id={`tabpanel-${tabId}`}
      aria-labelledby={`tab-${tabId}`}
      hidden={!selected}
      className={cn("focus:outline-none", className)}
      tabIndex={selected ? 0 : -1}
      {...props}
    >
      {selected && children}
    </div>
  );
}
