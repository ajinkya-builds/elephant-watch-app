import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LogOut, UserCircle, Settings, User, PawPrint, Menu, X, WifiOff } from "lucide-react";
import { useNetworkStatus } from '@/utils/networkStatus';
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
  const { isOnline } = useNetworkStatus();

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Logout button clicked');
    
    try {
      if (!isOnline) {
        toast.warning("Cannot log out while offline. Please reconnect to the internet and try again.", {
          duration: 5000
        });
        return;
      }
      
      console.log('Starting sign out process...');
      
      // Use the signOut method from the auth context
      // which handles navigation and toast messages internally
      await signOut();
      
      // The signOut function from useAuth already handles navigation to /login
      // No need to navigate again here
      
    } catch (error) {
      console.error('Error during sign out:', error);
      toast.error("Sign out failed. Please try again.");
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
          {!isOnline && (
            <div className="flex items-center text-sm text-amber-600 mr-2">
              <WifiOff className="h-4 w-4 mr-1" />
              <span>Offline</span>
            </div>
          )}
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