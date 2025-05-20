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
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title } from 'chart.js';
import { supabase, checkSupabaseConnection } from "@/lib/supabaseClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import * as Portal from '@radix-ui/react-portal';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title);

// Add style for map container
const mapStyles = `
  .map-container canvas {
    will-read-frequently: true;
  }
`;

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

// Add new interface for heatmap filters
interface HeatmapFilters {
  division: string;
  range: string;
  beat: string;
  intensityThreshold: number;
  startDate: Date | null;
  endDate: Date | null;
}

// Add new interfaces for KPI data
interface DashboardKPISummary {
  total_activities: number;
  total_users: number;
  total_days: number;
  total_elephants_sighted: number;
  today_activities: number;
  today_active_users: number;
  weekly_activities: number;
  weekly_active_users: number;
}

interface DailyActivitySummary {
  activity_date: string;
  total_activities: number;
  unique_users: number;
  total_elephants_sighted: number;
  female_elephants_sighted: number;
  male_elephants_sighted: number;
  calves_sighted: number;
  unknown_elephants_sighted: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Add filter states
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [divisions, setDivisions] = useState<string[]>([]);
  const [ranges, setRanges] = useState<string[]>([]);
  const [beats, setBeats] = useState<string[]>([]);

  // --- Activity Heatmap Filters ---
  const [heatmapFilters, setHeatmapFilters] = useState<HeatmapFilters>({
    division: 'all',
    range: 'all',
    beat: 'all',
    intensityThreshold: 0,
    startDate: null as Date | null,
    endDate: null as Date | null
  });
  const [pendingHeatmapFilters, setPendingHeatmapFilters] = useState<HeatmapFilters>({
    division: 'all',
    range: 'all',
    beat: 'all',
    intensityThreshold: 0,
    startDate: null as Date | null,
    endDate: null as Date | null
  });
  const [heatmapData, setHeatmapData] = useState<Array<[number, number, number]>>([]);
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [heatmapError, setHeatmapError] = useState<Error | null>(null);

  const applyHeatmapFilters = () => {
    setHeatmapFilters({ ...pendingHeatmapFilters });
  };

  const fetchHeatmapData = useCallback(async () => {
    setHeatmapLoading(true);
    setHeatmapError(null);
    try {
      const filters = {
        division: heatmapFilters.division === 'all' ? undefined : heatmapFilters.division,
        range: heatmapFilters.range === 'all' ? undefined : encodeURIComponent(heatmapFilters.range),
        beat: heatmapFilters.beat === 'all' ? undefined : encodeURIComponent(heatmapFilters.beat),
        startDate: heatmapFilters.startDate ? format(heatmapFilters.startDate, 'yyyy-MM-dd') : undefined,
        endDate: heatmapFilters.endDate ? format(heatmapFilters.endDate, 'yyyy-MM-dd') : undefined,
      };
      let query = supabase.from('v_activity_heatmap').select('*');
      if (filters.division) query = query.eq('division_name', filters.division);
      if (filters.range) query = query.eq('range_name', decodeURIComponent(filters.range));
      if (filters.beat) query = query.eq('beat_name', decodeURIComponent(filters.beat));
      if (filters.startDate) query = query.gte('activity_date', filters.startDate);
      if (filters.endDate) query = query.lte('activity_date', filters.endDate);
      const { data, error } = await query;
      if (error) throw error;
      setHeatmapData(data ? data.map(point => [point.lat, point.lng, point.intensity]) : []);
    } catch (error) {
      setHeatmapError(error as Error);
      setHeatmapData([]);
    } finally {
      setHeatmapLoading(false);
    }
  }, [heatmapFilters]);

  useEffect(() => {
    fetchHeatmapData();
  }, [fetchHeatmapData]);

  // --- Recent Observations Filters ---
  const [observationsFilters, setObservationsFilters] = useState({
    division: 'all',
    range: 'all',
    beat: 'all',
    startDate: null as Date | null,
    endDate: null as Date | null
  });
  const [pendingObservationsFilters, setPendingObservationsFilters] = useState({
    division: 'all',
    range: 'all',
    beat: 'all',
    startDate: null as Date | null,
    endDate: null as Date | null
  });
  const [recentObservations, setRecentObservations] = useState([]);
  const [recentObsLoading, setRecentObsLoading] = useState(false);
  const [recentObsError, setRecentObsError] = useState<Error | null>(null);

  const applyObservationFilters = () => {
    setObservationsFilters({ ...pendingObservationsFilters });
  };

  const fetchRecentObservations = useCallback(async () => {
    setRecentObsLoading(true);
    setRecentObsError(null);
    try {
      const filters = {
        division: observationsFilters.division === 'all' ? undefined : observationsFilters.division,
        range: observationsFilters.range === 'all' ? undefined : encodeURIComponent(observationsFilters.range),
        beat: observationsFilters.beat === 'all' ? undefined : encodeURIComponent(observationsFilters.beat),
        startDate: observationsFilters.startDate ? format(observationsFilters.startDate, 'yyyy-MM-dd') : undefined,
        endDate: observationsFilters.endDate ? format(observationsFilters.endDate, 'yyyy-MM-dd') : undefined,
      };
      let query = supabase.from('v_recent_observations').select('*');
      if (filters.division) query = query.eq('division_name', filters.division);
      if (filters.range) query = query.eq('range_name', decodeURIComponent(filters.range));
      if (filters.beat) query = query.eq('beat_name', decodeURIComponent(filters.beat));
      if (filters.startDate) query = query.gte('activity_date', filters.startDate);
      if (filters.endDate) query = query.lte('activity_date', filters.endDate);
      const { data, error } = await query;
      if (error) throw error;
      setRecentObservations(data || []);
    } catch (error) {
      setRecentObsError(error as Error);
      setRecentObservations([]);
    } finally {
      setRecentObsLoading(false);
    }
  }, [observationsFilters]);

  useEffect(() => {
    fetchRecentObservations();
  }, [fetchRecentObservations]);

  // Modified fetchDashboardData to include better error handling
  const fetchDashboardData = useCallback(async () => {
    try {
      const filters = {
        division: selectedDivision === 'all' ? undefined : selectedDivision,
        range: heatmapFilters.range === 'all' ? undefined : encodeURIComponent(heatmapFilters.range),
        beat: heatmapFilters.beat === 'all' ? undefined : encodeURIComponent(heatmapFilters.beat),
        startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
        endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
      };

      // Fetch all required data in parallel
      const [
        totalData,
        divisionData,
        observationTypes,
        indirectSigns,
        lossTypes,
        todayReports,
        activeElephants,
        userTrends,
        reportTrends,
        recentObs,
        heatmapData
      ] = await Promise.all([
        supabase.from('v_total_observations').select('*').single(),
        supabase.from('v_division_stats').select('*'),
        supabase.from('v_observation_type_counts').select('*'),
        supabase.from('v_indirect_sighting_counts').select('*'),
        supabase.from('v_loss_type_counts').select('*'),
        supabase.from('v_today_reports').select('*').single(),
        supabase.from('v_active_elephants').select('*').single(),
        supabase.from('v_user_activity_trends').select('*').single(),
        supabase.from('v_report_trends').select('*').single(),
        supabase.from('v_recent_observations').select('*').limit(10),
        supabase.from('v_activity_heatmap').select('*')
      ]);

      // Transform the data into the expected format
      const dashboardStats: DashboardStats = {
        totalObservations: totalData.data?.total_count || 0,
        directSightings: observationTypes.data?.find(t => t.observation_type === 'direct')?.count || 0,
        indirectSigns: indirectSigns.data?.reduce((sum, t) => sum + t.count, 0) || 0,
        lossReports: totalData.data?.total_loss_reports || 0,
        recentObservations: recentObs.data || [],
        heatmapData: heatmapData.data?.map(point => [point.lat, point.lng, point.intensity]) || [],
        kpis: {
          totalElephants: totalData.data?.total_elephants || 0,
          femaleElephants: totalData.data?.total_female_elephants || 0,
          maleElephants: totalData.data?.total_male_elephants || 0,
          totalCalves: totalData.data?.total_calves || 0,
          unknownElephants: totalData.data?.total_unknown_elephants || 0,
          lossTypes: lossTypes.data?.reduce((acc, curr) => ({
            ...acc,
            [curr.loss_type]: curr.count
          }), {}) || {},
          indirectSigns: indirectSigns.data?.reduce((acc, curr) => ({
            ...acc,
            [curr.indirect_sighting_type]: curr.count
          }), {}) || {},
          totalObservations: totalData.data?.total_count || 0,
          observationsChange: reportTrends.data ? 
            ((reportTrends.data.current_week_reports - reportTrends.data.previous_week_reports) / 
             reportTrends.data.previous_week_reports * 100) : 0,
          activeElephants: activeElephants.data?.count || 0,
          activeUsers: userTrends.data?.current_week_users || 0,
          usersChange: userTrends.data ? 
            ((userTrends.data.current_week_users - userTrends.data.previous_week_users) / 
             userTrends.data.previous_week_users * 100) : 0,
          reportsToday: todayReports.data?.count || 0,
          reportsChange: reportTrends.data ? 
            ((reportTrends.data.current_week_reports - reportTrends.data.previous_week_reports) / 
             reportTrends.data.previous_week_reports * 100) : 0,
          divisionStats: divisionData.data?.reduce((acc, curr) => ({
            ...acc,
            [curr.division_name]: {
              total: curr.total_observations,
              direct: observationTypes.data?.find(t => t.observation_type === 'direct')?.count || 0,
              indirect: indirectSigns.data?.reduce((sum, t) => sum + t.count, 0) || 0,
              loss: lossTypes.data?.reduce((sum, t) => sum + t.count, 0) || 0,
              elephants: curr.elephants
            }
          }), {}) || {}
        }
      };

      setStats(dashboardStats);
      setError(null);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(error as Error);
      toast.error("Failed to load dashboard data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [selectedDivision, heatmapFilters.range, heatmapFilters.beat, startDate, endDate]);

  useEffect(() => {
    let mounted = true;

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

        // Set up real-time subscription only if we're in a browser environment
        if (typeof window !== 'undefined') {
          try {
            const subscription = supabase
              .channel('activity-reports-changes')
              .on('postgres_changes', 
                { event: 'INSERT', schema: 'public', table: 'activity_reports' }, 
                async (payload) => {
                  if (!mounted) return;
                  
                  console.log("New activity report received:", payload);
                  try {
                    const dashboardStats = await getDashboardStats({
                      division: selectedDivision === 'all' ? undefined : selectedDivision,
                      range: heatmapFilters.range === 'all' ? undefined : heatmapFilters.range,
                      beat: heatmapFilters.beat === 'all' ? undefined : heatmapFilters.beat,
                      startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
                      endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
                    });
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

            return () => {
              if (subscription) {
                subscription.unsubscribe();
              }
            };
          } catch (wsError) {
            console.warn("WebSocket subscription failed:", wsError);
            // Continue without real-time updates
          }
        }
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
    };
  }, [fetchDashboardData, selectedDivision, heatmapFilters.range, heatmapFilters.beat, startDate, endDate]);

  // Add new state for KPI data
  const [kpiSummary, setKpiSummary] = useState<DashboardKPISummary | null>(null);
  const [dailySummary, setDailySummary] = useState<DailyActivitySummary[]>([]);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [kpiError, setKpiError] = useState<Error | null>(null);

  // Add new function to fetch KPI data
  const fetchKPIData = useCallback(async () => {
    setKpiLoading(true);
    setKpiError(null);
    try {
      // Fetch KPI summary
      const { data: kpiData, error: kpiError } = await supabase
        .from('v_dashboard_kpi_summary')
        .select('*')
        .single();
      
      if (kpiError) throw kpiError;
      setKpiSummary(kpiData);

      // Fetch daily summary
      const { data: dailyData, error: dailyError } = await supabase
        .from('v_daily_activity_summary')
        .select('*')
        .order('activity_date', { ascending: false })
        .limit(7);
      
      if (dailyError) throw dailyError;
      setDailySummary(dailyData);
    } catch (error) {
      setKpiError(error as Error);
    } finally {
      setKpiLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKPIData();
  }, [fetchKPIData]);

  // Add KPI cards component
  const KPICards = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpiSummary?.total_activities || 0}</div>
          <p className="text-xs text-muted-foreground">
            {kpiSummary?.today_activities || 0} today
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpiSummary?.total_users || 0}</div>
          <p className="text-xs text-muted-foreground">
            {kpiSummary?.today_active_users || 0} today
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Elephants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpiSummary?.total_elephants_sighted || 0}</div>
          <p className="text-xs text-muted-foreground">
            Across {kpiSummary?.total_days || 0} days
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Weekly Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpiSummary?.weekly_activities || 0}</div>
          <p className="text-xs text-muted-foreground">
            {kpiSummary?.weekly_active_users || 0} active users
          </p>
        </CardContent>
      </Card>
    </div>
  );

  // Add daily summary chart component
  const DailySummaryChart = () => {
    const chartData = {
      labels: dailySummary.map(d => format(new Date(d.activity_date), 'MMM dd')),
      datasets: [
        {
          label: 'Activities',
          data: dailySummary.map(d => d.total_activities),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
        {
          label: 'Elephants Sighted',
          data: dailySummary.map(d => d.total_elephants_sighted),
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
        }
      ]
    };

    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Daily Activity Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Bar data={chartData} />
        </CardContent>
      </Card>
    );
  };

  // Common header component for all states
  const DashboardHeader = () => (
    <div className="bg-gradient-to-r from-green-800 to-green-600 text-white shadow-md">
      <div className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Elephant Watch Dashboard</h1>
          <Button
            className="bg-white text-green-800 hover:bg-gray-100 font-medium shadow-sm"
            onClick={() => navigate("/report")}
          >
            Report New Activity
          </Button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <style>{mapStyles}</style>
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
        <style>{mapStyles}</style>
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
      <style>{mapStyles}</style>
      <DashboardHeader />

      <div className="container mx-auto px-6 py-8">
        {/* Top Half: Summary Statistics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-green-800 border-b border-gray-200 pb-2">Summary Statistics</h2>
          
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

          {/* Division Statistics */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-green-800 border-b border-gray-200 pb-2">Division Statistics</h2>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 h-[400px] flex items-center justify-center">
                {stats?.kpis.divisionStats && Object.keys(stats.kpis.divisionStats).length > 0 ? (
                  <div className="w-full h-full flex flex-col items-center">
                    <Bar 
                      data={{
                        labels: Object.keys(stats.kpis.divisionStats),
                        datasets: [
                          {
                            label: 'Number of Elephants',
                            data: Object.values(stats.kpis.divisionStats).map(div => div.elephants),
                            backgroundColor: 'rgba(16, 152, 84, 0.7)',   // Green
                            borderColor: 'rgba(16, 152, 84, 1)',        // Green border
                            borderWidth: 1,
                          }
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
                            display: false,
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
                                return `Number of elephants: ${value}`;
                              }
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Number of Elephants',
                              font: {
                                size: 12,
                                weight: 'bold'
                              }
                            },
                            ticks: {
                              precision: 0
                            }
                          },
                          x: {
                            title: {
                              display: true,
                              text: 'Division',
                              font: {
                                size: 12,
                                weight: 'bold'
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
          </div>
        </div>

        {/* Bottom Half: Activity Details */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-green-800 border-b border-gray-200 pb-2">Activity Details</h2>
          
          {/* Activity Heatmap */}
          <div className="mb-8 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-green-800">Activity Heatmap</h2>
            </div>
            <div className="p-4">
              {/* Heatmap Filters */}
              <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                  <Select 
                    value={pendingHeatmapFilters.division} 
                    onValueChange={(value) => setPendingHeatmapFilters(prev => ({ ...prev, division: value }))}
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Select Division" />
                    </SelectTrigger>
                    <Portal.Root>
                      <SelectContent className="bg-white z-[9999]">
                        {divisions.map((division) => (
                          <SelectItem key={division} value={division}>
                            {division === 'all' ? 'All Divisions' : division}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Portal.Root>
                  </Select>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Range</label>
                  <Select 
                    value={pendingHeatmapFilters.range} 
                    onValueChange={(value) => setPendingHeatmapFilters(prev => ({ ...prev, range: value }))}
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Select Range" />
                    </SelectTrigger>
                    <Portal.Root>
                      <SelectContent className="bg-white z-[9999]">
                        {ranges.map((range) => (
                          <SelectItem key={range} value={range}>
                            {range === 'all' ? 'All Ranges' : range}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Portal.Root>
                  </Select>
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Beat</label>
                  <Select 
                    value={pendingHeatmapFilters.beat} 
                    onValueChange={(value) => setPendingHeatmapFilters(prev => ({ ...prev, beat: value }))}
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Select Beat" />
                    </SelectTrigger>
                    <Portal.Root>
                      <SelectContent className="bg-white z-[9999]">
                        {beats.map((beat) => (
                          <SelectItem key={beat} value={beat}>
                            {beat === 'all' ? 'All Beats' : beat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Portal.Root>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Intensity</label>
                  <Select 
                    value={pendingHeatmapFilters.intensityThreshold.toString()} 
                    onValueChange={(value) => 
                      setPendingHeatmapFilters(prev => ({ ...prev, intensityThreshold: parseInt(value) }))
                    }
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Select Minimum Intensity" />
                    </SelectTrigger>
                    <Portal.Root>
                      <SelectContent className="bg-white z-[9999]">
                        <SelectItem value="0">All Intensities</SelectItem>
                        <SelectItem value="1">Low (1+)</SelectItem>
                        <SelectItem value="3">Medium (3+)</SelectItem>
                        <SelectItem value="5">High (5+)</SelectItem>
                        <SelectItem value="8">Very High (8+)</SelectItem>
                      </SelectContent>
                    </Portal.Root>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <div className="flex gap-2">
                    <DatePicker
                      date={pendingHeatmapFilters.startDate}
                      setDate={(date) => setPendingHeatmapFilters(prev => ({ ...prev, startDate: date }))}
                      placeholder="Start"
                    />
                    <DatePicker
                      date={pendingHeatmapFilters.endDate}
                      setDate={(date) => setPendingHeatmapFilters(prev => ({ ...prev, endDate: date }))}
                      placeholder="End"
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <Button className="w-full bg-green-700 text-white" onClick={applyHeatmapFilters}>
                    Apply Filter
                  </Button>
                </div>
              </div>

              <div className="h-[400px]">
                {heatmapData && heatmapData.length > 0 ? (
                  <MapContainer 
                    center={[0, 0]} 
                    zoom={2} 
                    style={{ height: "100%", width: "100%" }}
                    className="map-container"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {heatmapData.map((point, index) => (
                      <HeatmapLayer key={index} data={[point]} />
                    ))}
                    <MapBoundsAdjuster data={heatmapData} />
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
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-green-800">Recent Observations</h2>
            </div>
            <div className="p-4">
              {/* Observations Filters */}
              <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                  <Select 
                    value={pendingObservationsFilters.division} 
                    onValueChange={(value) => setPendingObservationsFilters(prev => ({ ...prev, division: value }))}
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Select Division" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-[9999]">
                      {divisions.map((division) => (
                        <SelectItem key={division} value={division}>
                          {division === 'all' ? 'All Divisions' : division}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Range</label>
                  <Select 
                    value={pendingObservationsFilters.range} 
                    onValueChange={(value) => setPendingObservationsFilters(prev => ({ ...prev, range: value }))}
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Select Range" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-[9999]">
                      {ranges.map((range) => (
                        <SelectItem key={range} value={range}>
                          {range === 'all' ? 'All Ranges' : range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Beat</label>
                  <Select 
                    value={pendingObservationsFilters.beat} 
                    onValueChange={(value) => setPendingObservationsFilters(prev => ({ ...prev, beat: value }))}
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Select Beat" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-[9999]">
                      {beats.map((beat) => (
                        <SelectItem key={beat} value={beat}>
                          {beat === 'all' ? 'All Beats' : beat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <DatePicker
                    date={pendingObservationsFilters.startDate}
                    setDate={(date) => setPendingObservationsFilters(prev => ({ ...prev, startDate: date }))}
                    placeholder="Select start date"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <DatePicker
                    date={pendingObservationsFilters.endDate}
                    setDate={(date) => setPendingObservationsFilters(prev => ({ ...prev, endDate: date }))}
                    placeholder="Select end date"
                  />
                </div>
                <div className="flex items-end">
                  <Button className="w-full bg-green-700 text-white" onClick={applyObservationFilters}>
                    Apply Filter
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                {recentObservations && recentObservations.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left font-medium text-gray-700">Date</th>
                        <th className="px-6 py-3 text-left font-medium text-gray-700">Time</th>
                        <th className="px-6 py-3 text-left font-medium text-gray-700">Division</th>
                        <th className="px-6 py-3 text-left font-medium text-gray-700">Range</th>
                        <th className="px-6 py-3 text-left font-medium text-gray-700">Beat</th>
                        <th className="px-6 py-3 text-left font-medium text-gray-700">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentObservations.map((obs, index) => {
                        // Format the date and time
                        const date = obs.activity_date || 
                                    (obs.created_at ? new Date(obs.created_at).toISOString().split('T')[0] : '');
                        const time = obs.activity_time || '';
                        
                        return (
                          <tr key={obs.id || `obs-${index}`} className="hover:bg-gray-50">
                            <td className="px-6 py-4">{date}</td>
                            <td className="px-6 py-4">{time}</td>
                            <td className="px-6 py-4">{obs.division_name || ''}</td>
                            <td className="px-6 py-4">{obs.range_name || ''}</td>
                            <td className="px-6 py-4">{obs.beat_name || ''}</td>
                            <td className="px-6 py-4">
                              {obs.total_elephants > 0 ? 
                                `${obs.total_elephants} elephants observed` : ''}
                              {obs.damage_description ? 
                                obs.damage_description : ''}
                              {obs.identification_marks ? 
                                obs.identification_marks : ''}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No observations available
                  </div>
                )}
              </div>
            </div>
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
