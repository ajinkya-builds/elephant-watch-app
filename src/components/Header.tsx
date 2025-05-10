import React from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function Header() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        // Fetch user details from custom users table
        const { data: user } = await supabase
          .from("users")
          .select("email")
          .eq("email", session.user.email)
          .single();
        
        if (user) {
          setUserEmail(user.email);
        }
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error logging out");
    } else {
      toast.success("Logged out successfully");
      navigate("/");
    }
  };

  return (
    <header className="w-full border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Wild Elephant Monitoring System</h1>
        {userEmail && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{userEmail}</span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
} 