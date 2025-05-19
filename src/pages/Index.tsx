import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PawPrint } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();

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

        {/* Admin Button - Only show for admin users */}
        {user && user.role !== 'data_collector' && (
          <div className="mb-8 text-center">
            <Button 
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg"
              onClick={() => navigate('/admin')}
            >
              Access Admin Panel
            </Button>
          </div>
        )}

        {/* Main Content */}
        {user?.role === 'data_collector' ? (
          // Data Collector View - Single centered card
          <div className="max-w-md mx-auto">
            <Card className="hover:shadow-lg transition-shadow bg-white">
              <CardHeader>
                <CardTitle className="text-green-800">Report Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Report new elephant sightings or activities
                </p>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white" 
                  onClick={() => navigate("/report")}
                >
                  Report Activity
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Admin/Manager View - Grid layout with both cards
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
                  className="w-full bg-green-600 hover:bg-green-700 text-white" 
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
                  className="w-full bg-green-600 hover:bg-green-700 text-white" 
                  onClick={() => navigate("/report")}
                >
                  Report Activity
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}