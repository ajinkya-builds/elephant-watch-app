import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PawPrint } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export default function Index() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUserEmail(user.email);
          
          // Check if user is admin
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
            
          if (!error && profile && profile.role === 'admin') {
            setIsAdmin(true);
          }
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };
    
    checkAdminStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <PawPrint className="w-16 h-16 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-green-800">Wild Elephant Monitoring System</h1>
        <p className="text-xl text-muted-foreground">
          Track and monitor elephant activities in your area
        </p>
      </div>

      {/* Admin Button */}
      <div className="mb-8 text-center">
        <Button 
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg"
          onClick={() => navigate('/admin')}
        >
          Access Admin Panel
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className="hover:shadow-lg transition-shadow bg-white">
          <CardHeader>
            <CardTitle className="text-green-800">Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              View statistics and recent observations
            </p>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700" 
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow bg-white">
          <CardHeader>
            <CardTitle className="text-green-800">Report Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Report new elephant sightings or activities
            </p>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700" 
              onClick={() => navigate("/report-activity")}
            >
              Report Activity
            </Button>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}