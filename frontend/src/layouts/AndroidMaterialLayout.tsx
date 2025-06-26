import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AndroidBottomNavigation } from "@/components/ui/android-bottom-navigation";
import { AndroidNavRail } from "@/components/ui/android-nav-rail";
import { AndroidAppBar } from "@/components/ui/android-app-bar";
import { useAndroidTheme } from "@/theme/AndroidThemeProvider";
import { applyThemeClasses } from "@/theme/AndroidThemeUtils";

// SVG Icons for navigation
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" />
    <rect x="14" y="3" width="7" height="5" />
    <rect x="14" y="12" width="7" height="9" />
    <rect x="3" y="16" width="7" height="5" />
  </svg>
);

const ActivityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
  </svg>
);

const AdminIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
    <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
    <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
  </svg>
);

const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="5" />
    <path d="M20 21a8 8 0 1 0-16 0" />
  </svg>
);

// Navigation items
const navigationItems = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    icon: <HomeIcon />,
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    id: 'report',
    label: 'Report',
    href: '/report-activity',
    icon: <ActivityIcon />,
  },
  {
    id: 'admin',
    label: 'Admin',
    href: '/admin',
    icon: <AdminIcon />,
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/user-profile',
    icon: <ProfileIcon />,
  },
];

export interface AndroidMaterialLayoutProps {
  /**
   * Optional additional class names for the layout container
   */
  className?: string;
}

export function AndroidMaterialLayout({ className }: AndroidMaterialLayoutProps) {
  const { theme, toggleDarkMode } = useAndroidTheme();
  const location = useLocation(); // We use this to get current route for title
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  
  // Determine current page title based on route
  const getCurrentPageTitle = () => {
    const path = location.pathname;
    
    // Match routes to titles
    if (path === '/' || path === '/dashboard') return 'Home';
    if (path.startsWith('/report-activity')) return 'Report Activity';
    if (path.startsWith('/admin')) {
      if (path === '/admin') return 'Admin';
      if (path.includes('/users')) return 'User Management';
      if (path.includes('/observations')) return 'Observations';
      if (path.includes('/statistics')) return 'Statistics';
      if (path.includes('/settings')) return 'Settings';
      if (path.includes('/notifications')) return 'Notifications';
      return 'Admin';
    }
    if (path.startsWith('/user-profile')) return 'My Profile';
    
    return 'Elephant Watch';
  };
  
  // Check if the screen is large enough for nav rail
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 768); // 768px is typical tablet breakpoint
    };
    
    // Initial check
    checkScreenSize();
    
    // Add listener for resize events
    window.addEventListener('resize', checkScreenSize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);
  
  // Apply appropriate theme background and text color to the layout
  const themeClasses = applyThemeClasses(theme, 
    'bg-background text-onBackground'
  );
  
  return (
    <div className={cn(
      "flex h-screen w-full overflow-hidden",
      themeClasses,
      className
    )}>
      {/* Navigation Rail for larger screens */}
      {isLargeScreen && (
        <AndroidNavRail 
          items={navigationItems}
          showLabels="selected"
        />
      )}
      
      {/* Main Content Area */}
      <main className={cn(
        "flex-1 flex flex-col overflow-auto",
        isLargeScreen ? "ml-20" : "",
        isLargeScreen ? "pb-4" : "pb-20" // Add padding for bottom navigation
      )}>
        {/* App Bar */}
        <AndroidAppBar 
          title={getCurrentPageTitle()}
          elevated
          centerTitle={!isLargeScreen}
          navigationIcon={
            !isLargeScreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            ) : undefined
          }
          actions={[
            {
              icon: theme.isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 4.93-1.41 1.41" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              ),
              label: theme.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
              onClick: toggleDarkMode
            }
          ]}
        />
        
        {/* Page Content - Rendered by Router */}
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
      
      {/* Bottom Navigation for mobile screens */}
      {!isLargeScreen && (
        <AndroidBottomNavigation 
          items={navigationItems}
          showLabels="always"
        />
      )}
    </div>
  );
}
