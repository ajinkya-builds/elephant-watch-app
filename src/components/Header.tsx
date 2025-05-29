import React from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LogOut, UserCircle, Settings, User, PawPrint } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { NotificationBell } from './NotificationBell';

export function Header() {
  const { user, signOut, canManageUsers, canViewReports, canEditReports } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
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
                <PawPrint className="w-7 h-7 text-blue-600 relative z-10" />
              </span>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Eravat</span>
            </Link>
          </div>
          {/* Hamburger for mobile */}
          <div className="sm:hidden ml-auto">
            {/* Implement a simple hamburger menu for navigation links */}
            <input id="nav-toggle" type="checkbox" className="hidden peer" />
            <label htmlFor="nav-toggle" className="cursor-pointer p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </label>
            <div className="absolute left-0 top-16 w-full bg-white border-b shadow-md z-40 hidden peer-checked:block">
              <nav className="flex flex-col items-center py-2 gap-2">
                {user?.role !== 'data_collector' && (
                  <Link to="/dashboard" className="block px-4 py-2 text-sm font-medium text-gray-900">Dashboard</Link>
                )}
                <Link to="/report" className="block px-4 py-2 text-sm font-medium text-gray-900">Report Activity</Link>
              </nav>
            </div>
          </div>
          {/* Desktop nav */}
          <nav className="ml-0 sm:ml-6 hidden sm:flex space-x-8">
            {user?.role !== 'data_collector' && (
              <Link to="/dashboard" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900">Dashboard</Link>
            )}
            <Link to="/report" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900">Report Activity</Link>
          </nav>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-0 w-full sm:w-auto justify-end">
          <NotificationBell />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-12 px-4 rounded-full w-full sm:w-auto">
                <span className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-none">{user?.email}</span>
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
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
} 