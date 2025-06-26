import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNetworkStatus } from '@/utils/networkStatus';

interface AndroidAppBarProps {
  onMenuClick: () => void;
}

/**
 * AndroidAppBar component
 * 
 * An Android Material Design styled app bar with hamburger menu and actions
 * Implemented with Tailwind CSS
 */
export function AndroidAppBar({ onMenuClick }: AndroidAppBarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isOnline } = useNetworkStatus();
  
  // State for user menu only

  
  // State for user menu
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  if (!user) return null;

  return (
    <>
      {/* App Bar */}
      <header className="fixed top-0 left-0 w-full bg-surface-container-high dark:bg-surface-container-high-dark shadow-sm z-40">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Left section: Menu icon and logo */}
          <div className="flex items-center">
            <button 
              onClick={onMenuClick}
              className="p-2 rounded-full hover:bg-on-surface/8 active:bg-on-surface/12 transition-colors mr-2"
              aria-label="Open menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <Link to="/" className="flex items-center">
              <div className="relative flex items-center justify-center w-8 h-8 mr-2">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-sm opacity-30 animate-pulse"></div>
                <img
                  src={`${import.meta.env.BASE_URL}elephant_photo.png`}
                  alt="Elephant Logo"
                  className="relative w-full h-full object-contain"
                />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Eravat
              </span>
            </Link>
          </div>
          
          {/* Right section: Actions */}
          <div className="flex items-center">
            {/* Offline indicator */}
            {!isOnline && (
              <div className="flex items-center bg-amber-50 rounded-full px-3 py-1 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
                </svg>
                <span className="text-xs font-medium text-amber-800">Offline</span>
              </div>
            )}
            
            {/* Notifications */}
            <button 
              className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors relative mr-2"
              aria-label="Notifications"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            
            {/* User Profile */}
            <div className="flex items-center space-x-3">
              {/* Network status indicator */}
              <div 
                className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-error'}`}
                title={isOnline ? 'Online' : 'Offline'}
              ></div>
              
              {/* User avatar */}
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="relative flex items-center justify-center w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container font-medium hover:bg-secondary-container/80 transition-colors"
                aria-label="User menu"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                {user?.first_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </button>
              
              {/* User dropdown menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-50 border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium">{user.email || user.phone}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
                  </div>
                  
                  {user.role === 'admin' && (
                    <>
                      <div className="py-1">
                        <button
                          onClick={() => { navigate('/admin'); setUserMenuOpen(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Admin Dashboard
                        </button>
                        <button
                          onClick={() => { navigate('/admin/users'); setUserMenuOpen(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          User Management
                        </button>
                        <button
                          onClick={() => { navigate('/admin/settings'); setUserMenuOpen(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Settings
                        </button>
                      </div>
                      <div className="border-t border-gray-100"></div>
                    </>
                  )}
                  
                  <div className="py-1">
                    <button
                      onClick={() => {
                        // Handle sign out logic from your existing code
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Add 64px (h-16) top padding to body content to account for fixed header */}
      <div className="h-16"></div>
    </>
  );
}
