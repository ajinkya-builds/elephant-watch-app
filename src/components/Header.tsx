import React from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LogOut, UserCircle, Settings, User } from "lucide-react";
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

export function Header() {
  const { user, signOut, canManageUsers, canViewReports, canEditReports } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-green-800">
                Elephant Watch
              </Link>
            </div>
            <nav className="ml-6 flex space-x-8">
              {user?.role !== 'data_collector' && (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                >
                  Dashboard
                </Link>
              )}
              <Link
                to="/report"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                Report Activity
              </Link>
            </nav>
          </div>

          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <User className="h-5 w-5" />
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
                    <DropdownMenuItem onClick={() => navigate('/admin/statistics')}>
                      Statistics
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
      </div>
    </header>
  );
} 