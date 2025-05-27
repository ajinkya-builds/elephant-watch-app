import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/lib/supabaseClient';
import { BeatMap } from './BeatMap';
import { DashboardData } from '@/types/dashboard';
import { RefreshCw, AlertCircle, Users, Calendar, MapPin, Activity } from 'lucide-react';
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

interface DashboardFilters {
  division?: string;
  range?: string;
  beat?: string;
  startDate?: string;
  endDate?: string;
  timeRange?: string;
}

interface FilterOption {
  id: string;
  name: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const EnhancedDashboard: React.FC = () => {
  const [filters, setFilters] = useState<DashboardFilters>({
    timeRange: '7d'
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [divisions, setDivisions] = useState<FilterOption[]>([]);
  const [ranges, setRanges] = useState<FilterOption[]>([]);
  const [beats, setBeats] = useState<FilterOption[]>([]);
  const [data, setData] = useState<DashboardData>({
    kpiSummary: {
      total_activities: 0,
      total_users: 0,
      total_days: 0,
      total_elephants_sighted: 0,
      today_activities: 0,
      today_active_users: 0,
      weekly_activities: 0,
      weekly_active_users: 0,
      total_divisions: 0,
      total_ranges: 0,
      total_beats: 0
    },
    divisionStats: [],
    rangeStats: [],
    beatStats: [],
    heatmap: []
  });
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);

  // Fetch all divisions
  useEffect(() => {
    async function fetchDivisions() {
      setLoading(true);
      const { data, error } = await supabase
        .from('divisions')
        .select('id, name')
        .order('name');
      
      if (error) {
        console.error('Error fetching divisions:', error);
        return;
      }
      
      setDivisions(data || []);
      setLoading(false);
    }
    
    fetchDivisions();
  }, []);

  // Fetch ranges for selected division
  useEffect(() => {
    async function fetchRanges() {
      if (!filters.division) {
        setRanges([]);
        setBeats([]);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('ranges')
        .select(`
          id,
          name,
          associated_division_id
        `)
        .eq('associated_division_id', filters.division)
        .order('name');
      
      if (error) {
        console.error('Error fetching ranges:', error);
        return;
      }
      
      setRanges(data || []);
      setBeats([]);
      setLoading(false);
    }
    
    fetchRanges();
  }, [filters.division]);

  // Fetch beats for selected range
  useEffect(() => {
    async function fetchBeats() {
      if (!filters.range || !filters.division) {
        setBeats([]);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('beats')
        .select(`
          id,
          name,
          associated_range_id,
          associated_division_id
        `)
        .eq('associated_range_id', filters.range)
        .eq('associated_division_id', filters.division)
        .order('name');
      
      if (error) {
        console.error('Error fetching beats:', error);
        return;
      }
      
      setBeats(data || []);
      setLoading(false);
    }
    
    fetchBeats();
  }, [filters.range, filters.division]);

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching dashboard data...');
      
      // Fetch KPI summary
      const { data: kpiSummary, error: kpiError } = await supabase
        .from('v_dashboard_kpi_summary')
        .select('*')
        .single();

      if (kpiError) {
        console.error('Error fetching KPI summary:', kpiError);
        throw kpiError;
      }

      // Fetch division statistics
      const { data: divisionStats, error: divisionError } = await supabase
        .from('v_division_statistics')
        .select('*');

      if (divisionError) {
        console.error('Error fetching division stats:', divisionError);
        throw divisionError;
      }

      // Fetch range statistics
      const { data: rangeStats, error: rangeError } = await supabase
        .from('v_range_statistics')
        .select('*');

      if (rangeError) {
        console.error('Error fetching range stats:', rangeError);
        throw rangeError;
      }

      // Fetch beat statistics
      const { data: beatStats, error: beatError } = await supabase
        .from('v_beat_statistics')
        .select('*');

      if (beatError) {
        console.error('Error fetching beat stats:', beatError);
        throw beatError;
      }

      // Fetch activity heatmap
      const { data: heatmap, error: heatmapError } = await supabase
        .from('v_activity_heatmap')
        .select('*');

      if (heatmapError) {
        console.error('Error fetching heatmap:', heatmapError);
        throw heatmapError;
      }

      // Process the data
      const newData = {
        kpiSummary: kpiSummary || {
          total_activities: 0,
          total_users: 0,
          total_days: 0,
          total_elephants_sighted: 0,
          today_activities: 0,
          today_active_users: 0,
          weekly_activities: 0,
          weekly_active_users: 0,
          total_divisions: 0,
          total_ranges: 0,
          total_beats: 0
        },
        divisionStats: divisionStats || [],
        rangeStats: rangeStats || [],
        beatStats: beatStats || [],
        heatmap: heatmap || []
      };
      
      // Check if we have any real data
      const hasRealData = (
        newData.kpiSummary.total_activities > 0 ||
        newData.divisionStats.length > 0 ||
        newData.rangeStats.length > 0 ||
        newData.beatStats.length > 0 ||
        newData.heatmap.length > 0
      );
      
      setHasData(hasRealData);
      setData(newData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch dashboard data');
      setHasData(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof DashboardFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchDashboardData();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
  return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-500">Error: {error}</p>
          <Button onClick={handleRefresh} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Always render the dashboard UI, even if there is no data
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Elephant Watch Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and analyze elephant activities across divisions</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Select
            value={filters.timeRange}
            onValueChange={(value) => handleFilterChange('timeRange', value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-10 w-10"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Activities</CardTitle>
            <Activity className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{data.kpiSummary.total_activities || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Across all divisions</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{data.kpiSummary.total_users || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Total registered users</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Elephants Sighted</CardTitle>
            <MapPin className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{data.kpiSummary.total_elephants_sighted || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Total sightings recorded</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Today's Activities</CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{data.kpiSummary.today_activities || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Activities in last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Map View */}
      <Card className="mb-8 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Geographic Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] w-full rounded-lg overflow-hidden">
            <BeatMap
              selectedBeat={filters.beat}
              selectedRange={filters.range}
              selectedDivision={filters.division}
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white p-1 rounded-lg shadow-sm">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gray-100">Overview</TabsTrigger>
          <TabsTrigger value="population" className="data-[state=active]:bg-gray-100">Population</TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-gray-100">Activity</TabsTrigger>
          <TabsTrigger value="geography" className="data-[state=active]:bg-gray-100">Geography</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Observations by Type */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Observations by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.divisionStats}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                      <XAxis dataKey="division_name" className="text-sm" />
                      <YAxis className="text-sm" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                    <Legend />
                      <Bar dataKey="total_observations" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Most Active Areas */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Most Active Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Most Active Division</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                  {data.divisionStats?.[0]?.division_name || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Observations</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {data.divisionStats?.[0]?.total_observations || 0}
                      </p>
                </div>
                </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Most Active Range</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                  {data.rangeStats?.[0]?.range_name || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Observations</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {data.rangeStats?.[0]?.total_observations || 0}
                      </p>
                    </div>
                </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Loss Reports Summary */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Loss Reports Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.divisionStats}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                    <XAxis dataKey="division_name" className="text-sm" />
                    <YAxis className="text-sm" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="total_observations" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="population" className="space-y-6">
          {/* Population Distribution */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Population Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Total Elephants', value: data.divisionStats?.[0]?.total_elephants || 0 }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell key={`cell-0`} fill={COLORS[0]} />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Activity by Season */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Activity by Season</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.divisionStats}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                    <XAxis dataKey="division_name" className="text-sm" />
                    <YAxis className="text-sm" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="total_observations" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Activity by Land Type */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Activity by Land Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.divisionStats}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                    <XAxis dataKey="division_name" className="text-sm" />
                    <YAxis className="text-sm" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="total_observations" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography" className="space-y-6">
          {/* Activity by Range */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Activity by Range</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.rangeStats}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                    <XAxis dataKey="range_name" className="text-sm" />
                    <YAxis className="text-sm" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="total_observations" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 