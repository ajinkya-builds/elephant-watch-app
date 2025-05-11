import React from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function Header() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false);

  React.useEffect(() => {
    const getSession = async () => {
      const sessionStr = localStorage.getItem('session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (new Date(session.expires_at) > new Date()) {
          setUserEmail(session.user.email);
          
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
        <h1 className="text-xl font-bold text-green-800">Wild Elephant Monitoring System</h1>
        {userEmail && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{userEmail}</span>
            {isAdmin && (
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin')}
                className="border-amber-600 text-amber-600 hover:bg-amber-50"
              >
                Admin
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
} 