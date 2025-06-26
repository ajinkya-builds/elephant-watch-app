import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AndroidNavDrawerProps {
  open: boolean;
  onClose: () => void;
}

/**
 * AndroidNavDrawer component
 * 
 * Android-style Material Design navigation drawer (hamburger menu)
 * Implemented with Tailwind CSS
 */
export function AndroidNavDrawer({ open, onClose }: AndroidNavDrawerProps) {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Generate user initials for the avatar
  const getUserInitial = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };
  
  // Main navigation items
  const navItems = [
    { 
      name: 'Home', 
      path: '/', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      visible: true 
    },
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      visible: user?.role !== 'data_collector' 
    },
    { 
      name: 'Report Activity', 
      path: '/report-activity', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      visible: true 
    },
  ];

  // Admin navigation items
  const adminItems = [
    { 
      name: 'Admin Dashboard', 
      path: '/admin', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      visible: isAdmin 
    },
    { 
      name: 'User Management', 
      path: '/admin/users', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      visible: isAdmin 
    },
    { 
      name: 'Observations', 
      path: '/admin/observations', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      visible: isAdmin 
    },
    { 
      name: 'Statistics', 
      path: '/admin/statistics', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      visible: isAdmin 
    },
    { 
      name: 'Settings', 
      path: '/admin/settings', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      visible: isAdmin 
    },
    { 
      name: 'Notifications', 
      path: '/admin/notifications', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      visible: isAdmin 
    }
  ];

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-all duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <aside 
        className={`fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-all duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navigation drawer"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-medium text-lg shadow-sm mr-3">
              {getUserInitial()}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{user?.email || 'User'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {user?.role ? user.role.replace('_', ' ') : 'User'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-gray-700 dark:active:bg-gray-600 transition-colors"
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Navigation items */}
        <nav className="p-3 overflow-y-auto h-[calc(100%-80px)]">
          <ul className="space-y-1.5">
            {navItems
              .filter(item => item.visible)
              .map((item) => {
                const active = isActive(item.path);
                return (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:-translate-y-0.5 active:translate-y-0'
                      }`}
                      onClick={onClose}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span className={`mr-3 ${active ? 'text-blue-500 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}>
                        {item.icon}
                      </span>
                      {item.name}
                    </Link>
                  </li>
                );
              })}
          </ul>
          
          {/* Divider */}
          {isAdmin && (
            <div className="my-4 border-t border-gray-100 dark:border-gray-700" aria-hidden="true" />
          )}
          
          {/* Admin section header */}
          {isAdmin && (
            <h3 className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Administration
            </h3>
          )}
          
          {/* Admin items */}
          <ul className="space-y-1.5">
            {adminItems
              .filter(item => item.visible)
              .map((item) => {
                const active = isActive(item.path);
                return (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:-translate-y-0.5 active:translate-y-0'
                      }`}
                      onClick={onClose}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span className={`mr-3 ${active ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {item.icon}
                      </span>
                      {item.name}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
