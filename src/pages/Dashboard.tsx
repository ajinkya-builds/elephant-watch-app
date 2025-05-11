import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { getDashboardStats, DashboardStats } from "@/lib/observations";
import { toast } from "sonner";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { supabase, checkSupabaseConnection } from "@/lib/supabaseClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

// Fix for default marker icons in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Heatmap layer component for the map
function HeatmapLayer({ data }: { data: Array<[number, number, number]> }) {
  const map = useMap();

  useEffect(() => {
    if (data && data.length > 0) {
      // Create heatmap layer using the leaflet.heat plugin
      // @ts-ignore - leaflet.heat types are not included
      const heat = (L as any).heatLayer(data, {
        radius: 25,
        blur: 15,
        maxZoom: 10,
      }).addTo(map);

      return () => {
        map.removeLayer(heat);
      };
    }
  }, [map, data]);

  return null;
}

// Map bounds adjuster component
function MapBoundsAdjuster({ data }: { data: Array<[number, number, number]> }) {
  const map = useMap();
  
  useEffect(() => {
    if (data && data.length > 0) {
      try {
        const points = data.map(point => [point[0], point[1]]);
        if (points.length > 0) {
          const bounds = L.latLngBounds(points as [number, number][]);
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
          } else {
            console.warn("Invalid bounds created from heatmap data");
            // Default to a center point if bounds are invalid
            map.setView([0, 0], 2);
          }
        }
      } catch (error) {
        console.error("Error setting map bounds:", error);
      }
    }
  }, [map, data]);
  
  return null;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const dashboardStats = await getDashboardStats();
      setStats(dashboardStats);
      setError(null);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(error as Error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let subscription: any = null;

    async function initializeDashboard() {
      try {
        // Check Supabase connection first
        const connected = await checkSupabaseConnection();
        setIsConnected(connected);

        if (!connected) {
          throw new Error("Unable to connect to the database");
        }

        // Fetch initial data
        await fetchDashboardData();

        // Set up real-time subscription
        subscription = supabase
          .channel('activity-reports-changes')
          .on('postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'activity_reports' }, 
            async (payload) => {
              if (!mounted) return;
              
              console.log("New activity report received:", payload);
              try {
                const dashboardStats = await getDashboardStats();
                setStats(dashboardStats);
                toast.success("Dashboard updated with new activity report");
              } catch (error) {
                console.error("Error refreshing dashboard data:", error);
                toast.error("Failed to update dashboard with new activity report");
              }
            }
          )
          .subscribe((status) => {
            console.log("Subscription status:", status);
          });

      } catch (error) {
        if (mounted) {
          console.error("Dashboard initialization error:", error);
          setError(error as Error);
          setLoading(false);
        }
      }
    }

    initializeDashboard();

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [fetchDashboardData]);

  // Common header component for all states
  const DashboardHeader = () => (
    <div className="bg-gradient-to-r from-green-800 to-green-600 text-white shadow-md">
      <div className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Elephant Watch Dashboard</h1>
          <Button
            className="bg-white text-green-800 hover:bg-gray-100 font-medium shadow-sm"
            onClick={() => navigate("/new-observation")}
          >
            Add New Observation
          </Button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header with gradient background */}
        <DashboardHeader />
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading dashboard data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header with gradient background */}
        <DashboardHeader />
        <div className="container mx-auto py-12 px-4">
          <div className="bg-white border border-red-200 rounded-lg shadow-sm p-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-red-100 p-4 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-700 mb-2">Dashboard Not Available</h2>
              <p className="text-gray-600 mb-6 max-w-md">
                We're unable to connect to the data service. Please contact your system administrator for assistance.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 w-full max-w-md text-left">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Technical Details:</h3>
                <p className="text-xs font-mono bg-gray-100 p-2 rounded overflow-auto max-h-24">
                  {error.message || "Unknown error occurred while connecting to the database."}  
                </p>
              </div>
              <div className="mt-8">
                <Button 
                  className="bg-green-700 text-white hover:bg-green-800"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with gradient background */}
      <DashboardHeader />

      <div className="container mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white border border-gray-100 shadow-sm hover:shadow transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-800 text-lg font-medium">Total Observations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-700">{stats?.totalObservations || 0}</p>
              <p className="text-sm text-gray-500 mt-1">Total records in the system</p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-100 shadow-sm hover:shadow transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-800 text-lg font-medium">Loss Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-700">{stats?.lossReports || 0}</p>
              <p className="text-sm text-gray-500 mt-1">Incidents reported</p>
            </CardContent>
          </Card>
        </div>

        {/* Elephant Statistics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-green-800 border-b border-gray-200 pb-2">Elephant Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white border border-gray-100 shadow-sm hover:shadow transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-green-800 text-lg font-medium">Total Elephants</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-700">{stats?.kpis.totalElephants || 0}</p>
                <p className="text-sm text-gray-500 mt-1">Observed in all regions</p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-100 shadow-sm hover:shadow transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-green-800 text-lg font-medium">Male Elephants</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-700">{stats?.kpis.maleElephants || 0}</p>
                <p className="text-sm text-gray-500 mt-1">{stats?.kpis.maleElephants && stats.kpis.totalElephants ? `${Math.round((stats.kpis.maleElephants / stats.kpis.totalElephants) * 100)}% of total` : '0% of total'}</p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-100 shadow-sm hover:shadow transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-green-800 text-lg font-medium">Female Elephants</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-700">{stats?.kpis.femaleElephants || 0}</p>
                <p className="text-sm text-gray-500 mt-1">{stats?.kpis.femaleElephants && stats.kpis.totalElephants ? `${Math.round((stats.kpis.femaleElephants / stats.kpis.totalElephants) * 100)}% of total` : '0% of total'}</p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-100 shadow-sm hover:shadow transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-green-800 text-lg font-medium">Calves</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-700">{stats?.kpis.totalCalves || 0}</p>
                <p className="text-sm text-gray-500 mt-1">{stats?.kpis.totalCalves && stats.kpis.totalElephants ? `${Math.round((stats.kpis.totalCalves / stats.kpis.totalElephants) * 100)}% of total` : '0% of total'}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Charts and Maps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-green-800">Division Statistics</h2>
            </div>
            <div className="p-4 h-[400px] flex items-center justify-center">
              {stats?.kpis.divisionStats && Object.keys(stats.kpis.divisionStats).length > 0 ? (
                <div className="w-full h-full flex flex-col items-center">
                  <Pie 
                    data={{
                      labels: Object.keys(stats.kpis.divisionStats),
                      datasets: [
                        {
                          label: 'Number of Elephants',
                          data: Object.values(stats.kpis.divisionStats).map(div => div.elephants),
                          backgroundColor: [
                            'rgba(44, 123, 229, 0.7)',   // Blue
                            'rgba(255, 136, 0, 0.7)',    // Orange
                            'rgba(152, 77, 255, 0.7)',   // Purple
                            'rgba(16, 152, 84, 0.7)',    // Green
                            'rgba(255, 65, 105, 0.7)',   // Pink/Red
                            'rgba(255, 205, 86, 0.7)',   // Yellow
                            'rgba(75, 192, 192, 0.7)',   // Teal
                            'rgba(201, 203, 207, 0.7)',  // Gray
                          ],
                          borderColor: [
                            'rgba(44, 123, 229, 1)',      // Blue
                            'rgba(255, 136, 0, 1)',      // Orange
                            'rgba(152, 77, 255, 1)',     // Purple
                            'rgba(16, 152, 84, 1)',      // Green
                            'rgba(255, 65, 105, 1)',     // Pink/Red
                            'rgba(255, 205, 86, 1)',     // Yellow
                            'rgba(75, 192, 192, 1)',     // Teal
                            'rgba(201, 203, 207, 1)',    // Gray
                          ],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        title: {
                          display: false,
                        },
                        legend: {
                          position: 'right',
                          labels: {
                            font: {
                              size: 12
                            },
                            usePointStyle: true,
                            pointStyle: 'circle'
                          }
                        },
                        tooltip: {
                          backgroundColor: 'rgba(16, 152, 84, 0.8)',
                          titleFont: {
                            weight: 'bold',
                            size: 14
                          },
                          bodyFont: {
                            size: 13
                          },
                          padding: 12,
                          cornerRadius: 6,
                          callbacks: {
                            title: function(tooltipItems) {
                              return tooltipItems[0].label;
                            },
                            label: function(context) {
                              const value = context.raw || 0;
                              return `No of elephants: ${value}`;
                            }
                          }
                        }
                      }
                    }}
                  />
                  <div className="mt-4 text-center text-sm text-gray-600">
                    Elephant population distribution by division
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  No division statistics available
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-green-800">Activity Heatmap</h2>
            </div>
            <div className="h-[400px]">
              {stats?.heatmapData && stats.heatmapData.length > 0 ? (
                <MapContainer 
                  center={[0, 0]} 
                  zoom={2} 
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {stats.heatmapData && stats.heatmapData.length > 0 && (
                    <>
                      <HeatmapLayer data={stats.heatmapData} />
                      <MapBoundsAdjuster data={stats.heatmapData} />
                    </>
                  )}
                </MapContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No location data available for heatmap
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Observations */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-green-800">Recent Observations</h2>
          </div>
          <div>
            {stats?.recentObservations && stats.recentObservations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium text-gray-700">Date</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-700">Time</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-700">Division</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-700">Type</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-700">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats.recentObservations.map((obs, index) => {
                      // Format the date and time
                      const date = obs.observation_date || 
                                  (obs.created_at ? new Date(obs.created_at).toISOString().split('T')[0] : '');
                      const time = obs.observation_time || '';
                      
                      return (
                        <tr key={obs.id || `obs-${index}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4">{date}</td>
                          <td className="px-6 py-4">{time}</td>
                          <td className="px-6 py-4">{obs.division || ''}</td>
                          <td className="px-6 py-4">
                            <span className={
                              `px-2 py-1 rounded-full text-xs font-medium ${
                                obs.observation_type === 'elephant' ? 'bg-green-100 text-green-800' : 
                                obs.observation_type === 'indirect' ? 'bg-blue-100 text-blue-800' : 
                                'bg-red-100 text-red-800'
                              }`
                            }>
                              {obs.observation_type || ''}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {obs.observation_type === 'elephant' && obs.total_elephants ? 
                              `${obs.total_elephants} elephants observed` : ''}
                            {obs.observation_type === 'indirect' && obs.indirect_sign ? 
                              obs.indirect_sign : ''}
                            {obs.observation_type === 'loss' && obs.loss_type ? 
                              obs.loss_type : ''}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No observations recorded yet
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-green-800 text-white mt-8 py-4">
        <div className="container mx-auto px-6 text-center text-sm">
          <p>© {new Date().getFullYear()} Elephant Watch App - Monitoring and Conservation</p>
        </div>
      </div>
    </div>
  );
}
