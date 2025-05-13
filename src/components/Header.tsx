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

export function Header() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false);
  const [userAvatar, setUserAvatar] = React.useState<string | null>(null);

  React.useEffect(() => {
    const getSession = async () => {
      const sessionStr = localStorage.getItem('session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (new Date(session.expires_at) > new Date()) {
          setUserEmail(session.user.email);
          setUserAvatar(session.user.user_metadata?.avatar_url || null);
          // Check if user is admin
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();
            if (!error && profile && profile.role === 'admin') {
              setIsAdmin(true);
            }
          } catch (error) {
            console.error('Error checking admin status:', error);
          }
        } else {
          // Session expired
          handleLogout();
        }
      }
    };
    getSession();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      // Remove session from localStorage
      localStorage.removeItem('session');
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out from Supabase:", error);
      }
      // Clear user email
      setUserEmail(null);
      // Show success message
      toast.success("Logged out successfully");
      // Force reload the page to clear any cached state
      window.location.href = "/";
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Error during logout");
    }
  };

  return (
    <header className="w-full border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <span
            className="text-xl font-bold text-green-800 cursor-pointer hover:underline"
            onClick={() => navigate('/home')}
            title="Go to Home"
          >
            Wild Elephant Monitoring System
          </span>
        </div>
        {userEmail && (
          <div className="flex items-center gap-4 bg-white rounded-xl shadow px-4 py-2 border">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt="User Avatar"
                className="w-10 h-10 rounded-full object-cover border"
              />
            ) : (
              <UserCircle className="w-10 h-10 text-gray-400" />
            )}
            <div className="flex flex-col items-start">
              <span className="font-medium text-gray-800 text-xs">{userEmail}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-blue-600 text-[10px] hover:text-blue-800"
                  >
                    Manage your Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 