import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BeatMap } from './BeatMap';
import { RefreshCw, AlertCircle, MapPin, Activity, Calendar, Eye, Footprints, AlertTriangle } from 'lucide-react';
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface FilterOption {
  id: string;
  name: string;
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

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
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
  }, []);

  // Fetch ranges when division is selected
  useEffect(() => {
    async function fetchRanges() {
      if (!selectedDivision) {
        setRanges([]);
        return;
      }
      try {
        setMapLoading(true);
      const { data, error } = await supabase
        .from('ranges')
<<<<<<< HEAD
          .select('id, name')
          .eq('division_id', selectedDivision)
=======
        .select(`
          id,
          name,
          associated_division_id
        `)
        .eq('associated_division_id', filters.division)
>>>>>>> 2f6bd8fcab214df0f722880eaa8ca399a693b837
        .order('name');
      
        if (error) throw error;
        setRanges(data || []);
      } catch (err) {
        console.error('Error fetching ranges:', err);
      } finally {
        setMapLoading(false);
      }
    }
    fetchRanges();
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
      const { data, error } = await supabase
        .from('beats')
<<<<<<< HEAD
          .select('id, name')
          .eq('range_id', selectedRange)
=======
        .select(`
          id,
          name,
          associated_range_id,
          associated_division_id
        `)
        .eq('associated_range_id', filters.range)
        .eq('associated_division_id', filters.division)
>>>>>>> 2f6bd8fcab214df0f722880eaa8ca399a693b837
        .order('name');
      
        if (error) throw error;
        setBeats(data || []);
      } catch (err) {
        console.error('Error fetching beats:', err);
      } finally {
        setMapLoading(false);
      }
    }
    fetchBeats();
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
    return <div className="flex justify-center items-center min-h-[400px]">Loading dashboard data...</div>;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px] text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
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
                <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
                <div className="text-2xl font-bold">{kpis?.total_observations || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {kpis?.today_observations || 0} today
                </p>
          </CardContent>
        </Card>

            <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Direct Sightings</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
                <div className="text-2xl font-bold">{kpis?.direct_sightings || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {kpis?.today_direct_sightings || 0} today
                </p>
          </CardContent>
        </Card>

            <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Indirect Sightings</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
                <div className="text-2xl font-bold">{kpis?.indirect_sightings || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {kpis?.today_indirect_sightings || 0} today
                </p>
          </CardContent>
        </Card>

            <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Loss</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
                <div className="text-2xl font-bold">{kpis?.total_loss || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {kpis?.today_loss || 0} today
                </p>
          </CardContent>
        </Card>
      </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Monthly Activity Trends</CardTitle>
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
                        name="Indirect Sightings"
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
                        name="Indirect Sightings" 
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
                <p className="text-sm text-muted-foreground mt-1">
                  Showing last {recentObservations.length} observations across all divisions
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={fetchDashboardData} className="gap-2">
                <RefreshCw className="h-4 w-4" />
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
                      <tr key={index} className="border-b hover:bg-muted/50">
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
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Division</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={selectedDivision}
                    onChange={(e) => handleDivisionChange(e.target.value)}
                    disabled={mapLoading}
                  >
                    <option value="">Select Division</option>
                    {divisions.map((division) => (
                      <option key={division.id} value={division.id}>
                        {division.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Range</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={selectedRange}
                    onChange={(e) => handleRangeChange(e.target.value)}
                    disabled={!selectedDivision || mapLoading}
                  >
                    <option value="">Select Range</option>
                    {ranges.map((range) => (
                      <option key={range.id} value={range.id}>
                        {range.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Beat</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={selectedBeat}
                    onChange={(e) => setSelectedBeat(e.target.value)}
                    disabled={!selectedRange || mapLoading}
                  >
                    <option value="">Select Beat</option>
                    {beats.map((beat) => (
                      <option key={beat.id} value={beat.id}>
                        {beat.name}
                      </option>
                    ))}
                  </select>
                </div>
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