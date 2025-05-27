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
    divisionStats: [],
    rangeStats: [],
    beatStats: [],
    heatmap: [],
    observationTypes: []
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
          new_id,
          name,
          new_division_id
        `)
        .eq('new_division_id', filters.division)
        .order('name');
      
      if (error) {
        console.error('Error fetching ranges:', error);
        return;
      }
      // Map to FilterOption
      const mappedRanges = (data || []).map((range: any) => ({ id: range.new_id, name: range.name }));
      setRanges(mappedRanges);
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
          new_id,
          name,
          new_range_id,
          new_division_id
        `)
        .eq('new_range_id', filters.range)
        .eq('new_division_id', filters.division)
        .order('name');
      
      if (error) {
        console.error('Error fetching beats:', error);
        return;
      }
      // Map to FilterOption
      const mappedBeats = (data || []).map((beat: any) => ({ id: beat.new_id, name: beat.name }));
      setBeats(mappedBeats);
      setLoading(false);
    }
    
    fetchBeats();
  }, [filters.range, filters.division]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch KPI summary
      const { data: kpiSummary, error: kpiError } = await supabase
        .from('v_dashboard_kpi_summary')
        .select('*')
        .single();

      if (kpiError) throw kpiError;

      // Fetch division stats
      const { data: divisionStats, error: divisionError } = await supabase
        .from('v_dashboard_division_stats')
        .select('*');

      if (divisionError) throw divisionError;

      // Fetch range stats
      const { data: rangeStats, error: rangeError } = await supabase
        .from('v_dashboard_range_stats')
        .select('*');

      if (rangeError) throw rangeError;

      // Fetch beat stats
      const { data: beatStats, error: beatError } = await supabase
        .from('v_dashboard_beat_stats')
        .select('*');

      if (beatError) throw beatError;

      // Fetch observations by type
      const { data: observationTypes, error: observationTypesError } = await supabase
        .from('v_dashboard_observations_by_type')
        .select('*');

      if (observationTypesError) throw observationTypesError;

      // Fetch loss data
      const { data: lossData, error: lossError } = await supabase
        .from('v_elephant_activity_observations_by_type')
        .select('*');

      if (lossError) throw lossError;

      const total_loss_reports = lossData?.reduce((sum, item) => sum + (item.count || 0), 0) || 0;

      // Update kpiSummary
      const updatedKpiSummary = {
        ...kpiSummary,
        total_loss_reports,
        loss_types: lossData || []
      };

      const newData: DashboardData = {
        kpiSummary: updatedKpiSummary,
        divisionStats: divisionStats || [],
        rangeStats: rangeStats || [],
        beatStats: beatStats || [],
        heatmap: [],
        observationTypes: observationTypes || []
      };
      
      setData(newData);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilterChange = (key: keyof DashboardFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchData();
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Elephant Watch Dashboard</h1>
          <p className="text-gray-500 mt-2 text-lg">Monitor and analyze elephant activities across divisions</p>
        </div>
        <div className="flex items-center gap-4 mt-6 md:mt-0">
          <Select
            value={filters.timeRange}
            onValueChange={(value) => handleFilterChange('timeRange', value)}
          >
            <SelectTrigger className="w-[180px] shadow-md rounded-lg">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent className="z-[100]">
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
            className="h-12 w-12 bg-white shadow-md hover:bg-blue-50 border-blue-200"
          >
            <RefreshCw className={`h-5 w-5 text-blue-600 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        <Card className="bg-gradient-to-br from-blue-100 to-blue-50 shadow-lg rounded-2xl hover:scale-105 hover:shadow-xl transition-transform">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-blue-700">Total Activities</CardTitle>
            <div className="bg-blue-200 p-2 rounded-full">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-blue-900">{data.kpiSummary?.total_activities || 0}</div>
            <p className="text-xs text-blue-600 mt-1">Across all divisions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-100 to-green-50 shadow-lg rounded-2xl hover:scale-105 hover:shadow-xl transition-transform">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-green-700">Active Users</CardTitle>
            <div className="bg-green-200 p-2 rounded-full">
              <Users className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-green-900">{data.kpiSummary?.total_users || 0}</div>
            <p className="text-xs text-green-600 mt-1">Total registered users</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-100 to-red-50 shadow-lg rounded-2xl hover:scale-105 hover:shadow-xl transition-transform">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-red-700">Total Loss</CardTitle>
            <div className="bg-red-200 p-2 rounded-full">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-red-900">{data.kpiSummary?.total_loss_reports || 0}</div>
            <p className="text-xs text-red-600 mt-1">Total loss reports</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-100 to-purple-50 shadow-lg rounded-2xl hover:scale-105 hover:shadow-xl transition-transform">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-purple-700">Today's Activities</CardTitle>
            <div className="bg-purple-200 p-2 rounded-full">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-purple-900">{data.kpiSummary?.today_activities || 0}</div>
            <p className="text-xs text-purple-600 mt-1">Activities in last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Map View & Filters */}
      <Card className="mb-10 bg-white shadow-lg rounded-2xl border-2 border-blue-100">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-blue-900 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-blue-500" /> Geographic Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Area Filters (moved here) */}
          <div className="mb-8 p-4 bg-blue-50 rounded-xl shadow-inner relative z-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Division Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-blue-700 flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-400" /> Division</label>
                <Select
                  value={filters.division || ''}
                  onValueChange={value => {
                    setFilters(f => ({ ...f, division: value, range: undefined, beat: undefined }));
                  }}
                >
                  <SelectTrigger className="w-full bg-white border-blue-200 shadow-sm rounded-lg">
                    <SelectValue placeholder="Select Division" />
                  </SelectTrigger>
                  <SelectContent className="z-[100]">
                    {divisions.map((division) => (
                      <SelectItem key={division.id} value={division.id}>{division.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Range Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-blue-700 flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-400" /> Range</label>
                <Select
                  value={filters.range || ''}
                  onValueChange={value => {
                    setFilters(f => ({ ...f, range: value, beat: undefined }));
                  }}
                  disabled={!filters.division}
                >
                  <SelectTrigger className="w-full bg-white border-blue-200 shadow-sm rounded-lg">
                    <SelectValue placeholder="Select Range" />
                  </SelectTrigger>
                  <SelectContent className="z-[100]">
                    {ranges.map((range) => (
                      <SelectItem key={range.id} value={range.id}>{range.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Beat Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-blue-700 flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-400" /> Beat</label>
                <Select
                  value={filters.beat || ''}
                  onValueChange={value => {
                    setFilters(f => ({ ...f, beat: value }));
                  }}
                  disabled={!filters.range}
                >
                  <SelectTrigger className="w-full bg-white border-blue-200 shadow-sm rounded-lg">
                    <SelectValue placeholder="Select Beat" />
                  </SelectTrigger>
                  <SelectContent className="z-[100]">
                    {beats.map((beat) => (
                      <SelectItem key={beat.id} value={beat.id}>{beat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="h-[500px] w-full rounded-xl overflow-hidden border-2 border-blue-200 shadow-lg">
            <BeatMap
              selectedBeat={filters.beat}
              selectedRange={filters.range}
              selectedDivision={filters.division}
            />
          </div>
          {/* Map Legend */}
          <div className="mt-6 flex items-center space-x-6 text-sm text-gray-700">
            <div className="flex items-center">
              <span className="inline-block w-4 h-4 bg-[#2563eb] bg-opacity-10 border border-[#2563eb] rounded mr-2"></span>
              <span className="font-semibold">Division</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-4 h-4 bg-[#f59e42] bg-opacity-20 border border-[#f59e42] rounded mr-2"></span>
              <span className="font-semibold">Range</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-4 h-4 bg-[#dc2626] bg-opacity-30 border border-[#dc2626] rounded mr-2"></span>
              <span className="font-semibold">Beat</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="bg-white p-2 rounded-xl shadow-md flex gap-4">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 font-semibold px-6 py-2 rounded-lg transition">Overview</TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 font-semibold px-6 py-2 rounded-lg transition">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Observations by Type */}
            <Card className="bg-white shadow-md rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-blue-900">Observations by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.observationTypes} barCategoryGap={24}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                      <XAxis dataKey="observation_type" className="text-sm" />
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
                      <Bar dataKey="count" fill="#4f46e5" radius={[8, 8, 0, 0]} isAnimationActive />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Most Active Areas */}
            <Card className="bg-white shadow-md rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-blue-900">Most Active Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-blue-700">Most Active Division</p>
                      <p className="text-2xl font-extrabold text-blue-900 mt-1">
                        {data.divisionStats?.[0]?.division_name || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-700">Observations</p>
                      <p className="text-2xl font-extrabold text-blue-900 mt-1">
                        {data.divisionStats?.[0]?.total_observations || 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-blue-700">Most Active Range</p>
                      <p className="text-2xl font-extrabold text-blue-900 mt-1">
                        {data.rangeStats?.[0]?.range_name || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-700">Observations</p>
                      <p className="text-2xl font-extrabold text-blue-900 mt-1">
                        {data.rangeStats?.[0]?.total_observations || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Loss Reports Summary */}
          <Card className="bg-white shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-red-700">Loss Reports Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.divisionStats} barCategoryGap={24}>
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
                    <Bar dataKey="loss_reports" fill="#ef4444" radius={[8, 8, 0, 0]} isAnimationActive />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-8">
          {/* Activity by Division */}
          <Card className="bg-white shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-blue-900">Activity by Division</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.divisionStats} barCategoryGap={24}>
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
                    <Bar dataKey="total_observations" fill="#4f46e5" radius={[8, 8, 0, 0]} isAnimationActive />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Activity by Range (moved from Geography tab) */}
          <Card className="bg-white shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-blue-900">Activity by Range</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.rangeStats} barCategoryGap={24}>
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
                    <Bar dataKey="total_observations" fill="#4f46e5" radius={[8, 8, 0, 0]} isAnimationActive />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Loss Type Bar Chart */}
          <Card className="bg-white shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-red-700">Loss Reports by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.kpiSummary?.loss_types || []} barCategoryGap={24}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                    <XAxis dataKey="type" className="text-sm" />
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
                    <Bar dataKey="count" fill="#ef4444" radius={[8, 8, 0, 0]} isAnimationActive />
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