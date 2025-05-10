import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getDashboardStats, DashboardStats } from "@/lib/observations";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Fix for default marker icons in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Heatmap layer component
function HeatmapLayer({ data }: { data: Array<[number, number, number]> }) {
  const map = useMap();

  useEffect(() => {
    if (data.length > 0) {
      // @ts-ignore
      const heat = L.heatLayer(data, {
        radius: 25,
        blur: 15,
        maxZoom: 10,
      }).addTo(map);

      return () => {
        map.removeLayer(heat);
      };
    }
  }, [data, map]);

  return null;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-800">Dashboard</h1>
        <Button 
          onClick={() => navigate("/report-activity")}
          className="bg-green-600 hover:bg-green-700"
        >
          Report New Activity
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Total Observations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats?.totalObservations || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Direct Sightings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats?.directSightings || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Indirect Signs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats?.indirectSigns || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Loss Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats?.lossReports || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-green-800">Elephant Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Total Elephants</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{stats?.kpis.totalElephants || 0}</p>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Total Calves</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{stats?.kpis.totalCalves || 0}</p>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Male Elephants</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{stats?.kpis.maleElephants || 0}</p>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Female Elephants</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{stats?.kpis.femaleElephants || 0}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-green-800">Activity Heatmap</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden h-[400px]">
            {stats?.heatmapData.length ? (
              <MapContainer
                center={[23.5937, 80.9629]} // Center of Madhya Pradesh
                zoom={7}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <HeatmapLayer data={stats.heatmapData} />
              </MapContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No location data available
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-green-800">Division Statistics</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Division</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Direct</TableHead>
                  <TableHead>Indirect</TableHead>
                  <TableHead>Loss</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.kpis.divisionStats && Object.entries(stats.kpis.divisionStats).map(([division, stats]) => (
                  <TableRow key={division}>
                    <TableCell className="font-medium">{division}</TableCell>
                    <TableCell>{stats.total}</TableCell>
                    <TableCell>{stats.direct}</TableCell>
                    <TableCell>{stats.indirect}</TableCell>
                    <TableCell>{stats.loss}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-green-800">Recent Observations</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {stats?.recentObservations.length ? (
              <div className="divide-y">
                {stats.recentObservations.map((obs) => (
                  <div key={obs.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {obs.observation_type === "elephant" ? "Direct Sighting" :
                           obs.observation_type === "indirect" ? "Indirect Sign" :
                           "Loss Report"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(obs.created_at).toLocaleDateString()} at {obs.observation_time}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {obs.division}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No observations recorded yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 