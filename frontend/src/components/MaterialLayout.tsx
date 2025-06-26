import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Footer } from './Footer';
import { AndroidAppBar } from './AndroidAppBar';
import { AndroidNavDrawer } from './AndroidNavDrawer';
import { AndroidBottomNavigation } from './AndroidBottomNavigation';

/**
 * MaterialLayout component
 * 
 * This component provides an Android Material Design styled layout structure
 * using our custom Android-style components built with Tailwind CSS
 */
export function MaterialLayout() {
  // State for navigation drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Check if the device is mobile-sized
  const [isMobile, setIsMobile] = useState(false);
  
  // Handle closing the navigation drawer
  const handleDrawerClose = () => setDrawerOpen(false);
  
  useEffect(() => {
    // Set initial mobile state
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Use 768px as mobile breakpoint (md)
    };
    
    // Set initial state
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Android App Bar - Pass drawer toggle function */}
      <AndroidAppBar onMenuClick={() => setDrawerOpen(true)} />
      
      {/* Android Navigation Drawer */}
      <AndroidNavDrawer 
        open={drawerOpen} 
        onClose={handleDrawerClose} 
      />
      
      {/* Main Content - with Android-style padding */}
      <main className="flex-grow container mx-auto px-4 py-4 sm:px-6 md:px-8">
        {/* Router Outlet for page content */}
        <Outlet />
      </main>
      
      {/* Footer - Hidden on mobile since we have bottom nav */}
      {!isMobile && <Footer />}
      
      {/* Android Bottom Navigation - Only on mobile */}
      {isMobile && <AndroidBottomNavigation />}
    </div>
  );
}
