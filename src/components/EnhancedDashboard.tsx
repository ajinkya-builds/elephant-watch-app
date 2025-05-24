import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BeatMap } from './BeatMap';
import { 
  RefreshCw, 
  AlertCircle, 
  MapPin, 
  Activity, 
  Calendar, 
  Eye, 
  Footprints, 
  AlertTriangle,
  ChevronRight,
  Loader2,
  Info
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { 
  fetchDashboardKPIs, 
  fetchMonthlyTrends, 
  fetchDivisionStats,
  fetchRecentObservations
} from '@/lib/dashboardService';
import type { 
  DashboardKPIs, 
  MonthlyTrend, 
  DivisionStat,
  RecentObservation 
} from '@/lib/dashboardService';
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "react-hot-toast";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface FilterOption {
  id: string;
  name: string;
  new_id?: string;
}

export const EnhancedDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [divisionStats, setDivisionStats] = useState<DivisionStat[]>([]);
  const [recentObservations, setRecentObservations] = useState<RecentObservation[]>([]);
  const [divisions, setDivisions] = useState<FilterOption[]>([]);
  const [ranges, setRanges] = useState<FilterOption[]>([]);
  const [beats, setBeats] = useState<FilterOption[]>([]);
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedRange, setSelectedRange] = useState('');
  const [selectedBeat, setSelectedBeat] = useState('');
  const [mapLoading, setMapLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filteredStats, setFilteredStats] = useState<DashboardKPIs | null>(null);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const [kpiData, trendsData, statsData, observationsData] = await Promise.all([
        fetchDashboardKPIs(),
        fetchMonthlyTrends(),
        fetchDivisionStats(),
        fetchRecentObservations()
      ]);
      setKpis(kpiData);
      setMonthlyTrends(trendsData);
      setDivisionStats(statsData);
      setRecentObservations(observationsData);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchFilteredStats = async () => {
    try {
      setMapLoading(true);
      let query = supabase
        .from('activity_observation')
        .select('*');

      if (selectedBeat) {
        query = query.eq('associated_beat_id', selectedBeat);
      } else if (selectedRange) {
        query = query.eq('associated_range_id', selectedRange);
      } else if (selectedDivision) {
        query = query.eq('associated_division_id', selectedDivision);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching filtered stats:', error);
        return;
      }

      if (!data) {
        console.log('No data returned from query');
        return;
      }

      console.log('Filtered data:', data); // Debug log

      const stats: DashboardKPIs = {
        total_observations: data.length,
        direct_sightings: data.filter(obs => obs.observation_type === 'Direct Sighting').length,
        indirect_sightings: data.filter(obs => obs.observation_type === 'Indirect Signs').length,
        total_loss: data.filter(obs => obs.observation_type === 'Loss Report').length,
        today_observations: data.filter(obs => new Date(obs.activity_date).toDateString() === new Date().toDateString()).length,
        today_direct_sightings: data.filter(obs => 
          obs.observation_type === 'Direct Sighting' && 
          new Date(obs.activity_date).toDateString() === new Date().toDateString()
        ).length,
        today_indirect_sightings: data.filter(obs => 
          obs.observation_type === 'Indirect Signs' && 
          new Date(obs.activity_date).toDateString() === new Date().toDateString()
        ).length,
        today_loss: data.filter(obs => 
          obs.observation_type === 'Loss Report' && 
          new Date(obs.activity_date).toDateString() === new Date().toDateString()
        ).length
      };

      console.log('Calculated stats:', stats); // Debug log
      setFilteredStats(stats);
    } catch (err) {
      console.error('Error in fetchFilteredStats:', err);
    } finally {
      setMapLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch divisions
  useEffect(() => {
    async function fetchDivisions() {
      try {
        const { data, error } = await supabase
          .from('divisions')
          .select('id, name')
          .order('name');
        
        if (error) throw error;
        setDivisions(data || []);
      } catch (err) {
        console.error('Error fetching divisions:', err);
      }
    }
    fetchDivisions();
    if (selectedDivision) {
      fetchFilteredStats();
    }
  }, [selectedDivision]);

  // Fetch ranges when division is selected
  useEffect(() => {
    async function fetchRanges() {
      if (!selectedDivision) {
        setRanges([]);
        return;
      }
      try {
        setMapLoading(true);
        console.log('Fetching ranges for division:', selectedDivision);
        const { data: ranges, error: rangesError } = await supabase
          .from('ranges')
          .select('new_id, name')
          .eq('new_division_id', selectedDivision)
          .order('name', { ascending: true });
      
        if (rangesError) {
          console.error('Error fetching ranges:', rangesError);
          throw rangesError;
        }
        console.log('Fetched ranges:', ranges);
        setRanges(ranges || []);
      } catch (err) {
        console.error('Error fetching ranges:', err);
      } finally {
        setMapLoading(false);
      }
    }
    fetchRanges();
    if (selectedRange) {
      fetchFilteredStats();
    }
  }, [selectedDivision]);

  // Fetch beats when range is selected
  useEffect(() => {
    async function fetchBeats() {
      if (!selectedRange) {
        setBeats([]);
        return;
      }
      try {
        setMapLoading(true);
        console.log('Fetching beats for range:', selectedRange);
        const { data, error } = await supabase
          .from('beats')
          .select('new_id, name')
          .eq('new_range_id', selectedRange)
          .order('name');
      
        if (error) {
          console.error('Error fetching beats:', error);
          throw error;
        }
        console.log('Fetched beats:', data);
        setBeats(data || []);
      } catch (err) {
        console.error('Error fetching beats:', err);
      } finally {
        setMapLoading(false);
      }
    }
    fetchBeats();
    if (selectedBeat) {
      fetchFilteredStats();
    }
  }, [selectedRange]);

  const handleDivisionChange = (value: string) => {
    setSelectedDivision(value);
    setSelectedRange('');
    setSelectedBeat('');
  };

  const handleRangeChange = (value: string) => {
    setSelectedRange(value);
    setSelectedBeat('');
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6 max-w-[1400px] mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Dashboard</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchDashboardData} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitor elephant activities and observations</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchDashboardData} 
          className="gap-2"
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh Data
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Observations</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Total number of elephant observations recorded</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis?.total_observations || 0}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {kpis?.today_observations || 0} today
                  </Badge>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Direct Sightings</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Number of direct elephant sightings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis?.direct_sightings || 0}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {kpis?.today_direct_sightings || 0} today
                  </Badge>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Indirect Signs</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Number of indirect elephant signs observed</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis?.indirect_sightings || 0}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {kpis?.today_indirect_sightings || 0} today
                  </Badge>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Loss</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Total number of loss reports due to elephant activity</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis?.total_loss || 0}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {kpis?.today_loss || 0} today
                  </Badge>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Monthly Activity Trends</CardTitle>
                <CardDescription>Track elephant activity patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-muted-foreground text-xs" />
                      <YAxis className="text-muted-foreground text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: 'var(--radius)'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="total_observations" 
                        stroke="hsl(var(--primary))" 
                        name="Total Observations"
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="direct_sightings" 
                        stroke="hsl(var(--secondary))" 
                        name="Direct Sightings"
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="indirect_sightings" 
                        stroke="hsl(var(--accent))" 
                        name="Indirect Signs"
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="loss_reports" 
                        stroke="hsl(var(--destructive))" 
                        name="Loss Reports"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Division-wise Sightings</CardTitle>
                <CardDescription>Distribution of elephant activities across divisions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={divisionStats}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="associated_division" 
                        className="text-muted-foreground text-xs"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis className="text-muted-foreground text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: 'var(--radius)'
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="direct_sightings" 
                        name="Direct Sightings" 
                        fill={COLORS[0]}
                        stackId="stack"
                      />
                      <Bar 
                        dataKey="indirect_sightings" 
                        name="Indirect Signs" 
                        fill={COLORS[1]}
                        stackId="stack"
                      />
                      <Bar 
                        dataKey="loss_reports" 
                        name="Loss Reports" 
                        fill={COLORS[2]}
                        stackId="stack"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Activity Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Today's Observations</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis?.today_observations || 0}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {new Date().toLocaleDateString()}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Direct Sightings Today</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis?.today_direct_sightings || 0}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {((kpis?.today_direct_sightings || 0) / (kpis?.today_observations || 1) * 100).toFixed(0)}% of total
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Indirect Signs Today</CardTitle>
                <Footprints className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis?.today_indirect_sightings || 0}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {((kpis?.today_indirect_sightings || 0) / (kpis?.today_observations || 1) * 100).toFixed(0)}% of total
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Loss Reports Today</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpis?.today_loss || 0}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {((kpis?.today_loss || 0) / (kpis?.today_observations || 1) * 100).toFixed(0)}% of total
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Observations Table */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Recent Observations</CardTitle>
                <CardDescription>
                  Showing last {recentObservations.length} observations across all divisions
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchDashboardData} 
                className="gap-2"
                disabled={refreshing}
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-muted-foreground font-medium">Location</th>
                      <th className="text-left p-3 text-muted-foreground font-medium">Date</th>
                      <th className="text-left p-3 text-muted-foreground font-medium">Type</th>
                      <th className="text-right p-3 text-muted-foreground font-medium">Elephants</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentObservations.map((observation, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-3">
                          <div className="font-medium">{observation.associated_division}</div>
                          <div className="text-sm text-muted-foreground">
                            {observation.associated_range} › {observation.associated_beat}
                          </div>
                        </td>
                        <td className="p-3">
                          {new Date(observation.activity_date).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <Badge 
                            variant={
                              observation.observation_type === 'Direct Sighting' ? 'default' :
                              observation.observation_type === 'Indirect Signs' ? 'secondary' :
                              'destructive'
                            }
                          >
                            {observation.observation_type}
                          </Badge>
                        </td>
                        <td className="p-3 text-right font-medium">
                          {observation.total_elephants || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Area Selection</CardTitle>
              <CardDescription>Select a division, range, or beat to view on the map</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Division</label>
                  <Select
                    value={selectedDivision}
                    onValueChange={handleDivisionChange}
                    disabled={mapLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Division" />
                    </SelectTrigger>
                    <SelectContent>
                      {divisions.map((division) => (
                        <SelectItem key={division.id} value={division.id}>
                          {division.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Range</label>
                  <Select
                    value={selectedRange}
                    onValueChange={handleRangeChange}
                    disabled={!selectedDivision || mapLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Range" />
                    </SelectTrigger>
                    <SelectContent>
                      {ranges.map((range) => (
                        <SelectItem key={range.new_id} value={range.new_id}>
                          {range.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Beat</label>
                  <Select
                    value={selectedBeat}
                    onValueChange={setSelectedBeat}
                    disabled={!selectedRange || mapLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Beat" />
                    </SelectTrigger>
                    <SelectContent>
                      {beats.map((beat) => (
                        <SelectItem key={beat.new_id} value={beat.new_id}>
                          {beat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Filtered KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Observations</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{filteredStats?.total_observations || 0}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {filteredStats?.today_observations || 0} today
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Direct Sightings</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{filteredStats?.direct_sightings || 0}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {filteredStats?.today_direct_sightings || 0} today
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Indirect Signs</CardTitle>
                    <Footprints className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{filteredStats?.indirect_sightings || 0}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {filteredStats?.today_indirect_sightings || 0} today
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Loss Reports</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{filteredStats?.total_loss || 0}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {filteredStats?.today_loss || 0} today
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="h-[600px] w-full rounded-lg border">
                <BeatMap
                  selectedBeat={selectedBeat}
                  selectedRange={selectedRange}
                  selectedDivision={selectedDivision}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 