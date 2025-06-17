import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LogOut, UserCircle, Settings, User, PawPrint, Menu, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { NotificationBell } from './NotificationBell';

export function Header() {
  const { user, signOut, isAdmin, canManageUsers, canViewReports, canEditReports } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Logout button clicked');
    
    // Function to perform local cleanup and redirect
    const performLocalSignOut = () => {
      console.log('Performing local sign out cleanup...');
      
      // Clear all auth-related data
      const authKeys = [
        'sb-vfsyjvjghftfebvxyjba-auth-token',
        'sb-vfsyjvjghftfebvxyjba-auth-token-expires-at',
        'sb-vfsyjvjghftfebvxyjba-auth-refresh-token',
        'sb-vfsyjvjghftfebvxyjba-auth-user',
        'sb-vfsyjvjghftfebvxyjba-auth-session',
      ];
      
      // Clear all auth data from localStorage
      authKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Clear all cookies
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        if (name.startsWith('sb-')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        }
      });
      
      // Force a hard redirect to login with the correct base path
      console.log('Redirecting to login page...');
      const basePath = window.location.pathname.split('/').slice(0, 2).join('/');
      window.location.href = `${basePath}/login`;
    };
    
    try {
      console.log('1. Starting sign out process...');
      
      // Set a timeout for the Supabase sign out (3 seconds)
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Sign out timed out')), 3000)
      );
      
      console.log('2. Calling supabase.auth.signOut() with timeout...');
      
      try {
        // Race between the sign out and the timeout
        const { error } = await Promise.race([
          signOutPromise,
          timeoutPromise.then(() => ({ error: { message: 'Timeout' } }))
        ]) as { error?: any };
        
        if (error) {
          console.warn('3a. Warning during Supabase sign out (will continue with local cleanup):', error.message);
        } else {
          console.log('3b. Supabase sign out completed successfully');
        }
      } catch (signOutError) {
        console.warn('3c. Supabase sign out failed (will continue with local cleanup):', signOutError);
      }
      
      // Always perform local cleanup, even if Supabase sign out fails
      performLocalSignOut();
      
    } catch (error) {
      console.error('Unexpected error during sign out (will attempt local cleanup):', error);
      
      // Still try to perform local cleanup even if something else fails
      try {
        performLocalSignOut();
      } catch (cleanupError) {
        console.error('Error during local cleanup:', cleanupError);
        // Last resort: force a hard refresh with correct base path
        const basePath = window.location.pathname.split('/').slice(0, 2).join('/');
        window.location.href = `${basePath}/login`;
      }
    }
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col sm:flex-row h-auto sm:h-16 items-center justify-between px-4 sm:px-0 py-2 sm:py-0">
        <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto">
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="relative flex items-center justify-center w-8 h-8">
                <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-full blur-md opacity-30 animate-pulse"></span>
                <img
                  src={`${import.meta.env.BASE_URL}elephant_photo.png`}
                  alt="Elephant Logo"
                  className="relative w-full h-full object-contain"
                />
              </span>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Eravat</span>
            </Link>
          </div>
          
          {/* Enhanced Mobile Navigation */}
          <div className="sm:hidden ml-auto">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`absolute left-0 top-16 w-full bg-white border-b shadow-md z-40 transform transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0 pointer-events-none'
          } sm:hidden`}>
            <nav className="flex flex-col items-center py-2 gap-2">
              {user?.role !== 'data_collector' && (
                <Link 
                  to="/dashboard" 
                  className="w-full text-center px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              <Link 
                to="/report" 
                className="w-full text-center px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Report Activity
              </Link>
            </nav>
          </div>

          {/* Desktop Navigation */}
          <nav className="ml-0 sm:ml-6 hidden sm:flex space-x-8">
            {user?.role !== 'data_collector' && (
              <Link 
                to="/dashboard" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
              >
                Dashboard
              </Link>
            )}
            <Link 
              to="/report" 
              className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
            >
              Report Activity
            </Link>
          </nav>
        </div>

        {/* User Menu Section */}
        <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-0 w-full sm:w-auto justify-end">
          <NotificationBell />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-12 px-4 rounded-full w-full sm:w-auto hover:bg-gray-100 transition-colors"
              >
                <span className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-none">
                  {user?.email}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.email || user?.phone}</p>
                  <p className="text-xs leading-none text-muted-foreground capitalize">
                    {user?.role.replace('_', ' ')}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Admin Menu Items */}
              {user?.role === 'admin' && (
                <>
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    Admin Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin/users')}>
                    User Management
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin/observations')}>
                    Observations
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin/logs')}>
                    System Logs
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Common Menu Items */}
              <DropdownMenuItem asChild>
                <button 
                  className="w-full text-left flex items-center px-2 py-1.5 text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Logout button clicked directly');
                    handleSignOut(e);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
} 